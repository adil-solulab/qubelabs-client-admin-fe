export type TimeRange = '7d' | '30d' | '90d' | 'custom';
export type ChannelType = 'voice' | 'chat' | 'email' | 'all';
export type MetricGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface ConversationMetrics {
  totalConversations: number;
  avgDuration: number;
  resolutionRate: number;
  firstContactResolution: number;
  avgResponseTime: number;
  handoffRate: number;
  trend: number;
}

export interface AgentMetrics {
  agentId: string;
  agentName: string;
  avatar?: string;
  conversationsHandled: number;
  avgHandleTime: number;
  csat: number;
  resolutionRate: number;
  availability: number;
}

export interface SentimentDataPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  escalated: number;
}

export interface ChannelUtilization {
  channel: ChannelType;
  conversations: number;
  percentage: number;
  avgDuration: number;
  csat: number;
}

export interface CSATNPSData {
  csat: number;
  csatTrend: number;
  nps: number;
  npsTrend: number;
  promoters: number;
  passives: number;
  detractors: number;
  csatHistory: { date: string; value: number }[];
  npsHistory: { date: string; value: number }[];
}

export interface ConversationTrend {
  date: string;
  voice: number;
  chat: number;
  email: number;
  total: number;
}

export interface ExportConfig {
  format: 'pdf' | 'csv' | 'excel';
  dateRange: TimeRange;
  sections: string[];
  includeCharts: boolean;
}
