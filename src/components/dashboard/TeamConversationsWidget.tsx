import { useState } from 'react';
import { Users, MessageSquare, Phone, Mail, Eye, Send, Clock, Loader2 } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { notify } from '@/hooks/useNotification';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  activeConversations: number;
  channel: 'voice' | 'chat' | 'email';
  status: 'available' | 'busy' | 'break';
}

interface Conversation {
  id: string;
  customer: string;
  channel: 'voice' | 'chat' | 'email';
  subject: string;
  duration: string;
  status: 'active' | 'waiting' | 'on-hold';
}

const mockConversations: Record<string, Conversation[]> = {
  '1': [
    { id: 'c1', customer: 'John Smith', channel: 'voice', subject: 'Billing inquiry', duration: '5:23', status: 'active' },
    { id: 'c2', customer: 'Mary Johnson', channel: 'voice', subject: 'Technical support', duration: '2:15', status: 'active' },
    { id: 'c3', customer: 'David Lee', channel: 'voice', subject: 'Account upgrade', duration: '8:45', status: 'on-hold' },
  ],
  '2': [
    { id: 'c4', customer: 'Alice Brown', channel: 'chat', subject: 'Password reset', duration: '3:10', status: 'active' },
    { id: 'c5', customer: 'Bob Wilson', channel: 'chat', subject: 'Feature question', duration: '1:45', status: 'active' },
    { id: 'c6', customer: 'Carol Davis', channel: 'chat', subject: 'Subscription help', duration: '6:30', status: 'waiting' },
    { id: 'c7', customer: 'Dan Miller', channel: 'chat', subject: 'Order status', duration: '0:55', status: 'active' },
    { id: 'c8', customer: 'Eve Taylor', channel: 'chat', subject: 'Refund request', duration: '4:20', status: 'active' },
  ],
  '3': [
    { id: 'c9', customer: 'Frank Garcia', channel: 'email', subject: 'Partnership inquiry', duration: '12h', status: 'waiting' },
    { id: 'c10', customer: 'Grace Martinez', channel: 'email', subject: 'Bug report', duration: '2h', status: 'active' },
  ],
  '4': [
    { id: 'c11', customer: 'Henry Anderson', channel: 'chat', subject: 'Integration help', duration: '7:15', status: 'active' },
    { id: 'c12', customer: 'Ivy Thomas', channel: 'chat', subject: 'API question', duration: '3:40', status: 'active' },
    { id: 'c13', customer: 'Jack Robinson', channel: 'chat', subject: 'Pricing info', duration: '1:20', status: 'waiting' },
    { id: 'c14', customer: 'Karen White', channel: 'chat', subject: 'Demo request', duration: '5:00', status: 'active' },
  ],
  '5': [],
};

interface TeamConversationsWidgetProps {
  isLoading?: boolean;
}

const mockTeamData: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', activeConversations: 3, channel: 'voice', status: 'busy' },
  { id: '2', name: 'Mike Chen', activeConversations: 5, channel: 'chat', status: 'busy' },
  { id: '3', name: 'Emma Wilson', activeConversations: 2, channel: 'email', status: 'available' },
  { id: '4', name: 'Tom Hardy', activeConversations: 4, channel: 'chat', status: 'busy' },
  { id: '5', name: 'Lisa Park', activeConversations: 0, channel: 'voice', status: 'break' },
];

const channelIcons = {
  voice: Phone,
  chat: MessageSquare,
  email: Mail,
};

const statusColors = {
  available: 'bg-emerald-500',
  busy: 'bg-amber-500',
  break: 'bg-muted-foreground',
};

const statusLabels = {
  available: 'Available',
  busy: 'Busy',
  break: 'On Break',
};

const conversationStatusColors = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  waiting: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  'on-hold': 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

