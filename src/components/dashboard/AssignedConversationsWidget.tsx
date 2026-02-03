import { MessageCircle, Phone, Mail, MessageSquare, ArrowRight } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AssignedConversationsWidgetProps {
  isLoading?: boolean;
}

interface Conversation {
  id: string;
  customer: string;
  channel: 'voice' | 'chat' | 'email';
  duration: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'active' | 'on-hold';
}

const mockConversations: Conversation[] = [
  { id: '1', customer: 'John Doe', channel: 'voice', duration: '05:32', sentiment: 'positive', status: 'active' },
  { id: '2', customer: 'Jane Smith', channel: 'chat', duration: '12:15', sentiment: 'neutral', status: 'active' },
  { id: '3', customer: 'Alex Brown', channel: 'chat', duration: '03:45', sentiment: 'negative', status: 'on-hold' },
];

const channelIcons = {
  voice: Phone,
  chat: MessageSquare,
  email: Mail,
};

const sentimentColors = {
  positive: 'bg-emerald-500/10 text-emerald-600',
  neutral: 'bg-blue-500/10 text-blue-600',
  negative: 'bg-destructive/10 text-destructive',
};

export function AssignedConversationsWidget({ isLoading }: AssignedConversationsWidgetProps) {
  const activeCount = mockConversations.filter(c => c.status === 'active').length;

  return (
    <DashboardWidget
      title="My Active Conversations"
      icon={MessageCircle}
      iconColor="text-primary"
      isLoading={isLoading}
      className="lg:col-span-2"
      action={
        <Badge variant="default">
          {activeCount} active
        </Badge>
      }
    >
      <div className="space-y-2">
        {mockConversations.map((conversation) => {
          const ChannelIcon = channelIcons[conversation.channel];
          
          return (
            <div 
              key={conversation.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ChannelIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{conversation.customer}</p>
                    {conversation.status === 'on-hold' && (
                      <Badge variant="outline" className="text-xs">On Hold</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {conversation.channel} • {conversation.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={cn("text-xs", sentimentColors[conversation.sentiment])}>
                  {conversation.sentiment}
                </Badge>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardWidget>
  );
}
