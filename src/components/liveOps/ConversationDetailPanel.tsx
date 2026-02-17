import { useState, useEffect, useRef, useCallback } from 'react';
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
  Languages,
  Globe,
  PhoneOff,
  Loader2,
  Flag,
  PanelRightOpen,
  PanelRightClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LiveConversation, Agent, CallDisposition, CoPilotSuggestion, CoPilotChatMessage, CoPilotConversationContext } from '@/types/liveOps';
import { SENTIMENT_CONFIG, CHANNEL_CONFIG, STATUS_CONFIG } from '@/types/liveOps';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';
import { LanguageIndicator } from '@/components/translation/LanguageIndicator';
import { TranslatedMessage } from '@/components/translation/TranslatedMessage';
import { TranslationControls } from '@/components/translation/TranslationControls';
import { VoiceTranslationPanel } from '@/components/translation/VoiceTranslationPanel';
import { LanguageSettingsModal } from '@/components/translation/LanguageSettingsModal';
import { TransferPanel } from '@/components/liveOps/TransferPanel';
import { VoiceCallControls } from '@/components/liveOps/VoiceCallControls';
import { CustomerInfoSidebar } from '@/components/liveOps/CustomerInfoSidebar';
import { PostCallDispositionModal } from '@/components/liveOps/PostCallDispositionModal';

