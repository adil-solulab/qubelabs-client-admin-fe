import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, Bot, Crown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AIAgent } from '@/types/aiAgents';

interface DeleteAgentModalProps {
  agent: AIAgent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (agentId: string) => Promise<void>;
}

export function DeleteAgentModal({ agent, open, onOpenChange, onDelete }: DeleteAgentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!agent) return;
    setIsDeleting(true);
    try {
      await onDelete(agent.id);
      onOpenChange(false);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  if (!agent) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Delete Agent
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Are you sure you want to delete this agent? This action cannot be undone.</p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  {agent.type === 'super_agent' ? (
                    <Crown className="w-4 h-4 text-primary" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Agent
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
