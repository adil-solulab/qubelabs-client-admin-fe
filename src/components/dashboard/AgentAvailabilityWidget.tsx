import { useNavigate } from 'react-router-dom';
import { UserCheck, UserX, Coffee, Headphones } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { cn } from '@/lib/utils';

interface AgentAvailabilityWidgetProps {
  isLoading?: boolean;
}

interface AvailabilityData {
  available: number;
  busy: number;
  onBreak: number;
  offline: number;
}

const mockAvailability: AvailabilityData = {
  available: 8,
  busy: 12,
  onBreak: 3,
  offline: 2,
};

export function AgentAvailabilityWidget({ isLoading }: AgentAvailabilityWidgetProps) {
  const navigate = useNavigate();
  const total = Object.values(mockAvailability).reduce((a, b) => a + b, 0);

  const stats = [
    { label: 'Available', value: mockAvailability.available, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Busy', value: mockAvailability.busy, icon: Headphones, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'On Break', value: mockAvailability.onBreak, icon: Coffee, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Offline', value: mockAvailability.offline, icon: UserX, color: 'text-muted-foreground', bg: 'bg-muted/30' },
  ];

  return (
    <DashboardWidget
      title="Agent Availability"
      icon={UserCheck}
      iconColor="text-emerald-500"
      isLoading={isLoading}
      onClick={() => navigate('/users')}
    >
      <div className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-sm text-muted-foreground">total agents</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div 
              key={label}
              className={cn("p-2 rounded-lg flex items-center gap-2", bg)}
            >
              <Icon className={cn("w-4 h-4", color)} />
              <div>
                <p className="text-lg font-semibold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardWidget>
  );
}
