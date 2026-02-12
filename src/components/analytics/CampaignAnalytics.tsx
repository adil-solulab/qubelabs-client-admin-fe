import {
  TrendingUp,
  TrendingDown,
  Mail,
  MousePointerClick,
  ArrowUpDown,
  Target,
  BarChart3,
  Send,
  Users,
  CheckCircle2,
  Trophy,
  Zap,
  Eye,
  UserMinus,
} from 'lucide-react';
import {
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
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { CampaignMetrics } from '@/types/analytics';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

const statusColors: Record<string, string> = {
  active: 'bg-success/15 text-success border-success/30',
  completed: 'bg-primary/15 text-primary border-primary/30',
  draft: 'bg-muted text-muted-foreground border-border',
  paused: 'bg-warning/15 text-warning border-warning/30',
};

interface CampaignAnalyticsProps {
  campaignMetrics: CampaignMetrics;
}

export function CampaignAnalytics({ campaignMetrics }: CampaignAnalyticsProps) {
  const TrendBadge = ({ value }: { value: number }) => (
    <Badge variant="secondary" className={cn(
      'text-[10px] gap-0.5',
      value > 0 ? 'text-success' : value < 0 ? 'text-destructive' : 'text-muted-foreground'
    )}>
      {value > 0 ? <TrendingUp className="w-3 h-3" /> : value < 0 ? <TrendingDown className="w-3 h-3" /> : null}
      {value > 0 ? '+' : ''}{value}%
    </Badge>
  );

  const maxFunnel = campaignMetrics.funnelData[0]?.count || 1;

  const completedCampaigns = campaignMetrics.campaigns.filter(c => c.status === 'completed').length;
  const activeCampaigns = campaignMetrics.campaigns.filter(c => c.status === 'active').length;
  const totalDelivered = campaignMetrics.campaigns.reduce((sum, c) => sum + c.delivered, 0);
  const deliveryRate = campaignMetrics.totalSent > 0
    ? ((totalDelivered / campaignMetrics.totalSent) * 100).toFixed(1)
    : '0';
  const totalConversions = campaignMetrics.campaigns.reduce((sum, c) => sum + c.conversions, 0);

  const successScore = Math.round(
    (campaignMetrics.openRate * 0.3) +
    (campaignMetrics.clickThroughRate * 1.5) +
    (campaignMetrics.conversionRate * 2.0) +
    ((100 - campaignMetrics.bounceRate) * 0.15) +
    ((100 - campaignMetrics.unsubscribeRate * 10) * 0.05)
  );
  const clampedScore = Math.min(100, Math.max(0, successScore));

  const scoreColor = clampedScore >= 75 ? 'text-success' : clampedScore >= 50 ? 'text-warning' : 'text-destructive';
  const scoreLabel = clampedScore >= 75 ? 'Excellent' : clampedScore >= 50 ? 'Good' : 'Needs Improvement';
  const scoreRingColor = clampedScore >= 75 ? '#22c55e' : clampedScore >= 50 ? '#f59e0b' : '#ef4444';

  const scoreBreakdown = [
    { label: 'Open Rate', weight: 30, actual: Math.round(campaignMetrics.openRate * 0.3), color: '#3b82f6' },
    { label: 'CTR Impact', weight: 20, actual: Math.round(campaignMetrics.clickThroughRate * 1.5), color: '#22c55e' },
    { label: 'Conversions', weight: 25, actual: Math.round(campaignMetrics.conversionRate * 2.0), color: '#f59e0b' },
    { label: 'Deliverability', weight: 15, actual: Math.round((100 - campaignMetrics.bounceRate) * 0.15), color: '#8b5cf6' },
    { label: 'Retention', weight: 10, actual: Math.round((100 - campaignMetrics.unsubscribeRate * 10) * 0.05), color: '#06b6d4' },
  ];

  const engagementTotalOpens = campaignMetrics.engagementOverTime.reduce((s, d) => s + d.opens, 0);
  const engagementTotalClicks = campaignMetrics.engagementOverTime.reduce((s, d) => s + d.clicks, 0);
  const engagementTotalConversions = campaignMetrics.engagementOverTime.reduce((s, d) => s + d.conversions, 0);
  const avgOpensPerDay = Math.round(engagementTotalOpens / (campaignMetrics.engagementOverTime.length || 1));
  const avgClicksPerDay = Math.round(engagementTotalClicks / (campaignMetrics.engagementOverTime.length || 1));
  const clickToOpenRate = engagementTotalOpens > 0
    ? ((engagementTotalClicks / engagementTotalOpens) * 100).toFixed(1)
    : '0';

  const campaignBarData = campaignMetrics.campaigns
    .filter(c => c.sent > 0)
    .map(c => ({
      name: c.name.length > 18 ? c.name.substring(0, 18) + '...' : c.name,
      'Open Rate': c.openRate,
      CTR: c.ctr,
    }));

  return (
    <div className="space-y-6">
      <Card className="gradient-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Campaign Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Send className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{campaignMetrics.totalCampaigns}</p>
              <p className="text-[11px] text-muted-foreground">Total Campaigns</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Zap className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-xl font-bold">{activeCampaigns}</p>
              <p className="text-[11px] text-muted-foreground">Active</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <CheckCircle2 className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold">{completedCampaigns}</p>
              <p className="text-[11px] text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Users className="w-4 h-4 text-warning mx-auto mb-1" />
              <p className="text-xl font-bold">{campaignMetrics.totalSent.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Total Sent</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <Target className="w-4 h-4 text-destructive mx-auto mb-1" />
              <p className="text-xl font-bold">{totalConversions.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Conversions</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/40">
              <TrendingUp className="w-4 h-4 text-success mx-auto mb-1" />
              <p className="text-xl font-bold">${(campaignMetrics.revenue / 1000).toFixed(1)}k</p>
              <p className="text-[11px] text-muted-foreground">Revenue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Mail className="w-5 h-5 text-primary" />
              <TrendBadge value={campaignMetrics.openRateTrend} />
            </div>
            <p className="text-2xl font-bold mt-2">{campaignMetrics.openRate}%</p>
            <p className="text-xs text-muted-foreground">Open Rate</p>
            <Progress value={campaignMetrics.openRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <MousePointerClick className="w-5 h-5 text-success" />
              <TrendBadge value={campaignMetrics.ctrTrend} />
            </div>
            <p className="text-2xl font-bold mt-2">{campaignMetrics.clickThroughRate}%</p>
            <p className="text-xs text-muted-foreground">Click-Through Rate</p>
            <Progress value={campaignMetrics.clickThroughRate * 3} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <ArrowUpDown className="w-5 h-5 text-warning" />
              <TrendBadge value={campaignMetrics.bounceRateTrend} />
            </div>
            <p className="text-2xl font-bold mt-2">{campaignMetrics.bounceRate}%</p>
            <p className="text-xs text-muted-foreground">Bounce Rate</p>
            <Progress value={campaignMetrics.bounceRate * 10} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-destructive" />
              <TrendBadge value={campaignMetrics.conversionTrend} />
            </div>
            <p className="text-2xl font-bold mt-2">{campaignMetrics.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
            <Progress value={campaignMetrics.conversionRate * 5} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning" />
              Campaign Success Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke={scoreRingColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${clampedScore * 2.64} ${264 - clampedScore * 2.64}`}
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={cn('text-3xl font-bold', scoreColor)}>{clampedScore}</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{scoreLabel}</span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-2.5">
                {scoreBreakdown.map(item => (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.actual} pts</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (item.actual / item.weight) * 100)}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {campaignMetrics.funnelData.map((stage, i) => {
                const prevStage = i > 0 ? campaignMetrics.funnelData[i - 1] : null;
                const dropoff = prevStage
                  ? ((1 - stage.count / prevStage.count) * 100).toFixed(1)
                  : null;

                return (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <div className="flex items-center gap-2">
                        {dropoff && (
                          <span className="text-[10px] text-destructive">-{dropoff}%</span>
                        )}
                        <span className="text-muted-foreground">
                          {stage.count.toLocaleString()} ({stage.percentage}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                        style={{
                          width: `${(stage.count / maxFunnel) * 100}%`,
                          backgroundColor: stage.color,
                          minWidth: '36px',
                        }}
                      >
                        <span className="text-[9px] font-medium text-white">{stage.percentage}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Engagement Summary
            </CardTitle>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Delivery Rate: <strong className="text-foreground">{deliveryRate}%</strong></span>
              <span>Unsub Rate: <strong className="text-foreground">{campaignMetrics.unsubscribeRate}%</strong></span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-lg font-bold text-blue-500">{engagementTotalOpens.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Total Opens</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-lg font-bold text-green-500">{engagementTotalClicks.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Total Clicks</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-lg font-bold text-amber-500">{engagementTotalConversions.toLocaleString()}</p>
              <p className="text-[11px] text-muted-foreground">Total Conversions</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <p className="text-lg font-bold text-purple-500">{avgOpensPerDay}/day</p>
              <p className="text-[11px] text-muted-foreground">Avg Opens</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <p className="text-lg font-bold text-cyan-500">{clickToOpenRate}%</p>
              <p className="text-[11px] text-muted-foreground">Click-to-Open</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={campaignMetrics.engagementOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="opens" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} name="Opens" />
              <Area type="monotone" dataKey="clicks" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.5} name="Clicks" />
              <Area type="monotone" dataKey="conversions" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Campaign Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={campaignBarData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={110} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="Open Rate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="CTR" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <UserMinus className="w-4 h-4 text-muted-foreground" />
              Delivery & Attrition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Rate</span>
                  <span className="font-medium text-success">{deliveryRate}%</span>
                </div>
                <Progress value={parseFloat(deliveryRate)} className="h-2.5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Open Rate</span>
                  <span className="font-medium text-primary">{campaignMetrics.openRate}%</span>
                </div>
                <Progress value={campaignMetrics.openRate} className="h-2.5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Click-Through Rate</span>
                  <span className="font-medium text-success">{campaignMetrics.clickThroughRate}%</span>
                </div>
                <Progress value={campaignMetrics.clickThroughRate * 3} className="h-2.5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bounce Rate</span>
                  <span className="font-medium text-warning">{campaignMetrics.bounceRate}%</span>
                </div>
                <Progress value={campaignMetrics.bounceRate * 10} className="h-2.5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Unsubscribe Rate</span>
                  <span className="font-medium text-destructive">{campaignMetrics.unsubscribeRate}%</span>
                </div>
                <Progress value={campaignMetrics.unsubscribeRate * 20} className="h-2.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Campaign Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Delivered</TableHead>
                <TableHead className="text-right">Opens</TableHead>
                <TableHead className="text-right">Open Rate</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignMetrics.campaigns.map(campaign => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('capitalize text-[10px]', statusColors[campaign.status])}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{campaign.sent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{campaign.delivered.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{campaign.opens.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-medium',
                      campaign.openRate >= 40 ? 'text-success' : campaign.openRate >= 30 ? 'text-warning' : 'text-destructive'
                    )}>
                      {campaign.openRate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      'font-medium',
                      campaign.ctr >= 12 ? 'text-success' : campaign.ctr >= 10 ? 'text-warning' : 'text-destructive'
                    )}>
                      {campaign.ctr}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{campaign.conversions.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
