import { useState, useMemo, useCallback } from 'react';
import {
  Headphones,
  Users,
  Clock,
  TrendingUp,
  Phone,
  MessageSquare,
  Mail,
  Bot,
  User,
  Filter,
  Search,
  RefreshCw,
  Info,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLiveOpsData } from '@/hooks/useLiveOpsData';
import { useSurveyData } from '@/hooks/useSurveyData';
import { useAuth } from '@/hooks/useAuth';
import { useReportTickets } from '@/hooks/useReportTicketsContext';
import { notify } from '@/hooks/useNotification';
import { ConversationCard } from '@/components/liveOps/ConversationCard';
import { ConversationDetailPanel } from '@/components/liveOps/ConversationDetailPanel';
import { BargeInModal } from '@/components/liveOps/BargeInModal';
import { ReportConversationModal } from '@/components/liveOps/ReportConversationModal';
import { SurveyModal } from '@/components/surveys/SurveyModal';
import type { ConversationChannel, SentimentType, ConversationStatus, LiveConversation } from '@/types/liveOps';
import { cn } from '@/lib/utils';

const CURRENT_AGENT_ID = 'agent-1';

type ChatTab = 'all' | 'active' | 'queued' | 'resolved' | 'missed';

export default function LiveOpsPage() {
  const {
    conversations,
    agents,
    queueStats,
    selectedConversation,
    setSelectedConversation,
    startMonitoring,
    startWhisper,
    bargeIn,
    transferToAgent,
    stopSupervision,
    endConversation,
    resolveConversation,
    chatCategoryStats,
    slaStats,
  } = useLiveOpsData();

  const { currentRole, isClientAdmin, currentUser } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';
  const { createTicket } = useReportTickets();

  const { config: surveyConfig, triggerSurvey, submitSurveyResponse, isGeneratingSummary } = useSurveyData();
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [surveyResponseId, setSurveyResponseId] = useState<string | null>(null);
  const [endedConversation, setEndedConversation] = useState<LiveConversation | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<ConversationChannel | 'all'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');
  const [bargeInModalOpen, setBargeInModalOpen] = useState(false);
  const [conversationToBargeIn, setConversationToBargeIn] = useState<LiveConversation | null>(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatTab>('all');
  const [agentPanelOpen, setAgentPanelOpen] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsRefreshing(false);
    notify.success('Data refreshed', 'Live operations data has been updated.');
  }, []);

  const canViewAll = isClientAdmin || roleName === 'Supervisor';
  const canWhisper = isClientAdmin || roleName === 'Supervisor';
  const canBargeIn = isClientAdmin || roleName === 'Supervisor';

  const roleFilteredConversations = useMemo(() => {
    if (canViewAll) {
      return conversations;
    }
    return conversations.filter(conv => 
      conv.agentId === CURRENT_AGENT_ID || 
      conv.agentName === 'John Smith'
    );
  }, [conversations, canViewAll]);

  const tabFilteredConversations = useMemo(() => {
    return roleFilteredConversations.filter(conv => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return conv.status === 'active';
      if (activeTab === 'queued') return conv.status === 'waiting';
      if (activeTab === 'resolved') return conv.status === 'resolved';
      if (activeTab === 'missed') return conv.status === 'missed';
      return true;
    });
  }, [roleFilteredConversations, activeTab]);

  const filteredConversations = tabFilteredConversations.filter(conv => {
    const matchesSearch = conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === 'all' || conv.channel === channelFilter;
    const matchesSentiment = sentimentFilter === 'all' || conv.sentiment === sentimentFilter;
    return matchesSearch && matchesChannel && matchesSentiment;
  });

  const handleMonitor = async () => {
    if (!selectedConversation) return;
    if (!canViewAll) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    await startMonitoring(selectedConversation.id);
    notify.info(`Monitoring started`, `Now monitoring conversation with ${selectedConversation.customerName}`);
  };

  const handleWhisper = async (message: string) => {
    if (!selectedConversation) return;
    if (!canWhisper) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    await startWhisper(selectedConversation.id, message);
    notify.success('Whisper sent', 'Your message was sent to the agent privately.');
  };

  const handleBargeInClick = () => {
    if (!selectedConversation) return;
    if (!canBargeIn) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    setConversationToBargeIn(selectedConversation);
    setBargeInModalOpen(true);
  };

  const handleBargeInConfirm = async () => {
    if (!conversationToBargeIn) return;
    if (!canBargeIn) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    await bargeIn(conversationToBargeIn.id);
    notify.success('Barged in', 'You have joined the conversation as supervisor.');
  };

  const handleTransfer = async (agentId: string) => {
    if (!selectedConversation) return;
    if (!canViewAll) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    const agent = agents.find(a => a.id === agentId);
    await transferToAgent(selectedConversation.id, agentId);
    notify.success('Transfer complete', `Conversation transferred to ${agent?.name}`);
  };

  const handleStopSupervision = async () => {
    if (!selectedConversation) return;
    await stopSupervision(selectedConversation.id);
    notify.info('Supervision ended', 'You are no longer supervising this conversation.');
  };

  const handleEndConversation = async () => {
    if (!selectedConversation) return;
    
    setEndedConversation(selectedConversation);
    await endConversation(selectedConversation.id);
    
    if (surveyConfig.enabled) {
      const shouldTrigger = 
        (selectedConversation.channel === 'voice' && surveyConfig.triggerOn.includes('voice_end')) ||
        (selectedConversation.channel === 'chat' && surveyConfig.triggerOn.includes('chat_end')) ||
        (selectedConversation.channel === 'email' && surveyConfig.triggerOn.includes('email_resolved'));
      
      if (shouldTrigger) {
        const response = await triggerSurvey(
          selectedConversation.id,
          selectedConversation.customerId,
          selectedConversation.customerName,
          selectedConversation.channel,
          selectedConversation.agentId,
          selectedConversation.agentName
        );
        setSurveyResponseId(response.id);
        
        setTimeout(() => {
          setSurveyModalOpen(true);
        }, 1000);
      }
    }
    
    notify.success('Conversation ended', 'The conversation has been marked as completed and removed from the queue.');
  };

  const handleResolveConversation = async () => {
    if (!selectedConversation) return;
    await resolveConversation(selectedConversation.id);
    notify.success('Conversation resolved', `Conversation with ${selectedConversation.customerName} has been resolved.`);
  };

  const handleReport = (comment: string, priority: import('@/types/reportTickets').TicketPriority) => {
    if (!selectedConversation) return;
    const reportRole = (roleName === 'Supervisor' ? 'Supervisor' : 'Agent') as 'Agent' | 'Supervisor';
    createTicket(
      {
        conversationId: selectedConversation.id,
        customerName: selectedConversation.customerName,
        channel: selectedConversation.channel,
        topic: selectedConversation.topic,
        reportComment: comment,
        priority,
      },
      currentUser?.id || CURRENT_AGENT_ID,
      currentUser?.name || 'John Smith',
      reportRole
    );
    notify.success('Report submitted', 'Your report has been sent to the Client Admin for review.');
  };

  const handleSubmitSurvey = async (score: number, followUp?: string) => {
    if (!surveyResponseId) return;
    await submitSurveyResponse(surveyResponseId, score, followUp);
    setSurveyModalOpen(false);
    setSurveyResponseId(null);
    setEndedConversation(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const roleQueueStats = useMemo(() => {
    if (canViewAll) {
      return queueStats;
    }
    const assignedActive = roleFilteredConversations.filter(c => c.status === 'active').length;
    const assignedWaiting = roleFilteredConversations.filter(c => c.status === 'waiting').length;
    return {
      ...queueStats,
      activeConversations: assignedActive,
      totalWaiting: assignedWaiting,
    };
  }, [queueStats, roleFilteredConversations, canViewAll]);

  const tabs: { key: ChatTab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: roleFilteredConversations.length },
    { key: 'active', label: 'Active', count: chatCategoryStats.active },
    { key: 'queued', label: 'Queued', count: chatCategoryStats.queued },
    { key: 'resolved', label: 'Resolved', count: chatCategoryStats.resolved },
    { key: 'missed', label: 'Missed', count: chatCategoryStats.missed },
  ];

  const getAgentStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'away': return 'bg-muted-foreground';
      case 'offline': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getAgentStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return status;
    }
  };

  return (
    <AppLayout>
      <div className="absolute inset-6 flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Live Operations</h1>
            <p className="text-sm text-muted-foreground">
              {canViewAll 
                ? 'Monitor and manage real-time conversations'
                : 'View your assigned conversations'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-success" />
              Live
            </Badge>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              data-testid="button-refresh"
            >
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* SLA Breach Banner */}
        {slaStats.totalBreached > 0 && canViewAll && (
          <Alert variant="destructive" className="mb-4 flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <span className="font-semibold">{slaStats.totalBreached} SLA breach{slaStats.totalBreached > 1 ? 'es' : ''} detected</span>
              {' — '}
              {slaStats.activeBreached > 0 && `${slaStats.activeBreached} active`}
              {slaStats.activeBreached > 0 && slaStats.queueBreached > 0 && ', '}
              {slaStats.queueBreached > 0 && `${slaStats.queueBreached} in queue`}
            </AlertDescription>
          </Alert>
        )}

        {/* Role-based info banner for Agent */}
        {!canViewAll && (
          <Alert className="mb-4 flex-shrink-0">
            <Info className="w-4 h-4" />
            <AlertDescription>
              You are viewing only your assigned conversations. Contact a supervisor for full queue access.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4 flex-shrink-0">
          <Card className="gradient-card">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Headphones className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{roleQueueStats.activeConversations}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {canViewAll ? 'Active' : 'My Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xl font-bold">{roleQueueStats.totalWaiting}</p>
                  <p className="text-[10px] text-muted-foreground">Queued</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {canViewAll && (
            <>
              <Card className="gradient-card">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{queueStats.availableAgents}</p>
                      <p className="text-[10px] text-muted-foreground">Available Agents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{formatTime(queueStats.averageWaitTime)}</p>
                      <p className="text-[10px] text-muted-foreground">Avg Wait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{formatTime(queueStats.longestWait)}</p>
                      <p className="text-[10px] text-muted-foreground">Longest Wait</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{slaStats.totalBreached}</p>
                      <p className="text-[10px] text-muted-foreground">SLA Breaches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* Conversations List */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            {/* Chat Category Tabs */}
            <div className="flex gap-1 mb-3 flex-shrink-0 overflow-x-auto pb-1">
              {tabs.map(tab => (
                <Button
                  key={tab.key}
                  variant={activeTab === tab.key ? 'default' : 'outline'}
                  size="sm"
                  className="gap-1.5 shrink-0"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  <Badge
                    variant={activeTab === tab.key ? 'secondary' : 'outline'}
                    className="text-[10px] px-1.5 py-0 h-4 min-w-[1.25rem] flex items-center justify-center"
                  >
                    {tab.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Filters */}
            <Card className="gradient-card mb-4 flex-shrink-0">
              <CardContent className="pt-3 pb-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as ConversationChannel | 'all')}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Channels</SelectItem>
                        <SelectItem value="voice">Voice</SelectItem>
                        <SelectItem value="chat">Chat</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sentimentFilter} onValueChange={(v) => setSentimentFilter(v as SentimentType | 'all')}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sentiment</SelectItem>
                        <SelectItem value="positive">Positive</SelectItem>
                        <SelectItem value="neutral">Neutral</SelectItem>
                        <SelectItem value="negative">Negative</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversations */}
            <ScrollArea className="flex-1 min-h-0 h-full">
              <div className="space-y-3 pr-2">
                {filteredConversations.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Headphones className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-1">
                        {!canViewAll ? 'No assigned conversations' : 'No conversations found'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {!canViewAll 
                          ? 'You will see conversations assigned to you here'
                          : searchQuery || channelFilter !== 'all' || activeTab !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Conversations will appear here when customers connect'
                        }
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredConversations.map(conv => (
                    <ConversationCard
                      key={conv.id}
                      conversation={conv}
                      isSelected={selectedConversation?.id === conv.id}
                      onClick={() => setSelectedConversation(conv)}
                    />
                  ))
                )}
              </div>
            </ScrollArea>

            <p className="text-xs text-muted-foreground mt-3 flex-shrink-0">
              Showing {filteredConversations.length} of {roleFilteredConversations.length} conversations
              {!canViewAll && ' (assigned to you)'}
            </p>
          </div>

          {/* Agent Status Panel */}
          {canViewAll && (
            <div className="w-[260px] flex-shrink-0 flex flex-col min-h-0 overflow-hidden">
              <Card className="gradient-card flex flex-col min-h-0 overflow-hidden">
                <CardHeader
                  className="pb-2 pt-3 px-4 cursor-pointer flex-shrink-0"
                  onClick={() => setAgentPanelOpen(!agentPanelOpen)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Agent Status
                    </CardTitle>
                    {agentPanelOpen ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardHeader>
                {agentPanelOpen && (
                  <CardContent className="pt-0 px-4 pb-3 flex-1 min-h-0 overflow-y-auto">
                    <div className="space-y-3">
                      {agents.map(agent => (
                        <div key={agent.id} className="p-2 rounded-lg border bg-muted/30">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={cn('w-2 h-2 rounded-full', getAgentStatusColor(agent.status))} />
                            <span className="text-sm font-medium truncate flex-1">{agent.name}</span>
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {getAgentStatusLabel(agent.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(agent.currentConversations / agent.maxConversations) * 100}
                              className="h-1.5 flex-1"
                            />
                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                              {agent.currentConversations}/{agent.maxConversations}
                            </span>
                          </div>
                          {agent.skills.length > 0 && (
                            <div className="flex gap-1 mt-1.5 flex-wrap">
                              {agent.skills.map(skill => (
                                <Badge key={skill} variant="secondary" className="text-[9px] px-1 py-0">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}

          {/* Detail Panel */}
          {selectedConversation && (
            <>
              <div 
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setSelectedConversation(null)}
              />
              <ConversationDetailPanel
                conversation={selectedConversation}
                agents={agents}
                onClose={() => setSelectedConversation(null)}
                onMonitor={handleMonitor}
                onWhisper={handleWhisper}
                onBargeIn={handleBargeInClick}
                onTransfer={handleTransfer}
                onStopSupervision={handleStopSupervision}
                onEndConversation={handleEndConversation}
                onResolveConversation={handleResolveConversation}
                onReport={() => setReportModalOpen(true)}
              />
            </>
          )}
        </div>
      </div>

      <BargeInModal
        conversation={conversationToBargeIn}
        open={bargeInModalOpen}
        onOpenChange={setBargeInModalOpen}
        onConfirm={handleBargeInConfirm}
      />

      <ReportConversationModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        conversation={selectedConversation}
        onSubmit={handleReport}
      />

      <SurveyModal
        open={surveyModalOpen}
        onOpenChange={setSurveyModalOpen}
        surveyType={surveyConfig.surveyType}
        agentName={endedConversation?.agentName}
        followUpQuestion={surveyConfig.followUpQuestion}
        onSubmit={handleSubmitSurvey}
        isLoading={isGeneratingSummary}
      />
    </AppLayout>
  );
}
