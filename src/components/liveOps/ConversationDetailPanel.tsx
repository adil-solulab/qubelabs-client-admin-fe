import { useState, useEffect, useRef } from 'react';
import {
  X,
  Eye,
  EyeOff,
  MessageSquare,
  Phone,
  Mic,
  UserPlus,
  Send,
  Bot,
  User,
  Clock,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LiveConversation, Agent } from '@/types/liveOps';
import { SENTIMENT_CONFIG, CHANNEL_CONFIG, STATUS_CONFIG } from '@/types/liveOps';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

interface ConversationDetailPanelProps {
  conversation: LiveConversation;
  agents: Agent[];
  onClose: () => void;
  onMonitor: () => void;
  onWhisper: (message: string) => void;
  onBargeIn: () => void;
  onTransfer: (agentId: string) => void;
  onStopSupervision: () => void;
}

export function ConversationDetailPanel({
  conversation,
  agents,
  onClose,
  onMonitor,
  onWhisper,
  onBargeIn,
  onTransfer,
  onStopSupervision,
}: ConversationDetailPanelProps) {
  const [whisperMessage, setWhisperMessage] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentRole, isClientAdmin } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';

  // Permission checks based on role
  const canWhisper = isClientAdmin || roleName === 'Supervisor';
  const canBargeIn = isClientAdmin || roleName === 'Supervisor';
  const canTransfer = isClientAdmin || roleName === 'Supervisor';
  const canMonitor = isClientAdmin || roleName === 'Supervisor';

  const sentiment = SENTIMENT_CONFIG[conversation.sentiment];
  const channel = CHANNEL_CONFIG[conversation.channel];
  const status = STATUS_CONFIG[conversation.status];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleWhisperSend = () => {
    if (!canWhisper) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    if (whisperMessage.trim()) {
      onWhisper(whisperMessage);
      setWhisperMessage('');
    }
  };

  const handleBargeIn = () => {
    if (!canBargeIn) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    onBargeIn();
  };

  const handleTransfer = (agentId: string) => {
    if (!canTransfer) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    onTransfer(agentId);
    setShowTransfer(false);
  };

  const handleMonitor = () => {
    if (!canMonitor) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    onMonitor();
  };

  const availableAgents = agents.filter(a => a.status === 'available' || a.status === 'busy');

  // Helper component for locked buttons
  const LockedButton = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
          <Lock className="w-3 h-3 mr-1" />
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="w-[400px] border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className={cn(sentiment.bgColor, sentiment.color)}>
                {conversation.customerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{conversation.customerName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn('text-[10px]', status.color)}>
                  {status.label}
                </Badge>
                <Badge variant="secondary" className={cn('text-[10px] gap-1', sentiment.bgColor, sentiment.color)}>
                  {sentiment.icon} {sentiment.label}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Meta Info */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold">{formatDuration(conversation.duration)}</p>
            <p className="text-[10px] text-muted-foreground">Duration</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold">{channel.icon}</p>
            <p className="text-[10px] text-muted-foreground">{channel.label}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50">
            <p className="text-lg font-bold flex items-center justify-center">
              {conversation.isAiHandled ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">{conversation.agentName || 'Waiting'}</p>
          </div>
        </div>
      </div>

      {/* Supervisor Actions - Only show for roles with permissions */}
      <div className="p-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {conversation.supervisorMode ? (
            <>
              <Badge className={cn(
                conversation.supervisorMode === 'monitoring' && 'bg-blue-500',
                conversation.supervisorMode === 'whispering' && 'bg-purple-500',
                conversation.supervisorMode === 'barged_in' && 'bg-warning'
              )}>
                {conversation.supervisorMode === 'monitoring' && '👁️ Monitoring'}
                {conversation.supervisorMode === 'whispering' && '🔇 Whispering'}
                {conversation.supervisorMode === 'barged_in' && '🎙️ Barged In'}
              </Badge>
              {canMonitor ? (
                <Button variant="outline" size="sm" onClick={onStopSupervision}>
                  <EyeOff className="w-3 h-3 mr-1" />
                  Stop
                </Button>
              ) : (
                <LockedButton tooltip="Supervisor access required">Stop</LockedButton>
              )}
            </>
          ) : (
            canMonitor ? (
              <Button variant="outline" size="sm" onClick={handleMonitor}>
                <Eye className="w-3 h-3 mr-1" />
                Monitor
              </Button>
            ) : (
              <LockedButton tooltip="Supervisor access required">Monitor</LockedButton>
            )
          )}
          
          {conversation.supervisorMode === 'monitoring' && (
            <>
              {canWhisper ? (
                <Button variant="outline" size="sm" onClick={() => {}}>
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Whisper
                </Button>
              ) : (
                <LockedButton tooltip="Supervisor access required">Whisper</LockedButton>
              )}
              
              {canBargeIn ? (
                <Button variant="secondary" size="sm" onClick={handleBargeIn}>
                  <Mic className="w-3 h-3 mr-1" />
                  Barge In
                </Button>
              ) : (
                <LockedButton tooltip="Supervisor access required">Barge In</LockedButton>
              )}
            </>
          )}

          {canTransfer ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowTransfer(!showTransfer)}
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Transfer
            </Button>
          ) : (
            <LockedButton tooltip="Supervisor access required">Transfer</LockedButton>
          )}
        </div>

        {/* Transfer Panel */}
        {showTransfer && canTransfer && (
          <div className="mt-3 p-3 rounded-lg border bg-muted/30">
            <p className="text-xs font-medium mb-2">Transfer to Agent:</p>
            <div className="space-y-1">
              {availableAgents.map(agent => (
                <Button
                  key={agent.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleTransfer(agent.id)}
                  disabled={agent.currentConversations >= agent.maxConversations}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full mr-2',
                    agent.status === 'available' && 'bg-success',
                    agent.status === 'busy' && 'bg-warning'
                  )} />
                  {agent.name}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {agent.currentConversations}/{agent.maxConversations}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.messages.map((message) => {
            const isCustomer = message.role === 'customer';
            const isSystem = message.role === 'system';
            const isWhisper = message.role === 'whisper';
            const msgSentiment = message.sentiment ? SENTIMENT_CONFIG[message.sentiment] : null;

            if (isSystem) {
              return (
                <div key={message.id} className="text-center">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {message.content}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              );
            }

            if (isWhisper) {
              return (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[80%] p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary" className="text-[10px] bg-purple-500/20 text-purple-500">
                        🔇 Whisper to Agent
                      </Badge>
                    </div>
                    <p className="text-sm italic">{message.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={cn('flex gap-2', !isCustomer && 'justify-end')}
              >
                {isCustomer && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs">
                      {conversation.customerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[75%] p-3 rounded-xl',
                    isCustomer ? 'bg-muted' : 'bg-primary text-primary-foreground'
                  )}
                >
                  {msgSentiment && (
                    <Badge 
                      variant="secondary" 
                      className={cn('text-[10px] mb-1', msgSentiment.bgColor, msgSentiment.color)}
                    >
                      {msgSentiment.icon} {msgSentiment.label}
                    </Badge>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className={cn(
                    'text-[10px] mt-1',
                    isCustomer ? 'text-muted-foreground' : 'text-primary-foreground/70'
                  )}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {!isCustomer && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/20">
                      {conversation.isAiHandled ? '🤖' : conversation.agentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Whisper Input - Only for Supervisor roles */}
      {canWhisper && (conversation.supervisorMode === 'monitoring' || conversation.supervisorMode === 'whispering') && (
        <div className="p-3 border-t flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={whisperMessage}
              onChange={(e) => setWhisperMessage(e.target.value)}
              placeholder="Whisper to agent..."
              onKeyDown={(e) => e.key === 'Enter' && handleWhisperSend()}
              className="text-sm"
            />
            <Button size="icon" onClick={handleWhisperSend} disabled={!whisperMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Only the agent will see this message
          </p>
        </div>
      )}
    </div>
  );
}
