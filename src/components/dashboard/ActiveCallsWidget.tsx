import { useState } from 'react';
import { Phone, PhoneOff, MicOff, ArrowRightLeft } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ActiveCall } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

interface ActiveCallsWidgetProps {
  calls: ActiveCall[];
  isLoading?: boolean;
}

export function ActiveCallsWidget({ calls, isLoading }: ActiveCallsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<ActiveCall | null>(null);
  const { toast } = useToast();

  const handleEndCall = (call: ActiveCall) => {
    toast({
      title: 'Call Ended',
      description: `Call with ${call.caller} has been terminated.`,
      variant: 'destructive',
    });
    setSelectedCall(null);
  };

  const handleMuteCall = (call: ActiveCall) => {
    toast({
      title: 'Call Muted',
      description: `Call with ${call.caller} has been muted.`,
    });
  };

  const handleTransferCall = (call: ActiveCall) => {
    toast({
      title: 'Transfer Initiated',
      description: `Transferring call with ${call.caller}...`,
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-success/10 text-success border-success/30';
      case 'negative': return 'bg-destructive/10 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'on-hold': return 'bg-warning/10 text-warning';
      case 'transferring': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <DashboardWidget
        title="Active Voice Calls"
        icon={Phone}
        iconColor="text-channel-voice"
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{calls.length}</span>
          <span className="text-sm text-muted-foreground">calls in progress</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          <span className="status-dot status-dot-live" />
          <span className="text-xs text-success">Live</span>
        </div>
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-channel-voice" />
              Active Voice Calls
            </DialogTitle>
            <DialogDescription>
              Monitor and manage all ongoing voice calls in real-time.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caller</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call) => (
                  <TableRow
                    key={call.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedCall(call)}
                  >
                    <TableCell className="font-medium">{call.caller}</TableCell>
                    <TableCell>{call.agent}</TableCell>
                    <TableCell className="font-mono text-sm">{call.duration}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('capitalize', getSentimentColor(call.sentiment))}>
                        {call.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('capitalize', getStatusColor(call.status))}>
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMuteCall(call);
                          }}
                        >
                          <MicOff className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransferCall(call);
                          }}
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEndCall(call);
                          }}
                        >
                          <PhoneOff className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Call Detail Modal */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected call.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCall && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Caller</p>
                  <p className="font-medium">{selectedCall.caller}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agent</p>
                  <p className="font-medium">{selectedCall.agent}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-mono">{selectedCall.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={cn('capitalize mt-1', getStatusColor(selectedCall.status))}>
                    {selectedCall.status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={() => handleMuteCall(selectedCall)}>
                  <MicOff className="w-4 h-4 mr-2" />
                  Mute
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => handleTransferCall(selectedCall)}>
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleEndCall(selectedCall)}>
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