interface ConversationDetailPanelProps {
  conversation: LiveConversation;
  agents: Agent[];
  onClose: () => void;
  onMonitor: () => void;
  onWhisper: (message: string) => void;
  onBargeIn: () => void;
  onTransfer: (agentId: string) => void;
  onStopSupervision: () => void;
  onEndConversation?: () => void;
  onResolveConversation?: () => void;
  onReport?: () => void;
  onSendMessage?: (content: string) => void;
  onDisposition?: (disposition: CallDisposition) => void;
  onAddNote?: (note: string) => void;
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
  onEndConversation,
  onResolveConversation,
  onReport,
  onSendMessage,
  onDisposition,
  onAddNote,
}: ConversationDetailPanelProps) {
  const [whisperMessage, setWhisperMessage] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [languageSettingsOpen, setLanguageSettingsOpen] = useState(false);
  const [isEndingConversation, setIsEndingConversation] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [voiceOnHold, setVoiceOnHold] = useState(false);
  const [voiceSpeaker, setVoiceSpeaker] = useState(false);
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [dispositionOpen, setDispositionOpen] = useState(false);
  const [coPilotChatMessages, setCoPilotChatMessages] = useState<CoPilotChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationContext: CoPilotConversationContext = {
    conversationId: conversation.id,
    customerName: conversation.customerName,
    topic: conversation.topic,
    channel: conversation.channel,
    sentiment: conversation.sentiment,
    messages: conversation.messages,
    customerInfo: conversation.customerInfo,
    coPilotSuggestions: conversation.coPilotSuggestions,
    isAiHandled: conversation.isAiHandled,
    agentName: conversation.agentName,
  };

  const handleCoPilotUserMessage = (message: string) => {
    setCoPilotChatMessages(prev => [...prev, {
      id: `agent-${Date.now()}`,
      role: 'agent',
      content: message,
      timestamp: new Date().toISOString(),
    }]);
  };

  const handleCoPilotBotMessage = (message: string) => {
    setCoPilotChatMessages(prev => [...prev, {
      id: `copilot-${Date.now()}`,
      role: 'copilot',
      content: message,
      timestamp: new Date().toISOString(),
    }]);
  };
  
  const { currentRole, isClientAdmin, isSupervisor, isAgent } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';

  // Translation hook
  const {
    settings,
    updateSettings,
    isTranslating,
    voiceState,
    initializeConversationTranslation,
    translateMessage,
    setCustomerLanguage,
    toggleTranslation,
    getConversationTranslation,
    getMessageTranslation,
    startVoiceTranslation,
    stopVoiceTranslation,
  } = useTranslation();

  // Permission checks based on role
  const canWhisper = isClientAdmin || isSupervisor;
  const canBargeIn = isClientAdmin || isSupervisor;
  const canTransfer = isClientAdmin || isSupervisor;
  const canMonitor = isClientAdmin || isSupervisor;
  const isSupervisorView = isClientAdmin || isSupervisor;

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

  // Initialize translation for conversation
  useEffect(() => {
    const customerMessage = conversation.messages.find(m => m.role === 'customer');
    initializeConversationTranslation(conversation.id, customerMessage?.content);
  }, [conversation.id, initializeConversationTranslation, conversation.messages]);

  // Translate messages when translation is enabled
  useEffect(() => {
    const convTranslation = getConversationTranslation(conversation.id);
    if (convTranslation?.translationEnabled) {
      conversation.messages.forEach(msg => {
        if (msg.role === 'customer' || msg.role === 'agent') {
          translateMessage(msg.id, msg.content, conversation.id, msg.role === 'customer');
        }
      });
    }
  }, [conversation.messages, conversation.id, getConversationTranslation, translateMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const handleWhisperSend = () => {
    if (isTransferred) return;
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
    if (isTransferred) return;
    if (!canBargeIn) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    onBargeIn();
  };

  const handleTransfer = (agentId: string) => {
    if (isTransferred) return;
    if (!canTransfer) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    onTransfer(agentId);
    setShowTransfer(false);
  };

  const handleMonitor = () => {
    if (isTransferred) return;
    if (!canMonitor) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    onMonitor();
  };

  const handleToggleTranslation = useCallback((enabled: boolean) => {
    toggleTranslation(conversation.id, enabled);
    if (enabled) {
      notify.success('Translation enabled', 'Messages will be automatically translated.');
    } else {
      notify.info('Translation disabled', 'Messages will show in original language.');
    }
  }, [conversation.id, toggleTranslation]);

  const handleSetCustomerLanguage = useCallback((language: string) => {
    setCustomerLanguage(conversation.id, language as any);
    notify.success('Language updated', 'Customer language has been updated.');
  }, [conversation.id, setCustomerLanguage]);

  const handleEndCall = () => {
    if (isTransferred) return;
    if (conversation.channel === 'voice') {
      setDispositionOpen(true);
    } else if (onEndConversation) {
      onEndConversation();
    }
  };

  const handleDisposition = (disposition: CallDisposition) => {
    onDisposition?.(disposition);
    onEndConversation?.();
  };

  const handleUseSuggestion = (suggestion: CoPilotSuggestion) => {
    if (suggestion.type === 'reply' && onSendMessage) {
      notify.info('Suggestion Applied', 'AI suggestion has been used as a reply');
    } else {
      notify.info('Suggestion Noted', suggestion.content);
    }
  };

  const isVoiceCall = conversation.channel === 'voice';
  const isTransferred = conversation.transferred === true;

  const conversationTranslation = getConversationTranslation(conversation.id);

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
    <>
    <div className={cn(
      "fixed inset-y-0 right-0 z-50 flex animate-slide-in-right shadow-2xl",
      showCustomerInfo && conversation.customerInfo ? 'w-full sm:w-[700px]' : 'w-full sm:w-[400px]'
    )}>
      {showCustomerInfo && conversation.customerInfo && (
        <div className="hidden sm:block w-[300px] border-l bg-background">
          <CustomerInfoSidebar
            customerName={conversation.customerName}
            customerInfo={conversation.customerInfo}
            coPilotSuggestions={conversation.coPilotSuggestions}
            notes={conversation.notes}
            onAddNote={onAddNote}
            onUseSuggestion={handleUseSuggestion}
            onClose={() => setShowCustomerInfo(false)}
            readOnly={isSupervisorView && !conversation.supervisorJoined}
            conversationContext={conversationContext}
            coPilotMessages={coPilotChatMessages}
            onCoPilotUserMessage={handleCoPilotUserMessage}
            onCoPilotBotMessage={handleCoPilotBotMessage}
          />
        </div>
      )}
    <div className="flex-1 w-full sm:w-[400px] border-l bg-background flex flex-col h-full min-h-0 max-h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={cn(sentiment.bgColor, sentiment.color, 'text-sm')}>
                {conversation.customerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{conversation.customerName}</h3>
                {conversationTranslation && (
                  <LanguageIndicator
                    languageCode={conversationTranslation.customerLanguage}
                    isAutoDetected={conversationTranslation.isAutoDetected}
                    variant="icon-only"
                  />
                )}
              </div>
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
          <div className="flex items-center gap-1">
            {conversation.customerInfo && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showCustomerInfo ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setShowCustomerInfo(!showCustomerInfo)}
                  >
                    {showCustomerInfo ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showCustomerInfo ? 'Hide Customer Info' : 'Show Customer Info'}</TooltipContent>
              </Tooltip>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {isTransferred && (
        <div className="p-3 border-b flex-shrink-0 bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserPlus className="w-4 h-4" />
            <span>This conversation has been transferred to <strong className="text-foreground">{conversation.transferredTo}</strong>. You can no longer interact with it.</span>
          </div>
        </div>
      )}

      {/* Action Bar (fixed) */}
      {!isTransferred && (
      <div className="p-3 border-b flex-shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          {isSupervisorView && (
            <>
              {conversation.supervisorMode ? (
                <>
                  <Badge className={cn(
                    conversation.supervisorMode === 'monitoring' && 'bg-secondary text-secondary-foreground',
                    conversation.supervisorMode === 'whispering' && 'bg-accent text-accent-foreground',
                    conversation.supervisorMode === 'barged_in' && 'bg-warning text-warning-foreground'
                  )}>
                    {conversation.supervisorMode === 'monitoring' && '👁\uFE0F Monitoring'}
                    {conversation.supervisorMode === 'whispering' && '🔇 Whispering'}
                    {conversation.supervisorMode === 'barged_in' && '🎙\uFE0F Barged In'}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={onStopSupervision}>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Stop
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleMonitor}>
                  <Eye className="w-3 h-3 mr-1" />
                  Monitor
                </Button>
              )}

              {conversation.supervisorMode === 'monitoring' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => {}}>
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Whisper
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleBargeIn}>
                    <Mic className="w-3 h-3 mr-1" />
                    Barge In
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransfer(!showTransfer)}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Transfer
              </Button>
            </>
          )}

          {onReport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReport}
              className="text-warning border-warning/30 hover:bg-warning/10"
            >
              <Flag className="w-3 h-3 mr-1" />
              Report
            </Button>
          )}

          {onResolveConversation && conversation.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              className="text-success border-success/30 hover:bg-success/10"
              onClick={onResolveConversation}
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Resolve
            </Button>
          )}

          {onEndConversation && conversation.status === 'active' && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isEndingConversation}
              onClick={async () => {
                setIsEndingConversation(true);
                try {
                  await new Promise(resolve => setTimeout(resolve, 800));
                  handleEndCall();
                } finally {
                  setIsEndingConversation(false);
                }
              }}
            >
              {isEndingConversation ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <PhoneOff className="w-3 h-3 mr-1" />
              )}
              {isEndingConversation ? 'Ending...' : 'End & Survey'}
            </Button>
          )}
        </div>

        {showTransfer && isSupervisorView && (
          <div className="mt-3">
            <TransferPanel
              agents={agents}
              onTransfer={handleTransfer}
              onCancel={() => setShowTransfer(false)}
              compact
            />
          </div>
        )}
      </div>
      )}

      {/* Scrollable Content (ONLY this section scrolls) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* Meta Info */}
        <div className="px-4 pt-3 pb-2">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-base font-bold">{formatDuration(conversation.duration)}</p>
              <p className="text-[10px] text-muted-foreground">Duration</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-base font-bold">{channel.icon}</p>
              <p className="text-[10px] text-muted-foreground">{channel.label}</p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-base font-bold flex items-center justify-center">
                {conversation.isAiHandled ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{conversation.agentName || 'Waiting'}</p>
            </div>
          </div>
        </div>

        {/* Translation Controls */}
        <div className="px-4 pb-3">
          <div className="pt-2 border-t">
            <TranslationControls
              conversationTranslation={conversationTranslation}
              onToggleTranslation={handleToggleTranslation}
              onSetCustomerLanguage={handleSetCustomerLanguage}
              onOpenSettings={() => setLanguageSettingsOpen(true)}
            />
          </div>
        </div>
        {/* Voice Translation (scrolls with content) */}
        {conversation.channel === 'voice' && (
          <div className="p-3 border-b">
            <VoiceTranslationPanel
              voiceState={voiceState}
              customerLanguage={conversationTranslation?.customerLanguage || 'es'}
              agentLanguage={conversationTranslation?.agentLanguage || settings.agentPreferredLanguage}
              onStartListening={startVoiceTranslation}
              onStopListening={stopVoiceTranslation}
            />
          </div>
        )}

        {/* Messages */}
        <div className="p-4">
          <div className="space-y-4 pr-4">
          {conversation.messages.map((message) => {
            const isCustomer = message.role === 'customer';
            const isSystem = message.role === 'system';
            const isWhisper = message.role === 'whisper';
            const msgSentiment = message.sentiment ? SENTIMENT_CONFIG[message.sentiment] : null;
            const translation = getMessageTranslation(message.id);

            if (isSystem) {
              return (
                <div key={message.id} className="text-center animate-fade-in">
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
                <div key={message.id} className="flex justify-end animate-message-in-right">
                  <div className="max-w-[80%] p-3 rounded-xl bg-accent/20 border border-accent/30 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-1 mb-1">
                      <Badge variant="secondary" className="text-[10px] bg-accent text-accent-foreground">
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
                className={cn(
                  'flex gap-2',
                  !isCustomer && 'justify-end',
                  isCustomer ? 'animate-message-in' : 'animate-message-in-right'
                )}
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
                    'max-w-[75%] p-3 rounded-xl transition-all duration-200',
                    isCustomer ? 'bg-muted hover:bg-muted/80' : 'bg-primary text-primary-foreground hover:shadow-md'
                  )}
                >
                  {msgSentiment && (
                    <Badge 
                      variant="secondary" 
                      className={cn('text-[10px] mb-1 transition-colors', msgSentiment.bgColor, msgSentiment.color)}
                    >
                      {msgSentiment.icon} {msgSentiment.label}
                    </Badge>
                  )}
                  
                  {/* Show translated message if available */}
                  {conversationTranslation?.translationEnabled && (isCustomer || message.role === 'agent') ? (
                    <TranslatedMessage
                      originalText={message.content}
                      translation={translation}
                      isTranslating={isTranslating && !translation}
                      showOriginalByDefault={settings.showOriginalWithTranslation}
                      isCustomerMessage={isCustomer}
                      className={!isCustomer ? 'text-primary-foreground' : ''}
                    />
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                  
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
        </div>
      </div>

      {isVoiceCall && conversation.status === 'active' && !isTransferred && (
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

      {(conversation.channel === 'chat' || conversation.channel === 'email') && conversation.status === 'active' && !isTransferred && onSendMessage && (
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

      {canWhisper && !isTransferred && (conversation.supervisorMode === 'monitoring' || conversation.supervisorMode === 'whispering') && (
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
            Only the agent will see this message
          </p>
        </div>
      )}

      {/* Language Settings Modal */}
      <LanguageSettingsModal
        open={languageSettingsOpen}
        onOpenChange={setLanguageSettingsOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
      />
    </div>
    </div>

    <PostCallDispositionModal
      open={dispositionOpen}
      onOpenChange={setDispositionOpen}
      customerName={conversation.customerName}
      duration={conversation.duration}
      onSubmit={handleDisposition}
    />
    </>
  );
}
