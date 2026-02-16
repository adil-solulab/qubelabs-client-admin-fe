import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  Mail,
  BarChart3,
  ExternalLink,
  Zap,
  Target,
  Heart,
  Info,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type {
  ConversationMetrics,
  AgentMetrics,
  ChannelUtilization,
  CSATNPSData,
  SentimentDataPoint,
  ConversationTrend,
  OutcomeKPI,
} from '@/types/analytics';

const COLORS = {
  voice: '#22c55e',
  chat: '#3b82f6',
  email: '#f59e0b',
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#f59e0b',
  escalated: '#ef4444',
};

function DiveDeepButton({ tab = 'overview' }: { tab?: string }) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-xs text-primary hover:text-primary gap-1 h-7 px-2"
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/analytics?tab=${tab}`);
      }}
    >
      Dive Deep
      <ExternalLink className="w-3 h-3" />
    </Button>
  );
}

export function TotalConversationsKPI({ data }: { data: ConversationMetrics }) {
  return (
    <Card className="gradient-card">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px]',
                data.trend > 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {data.trend > 0 ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {Math.abs(data.trend)}%
            </Badge>
            <DiveDeepButton />
          </div>
        </div>
        <p className="text-2xl font-bold mt-2">
          {data.totalConversations.toLocaleString()}
        </p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">Total Conversations</p>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                Total conversations handled across all channels during the selected period
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResolutionRateKPI({ data }: { data: ConversationMetrics }) {
  return (
    <Card className="gradient-card">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <ThumbsUp className="w-5 h-5 text-success" />
          <DiveDeepButton />
        </div>
        <p className="text-2xl font-bold mt-2">{data.resolutionRate}%</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">Resolution Rate</p>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                Percentage of conversations resolved without human agent escalation
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function AvgDurationKPI({ data }: { data: ConversationMetrics }) {
  const mins = Math.floor(data.avgDuration / 60);
  const secs = data.avgDuration % 60;
  return (
    <Card className="gradient-card">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <Clock className="w-5 h-5 text-warning" />
          <DiveDeepButton />
        </div>
        <p className="text-2xl font-bold mt-2">
          {mins}:{secs.toString().padStart(2, '0')}
        </p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">Avg Duration</p>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                Average time from conversation start to resolution
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function CSATScoreKPI({ data }: { data: CSATNPSData }) {
  return (
    <Card className="gradient-card">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px]',
                data.csatTrend > 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {data.csatTrend > 0 ? '+' : ''}
              {data.csatTrend}%
            </Badge>
            <DiveDeepButton />
          </div>
        </div>
        <p className="text-2xl font-bold mt-2">{data.csat}%</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">CSAT Score</p>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                Customer Satisfaction Score from post-interaction surveys (target: &gt;85%)
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function NPSScoreKPI({ data }: { data: CSATNPSData }) {
  return (
    <Card className="gradient-card">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px]',
                data.npsTrend > 0 ? 'text-success' : 'text-destructive'
              )}
            >
              {data.npsTrend > 0 ? '+' : ''}
              {data.npsTrend}
            </Badge>
            <DiveDeepButton />
          </div>
        </div>
        <p className="text-2xl font-bold mt-2">{data.nps}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">NPS Score</p>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                Net Promoter Score measuring customer loyalty (-100 to +100, target: &gt;50)
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function HandoffRateKPI({ data }: { data: ConversationMetrics }) {
  return (
    <Card className="gradient-card">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <Users className="w-5 h-5 text-muted-foreground" />
          <DiveDeepButton />
        </div>
        <p className="text-2xl font-bold mt-2">{data.handoffRate}%</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">Handoff Rate</p>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                Percentage of AI conversations requiring transfer to a human agent
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversationVolumeChart({
  data,
}: {
  data: ConversationTrend[];
}) {
  return (
    <Card className="gradient-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Conversation Volume
          </CardTitle>
          <DiveDeepButton />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data.slice(-14)}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="chat"
              stackId="1"
              stroke={COLORS.chat}
              fill={COLORS.chat}
              fillOpacity={0.6}
              name="Chat"
            />
            <Area
              type="monotone"
              dataKey="voice"
              stackId="1"
              stroke={COLORS.voice}
              fill={COLORS.voice}
              fillOpacity={0.6}
              name="Voice"
            />
            <Area
              type="monotone"
              dataKey="email"
              stackId="1"
              stroke={COLORS.email}
              fill={COLORS.email}
              fillOpacity={0.6}
              name="Email"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function SentimentTrendsChart({
  data,
}: {
  data: SentimentDataPoint[];
}) {
  return (
    <Card className="gradient-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Sentiment Trends
          </CardTitle>
          <DiveDeepButton tab="sentiment" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.slice(-14)}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="positive"
              stroke={COLORS.positive}
              strokeWidth={2}
              dot={false}
              name="Positive"
            />
            <Line
              type="monotone"
              dataKey="neutral"
              stroke={COLORS.neutral}
              strokeWidth={2}
              dot={false}
              name="Neutral"
            />
            <Line
              type="monotone"
              dataKey="negative"
              stroke={COLORS.negative}
              strokeWidth={2}
              dot={false}
              name="Negative"
            />
            <Line
              type="monotone"
              dataKey="escalated"
              stroke={COLORS.escalated}
              strokeWidth={2}
              dot={false}
              name="Escalated"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ChannelUtilizationChart({
  data,
}: {
  data: ChannelUtilization[];
}) {
  const pieData = data.map((c) => ({
    name: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
    value: c.conversations,
    color:
      c.channel === 'voice'
        ? COLORS.voice
        : c.channel === 'chat'
          ? COLORS.chat
          : COLORS.email,
  }));

  return (
    <Card className="gradient-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Channel Utilization
          </CardTitle>
          <DiveDeepButton tab="channels" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-2">
          {data.map((channel) => (
            <div
              key={channel.channel}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                {channel.channel === 'voice' && (
                  <Phone className="w-4 h-4 text-success" />
                )}
                {channel.channel === 'chat' && (
                  <MessageSquare className="w-4 h-4 text-primary" />
                )}
                {channel.channel === 'email' && (
                  <Mail className="w-4 h-4 text-warning" />
                )}
                <span className="capitalize">{channel.channel}</span>
              </div>
              <span className="text-muted-foreground">{channel.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CSATTrendChart({ data }: { data: CSATNPSData }) {
  return (
    <Card className="gradient-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">CSAT Trend</CardTitle>
          <DiveDeepButton />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.csatHistory.slice(-10)}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              domain={[70, 100]}
              tick={{ fontSize: 10 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Bar
              dataKey="value"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="CSAT %"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function NPSBreakdownChart({ data }: { data: CSATNPSData }) {
  const pieData = [
    { name: 'Promoters', value: data.promoters, color: COLORS.positive },
    { name: 'Passives', value: data.passives, color: COLORS.neutral },
    { name: 'Detractors', value: data.detractors, color: COLORS.escalated },
  ];

  return (
    <Card className="gradient-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            NPS Breakdown
          </CardTitle>
          <DiveDeepButton />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-2">
          {pieData.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span>{item.name}</span>
              </div>
              <span className="font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AgentPerformanceTable({
  data,
}: {
  data: AgentMetrics[];
}) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="gradient-card lg:col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Agent Performance
          </CardTitle>
          <DiveDeepButton />
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-muted-foreground">
                  Agent
                </th>
                <th className="text-right py-2 font-medium text-muted-foreground">
                  Handled
                </th>
                <th className="text-right py-2 font-medium text-muted-foreground">
                  Avg Time
                </th>
                <th className="text-right py-2 font-medium text-muted-foreground">
                  CSAT
                </th>
                <th className="text-right py-2 font-medium text-muted-foreground">
                  Resolution
                </th>
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 5).map((agent) => (
                <tr key={agent.agentId} className="border-b last:border-0">
                  <td className="py-2 font-medium">{agent.agentName}</td>
                  <td className="py-2 text-right">
                    {agent.conversationsHandled.toLocaleString()}
                  </td>
                  <td className="py-2 text-right font-mono text-xs">
                    {formatDuration(agent.avgHandleTime)}
                  </td>
                  <td className="py-2 text-right">
                    <span
                      className={cn(
                        agent.csat >= 90
                          ? 'text-success'
                          : agent.csat >= 80
                            ? 'text-warning'
                            : 'text-destructive'
                      )}
                    >
                      {agent.csat}%
                    </span>
                  </td>
                  <td className="py-2 text-right">{agent.resolutionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function OutcomeKPIWidget({ kpi }: { kpi: OutcomeKPI }) {
  const iconMap: Record<string, React.ElementType> = {
    clock: Clock,
    zap: Zap,
    target: Target,
    heart: Heart,
    star: BarChart3,
  };
  const Icon = iconMap[kpi.icon] || BarChart3;

  return (
    <Card className="gradient-card">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <Icon className="w-5 h-5 text-primary" />
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className={cn(
                'text-[10px]',
                kpi.trendDirection === 'up' ? 'text-success' : kpi.trendDirection === 'down' ? 'text-destructive' : ''
              )}
            >
              {kpi.trendDirection === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : kpi.trendDirection === 'down' ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : null}
              {kpi.change > 0 ? '+' : ''}{kpi.change}%
            </Badge>
            <DiveDeepButton />
          </div>
        </div>
        <p className="text-2xl font-bold mt-2">{kpi.value}</p>
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">{kpi.label}</p>
          {kpi.definition && (
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px] text-xs">
                  {kpi.definition}
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
