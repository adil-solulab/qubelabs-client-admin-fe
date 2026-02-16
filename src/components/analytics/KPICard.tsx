import { TrendingUp, TrendingDown, Clock, Zap, Target, Heart, Star, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  clock: Clock,
  zap: Zap,
  target: Target,
  heart: Heart,
  star: Star,
};

const colorMap: Record<string, string> = {
  primary: 'hsl(var(--primary))',
  success: '#22c55e',
  warning: '#f59e0b',
  destructive: '#ef4444',
};

const iconColorMap: Record<string, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

interface KPICardProps {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trendDirection: 'up' | 'down' | 'neutral';
  sparklineData: number[];
  icon: string;
  color: string;
  definition?: string;
}

export function KPICard({ label, value, change, changeLabel, trendDirection, sparklineData, icon, color, definition }: KPICardProps) {
  const IconComponent = iconMap[icon] || Star;
  const lineColor = colorMap[color] || colorMap.primary;
  const iconClass = iconColorMap[color] || 'text-primary';
  const chartData = sparklineData.map((v, i) => ({ v, i }));

  return (
    <Card className="gradient-card">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <IconComponent className={cn('w-4 h-4', iconClass)} />
              <span className="text-xs text-muted-foreground">{label}</span>
              {definition && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px] text-xs">
                      {definition}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className={cn(
                'text-[10px] px-1.5 py-0',
                trendDirection === 'up' ? 'text-success' : trendDirection === 'down' ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {trendDirection === 'up' && <TrendingUp className="w-3 h-3 mr-0.5" />}
                {trendDirection === 'down' && <TrendingDown className="w-3 h-3 mr-0.5" />}
                {change > 0 ? '+' : ''}{change}%
              </Badge>
              <span className="text-[10px] text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className="w-20 h-[60px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line type="monotone" dataKey="v" stroke={lineColor} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
