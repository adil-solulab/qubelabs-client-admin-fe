import { FileText, MoreHorizontal, Play, Trash2, History, RotateCcw, CheckCircle, Clock, Loader2, AlertCircle } from 'lucide-react';
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
import type { KnowledgeDocument } from '@/types/knowledgeBase';
import { FILE_TYPE_LABELS, TRAINING_STATUS_LABELS } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

interface DocumentCardProps {
  document: KnowledgeDocument;
  onTrain: (doc: KnowledgeDocument) => void;
  onDelete: (doc: KnowledgeDocument) => void;
  onViewHistory: (doc: KnowledgeDocument) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function DocumentCard({ 
  document, 
  onTrain, 
  onDelete, 
  onViewHistory,
  canEdit = true,
  canDelete = true,
}: DocumentCardProps) {
  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'docx': case 'doc': return '📝';
      case 'txt': return '📃';
      case 'md': return '📋';
      case 'csv': return '📊';
      case 'xlsx': return '📈';
      default: return '📁';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-3.5 h-3.5 text-success" />;
      case 'processing': return <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />;
      case 'pending': return <Clock className="w-3.5 h-3.5 text-warning" />;
      case 'failed': return <AlertCircle className="w-3.5 h-3.5 text-destructive" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success/10 text-success border-success/30';
      case 'processing': return 'bg-primary/10 text-primary border-primary/30';
      case 'pending': return 'bg-warning/10 text-warning border-warning/30';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="gradient-card hover:shadow-glow transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0">
            {getFileTypeIcon(document.fileType)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{document.name}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-xs font-mono uppercase">
                    .{document.fileType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {document.category}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onTrain(document)}
                    disabled={!canEdit}
                    className={!canEdit ? 'opacity-50' : ''}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {document.trainingStatus === 'completed' ? 'Retrain' : 'Start Training'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onViewHistory(document)}>
                    <History className="w-4 h-4 mr-2" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(document)}
                    disabled={!canDelete}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={cn('gap-1', getStatusBadge(document.trainingStatus))}>
                  {getStatusIcon(document.trainingStatus)}
                  {TRAINING_STATUS_LABELS[document.trainingStatus]}
                </Badge>
                {document.trainingStatus === 'processing' && (
                  <span className="text-xs font-medium">{document.trainingProgress}%</span>
                )}
              </div>
              
              {document.trainingStatus === 'processing' && (
                <Progress value={document.trainingProgress} className="h-1.5" />
              )}
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{document.size}</span>
              <span>v{document.versions[0]?.version || '1.0'}</span>
              <span>{document.uploadedAt}</span>
            </div>

            {document.trainingStatus === 'completed' && document.tokensUsed && (
              <div className="mt-2 text-xs text-muted-foreground">
                {document.tokensUsed.toLocaleString()} tokens indexed
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
