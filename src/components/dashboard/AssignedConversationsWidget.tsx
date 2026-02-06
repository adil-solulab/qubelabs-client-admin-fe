import { useState } from 'react';
import { MessageCircle, Phone, Mail, MessageSquare, ArrowRight, Pause, Play } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface AssignedConversationsWidgetProps {
  isLoading?: boolean;
}

interface Conversation {
  id: string;
  customer: string;
  channel: 'voice' | 'chat' | 'email';
  duration: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'active' | 'on-hold';
}

const initialConversations: Conversation[] = [
  { id: '1', customer: 'John Doe', channel: 'voice', duration: '05:32', sentiment: 'positive', status: 'active' },
  { id: '2', customer: 'Jane Smith', channel: 'chat', duration: '12:15', sentiment: 'neutral', status: 'active' },
  { id: '3', customer: 'Alex Brown', channel: 'chat', duration: '03:45', sentiment: 'negative', status: 'on-hold' },
];

const channelIcons = {
  voice: Phone,
  chat: MessageSquare,
  email: Mail,
};

const sentimentColors = {
  positive: 'bg-emerald-500/10 text-emerald-600',
  neutral: 'bg-blue-500/10 text-blue-600',
  negative: 'bg-destructive/10 text-destructive',
};

export function AssignedConversationsWidget({ isLoading }: AssignedConversationsWidgetProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const activeCount = conversations.filter(c => c.status === 'active').length;

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setDetailModalOpen(true);
  };

  const handleOpenConversation = () => {
    if (!selectedConversation) return;
    notify.success('Opening Conversation', `Navigating to conversation with ${selectedConversation.customer}...`);
    setDetailModalOpen(false);
  };

  const handleToggleHold = () => {
    if (!selectedConversation) return;
    const newStatus = selectedConversation.status === 'on-hold' ? 'active' : 'on-hold';
    setConversations(prev => 
      prev.map(c => c.id === selectedConversation.id ? { ...c, status: newStatus } : c)
    );
    setSelectedConversation(prev => prev ? { ...prev, status: newStatus } : null);
    notify.info(
      newStatus === 'on-hold' ? 'Conversation On Hold' : 'Conversation Resumed',
      `${selectedConversation.customer}'s conversation is now ${newStatus === 'on-hold' ? 'on hold' : 'active'}.`
    );
  };

  const handleEndConversation = () => {
    if (!selectedConversation) return;
    notify.success('Conversation Ended', `Conversation with ${selectedConversation.customer} has been closed.`);
    setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
    setDetailModalOpen(false);
    setSelectedConversation(null);
  };

  return (
    <>
      <DashboardWidget
        title="My Active Conversations"
        icon={MessageCircle}
        iconColor="text-primary"
        isLoading={isLoading}
        className="lg:col-span-2"
        action={
          <Badge variant="default">
            {activeCount} active
          </Badge>
        }
      >
        <div className="space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No active conversations</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const ChannelIcon = channelIcons[conversation.channel];
              
              return (
                <div 
                  key={conversation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ChannelIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{conversation.customer}</p>
                        {conversation.status === 'on-hold' && (
                          <Badge variant="outline" className="text-xs">On Hold</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {conversation.channel} • {conversation.duration}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-xs", sentimentColors[conversation.sentiment])}>
                      {conversation.sentiment}
                    </Badge>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConversationClick(conversation);
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DashboardWidget>

      {/* Conversation Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedConversation && (() => {
                const Icon = channelIcons[selectedConversation.channel];
                return <Icon className="w-5 h-5 text-primary" />;
              })()}
              Conversation Details
            </DialogTitle>
            <DialogDescription>
              Manage this active conversation.
            </DialogDescription>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg text-foreground">{selectedConversation.customer}</span>
                  <Badge className={cn("text-xs", sentimentColors[selectedConversation.sentiment])}>
                    {selectedConversation.sentiment}
                  </Badge>
                  {selectedConversation.status === 'on-hold' && (
                    <Badge variant="outline">On Hold</Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Channel</p>
                  <p className="font-medium capitalize">{selectedConversation.channel}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-mono">{selectedConversation.duration}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleToggleHold}>
              {selectedConversation?.status === 'on-hold' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Put on Hold
                </>
              )}
            </Button>
            <Button variant="destructive" onClick={handleEndConversation}>
              End Conversation
            </Button>
            <Button onClick={handleOpenConversation}>
              <ArrowRight className="w-4 h-4 mr-2" />
              Open
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
