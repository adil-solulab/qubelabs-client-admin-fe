import { AlertOctagon, ArrowUpRight, Clock, User } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EscalationAlertsWidgetProps {
  isLoading?: boolean;
}

interface Escalation {
  id: string;
  customer: string;
  reason: string;
  agent: string;
  waitTime: string;
  priority: 'high' | 'medium' | 'low';
}

const mockEscalations: Escalation[] = [
  { id: '1', customer: 'John Doe', reason: 'VIP Customer Request', agent: 'AI Bot', waitTime: '2:45', priority: 'high' },
  { id: '2', customer: 'Jane Smith', reason: 'Negative Sentiment', agent: 'Sarah J.', waitTime: '1:20', priority: 'high' },
  { id: '3', customer: 'Alex Brown', reason: 'Complex Query', agent: 'AI Bot', waitTime: '0:55', priority: 'medium' },
];

const priorityStyles = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

export function EscalationAlertsWidget({ isLoading }: EscalationAlertsWidgetProps) {
  return (
    <DashboardWidget
      title="Escalation Alerts"
      icon={AlertOctagon}
      iconColor="text-destructive"
      isLoading={isLoading}
      className="lg:col-span-2"
      action={
        <Badge variant="destructive" className="animate-pulse">
          {mockEscalations.length} pending
        </Badge>
      }
    >
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {mockEscalations.map((escalation) => (
          <div 
            key={escalation.id}
            className={cn(
              "p-3 rounded-lg border transition-colors",
              priorityStyles[escalation.priority]
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{escalation.customer}</span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {escalation.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{escalation.reason}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {escalation.agent}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {escalation.waitTime}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardWidget>
  );
}
