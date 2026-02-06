import { useState } from 'react';
import {
  Star,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SurveyStats, SurveyResponse } from '@/types/surveys';
import { FeedbackSummaryCard } from './FeedbackSummaryCard';
import { cn } from '@/lib/utils';

interface SurveyDashboardProps {
  stats: SurveyStats;
  responses: SurveyResponse[];
  isLoading?: boolean;
}

export function SurveyDashboard({
  stats,
  responses,
  isLoading = false,
}: SurveyDashboardProps) {
  const [activeTab, setActiveTab] = useState('all');

  const completedResponses = responses
    .filter(r => r.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.sentAt).getTime() - new Date(a.completedAt || a.sentAt).getTime());

  const positiveResponses = completedResponses.filter(r => r.aiSummary?.sentiment === 'positive');
  const neutralResponses = completedResponses.filter(r => r.aiSummary?.sentiment === 'neutral');
  const negativeResponses = completedResponses.filter(r => r.aiSummary?.sentiment === 'negative');

  const getNPSColor = (score: number) => {
    if (score >= 50) return 'text-success';
    if (score >= 0) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.totalCompleted}</p>
                <p className="text-[10px] text-muted-foreground">Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.responseRate}%</p>
                <p className="text-[10px] text-muted-foreground">Response Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.averageCsat}</p>
                <p className="text-[10px] text-muted-foreground">Avg CSAT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className={cn("text-xl font-bold", getNPSColor(stats.npsScore))}>
                  {stats.npsScore > 0 ? '+' : ''}{stats.npsScore}
                </p>
                <p className="text-[10px] text-muted-foreground">NPS Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <ThumbsUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.promoters}</p>
                <p className="text-[10px] text-muted-foreground">Promoters</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-xl font-bold">{stats.pendingEscalations}</p>
                <p className="text-[10px] text-muted-foreground">Escalations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NPS Breakdown */}
      <Card className="gradient-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            NPS Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-success" />
                    Promoters (9-10)
                  </span>
                  <span className="font-medium">{stats.promoters}</span>
                </div>
                <Progress value={(stats.promoters / Math.max(stats.totalCompleted, 1)) * 100} className="h-2 bg-muted [&>div]:bg-success" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Minus className="w-4 h-4 text-warning" />
                    Passives (7-8)
                  </span>
                  <span className="font-medium">{stats.passives}</span>
                </div>
                <Progress value={(stats.passives / Math.max(stats.totalCompleted, 1)) * 100} className="h-2 bg-muted [&>div]:bg-warning" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-destructive" />
                    Detractors (0-6)
                  </span>
                  <span className="font-medium">{stats.detractors}</span>
                </div>
                <Progress value={(stats.detractors / Math.max(stats.totalCompleted, 1)) * 100} className="h-2 bg-muted [&>div]:bg-destructive" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback */}
      <Card className="gradient-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recent Feedback
              </CardTitle>
              <CardDescription>AI-analyzed survey responses</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">
                All ({completedResponses.length})
              </TabsTrigger>
              <TabsTrigger value="positive" className="gap-1">
                <ThumbsUp className="w-3 h-3" />
                Positive ({positiveResponses.length})
              </TabsTrigger>
              <TabsTrigger value="neutral" className="gap-1">
                <Minus className="w-3 h-3" />
                Neutral ({neutralResponses.length})
              </TabsTrigger>
              <TabsTrigger value="negative" className="gap-1">
                <ThumbsDown className="w-3 h-3" />
                Negative ({negativeResponses.length})
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[400px] pr-4">
              <TabsContent value="all" className="mt-0 space-y-3">
                {completedResponses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Star className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">No responses yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Survey responses will appear here
                    </p>
                  </div>
                ) : (
                  completedResponses.map(response => (
                    <FeedbackSummaryCard key={response.id} response={response} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="positive" className="mt-0 space-y-3">
                {positiveResponses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <ThumbsUp className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No positive feedback yet</p>
                  </div>
                ) : (
                  positiveResponses.map(response => (
                    <FeedbackSummaryCard key={response.id} response={response} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="neutral" className="mt-0 space-y-3">
                {neutralResponses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Minus className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">No neutral feedback yet</p>
                  </div>
                ) : (
                  neutralResponses.map(response => (
                    <FeedbackSummaryCard key={response.id} response={response} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="negative" className="mt-0 space-y-3">
                {negativeResponses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-success mb-4" />
                    <h3 className="font-semibold mb-1">No negative feedback!</h3>
                    <p className="text-sm text-muted-foreground">All customers are happy</p>
                  </div>
                ) : (
                  negativeResponses.map(response => (
                    <FeedbackSummaryCard key={response.id} response={response} />
                  ))
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
