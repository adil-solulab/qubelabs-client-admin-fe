import { useState } from 'react';
import { Search, Zap, Plus, Check, GitBranch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FlowSummary } from '@/types/flowBuilder';

interface WorkflowOutput {
  name: string;
  type: string;
}

const WORKFLOW_MOCK_OUTPUTS: Record<string, WorkflowOutput[]> = {
  'Billing FAQ': [
    { name: 'invoice_total', type: 'number' },
    { name: 'payment_status', type: 'string' },
    { name: 'due_date', type: 'date' },
  ],
  'Appointment Booking': [
    { name: 'available_slots', type: 'array' },
    { name: 'next_available', type: 'date' },
    { name: 'location', type: 'string' },
  ],
  'Generate Booking ID': [
    { name: 'booking_id', type: 'string' },
    { name: 'booking_reference', type: 'string' },
    { name: 'confirmation_sent', type: 'boolean' },
  ],
  'Fetch Order Status': [
    { name: 'delivery_status', type: 'string' },
    { name: 'expected_date', type: 'date' },
    { name: 'item_count', type: 'number' },
  ],
  'Create Ticket': [
    { name: 'ticket_id', type: 'string' },
    { name: 'ticket_status', type: 'string' },
    { name: 'assigned_agent', type: 'string' },
  ],
  'Send OTP': [
    { name: 'otp_sent', type: 'boolean' },
    { name: 'expires_at', type: 'date' },
  ],
};

function getWorkflowOutputs(workflowName: string): WorkflowOutput[] {
  return WORKFLOW_MOCK_OUTPUTS[workflowName] || [
    { name: 'result', type: 'string' },
    { name: 'status', type: 'string' },
  ];
}

interface WorkflowSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflows: FlowSummary[];
  onSelectWorkflow: (workflow: FlowSummary, outputs: WorkflowOutput[]) => void;
  onCreateWorkflow: () => void;
}

export function WorkflowSelectionModal({
  open,
  onOpenChange,
  workflows,
  onSelectWorkflow,
  onCreateWorkflow,
}: WorkflowSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = workflows.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    const selected = workflows.find(w => w.id === selectedId);
    if (selected) {
      const outputs = getWorkflowOutputs(selected.name);
      onSelectWorkflow(selected, outputs);
    }
    setSelectedId(null);
    setSearchQuery('');
  };

  const handleCreateNew = () => {
    onCreateWorkflow();
    setSelectedId(null);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setSelectedId(null); setSearchQuery(''); } onOpenChange(o); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-500" />
            Run Workflow
          </DialogTitle>
          <DialogDescription>
            Choose an existing workflow or create a new one to automate backend tasks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[280px] overflow-y-auto space-y-2">
            {filtered.length > 0 ? (
              filtered.map(w => (
                <button
                  key={w.id}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
                    selectedId === w.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/10 ring-1 ring-purple-500'
                      : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                  )}
                  onClick={() => setSelectedId(w.id)}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    selectedId === w.id ? 'bg-purple-100 dark:bg-purple-500/20' : 'bg-muted'
                  )}>
                    <Zap className={cn('w-4 h-4', selectedId === w.id ? 'text-purple-600' : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{w.name}</span>
                      <Badge
                        variant={w.status === 'published' ? 'default' : 'secondary'}
                        className={cn('text-[10px]', w.status === 'published' && 'bg-success')}
                      >
                        {w.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{w.description}</p>
                  </div>
                  {selectedId === w.id && (
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No workflows found</p>
                <p className="text-xs mt-1">Create a new workflow to get started</p>
              </div>
            )}
          </div>

          <div className="border-t pt-3">
            <button
              className="w-full flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all text-left"
              onClick={handleCreateNew}
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="text-sm font-medium text-purple-600">Create new workflow</span>
                <p className="text-xs text-muted-foreground">Build a new backend automation workflow</p>
              </div>
            </button>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedId}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { getWorkflowOutputs };
export type { WorkflowOutput };
