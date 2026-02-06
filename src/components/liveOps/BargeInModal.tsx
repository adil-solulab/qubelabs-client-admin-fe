import { useState } from 'react';
import { AlertTriangle, Loader2, Mic } from 'lucide-react';
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
import type { LiveConversation } from '@/types/liveOps';

interface BargeInModalProps {
  conversation: LiveConversation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function BargeInModal({
  conversation,
  open,
  onOpenChange,
  onConfirm,
}: BargeInModalProps) {
  const [isBarging, setIsBarging] = useState(false);

  const handleConfirm = async () => {
    setIsBarging(true);
    await onConfirm();
    setIsBarging(false);
    onOpenChange(false);
  };

  if (!conversation) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Mic className="w-6 h-6 text-warning" />
            </div>
            <AlertDialogTitle className="text-xl">Barge Into Conversation</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            You are about to join this conversation as a supervisor. Both the customer and the agent will be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Conversation Preview */}
        <div className="my-4 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {conversation.customerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{conversation.customerName}</p>
              <p className="text-sm text-muted-foreground">{conversation.topic}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px]">
                  {conversation.channel}
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Agent: {conversation.agentName}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning">Customer Impact</p>
              <p className="text-muted-foreground mt-0.5">
                The customer will hear/see a notification that a supervisor has joined. 
                Use this for escalations or when immediate intervention is required.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isBarging}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isBarging} className="bg-warning hover:bg-warning/90 text-warning-foreground">
            {isBarging ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mic className="w-4 h-4 mr-2" />
            )}
            Barge In Now
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
