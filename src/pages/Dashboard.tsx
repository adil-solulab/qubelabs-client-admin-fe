import { useState } from 'react';
import { RefreshCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardData } from '@/hooks/useDashboardData';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

// Client Admin Widgets (Global)
import { ActiveCallsWidget } from '@/components/dashboard/ActiveCallsWidget';
import { ActiveChatsWidget } from '@/components/dashboard/ActiveChatsWidget';
import { ActiveEmailsWidget } from '@/components/dashboard/ActiveEmailsWidget';
import { SentimentWidget } from '@/components/dashboard/SentimentWidget';
import { UsageLimitsWidget } from '@/components/dashboard/UsageLimitsWidget';
import { ChannelUtilizationWidget } from '@/components/dashboard/ChannelUtilizationWidget';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';

// Supervisor Widgets (Team)
import { TeamConversationsWidget } from '@/components/dashboard/TeamConversationsWidget';
import { SLABreachWidget } from '@/components/dashboard/SLABreachWidget';
import { AgentAvailabilityWidget } from '@/components/dashboard/AgentAvailabilityWidget';
import { EscalationAlertsWidget } from '@/components/dashboard/EscalationAlertsWidget';

// Agent Widgets (Personal)
import { AssignedConversationsWidget } from '@/components/dashboard/AssignedConversationsWidget';
import { PersonalQueueWidget } from '@/components/dashboard/PersonalQueueWidget';
import { PersonalPerformanceWidget } from '@/components/dashboard/PersonalPerformanceWidget';
import { AgentStatusToggleWidget } from '@/components/dashboard/AgentStatusToggleWidget';

const roleDescriptions = {
  'Client Admin': 'Global overview of your conversational AI operations',
  'Supervisor': 'Team performance and escalation management',
  'Agent': 'Your personal workspace and queue',
};

export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCcw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Role-Specific Dashboard Content */}
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

      {/* Live Status Footer */}
      <div className="flex items-center justify-center gap-2 py-4 border-t">
        <span className="status-dot status-dot-live" />
        <span className="text-xs text-muted-foreground">
          Live data streaming • Auto-refresh every 30 seconds
        </span>
      </div>
    </div>
  );
}

// Client Admin Dashboard - Full Global View
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
      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ActiveCallsWidget calls={activeCalls} isLoading={isLoading} />
        <ActiveChatsWidget chats={activeChats} isLoading={isLoading} />
        <ActiveEmailsWidget emails={activeEmails} isLoading={isLoading} />
        <SentimentWidget sentiment={sentimentData} isLoading={isLoading} />
      </div>

      {/* Second Row */}
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

// Supervisor Dashboard - Team Focus
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
  // Filter only SLA and escalation alerts for supervisors
  const supervisorAlerts = alerts.filter(a => 
    a.type === 'sla-breach' || a.type === 'idle-agent' || a.type === 'sentiment-drop'
  );

  return (
    <>
      {/* Team Overview Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TeamConversationsWidget isLoading={isLoading} />
        <SLABreachWidget isLoading={isLoading} />
      </div>

      {/* Agents & Escalations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AgentAvailabilityWidget isLoading={isLoading} />
        <EscalationAlertsWidget isLoading={isLoading} />
      </div>

      {/* Filtered Alerts */}
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

// Agent Dashboard - Personal Focus
interface AgentDashboardProps {
  isLoading: boolean;
}

function AgentDashboard({ isLoading }: AgentDashboardProps) {
  return (
    <>
      {/* Status & Performance Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AgentStatusToggleWidget isLoading={isLoading} />
        <PersonalPerformanceWidget isLoading={isLoading} />
      </div>

      {/* Conversations & Queue Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AssignedConversationsWidget isLoading={isLoading} />
        <PersonalQueueWidget isLoading={isLoading} />
      </div>
    </>
  );
}
