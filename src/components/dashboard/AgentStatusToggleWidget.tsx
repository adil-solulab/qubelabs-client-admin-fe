import { useState } from 'react';
import { Activity, Coffee, Clock, LogOut } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface AgentStatusToggleWidgetProps {
  isLoading?: boolean;
}

type AgentStatus = 'available' | 'busy' | 'break' | 'offline';

interface StatusOption {
  value: AgentStatus;
  label: string;
  icon: typeof Activity;
  color: string;
  bg: string;
}

const statusOptions: StatusOption[] = [
  { value: 'available', label: 'Available', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30' },
  { value: 'busy', label: 'Busy', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30' },
  { value: 'break', label: 'On Break', icon: Coffee, color: 'text-blue-500', bg: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30' },
  { value: 'offline', label: 'Offline', icon: LogOut, color: 'text-muted-foreground', bg: 'bg-muted/30 hover:bg-muted/50 border-muted' },
];

export function AgentStatusToggleWidget({ isLoading }: AgentStatusToggleWidgetProps) {
  const [status, setStatus] = useState<AgentStatus>('available');
  const [shiftTime, setShiftTime] = useState('4h 23m');

  const handleStatusChange = (newStatus: AgentStatus) => {
    setStatus(newStatus);
    const statusLabel = statusOptions.find(s => s.value === newStatus)?.label;
    notify.success('Status Updated', `Your status is now: ${statusLabel}`);
  };

  const currentStatus = statusOptions.find(s => s.value === status)!;
  const CurrentIcon = currentStatus.icon;

  return (
    <DashboardWidget
      title="My Status"
      icon={Activity}
      iconColor={currentStatus.color}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        {/* Current Status Display */}
        <div className={cn(
          "p-3 rounded-lg border flex items-center gap-3",
          currentStatus.bg
        )}>
          <CurrentIcon className={cn("w-5 h-5", currentStatus.color)} />
          <div>
            <p className="font-medium text-foreground">{currentStatus.label}</p>
            <p className="text-xs text-muted-foreground">Shift time: {shiftTime}</p>
          </div>
        </div>

        {/* Status Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = status === option.value;
            
            return (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  "justify-start gap-2 transition-all",
                  isActive && option.bg,
                  isActive && "border-2"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive && option.color)} />
                <span className={cn(isActive && option.color)}>{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </DashboardWidget>
  );
}
