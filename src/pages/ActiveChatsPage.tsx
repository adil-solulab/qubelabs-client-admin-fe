import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Search,
  Phone,
  Mail,
  Bot,
  User,
  Clock,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLiveOpsData } from '@/hooks/useLiveOpsData';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import { ActiveChatDetailPanel } from '@/components/liveOps/ActiveChatDetailPanel';
import { SENTIMENT_CONFIG, CHANNEL_CONFIG, STATUS_CONFIG } from '@/types/liveOps';
import type { LiveConversation, ConversationChannel, SentimentType } from '@/types/liveOps';
import { cn } from '@/lib/utils';

export default function ActiveChatsPage() {
  const {
    conversations,
    agents,
    selectedConversation,
    setSelectedConversation,
    takeOverConversation,
    escalateConversation,
    transferToAgent,
    resolveConversation,
    endConversation,
  } = useLiveOpsData();

  const { currentUser, currentRole, isClientAdmin } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<ConversationChannel | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeConversations = useMemo(() => {
    return conversations.filter(c =>
      c.status === 'active' || c.status === 'waiting' || c.status === 'on_hold'
    );
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    return activeConversations.filter(conv => {
      const matchesSearch =
        conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.agentName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter;
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'ai' && conv.isAiHandled)
        || (statusFilter === 'human' && !conv.isAiHandled)
        || (statusFilter === 'waiting' && conv.status === 'waiting');
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [activeConversations, searchQuery, channelFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = activeConversations.length;
    const aiHandled = activeConversations.filter(c => c.isAiHandled).length;
    const humanHandled = total - aiHandled;
    const waiting = activeConversations.filter(c => c.status === 'waiting').length;
    return { total, aiHandled, humanHandled, waiting };
  }, [activeConversations]);

  const handleTakeOver = async (conversation: LiveConversation) => {
    const agentId = currentUser?.id || 'agent-1';
    const agentName = currentUser?.name || 'John Anderson';
    await takeOverConversation(conversation.id, agentId, agentName);
    notify.success('Conversation taken over', `You are now handling the conversation with ${conversation.customerName}.`);
  };

  const handleEscalate = async (conversation: LiveConversation, reason: string) => {
    await escalateConversation(conversation.id, reason);
    notify.success('Conversation escalated', `Conversation with ${conversation.customerName} has been escalated to a supervisor.`);
  };

  const handleTransfer = async (conversationId: string, agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    await transferToAgent(conversationId, agentId);
    notify.success('Transfer complete', `Conversation transferred to ${agent?.name}.`);
  };

  const handleResolve = async (conversationId: string) => {
    await resolveConversation(conversationId);
    notify.success('Resolved', 'Conversation has been marked as resolved.');
  };

  const handleEnd = async (conversationId: string) => {
    await endConversation(conversationId);
    notify.success('Ended', 'Conversation has been ended.');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getChannelIcon = (channel: ConversationChannel) => {
    switch (channel) {
      case 'voice': return <Phone className="w-3.5 h-3.5" />;
      case 'chat': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'email': return <Mail className="w-3.5 h-3.5" />;
    }
  };

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Active Chats
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage all ongoing chat conversations
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <Card className="gradient-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold leading-none">{stats.total}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Active</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                <p className="text-2xl font-bold leading-none">{stats.aiHandled}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">AI Handled</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-success" />
                <p className="text-2xl font-bold leading-none">{stats.humanHandled}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Agent Handled</p>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                <p className="text-2xl font-bold leading-none">{stats.waiting}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Waiting</p>
            </CardContent>
          </Card>
        </div>

        <Card className="gradient-card mb-4">
          <CardContent className="p-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer, agent, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ConversationChannel | 'all')}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] bg-background">
                    <SelectValue placeholder="Handler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Handlers</SelectItem>
                    <SelectItem value="ai">AI Handled</SelectItem>
                    <SelectItem value="human">Agent Handled</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card overflow-hidden">
          {filteredConversations.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-1">No active chats found</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery || channelFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Active conversations will appear here'}
              </p>
            </CardContent>
          ) : (
            <div className="divide-y divide-border">
              <div className="hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 px-5 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Customer</span>
                <span>Agent</span>
                <span>Channel</span>
                <span>Wait Time</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredConversations.map(conv => {
                const sentiment = SENTIMENT_CONFIG[conv.sentiment];
                const channel = CHANNEL_CONFIG[conv.channel];
                const status = STATUS_CONFIG[conv.status];
                const statusColor = cn(
                  conv.isAiHandled && conv.status === 'active' && 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
                  !conv.isAiHandled && conv.status === 'active' && 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
                  conv.status === 'waiting' && 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
                  conv.status === 'on_hold' && 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
                );

                return (
                  <div key={conv.id}>
                    <div
                      className={cn(
                        'hidden md:grid grid-cols-[2fr_1.2fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 items-center px-5 py-3.5 cursor-pointer transition-colors',
                        selectedConversation?.id === conv.id
                          ? 'bg-primary/5 border-l-2 border-l-primary'
                          : 'hover:bg-muted/50 border-l-2 border-l-transparent',
                        conv.sentiment === 'escalated' && selectedConversation?.id !== conv.id && 'bg-destructive/[0.03]'
                      )}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                            {conv.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{conv.customerName}</p>
                            {conv.slaBreached && (
                              <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 shrink-0 animate-pulse">
                                SLA
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{conv.topic}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 min-w-0">
                        {conv.isAiHandled ? (
                          <Bot className="w-3.5 h-3.5 text-primary shrink-0" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-sm truncate">{conv.agentName || 'Pending...'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={cn('shrink-0', channel.color)}>{getChannelIcon(conv.channel)}</span>
                        <span className="text-sm capitalize">{conv.channel}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        {conv.status === 'waiting'
                          ? formatDuration(conv.waitTime || 0)
                          : formatDuration(conv.duration)
                        }
                      </div>

                      <div>
                        <Badge variant="outline" className={cn('text-[10px] font-medium border', statusColor)}>
                          {conv.isAiHandled ? 'AI Handled' : status.label}
                        </Badge>
                      </div>

                      <div className="flex justify-end">
                        <Badge
                          variant="secondary"
                          className="text-[10px] cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                          View
                        </Badge>
                      </div>
                    </div>

                    <div
                      className={cn(
                        'md:hidden px-4 py-3 cursor-pointer transition-colors',
                        selectedConversation?.id === conv.id
                          ? 'bg-primary/5 border-l-2 border-l-primary'
                          : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                      )}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                            {conv.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium truncate">{conv.customerName}</p>
                            <Badge variant="outline" className={cn('text-[10px] font-medium border shrink-0', statusColor)}>
                              {conv.isAiHandled ? 'AI Handled' : status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.topic}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              {conv.isAiHandled ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              {conv.agentName || 'Pending'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className={cn(channel.color)}>{getChannelIcon(conv.channel)}</span>
                              <span className="capitalize">{conv.channel}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDuration(conv.duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <p className="text-xs text-muted-foreground mt-3">
          Showing {filteredConversations.length} of {activeConversations.length} active conversations
        </p>

        {selectedConversation && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setSelectedConversation(null)}
            />
            <ActiveChatDetailPanel
              conversation={selectedConversation}
              agents={agents}
              onClose={() => setSelectedConversation(null)}
              onTakeOver={() => handleTakeOver(selectedConversation)}
              onEscalate={(reason) => handleEscalate(selectedConversation, reason)}
              onTransfer={(agentId) => handleTransfer(selectedConversation.id, agentId)}
              onResolve={() => handleResolve(selectedConversation.id)}
              onEnd={() => handleEnd(selectedConversation.id)}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
