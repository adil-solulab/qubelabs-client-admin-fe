// AI-Driven Post-Interaction Survey Types

export type SurveyType = 'csat' | 'nps';
export type DeliveryChannel = 'chat' | 'sms' | 'email';
export type SurveyStatus = 'pending' | 'sent' | 'completed' | 'expired' | 'skipped';
export type EscalationStatus = 'pending' | 'acknowledged' | 'resolved' | 'dismissed';

export interface SurveyConfig {
  id: string;
  name: string;
  enabled: boolean;
  surveyType: SurveyType;
  triggerOn: ('voice_end' | 'chat_end' | 'email_resolved')[];
  deliveryChannels: DeliveryChannel[];
  delaySeconds: number; // Delay after interaction ends
  expirationHours: number;
  thresholds: {
    csatNegative: number; // Score <= this triggers escalation (e.g., 2)
    npsDetractor: number; // Score <= this triggers escalation (e.g., 6)
  };
  followUpEnabled: boolean;
  followUpQuestion: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyConfigId: string;
  conversationId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  channel: 'voice' | 'chat' | 'email';
  agentId?: string;
  agentName?: string;
  surveyType: SurveyType;
  score: number; // 1-5 for CSAT, 0-10 for NPS
  followUpResponse?: string;
  status: SurveyStatus;
  sentAt: string;
  completedAt?: string;
  deliveryChannel: DeliveryChannel;
  aiSummary?: AISummary;
  escalation?: SurveyEscalation;
}

export interface AISummary {
  id: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // -1 to 1
  summary: string;
  keyIssues: string[];
  suggestedActions: string[];
  generatedAt: string;
}

export interface SurveyEscalation {
  id: string;
  responseId: string;
  conversationId: string;
  customerId: string;
  customerName: string;
  score: number;
  surveyType: SurveyType;
  reason: string;
  status: EscalationStatus;
  assignedTo?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  notes: EscalationNote[];
}

export interface EscalationNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface SurveyStats {
  totalSent: number;
  totalCompleted: number;
  responseRate: number;
  averageCsat: number;
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  pendingEscalations: number;
}

export const DEFAULT_SURVEY_CONFIG: Omit<SurveyConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Default Survey',
  enabled: true,
  surveyType: 'csat',
  triggerOn: ['voice_end', 'chat_end'],
  deliveryChannels: ['chat'],
  delaySeconds: 5,
  expirationHours: 24,
  thresholds: {
    csatNegative: 2,
    npsDetractor: 6,
  },
  followUpEnabled: true,
  followUpQuestion: 'What could we have done better?',
};

export const CSAT_LABELS: Record<number, string> = {
  1: 'Very Dissatisfied',
  2: 'Dissatisfied',
  3: 'Neutral',
  4: 'Satisfied',
  5: 'Very Satisfied',
};

export const NPS_CATEGORIES = {
  detractor: { min: 0, max: 6, label: 'Detractor', color: 'text-destructive' },
  passive: { min: 7, max: 8, label: 'Passive', color: 'text-warning' },
  promoter: { min: 9, max: 10, label: 'Promoter', color: 'text-success' },
};

export const getNPSCategory = (score: number): 'detractor' | 'passive' | 'promoter' => {
  if (score <= 6) return 'detractor';
  if (score <= 8) return 'passive';
  return 'promoter';
};
