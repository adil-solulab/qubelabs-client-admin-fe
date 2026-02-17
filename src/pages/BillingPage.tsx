import { useState } from 'react';
import {
  CreditCard,
  Coins,
  Phone,
  MessageSquare,
  Mail,
  Users,
  HardDrive,
  Clock,
  Download,
  Plus,
  Check,
  Trash2,
  MoreVertical,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  PhoneCall,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useBillingData } from '@/hooks/useBillingData';
import { notify } from '@/hooks/useNotification';
import { UpdatePaymentModal } from '@/components/billing/UpdatePaymentModal';
import { PLAN_CONFIG, INVOICE_STATUS_CONFIG } from '@/types/billing';
import { cn } from '@/lib/utils';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  starter: <Zap className="w-5 h-5" />,
  pro: <Sparkles className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
  custom: <PhoneCall className="w-5 h-5" />,
};

export default function BillingPage() {
  const {
    plans,
    currentPlan,
    usageMetrics,
    invoices,
    paymentMethods,
    credits,
    nextBillingDate,
    autoRenew,
    toggleAutoRenew,
    updatePaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    upgradePlan,
    downloadInvoice,
  } = useBillingData();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [contactSalesOpen, setContactSalesOpen] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [togglingAutoRenew, setTogglingAutoRenew] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [contactSubmitting, setContactSubmitting] = useState(false);

  const handleUpdatePayment = async (data: {
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    name: string;
  }) => {
    const result = await updatePaymentMethod(data);
    if (result.success) {
      notify.created('Payment method');
    } else {
      notify.error('Payment failed', result.error || 'Could not add payment method. Please try again.');
    }
    return result;
  };

  const handleSetDefault = async (methodId: string) => {
    await setDefaultPaymentMethod(methodId);
    notify.saved('Default payment method');
  };

  const handleRemoveMethod = async (methodId: string) => {
    await removePaymentMethod(methodId);
    notify.deleted('Payment method');
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    await downloadInvoice(invoiceId);
    notify.success('Download started', 'Your invoice is being downloaded.');
  };

  const handleUpgrade = async (planType: string) => {
    const plan = plans.find(p => p.type === planType);
    if (plan?.isContactSales) {
      setContactSalesOpen(true);
      return;
    }
    setUpgradingPlan(planType);
    try {
      const result = await upgradePlan(planType as any);
      if (result.success) {
        notify.success('Plan upgrade initiated', 'Your plan upgrade is being processed.');
      } else {
        notify.error('Upgrade failed', 'Could not upgrade plan. Please try again.');
      }
    } finally {
      setUpgradingPlan(null);
    }
  };

  const handleToggleAutoRenew = async () => {
    setTogglingAutoRenew(true);
    try {
      const result = await toggleAutoRenew();
      if (result.success) {
        notify.saved('Auto-renew preference');
      }
    } finally {
      setTogglingAutoRenew(false);
    }
  };

  const handleContactSalesSubmit = async () => {
    setContactSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setContactSubmitting(false);
    setContactSalesOpen(false);
    setContactForm({ name: '', email: '', company: '', message: '' });
    notify.success('Request sent', 'Our sales team will contact you within 24 hours.');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const planConfig = PLAN_CONFIG[currentPlan.type];

  const usageItems = [
    { key: 'calls', label: 'AI Calls', icon: <Phone className="w-4 h-4 text-emerald-500" />, data: usageMetrics.calls, suffix: '' },
    { key: 'chats', label: 'Chat Sessions', icon: <MessageSquare className="w-4 h-4 text-blue-500" />, data: usageMetrics.chats, suffix: '' },
    { key: 'emails', label: 'Emails', icon: <Mail className="w-4 h-4 text-amber-500" />, data: usageMetrics.emails, suffix: '' },
    { key: 'agents', label: 'AI Agents', icon: <Users className="w-4 h-4 text-purple-500" />, data: usageMetrics.agents, suffix: '' },
    { key: 'storage', label: 'Storage', icon: <HardDrive className="w-4 h-4 text-slate-500" />, data: usageMetrics.storage, suffix: ' GB' },
    { key: 'aiMinutes', label: 'AI Minutes', icon: <Clock className="w-4 h-4 text-blue-500" />, data: usageMetrics.aiMinutes, suffix: '' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your plan, usage, and payment details
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 overflow-hidden border-0 shadow-md">
            <div className={cn("bg-gradient-to-r p-6", planConfig.gradient, "from-primary/8 to-primary/3")}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={cn(planConfig.bgColor, planConfig.color, "font-semibold px-3 py-1")}>
                      {PLAN_ICONS[currentPlan.type]}
                      <span className="ml-1.5">{currentPlan.name} Plan</span>
                    </Badge>
                  </div>
                  <div className="text-3xl font-bold mt-3">
                    ${currentPlan.price}
                    <span className="text-base font-normal text-muted-foreground">/{currentPlan.interval}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Next billing on {formatDate(nextBillingDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm border">
                    <div className="text-right">
                      <p className="text-xs font-medium text-muted-foreground">Auto-Renew</p>
                      <p className="text-xs text-muted-foreground">{autoRenew ? 'Enabled' : 'Disabled'}</p>
                    </div>
                    <Switch
                      checked={autoRenew}
                      onCheckedChange={handleToggleAutoRenew}
                      disabled={togglingAutoRenew}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {currentPlan.features.slice(0, 5).map((feature, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-xs bg-background/60 backdrop-blur-sm rounded-full px-3 py-1 border">
                    <Check className="w-3 h-3 text-success" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                Credits Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{credits.available}</p>
              <p className="text-sm text-muted-foreground">Available credits</p>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold">{credits.pending}</span>
                </div>
                {credits.expiring > 0 && (
                  <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/10 -mx-2">
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Expiring {credits.expiryDate && formatDate(credits.expiryDate)}
                    </span>
                    <span className="font-semibold text-amber-600">{credits.expiring}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base font-medium">Usage This Period</CardTitle>
            <CardDescription>Resets on {formatDate(nextBillingDate)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {usageItems.map(item => (
                <div key={item.key} className="p-4 rounded-xl border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                      {item.data.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress
                    value={item.data.percentage}
                    className="h-2 mb-2"
                    indicatorClassName={
                      item.data.percentage > 90 ? 'bg-destructive' :
                      item.data.percentage > 75 ? 'bg-amber-500' : ''
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {item.key === 'storage'
                      ? `${item.data.used} GB / ${item.data.limit} GB`
                      : `${item.data.used.toLocaleString()} / ${item.data.limit.toLocaleString()}`
                    }
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Choose Your Plan</h2>
              <p className="text-sm text-muted-foreground">Upgrade or change your subscription anytime</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => {
              const config = PLAN_CONFIG[plan.type];
              const isCustom = plan.isContactSales;
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative p-6 rounded-2xl border-2 transition-all flex flex-col',
                    plan.isCurrentPlan && 'border-primary bg-primary/5 shadow-lg shadow-primary/10',
                    plan.isPopular && !plan.isCurrentPlan && 'border-primary/50',
                    !plan.isCurrentPlan && !plan.isPopular && 'border-border hover:border-primary/40 hover:shadow-md',
                  )}
                >
                  {plan.isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground shadow-md px-3">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  )}
                  {plan.isCurrentPlan && (
                    <Badge className="absolute -top-3 right-4 bg-emerald-500 text-white shadow-md">
                      <Check className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  )}

                  <div className="text-center mb-5">
                    <div className={cn(
                      "w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3",
                      config.bgColor, config.color
                    )}>
                      {PLAN_ICONS[plan.type]}
                    </div>
                    <h3 className="font-bold text-lg">{plan.name}</h3>
                    {isCustom ? (
                      <p className="text-xl font-bold mt-2 text-muted-foreground">Custom Pricing</p>
                    ) : (
                      <p className="text-2xl font-bold mt-2">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.slice(0, 6).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 6 && (
                      <li className="text-xs text-muted-foreground text-center mt-1">
                        +{plan.features.length - 6} more features
                      </li>
                    )}
                  </ul>

                  <Button
                    className="w-full"
                    variant={plan.isCurrentPlan ? 'secondary' : isCustom ? 'outline' : 'default'}
                    disabled={plan.isCurrentPlan || (upgradingPlan !== null && !isCustom)}
                    onClick={() => handleUpgrade(plan.type)}
                  >
                    {upgradingPlan === plan.type ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : plan.isCurrentPlan ? (
                      'Current Plan'
                    ) : isCustom ? (
                      <>
                        <PhoneCall className="w-4 h-4 mr-2" />
                        Contact Sales
                      </>
                    ) : (
                      <>
                        Upgrade
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Payment Methods</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setPaymentModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Card
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentMethods.map(method => (
                  <div
                    key={method.id}
                    className={cn(
                      'flex items-center justify-between p-4 rounded-xl border transition-colors',
                      method.isDefault && 'border-primary/50 bg-primary/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        method.isDefault ? "bg-primary/10 text-primary" : "bg-muted"
                      )}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {method.brand} •••• {method.last4}
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Default</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!method.isDefault && (
                          <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleRemoveMethod(method.id)}
                          className="text-destructive"
                          disabled={method.isDefault}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
                <Badge variant="secondary" className="font-normal">{invoices.length} total</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.slice(0, 5).map(invoice => {
                    const statusConfig = INVOICE_STATUS_CONFIG[invoice.status];
                    return (
                      <TableRow key={invoice.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{formatDate(invoice.date)}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {invoice.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">${invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn(statusConfig.bgColor, statusConfig.color, "text-xs")}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownloadInvoice(invoice.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      <UpdatePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        onSubmit={handleUpdatePayment}
      />

      <Dialog open={contactSalesOpen} onOpenChange={setContactSalesOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-purple-600" />
              Contact Our Sales Team
            </DialogTitle>
            <DialogDescription>
              Get a custom plan tailored to your business needs. Our team will reach out within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Full Name</Label>
              <Input
                id="contact-name"
                placeholder="John Doe"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Work Email</Label>
              <Input
                id="contact-email"
                type="email"
                placeholder="john@company.com"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-company">Company Name</Label>
              <Input
                id="contact-company"
                placeholder="Acme Corp"
                value={contactForm.company}
                onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Tell us about your needs</Label>
              <textarea
                id="contact-message"
                className="w-full min-h-[80px] p-3 rounded-lg border bg-background text-sm resize-y"
                placeholder="Describe your requirements, expected usage, team size, etc."
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setContactSalesOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleContactSalesSubmit}
                disabled={contactSubmitting || !contactForm.name || !contactForm.email}
              >
                {contactSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
