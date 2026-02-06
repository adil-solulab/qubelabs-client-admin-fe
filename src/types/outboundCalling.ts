export type LeadStatus = 'pending' | 'calling' | 'completed' | 'failed' | 'no_answer' | 'escalated';
export type CallOutcome = 'answered' | 'voicemail' | 'no_answer' | 'busy' | 'failed' | 'escalated';
export type CampaignStatus = 'draft' | 'scheduled' | 'running' | 'paused' | 'completed';
export type SentimentType = 'positive' | 'neutral' | 'negative' | 'escalated';

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

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  totalLeads: number;
  calledLeads: number;
  successfulCalls: number;
  failedCalls: number;
  escalatedCalls: number;
  averageDuration: number;
  script?: string;
  aiPersonaId?: string;
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
