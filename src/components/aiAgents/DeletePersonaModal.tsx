import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, Bot } from 'lucide-react';
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
import type { Persona } from '@/types/aiAgents';
import { PERSONA_TYPE_LABELS } from '@/types/aiAgents';

interface DeletePersonaModalProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (personaId: string) => Promise<void>;
}

export function DeletePersonaModal({ persona, open, onOpenChange, onDelete }: DeletePersonaModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!persona) return;
    
    setIsDeleting(true);
    try {
      await onDelete(persona.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!persona) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Delete Persona</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete this persona? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Persona Preview */}
        <div className="my-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">{persona.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">{persona.description}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {PERSONA_TYPE_LABELS[persona.type]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning">Warning</p>
              <p className="text-muted-foreground mt-0.5">
                Deleting this persona will remove it from all task sequences and 
                may affect active conversations using this persona.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Persona
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
