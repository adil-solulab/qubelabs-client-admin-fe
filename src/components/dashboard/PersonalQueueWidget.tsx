import { Inbox, MessageSquare, Phone, Mail, Clock } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

const mockQueue: QueueItem[] = [
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
  return (
    <DashboardWidget
      title="My Queue"
      icon={Inbox}
      iconColor="text-primary"
      isLoading={isLoading}
      className="lg:col-span-2"
      action={
        <Badge variant="secondary">
          {mockQueue.length} waiting
        </Badge>
      }
    >
      <div className="space-y-2">
        {mockQueue.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Your queue is empty</p>
          </div>
        ) : (
          mockQueue.map((item) => {
            const ChannelIcon = channelIcons[item.channel];
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
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
  );
}
