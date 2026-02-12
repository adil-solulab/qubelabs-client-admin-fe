import { FileText, TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
import type { TranscriptionAnalytics } from '@/types/analytics';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

const sentimentColors: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#f59e0b',
};

interface TranscriptionTabProps {
  transcriptionAnalytics: TranscriptionAnalytics;
}

export function TranscriptionTab({ transcriptionAnalytics }: TranscriptionTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <FileText className="w-5 h-5 text-primary" />
            <p className="text-2xl font-bold mt-2">{transcriptionAnalytics.totalTranscriptions.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Transcriptions</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="w-5 h-5 text-success" />
              <Badge variant="secondary" className={cn(
                'text-[10px]',
                transcriptionAnalytics.accuracyTrend > 0 ? 'text-success' : 'text-destructive'
              )}>
                {transcriptionAnalytics.accuracyTrend > 0 ? '+' : ''}{transcriptionAnalytics.accuracyTrend}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{transcriptionAnalytics.avgAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Avg Accuracy</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <Badge variant="secondary" className={cn(
                'text-[10px]',
                transcriptionAnalytics.errorRateTrend < 0 ? 'text-success' : 'text-destructive'
              )}>
                {transcriptionAnalytics.errorRateTrend}%
              </Badge>
            </div>
            <p className="text-2xl font-bold mt-2">{transcriptionAnalytics.errorRate}%</p>
            <p className="text-xs text-muted-foreground">Error Rate</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <p className="text-2xl font-bold mt-2">{transcriptionAnalytics.avgProcessingTime}s</p>
            <p className="text-xs text-muted-foreground">Avg Processing Time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Accuracy Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={transcriptionAnalytics.accuracyOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[85, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} name="Accuracy %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Language Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Language</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead>Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transcriptionAnalytics.languageBreakdown.map(lang => (
                  <TableRow key={lang.language}>
                    <TableCell className="font-medium">{lang.language}</TableCell>
                    <TableCell className="text-right">{lang.count.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={lang.accuracy} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">{lang.accuracy}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {transcriptionAnalytics.topKeywords.map(kw => (
                <Badge
                  key={kw.keyword}
                  variant="outline"
                  className="text-sm py-1 px-3"
                  style={{ borderColor: sentimentColors[kw.sentiment], color: sentimentColors[kw.sentiment] }}
                >
                  {kw.keyword}
                  <span className="ml-1 text-xs opacity-70">({kw.count})</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base font-medium">Error Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={transcriptionAnalytics.errorCategories} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={130} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
