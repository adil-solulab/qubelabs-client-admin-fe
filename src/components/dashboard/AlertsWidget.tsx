import { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, ShieldAlert, Users, Server, X, Loader2 } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

interface AlertsWidgetProps {
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  isLoading?: boolean;
}

export function AlertsWidget({ alerts, onAcknowledge, isLoading }: AlertsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDismissingAll, setIsDismissingAll] = useState(false);
  const [acknowledgeLoadingId, setAcknowledgeLoadingId] = useState<string | null>(null);
  const { toast } = useToast();

  const unacknowledged = alerts.filter(a => !a.acknowledged);
  const critical = alerts.filter(a => a.severity === 'critical' && !a.acknowledged);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sla-breach': return Clock;
      case 'sentiment-drop': return AlertTriangle;
      case 'idle-agent': return Users;
      case 'capacity': return Server;
      case 'system': return ShieldAlert;
      default: return Bell;
    }
  };

  const getSeverityStyle = (severity: string, acknowledged: boolean) => {
    if (acknowledged) {
      return 'bg-muted/50 border-border';
    }
    switch (severity) {
      case 'critical':
        return 'bg-destructive/5 border-destructive/30';
      case 'warning':
        return 'bg-warning/5 border-warning/30';
      default:
        return 'bg-primary/5 border-primary/30';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-destructive/10 text-destructive border-destructive/30">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-warning/10 text-warning border-warning/30">Warning</Badge>;
      default:
        return <Badge className="bg-primary/10 text-primary border-primary/30">Info</Badge>;
    }
  };

  const handleAcknowledge = async (alert: Alert) => {
    setAcknowledgeLoadingId(alert.id);
    await new Promise(resolve => setTimeout(resolve, 300));
    onAcknowledge(alert.id);
    toast({
      title: 'Alert Acknowledged',
      description: `"${alert.title}" has been acknowledged.`,
    });
    setAcknowledgeLoadingId(null);
  };

  const handleDismissAll = async () => {
    setIsDismissingAll(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    unacknowledged.forEach(alert => onAcknowledge(alert.id));
    toast({
      title: 'All Alerts Dismissed',
      description: `${unacknowledged.length} alerts have been acknowledged.`,
    });
    setIsDismissingAll(false);
  };

  return (
    <>
      <DashboardWidget
        title="Active Alerts"
        icon={Bell}
        iconColor={critical.length > 0 ? 'text-destructive' : 'text-warning'}
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
      >
        <div className="space-y-2">
          {unacknowledged.length === 0 ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">All clear - no active alerts</span>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">{unacknowledged.length}</span>
                <span className="text-sm text-muted-foreground">unacknowledged</span>
              </div>
              
              {critical.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="status-dot status-dot-error" />
                  <span className="text-xs text-destructive font-medium">
                    {critical.length} critical alert{critical.length > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              
              {/* Preview of top alert */}
              {unacknowledged[0] && (
                <div className={cn(
                  'mt-2 p-2 rounded-lg border text-sm',
                  getSeverityStyle(unacknowledged[0].severity, false)
                )}>
                  <p className="font-medium truncate">{unacknowledged[0].title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {unacknowledged[0].timestamp}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-warning" />
                System Alerts
              </DialogTitle>
              {unacknowledged.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleDismissAll} disabled={isDismissingAll || acknowledgeLoadingId !== null}>
                  {isDismissingAll && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  {isDismissingAll ? 'Acknowledging...' : 'Acknowledge All'}
                </Button>
              )}
            </div>
            <DialogDescription>
              Monitor and manage system alerts and notifications.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mb-4 text-success" />
                <p className="font-medium">No alerts</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => {
                  const Icon = getAlertIcon(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={cn(
                        'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                        getSeverityStyle(alert.severity, alert.acknowledged),
                        alert.acknowledged && 'opacity-60'
                      )}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                          alert.severity === 'critical' && !alert.acknowledged && 'bg-destructive/10',
                          alert.severity === 'warning' && !alert.acknowledged && 'bg-warning/10',
                          alert.severity === 'info' && !alert.acknowledged && 'bg-primary/10',
                          alert.acknowledged && 'bg-muted'
                        )}>
                          <Icon className={cn(
                            'w-5 h-5',
                            alert.severity === 'critical' && !alert.acknowledged && 'text-destructive',
                            alert.severity === 'warning' && !alert.acknowledged && 'text-warning',
                            alert.severity === 'info' && !alert.acknowledged && 'text-primary',
                            alert.acknowledged && 'text-muted-foreground'
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={cn(
                              'font-medium text-sm',
                              alert.acknowledged && 'text-muted-foreground'
                            )}>
                              {alert.title}
                            </h4>
                            {getSeverityBadge(alert.severity)}
                            {alert.acknowledged && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Acknowledged
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {alert.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alert.timestamp}
                          </p>
                        </div>
                        {!alert.acknowledged && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0"
                            disabled={acknowledgeLoadingId === alert.id || isDismissingAll}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcknowledge(alert);
                            }}
                          >
                            {acknowledgeLoadingId === alert.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && getSeverityBadge(selectedAlert.severity)}
              Alert Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedAlert && (
            <div className="space-y-4">
              <div className={cn(
                'p-4 rounded-xl border',
                getSeverityStyle(selectedAlert.severity, selectedAlert.acknowledged)
              )}>
                <h3 className="font-semibold text-lg mb-2">{selectedAlert.title}</h3>
                <p className="text-muted-foreground">{selectedAlert.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-medium capitalize">{selectedAlert.type.replace('-', ' ')}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Time</p>
                  <p className="font-medium">{selectedAlert.timestamp}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Severity</p>
                  <p className="font-medium capitalize">{selectedAlert.severity}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="font-medium">
                    {selectedAlert.acknowledged ? 'Acknowledged' : 'Active'}
                  </p>
                </div>
              </div>

              {!selectedAlert.acknowledged && (
                <Button 
                  className="w-full" 
                  disabled={acknowledgeLoadingId === selectedAlert.id}
                  onClick={async () => {
                    await handleAcknowledge(selectedAlert);
                    setSelectedAlert(null);
                  }}
                >
                  {acknowledgeLoadingId === selectedAlert.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  {acknowledgeLoadingId === selectedAlert.id ? 'Acknowledging...' : 'Acknowledge Alert'}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
