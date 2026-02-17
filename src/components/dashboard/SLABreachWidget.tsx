import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SLABreachWidgetProps {
  isLoading?: boolean;
}

interface SLAMetric {
  id: string;
  name: string;
  current: number;
  target: number;
  breaches: number;
  trend: 'up' | 'down' | 'stable';
}

const mockSLAData: SLAMetric[] = [
  { id: '1', name: 'First Response Time', current: 92, target: 95, breaches: 3, trend: 'up' },
  { id: '2', name: 'Resolution Time', current: 88, target: 90, breaches: 7, trend: 'down' },
  { id: '3', name: 'Customer Wait Time', current: 95, target: 95, breaches: 0, trend: 'stable' },
];

export function SLABreachWidget({ isLoading }: SLABreachWidgetProps) {
  const navigate = useNavigate();
  const totalBreaches = mockSLAData.reduce((sum, m) => sum + m.breaches, 0);

  return (
    <DashboardWidget
      title="SLA Compliance"
      icon={AlertTriangle}
      iconColor="text-amber-500"
      isLoading={isLoading}
      onClick={() => navigate('/live-ops')}
    >
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "text-3xl font-bold",
            totalBreaches > 5 ? "text-destructive" : totalBreaches > 0 ? "text-amber-500" : "text-emerald-500"
          )}>
            {totalBreaches}
          </span>
          <span className="text-sm text-muted-foreground">breaches today</span>
        </div>

        <div className="space-y-3">
          {mockSLAData.map((metric) => (
            <div key={metric.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{metric.name}</span>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "font-medium",
                    metric.current >= metric.target ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {metric.current}%
                  </span>
                  <span className="text-muted-foreground">/ {metric.target}%</span>
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                  {metric.trend === 'down' && <TrendingUp className="w-3 h-3 text-destructive rotate-180" />}
                </div>
              </div>
              <Progress 
                value={metric.current} 
                className="h-1.5"
              />
            </div>
          ))}
        </div>
      </div>
    </DashboardWidget>
  );
}
