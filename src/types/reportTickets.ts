export type TicketStatus = 'open' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'Agent' | 'Client Admin' | 'Supervisor';
  content: string;
  createdAt: string;
}

export interface ReportTicket {
  id: string;
  conversationId: string;
  customerName: string;
  channel: 'voice' | 'chat' | 'email';
  topic: string;
  reportedBy: string;
  reportedByName: string;
  reportedByRole: 'Agent' | 'Supervisor';
  reportComment: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  closedAt?: string;
  closedBy?: string;
  closedByName?: string;
  closeComment?: string;
  comments: TicketComment[];
}

export const TICKET_STATUS_CONFIG: Record<TicketStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  open: { label: 'Open', color: 'text-warning', bgColor: 'bg-warning/10' },
  closed: { label: 'Closed', color: 'text-success', bgColor: 'bg-success/10' },
};

export const TICKET_PRIORITY_CONFIG: Record<TicketPriority, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  medium: { label: 'Medium', color: 'text-primary', bgColor: 'bg-primary/10' },
  high: { label: 'High', color: 'text-warning', bgColor: 'bg-warning/10' },
  critical: { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};
