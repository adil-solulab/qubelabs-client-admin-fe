import { useState } from 'react';
import { RefreshCcw, Clock, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

import { ActiveCallsWidget } from '@/components/dashboard/ActiveCallsWidget';
import { ActiveChatsWidget } from '@/components/dashboard/ActiveChatsWidget';
import { ActiveEmailsWidget } from '@/components/dashboard/ActiveEmailsWidget';
import { SentimentWidget } from '@/components/dashboard/SentimentWidget';
import { UsageLimitsWidget } from '@/components/dashboard/UsageLimitsWidget';
import { ChannelUtilizationWidget } from '@/components/dashboard/ChannelUtilizationWidget';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';

import { TeamConversationsWidget } from '@/components/dashboard/TeamConversationsWidget';
import { SLABreachWidget } from '@/components/dashboard/SLABreachWidget';
import { AgentAvailabilityWidget } from '@/components/dashboard/AgentAvailabilityWidget';
import { EscalationAlertsWidget } from '@/components/dashboard/EscalationAlertsWidget';

import { AssignedConversationsWidget } from '@/components/dashboard/AssignedConversationsWidget';
import { PersonalQueueWidget } from '@/components/dashboard/PersonalQueueWidget';
import { PersonalPerformanceWidget } from '@/components/dashboard/PersonalPerformanceWidget';
import { AgentStatusToggleWidget } from '@/components/dashboard/AgentStatusToggleWidget';

import {
  TotalConversationsKPI,
  ResolutionRateKPI,
  AvgDurationKPI,
  CSATScoreKPI,
  NPSScoreKPI,
  HandoffRateKPI,
  ConversationVolumeChart,
  SentimentTrendsChart,
  ChannelUtilizationChart,
  CSATTrendChart,
  NPSBreakdownChart,
  AgentPerformanceTable,
  OutcomeKPIWidget,
} from '@/components/dashboard/AnalyticsWidgets';
import { CustomizeDashboardModal } from '@/components/dashboard/CustomizeDashboardModal';

const roleDescriptions = {
  'Client Admin': 'Global overview of your conversational AI operations',
  'Supervisor': 'Team performance and escalation management',
  'Agent': 'Your personal workspace and queue',
};

export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const { currentRole, isClientAdmin } = useAuth();

  const {
    isLoading,
    activeCalls,
    activeChats,
    activeEmails,
    sentimentData,
    usageData,
    channelUtilization,
    alerts,
    refreshData,
    acknowledgeAlert,
  } = useDashboardData();

  const analyticsData = useAnalyticsData();
  const dashboardConfig = useDashboardConfig();

  const handleRefresh = async () => {
    await refreshData();
    setLastRefresh(new Date());
    notify.success('Dashboard Refreshed', 'All widgets have been updated with the latest data.');
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    acknowledgeAlert(alertId);
    notify.info('Alert acknowledged');
  };

  const roleName = currentRole?.name || 'Client Admin';

  const enabledKPIs = dashboardConfig.enabledWidgets.filter((id) =>
    dashboardConfig.registry.find((w) => w.id === id && w.category === 'kpi')
  );
  const enabledCharts = dashboardConfig.enabledWidgets.filter((id) =>
    dashboardConfig.registry.find((w) => w.id === id && w.category === 'chart')
  );

  const showAnalyticsSection = enabledKPIs.length > 0 || enabledCharts.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {roleDescriptions[roleName as keyof typeof roleDescriptions] || roleDescriptions['Client Admin']}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizeOpen(true)}
            className="gap-2"
          >
            <Settings2 className="w-4 h-4" />
            Customize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCcw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {isClientAdmin ? (
        <ClientAdminDashboard
          isLoading={isLoading}
          activeCalls={activeCalls}
          activeChats={activeChats}
          activeEmails={activeEmails}
          sentimentData={sentimentData}
          usageData={usageData}
          channelUtilization={channelUtilization}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      ) : roleName === 'Supervisor' ? (
        <SupervisorDashboard
          isLoading={isLoading}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
        />
      ) : (
        <AgentDashboard isLoading={isLoading} />
      )}

      {showAnalyticsSection && (
        <>
          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">Analytics Insights</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Customizable analytics widgets from your Analytics section
            </p>
          </div>

          {enabledKPIs.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {enabledKPIs.map((id) => {
                switch (id) {
                  case 'total-conversations':
                    return <TotalConversationsKPI key={id} data={analyticsData.conversationMetrics} />;
                  case 'resolution-rate':
                    return <ResolutionRateKPI key={id} data={analyticsData.conversationMetrics} />;
                  case 'avg-duration':
                    return <AvgDurationKPI key={id} data={analyticsData.conversationMetrics} />;
                  case 'csat-score':
                    return <CSATScoreKPI key={id} data={analyticsData.csatNpsData} />;
                  case 'nps-score':
                    return <NPSScoreKPI key={id} data={analyticsData.csatNpsData} />;
                  case 'handoff-rate':
                    return <HandoffRateKPI key={id} data={analyticsData.conversationMetrics} />;
                  case 'time-saved':
                  case 'effort-saved':
                  case 'conversion-rate':
                  case 'engagement-rate': {
                    const kpi = analyticsData.outcomeKPIs?.find(k => k.id === id);
                    return kpi ? <OutcomeKPIWidget key={id} kpi={kpi} /> : null;
                  }
                  default:
                    return null;
                }
              })}
            </div>
          )}

          {enabledCharts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {enabledCharts.map((id) => {
                switch (id) {
                  case 'conversation-volume':
                    return <ConversationVolumeChart key={id} data={analyticsData.conversationTrends} />;
                  case 'sentiment-trends':
                    return <SentimentTrendsChart key={id} data={analyticsData.sentimentTrends} />;
                  case 'channel-utilization':
                    return <ChannelUtilizationChart key={id} data={analyticsData.channelUtilization} />;
                  case 'csat-trend':
                    return <CSATTrendChart key={id} data={analyticsData.csatNpsData} />;
                  case 'nps-breakdown':
                    return <NPSBreakdownChart key={id} data={analyticsData.csatNpsData} />;
                  case 'agent-performance':
                    return <AgentPerformanceTable key={id} data={analyticsData.agentMetrics} />;
                  default:
                    return null;
                }
              })}
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-center gap-2 py-4 border-t">
        <span className="status-dot status-dot-live" />
        <span className="text-xs text-muted-foreground">
          Live data streaming • Auto-refresh every 30 seconds
        </span>
      </div>

      <CustomizeDashboardModal
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        registry={dashboardConfig.registry}
        enabledWidgets={dashboardConfig.enabledWidgets}
        onSave={(widgets) => {
          dashboardConfig.setWidgets(widgets);
          notify.success('Dashboard Updated', 'Your dashboard layout has been saved.');
        }}
        onReset={() => {
          dashboardConfig.resetToDefaults();
          notify.info('Dashboard reset to default layout.');
        }}
      />
    </div>
  );
}

