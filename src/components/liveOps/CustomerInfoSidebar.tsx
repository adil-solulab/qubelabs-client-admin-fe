import { useState, useRef, useEffect } from 'react';
import {
  Phone, Mail, Building2, MapPin, Crown, DollarSign, Tag, Clock,
  Plus, X, Sparkles, Bot, MessageSquare, Zap, BookOpen, ChevronDown, ChevronUp, User,
  Send, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { CustomerInfo, CoPilotSuggestion, PreviousInteraction, CoPilotChatMessage, CoPilotConversationContext } from '@/types/liveOps';
import { CHANNEL_CONFIG } from '@/types/liveOps';
import { generateCoPilotResponse } from '@/lib/copilotMock';

interface CustomerInfoSidebarProps {
  customerName: string;
  customerInfo?: CustomerInfo;
  coPilotSuggestions?: CoPilotSuggestion[];
  notes?: string[];
  onAddNote?: (note: string) => void;
  onUseSuggestion?: (suggestion: CoPilotSuggestion) => void;
  onClose: () => void;
  readOnly?: boolean;
  conversationContext?: CoPilotConversationContext;
  coPilotMessages?: CoPilotChatMessage[];
  onCoPilotUserMessage?: (message: string) => void;
  onCoPilotBotMessage?: (message: string) => void;
}

const TIER_CONFIG = {
  standard: { label: 'Standard', color: 'bg-muted text-muted-foreground' },
  premium: { label: 'Premium', color: 'bg-amber-500/10 text-amber-600' },
  enterprise: { label: 'Enterprise', color: 'bg-purple-500/10 text-purple-600' },
};

const OUTCOME_CONFIG: Record<string, { label: string; color: string }> = {
  resolved: { label: 'Resolved', color: 'text-success' },
  escalated: { label: 'Escalated', color: 'text-destructive' },
  callback: { label: 'Callback', color: 'text-warning' },
};

const SUGGESTION_ICON = {
  intent: Bot,
  reply: MessageSquare,
  action: Zap,
  knowledge: BookOpen,
};

const SUGGESTION_COLOR = {
  intent: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  reply: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
  action: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
  knowledge: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950',
};

const QUICK_QUESTIONS = [
  'Summarize this conversation',
  'Customer details',
  'What should I do next?',
  'Sentiment analysis',
  'Interaction history',
];

export function CustomerInfoSidebar({
  customerName,
  customerInfo,
  coPilotSuggestions,
  notes,
  onAddNote,
  onUseSuggestion,
  onClose,
  readOnly = false,
  conversationContext,
  coPilotMessages = [],
  onCoPilotUserMessage,
  onCoPilotBotMessage,
}: CustomerInfoSidebarProps) {
  const [newNote, setNewNote] = useState('');
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [copilotExpanded, setCopilotExpanded] = useState(true);
  const [notesExpanded, setNotesExpanded] = useState(true);
  const [copilotChatExpanded, setCopilotChatExpanded] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (copilotChatExpanded) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [coPilotMessages, copilotChatExpanded, isTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleAddNote = () => {
    if (newNote.trim() && onAddNote) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  const canChat = !!conversationContext && !!onCoPilotUserMessage && !!onCoPilotBotMessage;

  const handleCoPilotSend = (message: string) => {
    if (!message.trim() || !canChat) return;
    onCoPilotUserMessage!(message.trim());
    setChatInput('');
    setIsTyping(true);
    const response = generateCoPilotResponse(message.trim(), conversationContext!);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onCoPilotBotMessage!(response);
      typingTimeoutRef.current = null;
    }, 800 + Math.random() * 700);
  };

  const formatChatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-background border-l overflow-hidden">
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Customer Info</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {customerName.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-semibold text-sm">{customerName}</p>
              {customerInfo?.tier && (
                <Badge variant="outline" className={cn('text-[10px] mt-0.5', TIER_CONFIG[customerInfo.tier].color)}>
                  <Crown className="w-2.5 h-2.5 mr-1" />
                  {TIER_CONFIG[customerInfo.tier].label}
                </Badge>
              )}
            </div>
          </div>

          {customerInfo && (
            <div className="space-y-2 text-xs">
              {customerInfo.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{customerInfo.phone}</span>
                </div>
              )}
              {customerInfo.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3 h-3" />
                  <span>{customerInfo.email}</span>
                </div>
              )}
              {customerInfo.company && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  <span>{customerInfo.company}</span>
                </div>
              )}
              {customerInfo.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span>{customerInfo.location}</span>
                </div>
              )}
              {customerInfo.crmId && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  <span>CRM: {customerInfo.crmId}</span>
                </div>
              )}
              {customerInfo.lifetimeValue && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span>LTV: {customerInfo.lifetimeValue}</span>
                </div>
              )}
              {customerInfo.tags && customerInfo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {customerInfo.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {conversationContext && (
          <div className="border-b">
            <button
              onClick={() => setCopilotChatExpanded(!copilotChatExpanded)}
              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold">Co-Pilot Chat</span>
                {coPilotMessages.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{coPilotMessages.length}</Badge>
                )}
              </div>
              {copilotChatExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {copilotChatExpanded && (
              <div className="px-3 pb-3">
                <div className="rounded-lg border bg-muted/20 overflow-hidden">
                  <div className="max-h-[280px] overflow-y-auto p-3 space-y-3">
                    {coPilotMessages.length === 0 && !isTyping && (
                      <div className="text-center py-4">
                        <Bot className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                        <p className="text-[11px] text-muted-foreground mb-3">
                          Ask me anything about this conversation
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {QUICK_QUESTIONS.map((q) => (
                            <button
                              key={q}
                              onClick={() => !readOnly && handleCoPilotSend(q)}
                              disabled={readOnly}
                              className={cn(
                                'text-[10px] px-2 py-1 rounded-full border bg-background transition-colors',
                                readOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/5 hover:border-primary/30 cursor-pointer'
                              )}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {coPilotMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-2',
                          msg.role === 'agent' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {msg.role === 'copilot' && (
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-3 h-3 text-primary" />
                          </div>
                        )}
                        <div
                          className={cn(
                            'max-w-[85%] px-3 py-2 rounded-xl text-[11px] leading-relaxed',
                            msg.role === 'agent'
                              ? 'bg-primary text-primary-foreground rounded-tr-sm'
                              : 'bg-background border rounded-tl-sm'
                          )}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>
                          <p className={cn(
                            'text-[9px] mt-1',
                            msg.role === 'agent' ? 'text-primary-foreground/60' : 'text-muted-foreground'
                          )}>
                            {formatChatTime(msg.timestamp)}
                          </p>
                        </div>
                        {msg.role === 'agent' && (
                          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="w-3 h-3 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex gap-2 items-start">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-primary" />
                        </div>
                        <div className="bg-background border rounded-xl rounded-tl-sm px-3 py-2">
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={chatEndRef} />
                  </div>

                  {!readOnly && canChat && (
                    <div className="p-2 border-t bg-background">
                      <div className="flex gap-1.5">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask Co-Pilot..."
                          className="text-xs h-8"
                          disabled={isTyping}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey && chatInput.trim() && !isTyping) {
                              e.preventDefault();
                              handleCoPilotSend(chatInput);
                            }
                          }}
                        />
                        <Button
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleCoPilotSend(chatInput)}
                          disabled={!chatInput.trim() || isTyping}
                        >
                          {isTyping ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      {coPilotMessages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {QUICK_QUESTIONS.slice(0, 3).map((q) => (
                            <button
                              key={q}
                              onClick={() => handleCoPilotSend(q)}
                              disabled={isTyping}
                              className="text-[9px] px-1.5 py-0.5 rounded-full border text-muted-foreground hover:bg-muted/50 transition-colors disabled:opacity-50"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {readOnly && (
                    <div className="p-2 border-t bg-muted/30">
                      <p className="text-[10px] text-muted-foreground italic text-center">
                        Take over the conversation to chat with Co-Pilot
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {coPilotSuggestions && coPilotSuggestions.length > 0 && (
          <div className="border-b">
            <button
              onClick={() => setCopilotExpanded(!copilotExpanded)}
              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-semibold">AI Suggestions</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{coPilotSuggestions.length}</Badge>
              </div>
              {copilotExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {copilotExpanded && (
              <div className="px-3 pb-3 space-y-2">
                {coPilotSuggestions.map((suggestion) => {
                  const Icon = SUGGESTION_ICON[suggestion.type];
                  return (
                    <div
                      key={suggestion.id}
                      className={cn('p-2.5 rounded-lg border text-xs transition-all', SUGGESTION_COLOR[suggestion.type], !readOnly && 'cursor-pointer hover:shadow-sm')}
                      onClick={() => !readOnly && onUseSuggestion?.(suggestion)}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-medium capitalize">{suggestion.type}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {Math.round(suggestion.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{suggestion.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {customerInfo?.previousInteractions && customerInfo.previousInteractions.length > 0 && (
          <div className="border-b">
            <button
              onClick={() => setHistoryExpanded(!historyExpanded)}
              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold">Interaction History</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {customerInfo.previousInteractions.length}
                </Badge>
              </div>
              {historyExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {historyExpanded && (
              <div className="px-3 pb-3 space-y-2">
                {customerInfo.previousInteractions.map((interaction) => (
                  <InteractionCard key={interaction.id} interaction={interaction} />
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <button
            onClick={() => setNotesExpanded(!notesExpanded)}
            className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold">Notes</span>
              {notes && notes.length > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{notes.length}</Badge>
              )}
            </div>
            {notesExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {notesExpanded && (
            <div className="px-3 pb-3 space-y-2">
              {notes && notes.map((note, i) => (
                <div key={i} className="p-2 rounded bg-muted/50 text-[11px] text-muted-foreground">
                  {note}
                </div>
              ))}
              {onAddNote && !readOnly && (
                <div className="space-y-1.5">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="text-xs min-h-[60px] resize-none"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs h-7"
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Note
                  </Button>
                </div>
              )}
              {readOnly && (
                <p className="text-[10px] text-muted-foreground italic">
                  Take over the conversation to add notes
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InteractionCard({ interaction }: { interaction: PreviousInteraction }) {
  const channel = CHANNEL_CONFIG[interaction.channel];
  const outcome = OUTCOME_CONFIG[interaction.outcome];
  return (
    <div className="p-2 rounded-lg border bg-muted/30 text-[11px]">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span>{channel.icon}</span>
          <span className="font-medium">{interaction.topic}</span>
        </div>
        <span className={cn('font-medium', outcome.color)}>{outcome.label}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <span>{interaction.date}</span>
        {interaction.agent && <span>by {interaction.agent}</span>}
      </div>
    </div>
  );
}
