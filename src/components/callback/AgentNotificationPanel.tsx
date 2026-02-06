import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Phone, X, Check, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AgentCallbackNotification, PRIORITY_CONFIG } from '@/types/callback';
import { cn } from '@/lib/utils';

interface AgentNotificationPanelProps {
  notifications: AgentCallbackNotification[];
  onAccept: (callbackId: string) => void;
  onReject: (callbackId: string) => void;
  isLoading?: boolean;
}

export function AgentNotificationPanel({
  notifications,
  onAccept,
  onReject,
  isLoading = false,
}: AgentNotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingNotifications = notifications.filter(n => n.status === 'pending');

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
        >
          <Bell className="w-4 h-4" />
          {pendingNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
              {pendingNotifications.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[450px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Callback Notifications
          </SheetTitle>
          <SheetDescription>
            Incoming callback requests requiring your attention
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-6 pr-4">
          {pendingNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-1">No pending callbacks</h3>
              <p className="text-sm text-muted-foreground">
                You'll be notified when a callback is assigned to you
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingNotifications.map(notification => {
                const priority = PRIORITY_CONFIG[notification.priority];
                
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      'gradient-card border-l-4 animate-fade-in',
                      notification.priority === 'urgent' && 'border-l-destructive',
                      notification.priority === 'high' && 'border-l-warning',
                      notification.priority === 'normal' && 'border-l-primary'
                    )}
                  >
                    <CardContent className="pt-4">
                      {/* Urgent Banner */}
                      {notification.priority === 'urgent' && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 mb-3 text-sm text-destructive">
                          <AlertTriangle className="w-4 h-4" />
                          Urgent callback - requires immediate attention
                        </div>
                      )}

                      {/* Customer Info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{notification.customerName}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {notification.customerPhone}
                          </p>
                        </div>
                        <Badge className={cn('text-[10px]', priority.bgColor, priority.color)}>
                          {priority.label}
                        </Badge>
                      </div>

                      {/* Reason */}
                      <div className="mt-3 p-2 rounded-lg bg-muted/50">
                        <p className="text-sm">{notification.reason}</p>
                      </div>

                      {/* Time Info */}
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </div>
                        {notification.scheduledTime && (
                          <div className="flex items-center gap-1">
                            📅 Scheduled: {new Date(notification.scheduledTime).toLocaleTimeString()}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            onAccept(notification.callbackId);
                            setIsOpen(false);
                          }}
                          disabled={isLoading}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Accept Callback
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onReject(notification.callbackId)}
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Pass
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
