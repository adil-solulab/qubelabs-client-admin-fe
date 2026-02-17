export type ConversationStatus = 'active' | 'waiting' | 'on_hold' | 'transferring' | 'ended' | 'resolved' | 'missed';
export type ConversationChannel = 'voice' | 'chat' | 'email';
export type SentimentType = 'positive' | 'neutral' | 'negative' | 'escalated';
export type SupervisorMode = 'monitoring' | 'whispering' | 'barged_in' | null;
export type ChatCategory = 'my_chats' | 'active' | 'queued' | 'open' | 'resolved' | 'missed';

export interface SLAConfig {
  firstResponseTime: number;
  resolutionTime: number;
  queueWaitTime: number;
}

export const DEFAULT_SLA: SLAConfig = {
  firstResponseTime: 60,
  resolutionTime: 600,
  queueWaitTime: 120,
};

export interface ConversationMessage {
  id: string;
  role: 'agent' | 'customer' | 'system' | 'whisper';
  content: string;
  timestamp: string;
  sentiment?: SentimentType;
}

export interface CustomerInfo {
  phone?: string;
  email?: string;
  crmId?: string;
  company?: string;
  location?: string;
  tier?: 'standard' | 'premium' | 'enterprise';
  lifetimeValue?: string;
  previousInteractions: PreviousInteraction[];
  tags?: string[];
}

export interface PreviousInteraction {
  id: string;
  channel: ConversationChannel;
  topic: string;
  date: string;
  outcome: 'resolved' | 'escalated' | 'callback';
  agent?: string;
}

export interface RecordingInfo {
  available: boolean;
  url?: string;
  duration?: number;
  transcriptUrl?: string;
}

export interface CoPilotSuggestion {
  id: string;
  type: 'intent' | 'reply' | 'action' | 'knowledge';
  content: string;
  confidence: number;
}

export type NetworkQuality = 'excellent' | 'good' | 'fair' | 'poor';

export type DispositionOutcome = 'resolved' | 'follow_up' | 'escalated' | 'callback_scheduled' | 'voicemail';

export interface CallDisposition {
  outcome: DispositionOutcome;
  summary: string;
  tags: string[];
  followUpDate?: string;
}

export interface LiveConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  agentId: string;
  agentName: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  sentiment: SentimentType;
  startedAt: string;
  duration: number;
  waitTime?: number;
  queuePosition?: number;
  topic: string;
  messages: ConversationMessage[];
  isAiHandled: boolean;
  supervisorMode: SupervisorMode;
  supervisorId?: string;
  groupId?: string;
  slaBreached?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  resolvedAt?: string;
  customerInfo?: CustomerInfo;
  recordingInfo?: RecordingInfo;
  networkQuality?: NetworkQuality;
  coPilotSuggestions?: CoPilotSuggestion[];
  disposition?: CallDisposition;
  notes?: string[];
  transferred?: boolean;
  transferredTo?: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  currentConversations: number;
  maxConversations: number;
  skills: string[];
}

export interface QueueStats {
  totalWaiting: number;
  averageWaitTime: number;
  longestWait: number;
  activeConversations: number;
  availableAgents: number;
}

export const SENTIMENT_CONFIG: Record<SentimentType, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: string;
}> = {
  positive: { label: 'Positive', color: 'text-success', bgColor: 'bg-success/10', icon: '😊' },
  neutral: { label: 'Neutral', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: '😐' },
  negative: { label: 'Negative', color: 'text-warning', bgColor: 'bg-warning/10', icon: '😟' },
  escalated: { label: 'Escalated', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: '🚨' },
};

export const CHANNEL_CONFIG: Record<ConversationChannel, {
  label: string;
  icon: string;
  color: string;
}> = {
  voice: { label: 'Voice', icon: '📞', color: 'text-success' },
  chat: { label: 'Chat', icon: '💬', color: 'text-primary' },
  email: { label: 'Email', icon: '📧', color: 'text-warning' },
};

export const STATUS_CONFIG: Record<ConversationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  active: { label: 'Active', color: 'text-success', bgColor: 'bg-success/10' },
  waiting: { label: 'Waiting', color: 'text-warning', bgColor: 'bg-warning/10' },
  on_hold: { label: 'On Hold', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  transferring: { label: 'Transferring', color: 'text-primary', bgColor: 'bg-primary/10' },
  ended: { label: 'Ended', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  resolved: { label: 'Resolved', color: 'text-success', bgColor: 'bg-success/10' },
  missed: { label: 'Missed', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};
