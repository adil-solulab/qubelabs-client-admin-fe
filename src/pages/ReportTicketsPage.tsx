import { useState, useMemo, useEffect } from 'react';
import {
  Flag,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  Send,
  X,
  ChevronLeft,
  User,
  Shield,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useReportTickets } from '@/hooks/useReportTicketsContext';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import { TICKET_STATUS_CONFIG, TICKET_PRIORITY_CONFIG } from '@/types/reportTickets';
import type { ReportTicket, TicketStatus, TicketPriority } from '@/types/reportTickets';
import { cn } from '@/lib/utils';

export default function ReportTicketsPage() {
  const { tickets, closeTicket, addComment, stats } = useReportTickets();
  const { currentRole, isClientAdmin, currentUser } = useAuth();
  const roleName = currentRole?.name || 'Client Admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<ReportTicket | null>(null);
  const [newComment, setNewComment] = useState('');
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [closeComment, setCloseComment] = useState('');

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch =
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.reportedByName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.reportComment.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'voice': return <Phone className="w-3.5 h-3.5" />;
      case 'chat': return <MessageSquare className="w-3.5 h-3.5" />;
      case 'email': return <Mail className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets]);

  const handleAddComment = () => {
    if (!selectedTicket || !newComment.trim()) return;
    const authorRole = isClientAdmin ? 'Client Admin' : (roleName === 'Supervisor' ? 'Supervisor' : 'Agent');
    addComment(
      selectedTicket.id,
      currentUser?.id || 'current-user',
      currentUser?.name || 'Current User',
      authorRole as 'Agent' | 'Client Admin' | 'Supervisor',
      newComment.trim()
    );
    setNewComment('');
    notify.success('Comment added', 'Your comment has been posted.');
  };

  const handleCloseTicket = () => {
    if (!selectedTicket || !closeComment.trim()) return;
    closeTicket(
      selectedTicket.id,
      closeComment.trim(),
      currentUser?.id || 'admin-1',
      currentUser?.name || 'John Anderson'
    );
    notify.success('Ticket closed', 'The report ticket has been closed.');
    setCloseModalOpen(false);
    setCloseComment('');
    setSelectedTicket(null);
  };

  return (
    <AppLayout>
      <div className="absolute inset-6 flex flex-col animate-fade-in overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Report Tickets</h1>
            <p className="text-sm text-muted-foreground">
              {isClientAdmin
                ? 'Review and manage reported conversation tickets'
                : 'View your reported conversation tickets'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 flex-shrink-0">
          <Card className="gradient-card">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Flag className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.total}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.open}</p>
                  <p className="text-[10px] text-muted-foreground">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.closed}</p>
                  <p className="text-[10px] text-muted-foreground">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="gradient-card">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold">{stats.critical}</p>
                  <p className="text-[10px] text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          <div className={cn("flex flex-col min-h-0 overflow-hidden", selectedTicket ? "w-1/2" : "flex-1")}>
            <Card className="gradient-card mb-4 flex-shrink-0">
              <CardContent className="pt-3 pb-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tickets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | 'all')}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | 'all')}>
                      <SelectTrigger className="w-[110px]">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ScrollArea className="flex-1 min-h-0 h-full">
              <div className="space-y-3 pr-2">
                {filteredTickets.length === 0 ? (
                  <Card className="gradient-card">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Flag className="w-12 h-12 text-muted-foreground mb-4" />
                      <h3 className="font-semibold mb-1">No tickets found</h3>
                      <p className="text-sm text-muted-foreground">
                        {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Report tickets will appear here when conversations are reported'}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredTickets.map(ticket => {
                    const statusCfg = TICKET_STATUS_CONFIG[ticket.status];
                    const priorityCfg = TICKET_PRIORITY_CONFIG[ticket.priority];
                    return (
                      <Card
                        key={ticket.id}
                        className={cn(
                          'cursor-pointer card-interactive animate-list-item-in',
                          selectedTicket?.id === ticket.id && 'ring-2 ring-primary shadow-glow',
                          ticket.priority === 'critical' && ticket.status === 'open' && 'border-destructive/50'
                        )}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                              <Flag className={cn("w-5 h-5", ticket.status === 'open' ? 'text-warning' : 'text-success')} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold truncate">{ticket.customerName}</p>
                                <Badge variant="outline" className={cn('text-[10px] shrink-0', statusCfg.color)}>
                                  {statusCfg.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground truncate mt-0.5">{ticket.topic}</p>
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="secondary" className={cn('text-[10px] gap-1', priorityCfg.bgColor, priorityCfg.color)}>
                                  {priorityCfg.label}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  {getChannelIcon(ticket.channel)}
                                  <span className="capitalize">{ticket.channel}</span>
                                </Badge>
                                <Badge variant="outline" className="text-[10px] gap-1">
                                  <User className="w-3 h-3" />
                                  {ticket.reportedByName}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground ml-auto">
                                  {formatDate(ticket.createdAt)}
                                </span>
                              </div>
                              {ticket.comments.length > 0 && (
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground mt-3 flex-shrink-0">
              Showing {filteredTickets.length} of {tickets.length} tickets
            </p>
          </div>

          {selectedTicket && (
            <div className="w-1/2 flex flex-col min-h-0 overflow-hidden border rounded-lg bg-background">
              <div className="p-4 border-b flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)} className="h-8 w-8">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{selectedTicket.customerName}</h3>
                        <Badge variant="outline" className={cn('text-[10px]', TICKET_STATUS_CONFIG[selectedTicket.status].color)}>
                          {TICKET_STATUS_CONFIG[selectedTicket.status].label}
                        </Badge>
                        <Badge variant="secondary" className={cn('text-[10px]', TICKET_PRIORITY_CONFIG[selectedTicket.priority].bgColor, TICKET_PRIORITY_CONFIG[selectedTicket.priority].color)}>
                          {TICKET_PRIORITY_CONFIG[selectedTicket.priority].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{selectedTicket.topic}</p>
                    </div>
                  </div>
                  {isClientAdmin && selectedTicket.status === 'open' && (
                    <Button
                      size="sm"
                      onClick={() => setCloseModalOpen(true)}
                      className="bg-success text-success-foreground hover:bg-success/90"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Close Ticket
                    </Button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1">
                      {getChannelIcon(selectedTicket.channel)}
                      <span className="text-sm font-medium capitalize">{selectedTicket.channel}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Channel</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">{selectedTicket.reportedByName}</p>
                    <p className="text-[10px] text-muted-foreground">Reported by ({selectedTicket.reportedByRole})</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">{formatDate(selectedTicket.createdAt)}</p>
                    <p className="text-[10px] text-muted-foreground">Created</p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 space-y-4">
                  <div className="rounded-lg border bg-warning/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-[10px] bg-warning/20 text-warning">
                          {selectedTicket.reportedByName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{selectedTicket.reportedByName}</p>
                        <p className="text-[10px] text-muted-foreground">{selectedTicket.reportedByRole} &middot; {formatDate(selectedTicket.createdAt)}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] ml-auto">Initial Report</Badge>
                    </div>
                    <p className="text-sm">{selectedTicket.reportComment}</p>
                  </div>

                  {selectedTicket.comments.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        {selectedTicket.comments.map(comment => {
                          const isAdmin = comment.authorRole === 'Client Admin';
                          return (
                            <div key={comment.id} className={cn("rounded-lg border p-3", isAdmin ? 'bg-primary/5 border-primary/20' : 'bg-muted/30')}>
                              <div className="flex items-center gap-2 mb-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className={cn("text-[10px]", isAdmin ? 'bg-primary/20 text-primary' : 'bg-muted')}>
                                    {comment.authorName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <p className="text-sm font-medium">{comment.authorName}</p>
                                <Badge variant={isAdmin ? 'default' : 'outline'} className="text-[10px]">
                                  {isAdmin && <Shield className="w-2.5 h-2.5 mr-0.5" />}
                                  {comment.authorRole}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground ml-auto">{formatDate(comment.createdAt)}</span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {selectedTicket.status === 'closed' && selectedTicket.closeComment && (
                    <>
                      <Separator />
                      <div className="rounded-lg border bg-success/5 border-success/20 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-success" />
                          <p className="text-sm font-medium">Ticket Closed by {selectedTicket.closedByName}</p>
                          <span className="text-[10px] text-muted-foreground ml-auto">
                            {selectedTicket.closedAt && formatDate(selectedTicket.closedAt)}
                          </span>
                        </div>
                        <p className="text-sm">{selectedTicket.closeComment}</p>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>

              {selectedTicket.status === 'open' && (
                <div className="p-3 border-t flex-shrink-0">
                  <div className="flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      className="text-sm"
                    />
                    <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={closeModalOpen} onOpenChange={setCloseModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              Close Ticket
            </DialogTitle>
            <DialogDescription>
              Add a resolution comment before closing this ticket. The agent will be able to see your response.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedTicket && (
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-sm font-medium">{selectedTicket.customerName}</p>
                <p className="text-xs text-muted-foreground">{selectedTicket.topic}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="close-comment">Resolution Comment *</Label>
              <Textarea
                id="close-comment"
                value={closeComment}
                onChange={(e) => setCloseComment(e.target.value)}
                placeholder="Describe the resolution or actions taken..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCloseModalOpen(false); setCloseComment(''); }}>
              Cancel
            </Button>
            <Button onClick={handleCloseTicket} disabled={!closeComment.trim()} className="bg-success text-success-foreground hover:bg-success/90">
              Close Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
