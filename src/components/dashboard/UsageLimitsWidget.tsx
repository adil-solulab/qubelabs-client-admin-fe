import { useState } from 'react';
import { Gauge, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { UsageData } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

interface UsageLimitsWidgetProps {
  usage: UsageData[];
  isLoading?: boolean;
}

export function UsageLimitsWidget({ usage, isLoading }: UsageLimitsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const getUsagePercentage = (current: number, limit: number) => 
    Math.round((current / limit) * 100);

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-destructive';
    if (percentage >= 75) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-warning';
    return 'bg-success';
  };

  const criticalUsage = usage.filter(u => getUsagePercentage(u.current, u.limit) >= 90);
  const warningUsage = usage.filter(u => {
    const pct = getUsagePercentage(u.current, u.limit);
    return pct >= 75 && pct < 90;
  });

  const handleUpgrade = () => {
    toast({
      title: 'Upgrade Requested',
      description: 'Our sales team will contact you shortly to discuss plan upgrades.',
    });
    setIsOpen(false);
  };

  return (
    <>
      <DashboardWidget
        title="Usage vs Limits"
        icon={Gauge}
        iconColor="text-warning"
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
        definition="Current consumption of subscribed resources compared to your plan limits. Resets monthly"
      >
        <div className="space-y-3">
          {usage.slice(0, 2).map((item, idx) => {
            const percentage = getUsagePercentage(item.current, item.limit);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.category}</span>
                  <span className={cn('font-medium', getUsageColor(percentage))}>
                    {percentage}%
                  </span>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2 bg-muted"
                  indicatorClassName={getProgressColor(percentage)}
                />
              </div>
            );
          })}
        </div>
        {(criticalUsage.length > 0 || warningUsage.length > 0) && (
          <div className="flex items-center gap-1.5 mt-3">
            <AlertTriangle className={cn(
              'w-3.5 h-3.5',
              criticalUsage.length > 0 ? 'text-destructive' : 'text-warning'
            )} />
            <span className={cn(
              'text-xs font-medium',
              criticalUsage.length > 0 ? 'text-destructive' : 'text-warning'
            )}>
              {criticalUsage.length > 0 
                ? `${criticalUsage.length} critical` 
                : `${warningUsage.length} approaching limit`}
            </span>
          </div>
        )}
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-warning" />
              Subscription Usage
            </DialogTitle>
            <DialogDescription>
              Monitor your current usage against subscription limits.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {usage.map((item, idx) => {
              const percentage = getUsagePercentage(item.current, item.limit);
              return (
                <div key={idx} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{item.category}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.current.toLocaleString()} / {item.limit.toLocaleString()} {item.unit}
                      </p>
                    </div>
                    <div className={cn(
                      'text-2xl font-bold',
                      getUsageColor(percentage)
                    )}>
                      {percentage}%
                    </div>
                  </div>
                  <Progress 
                    value={percentage} 
                    className="h-3 bg-muted"
                    indicatorClassName={getProgressColor(percentage)}
                  />
                  {percentage >= 90 && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
                      <AlertTriangle className="w-3 h-3" />
                      Critical - Consider upgrading soon
                    </div>
                  )}
                  {percentage >= 75 && percentage < 90 && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-warning">
                      <TrendingUp className="w-3 h-3" />
                      Approaching limit
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Usage resets on the 1st of each month. Upgrade your plan to increase limits.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button onClick={handleUpgrade}>
              Upgrade Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
