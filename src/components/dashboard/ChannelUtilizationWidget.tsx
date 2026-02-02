import { useState } from 'react';
import { PieChart, Phone, MessageSquare, Mail } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { ChannelUtilization } from '@/types/dashboard';

interface ChannelUtilizationWidgetProps {
  utilization: ChannelUtilization;
  isLoading?: boolean;
}

export function ChannelUtilizationWidget({ utilization, isLoading }: ChannelUtilizationWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const channels = [
    { name: 'Voice', value: utilization.voice, icon: Phone, color: 'bg-channel-voice', textColor: 'text-channel-voice' },
    { name: 'Chat', value: utilization.chat, icon: MessageSquare, color: 'bg-channel-chat', textColor: 'text-channel-chat' },
    { name: 'Email', value: utilization.email, icon: Mail, color: 'bg-channel-email', textColor: 'text-channel-email' },
  ];

  // Calculate SVG pie chart paths
  const total = utilization.voice + utilization.chat + utilization.email;
  const centerX = 50;
  const centerY = 50;
  const radius = 40;
  
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [centerX + x * radius, centerY + y * radius];
  };

  let cumulativePercent = 0;
  
  const paths = channels.map((channel, idx) => {
    const percent = channel.value / total;
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    
    const largeArcFlag = percent > 0.5 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'Z',
    ].join(' ');

    const colors = ['#3B82F6', '#22C55E', '#A855F7'];
    
    return (
      <path
        key={idx}
        d={pathData}
        fill={colors[idx]}
        className="transition-all duration-300 hover:opacity-80"
      />
    );
  });

  return (
    <>
      <DashboardWidget
        title="Channel Utilization"
        icon={PieChart}
        iconColor="text-primary"
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
      >
        <div className="flex items-center gap-4">
          {/* Mini Pie Chart */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {paths}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex-1 space-y-1.5">
            {channels.map((channel, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <div className={cn('w-2 h-2 rounded-full', channel.color)} />
                  <span className="text-muted-foreground">{channel.name}</span>
                </div>
                <span className={cn('font-medium', channel.textColor)}>
                  {channel.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Channel Utilization
            </DialogTitle>
            <DialogDescription>
              Distribution of customer interactions across communication channels.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Large Pie Chart */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {paths}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">100%</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
              </div>
            </div>

            {/* Channel Cards */}
            <div className="grid grid-cols-3 gap-3">
              {channels.map((channel, idx) => {
                const Icon = channel.icon;
                return (
                  <div
                    key={idx}
                    className={cn(
                      'p-4 rounded-xl border text-center transition-transform hover:scale-105',
                      idx === 0 && 'bg-channel-voice/5 border-channel-voice/30',
                      idx === 1 && 'bg-channel-chat/5 border-channel-chat/30',
                      idx === 2 && 'bg-channel-email/5 border-channel-email/30'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center',
                      channel.color + '/20'
                    )}>
                      <Icon className={cn('w-5 h-5', channel.textColor)} />
                    </div>
                    <div className={cn('text-2xl font-bold', channel.textColor)}>
                      {channel.value}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {channel.name}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-channel-voice">1,247</div>
                <div className="text-xs text-muted-foreground">Voice Calls Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-channel-chat">3,892</div>
                <div className="text-xs text-muted-foreground">Chat Sessions Today</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-channel-email">756</div>
                <div className="text-xs text-muted-foreground">Emails Today</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
