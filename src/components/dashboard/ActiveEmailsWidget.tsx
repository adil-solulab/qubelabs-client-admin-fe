import { useState } from 'react';
import { Mail, AlertTriangle, Clock, CheckCircle, Send, Trash2 } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { ActiveEmail } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';

interface ActiveEmailsWidgetProps {
  emails: ActiveEmail[];
  isLoading?: boolean;
}

export function ActiveEmailsWidget({ emails, isLoading }: ActiveEmailsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<ActiveEmail | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const { toast } = useToast();

  const pending = emails.filter(e => e.status === 'pending').length;
  const highPriority = emails.filter(e => e.priority === 'high').length;

  const handleSendReply = () => {
    if (!replyContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a reply message.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Reply Sent',
      description: `Your reply to ${selectedEmail?.from} has been sent.`,
    });
    setReplyContent('');
    setSelectedEmail(null);
  };

  const handleDelete = (email: ActiveEmail) => {
    toast({
      title: 'Email Deleted',
      description: `Email from ${email.from} has been moved to trash.`,
      variant: 'destructive',
    });
    setSelectedEmail(null);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-destructive/10 text-destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-warning/10 text-warning">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'in-progress':
        return <Mail className="w-4 h-4 text-primary" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return null;
    }
  };

  return (
    <>
      <DashboardWidget
        title="Active Emails"
        icon={Mail}
        iconColor="text-channel-email"
        onClick={() => setIsOpen(true)}
        isLoading={isLoading}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{emails.length}</span>
          <span className="text-sm text-muted-foreground">emails in queue</span>
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-warning" />
            <span className="text-xs text-muted-foreground">{pending} Pending</span>
          </div>
          {highPriority > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs text-destructive font-medium">{highPriority} High Priority</span>
            </div>
          )}
        </div>
      </DashboardWidget>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-channel-email" />
              Email Queue
            </DialogTitle>
            <DialogDescription>
              Manage incoming email tickets and responses.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emails.map((email) => (
                  <TableRow
                    key={email.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedEmail(email)}
                  >
                    <TableCell className="font-medium">{email.from}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{email.subject}</TableCell>
                    <TableCell>{getPriorityBadge(email.priority)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{email.received}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(email.status)}
                        <span className="capitalize text-sm">{email.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Email Detail & Reply Modal */}
      <Dialog open={!!selectedEmail} onOpenChange={() => setSelectedEmail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEmail && getPriorityBadge(selectedEmail.priority)}
              Email Details
            </DialogTitle>
            <DialogDescription>
              Review and respond to this email.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">From</p>
                  <p className="font-medium text-sm">{selectedEmail.from}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Received</p>
                  <p className="text-sm">{selectedEmail.received}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground mb-1">Subject</p>
                  <p className="font-medium">{selectedEmail.subject}</p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-2">Email Content</p>
                <p className="text-sm">
                  Dear Support Team,<br /><br />
                  I am writing regarding the subject mentioned above. I would appreciate your assistance with this matter at your earliest convenience.<br /><br />
                  Thank you for your time and attention.<br /><br />
                  Best regards
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reply</label>
                <Textarea
                  placeholder="Type your response here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => selectedEmail && handleDelete(selectedEmail)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button onClick={handleSendReply}>
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
