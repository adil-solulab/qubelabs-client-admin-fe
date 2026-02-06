import { format, formatDistanceToNow } from 'date-fns';
import {
  Phone,
  Clock,
  User,
  RotateCcw,
  Play,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CallbackRequest, STATUS_CONFIG, PRIORITY_CONFIG } from '@/types/callback';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CallbackCardProps {
  callback: CallbackRequest;
  onAccept?: () => void;
  onReject?: () => void;
  onRetry?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function CallbackCard({
  callback,
  onAccept,
  onReject,
  onRetry,
  onStart,
  onComplete,
  onCancel,
  isLoading = false,
  showActions = true,
  compact = false,
}: CallbackCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  
  const status = STATUS_CONFIG[callback.status];
  const priority = PRIORITY_CONFIG[callback.priority];

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getWaitDuration = () => {
    const created = new Date(callback.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - created.getTime();
    return Math.round(diffMs / 60000);
  };

  return (
    <Card className={cn(
      'gradient-card card-interactive animate-list-item-in',
      callback.priority === 'urgent' && 'border-destructive/50 animate-pulse-soft',
      callback.priority === 'high' && 'border-warning/50',
      isLoading && 'loading-shimmer'
    )}>
      <CardContent className={cn('pt-4', compact && 'pb-3')}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              status.bgColor
            )}>
              <span className="text-lg">{status.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold truncate">{callback.customerName}</h4>
                <Badge className={cn('text-[10px]', priority.bgColor, priority.color)}>
                  {priority.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{callback.customerPhone}</p>
            </div>
          </div>

          <Badge variant="outline" className={cn('text-[10px] flex-shrink-0', status.color)}>
            {status.label}
          </Badge>
        </div>

        {/* Reason */}
        <div className="mt-3 p-2 rounded-lg bg-muted/50">
          <p className="text-sm line-clamp-2">{callback.reason}</p>
        </div>

        {/* Meta Info */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {callback.queuePosition > 0 && (
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">#{callback.queuePosition}</span>
              in queue
            </div>
          )}
          
          {callback.status === 'pending' && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Est. {formatWaitTime(callback.estimatedWaitTime)}
            </div>
          )}

          {callback.status === 'scheduled' && callback.scheduledTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(callback.scheduledTime), 'PPp')}
            </div>
          )}

          <div className="flex items-center gap-1">
            Waiting {formatWaitTime(getWaitDuration())}
          </div>

          {callback.retryCount > 0 && (
            <div className="flex items-center gap-1 text-warning">
              <RotateCcw className="w-3 h-3" />
              Retry {callback.retryCount}/{callback.maxRetries}
            </div>
          )}

          {callback.assignedAgentName && (
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {callback.assignedAgentName}
            </div>
          )}
        </div>

        {/* Notes Collapsible */}
        {callback.notes.length > 0 && !compact && (
          <Collapsible open={showNotes} onOpenChange={setShowNotes} className="mt-3">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between h-7 text-xs">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {callback.notes.length} note{callback.notes.length > 1 ? 's' : ''}
                </span>
                {showNotes ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-2">
              {callback.notes.slice(-3).map(note => (
                <div
                  key={note.id}
                  className={cn(
                    'p-2 rounded text-xs',
                    note.type === 'retry' && 'bg-warning/10 border border-warning/20',
                    note.type === 'system' && 'bg-muted/50',
                    note.type === 'agent' && 'bg-primary/10'
                  )}
                >
                  <p>{note.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {note.createdBy} • {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {callback.status === 'notified' && (
              <>
                <Button
                  size="sm"
                  className="flex-1 btn-press transition-all duration-200"
                  onClick={onAccept}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Check className="w-3 h-3 mr-1" />}
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="btn-press transition-all duration-200"
                  onClick={onReject}
                  disabled={isLoading}
                >
                  <X className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              </>
            )}

            {callback.status === 'accepted' && (
              <Button
                size="sm"
                className="flex-1 bg-success hover:bg-success/90"
                onClick={onStart}
                disabled={isLoading}
              >
                <Phone className="w-3 h-3 mr-1" />
                Start Call
              </Button>
            )}

            {callback.status === 'in_progress' && (
              <Button
                size="sm"
                className="flex-1"
                onClick={onComplete}
                disabled={isLoading}
              >
                <Check className="w-3 h-3 mr-1" />
                Complete
              </Button>
            )}

            {callback.status === 'failed' && callback.retryCount < callback.maxRetries && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onRetry}
                disabled={isLoading}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Retry Callback
              </Button>
            )}

            {['pending', 'scheduled', 'notified'].includes(callback.status) && onCancel && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
