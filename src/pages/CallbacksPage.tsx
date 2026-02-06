import { useState, useCallback } from 'react';
import { Phone, Plus, Settings, RefreshCw, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCallbackData } from '@/hooks/useCallbackData';
import { notify } from '@/hooks/useNotification';
import { RequestCallbackModal } from '@/components/callback/RequestCallbackModal';
import { CallbackQueuePanel } from '@/components/callback/CallbackQueuePanel';
import { AgentNotificationPanel } from '@/components/callback/AgentNotificationPanel';

export default function CallbacksPage() {
  const {
    callbacks,
    queueStats,
    agentNotifications,
    isLoading,
    createCallback,
    acceptCallback,
    rejectCallback,
    retryCallback,
    startCallback,
    completeCallback,
    cancelCallback,
    notifyNextAgent,
    getPendingQueue,
    getScheduledCallbacks,
  } = useCallbackData();

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
    notify.success('Data refreshed', 'Callback queue data has been updated.');
  }, []);

  const handleCreateCallback = async (data: Parameters<typeof createCallback>[0]) => {
    await createCallback(data);
  };

  const handleAccept = async (callbackId: string) => {
    await acceptCallback(callbackId, 'current-agent', 'John Smith');
  };

  const handleReject = async (callbackId: string) => {
    await rejectCallback(callbackId, 'John Smith', 'Currently unavailable');
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Callback Queue</h1>
            <p className="text-sm text-muted-foreground">
              Manage customer callback requests and scheduled calls
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-success" />
              Live
            </Badge>
            
            {/* Agent Notification Bell */}
            <AgentNotificationPanel
              notifications={agentNotifications}
              onAccept={handleAccept}
              onReject={handleReject}
              isLoading={isLoading}
            />
            
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
            
            <Button onClick={() => setRequestModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Request Callback
            </Button>
          </div>
        </div>

        {/* Main Queue Panel */}
        <CallbackQueuePanel
          callbacks={callbacks}
          queueStats={queueStats}
          pendingQueue={getPendingQueue()}
          scheduledCallbacks={getScheduledCallbacks()}
          onAccept={handleAccept}
          onReject={handleReject}
          onRetry={retryCallback}
          onStart={startCallback}
          onComplete={completeCallback}
          onCancel={cancelCallback}
          onNotifyNext={notifyNextAgent}
          isLoading={isLoading}
        />

        {/* Request Callback Modal */}
        <RequestCallbackModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
          onSubmit={handleCreateCallback}
          isLoading={isLoading}
        />
      </div>
    </AppLayout>
  );
}
