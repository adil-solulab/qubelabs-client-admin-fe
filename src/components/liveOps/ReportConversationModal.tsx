import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TicketPriority } from '@/types/reportTickets';
import type { LiveConversation } from '@/types/liveOps';

interface ReportConversationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: LiveConversation | null;
  onSubmit: (comment: string, priority: TicketPriority) => void;
}

export function ReportConversationModal({
  open,
  onOpenChange,
  conversation,
  onSubmit,
}: ReportConversationModalProps) {
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('medium');

  const handleSubmit = () => {
    if (!comment.trim()) return;
    onSubmit(comment.trim(), priority);
    setComment('');
    setPriority('medium');
    onOpenChange(false);
  };

  const handleClose = () => {
    setComment('');
    setPriority('medium');
    onOpenChange(false);
  };

  if (!conversation) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Report Conversation
          </DialogTitle>
          <DialogDescription>
            Report this conversation to the Client Admin for review. Add a comment explaining the issue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium">{conversation.customerName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{conversation.topic}</p>
            <p className="text-xs text-muted-foreground capitalize">{conversation.channel} conversation</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-comment">Comment *</Label>
            <Textarea
              id="report-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the issue or reason for reporting this conversation..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!comment.trim()} className="bg-warning text-warning-foreground hover:bg-warning/90">
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
