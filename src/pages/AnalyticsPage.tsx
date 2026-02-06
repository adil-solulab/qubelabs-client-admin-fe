import { useState, useMemo } from 'react';
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
  Download,
  Bot,
  User,
  Lock,
  Info,
  Award,
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
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { notify } from '@/hooks/useNotification';
import { ExportReportModal } from '@/components/analytics/ExportReportModal';
import type { TimeRange, ChannelType } from '@/types/analytics';
import { cn } from '@/lib/utils';

// Simulated current agent for demo
const CURRENT_AGENT = {
  id: 'agent-1',
  name: 'John Smith',
};

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

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { currentRole, isClientAdmin } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';

  // Role-based permissions
  const canViewGlobalAnalytics = isClientAdmin;
  const canViewTeamAnalytics = isClientAdmin || roleName === 'Supervisor';
  const canExportReports = isClientAdmin;

  const {
    timeRange,
    setTimeRange,
    channelFilter,
    setChannelFilter,
    conversationMetrics,
    agentMetrics,
    channelUtilization,
    csatNpsData,
    sentimentTrends,
    conversationTrends,
    exportReport,
  } = useAnalyticsData();

  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Filter agent metrics based on role
  const roleFilteredAgentMetrics = useMemo(() => {
    if (canViewTeamAnalytics) {
      // Client Admin and Supervisor can see all agents
      return agentMetrics;
    }
    // Agent can only see their own performance
    return agentMetrics.filter(agent => agent.agentId === CURRENT_AGENT.id);
  }, [agentMetrics, canViewTeamAnalytics]);

  // Get personal metrics for Agent view
  const personalMetrics = useMemo(() => {
    return agentMetrics.find(agent => agent.agentId === CURRENT_AGENT.id) || {
      agentId: CURRENT_AGENT.id,
      agentName: CURRENT_AGENT.name,
      conversationsHandled: 0,
      avgHandleTime: 0,
      csat: 0,
      resolutionRate: 0,
      availability: 0,
    };
  }, [agentMetrics]);

  const handleExportClick = () => {
    if (!canExportReports) {
      notify.error('Permission denied', 'You do not have permission to export reports.');
      return;
    }
    setExportModalOpen(true);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!canExportReports) {
      notify.error('Permission denied', 'You do not have permission to export reports.');
      return { success: false };
    }
    const result = await exportReport(format);
    if (result.success) {
      toast({
        title: 'Report Downloaded',
        description: `Your ${format.toUpperCase()} report has been generated and downloaded.`,
      });
    }
    return result;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Role description
  const getRoleDescription = () => {
    if (isClientAdmin) return 'Global analytics across all agents and channels';
    if (roleName === 'Supervisor') return 'Team-level analytics for your agents';
    return 'Your personal performance metrics';
  };

  // Locked button helper
  const LockedButton = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
    <UITooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
          <Lock className="w-4 h-4 mr-2" />
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </UITooltip>
  );

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="text-sm text-muted-foreground">
              {getRoleDescription()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canViewGlobalAnalytics && (
              <>
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ChannelType)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {canExportReports ? (
              <Button onClick={handleExportClick}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            ) : (
              <LockedButton tooltip="Client Admin access required">
                Export
              </LockedButton>
            )}
          </div>
        </div>

        {/* Role-based info banners */}
        {roleName === 'Agent' && (
          <Alert>
            <User className="w-4 h-4" />
            <AlertDescription>
              You are viewing your personal performance metrics only. Team and global analytics are restricted.
            </AlertDescription>
          </Alert>
        )}

        {roleName === 'Supervisor' && (
          <Alert>
            <Users className="w-4 h-4" />
            <AlertDescription>
              You are viewing team-level analytics. Global metrics and report exports are restricted to Client Admin.
            </AlertDescription>
          </Alert>
        )}

        {/* === CLIENT ADMIN / SUPERVISOR: Global/Team Metrics === */}
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
                <p className="text-xs text-muted-foreground">Total Conversations</p>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardContent className="pt-4">
                <Clock className="w-5 h-5 text-warning" />
                <p className="text-2xl font-bold mt-2">{formatDuration(conversationMetrics.avgDuration)}</p>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardContent className="pt-4">
                <ThumbsUp className="w-5 h-5 text-success" />
                <p className="text-2xl font-bold mt-2">{conversationMetrics.resolutionRate}%</p>
                <p className="text-xs text-muted-foreground">Resolution Rate</p>
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
                <p className="text-xs text-muted-foreground">CSAT Score</p>
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
                <p className="text-xs text-muted-foreground">NPS Score</p>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardContent className="pt-4">
                <Users className="w-5 h-5 text-muted-foreground" />
                <p className="text-2xl font-bold mt-2">{conversationMetrics.handoffRate}%</p>
                <p className="text-xs text-muted-foreground">Handoff Rate</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* === AGENT: Personal Performance Metrics === */}
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

        {/* === CLIENT ADMIN: Full Charts === */}
        {canViewGlobalAnalytics && (
          <>
            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Conversation Trends */}
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="chat" stackId="1" stroke={COLORS.chat} fill={COLORS.chat} fillOpacity={0.6} name="Chat" />
                      <Area type="monotone" dataKey="voice" stackId="1" stroke={COLORS.voice} fill={COLORS.voice} fillOpacity={0.6} name="Voice" />
                      <Area type="monotone" dataKey="email" stackId="1" stroke={COLORS.email} fill={COLORS.email} fillOpacity={0.6} name="Email" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sentiment Trends */}
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }} 
                      />
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

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Channel Utilization */}
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Channel Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={channelPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
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

              {/* NPS Breakdown */}
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium">NPS Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={npsPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
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

              {/* CSAT Trend */}
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }} 
                      />
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

        {/* === AGENT: Personal Performance Card === */}
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

        {/* Agent Performance Table - Client Admin sees all, Supervisor sees team, Agent sees only self */}
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

      {/* Export Modal */}
      <ExportReportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
      />
    </AppLayout>
  );
}
