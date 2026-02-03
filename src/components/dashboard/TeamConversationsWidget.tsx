import { Users, MessageSquare, Phone, Mail } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  activeConversations: number;
  channel: 'voice' | 'chat' | 'email';
  status: 'available' | 'busy' | 'break';
}

interface TeamConversationsWidgetProps {
  isLoading?: boolean;
}

const mockTeamData: TeamMember[] = [
  { id: '1', name: 'Sarah Johnson', activeConversations: 3, channel: 'voice', status: 'busy' },
  { id: '2', name: 'Mike Chen', activeConversations: 5, channel: 'chat', status: 'busy' },
  { id: '3', name: 'Emma Wilson', activeConversations: 2, channel: 'email', status: 'available' },
  { id: '4', name: 'Tom Hardy', activeConversations: 4, channel: 'chat', status: 'busy' },
  { id: '5', name: 'Lisa Park', activeConversations: 0, channel: 'voice', status: 'break' },
];

const channelIcons = {
  voice: Phone,
  chat: MessageSquare,
  email: Mail,
};

const statusColors = {
  available: 'bg-emerald-500',
  busy: 'bg-amber-500',
  break: 'bg-muted-foreground',
};

export function TeamConversationsWidget({ isLoading }: TeamConversationsWidgetProps) {
  const totalActive = mockTeamData.reduce((sum, m) => sum + m.activeConversations, 0);

  return (
    <DashboardWidget
      title="Team Conversations"
      icon={Users}
      iconColor="text-blue-500"
      isLoading={isLoading}
      className="lg:col-span-2"
    >
      <div className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{totalActive}</span>
          <span className="text-sm text-muted-foreground">active conversations</span>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {mockTeamData.map((member) => {
            const ChannelIcon = channelIcons[member.channel];
            return (
              <div 
                key={member.id}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-medium">{member.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${statusColors[member.status]}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ChannelIcon className="w-3 h-3" />
                      <span className="capitalize">{member.channel}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={member.activeConversations > 0 ? 'default' : 'secondary'}>
                  {member.activeConversations} active
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardWidget>
  );
}
