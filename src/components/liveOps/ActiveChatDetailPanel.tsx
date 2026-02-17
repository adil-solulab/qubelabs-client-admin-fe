import { useState, useEffect, useRef } from 'react';
import {
  X,
  Bot,
  User,
  Clock,
  Phone,
  MessageSquare,
  Mail,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  PhoneOff,
  Loader2,
  Send,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { notify } from '@/hooks/useNotification';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import type { LiveConversation, Agent, CallDisposition, CoPilotSuggestion } from '@/types/liveOps';
import { SENTIMENT_CONFIG, CHANNEL_CONFIG, STATUS_CONFIG } from '@/types/liveOps';
import { cn } from '@/lib/utils';
import { TransferPanel } from '@/components/liveOps/TransferPanel';
import { VoiceCallControls } from '@/components/liveOps/VoiceCallControls';
import { CustomerInfoSidebar } from '@/components/liveOps/CustomerInfoSidebar';
import { PostCallDispositionModal } from '@/components/liveOps/PostCallDispositionModal';

interface ActiveChatDetailPanelProps {
  conversation: LiveConversation;
  agents: Agent[];
  onClose: () => void;
  onTakeOver: () => void;
  onEscalate: (reason: string) => void;
  onTransfer: (agentId: string) => void;
  onResolve: () => void;
  onEnd: () => void;
  onSendMessage?: (content: string) => void;
  onDisposition?: (disposition: CallDisposition) => void;
  onAddNote?: (note: string) => void;
}

export function ActiveChatDetailPanel({
  conversation,
  agents,
  onClose,
  onTakeOver,
  onEscalate,
  onTransfer,
  onResolve,
  onEnd,
  onSendMessage,
  onDisposition,
  onAddNote,
}: ActiveChatDetailPanelProps) {
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [voiceOnHold, setVoiceOnHold] = useState(false);
  const [voiceSpeaker, setVoiceSpeaker] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [dispositionOpen, setDispositionOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleTakeOver = async () => {
    setIsTakingOver(true);
    try {
      await onTakeOver();
    } finally {
      setIsTakingOver(false);
    }
  };

  const handleEscalate = async () => {
    if (!escalateReason.trim()) return;
    setIsEscalating(true);
    try {
      await onEscalate(escalateReason);
      setEscalateOpen(false);
      setEscalateReason('');
    } finally {
      setIsEscalating(false);
    }
  };



  const getChannelIcon = () => {
    switch (conversation.channel) {
      case 'voice': return <Phone className="w-4 h-4" />;
      case 'chat': return <MessageSquare className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
    }
  };

  const handleEndCall = () => {
    if (conversation.channel === 'voice') {
      setDispositionOpen(true);
    } else {
      onEnd();
    }
  };

  const handleDisposition = (disposition: CallDisposition) => {
    onDisposition?.(disposition);
    onEnd();
  };

  const handleUseSuggestion = (suggestion: CoPilotSuggestion) => {
    if (suggestion.type === 'reply' && onSendMessage) {
      notify.info('Suggestion Applied', 'AI suggestion has been used as a reply');
    } else {
      notify.info('Suggestion Noted', suggestion.content);
    }
  };

  const isVoiceCall = conversation.channel === 'voice';

  return (
    <>
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 flex animate-slide-in-right shadow-2xl",
        showCustomerInfo && isVoiceCall ? 'w-full sm:w-[720px]' : 'w-full sm:w-[420px]'
      )}>
        {showCustomerInfo && isVoiceCall && conversation.customerInfo && (
          <div className="hidden sm:block w-[300px] border-l bg-background">
            <CustomerInfoSidebar
              customerName={conversation.customerName}
              customerInfo={conversation.customerInfo}
              coPilotSuggestions={conversation.coPilotSuggestions}
              notes={conversation.notes}
              onAddNote={onAddNote}
              onUseSuggestion={handleUseSuggestion}
              onClose={() => setShowCustomerInfo(false)}
            />
          </div>
        )}
        <div className="flex-1 w-full sm:w-[420px] border-l bg-background flex flex-col h-full overflow-hidden">
        <div className="p-5 border-b flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Chat with {conversation.customerName}</h3>
              <p className="text-sm text-muted-foreground">View conversation details and take actions.</p>
            </div>
            <div className="flex items-center gap-1">
              {isVoiceCall && conversation.customerInfo && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={showCustomerInfo ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                      className="shrink-0"
                    >
                      {showCustomerInfo ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{showCustomerInfo ? 'Hide Customer Info' : 'Show Customer Info'}</TooltipContent>
                </Tooltip>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Channel</p>
              <div className="flex items-center gap-2">
                <span className={cn(channel.color)}>{getChannelIcon()}</span>
                <span className="text-sm font-medium capitalize">{conversation.channel}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Wait Time</p>
              <p className="text-sm font-medium font-mono">
                {formatDuration(conversation.status === 'waiting' ? (conversation.waitTime || 0) : conversation.duration)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Handler</p>
              <div className="flex items-center gap-2">
                {conversation.isAiHandled ? (
                  <Bot className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm font-medium truncate">{conversation.agentName}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide mb-1">Status</p>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  conversation.isAiHandled && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400',
                  !conversation.isAiHandled && conversation.status === 'active' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400',
                  conversation.status === 'waiting' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
                )}
              >
                {conversation.isAiHandled ? 'AI Handled' : status.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="p-5">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Recent Messages</h4>
            <div className="space-y-3">
              {conversation.messages.map((message) => {
                const isCustomer = message.role === 'customer';
                const isSystem = message.role === 'system';

                if (isSystem) {
                  return (
                    <div key={message.id} className="text-center py-1">
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {message.content}
                      </Badge>
                    </div>
                  );
                }

                return (
                  <div
                    key={message.id}
                    className={cn('flex gap-2.5', !isCustomer && 'justify-end')}
                  >
                    {isCustomer && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1">
                        <AvatarFallback className="text-xs bg-muted">
                          {conversation.customerName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm',
                        isCustomer
                          ? 'bg-muted rounded-tl-sm'
                          : 'bg-primary text-primary-foreground rounded-tr-sm'
                      )}
                    >
                      <p>{message.content}</p>
                      <p className={cn(
                        'text-[10px] mt-1',
                        isCustomer ? 'text-muted-foreground' : 'text-primary-foreground/70'
                      )}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {!isCustomer && (
                      <Avatar className="h-8 w-8 shrink-0 mt-1">
                        <AvatarFallback className="text-xs bg-primary/20 text-primary">
                          {conversation.isAiHandled ? <Bot className="w-4 h-4" /> : conversation.agentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {isVoiceCall && conversation.status === 'active' && (
          <VoiceCallControls
            voiceMuted={voiceMuted}
            voiceOnHold={voiceOnHold}
            voiceSpeaker={voiceSpeaker}
            onToggleMute={() => {
              setVoiceMuted(!voiceMuted);
              notify.info(voiceMuted ? 'Unmuted' : 'Muted', voiceMuted ? 'Microphone is now on' : 'Microphone is now off');
            }}
            onToggleHold={() => {
              setVoiceOnHold(!voiceOnHold);
              notify.info(voiceOnHold ? 'Resumed' : 'On Hold', voiceOnHold ? 'Call resumed' : 'Call placed on hold');
            }}
            onToggleSpeaker={() => {
              setVoiceSpeaker(!voiceSpeaker);
              notify.info(voiceSpeaker ? 'Speaker Off' : 'Speaker On', voiceSpeaker ? 'Audio through headset' : 'Audio through speaker');
            }}
            onEndCall={handleEndCall}
            networkQuality={conversation.networkQuality}
            recordingInfo={conversation.recordingInfo}
            isAiHandled={conversation.isAiHandled}
          />
        )}

        {(conversation.channel === 'chat' || conversation.channel === 'email') && conversation.status === 'active' && onSendMessage && (
          <div className="p-3 border-t flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder={conversation.channel === 'email' ? 'Type your reply...' : 'Type a message...'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && chatMessage.trim()) {
                    e.preventDefault();
                    onSendMessage(chatMessage.trim());
                    setChatMessage('');
                  }
                }}
                className="text-sm"
              />
              <Button
                size="icon"
                onClick={() => {
                  if (chatMessage.trim()) {
                    onSendMessage(chatMessage.trim());
                    setChatMessage('');
                  }
                }}
                disabled={!chatMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 border-t flex-shrink-0 space-y-3">
          {showTransfer && (
            <div className="mb-2">
              <TransferPanel
                agents={agents}
                onTransfer={(agentId) => { onTransfer(agentId); setShowTransfer(false); }}
                onCancel={() => setShowTransfer(false)}
                compact
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleTakeOver}
              disabled={isTakingOver}
            >
              {isTakingOver ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isTakingOver ? 'Taking Over...' : 'Take Over'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEscalateOpen(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Escalate
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setShowTransfer(!showTransfer)}
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Transfer
            </Button>
            {conversation.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-success border-success/30 hover:bg-success/10"
                onClick={onResolve}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Resolve
              </Button>
            )}
            {conversation.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={handleEndCall}
              >
                <PhoneOff className="w-3.5 h-3.5 mr-1.5" />
                End
              </Button>
            )}
          </div>
        </div>
      </div>
      </div>

      <PostCallDispositionModal
        open={dispositionOpen}
        onOpenChange={setDispositionOpen}
        customerName={conversation.customerName}
        duration={conversation.duration}
        onSubmit={handleDisposition}
      />

      <Dialog open={escalateOpen} onOpenChange={setEscalateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Conversation</DialogTitle>
            <DialogDescription>
              Escalate this conversation with {conversation.customerName} to a supervisor. Please provide a reason for the escalation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {['Customer is frustrated', 'Complex technical issue', 'Billing dispute', 'Policy exception needed', 'VIP customer'].map(quick => (
                <Badge
                  key={quick}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setEscalateReason(quick)}
                >
                  {quick}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="Describe the reason for escalation..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEscalateOpen(false); setEscalateReason(''); }}>
              Cancel
            </Button>
            <Button
              onClick={handleEscalate}
              disabled={!escalateReason.trim() || isEscalating}
              className="bg-warning text-warning-foreground hover:bg-warning/90"
            >
              {isEscalating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              {isEscalating ? 'Escalating...' : 'Escalate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
