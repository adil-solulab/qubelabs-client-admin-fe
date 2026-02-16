import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Play,
  Pause,
  Upload,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Search,
  TrendingUp,
  BarChart3,
  Lock,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadCard } from '@/components/outboundCalling/LeadCard';
import { LeadUploadModal } from '@/components/outboundCalling/LeadUploadModal';
import { EscalateLeadModal } from '@/components/outboundCalling/EscalateLeadModal';
import type {
  Campaign,
  Lead,
  LeadStatus,
  SentimentType,
  CallOutcomeStats,
  SentimentStats,
  UploadProgress,
  CampaignChannel,
  CampaignStatus,
} from '@/types/outboundCalling';
import { CAMPAIGN_STATUS_CONFIG, CHANNEL_CONFIG } from '@/types/outboundCalling';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface CampaignDetailViewProps {
  campaign: Campaign;
  leads: Lead[];
  outcomeStats: CallOutcomeStats;
  sentimentStats: SentimentStats;
  uploadProgress: UploadProgress | null;
  isUploading: boolean;
  onBack: () => void;
  onUploadLeads: (file: File) => Promise<{ success: boolean; leadsAdded: number }>;
  onEscalateLead: (leadId: string, agentName: string) => Promise<{ success: boolean }>;
  onClearUploadProgress: () => void;
  onUpdateStatus: (campaignId: string, status: CampaignStatus) => void;
}

const ChannelIcon = ({ channel }: { channel: CampaignChannel }) => {
  const icons = { voice: Phone, whatsapp: MessageCircle, sms: MessageSquare, email: Mail };
  const Icon = icons[channel];
  const config = CHANNEL_CONFIG[channel];
  return <Icon className={cn('w-4 h-4', config.color)} />;
};

export function CampaignDetailView({
  campaign,
  leads,
  outcomeStats,
  sentimentStats,
  uploadProgress,
  isUploading,
  onBack,
  onUploadLeads,
  onEscalateLead,
  onClearUploadProgress,
  onUpdateStatus,
}: CampaignDetailViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sentimentFilter, setSentimentFilter] = useState<SentimentType | 'all'>('all');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [leadToEscalate, setLeadToEscalate] = useState<Lead | null>(null);
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);

  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status];
  const pendingLeads = leads.filter(l => l.status === 'pending').length;
  const completionRate = campaign.totalLeads > 0
    ? Math.round((campaign.calledLeads / campaign.totalLeads) * 100)
    : 0;

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery);
      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSentiment = sentimentFilter === 'all' || lead.sentiment === sentimentFilter;
      return matchesSearch && matchesStatus && matchesSentiment;
    });
  }, [leads, searchQuery, statusFilter, sentimentFilter]);

  const handlePause = async () => {
    setIsPausing(true);
    await onUpdateStatus(campaign.id, 'paused');
    setIsPausing(false);
    notify.info('Campaign paused', 'Campaign has been paused.');
  };

  const handleResume = async () => {
    setIsResuming(true);
    await onUpdateStatus(campaign.id, 'running');
    setIsResuming(false);
    notify.success('Campaign resumed', 'Campaign has resumed.');
  };

  const handleEscalateClick = (lead: Lead) => {
    setLeadToEscalate(lead);
    setEscalateModalOpen(true);
  };

  const handleEscalateConfirm = async (leadId: string, agentName: string, _reason: string) => {
    await onEscalateLead(leadId, agentName);
    notify.success('Lead escalated', `Lead has been assigned to ${agentName}.`);
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{campaign.name}</h1>
              <Badge className={cn(statusConfig.bgColor, statusConfig.color)}>
                {campaign.status === 'running' && (
                  <div className="w-2 h-2 rounded-full bg-success mr-1 animate-pulse" />
                )}
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <ChannelIcon channel={campaign.channel} />
              <span>{CHANNEL_CONFIG[campaign.channel].label}</span>
              {campaign.templateName && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{campaign.templateName}</span>
                </>
              )}
              {campaign.segmentName && (
                <>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{campaign.segmentName}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setUploadModalOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Leads
          </Button>
          {campaign.status === 'running' && (
            <Button variant="secondary" onClick={handlePause} disabled={isPausing}>
              {isPausing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pause className="w-4 h-4 mr-2" />}
              {isPausing ? 'Pausing...' : 'Pause'}
            </Button>
          )}
          {campaign.status === 'paused' && (
            <Button onClick={handleResume} disabled={isResuming}>
              {isResuming ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              {isResuming ? 'Resuming...' : 'Resume'}
            </Button>
          )}
          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
            <Button onClick={() => onUpdateStatus(campaign.id, 'running')}>
              <Play className="w-4 h-4 mr-2" />
              Launch Campaign
            </Button>
          )}
        </div>
      </div>

      <Card className="gradient-card mb-6">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <Progress value={completionRate} className="flex-1 h-2.5 max-w-sm" />
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              {campaign.description && (
                <p className="text-sm text-muted-foreground">{campaign.description}</p>
              )}
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

      <Tabs defaultValue="leads" className="flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="leads">Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card className="gradient-card mb-4">
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

          <Card className="gradient-card">
            <CardContent className="p-0">
              <div className="space-y-3 p-4 min-h-[40vh]">
                {filteredLeads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">No leads found</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || statusFilter !== 'all' || sentimentFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Upload leads to start your campaign'}
                    </p>
                    {!searchQuery && statusFilter === 'all' && sentimentFilter === 'all' && (
                      <Button className="mt-4" onClick={() => setUploadModalOpen(true)}>
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
                      canEscalate={true}
                      canMakeCall={true}
                    />
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {filteredLeads.length} of {leads.length} leads
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="gradient-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: 'Positive', value: sentimentStats.positive, icon: '😊', cls: 'bg-success' },
                  { label: 'Neutral', value: sentimentStats.neutral, icon: '😐', cls: '' },
                  { label: 'Negative', value: sentimentStats.negative, icon: '😟', cls: 'bg-warning' },
                  { label: 'Escalated', value: sentimentStats.escalated, icon: '🚨', cls: 'bg-destructive' },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-1">
                        {item.icon} {item.label}
                      </span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                    <Progress
                      value={leads.length > 0 ? (item.value / leads.length) * 100 : 0}
                      className="h-2"
                      indicatorClassName={item.cls}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

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

            {(campaign.deliveryRate !== undefined || campaign.responseRate !== undefined) && (
              <Card className="gradient-card md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {campaign.deliveryRate !== undefined && (
                      <div className="text-center p-4 rounded-xl bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{campaign.deliveryRate}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Delivery Rate</p>
                      </div>
                    )}
                    {campaign.responseRate !== undefined && (
                      <div className="text-center p-4 rounded-xl bg-muted/50">
                        <p className="text-2xl font-bold text-primary">{campaign.responseRate}%</p>
                        <p className="text-xs text-muted-foreground mt-1">Response Rate</p>
                      </div>
                    )}
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold">{campaign.calledLeads}</p>
                      <p className="text-xs text-muted-foreground mt-1">Contacted</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold">{campaign.escalatedCalls}</p>
                      <p className="text-xs text-muted-foreground mt-1">Escalated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <LeadUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        onUpload={onUploadLeads}
        onClearProgress={onClearUploadProgress}
      />

      <EscalateLeadModal
        lead={leadToEscalate}
        open={escalateModalOpen}
        onOpenChange={setEscalateModalOpen}
        onConfirm={handleEscalateConfirm}
      />
    </div>
  );
}