export function TeamConversationsWidget({ isLoading }: TeamConversationsWidgetProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [conversationsModalOpen, setConversationsModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const totalActive = mockTeamData.reduce((sum, m) => sum + m.activeConversations, 0);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
    setDetailModalOpen(true);
  };

  const handleViewConversations = () => {
    if (!selectedMember) return;
    setDetailModalOpen(false);
    setConversationsModalOpen(true);
  };

  const handleSendMessage = () => {
    if (!selectedMember) return;
    setDetailModalOpen(false);
    setMessage('');
    setMessageModalOpen(true);
  };

  const handleSendMessageSubmit = async () => {
    if (!selectedMember || !message.trim()) return;
    setIsSending(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    notify.success('Message Sent', `Your message has been sent to ${selectedMember.name}.`);
    setIsSending(false);
    setMessageModalOpen(false);
    setMessage('');
  };

  const handleJoinConversation = (conversation: Conversation) => {
    notify.success('Joining Conversation', `You are now monitoring the conversation with ${conversation.customer}.`);
  };

  return (
    <>
      <DashboardWidget
        title="Team Conversations"
        icon={Users}
        iconColor="text-blue-500"
        isLoading={isLoading}
        className="lg:col-span-2"
      >
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{totalActive}</span>
            <span className="text-sm text-muted-foreground">active conversations</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockTeamData.map((member) => {
              const ChannelIcon = channelIcons[member.channel];
              return (
                <div 
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-medium">{member.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${statusColors[member.status]}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ChannelIcon className="w-3 h-3" />
                        <span className="capitalize">{member.channel}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={member.activeConversations > 0 ? 'default' : 'secondary'}>
                    {member.activeConversations} active
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </DashboardWidget>

      {/* Team Member Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Team Member Details
            </DialogTitle>
            <DialogDescription>
              View team member status and take quick actions.
            </DialogDescription>
          </DialogHeader>

          {selectedMember && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-medium">{selectedMember.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${statusColors[selectedMember.status]}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedMember.name}</h3>
                    <p className="text-sm text-muted-foreground">{statusLabels[selectedMember.status]}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Active Conversations</p>
                  <p className="font-semibold text-xl">{selectedMember.activeConversations}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Primary Channel</p>
                  <p className="font-medium capitalize">{selectedMember.channel}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
            <Button variant="outline" onClick={handleSendMessage}>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
            <Button onClick={handleViewConversations}>
              <Eye className="w-4 h-4 mr-2" />
              View Conversations
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Conversations Modal */}
      <Dialog open={conversationsModalOpen} onOpenChange={setConversationsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              {selectedMember?.name}'s Active Conversations
            </DialogTitle>
            <DialogDescription>
              Monitor and join ongoing conversations handled by this team member.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[350px] pr-4">
            {selectedMember && mockConversations[selectedMember.id]?.length > 0 ? (
              <div className="space-y-3">
                {mockConversations[selectedMember.id].map((conversation) => {
                  const ChannelIcon = channelIcons[conversation.channel];
                  return (
                    <div
                      key={conversation.id}
                      className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <ChannelIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{conversation.customer}</h4>
                              <Badge className={conversationStatusColors[conversation.status]} variant="outline">
                                {conversation.status === 'on-hold' ? 'On Hold' : conversation.status.charAt(0).toUpperCase() + conversation.status.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{conversation.subject}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Duration: {conversation.duration}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleJoinConversation(conversation)}>
                          <Eye className="w-3 h-3 mr-1" />
                          Monitor
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No active conversations</p>
                <p className="text-sm">This team member has no ongoing conversations.</p>
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConversationsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <Dialog open={messageModalOpen} onOpenChange={setMessageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-500" />
              Send Message to {selectedMember?.name}
            </DialogTitle>
            <DialogDescription>
              Send a quick internal message to this team member.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This message will be delivered as an internal notification to {selectedMember?.name}.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMessageModalOpen(false)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleSendMessageSubmit} disabled={!message.trim() || isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {isSending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
