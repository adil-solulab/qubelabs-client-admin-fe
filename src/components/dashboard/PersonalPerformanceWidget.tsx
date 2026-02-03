import { TrendingUp, MessageSquare, Clock, ThumbsUp, Award } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface PersonalPerformanceWidgetProps {
  isLoading?: boolean;
}

interface PerformanceMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  icon: typeof TrendingUp;
  trend: 'up' | 'down' | 'stable';
}

const mockMetrics: PerformanceMetric[] = [
  { id: '1', label: 'Conversations Today', value: 24, target: 30, unit: '', icon: MessageSquare, trend: 'up' },
  { id: '2', label: 'Avg Handle Time', value: 4.2, target: 5, unit: 'min', icon: Clock, trend: 'down' },
  { id: '3', label: 'CSAT Score', value: 94, target: 90, unit: '%', icon: ThumbsUp, trend: 'up' },
  { id: '4', label: 'Resolution Rate', value: 88, target: 85, unit: '%', icon: Award, trend: 'stable' },
];

export function PersonalPerformanceWidget({ isLoading }: PersonalPerformanceWidgetProps) {
  return (
    <DashboardWidget
      title="My Performance"
      icon={TrendingUp}
      iconColor="text-emerald-500"
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {mockMetrics.map((metric) => {
          const Icon = metric.icon;
          const percentage = Math.min((metric.value / metric.target) * 100, 100);
          const isOnTarget = metric.value >= metric.target;
          
          return (
            <div key={metric.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-sm font-semibold",
                    isOnTarget ? "text-emerald-500" : "text-amber-500"
                  )}>
                    {metric.value}{metric.unit}
                  </span>
                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
                  {metric.trend === 'down' && <TrendingUp className="w-3 h-3 text-destructive rotate-180" />}
                </div>
              </div>
              <Progress 
                value={percentage} 
                className="h-1.5"
              />
            </div>
          );
        })}
      </div>
    </DashboardWidget>
  );
}
