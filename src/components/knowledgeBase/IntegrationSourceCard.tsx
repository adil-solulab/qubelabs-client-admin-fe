import { MoreHorizontal, Play, Trash2, RefreshCw, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { IntegrationSource } from '@/types/knowledgeBase';
import { TRAINING_STATUS_LABELS, SYNC_FREQUENCY_LABELS } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

interface IntegrationSourceCardProps {
  source: IntegrationSource;
  onTrain: (source: IntegrationSource) => void;
  onDelete: (source: IntegrationSource) => void;
  onResync: (source: IntegrationSource) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function IntegrationSourceCard({ source, onTrain, onDelete, onResync, canEdit = true, canDelete = true }: IntegrationSourceCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3.5 h-3.5 text-success" />;
      case 'processing': return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 text-warning" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/30';
      case 'processing': return 'bg-primary/10 text-primary border-primary/30';
      case 'pending': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCrawlBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success';
      case 'crawling': return 'bg-primary/10 text-primary';
      case 'failed': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="gradient-card hover:shadow-glow transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl flex-shrink-0">
            {source.integrationIcon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{source.integrationName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{source.sourceType} &middot; {source.connectionDetails}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTrain(source)} disabled={!canEdit || source.status !== 'completed'}>
                    <Play className="w-4 h-4 mr-2" />
                    {source.trainingStatus === 'completed' ? 'Retrain' : 'Start Training'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onResync(source)} disabled={!canEdit}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-sync
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(source)} disabled={!canDelete}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn('text-xs gap-1', getCrawlBadge(source.status))}>
                {source.status === 'crawling' && <Loader2 className="w-3 h-3 animate-spin" />}
                {source.status === 'crawling'
                  ? `Importing ${source.itemsImported}/${source.totalItems}`
                  : source.status === 'completed'
                  ? `${source.itemsImported} items imported`
                  : source.status}
              </Badge>
              <Badge variant="outline" className={cn('gap-1', getStatusBadge(source.trainingStatus))}>
                {getStatusIcon(source.trainingStatus)}
                {TRAINING_STATUS_LABELS[source.trainingStatus]}
              </Badge>
              {source.syncFrequency !== 'manual' && (
                <Badge variant="secondary" className="text-xs">
                  Sync: {SYNC_FREQUENCY_LABELS[source.syncFrequency]}
                </Badge>
              )}
            </div>

            {source.trainingStatus === 'processing' && (
              <div className="mt-2">
                <Progress value={source.trainingProgress} className="h-1.5" />
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{source.size}</span>
              <span>{source.addedAt}</span>
              {source.lastSynced && <span>Last synced: {source.lastSynced}</span>}
              {source.tokensUsed ? <span>{source.tokensUsed.toLocaleString()} tokens</span> : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
