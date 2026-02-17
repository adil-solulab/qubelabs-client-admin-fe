import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Bot, User, Clock, ExternalLink, Loader2, ArrowRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ActiveChat } from '@/types/dashboard';
import { notify } from '@/hooks/useNotification';

interface ActiveChatsWidgetProps {
  chats: ActiveChat[];
  isLoading?: boolean;
}

export function ActiveChatsWidget({ chats: initialChats, isLoading }: ActiveChatsWidgetProps) {
  const navigate = useNavigate();
  const [chatList, setChatList] = useState<ActiveChat[]>(initialChats);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ActiveChat | null>(null);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setChatList(initialChats);
  }, [initialChats]);

  const botHandled = chatList.filter(c => c.status === 'bot-handled').length;
  const humanHandled = chatList.filter(c => c.status === 'active').length;
  const waiting = chatList.filter(c => c.status === 'waiting').length;

  const handleTakeOver = async (chat: ActiveChat) => {
    setIsTakingOver(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update chat status to active (human-handled)
    setChatList(prev => prev.map(c => 
      c.id === chat.id ? { ...c, status: 'active' as const, agent: 'You' } : c
    ));
    setSelectedChat({ ...chat, status: 'active', agent: 'You' });
    
    notify.success('Chat Takeover Successful', `You are now handling the chat with ${chat.customer}.`);
    setIsTakingOver(false);
  };

  const handleEscalate = async (chat: ActiveChat) => {
    setIsEscalating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Remove from list (escalated to supervisor)
    setChatList(prev => prev.filter(c => c.id !== chat.id));
    setSelectedChat(null);
    
    notify.success('Chat Escalated', `Chat with ${chat.customer} has been escalated to a supervisor.`);
    setIsEscalating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/10 text-success">Active</Badge>;
      case 'bot-handled':
        return <Badge className="bg-primary/10 text-primary">AI Handled</Badge>;
      case 'waiting':
        return <Badge className="bg-warning/10 text-warning">Waiting</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <DashboardWidget
        title="Active Chats"
        icon={MessageSquare}
        iconColor="text-channel-chat"
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
        definition="Total number of text-based chat conversations currently active across all channels"
      >
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{chatList.length}</span>
          <span className="text-sm text-muted-foreground">active conversations</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">{botHandled} AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-success" />
            <span className="text-xs text-muted-foreground">{humanHandled} Human</span>
          </div>
          {waiting > 0 && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs text-warning font-medium">{waiting} Waiting</span>
            </div>
          )}
        </div>
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-channel-chat" />
              Active Chats
            </DialogTitle>
            <DialogDescription>
              View and manage all ongoing chat conversations.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Wait Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {chatList.map((chat) => (
                  <TableRow
                    key={chat.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedChat(chat)}
                  >
                    <TableCell className="font-medium">{chat.customer}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {chat.status === 'bot-handled' ? (
                          <Bot className="w-3.5 h-3.5 text-primary" />
                        ) : chat.status === 'waiting' ? (
                          <Clock className="w-3.5 h-3.5 text-warning" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-success" />
                        )}
                        {chat.agent}
                      </div>
                    </TableCell>
                    <TableCell>{chat.channel}</TableCell>
                    <TableCell className="font-mono text-sm">{chat.waitTime}</TableCell>
                    <TableCell>{getStatusBadge(chat.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedChat(chat);
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => { navigate('/active-chats'); setIsOpen(false); }}>
              View All in Active Chats
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Detail Sheet */}
      <Sheet open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Chat with {selectedChat?.customer}</SheetTitle>
            <SheetDescription>
              View conversation details and take actions.
            </SheetDescription>
          </SheetHeader>
          
          {selectedChat && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Channel</p>
                  <p className="font-medium">{selectedChat.channel}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Wait Time</p>
                  <p className="font-mono">{selectedChat.waitTime}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Handler</p>
                  <p className="font-medium">{selectedChat.agent}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedChat.status)}
                </div>
              </div>

              {/* Mock conversation preview */}
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-3">Recent Messages</p>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-3 h-3" />
                    </div>
                    <div className="bg-muted rounded-lg rounded-tl-none px-3 py-2 text-sm">
                      Hi, I need help with my subscription.
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none px-3 py-2 text-sm">
                      Hello! I'd be happy to help you with your subscription. What seems to be the issue?
                    </div>
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  className="flex-1" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTakeOver(selectedChat);
                  }}
                  disabled={isTakingOver || (selectedChat.status === 'active' && selectedChat.agent === 'You')}
                >
                  {isTakingOver ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Taking Over...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4 mr-2" />
                      {selectedChat.status === 'active' && selectedChat.agent === 'You' ? 'Already Handling' : 'Take Over'}
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEscalate(selectedChat);
                  }}
                  disabled={isEscalating}
                >
                  {isEscalating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Escalating...
                    </>
                  ) : (
                    'Escalate'
                  )}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
