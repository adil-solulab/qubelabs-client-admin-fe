import { TrendingUp, TrendingDown, MessageSquare, Phone, Mail, Clock, ThumbsUp, CheckCircle } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ChannelAnalytics } from '@/types/analytics';

const COLORS: Record<string, string> = {
  Chat: '#3b82f6',
  Voice: '#22c55e',
  Email: '#f59e0b',
};

const channelIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Chat: MessageSquare,
  Voice: Phone,
  Email: Mail,
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

interface ChannelsTabProps {
  channelAnalytics: ChannelAnalytics[];
}

export function ChannelsTab({ channelAnalytics }: ChannelsTabProps) {
  const comparisonData = channelAnalytics.map(ch => ({
    channel: ch.channel,
    conversations: ch.conversations,
    csat: ch.csat,
    resolutionRate: ch.resolutionRate,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channelAnalytics.map(ch => {
          const IconComponent = channelIcons[ch.channel] || MessageSquare;
          const color = COLORS[ch.channel] || '#6b7280';
          return (
            <Card key={ch.channel} className="gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <IconComponent className="w-5 h-5" style={{ color }} />
                  {ch.channel}
                  <Badge variant="secondary" className={cn(
                    'ml-auto text-[10px]',
                    ch.trend > 0 ? 'text-success' : 'text-destructive'
                  )}>
                    {ch.trend > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {ch.trend > 0 ? '+' : ''}{ch.trend}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Conversations</p>
                    <p className="font-semibold">{ch.conversations.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Avg Response</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ch.avgResponseTime}s
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">CSAT</p>
                    <p className="font-semibold flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {ch.csat}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Resolution</p>
                    <p className="font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {ch.resolutionRate}%
                    </p>
                  </div>
                </div>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ch.volumeOverTime}>
                      <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Conversations by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="conversations" name="Conversations" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <rect key={index} fill={COLORS[entry.channel] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">CSAT by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="channel" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="csat" name="CSAT %" radius={[4, 4, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <rect key={index} fill={COLORS[entry.channel] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
