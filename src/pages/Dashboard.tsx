import { useState } from 'react';
import { RefreshCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActiveCallsWidget } from '@/components/dashboard/ActiveCallsWidget';
import { ActiveChatsWidget } from '@/components/dashboard/ActiveChatsWidget';
import { ActiveEmailsWidget } from '@/components/dashboard/ActiveEmailsWidget';
import { SentimentWidget } from '@/components/dashboard/SentimentWidget';
import { UsageLimitsWidget } from '@/components/dashboard/UsageLimitsWidget';
import { ChannelUtilizationWidget } from '@/components/dashboard/ChannelUtilizationWidget';
import { AlertsWidget } from '@/components/dashboard/AlertsWidget';
import { useDashboardData } from '@/hooks/useDashboardData';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Real-time overview of your conversational AI operations
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Active Calls */}
        <ActiveCallsWidget calls={activeCalls} isLoading={isLoading} />
        
        {/* Active Chats */}
        <ActiveChatsWidget chats={activeChats} isLoading={isLoading} />
        
        {/* Active Emails */}
        <ActiveEmailsWidget emails={activeEmails} isLoading={isLoading} />
        
        {/* Sentiment Summary */}
        <SentimentWidget sentiment={sentimentData} isLoading={isLoading} />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Usage vs Limits */}
        <UsageLimitsWidget usage={usageData} isLoading={isLoading} />
        
        {/* Channel Utilization */}
        <ChannelUtilizationWidget utilization={channelUtilization} isLoading={isLoading} />
        
        {/* Alerts */}
        <AlertsWidget 
          alerts={alerts} 
          onAcknowledge={handleAcknowledgeAlert}
          isLoading={isLoading}
        />
      </div>

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
