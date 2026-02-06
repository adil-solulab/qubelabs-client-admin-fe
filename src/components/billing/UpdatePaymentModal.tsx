import { useState, useMemo } from 'react';
import { CreditCard, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface UpdatePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    name: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

interface FieldErrors {
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvc?: string;
  name?: string;
}

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

function getCardType(cardNumber: string): string {
  const digits = cardNumber.replace(/\D/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  return '';
}

export function UpdatePaymentModal({
  open,
  onOpenChange,
  onSubmit,
}: UpdatePaymentModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const formatCardNumber = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    const parts = [];

    for (let i = 0, len = digitsOnly.length; i < len && i < 16; i += 4) {
      parts.push(digitsOnly.substring(i, i + 4));
    }

    return parts.join(' ');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const fieldErrors = useMemo<FieldErrors>(() => {
    const errors: FieldErrors = {};
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    
    if (touched.cardNumber) {
      if (!rawCardNumber) {
        errors.cardNumber = 'Card number is required';
      } else if (rawCardNumber.length < 13) {
        errors.cardNumber = 'Card number is too short';
      } else if (rawCardNumber.length > 19) {
        errors.cardNumber = 'Card number is too long';
      } else if (!luhnCheck(rawCardNumber)) {
        errors.cardNumber = 'Invalid card number';
      }
    }
    
    if (touched.expiryMonth) {
      if (!expiryMonth) {
        errors.expiryMonth = 'Required';
      } else {
        const month = parseInt(expiryMonth, 10);
        if (isNaN(month) || month < 1 || month > 12) {
          errors.expiryMonth = 'Invalid (01-12)';
        }
      }
    }
    
    if (touched.expiryYear) {
      if (!expiryYear) {
        errors.expiryYear = 'Required';
      } else {
        const year = parseInt(expiryYear, 10);
        const currentYear = new Date().getFullYear() % 100;
        if (isNaN(year)) {
          errors.expiryYear = 'Invalid year';
        } else if (year < currentYear) {
          errors.expiryYear = 'Card expired';
        } else if (year > currentYear + 20) {
          errors.expiryYear = 'Invalid year';
        }
      }
    }
    
    if (touched.expiryMonth && touched.expiryYear && !errors.expiryMonth && !errors.expiryYear) {
      const month = parseInt(expiryMonth, 10);
      const year = parseInt(expiryYear, 10) + 2000;
      const now = new Date();
      const expiry = new Date(year, month, 0);
      if (expiry < now) {
        errors.expiryMonth = 'Card expired';
        errors.expiryYear = 'Card expired';
      }
    }
    
    if (touched.cvc) {
      const cardType = getCardType(cardNumber);
      const requiredLength = cardType === 'Amex' ? 4 : 3;
      if (!cvc) {
        errors.cvc = 'Required';
      } else if (cvc.length < requiredLength) {
        errors.cvc = `Must be ${requiredLength} digits`;
      }
    }
    
    if (touched.name) {
      if (!name.trim()) {
        errors.name = 'Cardholder name is required';
      } else if (name.trim().length < 2) {
        errors.name = 'Name is too short';
      } else if (!/^[a-zA-Z\s\-'.]+$/.test(name.trim())) {
        errors.name = 'Name contains invalid characters';
      }
    }
    
    return errors;
  }, [cardNumber, expiryMonth, expiryYear, cvc, name, touched]);

  const validateAll = (): boolean => {
    const allTouched = {
      cardNumber: true,
      expiryMonth: true,
      expiryYear: true,
      cvc: true,
      name: true,
    };
    setTouched(allTouched);
    
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    const month = parseInt(expiryMonth, 10);
    const year = parseInt(expiryYear, 10);
    const currentYear = new Date().getFullYear() % 100;
    const cardType = getCardType(cardNumber);
    const requiredCvcLength = cardType === 'Amex' ? 4 : 3;
    
    if (!rawCardNumber || rawCardNumber.length < 13 || !luhnCheck(rawCardNumber)) return false;
    if (!expiryMonth || isNaN(month) || month < 1 || month > 12) return false;
    if (!expiryYear || isNaN(year) || year < currentYear || year > currentYear + 20) return false;
    if (!cvc || cvc.length < requiredCvcLength) return false;
    if (!name.trim() || name.trim().length < 2) return false;
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    
    setError(null);
    setIsSubmitting(true);

    const result = await onSubmit({
      cardNumber: cardNumber.replace(/\s/g, ''),
      expiryMonth,
      expiryYear,
      cvc,
      name,
    });

    setIsSubmitting(false);

    if (result.success) {
      setCardNumber('');
      setExpiryMonth('');
      setExpiryYear('');
      setCvc('');
      setName('');
      setTouched({});
      onOpenChange(false);
    } else {
      setError(result.error || 'Payment failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setTouched({});
      onOpenChange(false);
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const cardType = getCardType(cardNumber);
  const hasErrors = Object.keys(fieldErrors).length > 0;
  
  const isFormFilled = cardNumber.replace(/\s/g, '').length >= 13 &&
    expiryMonth.length === 2 &&
    expiryYear.length === 2 &&
    cvc.length >= 3 &&
    name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle>Update Payment Method</DialogTitle>
          </div>
          <DialogDescription>
            Add a new card to use for future payments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-sm text-success">256-bit SSL encrypted & PCI compliant</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cardNumber">Card Number</Label>
              {cardType && (
                <span className="text-xs text-muted-foreground">{cardType}</span>
              )}
            </div>
            <div className="relative">
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                onBlur={() => handleBlur('cardNumber')}
                placeholder="1234 5678 9012 3456"
                className={cn(
                  'pr-10',
                  fieldErrors.cardNumber && 'border-destructive focus-visible:ring-destructive'
                )}
                data-testid="input-card-number"
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            {fieldErrors.cardNumber && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="expiryMonth">Month</Label>
              <Input
                id="expiryMonth"
                value={expiryMonth}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= 2) setExpiryMonth(v);
                }}
                onBlur={() => handleBlur('expiryMonth')}
                placeholder="MM"
                maxLength={2}
                className={cn(
                  fieldErrors.expiryMonth && 'border-destructive focus-visible:ring-destructive'
                )}
                data-testid="input-expiry-month"
              />
              {fieldErrors.expiryMonth && (
                <p className="text-xs text-destructive">{fieldErrors.expiryMonth}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryYear">Year</Label>
              <Input
                id="expiryYear"
                value={expiryYear}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '');
                  if (v.length <= 2) setExpiryYear(v);
                }}
                onBlur={() => handleBlur('expiryYear')}
                placeholder="YY"
                maxLength={2}
                className={cn(
                  fieldErrors.expiryYear && 'border-destructive focus-visible:ring-destructive'
                )}
                data-testid="input-expiry-year"
              />
              {fieldErrors.expiryYear && (
                <p className="text-xs text-destructive">{fieldErrors.expiryYear}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <div className="relative">
                <Input
                  id="cvc"
                  value={cvc}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '');
                    if (v.length <= 4) setCvc(v);
                  }}
                  onBlur={() => handleBlur('cvc')}
                  placeholder="123"
                  maxLength={4}
                  type="password"
                  className={cn(
                    fieldErrors.cvc && 'border-destructive focus-visible:ring-destructive'
                  )}
                  data-testid="input-cvc"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              </div>
              {fieldErrors.cvc && (
                <p className="text-xs text-destructive">{fieldErrors.cvc}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => handleBlur('name')}
              placeholder="John Smith"
              className={cn(
                fieldErrors.name && 'border-destructive focus-visible:ring-destructive'
              )}
              data-testid="input-cardholder-name"
            />
            {fieldErrors.name && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {fieldErrors.name}
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isFormFilled || (Object.keys(touched).length > 0 && hasErrors) || isSubmitting}
            data-testid="button-save-card"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Lock className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Processing...' : 'Save Card'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
