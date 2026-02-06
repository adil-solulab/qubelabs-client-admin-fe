// Callback & Queue Management Types

export type CallbackStatus = 
  | 'pending'      // Just requested, in queue
  | 'scheduled'    // Scheduled for specific time
  | 'notified'     // Agent has been notified
  | 'accepted'     // Agent accepted the callback
  | 'in_progress'  // Call is active
  | 'completed'    // Successfully completed
  | 'failed'       // Call attempt failed
  | 'cancelled'    // Customer or agent cancelled
  | 'expired';     // Callback window expired

export type CallbackPriority = 'normal' | 'high' | 'urgent';

export interface CallbackRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  reason: string;
  priority: CallbackPriority;
  status: CallbackStatus;
  queuePosition: number;
  createdAt: string;
  scheduledTime?: string;      // ISO timestamp for scheduled callbacks
  scheduledEndTime?: string;   // End of callback window
  assignedAgentId?: string;
  assignedAgentName?: string;
  estimatedWaitTime: number;   // in minutes
  retryCount: number;
  maxRetries: number;
  retryInterval: number;       // in minutes
  lastAttemptAt?: string;
  nextRetryAt?: string;
  completedAt?: string;
  notes: CallbackNote[];
  channel: 'voice' | 'video';
}

export interface CallbackNote {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  type: 'system' | 'agent' | 'retry';
}

export interface CallbackRetryConfig {
  maxRetries: number;
  retryInterval: number;  // in minutes
  autoRetryEnabled: boolean;
}

export interface CallbackQueueStats {
  totalPending: number;
  totalScheduled: number;
  totalInProgress: number;
  averageWaitTime: number;
  longestWait: number;
  completedToday: number;
  failedToday: number;
  availableAgentsForCallback: number;
}

export interface AgentCallbackNotification {
  id: string;
  callbackId: string;
  agentId: string;
  customerName: string;
  customerPhone: string;
  reason: string;
  priority: CallbackPriority;
  scheduledTime?: string;
  createdAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

export interface BusinessHours {
  dayOfWeek: number;  // 0 = Sunday, 6 = Saturday
  openTime: string;   // "09:00"
  closeTime: string;  // "17:00"
  isOpen: boolean;
}

export const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { dayOfWeek: 0, openTime: '00:00', closeTime: '00:00', isOpen: false },
  { dayOfWeek: 1, openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 2, openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 3, openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 4, openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 5, openTime: '09:00', closeTime: '18:00', isOpen: true },
  { dayOfWeek: 6, openTime: '10:00', closeTime: '14:00', isOpen: true },
];

export const DEFAULT_RETRY_CONFIG: CallbackRetryConfig = {
  maxRetries: 3,
  retryInterval: 15,
  autoRetryEnabled: true,
};

export const STATUS_CONFIG: Record<CallbackStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: string;
}> = {
  pending: { label: 'Pending', color: 'text-warning', bgColor: 'bg-warning/10', icon: '⏳' },
  scheduled: { label: 'Scheduled', color: 'text-primary', bgColor: 'bg-primary/10', icon: '📅' },
  notified: { label: 'Agent Notified', color: 'text-blue-500', bgColor: 'bg-blue-500/10', icon: '🔔' },
  accepted: { label: 'Accepted', color: 'text-success', bgColor: 'bg-success/10', icon: '✅' },
  in_progress: { label: 'In Progress', color: 'text-success', bgColor: 'bg-success/10', icon: '📞' },
  completed: { label: 'Completed', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '✔️' },
  failed: { label: 'Failed', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: '❌' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '🚫' },
  expired: { label: 'Expired', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '⏰' },
};

export const PRIORITY_CONFIG: Record<CallbackPriority, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  normal: { label: 'Normal', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  high: { label: 'High', color: 'text-warning', bgColor: 'bg-warning/10' },
  urgent: { label: 'Urgent', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};
