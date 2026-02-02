import { Phone, MessageSquare, Mail, Clock, Bot, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-primary shadow-glow',
        conversation.sentiment === 'escalated' && 'border-destructive/50'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={cn(sentiment.bgColor, sentiment.color)}>
                {conversation.customerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
              channel.color,
              'bg-background border-2 border-background'
            )}>
              {getChannelIcon()}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold truncate">{conversation.customerName}</p>
              <Badge variant="outline" className={cn('text-[10px] shrink-0', status.color)}>
                {status.label}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {conversation.topic}
            </p>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Sentiment */}
              <Badge variant="secondary" className={cn('text-[10px] gap-1', sentiment.bgColor, sentiment.color)}>
                <span>{sentiment.icon}</span>
                {sentiment.label}
              </Badge>

              {/* Agent */}
              <Badge variant="outline" className="text-[10px] gap-1">
                {conversation.isAiHandled ? (
                  <Bot className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
                {conversation.agentName || 'Waiting'}
              </Badge>

              {/* Duration / Wait Time */}
              <Badge variant="outline" className="text-[10px] gap-1">
                <Clock className="w-3 h-3" />
                {conversation.status === 'waiting' 
                  ? `Wait: ${formatDuration(conversation.waitTime || 0)}`
                  : formatDuration(conversation.duration)
                }
              </Badge>
            </div>

            {/* Supervisor Mode Indicator */}
            {conversation.supervisorMode && (
              <div className="mt-2">
                <Badge className={cn(
                  'text-[10px]',
                  conversation.supervisorMode === 'monitoring' && 'bg-blue-500',
                  conversation.supervisorMode === 'whispering' && 'bg-purple-500',
                  conversation.supervisorMode === 'barged_in' && 'bg-warning'
                )}>
                  {conversation.supervisorMode === 'monitoring' && '👁️ Monitoring'}
                  {conversation.supervisorMode === 'whispering' && '🔇 Whispering'}
                  {conversation.supervisorMode === 'barged_in' && '🎙️ Barged In'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
