import { TrendingUp, TrendingDown, Mail, MousePointerClick, ArrowUpDown, Target } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  active: 'bg-success text-success-foreground',
  completed: 'bg-primary text-primary-foreground',
  draft: 'bg-secondary text-secondary-foreground',
  paused: 'bg-warning text-warning-foreground',
};

interface CampaignAnalyticsProps {
  campaignMetrics: CampaignMetrics;
}

export function CampaignAnalytics({ campaignMetrics }: CampaignAnalyticsProps) {
  const TrendBadge = ({ value }: { value: number }) => (
    <Badge variant="secondary" className={cn(
      'text-[10px]',
      value > 0 ? 'text-success' : value < 0 ? 'text-destructive' : 'text-muted-foreground'
    )}>
      {value > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : value < 0 ? <TrendingDown className="w-3 h-3 mr-0.5" /> : null}
      {value > 0 ? '+' : ''}{value}%
    </Badge>
  );

  const maxFunnel = campaignMetrics.funnelData[0]?.count || 1;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Mail className="w-5 h-5 text-primary" />
              <TrendBadge value={campaignMetrics.openRateTrend} />
            </div>
            <p className="text-2xl font-bold mt-2">{campaignMetrics.openRate}%</p>
            <p className="text-xs text-muted-foreground">Open Rate</p>
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
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaignMetrics.funnelData.map(stage => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-muted-foreground">{stage.count.toLocaleString()} ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all flex items-center justify-end pr-2"
                    style={{
                      width: `${(stage.count / maxFunnel) * 100}%`,
                      backgroundColor: stage.color,
                      minWidth: '40px',
                    }}
                  >
                    <span className="text-[10px] font-medium text-white">{stage.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={campaignMetrics.engagementOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Area type="monotone" dataKey="opens" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Opens" />
              <Area type="monotone" dataKey="clicks" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} name="Clicks" />
              <Area type="monotone" dataKey="conversions" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Sent</TableHead>
                <TableHead className="text-right">Opens</TableHead>
                <TableHead className="text-right">Open Rate</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignMetrics.campaigns.map(campaign => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize', statusColors[campaign.status])}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{campaign.sent.toLocaleString()}</TableCell>
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
                  <TableCell className="text-right">{campaign.conversions.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
