import { useState, useRef, useEffect } from 'react';
import { Play, Send, Bot, User, Loader2, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import type { Persona } from '@/types/aiAgents';
import { TONE_LABELS } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TestPersonaModalProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MOCK_RESPONSES: Record<string, string[]> = {
  sales: [
    "I'd love to help you find the perfect solution! Could you tell me a bit more about your team size and main challenges?",
    "Great question! Our platform offers some unique advantages. Let me walk you through the key features that typically resonate with customers like you.",
    "I understand budget is a consideration. Many of our customers found that the ROI typically covers the investment within the first quarter. Would you like me to share some specific examples?",
  ],
  support: [
    "I'm really sorry you're experiencing this issue. Let me help you get this resolved right away. Can you tell me exactly when this started happening?",
    "Thank you for your patience. I've looked into your account and I can see what's happening. Here's what we can do to fix this...",
    "I completely understand how frustrating this must be. Let me personally ensure this gets resolved today. I'm going to escalate this to our priority queue.",
  ],
  custom: [
    "Based on your requirements, I'd recommend our enterprise configuration. Let me explain the technical details and how it would integrate with your existing setup.",
    "That's a great approach. For optimal performance, you'll want to configure the webhooks with retry logic. Here's a quick example of how to implement that.",
    "I can help with that implementation. The API supports both synchronous and asynchronous modes depending on your use case.",
  ],
};

export function TestPersonaModal({ persona, open, onOpenChange }: TestPersonaModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && persona) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: `Hello! I'm ${persona.name}. ${persona.description} How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, persona]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !persona) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const responses = MOCK_RESPONSES[persona.type] || MOCK_RESPONSES.custom;
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: randomResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (persona) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: `Hello! I'm ${persona.name}. ${persona.description} How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  };

  if (!persona) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Play className="w-4 h-4 text-primary-foreground" />
            </div>
            Test Persona: {persona.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{TONE_LABELS[persona.toneSettings.primary]}</Badge>
            <span className="text-xs">•</span>
            <span className="text-xs">{persona.toneSettings.voiceStyle}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Chat Header */}
        <div className="flex items-center justify-between py-2 border-b">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-muted-foreground">Live Preview</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {voiceEnabled ? (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <Switch
                checked={voiceEnabled}
                onCheckedChange={setVoiceEnabled}
                className="scale-75"
              />
              <span className="text-xs text-muted-foreground">Voice</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClearChat}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 pr-4 py-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' && 'flex-row-reverse'
                )}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback
                    className={cn(
                      message.role === 'assistant'
                        ? 'gradient-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5',
                    message.role === 'assistant'
                      ? 'bg-muted rounded-tl-sm'
                      : 'gradient-primary text-primary-foreground rounded-tr-sm'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span
                    className={cn(
                      'text-[10px] mt-1 block',
                      message.role === 'assistant'
                        ? 'text-muted-foreground'
                        : 'text-primary-foreground/70'
                    )}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="gradient-primary text-primary-foreground">
                    <Bot className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message to test the persona..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is a preview simulation. Actual responses may vary.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
