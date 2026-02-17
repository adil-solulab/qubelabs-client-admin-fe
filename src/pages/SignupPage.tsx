import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, UserPlus, ArrowRight, ArrowLeft, Check, Building2, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type Step = 1 | 2 | 3;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | undefined;
  companyName: string;
  jobTitle: string;
  companySize: string;
  industry: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  agreeMarketing: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  companySize?: string;
  industry?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1,000 employees' },
  { value: '1001-5000', label: '1,001-5,000 employees' },
  { value: '5001+', label: '5,001+ employees' },
];

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'telecom', label: 'Telecommunications' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'education', label: 'Education' },
  { value: 'travel', label: 'Travel & Hospitality' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'government', label: 'Government' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'logistics', label: 'Logistics & Supply Chain' },
  { value: 'other', label: 'Other' },
];

const STEP_CONFIG = [
  { step: 1 as Step, label: 'Personal Info', icon: User },
  { step: 2 as Step, label: 'Company Details', icon: Building2 },
  { step: 3 as Step, label: 'Create Account', icon: Lock },
];

const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
  { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function SignupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [detectedCountry, setDetectedCountry] = useState<Country>('US');

  useEffect(() => {
    try {
      const locale = navigator.language || navigator.languages?.[0] || 'en-US';
      const parts = locale.split('-');
      const countryCode = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
      if (countryCode && countryCode.length === 2) {
        setDetectedCountry(countryCode as Country);
      }
    } catch {
      // fallback to US
    }

    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data?.country_code && data.country_code.length === 2) {
          setDetectedCountry(data.country_code as Country);
        }
      })
      .catch(() => {});
  }, []);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: undefined,
    companyName: '',
    jobTitle: '',
    companySize: '',
    industry: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreeMarketing: false,
  });

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !isValidPhoneNumber(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Please select your company size';
    }

    if (!formData.industry) {
      newErrors.industry = 'Please select your industry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const failedRules = PASSWORD_RULES.filter(r => !r.test(formData.password));
      if (failedRules.length > 0) {
        newErrors.password = 'Password does not meet all requirements';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep3()) return;

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Account created successfully!',
        description: 'Welcome to ConX. Redirecting you to sign in...',
      });

      setTimeout(() => navigate('/login'), 1500);
    } catch {
      toast({
        title: 'Registration Failed',
        description: 'Unable to create your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = PASSWORD_RULES.filter(r => r.test(formData.password)).length;
  const strengthPercent = (passwordStrength / PASSWORD_RULES.length) * 100;
  const strengthColor = strengthPercent <= 20 ? 'bg-destructive' : strengthPercent <= 60 ? 'bg-amber-500' : 'bg-success';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />

      <Card className="w-full max-w-lg relative z-10 border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <img src="/conx-logomark.png" alt="ConX" className="w-14 h-14 object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
          <CardDescription>
            Get started with ConX in minutes
          </CardDescription>

          <div className="flex items-center justify-center gap-2 pt-4">
            {STEP_CONFIG.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === s.step;
              const isComplete = step > s.step;
              return (
                <div key={s.step} className="flex items-center">
                  {i > 0 && (
                    <div className={cn('w-8 h-0.5 mx-1', isComplete ? 'bg-primary' : 'bg-border')} />
                  )}
                  <div className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                    isActive && 'bg-primary text-primary-foreground',
                    isComplete && 'bg-primary/10 text-primary',
                    !isActive && !isComplete && 'bg-muted text-muted-foreground'
                  )}>
                    {isComplete ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className={cn('h-11', errors.firstName && 'border-destructive focus-visible:ring-destructive')}
                      autoComplete="given-name"
                    />
                    {errors.firstName && (
                      <p className="text-xs text-destructive">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      placeholder="Anderson"
                      value={formData.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className={cn('h-11', errors.lastName && 'border-destructive focus-visible:ring-destructive')}
                      autoComplete="family-name"
                    />
                    {errors.lastName && (
                      <p className="text-xs text-destructive">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Work email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={cn('h-11', errors.email && 'border-destructive focus-visible:ring-destructive')}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone number <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <PhoneInput
                    international
                    countryCallingCodeEditable={false}
                    defaultCountry={detectedCountry}
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, phone: value }));
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                    }}
                    className={cn(
                      'phone-input-wrapper h-11 rounded-md border bg-background px-3 text-sm',
                      errors.phone ? 'border-destructive' : 'border-input'
                    )}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full h-11 text-base font-medium mt-2"
                  onClick={handleNext}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corp"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className={cn('h-11', errors.companyName && 'border-destructive focus-visible:ring-destructive')}
                    autoComplete="organization"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-destructive">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm font-medium">
                    Job title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="jobTitle"
                    placeholder="Head of Customer Experience"
                    value={formData.jobTitle}
                    onChange={(e) => updateField('jobTitle', e.target.value)}
                    className={cn('h-11', errors.jobTitle && 'border-destructive focus-visible:ring-destructive')}
                    autoComplete="organization-title"
                  />
                  {errors.jobTitle && (
                    <p className="text-xs text-destructive">{errors.jobTitle}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Company size <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={(value) => updateField('companySize', value)}
                  >
                    <SelectTrigger className={cn('h-11', errors.companySize && 'border-destructive focus-visible:ring-destructive')}>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.companySize && (
                    <p className="text-xs text-destructive">{errors.companySize}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Industry <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => updateField('industry', value)}
                  >
                    <SelectTrigger className={cn('h-11', errors.industry && 'border-destructive focus-visible:ring-destructive')}>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(ind => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-xs text-destructive">{errors.industry}</p>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11"
                    onClick={handleNext}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => updateField('password', e.target.value)}
                      className={cn('h-11 pr-11', errors.password && 'border-destructive focus-visible:ring-destructive')}
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {formData.password && (
                    <div className="space-y-2 mt-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-1.5 flex-1 rounded-full transition-colors',
                              i < passwordStrength ? strengthColor : 'bg-muted'
                            )}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {PASSWORD_RULES.map((rule) => (
                          <div key={rule.label} className="flex items-center gap-1.5">
                            <div className={cn(
                              'w-3 h-3 rounded-full flex items-center justify-center',
                              rule.test(formData.password)
                                ? 'bg-success text-success-foreground'
                                : 'bg-muted'
                            )}>
                              {rule.test(formData.password) && (
                                <Check className="w-2 h-2" />
                              )}
                            </div>
                            <span className={cn(
                              'text-[11px]',
                              rule.test(formData.password) ? 'text-success' : 'text-muted-foreground'
                            )}>
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField('confirmPassword', e.target.value)}
                      className={cn('h-11 pr-11', errors.confirmPassword && 'border-destructive focus-visible:ring-destructive')}
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agreeTerms"
                      checked={formData.agreeTerms}
                      onCheckedChange={(checked) => updateField('agreeTerms', checked as boolean)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="agreeTerms"
                      className={cn(
                        'text-sm font-normal leading-snug cursor-pointer',
                        errors.agreeTerms ? 'text-destructive' : 'text-muted-foreground'
                      )}
                    >
                      I agree to the{' '}
                      <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>
                      {' '}and{' '}
                      <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
                      {' '}<span className="text-destructive">*</span>
                    </Label>
                  </div>
                  {errors.agreeTerms && (
                    <p className="text-xs text-destructive pl-6">{errors.agreeTerms}</p>
                  )}

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agreeMarketing"
                      checked={formData.agreeMarketing}
                      onCheckedChange={(checked) => updateField('agreeMarketing', checked as boolean)}
                      disabled={isLoading}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="agreeMarketing"
                      className="text-sm font-normal text-muted-foreground leading-snug cursor-pointer"
                    >
                      Send me product updates, tips, and occasional promotional content
                    </Label>
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleBack}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 text-base font-medium"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
        <p>&copy; 2025 ConX. All rights reserved.</p>
      </div>
    </div>
  );
}
