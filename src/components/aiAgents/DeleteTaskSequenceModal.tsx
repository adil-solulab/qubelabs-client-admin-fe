import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { TaskSequence } from '@/types/aiAgents';

interface DeleteTaskSequenceModalProps {
  sequence: TaskSequence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (sequenceId: string) => Promise<void>;
}

export function DeleteTaskSequenceModal({
  sequence,
  open,
  onOpenChange,
  onDelete,
}: DeleteTaskSequenceModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!sequence) return;
    
    setIsDeleting(true);
    try {
      await onDelete(sequence.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Task Sequence</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{sequence?.name}"? This will permanently remove the 
            sequence and all its configured tasks. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Sequence'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
