import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Clock, ArrowRight, AlertTriangle, Info, Zap } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { CreditData } from '@/types/dashboard';

interface CreditUsageWidgetProps {
  creditData: CreditData;
  isLoading?: boolean;
}

export function CreditUsageWidget({ creditData, isLoading }: CreditUsageWidgetProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const usagePercent = Math.round((creditData.used / creditData.total) * 100);
  const availablePercent = Math.round((creditData.available / creditData.total) * 100);

  const getUsageColor = () => {
    if (usagePercent >= 90) return 'text-destructive';
    if (usagePercent >= 75) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    if (usagePercent >= 90) return 'bg-destructive';
    if (usagePercent >= 75) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <>
      <DashboardWidget
        title="Credit Usage"
        icon={Wallet}
        iconColor="text-primary"
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
        definition="Your current credit balance and consumption across all services. Credits reset monthly based on your billing cycle."
      >
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
              {creditData.available.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / {creditData.total.toLocaleString()} credits
            </span>
          </div>

          <div className="space-y-1">
            <Progress
              value={usagePercent}
              className="h-2 bg-muted"
              indicatorClassName={getProgressColor()}
            />
            <div className="flex justify-between text-xs">
              <span className={cn('font-medium', getUsageColor())}>
                {usagePercent}% used
              </span>
              <span className="text-muted-foreground">
                {availablePercent}% remaining
              </span>
            </div>
          </div>

          {creditData.expiring > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-warning font-medium">
                {creditData.expiring.toLocaleString()} credits expiring soon
              </span>
            </div>
          )}
        </div>
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Credit Usage Details
            </DialogTitle>
            <DialogDescription>
              Detailed breakdown of your credit consumption across services.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border bg-primary/5 border-primary/20 text-center">
                <Wallet className="w-5 h-5 text-primary mx-auto mb-1" />
                <div className="text-xl font-bold text-primary">
                  {creditData.available.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Available</div>
              </div>
              <div className="p-4 rounded-xl border bg-muted/50 text-center">
                <Zap className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                <div className="text-xl font-bold">
                  {creditData.used.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Used</div>
              </div>
              <div className="p-4 rounded-xl border bg-warning/5 border-warning/20 text-center">
                <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
                <div className="text-xl font-bold text-warning">
                  {creditData.pending.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Overall Usage</span>
                <span className={cn('font-semibold', getUsageColor())}>{usagePercent}%</span>
              </div>
              <Progress
                value={usagePercent}
                className="h-3 bg-muted"
                indicatorClassName={getProgressColor()}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Usage Breakdown</h4>
              {creditData.breakdown.map((item, idx) => {
                const itemPercent = item.allocated > 0
                  ? Math.round((item.used / item.allocated) * 100)
                  : 0;
                return (
                  <div key={idx} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm font-medium">{item.category}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.used.toLocaleString()} / {item.allocated.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={itemPercent}
                      className="h-1.5 bg-muted"
                      indicatorClassName={
                        itemPercent >= 90 ? 'bg-destructive' :
                        itemPercent >= 75 ? 'bg-warning' : 'bg-primary'
                      }
                    />
                  </div>
                );
              })}
            </div>

            {creditData.expiring > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/5 border border-warning/20 text-sm">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-warning">
                    {creditData.expiring.toLocaleString()} credits expiring
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Expires on {new Date(creditData.expiryDate).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Credits reset on {new Date(creditData.resetDate).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric',
                })}. Upgrade your plan for more credits.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { navigate('/billing'); setIsOpen(false); }}>
              View Billing
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={() => { navigate('/billing'); setIsOpen(false); }}>
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
