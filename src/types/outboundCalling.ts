export type LeadStatus = 'pending' | 'calling' | 'completed' | 'failed' | 'no_answer' | 'escalated';
export type CallOutcome = 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'failed' | 'escalated';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
export type SentimentType = 'positive' | 'neutral' | 'negative' | 'escalated';
export type CampaignChannel = 'voice' | 'whatsapp' | 'sms' | 'email';
export type ScheduleType = 'now' | 'later' | 'recurring';
export type GoalType = 'delivery' | 'conversion' | 'response';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  status: LeadStatus;
  callAttempts: number;
  lastCallAt?: string;
  outcome?: CallOutcome;
  sentiment?: SentimentType;
  duration?: number;
  notes?: string;
  escalatedTo?: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  channel: CampaignChannel;
  content: string;
  variables: string[];
  category: string;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface CampaignSegment {
  id: string;
  name: string;
  description: string;
  userCount: number;
  createdAt: string;
  filters?: string[];
}

export interface CampaignSchedule {
  type: ScheduleType;
  date?: string;
  time?: string;
  timezone: string;
  recurringDays?: string[];
  recurringEndDate?: string;
}

export interface CampaignGoal {
  type: GoalType;
  targetPercentage: number;
  trackDuration: number;
  trackUnit: 'hours' | 'days';
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  channel: CampaignChannel;
  templateId?: string;
  templateName?: string;
  segmentId?: string;
  segmentName?: string;
  schedule?: CampaignSchedule;
  goal?: CampaignGoal;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  scheduledAt?: string;
  totalLeads: number;
  calledLeads: number;
  successfulCalls: number;
  failedCalls: number;
  escalatedCalls: number;
  averageDuration: number;
  deliveryRate?: number;
  responseRate?: number;
  script?: string;
  aiPersonaId?: string;
  flowId?: string;
  flowName?: string;
  workflowId?: string;
  workflowName?: string;
}

export interface CallOutcomeStats {
  answered: number;
  voicemail: number;
  noAnswer: number;
  busy: number;
  failed: number;
  escalated: number;
}

export interface SentimentStats {
  positive: number;
  neutral: number;
  negative: number;
  escalated: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  totalLeads?: number;
  validLeads?: number;
  errors?: string[];
}

export interface CreateCampaignData {
  name: string;
  description: string;
  channel: CampaignChannel;
  flowId?: string;
  flowName?: string;
  workflowId?: string;
  workflowName?: string;
  templateId?: string;
  segmentId?: string;
  schedule?: CampaignSchedule;
  goal?: CampaignGoal;
}

export const CHANNEL_CONFIG: Record<CampaignChannel, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  voice: { label: 'Voice', icon: 'phone', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  whatsapp: { label: 'WhatsApp', icon: 'message-circle', color: 'text-green-600', bgColor: 'bg-green-50' },
  sms: { label: 'SMS', icon: 'message-square', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  email: { label: 'Email', icon: 'mail', color: 'text-orange-600', bgColor: 'bg-orange-50' },
};

export const LEAD_STATUS_CONFIG: Record<LeadStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  pending: { label: 'Pending', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  calling: { label: 'Calling', color: 'text-primary', bgColor: 'bg-primary/10' },
  completed: { label: 'Completed', color: 'text-success', bgColor: 'bg-success/10' },
  failed: { label: 'Failed', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  no_answer: { label: 'No Answer', color: 'text-warning', bgColor: 'bg-warning/10' },
  escalated: { label: 'Escalated', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
};

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

export const CAMPAIGN_STATUS_CONFIG: Record<CampaignStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  draft: { label: 'Draft', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  scheduled: { label: 'Scheduled', color: 'text-primary', bgColor: 'bg-primary/10' },
  running: { label: 'Running', color: 'text-success', bgColor: 'bg-success/10' },
  paused: { label: 'Paused', color: 'text-warning', bgColor: 'bg-warning/10' },
  completed: { label: 'Completed', color: 'text-muted-foreground', bgColor: 'bg-muted' },
};
