import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Lock,
  LayoutGrid,
  Radio,
  SmilePlus,
  Brain,
  FileText,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { notify } from '@/hooks/useNotification';
import { ExportReportModal } from '@/components/analytics/ExportReportModal';
import { OverviewTab } from '@/components/analytics/OverviewTab';
import { ChannelsTab } from '@/components/analytics/ChannelsTab';
import { SentimentSpeechTab } from '@/components/analytics/SentimentSpeechTab';
import { LLMAnalyticsTab } from '@/components/analytics/LLMAnalyticsTab';
import { TranscriptionTab } from '@/components/analytics/TranscriptionTab';
import { ComplianceTab } from '@/components/analytics/ComplianceTab';
import { CampaignAnalytics } from '@/components/analytics/CampaignAnalytics';
import type { TimeRange, AnalyticsTab } from '@/types/analytics';
import { cn } from '@/lib/utils';

const CURRENT_AGENT = {
  id: 'agent-1',
  name: 'John Smith',
};

const TAB_CONFIG: { id: AnalyticsTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'channels', label: 'Channels', icon: Radio },
  { id: 'sentiment', label: 'Sentiment & Speech', icon: SmilePlus },
  { id: 'llm', label: 'LLM Analytics', icon: Brain },
  { id: 'transcription', label: 'Transcription', icon: FileText },
  { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
  { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
];

export default function AnalyticsPage() {
  const { toast } = useToast();
  const { currentRole, isClientAdmin } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';
  const [searchParams, setSearchParams] = useSearchParams();

  const canViewGlobalAnalytics = isClientAdmin;
  const canViewTeamAnalytics = isClientAdmin || roleName === 'Supervisor';
  const canExportReports = isClientAdmin;

  const {
    timeRange,
    setTimeRange,
    channelFilter,
    setChannelFilter,
    conversationMetrics,
    agentMetrics,
    channelUtilization,
    csatNpsData,
    sentimentTrends,
    conversationTrends,
    outcomeKPIs,
    campaignMetrics,
    channelAnalytics,
    speechAnalytics,
    llmAnalytics,
    transcriptionAnalytics,
    complianceAnalytics,
    exportReport,
  } = useAnalyticsData();

  const initialTab = (searchParams.get('tab') as AnalyticsTab) || 'overview';
  const [activeTab, setActiveTab] = useState<AnalyticsTab>(initialTab);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as AnalyticsTab;
    if (tabParam && TAB_CONFIG.some(t => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as AnalyticsTab);
    setSearchParams({ tab });
  };

  const handleExportClick = () => {
    if (!canExportReports) {
      notify.error('Permission denied', 'You do not have permission to export reports.');
      return;
    }
    setExportModalOpen(true);
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!canExportReports) {
      notify.error('Permission denied', 'You do not have permission to export reports.');
      return { success: false };
    }
    const result = await exportReport(format);
    if (result.success) {
      toast({
        title: 'Report Downloaded',
        description: `Your ${format.toUpperCase()} report has been generated and downloaded.`,
      });
    }
    return result;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoleDescription = () => {
    if (isClientAdmin) return 'Global analytics across all agents and channels';
    if (roleName === 'Supervisor') return 'Team-level analytics for your agents';
    return 'Your personal performance metrics';
  };

  const LockedButton = ({ children, tooltip }: { children: React.ReactNode; tooltip: string }) => (
    <UITooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
          <Lock className="w-4 h-4 mr-2" />
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </UITooltip>
  );

  return (
    <AppLayout
      title="Analytics"
      subtitle={getRoleDescription()}
      icon={BarChart3}
      actions={
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          {canExportReports ? (
            <Button variant="outline" size="sm" onClick={handleExportClick} className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          ) : (
            <LockedButton tooltip="Only Client Admin can export reports">
              Export Report
            </LockedButton>
          )}
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {TAB_CONFIG.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="gap-1.5 text-xs sm:text-sm data-[state=active]:bg-background"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab
              conversationMetrics={conversationMetrics}
              agentMetrics={agentMetrics}
              channelUtilization={channelUtilization}
              csatNpsData={csatNpsData}
              sentimentTrends={sentimentTrends}
              conversationTrends={conversationTrends}
              outcomeKPIs={outcomeKPIs}
              canViewGlobalAnalytics={canViewGlobalAnalytics}
              canViewTeamAnalytics={canViewTeamAnalytics}
              roleName={roleName}
              formatDuration={formatDuration}
            />
          </TabsContent>

          <TabsContent value="channels" className="mt-6">
            <ChannelsTab channelAnalytics={channelAnalytics} />
          </TabsContent>

          <TabsContent value="sentiment" className="mt-6">
            <SentimentSpeechTab
              speechAnalytics={speechAnalytics}
              sentimentTrends={sentimentTrends}
            />
          </TabsContent>

          <TabsContent value="llm" className="mt-6">
            <LLMAnalyticsTab llmAnalytics={llmAnalytics} />
          </TabsContent>

          <TabsContent value="transcription" className="mt-6">
            <TranscriptionTab transcriptionAnalytics={transcriptionAnalytics} />
          </TabsContent>

          <TabsContent value="compliance" className="mt-6">
            <ComplianceTab complianceAnalytics={complianceAnalytics} />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6">
            <CampaignAnalytics campaignMetrics={campaignMetrics} />
          </TabsContent>
        </Tabs>
      </div>

      <ExportReportModal
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
        onExport={handleExport}
      />
    </AppLayout>
  );
}
