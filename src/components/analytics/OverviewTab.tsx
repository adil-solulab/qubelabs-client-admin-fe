import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  ThumbsUp,
  Bot,
  Award,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
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
import { Progress } from '@/components/ui/progress';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KPICard } from './KPICard';
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
  primary: 'hsl(var(--primary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  destructive: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
  voice: '#22c55e',
  chat: '#3b82f6',
  email: '#f59e0b',
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#f59e0b',
  escalated: '#ef4444',
};

const CURRENT_AGENT = { id: 'agent-1', name: 'John Smith' };

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

interface OverviewTabProps {
  conversationMetrics: ConversationMetrics;
  agentMetrics: AgentMetrics[];
  channelUtilization: ChannelUtilization[];
  csatNpsData: CSATNPSData;
  sentimentTrends: SentimentDataPoint[];
  conversationTrends: ConversationTrend[];
  outcomeKPIs: OutcomeKPI[];
  canViewGlobalAnalytics: boolean;
  canViewTeamAnalytics: boolean;
  roleName: string;
  formatDuration: (seconds: number) => string;
}

export function OverviewTab({
  conversationMetrics,
  agentMetrics,
  channelUtilization,
  csatNpsData,
  sentimentTrends,
  conversationTrends,
  outcomeKPIs,
  canViewGlobalAnalytics,
  canViewTeamAnalytics,
  roleName,
  formatDuration,
}: OverviewTabProps) {
  const roleFilteredAgentMetrics = canViewTeamAnalytics
    ? agentMetrics
    : agentMetrics.filter(agent => agent.agentId === CURRENT_AGENT.id);

  const personalMetrics = agentMetrics.find(agent => agent.agentId === CURRENT_AGENT.id) || {
    agentId: CURRENT_AGENT.id,
    agentName: CURRENT_AGENT.name,
    conversationsHandled: 0,
    avgHandleTime: 0,
    csat: 0,
    resolutionRate: 0,
    availability: 0,
  };

  const channelPieData = channelUtilization.map(c => ({
    name: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
    value: c.conversations,
    color: COLORS[c.channel as keyof typeof COLORS] || COLORS.muted,
  }));

  const npsPieData = [
    { name: 'Promoters', value: csatNpsData.promoters, color: COLORS.positive },
    { name: 'Passives', value: csatNpsData.passives, color: COLORS.neutral },
    { name: 'Detractors', value: csatNpsData.detractors, color: COLORS.destructive },
  ];

  return (
    <div className="space-y-6">
      {outcomeKPIs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {outcomeKPIs.map(kpi => (
            <KPICard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              change={kpi.change}
              changeLabel={kpi.changeLabel}
              trendDirection={kpi.trendDirection}
              sparklineData={kpi.sparklineData}
              icon={kpi.icon}
              color={kpi.color}
              definition={kpi.definition}
            />
          ))}
        </div>
      )}

      {canViewGlobalAnalytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <MessageSquare className="w-5 h-5 text-primary" />
                <Badge variant="secondary" className={cn(
                  'text-[10px]',
                  conversationMetrics.trend > 0 ? 'text-success' : 'text-destructive'
                )}>
                  {conversationMetrics.trend > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {Math.abs(conversationMetrics.trend)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{conversationMetrics.totalConversations.toLocaleString()}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">Total Conversations</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} className="max-w-[250px] text-xs z-50">
                      Total number of conversations handled across all channels during the selected period
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <Clock className="w-5 h-5 text-warning" />
              <p className="text-2xl font-bold mt-2">{formatDuration(conversationMetrics.avgDuration)}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} className="max-w-[250px] text-xs z-50">
                      Average length of time from conversation start to resolution across all channels
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <ThumbsUp className="w-5 h-5 text-success" />
              <p className="text-2xl font-bold mt-2">{conversationMetrics.resolutionRate}%</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">Resolution Rate</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} className="max-w-[250px] text-xs z-50">
                      Percentage of conversations successfully resolved without escalation to a human agent
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <BarChart3 className="w-5 h-5 text-primary" />
                <Badge variant="secondary" className={cn(
                  'text-[10px]',
                  csatNpsData.csatTrend > 0 ? 'text-success' : 'text-destructive'
                )}>
                  {csatNpsData.csatTrend > 0 ? '+' : ''}{csatNpsData.csatTrend}%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{csatNpsData.csat}%</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">CSAT Score</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} className="max-w-[250px] text-xs z-50">
                      Customer Satisfaction Score from post-interaction surveys. Higher is better (target: &gt;85%)
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-5 h-5 text-success" />
                <Badge variant="secondary" className={cn(
                  'text-[10px]',
                  csatNpsData.npsTrend > 0 ? 'text-success' : 'text-destructive'
                )}>
                  {csatNpsData.npsTrend > 0 ? '+' : ''}{csatNpsData.npsTrend}
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-2">{csatNpsData.nps}</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">NPS Score</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} className="max-w-[250px] text-xs z-50">
                      Net Promoter Score measuring customer loyalty. Ranges from -100 to +100 (target: &gt;50)
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <Users className="w-5 h-5 text-muted-foreground" />
              <p className="text-2xl font-bold mt-2">{conversationMetrics.handoffRate}%</p>
              <div className="flex items-center gap-1.5">
                <p className="text-xs text-muted-foreground">Handoff Rate</p>
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground/50 hover:text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8} className="max-w-[250px] text-xs z-50">
                      Percentage of AI conversations that required transfer to a human agent
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {roleName === 'Agent' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold mt-2">{personalMetrics.conversationsHandled.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Conversations Handled</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <Clock className="w-5 h-5 text-warning" />
              <p className="text-2xl font-bold mt-2">{formatDuration(personalMetrics.avgHandleTime)}</p>
              <p className="text-xs text-muted-foreground">Avg Handle Time</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <ThumbsUp className="w-5 h-5 text-success" />
              <p className="text-2xl font-bold mt-2">{personalMetrics.csat}%</p>
              <p className="text-xs text-muted-foreground">My CSAT Score</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <Award className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold mt-2">{personalMetrics.resolutionRate}%</p>
              <p className="text-xs text-muted-foreground">Resolution Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {canViewGlobalAnalytics && (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Conversation Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={conversationTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Area type="monotone" dataKey="chat" stackId="1" stroke={COLORS.chat} fill={COLORS.chat} fillOpacity={0.6} name="Chat" />
                    <Area type="monotone" dataKey="voice" stackId="1" stroke={COLORS.voice} fill={COLORS.voice} fillOpacity={0.6} name="Voice" />
                    <Area type="monotone" dataKey="email" stackId="1" stroke={COLORS.email} fill={COLORS.email} fillOpacity={0.6} name="Email" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Sentiment Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={sentimentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} dot={false} name="Positive" />
                    <Line type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} dot={false} name="Neutral" />
                    <Line type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} dot={false} name="Negative" />
                    <Line type="monotone" dataKey="escalated" stroke={COLORS.escalated} strokeWidth={2} dot={false} name="Escalated" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Channel Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={channelPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {channelPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {channelUtilization.map(channel => (
                    <div key={channel.channel} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {channel.channel === 'voice' && <Phone className="w-4 h-4 text-success" />}
                        {channel.channel === 'chat' && <MessageSquare className="w-4 h-4 text-primary" />}
                        {channel.channel === 'email' && <Mail className="w-4 h-4 text-warning" />}
                        <span className="capitalize">{channel.channel}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground">{channel.percentage}%</span>
                        <span className="font-medium">{channel.conversations.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">NPS Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={npsPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                        {npsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-sm">Promoters (9-10)</span>
                    </div>
                    <span className="font-medium">{csatNpsData.promoters}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                      <span className="text-sm">Passives (7-8)</span>
                    </div>
                    <span className="font-medium">{csatNpsData.passives}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-destructive" />
                      <span className="text-sm">Detractors (0-6)</span>
                    </div>
                    <span className="font-medium">{csatNpsData.detractors}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">CSAT Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={csatNpsData.csatHistory.slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="CSAT %" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <p className="text-3xl font-bold">{csatNpsData.csat}%</p>
                  <p className="text-xs text-muted-foreground">Current CSAT Score</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {roleName === 'Agent' && (
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              My Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CSAT Score</span>
                    <span className="font-medium">{personalMetrics.csat}%</span>
                  </div>
                  <Progress value={personalMetrics.csat} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resolution Rate</span>
                    <span className="font-medium">{personalMetrics.resolutionRate}%</span>
                  </div>
                  <Progress value={personalMetrics.resolutionRate} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Availability</span>
                    <span className="font-medium">{personalMetrics.availability}%</span>
                  </div>
                  <Progress value={personalMetrics.availability} className="h-2" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center p-6 rounded-xl bg-muted/50">
                  <p className="text-4xl font-bold text-primary">{personalMetrics.conversationsHandled}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Conversations</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Avg Handle Time: {formatDuration(personalMetrics.avgHandleTime)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">
            {roleName === 'Agent' ? 'My Performance' : 'Agent Performance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Conversations</TableHead>
                <TableHead className="text-right">Avg Handle Time</TableHead>
                <TableHead className="text-right">CSAT</TableHead>
                <TableHead className="text-right">Resolution</TableHead>
                <TableHead className="text-right">Availability</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roleFilteredAgentMetrics.map(agent => (
                <TableRow key={agent.agentId}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs',
                        agent.agentId.startsWith('ai') ? 'bg-primary/10 text-primary' : 'bg-muted'
                      )}>
                        {agent.agentId.startsWith('ai') ? (
                          <Bot className="w-4 h-4" />
                        ) : (
                          agent.agentName.split(' ').map(n => n[0]).join('')
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{agent.agentName}</p>
                        {agent.agentId.startsWith('ai') && (
                          <Badge variant="secondary" className="text-[10px]">AI</Badge>
                        )}
                        {agent.agentId === CURRENT_AGENT.id && roleName === 'Agent' && (
                          <Badge variant="outline" className="text-[10px] ml-1">You</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {agent.conversationsHandled.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatDuration(agent.avgHandleTime)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={agent.csat} className="w-16 h-2" />
                      <span className={cn(
                        'font-medium',
                        agent.csat >= 90 ? 'text-success' : agent.csat >= 80 ? 'text-warning' : 'text-destructive'
                      )}>
                        {agent.csat}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-medium',
                      agent.resolutionRate >= 90 ? 'text-success' : 'text-warning'
                    )}>
                      {agent.resolutionRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={cn(
                      agent.availability >= 90 ? 'border-success text-success' :
                      agent.availability >= 70 ? 'border-warning text-warning' : 'border-destructive text-destructive'
                    )}>
                      {agent.availability}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
