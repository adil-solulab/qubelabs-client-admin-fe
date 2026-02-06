import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LucideIcon } from 'lucide-react';

interface DashboardWidgetProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isLoading?: boolean;
  action?: React.ReactNode;
}

export function DashboardWidget({
  title,
  icon: Icon,
  iconColor = 'text-primary',
  children,
  className,
  onClick,
  isLoading,
  action,
}: DashboardWidgetProps) {
  return (
    <Card
      className={cn(
        'gradient-card border border-border/50 overflow-hidden',
        onClick && 'widget-hover',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className={cn('p-1.5 rounded-lg bg-primary/10', iconColor)}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export function WidgetSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('gradient-card border border-border/50', className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-full" />
      </CardContent>
    </Card>
  );
}
