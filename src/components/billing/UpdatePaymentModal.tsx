import { useState } from 'react';
import { CreditCard, Lock, Loader2, ShieldCheck } from 'lucide-react';
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

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleSubmit = async () => {
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
      onOpenChange(false);
    } else {
      setError(result.error || 'Payment failed. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onOpenChange(false);
    }
  };

  const isValid = cardNumber.replace(/\s/g, '').length >= 15 &&
    expiryMonth.length === 2 &&
    expiryYear.length === 2 &&
    cvc.length >= 3 &&
    name.length > 0;

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
          {/* Security Badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-sm text-success">256-bit SSL encrypted & PCI compliant</span>
          </div>

          {/* Card Number */}
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className="pr-10"
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* Expiry & CVC */}
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
                placeholder="MM"
                maxLength={2}
              />
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
                placeholder="YY"
                maxLength={2}
              />
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
                  placeholder="123"
                  maxLength={4}
                  type="password"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Cardholder Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Smith"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isSubmitting}>
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
