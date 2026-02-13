import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Workflow } from '@/types/workflows';

interface DeleteWorkflowModalProps {
  workflow: Workflow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteWorkflowModal({ workflow, open, onOpenChange, onDelete }: DeleteWorkflowModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!workflow) return;
    setIsDeleting(true);
    try {
      await onDelete(workflow.id);
      onOpenChange(false);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Workflow
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>"{workflow?.name}"</strong>? This action cannot be undone.
            All execution history and configurations will be permanently removed.
          </p>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete Workflow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
