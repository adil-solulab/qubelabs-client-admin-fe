import { useState } from 'react';
import {
  CreditCard,
  Receipt,
  Coins,
  TrendingUp,
  Phone,
  MessageSquare,
  Mail,
  Users,
  HardDrive,
  Clock,
  Download,
  Plus,
  Check,
  Star,
  Crown,
  Trash2,
  MoreVertical,
  Calendar,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
import { useBillingData } from '@/hooks/useBillingData';
import { notify } from '@/hooks/useNotification';
import { UpdatePaymentModal } from '@/components/billing/UpdatePaymentModal';
import { PLAN_CONFIG, INVOICE_STATUS_CONFIG } from '@/types/billing';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const {
    plans,
    currentPlan,
    usageMetrics,
    invoices,
    paymentMethods,
    credits,
    nextBillingDate,
    nextAmount,
    updatePaymentMethod,
    setDefaultPaymentMethod,
    removePaymentMethod,
    upgradePlan,
    downloadInvoice,
  } = useBillingData();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const planConfig = PLAN_CONFIG[currentPlan.type];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Usage</h1>
            <p className="text-sm text-muted-foreground">
              Manage your subscription, usage, and payment methods
            </p>
          </div>
        </div>

        {/* Current Plan & Next Billing */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <Card className="gradient-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Current Plan</CardTitle>
                <Badge className={cn(planConfig.bgColor, planConfig.color)}>
                  {planConfig.icon} {currentPlan.name}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-3xl font-bold">
                    ${currentPlan.price}
                    <span className="text-base font-normal text-muted-foreground">/{currentPlan.interval}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Next billing: {formatDate(nextBillingDate)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.features.slice(0, 4).map((feature, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      <Check className="w-3 h-3 mr-1 text-success" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Coins className="w-4 h-4 text-warning" />
                Credits Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-warning">{credits.available}</p>
              <p className="text-sm text-muted-foreground">Available credits</p>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium">{credits.pending}</span>
                </div>
                {credits.expiring > 0 && (
                  <div className="flex justify-between text-warning">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Expiring {credits.expiryDate && formatDate(credits.expiryDate)}
                    </span>
                    <span className="font-medium">{credits.expiring}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Metrics */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Usage This Period</CardTitle>
            <CardDescription>Your consumption resets on {formatDate(nextBillingDate)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Calls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium">AI Calls</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageMetrics.calls.used.toLocaleString()} / {usageMetrics.calls.limit.toLocaleString()}
                  </span>
                </div>
                <Progress value={usageMetrics.calls.percentage} className="h-2" indicatorClassName={usageMetrics.calls.percentage > 80 ? 'bg-warning' : ''} />
                <p className="text-xs text-muted-foreground">{usageMetrics.calls.percentage.toFixed(1)}% used</p>
              </div>

              {/* Chats */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Chat Sessions</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageMetrics.chats.used.toLocaleString()} / {usageMetrics.chats.limit.toLocaleString()}
                  </span>
                </div>
                <Progress value={usageMetrics.chats.percentage} className="h-2" indicatorClassName={usageMetrics.chats.percentage > 80 ? 'bg-warning' : ''} />
                <p className="text-xs text-muted-foreground">{usageMetrics.chats.percentage.toFixed(1)}% used</p>
              </div>

              {/* Emails */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium">Email Sessions</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageMetrics.emails.used.toLocaleString()} / {usageMetrics.emails.limit.toLocaleString()}
                  </span>
                </div>
                <Progress value={usageMetrics.emails.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{usageMetrics.emails.percentage.toFixed(1)}% used</p>
              </div>

              {/* Agents */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">AI Agents</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageMetrics.agents.used} / {usageMetrics.agents.limit}
                  </span>
                </div>
                <Progress value={usageMetrics.agents.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{usageMetrics.agents.percentage.toFixed(1)}% used</p>
              </div>

              {/* Storage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageMetrics.storage.used} GB / {usageMetrics.storage.limit} GB
                  </span>
                </div>
                <Progress value={usageMetrics.storage.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">{usageMetrics.storage.percentage.toFixed(1)}% used</p>
              </div>

              {/* AI Minutes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Minutes</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {usageMetrics.aiMinutes.used.toLocaleString()} / {usageMetrics.aiMinutes.limit.toLocaleString()}
                  </span>
                </div>
                <Progress value={usageMetrics.aiMinutes.percentage} className="h-2" indicatorClassName={usageMetrics.aiMinutes.percentage > 80 ? 'bg-warning' : ''} />
                <p className="text-xs text-muted-foreground">{usageMetrics.aiMinutes.percentage.toFixed(1)}% used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plans Comparison */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Available Plans</CardTitle>
            <CardDescription>Upgrade or downgrade your subscription anytime</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {plans.map(plan => {
                const config = PLAN_CONFIG[plan.type];
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      'relative p-5 rounded-xl border-2 transition-all',
                      plan.isCurrentPlan && 'border-primary bg-primary/5',
                      !plan.isCurrentPlan && 'border-border hover:border-primary/50'
                    )}
                  >
                    {plan.isPopular && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}
                    {plan.isCurrentPlan && (
                      <Badge className="absolute -top-2 right-4" variant="secondary">
                        Current
                      </Badge>
                    )}

                    <div className="text-center mb-4">
                      <span className="text-2xl">{config.icon}</span>
                      <h3 className="font-semibold text-lg mt-2">{plan.name}</h3>
                      <p className="text-2xl font-bold mt-1">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">/mo</span>
                      </p>
                    </div>

                    <ul className="space-y-2 mb-4">
                      {plan.features.slice(0, 5).map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-success flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.isCurrentPlan ? 'secondary' : 'default'}
                      disabled={plan.isCurrentPlan || upgradingPlan !== null}
                      onClick={() => handleUpgrade(plan.type)}
                    >
                      {upgradingPlan === plan.type ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Upgrading...
                        </>
                      ) : plan.isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        'Upgrade'
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <Card className="gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Payment Methods</CardTitle>
                <Button size="sm" onClick={() => setPaymentModalOpen(true)}>
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
                      'flex items-center justify-between p-4 rounded-xl border',
                      method.isDefault && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {method.brand} •••• {method.last4}
                          {method.isDefault && (
                            <Badge variant="secondary" className="text-[10px]">Default</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Expires {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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

          {/* Invoices */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
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
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{formatDate(invoice.date)}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {invoice.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${invoice.amount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={cn(statusConfig.bgColor, statusConfig.color)}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
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

      {/* Payment Modal */}
      <UpdatePaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        onSubmit={handleUpdatePayment}
      />
    </AppLayout>
  );
}
