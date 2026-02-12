import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Send,
  History,
  X,
  MessageSquarePlus,
  Trash2,
  Bot,
  User,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const SUGGESTION_CARDS = [
  'What are my top AI agents?',
  'Analyze my bot performance in last 7 days.',
  'What topics are users asking about?',
];

export default function HomePage() {
  const { currentUser } = useAuth();
  const [input, setInput] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const messages = activeSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const createNewSession = (firstMessage?: string) => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: firstMessage
        ? firstMessage.slice(0, 40) + (firstMessage.length > 40 ? '...' : '')
        : 'New chat',
      messages: [],
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    return newSession.id;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createNewSession(text);
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: generateResponse(text.trim()),
      timestamp: new Date(),
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const updatedMessages = [...s.messages, userMsg, assistantMsg];
          return {
            ...s,
            title:
              s.messages.length === 0
                ? text.trim().slice(0, 40) +
                  (text.trim().length > 40 ? '...' : '')
                : s.title,
            messages: updatedMessages,
          };
        }
        return s;
      })
    );

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const generateResponse = (query: string): string => {
    const lower = query.toLowerCase();
    if (lower.includes('top ai agents') || lower.includes('best agents')) {
      return 'Based on the last 30 days of data, your top performing AI agents are:\n\n1. **Customer Support Bot** - 94% resolution rate, 2.1s avg response time\n2. **Sales Assistant** - 87% conversion rate, 1.8s avg response time\n3. **FAQ Handler** - 91% accuracy, 0.9s avg response time\n\nWould you like me to dive deeper into any of these agents?';
    }
    if (lower.includes('performance') || lower.includes('last 7 days')) {
      return 'Here\'s your bot performance summary for the last 7 days:\n\n- **Total Conversations**: 12,847 (+8% from previous week)\n- **Resolution Rate**: 89.3%\n- **Avg Response Time**: 1.4 seconds\n- **Customer Satisfaction**: 4.6/5.0\n- **Escalation Rate**: 11.2% (-3% improvement)\n\nOverall, your bots are performing well with improvements in both resolution and escalation rates.';
    }
    if (lower.includes('topics') || lower.includes('asking about')) {
      return 'The top topics users are asking about this week:\n\n1. **Account & Billing** (28%) - Password resets, subscription changes\n2. **Product Features** (22%) - How-to guides, feature availability\n3. **Technical Issues** (18%) - Login problems, API errors\n4. **Pricing** (15%) - Plan comparisons, enterprise quotes\n5. **Integration Help** (10%) - Third-party connections, webhooks\n6. **Other** (7%) - General inquiries\n\nWould you like detailed insights on any topic?';
    }
    return `I've analyzed your query about "${query}". Based on the available data, I can provide insights and recommendations. Could you provide more details about what specific metrics or timeframe you're interested in?`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setInput('');
  };

  const clearAllChats = () => {
    setSessions([]);
    setActiveSessionId(null);
    setInput('');
  };

  const userName = currentUser?.name?.split(' ')[0] || 'User';

  return (
    <AppLayout>
      <div className="flex h-full -m-6 relative">
        <div className="flex-1 flex flex-col h-full">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center px-4">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHistoryOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <History className="w-5 h-5" />
                </Button>
              </div>

              <div className="max-w-2xl w-full text-center space-y-6">
                <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  BETA
                </span>
                <h1 className="text-3xl font-bold text-foreground">
                  Hello, {userName}! How can I help you today?
                </h1>
                <p className="text-muted-foreground">
                  I can help you with analytics, metrics, and insights about
                  your agents.
                </p>

                <div className="relative mt-8">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="How can I help you today?"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button
                    size="icon"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="absolute bottom-3 right-3 rounded-full h-8 w-8"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  {SUGGESTION_CARDS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="px-4 py-3 text-sm text-left border border-border rounded-xl hover:bg-accent transition-colors max-w-[220px]"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  AI responses may be inaccurate. Please verify important
                  information.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-end p-4 border-b border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setHistoryOpen(true)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <History className="w-5 h-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4">
                <div className="max-w-3xl mx-auto py-6 space-y-6">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-3',
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'max-w-[70%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap',
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <div className="max-w-3xl mx-auto relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height =
                        Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="How can I help you today?"
                    rows={1}
                    className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <Button
                    size="icon"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim()}
                    className="absolute bottom-2 right-3 rounded-full h-8 w-8"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  AI responses may be inaccurate. Please verify important
                  information.
                </p>
              </div>
            </>
          )}
        </div>

        {historyOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setHistoryOpen(false)}
          />
        )}
        <div
          className={cn(
            'fixed top-0 right-0 h-full w-80 bg-background border-l border-border flex flex-col z-50 shadow-xl transition-transform duration-300 ease-in-out',
            historyOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">History</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHistoryOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-3">
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={handleNewChat}
            >
              <MessageSquarePlus className="w-4 h-4" />
              New chat
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No chat history yet
              </p>
            ) : (
              <div className="space-y-1 pb-3">
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate',
                      session.id === activeSessionId
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                  >
                    {session.title}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {sessions.length > 0 && (
            <div className="p-3 border-t border-border">
              <button
                onClick={clearAllChats}
                className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors w-full justify-center"
              >
                <Trash2 className="w-4 h-4" />
                Clear all chats
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
