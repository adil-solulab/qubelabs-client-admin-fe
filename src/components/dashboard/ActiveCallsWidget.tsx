import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOff, MicOff, Mic, ArrowRightLeft, Users, X, ArrowRight, Shuffle } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { ActiveCall } from '@/types/dashboard';
import { notify } from '@/hooks/useNotification';

interface ActiveCallsWidgetProps {
  calls: ActiveCall[];
  isLoading?: boolean;
}

// Extended call type with muted state
interface CallWithState extends ActiveCall {
  isMuted?: boolean;
}

const TEAMS = [
  { id: 'grp-1', name: 'Customer Support', agentIds: ['1', '2', '5', '8'] },
  { id: 'grp-2', name: 'Escalation', agentIds: ['6', '8'] },
  { id: 'grp-3', name: 'Sales', agentIds: ['1', '4', '7', '10'] },
  { id: 'grp-4', name: 'VIP Support', agentIds: ['7', '9'] },
  { id: 'grp-5', name: 'Technical Support', agentIds: ['2', '4', '6', '9'] },
  { id: 'grp-6', name: 'Billing & Finance', agentIds: ['3', '5', '10'] },
];

const AVAILABLE_AGENTS = [
  { id: '1', name: 'John Smith', status: 'busy' as const },
  { id: '2', name: 'Emma Wilson', status: 'available' as const },
  { id: '3', name: 'Mike Brown', status: 'available' as const },
  { id: '4', name: 'Sarah Davis', status: 'busy' as const },
  { id: '5', name: 'Rachel Green', status: 'available' as const },
  { id: '6', name: 'David Kim', status: 'available' as const },
  { id: '7', name: 'Priya Sharma', status: 'busy' as const },
  { id: '8', name: 'Carlos Mendez', status: 'available' as const },
  { id: '9', name: 'Lisa Park', status: 'busy' as const },
  { id: '10', name: 'James O\'Connor', status: 'available' as const },
];

