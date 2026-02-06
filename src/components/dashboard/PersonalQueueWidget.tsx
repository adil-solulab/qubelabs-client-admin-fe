import { useState } from 'react';
import { Inbox, MessageSquare, Phone, Mail, Clock, X, Loader2 } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface PersonalQueueWidgetProps {
  isLoading?: boolean;
}

interface QueueItem {
  id: string;
  customer: string;
  channel: 'voice' | 'chat' | 'email';
  subject: string;
  waitTime: string;
  priority: 'high' | 'medium' | 'low';
}

const initialQueue: QueueItem[] = [
  { id: '1', customer: 'Maria Garcia', channel: 'chat', subject: 'Billing inquiry', waitTime: '0:45', priority: 'high' },
  { id: '2', customer: '+1 555-123-4567', channel: 'voice', subject: 'Technical support', waitTime: '1:20', priority: 'medium' },
  { id: '3', customer: 'support@client.com', channel: 'email', subject: 'Feature request', waitTime: '5:30', priority: 'low' },
];

const channelIcons = {
  voice: Phone,
  chat: MessageSquare,
  email: Mail,
};

const priorityColors = {
  high: 'bg-destructive/10 text-destructive',
  medium: 'bg-amber-500/10 text-amber-600',
  low: 'bg-blue-500/10 text-blue-600',
};

export function PersonalQueueWidget({ isLoading }: PersonalQueueWidgetProps) {
  const [queue, setQueue] = useState<QueueItem[]>(initialQueue);
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const handleItemClick = (item: QueueItem) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const handleAccept = async () => {
    if (!selectedItem) return;
    setIsAccepting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    notify.success('Conversation Started', `You are now handling ${selectedItem.customer}'s ${selectedItem.channel} conversation.`);
    setQueue(prev => prev.filter(q => q.id !== selectedItem.id));
    setDetailModalOpen(false);
    setSelectedItem(null);
    setIsAccepting(false);
  };

  const handleSkip = async () => {
    if (!selectedItem) return;
    setIsSkipping(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    notify.info('Skipped', `${selectedItem.customer} has been moved to the back of your queue.`);
    setQueue(prev => {
      const filtered = prev.filter(q => q.id !== selectedItem.id);
      return [...filtered, selectedItem];
    });
    setDetailModalOpen(false);
    setSelectedItem(null);
    setIsSkipping(false);
  };

  return (
    <>
      <DashboardWidget
        title="My Queue"
        icon={Inbox}
        iconColor="text-primary"
        isLoading={isLoading}
        className="lg:col-span-2"
        action={
          <Badge variant="secondary">
            {queue.length} waiting
          </Badge>
        }
      >
        <div className="space-y-2">
          {queue.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Your queue is empty</p>
            </div>
          ) : (
            queue.map((item) => {
              const ChannelIcon = channelIcons[item.channel];
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", priorityColors[item.priority])}>
                      <ChannelIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.customer}</p>
                      <p className="text-xs text-muted-foreground">{item.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {item.waitTime}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DashboardWidget>

      {/* Queue Item Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && (() => {
                const Icon = channelIcons[selectedItem.channel];
                return <Icon className="w-5 h-5 text-primary" />;
              })()}
              Queue Item Details
            </DialogTitle>
            <DialogDescription>
              Review and accept this conversation from your queue.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl border",
                priorityColors[selectedItem.priority]
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg text-foreground">{selectedItem.customer}</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedItem.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedItem.subject}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Channel</p>
                  <p className="font-medium capitalize">{selectedItem.channel}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Wait Time</p>
                  <p className="font-mono">{selectedItem.waitTime}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleSkip} disabled={isSkipping || isAccepting}>
              {isSkipping ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              {isSkipping ? 'Skipping...' : 'Skip'}
            </Button>
            <Button onClick={handleAccept} disabled={isAccepting || isSkipping}>
              {isAccepting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isAccepting ? 'Accepting...' : 'Accept Conversation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
