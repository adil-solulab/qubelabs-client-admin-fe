import { useState, useCallback, useMemo } from 'react';
import type { ReportTicket, TicketComment, TicketStatus, TicketPriority } from '@/types/reportTickets';

const generateMockTickets = (): ReportTicket[] => [
  {
    id: 'ticket-1',
    conversationId: 'conv-3',
    customerName: 'Sarah Johnson',
    channel: 'voice',
    topic: 'Technical Issue - Urgent',
    reportedBy: 'agent-1',
    reportedByName: 'John Smith',
    reportedByRole: 'Agent',
    reportComment: 'Customer is extremely frustrated. This is their third call about the same issue. They are threatening to cancel their subscription. Need admin intervention.',
    status: 'open',
    priority: 'critical',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    comments: [
      {
        id: 'comment-1',
        ticketId: 'ticket-1',
        authorId: 'agent-1',
        authorName: 'John Smith',
        authorRole: 'Agent',
        content: 'Customer has been experiencing intermittent connectivity issues for 2 weeks. Previous agents attempted basic troubleshooting without success.',
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'ticket-2',
    conversationId: 'conv-7',
    customerName: 'Robert Williams',
    channel: 'chat',
    topic: 'Billing Dispute',
    reportedBy: 'agent-1',
    reportedByName: 'John Smith',
    reportedByRole: 'Agent',
    reportComment: 'Customer claims they were double charged for last month. I can see two transactions but need admin approval to process the refund.',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    comments: [],
  },
  {
    id: 'ticket-3',
    conversationId: 'conv-8',
    customerName: 'Emily Davis',
    channel: 'email',
    topic: 'Account Access Issue',
    reportedBy: 'agent-2',
    reportedByName: 'Emma Wilson',
    reportedByRole: 'Agent',
    reportComment: 'Customer cannot access their account after a password reset. Standard recovery process did not work. May need backend team involvement.',
    status: 'closed',
    priority: 'medium',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    closedBy: 'admin-1',
    closedByName: 'John Anderson',
    closeComment: 'Account has been manually unlocked. Customer was contacted and confirmed they can now access their account. Root cause was a database sync issue which has been resolved.',
    comments: [
      {
        id: 'comment-2',
        ticketId: 'ticket-3',
        authorId: 'agent-2',
        authorName: 'Emma Wilson',
        authorRole: 'Agent',
        content: 'Customer tried resetting password 3 times. Each time they get a success email but the new password does not work.',
        createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'comment-3',
        ticketId: 'ticket-3',
        authorId: 'admin-1',
        authorName: 'John Anderson',
        authorRole: 'Client Admin',
        content: 'I have escalated this to the backend team. They found a sync issue between the auth service and the main database. Fix is being deployed now.',
        createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'ticket-4',
    conversationId: 'conv-9',
    customerName: 'James Wilson',
    channel: 'voice',
    topic: 'Service Complaint',
    reportedBy: 'agent-4',
    reportedByName: 'Sarah Davis',
    reportedByRole: 'Agent',
    reportComment: 'Customer is unhappy with the response time for their support tickets. They are a premium customer and expect faster resolution.',
    status: 'closed',
    priority: 'low',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    closedBy: 'admin-1',
    closedByName: 'John Anderson',
    closeComment: 'Assigned a dedicated support agent to this customer. Their account has been flagged for priority handling. Communicated the changes to the customer who was satisfied.',
    comments: [
      {
        id: 'comment-4',
        ticketId: 'ticket-4',
        authorId: 'admin-1',
        authorName: 'John Anderson',
        authorRole: 'Client Admin',
        content: 'Thank you for reporting this. We will review our SLA for premium customers.',
        createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export interface CreateTicketData {
  conversationId: string;
  customerName: string;
  channel: 'voice' | 'chat' | 'email';
  topic: string;
  reportComment: string;
  priority: TicketPriority;
}

export function useReportTicketsData() {
  const [tickets, setTickets] = useState<ReportTicket[]>(generateMockTickets());

  const createTicket = useCallback((data: CreateTicketData, reportedBy: string, reportedByName: string, reportedByRole: 'Agent' | 'Supervisor') => {
    const newTicket: ReportTicket = {
      id: `ticket-${Date.now()}`,
      conversationId: data.conversationId,
      customerName: data.customerName,
      channel: data.channel,
      topic: data.topic,
      reportedBy,
      reportedByName,
      reportedByRole,
      reportComment: data.reportComment,
      status: 'open',
      priority: data.priority,
      createdAt: new Date().toISOString(),
      comments: [],
    };
    setTickets(prev => [newTicket, ...prev]);
    return newTicket;
  }, []);

  const closeTicket = useCallback((ticketId: string, closeComment: string, closedBy: string, closedByName: string) => {
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? {
            ...t,
            status: 'closed' as TicketStatus,
            closedAt: new Date().toISOString(),
            closedBy,
            closedByName,
            closeComment,
          }
        : t
    ));
  }, []);

  const addComment = useCallback((ticketId: string, authorId: string, authorName: string, authorRole: 'Agent' | 'Client Admin' | 'Supervisor', content: string) => {
    const newComment: TicketComment = {
      id: `comment-${Date.now()}`,
      ticketId,
      authorId,
      authorName,
      authorRole,
      content,
      createdAt: new Date().toISOString(),
    };
    setTickets(prev => prev.map(t =>
      t.id === ticketId
        ? { ...t, comments: [...t.comments, newComment] }
        : t
    ));
    return newComment;
  }, []);

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    critical: tickets.filter(t => t.priority === 'critical' && t.status === 'open').length,
  }), [tickets]);

  return {
    tickets,
    createTicket,
    closeTicket,
    addComment,
    stats,
  };
}
