import { Mic, Brain } from 'lucide-react';
import {
  LineChart,
  Line,
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
import { cn } from '@/lib/utils';
import type { SpeechAnalytics, SentimentDataPoint } from '@/types/analytics';

const COLORS = {
  positive: '#22c55e',
  neutral: '#6b7280',
  negative: '#f59e0b',
  escalated: '#ef4444',
};

const EMOTION_COLORS = ['#3b82f6', '#6b7280', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6'];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--background))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
};

interface SentimentSpeechTabProps {
  speechAnalytics: SpeechAnalytics;
  sentimentTrends: SentimentDataPoint[];
}

export function SentimentSpeechTab({ speechAnalytics, sentimentTrends }: SentimentSpeechTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <Mic className="w-5 h-5 text-primary" />
            <p className="text-2xl font-bold mt-2">{speechAnalytics.totalUtterances.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Utterances</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <Brain className="w-5 h-5 text-success" />
            <p className="text-2xl font-bold mt-2">{speechAnalytics.avgConfidence}%</p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <Mic className="w-5 h-5 text-warning" />
            <p className="text-2xl font-bold mt-2">{speechAnalytics.speechToTextAccuracy}%</p>
            <p className="text-xs text-muted-foreground">Speech-to-Text Accuracy</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Sentiment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={speechAnalytics.sentimentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="label"
                  >
                    {speechAnalytics.sentimentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Sentiment Over Time</CardTitle>
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
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Top Intents</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speechAnalytics.topIntents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="intent" type="category" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium">Emotion Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={speechAnalytics.emotionDetection}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="emotion" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                  {speechAnalytics.emotionDetection.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={EMOTION_COLORS[index % EMOTION_COLORS.length]} />
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
