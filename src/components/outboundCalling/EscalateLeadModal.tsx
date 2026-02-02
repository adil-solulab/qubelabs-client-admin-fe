import { useState } from 'react';
import { UserPlus, Loader2, Phone, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Lead } from '@/types/outboundCalling';

interface EscalateLeadModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (leadId: string, agentName: string, reason: string) => Promise<void>;
}

const availableAgents = [
  { id: 'agent-1', name: 'John Smith', status: 'available' },
  { id: 'agent-2', name: 'Emma Wilson', status: 'available' },
  { id: 'agent-3', name: 'Mike Brown', status: 'busy' },
  { id: 'agent-4', name: 'Sarah Davis', status: 'available' },
];

export function EscalateLeadModal({
  lead,
  open,
  onOpenChange,
  onConfirm,
}: EscalateLeadModalProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isEscalating, setIsEscalating] = useState(false);

  const handleConfirm = async () => {
    if (!lead || !selectedAgent) return;
    
    const agent = availableAgents.find(a => a.id === selectedAgent);
    if (!agent) return;

    setIsEscalating(true);
    await onConfirm(lead.id, agent.name, reason);
    setIsEscalating(false);
    setSelectedAgent('');
    setReason('');
    onOpenChange(false);
  };

  const handleClose = () => {
    if (!isEscalating) {
      setSelectedAgent('');
      setReason('');
      onOpenChange(false);
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-500" />
            </div>
            <DialogTitle>Escalate to Human Agent</DialogTitle>
          </div>
          <DialogDescription>
            Transfer this lead to a human agent for personalized handling.
          </DialogDescription>
        </DialogHeader>

        {/* Lead Info */}
        <div className="p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {lead.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{lead.name}</p>
              <p className="text-sm text-muted-foreground">{lead.company}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Phone className="w-3 h-3" />
                {lead.phone}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Select Agent</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {availableAgents.map(agent => (
                  <SelectItem 
                    key={agent.id} 
                    value={agent.id}
                    disabled={agent.status === 'busy'}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        agent.status === 'available' ? 'bg-success' : 'bg-warning'
                      }`} />
                      {agent.name}
                      {agent.status === 'busy' && (
                        <span className="text-xs text-muted-foreground">(Busy)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Escalation Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe why this lead needs human attention..."
              rows={3}
            />
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              The lead will be removed from the AI calling queue and assigned to the selected agent.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isEscalating}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedAgent || isEscalating}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isEscalating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Escalate Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
