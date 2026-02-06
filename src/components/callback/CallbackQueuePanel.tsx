import { useState } from 'react';
import { format } from 'date-fns';
import {
  Phone,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
  Filter,
  CheckCircle,
  XCircle,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CallbackCard } from './CallbackCard';
import { CallbackRequest, CallbackQueueStats, CallbackPriority } from '@/types/callback';
import { cn } from '@/lib/utils';

interface CallbackQueuePanelProps {
  callbacks: CallbackRequest[];
  queueStats: CallbackQueueStats;
  pendingQueue: CallbackRequest[];
  scheduledCallbacks: CallbackRequest[];
  onAccept: (callbackId: string) => void;
  onReject: (callbackId: string) => void;
  onRetry: (callbackId: string) => void;
  onStart: (callbackId: string) => void;
  onComplete: (callbackId: string) => void;
  onCancel: (callbackId: string) => void;
  onNotifyNext: (callbackId: string) => void;
  isLoading?: boolean;
}

export function CallbackQueuePanel({
  callbacks,
  queueStats,
  pendingQueue,
  scheduledCallbacks,
  onAccept,
  onReject,
  onRetry,
  onStart,
  onComplete,
  onCancel,
  onNotifyNext,
  isLoading = false,
}: CallbackQueuePanelProps) {
  const [activeTab, setActiveTab] = useState('queue');
  const [priorityFilter, setPriorityFilter] = useState<CallbackPriority | 'all'>('all');

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const filteredQueue = pendingQueue.filter(cb => 
    priorityFilter === 'all' || cb.priority === priorityFilter
  );

  const activeCallbacks = callbacks.filter(cb => 
    ['notified', 'accepted', 'in_progress'].includes(cb.status)
  );

  const failedCallbacks = callbacks.filter(cb => cb.status === 'failed');

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{queueStats.totalPending}</p>
                <p className="text-[10px] text-muted-foreground">In Queue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{queueStats.totalScheduled}</p>
                <p className="text-[10px] text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold">{queueStats.completedToday}</p>
                <p className="text-[10px] text-muted-foreground">Completed Today</p>
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
      </div>

      {/* Callback Tabs */}
      <Card className="gradient-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Callback Queue
              </CardTitle>
              <CardDescription>Manage customer callback requests</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 animate-pulse">
              <div className="w-2 h-2 rounded-full bg-success" />
              {queueStats.availableAgentsForCallback} agents ready
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between gap-3 mb-4">
              <TabsList>
                <TabsTrigger value="queue" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Queue ({pendingQueue.length})
                </TabsTrigger>
                <TabsTrigger value="active" className="gap-1">
                  <Phone className="w-3 h-3" />
                  Active ({activeCallbacks.length})
                </TabsTrigger>
                <TabsTrigger value="scheduled" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Scheduled ({scheduledCallbacks.length})
                </TabsTrigger>
                <TabsTrigger value="failed" className="gap-1">
                  <XCircle className="w-3 h-3" />
                  Failed ({failedCallbacks.length})
                </TabsTrigger>
              </TabsList>

              {activeTab === 'queue' && (
                <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as CallbackPriority | 'all')}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="w-3 h-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">🔴 Urgent</SelectItem>
                    <SelectItem value="high">🟡 High</SelectItem>
                    <SelectItem value="normal">⚪ Normal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <TabsContent value="queue" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                {filteredQueue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">Queue is empty</h3>
                    <p className="text-sm text-muted-foreground">
                      No pending callback requests
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredQueue.map(callback => (
                      <div key={callback.id} className="relative">
                        {callback.queuePosition === 1 && (
                          <div className="absolute -top-2 left-4 z-10">
                            <Badge className="bg-success text-[10px]">Next in Queue</Badge>
                          </div>
                        )}
                        <CallbackCard
                          callback={callback}
                          onCancel={() => onCancel(callback.id)}
                          isLoading={isLoading}
                          showActions={callback.queuePosition === 1}
                        />
                        {callback.queuePosition === 1 && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => onNotifyNext(callback.id)}
                            disabled={isLoading}
                          >
                            <Bell className="w-3 h-3 mr-1" />
                            Notify Available Agent
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                {activeCallbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Phone className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">No active callbacks</h3>
                    <p className="text-sm text-muted-foreground">
                      Active callbacks will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeCallbacks.map(callback => (
                      <CallbackCard
                        key={callback.id}
                        callback={callback}
                        onAccept={() => onAccept(callback.id)}
                        onReject={() => onReject(callback.id)}
                        onStart={() => onStart(callback.id)}
                        onComplete={() => onComplete(callback.id)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="scheduled" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                {scheduledCallbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">No scheduled callbacks</h3>
                    <p className="text-sm text-muted-foreground">
                      Scheduled callbacks will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledCallbacks.map(callback => (
                      <CallbackCard
                        key={callback.id}
                        callback={callback}
                        onCancel={() => onCancel(callback.id)}
                        isLoading={isLoading}
                        showActions={true}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="failed" className="mt-0">
              <ScrollArea className="h-[400px] pr-4">
                {failedCallbacks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-success mb-4" />
                    <h3 className="font-semibold mb-1">No failed callbacks</h3>
                    <p className="text-sm text-muted-foreground">
                      All callbacks are successful
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {failedCallbacks.map(callback => (
                      <CallbackCard
                        key={callback.id}
                        callback={callback}
                        onRetry={() => onRetry(callback.id)}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
