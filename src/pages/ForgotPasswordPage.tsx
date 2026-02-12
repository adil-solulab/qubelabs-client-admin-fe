import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate random network failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Network error');
      }

      // Success - always show success for security (don't reveal if email exists)
      setIsSubmitted(true);
      toast({
        title: 'Reset link sent',
        description: 'If an account exists with this email, you will receive a password reset link.',
      });
    } catch (error) {
      toast({
        title: 'Connection Error',
        description: 'Unable to send reset link. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="mx-auto mb-4">
            <img src="/conx-logomark.png" alt="CONX" className="w-14 h-14 object-contain" />
          </div>
          
          {isSubmitted ? (
            <>
              <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-muted-foreground">
                We've sent a password reset link to your email address
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl font-bold">Forgot password?</CardTitle>
              <CardDescription className="text-muted-foreground">
                No worries, we'll send you reset instructions
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="pt-4">
          {isSubmitted ? (
            <div className="space-y-6">
              {/* Email Sent Confirmation */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-center">
                <p className="text-sm text-muted-foreground">
                  If an account exists for <span className="font-medium text-foreground">{email}</span>, you will receive a password reset link shortly.
                </p>
              </div>

              {/* Resend Section */}
              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Didn't receive the email?{' '}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Try again
                  </button>
                </p>
              </div>

              {/* Back to Login */}
              <Link to="/login">
                <Button variant="outline" className="w-full h-11">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  className={cn(
                    'h-11 transition-colors',
                    error && 'border-destructive focus-visible:ring-destructive'
                  )}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                />
                {error && (
                  <p className="text-xs text-destructive mt-1 animate-fade-in">
                    {error}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>

              {/* Back to Login */}
              <Link to="/login" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
        <p>© 2025 CONX. All rights reserved.</p>
      </div>
    </div>
  );
}
