import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Trash2,
  Eye,
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Calendar,
  Users,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Campaign, CampaignStatus, CampaignChannel } from '@/types/outboundCalling';
import { CAMPAIGN_STATUS_CONFIG, CHANNEL_CONFIG } from '@/types/outboundCalling';
import { cn } from '@/lib/utils';

interface CampaignListViewProps {
  campaigns: Campaign[];
  onCreateCampaign: () => void;
  onViewCampaign: (campaignId: string) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onUpdateStatus: (campaignId: string, status: CampaignStatus) => void;
}

const ChannelIcon = ({ channel }: { channel: CampaignChannel }) => {
  const icons = {
    voice: Phone,
    whatsapp: MessageCircle,
    sms: MessageSquare,
    email: Mail,
  };
  const Icon = icons[channel];
  const config = CHANNEL_CONFIG[channel];
  return (
    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
      <Icon className={cn('w-4 h-4', config.color)} />
    </div>
  );
};

export function CampaignListView({
  campaigns,
  onCreateCampaign,
  onViewCampaign,
  onDeleteCampaign,
  onUpdateStatus,
}: CampaignListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<CampaignChannel | 'all'>('all');

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesChannel = channelFilter === 'all' || campaign.channel === channelFilter;
    return matchesSearch && matchesStatus && matchesChannel;
  });

  const stats = {
    total: campaigns.length,
    running: campaigns.filter(c => c.status === 'running').length,
    scheduled: campaigns.filter(c => c.status === 'scheduled').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Outbound Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage outbound campaigns across multiple channels
          </p>
        </div>
        <Button onClick={onCreateCampaign} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Play className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.running}</p>
                <p className="text-xs text-muted-foreground">Running</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CampaignStatus | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v as CampaignChannel | 'all')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Channels</SelectItem>
                  <SelectItem value="voice">Voice</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gradient-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Campaign</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold">No campaigns found</p>
                        <p className="text-sm text-muted-foreground">
                          {searchQuery || statusFilter !== 'all' || channelFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first campaign to get started'}
                        </p>
                      </div>
                      {!searchQuery && statusFilter === 'all' && channelFilter === 'all' && (
                        <Button onClick={onCreateCampaign} className="mt-2">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Campaign
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const statusConfig = CAMPAIGN_STATUS_CONFIG[campaign.status];
                  const completionRate = campaign.totalLeads > 0
                    ? Math.round((campaign.calledLeads / campaign.totalLeads) * 100)
                    : 0;

                  return (
                    <TableRow
                      key={campaign.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onViewCampaign(campaign.id)}
                    >
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{campaign.name}</p>
                          {campaign.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {campaign.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ChannelIcon channel={campaign.channel} />
                          <span className="text-sm">{CHANNEL_CONFIG[campaign.channel].label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                          {campaign.status === 'running' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 animate-pulse" />
                          )}
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm">{campaign.totalLeads.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.status !== 'draft' ? (
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={completionRate} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-8">{completionRate}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm">{formatDate(campaign.createdAt)}</span>
                          <span className="text-xs text-muted-foreground">{formatTime(campaign.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewCampaign(campaign.id); }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {campaign.status === 'running' && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(campaign.id, 'paused'); }}>
                                <Pause className="w-4 h-4 mr-2" />
                                Pause Campaign
                              </DropdownMenuItem>
                            )}
                            {campaign.status === 'paused' && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(campaign.id, 'running'); }}>
                                <Play className="w-4 h-4 mr-2" />
                                Resume Campaign
                              </DropdownMenuItem>
                            )}
                            {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(campaign.id, 'running'); }}>
                                <Play className="w-4 h-4 mr-2" />
                                Launch Campaign
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={(e) => { e.stopPropagation(); onDeleteCampaign(campaign.id); }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Campaign
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {filteredCampaigns.length > 0 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
