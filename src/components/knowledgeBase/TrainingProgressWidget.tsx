import { Brain, CheckCircle, Clock, Loader2, FileText, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { KnowledgeDocument } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

interface TrainingProgressWidgetProps {
  documents: KnowledgeDocument[];
}

export function TrainingProgressWidget({ documents }: TrainingProgressWidgetProps) {
  const trainingDocs = documents.filter(d => d.trainingStatus === 'processing');
  const completedDocs = documents.filter(d => d.trainingStatus === 'completed');
  const pendingDocs = documents.filter(d => d.trainingStatus === 'pending');
  
  const totalTokens = documents.reduce((sum, doc) => sum + (doc.tokensUsed || 0), 0);

  return (
    <Card className="gradient-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          Training Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="w-4 h-4 text-success" />
            </div>
            <p className="text-xl font-bold text-success">{completedDocs.length}</p>
            <p className="text-[10px] text-muted-foreground">Trained</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <p className="text-xl font-bold text-primary">{trainingDocs.length}</p>
            <p className="text-[10px] text-muted-foreground">In Progress</p>
          </div>
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/20 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-warning" />
            </div>
            <p className="text-xl font-bold text-warning">{pendingDocs.length}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Active Training */}
        {trainingDocs.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" />
              Currently Training
            </h4>
            {trainingDocs.map(doc => (
              <div key={doc.id} className="p-3 rounded-lg border bg-background/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium truncate">{doc.name}</span>
                  <span className="text-xs font-medium">{doc.trainingProgress}%</span>
                </div>
                <Progress value={doc.trainingProgress} className="h-1.5" />
              </div>
            ))}
          </div>
        )}

        {/* Token Usage */}
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Tokens Indexed</span>
            <span className="font-semibold">{totalTokens.toLocaleString()}</span>
          </div>
        </div>

        {/* Recent Completions */}
        {completedDocs.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground">Recently Trained</h4>
            <div className="space-y-1">
              {completedDocs.slice(0, 3).map(doc => (
                <div key={doc.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-success" />
                  <span className="truncate">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