interface ClientAdminDashboardProps {
  isLoading: boolean;
  activeCalls: any[];
  activeChats: any[];
  activeEmails: any[];
  sentimentData: any;
  usageData: any[];
  channelUtilization: any;
  alerts: any[];
  onAcknowledgeAlert: (id: string) => void;
}

function ClientAdminDashboard({
  isLoading,
  activeCalls,
  activeChats,
  activeEmails,
  sentimentData,
  usageData,
  channelUtilization,
  alerts,
  onAcknowledgeAlert,
}: ClientAdminDashboardProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ActiveCallsWidget calls={activeCalls} isLoading={isLoading} />
        <ActiveChatsWidget chats={activeChats} isLoading={isLoading} />
        <ActiveEmailsWidget emails={activeEmails} isLoading={isLoading} />
        <SentimentWidget sentiment={sentimentData} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UsageLimitsWidget usage={usageData} isLoading={isLoading} />
        <ChannelUtilizationWidget utilization={channelUtilization} isLoading={isLoading} />
        <AlertsWidget
          alerts={alerts}
          onAcknowledge={onAcknowledgeAlert}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}

interface SupervisorDashboardProps {
  isLoading: boolean;
  alerts: any[];
  onAcknowledgeAlert: (id: string) => void;
}

function SupervisorDashboard({
  isLoading,
  alerts,
  onAcknowledgeAlert,
}: SupervisorDashboardProps) {
  const supervisorAlerts = alerts.filter(a =>
    a.type === 'sla-breach' || a.type === 'idle-agent' || a.type === 'sentiment-drop'
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TeamConversationsWidget isLoading={isLoading} />
        <SLABreachWidget isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AgentAvailabilityWidget isLoading={isLoading} />
        <EscalationAlertsWidget isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AlertsWidget
          alerts={supervisorAlerts}
          onAcknowledge={onAcknowledgeAlert}
          isLoading={isLoading}
        />
      </div>
    </>
  );
}

interface AgentDashboardProps {
  isLoading: boolean;
}

function AgentDashboard({ isLoading }: AgentDashboardProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AgentStatusToggleWidget isLoading={isLoading} />
        <PersonalPerformanceWidget isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AssignedConversationsWidget isLoading={isLoading} />
        <PersonalQueueWidget isLoading={isLoading} />
      </div>
    </>
  );
}
