import { Phone, MessageSquare, Mail, Clock, Bot, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { LiveConversation } from '@/types/liveOps';
import { SENTIMENT_CONFIG, CHANNEL_CONFIG, STATUS_CONFIG } from '@/types/liveOps';
import { cn } from '@/lib/utils';

interface ConversationCardProps {
  conversation: LiveConversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationCard({ conversation, isSelected, onClick }: ConversationCardProps) {
  const sentiment = SENTIMENT_CONFIG[conversation.sentiment];
  const channel = CHANNEL_CONFIG[conversation.channel];
  const status = STATUS_CONFIG[conversation.status];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getChannelIcon = () => {
    switch (conversation.channel) {
      case 'voice': return <Phone className="w-3.5 h-3.5" />;
      case 'chat': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'email': return <Mail className="w-3.5 h-3.5" />;
    }
  };

  const statusColor = cn(
    conversation.status === 'active' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
    conversation.status === 'waiting' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    conversation.status === 'ended' && 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
    conversation.status === 'resolved' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    conversation.status === 'missed' && 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  );

  return (
    <>
      <div
        className={cn(
          'hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 items-center px-5 py-3.5 cursor-pointer transition-colors',
          isSelected
            ? 'bg-primary/5 border-l-2 border-l-primary'
            : 'hover:bg-muted/50 border-l-2 border-l-transparent',
          conversation.sentiment === 'escalated' && !isSelected && 'bg-destructive/[0.03]',
          conversation.status === 'ended' && 'opacity-50'
        )}
        onClick={onClick}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {conversation.customerName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-medium truncate">{conversation.customerName}</p>
              {conversation.slaBreached && (
                <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 shrink-0 animate-pulse">
                  SLA
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{conversation.topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          {conversation.isAiHandled ? (
            <Bot className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          )}
          <span className="text-sm truncate">{conversation.agentName || 'Waiting...'}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={cn('shrink-0', channel.color)}>{getChannelIcon()}</span>
          <span className="text-sm capitalize">{conversation.channel}</span>
        </div>

        <div>
          <Badge variant="secondary" className={cn('text-[10px] gap-1 font-normal', sentiment.bgColor, sentiment.color)}>
            <span className="text-xs">{sentiment.icon}</span>
            {sentiment.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          {conversation.status === 'waiting'
            ? formatDuration(conversation.waitTime || 0)
            : formatDuration(conversation.duration)
          }
        </div>

        <div className="flex justify-end">
          <Badge variant="outline" className={cn('text-[10px] font-medium border', statusColor)}>
            {status.label}
          </Badge>
        </div>
      </div>

      <div
        className={cn(
          'md:hidden px-4 py-3 cursor-pointer transition-colors',
          isSelected
            ? 'bg-primary/5 border-l-2 border-l-primary'
            : 'hover:bg-muted/50 border-l-2 border-l-transparent',
          conversation.sentiment === 'escalated' && !isSelected && 'bg-destructive/[0.03]',
          conversation.status === 'ended' && 'opacity-50'
        )}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <Avatar className="h-9 w-9 shrink-0 mt-0.5">
            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
              {conversation.customerName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="text-sm font-medium truncate">{conversation.customerName}</p>
                {conversation.slaBreached && (
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 shrink-0 animate-pulse">
                    SLA
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className={cn('text-[10px] font-medium border shrink-0', statusColor)}>
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{conversation.topic}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <span className={cn(channel.color)}>{getChannelIcon()}</span>
                <span className="capitalize">{conversation.channel}</span>
              </span>
              <span className="flex items-center gap-1">
                {conversation.isAiHandled ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {conversation.agentName || 'Waiting'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {conversation.status === 'waiting'
                  ? formatDuration(conversation.waitTime || 0)
                  : formatDuration(conversation.duration)
                }
              </span>
              <Badge variant="secondary" className={cn('text-[10px] gap-0.5 font-normal', sentiment.bgColor, sentiment.color)}>
                <span className="text-[10px]">{sentiment.icon}</span>
                {sentiment.label}
              </Badge>
            </div>
          </div>
        </div>
        {conversation.supervisorMode && (
          <div className="mt-2 ml-12">
            <Badge className={cn(
              'text-[10px]',
              conversation.supervisorMode === 'monitoring' && 'bg-secondary text-secondary-foreground',
              conversation.supervisorMode === 'whispering' && 'bg-accent text-accent-foreground',
              conversation.supervisorMode === 'barged_in' && 'bg-warning text-warning-foreground'
            )}>
              {conversation.supervisorMode === 'monitoring' && 'Monitoring'}
              {conversation.supervisorMode === 'whispering' && 'Whispering'}
              {conversation.supervisorMode === 'barged_in' && 'Barged In'}
            </Badge>
          </div>
        )}
      </div>
    </>
  );
}
