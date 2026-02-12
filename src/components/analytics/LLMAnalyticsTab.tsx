import { Bot, Zap, Clock, Target, Coins, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
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
import type { LLMAnalytics } from '@/types/analytics';

const COLORS = {
  input: '#3b82f6',
  output: '#22c55e',
  accuracy: '#8b5cf6',
};

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

interface LLMAnalyticsTabProps {
  llmAnalytics: LLMAnalytics;
}

export function LLMAnalyticsTab({ llmAnalytics }: LLMAnalyticsTabProps) {
  const formatTokens = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <Bot className="w-5 h-5 text-primary" />
            <p className="text-2xl font-bold mt-2">{llmAnalytics.totalPrompts.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Prompts</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Zap className="w-5 h-5 text-success" />
              <Badge variant="secondary" className={cn(
                'text-[10px]',
                llmAnalytics.successRateTrend > 0 ? 'text-success' : 'text-destructive'
              )}>
                {llmAnalytics.successRateTrend > 0 ? '+' : ''}{llmAnalytics.successRateTrend}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{llmAnalytics.promptSuccessRate}%</p>
            <p className="text-xs text-muted-foreground">Success Rate</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Clock className="w-5 h-5 text-warning" />
              <Badge variant="secondary" className={cn(
                'text-[10px]',
                llmAnalytics.responseTimeTrend < 0 ? 'text-success' : 'text-destructive'
              )}>
                {llmAnalytics.responseTimeTrend}s
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{llmAnalytics.avgResponseTime}s</p>
            <p className="text-xs text-muted-foreground">Avg Response Time</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <Target className="w-5 h-5 text-primary" />
              <Badge variant="secondary" className={cn(
                'text-[10px]',
                llmAnalytics.accuracyTrend > 0 ? 'text-success' : 'text-destructive'
              )}>
                {llmAnalytics.accuracyTrend > 0 ? '+' : ''}{llmAnalytics.accuracyTrend}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{llmAnalytics.responseAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <BarChart3 className="w-5 h-5 text-muted-foreground" />
            <p className="text-2xl font-bold mt-2">{formatTokens(llmAnalytics.totalTokensUsed)}</p>
            <p className="text-xs text-muted-foreground">Token Usage</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <Coins className="w-5 h-5 text-warning" />
            <p className="text-2xl font-bold mt-2">${llmAnalytics.costEstimate.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Estimated Cost</p>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Model Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Requests</TableHead>
                <TableHead className="text-right">Tokens</TableHead>
                <TableHead>Usage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {llmAnalytics.modelUsage.map(model => (
                <TableRow key={model.model}>
                  <TableCell className="font-medium">{model.model}</TableCell>
                  <TableCell className="text-right">{model.requests.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{formatTokens(model.tokens)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={model.percentage} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">{model.percentage}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Token Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={llmAnalytics.tokenUsageOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => formatTokens(v)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => formatTokens(value)} />
                <Legend />
                <Area type="monotone" dataKey="input" stackId="1" stroke={COLORS.input} fill={COLORS.input} fillOpacity={0.6} name="Input Tokens" />
                <Area type="monotone" dataKey="output" stackId="1" stroke={COLORS.output} fill={COLORS.output} fillOpacity={0.6} name="Output Tokens" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Accuracy Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={llmAnalytics.accuracyOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[80, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="value" stroke={COLORS.accuracy} strokeWidth={2} dot={false} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Prompt Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead>Success Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {llmAnalytics.promptCategories.map(cat => (
                <TableRow key={cat.category}>
                  <TableCell className="font-medium">{cat.category}</TableCell>
                  <TableCell className="text-right">{cat.count.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={cat.successRate} className="w-24 h-2" />
                      <span className={cn(
                        'text-sm font-medium',
                        cat.successRate >= 95 ? 'text-success' : cat.successRate >= 90 ? 'text-warning' : 'text-destructive'
                      )}>
                        {cat.successRate}%
                      </span>
                    </div>
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