export function ActiveCallsWidget({ calls: initialCalls, isLoading }: ActiveCallsWidgetProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [calls, setCalls] = useState<CallWithState[]>(initialCalls.map(c => ({ ...c, isMuted: false })));
  const [selectedCall, setSelectedCall] = useState<CallWithState | null>(null);
  
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [callToTransfer, setCallToTransfer] = useState<CallWithState | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  // End call confirmation modal
  const [endCallModalOpen, setEndCallModalOpen] = useState(false);
  const [callToEnd, setCallToEnd] = useState<CallWithState | null>(null);

  // Sync with prop changes
  React.useEffect(() => {
    setCalls(initialCalls.map(c => ({ ...c, isMuted: false })));
  }, [initialCalls]);

  const handleEndCall = (call: CallWithState) => {
    setCallToEnd(call);
    setEndCallModalOpen(true);
  };

  const confirmEndCall = () => {
    if (!callToEnd) return;
    
    setCalls(prev => prev.filter(c => c.id !== callToEnd.id));
    notify.success('Call Ended', `Call with ${callToEnd.caller} has been terminated.`);
    setEndCallModalOpen(false);
    setCallToEnd(null);
    setSelectedCall(null);
  };

  const handleMuteCall = (call: CallWithState) => {
    const newMutedState = !call.isMuted;
    
    setCalls(prev => prev.map(c => 
      c.id === call.id ? { ...c, isMuted: newMutedState } : c
    ));
    
    // Update selected call if it's the same one
    if (selectedCall?.id === call.id) {
      setSelectedCall(prev => prev ? { ...prev, isMuted: newMutedState } : null);
    }
    
    notify.info(
      newMutedState ? 'Call Muted' : 'Call Unmuted',
      `Call with ${call.caller} has been ${newMutedState ? 'muted' : 'unmuted'}.`
    );
  };

  const handleTransferCall = (call: CallWithState) => {
    setCallToTransfer(call);
    setSelectedTeam('');
    setSelectedAgent('');
    setTransferModalOpen(true);
  };

  const teamAgents = selectedTeam
    ? AVAILABLE_AGENTS.filter(a => {
        const team = TEAMS.find(t => t.id === selectedTeam);
        return team?.agentIds.includes(a.id) && a.name !== callToTransfer?.agent;
      })
    : [];

  const handleRandomAssign = () => {
    const available = teamAgents.filter(a => a.status === 'available');
    if (available.length > 0) {
      const randomAgent = available[Math.floor(Math.random() * available.length)];
      setSelectedAgent(randomAgent.id);
    } else if (teamAgents.length > 0) {
      const randomAgent = teamAgents[Math.floor(Math.random() * teamAgents.length)];
      setSelectedAgent(randomAgent.id);
    }
  };

  const confirmTransfer = () => {
    if (!callToTransfer || !selectedAgent) return;
    
    let finalAgentId = selectedAgent;
    if (selectedAgent === '__random__') {
      const available = teamAgents.filter(a => a.status === 'available');
      const pool = available.length > 0 ? available : teamAgents;
      if (pool.length > 0) {
        finalAgentId = pool[Math.floor(Math.random() * pool.length)].id;
      } else {
        return;
      }
    }
    
    const agent = AVAILABLE_AGENTS.find(a => a.id === finalAgentId);
    
    setCalls(prev => prev.map(c => 
      c.id === callToTransfer.id 
        ? { ...c, status: 'transferring' as const, agent: agent?.name || c.agent }
        : c
    ));
    
    notify.success('Transfer Initiated', `Transferring call with ${callToTransfer.caller} to ${agent?.name}...`);
    setTransferModalOpen(false);
    setCallToTransfer(null);
    setSelectedCall(null);
    
    // Simulate transfer completion after 2 seconds
    setTimeout(() => {
      setCalls(prev => prev.map(c => 
        c.id === callToTransfer.id ? { ...c, status: 'active' as const } : c
      ));
      notify.success('Transfer Complete', `Call successfully transferred to ${agent?.name}.`);
    }, 2000);
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
        definition="Total number of voice calls currently being handled by AI or human agents in real-time"
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
            {calls.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Phone className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No active calls</p>
                <p className="text-sm">All calls have been completed</p>
              </div>
            ) : (
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
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {call.isMuted && <MicOff className="w-3 h-3 text-warning" />}
                          {call.caller}
                        </div>
                      </TableCell>
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={call.isMuted ? "secondary" : "ghost"}
                                size="icon"
                                className={cn("h-8 w-8", call.isMuted && "bg-warning/20 text-warning hover:bg-warning/30")}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMuteCall(call);
                                }}
                              >
                                {call.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {call.isMuted ? 'Unmute call' : 'Mute call'}
                            </TooltipContent>
                          </Tooltip>
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
            )}
          </ScrollArea>

          <div className="flex justify-end pt-2 border-t">
            <Button variant="outline" onClick={() => { navigate('/live-ops'); setIsOpen(false); }}>
              View All in Live Ops
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
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
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn('capitalize', getStatusColor(selectedCall.status))}>
                      {selectedCall.status}
                    </Badge>
                    {selectedCall.isMuted && (
                      <Badge variant="outline" className="text-warning border-warning/30">
                        <MicOff className="w-3 h-3 mr-1" />
                        Muted
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant={selectedCall.isMuted ? "secondary" : "outline"} 
                  className={cn("flex-1", selectedCall.isMuted && "bg-warning/20 text-warning hover:bg-warning/30")}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMuteCall(selectedCall);
                  }}
                >
                  {selectedCall.isMuted ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Muted
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Mute
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTransferCall(selectedCall);
                  }}
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEndCall(selectedCall);
                  }}
                >
                  <PhoneOff className="w-4 h-4 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Call Modal */}
      <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-primary" />
              Transfer Call
            </DialogTitle>
            <DialogDescription>
              Select an agent to transfer this call to.
            </DialogDescription>
          </DialogHeader>

          {callToTransfer && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-1">Transferring call from:</p>
                <p className="font-semibold">{callToTransfer.caller}</p>
                <p className="text-sm text-muted-foreground">Current Agent: {callToTransfer.agent}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Select Team</Label>
                  <Select value={selectedTeam} onValueChange={(val) => { setSelectedTeam(val); setSelectedAgent(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      {TEAMS.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {team.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedTeam && (
                  <div className="space-y-2">
                    <Label>Select Agent</Label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__random__">
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <Shuffle className="w-4 h-4" />
                            Randomly assign based on availability
                          </div>
                        </SelectItem>
                        {teamAgents.map(agent => (
                          <SelectItem key={agent.id} value={agent.id}>
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                agent.status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'
                              )} />
                              {agent.name}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({agent.status})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmTransfer} disabled={!selectedAgent}>
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Transfer Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Call Confirmation Modal */}
      <Dialog open={endCallModalOpen} onOpenChange={setEndCallModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PhoneOff className="w-5 h-5 text-destructive" />
              End Call
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to end this call?
            </DialogDescription>
          </DialogHeader>

          {callToEnd && (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
              <p className="font-semibold">{callToEnd.caller}</p>
              <p className="text-sm text-muted-foreground">Agent: {callToEnd.agent}</p>
              <p className="text-sm text-muted-foreground">Duration: {callToEnd.duration}</p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEndCallModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEndCall}>
              <PhoneOff className="w-4 h-4 mr-2" />
              End Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
