import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Phone,
  MessageSquare,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SurveyEscalation, EscalationStatus } from '@/types/surveys';
import { cn } from '@/lib/utils';

interface SurveyEscalationPanelProps {
  escalations: SurveyEscalation[];
  onAcknowledge: (escalationId: string, assignTo: string) => void;
  onResolve: (escalationId: string, resolution: string) => void;
  onAddNote: (escalationId: string, note: string) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<EscalationStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: 'Pending', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle },
  acknowledged: { label: 'Acknowledged', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: 'bg-muted text-muted-foreground', icon: CheckCircle },
};

export function SurveyEscalationPanel({
  escalations,
  onAcknowledge,
  onResolve,
  onAddNote,
  isLoading = false,
}: SurveyEscalationPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [acknowledgeModal, setAcknowledgeModal] = useState<SurveyEscalation | null>(null);
  const [resolveModal, setResolveModal] = useState<SurveyEscalation | null>(null);
  const [assignTo, setAssignTo] = useState('');
  const [resolution, setResolution] = useState('');
  const [newNote, setNewNote] = useState('');

  const pendingCount = escalations.filter(e => e.status === 'pending').length;

  const handleAcknowledge = () => {
    if (!acknowledgeModal || !assignTo.trim()) return;
    onAcknowledge(acknowledgeModal.id, assignTo.trim());
    setAcknowledgeModal(null);
    setAssignTo('');
  };

  const handleResolve = () => {
    if (!resolveModal || !resolution.trim()) return;
    onResolve(resolveModal.id, resolution.trim());
    setResolveModal(null);
    setResolution('');
  };

  const handleAddNote = (escalationId: string) => {
    if (!newNote.trim()) return;
    onAddNote(escalationId, newNote.trim());
    setNewNote('');
  };

  return (
    <>
      <Card className="gradient-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Survey Escalations
              </CardTitle>
              <CardDescription>Negative feedback requiring attention</CardDescription>
            </div>
            {pendingCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {pendingCount} pending
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {escalations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle className="w-12 h-12 text-success mb-4" />
                <h3 className="font-semibold mb-1">No escalations</h3>
                <p className="text-sm text-muted-foreground">
                  All customer feedback is positive!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {escalations.map((escalation) => {
                  const statusConfig = STATUS_CONFIG[escalation.status];
                  const StatusIcon = statusConfig.icon;
                  const isExpanded = expandedId === escalation.id;

                  return (
                    <Collapsible
                      key={escalation.id}
                      open={isExpanded}
                      onOpenChange={(open) => setExpandedId(open ? escalation.id : null)}
                    >
                      <Card className={cn(
                        "transition-all",
                        escalation.status === 'pending' && "border-destructive/50 shadow-glow-destructive"
                      )}>
                        <CardContent className="pt-4">
                          {/* Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                escalation.surveyType === 'csat' ? "bg-yellow-500/10" : "bg-primary/10"
                              )}>
                                {escalation.surveyType === 'csat' ? (
                                  <Star className="w-5 h-5 text-yellow-500" />
                                ) : (
                                  <TrendingUp className="w-5 h-5 text-primary" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold">{escalation.customerName}</h4>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="text-destructive font-bold">
                                    Score: {escalation.score}/{escalation.surveyType === 'csat' ? 5 : 10}
                                  </span>
                                  <span>•</span>
                                  <span>{formatDistanceToNow(new Date(escalation.createdAt), { addSuffix: true })}</span>
                                </div>
                              </div>
                            </div>

                            <Badge variant="outline" className={statusConfig.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>

                          {/* Reason */}
                          <div className="mt-3 p-2 rounded-lg bg-destructive/5 text-sm">
                            {escalation.reason}
                          </div>

                          {/* Assigned To */}
                          {escalation.assignedTo && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="w-3 h-3" />
                              Assigned to: <span className="font-medium">{escalation.assignedTo}</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-3 flex items-center gap-2">
                            {escalation.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => setAcknowledgeModal(escalation)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                            {escalation.status === 'acknowledged' && (
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90"
                                onClick={() => setResolveModal(escalation)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                {isExpanded ? (
                                  <ChevronUp className="w-3 h-3 mr-1" />
                                ) : (
                                  <ChevronDown className="w-3 h-3 mr-1" />
                                )}
                                {escalation.notes.length} notes
                              </Button>
                            </CollapsibleTrigger>
                          </div>

                          {/* Expandable Notes */}
                          <CollapsibleContent className="mt-3 space-y-2 animate-fade-in">
                            <Separator />
                            <div className="space-y-2 mt-2">
                              {escalation.notes.map((note) => (
                                <div
                                  key={note.id}
                                  className="p-2 rounded-lg bg-muted/50 text-sm"
                                >
                                  <p>{note.content}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {note.createdBy} • {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                              ))}
                            </div>

                            {escalation.status !== 'resolved' && (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a note..."
                                  value={newNote}
                                  onChange={(e) => setNewNote(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleAddNote(escalation.id);
                                    }
                                  }}
                                />
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleAddNote(escalation.id)}
                                  disabled={!newNote.trim()}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </CollapsibleContent>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Acknowledge Modal */}
      <Dialog open={!!acknowledgeModal} onOpenChange={() => setAcknowledgeModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acknowledge Escalation</DialogTitle>
            <DialogDescription>
              Assign this escalation to a team member for follow-up.
            </DialogDescription>
          </DialogHeader>

          {acknowledgeModal && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{acknowledgeModal.customerName}</p>
                <p className="text-sm text-muted-foreground">{acknowledgeModal.reason}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assign">Assign to</Label>
                <Input
                  id="assign"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  placeholder="Enter agent name..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAcknowledgeModal(null)}>
              Cancel
            </Button>
            <Button onClick={handleAcknowledge} disabled={!assignTo.trim() || isLoading}>
              Acknowledge & Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={!!resolveModal} onOpenChange={() => setResolveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Escalation</DialogTitle>
            <DialogDescription>
              Document the resolution for this escalation.
            </DialogDescription>
          </DialogHeader>

          {resolveModal && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="font-medium">{resolveModal.customerName}</p>
                <p className="text-sm text-muted-foreground">{resolveModal.reason}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution notes</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveModal(null)}>
              Cancel
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={handleResolve}
              disabled={!resolution.trim() || isLoading}
            >
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
