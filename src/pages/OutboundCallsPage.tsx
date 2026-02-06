import { useState, useMemo } from 'react';
import {
  Phone,
  Upload,
  Play,
  Pause,
  Users,
  CheckCircle,
  XCircle,
  UserPlus,
  Clock,
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  Lock,
  Info,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOutboundCallingData } from '@/hooks/useOutboundCallingData';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import { LeadUploadModal } from '@/components/outboundCalling/LeadUploadModal';
import { StartCampaignModal } from '@/components/outboundCalling/StartCampaignModal';
import { EscalateLeadModal } from '@/components/outboundCalling/EscalateLeadModal';
import { LeadCard } from '@/components/outboundCalling/LeadCard';
import type { Lead, SentimentType, LeadStatus } from '@/types/outboundCalling';
import { CAMPAIGN_STATUS_CONFIG } from '@/types/outboundCalling';
import { cn } from '@/lib/utils';

// Simulated current agent ID for demo
const CURRENT_AGENT_ID = 'Agent Smith';

export default function OutboundCallsPage() {
  const {
    leads,
    campaign,
    outcomeStats,
    sentimentStats,
    uploadProgress,
    isUploading,
    uploadLeads,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    escalateLead,
    clearUploadProgress,
  } = useOutboundCallingData();

  const { currentRole, isClientAdmin } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';

  // Role-based permissions
  const canUploadLeads = isClientAdmin;
  const canManageCampaign = isClientAdmin; // Start/Stop/Pause
  const canViewAnalytics = isClientAdmin || roleName === 'Supervisor';
  const canMakeCalls = isClientAdmin || roleName === 'Agent';
  const canEscalate = isClientAdmin || roleName === 'Supervisor';

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [leadToEscalate, setLeadToEscalate] = useState<Lead | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');

  const campaignStatus = CAMPAIGN_STATUS_CONFIG[campaign.status];
  const pendingLeads = leads.filter(l => l.status === 'pending').length;
  const completionRate = campaign.totalLeads > 0 
    ? Math.round((campaign.calledLeads / campaign.totalLeads) * 100) 
    : 0;

  // Filter leads based on role
  const roleFilteredLeads = useMemo(() => {
    if (isClientAdmin || roleName === 'Supervisor') {
      return leads;
    }
    // Agent can only see assigned leads (escalated to them or currently calling)
    return leads.filter(lead => 
      lead.escalatedTo === CURRENT_AGENT_ID || 
      lead.status === 'calling'
    );
  }, [leads, isClientAdmin, roleName]);

  // Apply user filters
  const filteredLeads = roleFilteredLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSentiment = sentimentFilter === 'all' || lead.sentiment === sentimentFilter;
    return matchesSearch && matchesStatus && matchesSentiment;
  });

  const handleUploadClick = () => {
    if (!canUploadLeads) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    setUploadModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    if (!canUploadLeads) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return { success: false, leadsAdded: 0 };
    }
    const result = await uploadLeads(file);
    if (result.success) {
      notify.uploaded(`${result.leadsAdded} leads added to campaign`);
    } else {
      notify.error('Upload failed', 'Failed to upload leads. Please try again.');
    }
    return result;
  };

  const handleStartCampaignClick = () => {
    if (!canManageCampaign) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    setStartModalOpen(true);
  };

  const handleStartCampaign = async () => {
    if (!canManageCampaign) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    try {
      await startCampaign();
      notify.success('Campaign started', 'AI calling has begun. Monitor progress in the dashboard.');
    } catch {
      notify.error('Failed to start', 'Could not start the campaign. Please try again.');
    }
  };

  const handlePauseCampaign = async () => {
    if (!canManageCampaign) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    setIsPausing(true);
    await pauseCampaign();
    setIsPausing(false);
    notify.info('Campaign paused', 'AI calling has been paused. Resume when ready.');
  };

  const handleResumeCampaign = async () => {
    if (!canManageCampaign) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    setIsResuming(true);
    await resumeCampaign();
    setIsResuming(false);
    notify.success('Campaign resumed', 'AI calling has resumed.');
  };

  const handleEscalateClick = (lead: Lead) => {
    if (!canEscalate) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    setLeadToEscalate(lead);
    setEscalateModalOpen(true);
  };

  const handleEscalateConfirm = async (leadId: string, agentName: string, _reason: string) => {
    if (!canEscalate) {
      notify.error('Permission denied', 'You do not have permission to perform this action.');
      return;
    }
    await escalateLead(leadId, agentName);
    notify.success('Lead escalated', `Lead has been assigned to ${agentName}.`);
  };

  // Locked button helper
  const LockedButton = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
          <Lock className="w-4 h-4 mr-2" />
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );

  // Role description
  const getRoleDescription = () => {
    if (isClientAdmin) return 'Manage campaigns, upload leads, and view analytics';
    if (roleName === 'Supervisor') return 'View campaign performance and analytics';
    return 'View and handle your assigned calls';
  };

  return (
    <AppLayout>
      <div className="flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Outbound AI Calling</h1>
            <p className="text-sm text-muted-foreground">
              {getRoleDescription()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Upload Leads - Client Admin only */}
            {canUploadLeads ? (
              <Button variant="outline" onClick={handleUploadClick}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Leads
              </Button>
            ) : (
              <LockedButton tooltip="Client Admin access required">
                Upload Leads
              </LockedButton>
            )}

            {/* Campaign Controls - Client Admin only */}
            {canManageCampaign ? (
              campaign.status === 'draft' || campaign.status === 'completed' ? (
                <Button onClick={handleStartCampaignClick} disabled={pendingLeads === 0}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Campaign
                </Button>
              ) : campaign.status === 'running' ? (
                <Button variant="secondary" onClick={handlePauseCampaign} disabled={isPausing}>
                  {isPausing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  {isPausing ? 'Pausing...' : 'Pause'}
                </Button>
              ) : (
                <Button onClick={handleResumeCampaign} disabled={isResuming}>
                  {isResuming ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  {isResuming ? 'Resuming...' : 'Resume'}
                </Button>
              )
            ) : (
              <LockedButton tooltip="Client Admin access required">
                {campaign.status === 'running' ? 'Pause' : 'Start Campaign'}
              </LockedButton>
            )}
          </div>
        </div>

        {/* Role-based info banner */}
        {roleName === 'Agent' && (
          <Alert className="mb-4 flex-shrink-0">
            <Info className="w-4 h-4" />
            <AlertDescription>
              You are viewing only leads assigned to you. Contact a supervisor for campaign management.
            </AlertDescription>
          </Alert>
        )}

        {roleName === 'Supervisor' && (
          <Alert className="mb-4 flex-shrink-0">
            <BarChart3 className="w-4 h-4" />
            <AlertDescription>
              You have view-only access to campaign performance. Contact Client Admin for campaign management.
            </AlertDescription>
          </Alert>
        )}

        {/* Campaign Stats - Visible to Client Admin and Supervisor */}
        {canViewAnalytics && (
          <Card className="gradient-card mb-4 flex-shrink-0">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <Badge className={cn(campaignStatus.bgColor, campaignStatus.color)}>
                      {campaign.status === 'running' && (
                        <div className="w-2 h-2 rounded-full bg-success mr-1 animate-pulse" />
                      )}
                      {campaignStatus.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">Progress:</span>
                    <Progress value={completionRate} className="flex-1 h-2 max-w-xs" />
                    <span className="text-sm font-medium">{completionRate}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{campaign.totalLeads}</p>
                    <p className="text-[10px] text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold">{pendingLeads}</p>
                    <p className="text-[10px] text-muted-foreground">Pending</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-success/10">
                    <p className="text-lg font-bold text-success">{outcomeStats.answered}</p>
                    <p className="text-[10px] text-muted-foreground">Answered</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-warning/10">
                    <p className="text-lg font-bold text-warning">{outcomeStats.noAnswer}</p>
                    <p className="text-[10px] text-muted-foreground">No Answer</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-destructive/10">
                    <p className="text-lg font-bold text-destructive">{outcomeStats.failed}</p>
                    <p className="text-[10px] text-muted-foreground">Failed</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-purple-500/10">
                    <p className="text-lg font-bold text-purple-500">{outcomeStats.escalated}</p>
                    <p className="text-[10px] text-muted-foreground">Escalated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-4">
          {/* Leads List */}
          <div className="min-w-0">
            {/* Filters */}
            <Card className="gradient-card mb-4 flex-shrink-0">
              <CardContent className="pt-3 pb-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="calling">Calling</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="no_answer">No Answer</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="escalated">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sentimentFilter} onValueChange={(v) => setSentimentFilter(v as SentimentType | 'all')}>
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Sentiment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sentiment</SelectItem>
                        <SelectItem value="positive">😊 Positive</SelectItem>
                        <SelectItem value="neutral">😐 Neutral</SelectItem>
                        <SelectItem value="negative">😟 Negative</SelectItem>
                        <SelectItem value="escalated">🚨 Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leads Card */}
            <Card className="gradient-card">
              <CardContent className="p-0">
                <div className="space-y-3 p-4 min-h-[60vh]">
                  {filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-1">
                        {roleName === 'Agent' ? 'No assigned leads' : 'No leads found'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {roleName === 'Agent'
                          ? 'Leads assigned to you will appear here'
                          : searchQuery || statusFilter !== 'all' || sentimentFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Upload leads to start your campaign'}
                      </p>
                      {!searchQuery && statusFilter === 'all' && sentimentFilter === 'all' && canUploadLeads && (
                        <Button className="mt-4" onClick={handleUploadClick}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Leads
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredLeads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onEscalate={() => handleEscalateClick(lead)}
                        canEscalate={canEscalate}
                        canMakeCall={canMakeCalls}
                      />
                    ))
                  )}
                </div>

                <div className="px-4 py-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredLeads.length} of {roleFilteredLeads.length} leads
                    {roleName === 'Agent' && ' (assigned to you)'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Stats - Only for Client Admin and Supervisor */}
          {canViewAnalytics && (
            <div className="space-y-4">
              {/* Sentiment Distribution */}
              <Card className="gradient-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sentiment Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1">
                        😊 Positive
                      </span>
                      <span className="text-sm font-medium">{sentimentStats.positive}</span>
                    </div>
                    <Progress 
                      value={leads.length > 0 ? (sentimentStats.positive / leads.length) * 100 : 0} 
                      className="h-2" 
                      indicatorClassName="bg-success"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1">
                        😐 Neutral
                      </span>
                      <span className="text-sm font-medium">{sentimentStats.neutral}</span>
                    </div>
                    <Progress 
                      value={leads.length > 0 ? (sentimentStats.neutral / leads.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1">
                        😟 Negative
                      </span>
                      <span className="text-sm font-medium">{sentimentStats.negative}</span>
                    </div>
                    <Progress 
                      value={leads.length > 0 ? (sentimentStats.negative / leads.length) * 100 : 0} 
                      className="h-2" 
                      indicatorClassName="bg-warning"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1">
                        🚨 Escalated
                      </span>
                      <span className="text-sm font-medium">{sentimentStats.escalated}</span>
                    </div>
                    <Progress 
                      value={leads.length > 0 ? (sentimentStats.escalated / leads.length) * 100 : 0} 
                      className="h-2" 
                      indicatorClassName="bg-destructive"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Call Outcomes */}
              <Card className="gradient-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Call Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-success/10 text-center">
                      <CheckCircle className="w-5 h-5 text-success mx-auto mb-1" />
                      <p className="text-lg font-bold">{outcomeStats.answered}</p>
                      <p className="text-[10px] text-muted-foreground">Answered</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted text-center">
                      <Phone className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="text-lg font-bold">{outcomeStats.voicemail}</p>
                      <p className="text-[10px] text-muted-foreground">Voicemail</p>
                    </div>
                    <div className="p-3 rounded-lg bg-warning/10 text-center">
                      <Clock className="w-5 h-5 text-warning mx-auto mb-1" />
                      <p className="text-lg font-bold">{outcomeStats.noAnswer}</p>
                      <p className="text-[10px] text-muted-foreground">No Answer</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 text-center">
                      <XCircle className="w-5 h-5 text-destructive mx-auto mb-1" />
                      <p className="text-lg font-bold">{outcomeStats.failed}</p>
                      <p className="text-[10px] text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="gradient-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Duration</span>
                    <span className="text-sm font-medium">
                      {Math.floor(campaign.averageDuration / 60)}:{(campaign.averageDuration % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium text-success">
                      {campaign.calledLeads > 0 
                        ? Math.round((campaign.successfulCalls / campaign.calledLeads) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Escalation Rate</span>
                    <span className="text-sm font-medium text-purple-500">
                      {campaign.calledLeads > 0 
                        ? Math.round((campaign.escalatedCalls / campaign.calledLeads) * 100) 
                        : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LeadUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        onUpload={handleUpload}
        onClearProgress={clearUploadProgress}
      />

      <StartCampaignModal
        campaign={campaign}
        pendingLeadsCount={pendingLeads}
        open={startModalOpen}
        onOpenChange={setStartModalOpen}
        onConfirm={handleStartCampaign}
      />

      <EscalateLeadModal
        lead={leadToEscalate}
        open={escalateModalOpen}
        onOpenChange={setEscalateModalOpen}
        onConfirm={handleEscalateConfirm}
      />
    </AppLayout>
  );
}
