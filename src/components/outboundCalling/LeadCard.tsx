import { Phone, Clock, UserPlus, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Lead } from '@/types/outboundCalling';
import { LEAD_STATUS_CONFIG, SENTIMENT_CONFIG } from '@/types/outboundCalling';
import { cn } from '@/lib/utils';

interface LeadCardProps {
  lead: Lead;
  onEscalate: () => void;
}

export function LeadCard({ lead, onEscalate }: LeadCardProps) {
  const statusConfig = LEAD_STATUS_CONFIG[lead.status];
  const sentimentConfig = lead.sentiment ? SENTIMENT_CONFIG[lead.sentiment] : null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className={cn(
      'gradient-card transition-all hover:shadow-md',
      lead.status === 'calling' && 'ring-2 ring-primary animate-pulse',
      lead.status === 'escalated' && 'border-purple-500/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium',
              statusConfig.bgColor, statusConfig.color
            )}>
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            {lead.status === 'calling' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Phone className="w-2.5 h-2.5 text-primary-foreground animate-pulse" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold truncate">{lead.name}</p>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className={cn('text-[10px]', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEscalate}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Escalate to Agent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <span>{lead.company}</span>
              <span>•</span>
              <span>{lead.phone}</span>
            </div>

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Sentiment */}
              {sentimentConfig && (
                <Badge variant="secondary" className={cn('text-[10px] gap-1', sentimentConfig.bgColor, sentimentConfig.color)}>
                  <span>{sentimentConfig.icon}</span>
                  {sentimentConfig.label}
                </Badge>
              )}

              {/* Duration */}
              {lead.duration && (
                <Badge variant="outline" className="text-[10px] gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(lead.duration)}
                </Badge>
              )}

              {/* Call Attempts */}
              <Badge variant="outline" className="text-[10px]">
                {lead.callAttempts} attempt{lead.callAttempts !== 1 ? 's' : ''}
              </Badge>

              {/* Last Call */}
              {lead.lastCallAt && (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  {formatTime(lead.lastCallAt)}
                </Badge>
              )}

              {/* Escalated To */}
              {lead.escalatedTo && (
                <Badge className="text-[10px] bg-purple-500/10 text-purple-500 border-purple-500/30">
                  → {lead.escalatedTo}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
