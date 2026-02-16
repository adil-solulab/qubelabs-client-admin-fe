export type TimeRange = '7d' | '30d' | '90d' | 'custom';
export type ChannelType = 'voice' | 'chat' | 'email' | 'all';
export type MetricGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';
export type AnalyticsTab = 'overview' | 'channels' | 'sentiment' | 'llm' | 'transcription' | 'compliance' | 'campaigns';

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

export interface OutcomeKPI {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  change: number;
  changeLabel: string;
  trendDirection: 'up' | 'down' | 'neutral';
  sparklineData: number[];
  unit?: string;
  icon: string;
  color: string;
  definition?: string;
}

export interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSent: number;
  openRate: number;
  openRateTrend: number;
  clickThroughRate: number;
  ctrTrend: number;
  bounceRate: number;
  bounceRateTrend: number;
  unsubscribeRate: number;
  conversionRate: number;
  conversionTrend: number;
  revenue: number;
  campaigns: CampaignDetail[];
  funnelData: FunnelStage[];
  engagementOverTime: { date: string; opens: number; clicks: number; conversions: number }[];
}

export interface CampaignDetail {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'draft' | 'paused';
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  conversions: number;
  openRate: number;
  ctr: number;
  sentAt: string;
}

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ChannelAnalytics {
  channel: string;
  conversations: number;
  avgResponseTime: number;
  avgDuration: number;
  csat: number;
  resolutionRate: number;
  trend: number;
  volumeOverTime: { date: string; value: number }[];
}

export interface SpeechAnalytics {
  totalUtterances: number;
  avgConfidence: number;
  topIntents: { intent: string; count: number; percentage: number }[];
  sentimentBreakdown: { label: string; value: number; color: string }[];
  emotionDetection: { emotion: string; count: number; percentage: number }[];
  speechToTextAccuracy: number;
}

export interface LLMAnalytics {
  totalPrompts: number;
  promptSuccessRate: number;
  successRateTrend: number;
  totalTokensUsed: number;
  avgTokensPerRequest: number;
  avgResponseTime: number;
  responseTimeTrend: number;
  responseAccuracy: number;
  accuracyTrend: number;
  costEstimate: number;
  modelUsage: { model: string; requests: number; tokens: number; percentage: number }[];
  promptCategories: { category: string; count: number; successRate: number }[];
  tokenUsageOverTime: { date: string; input: number; output: number }[];
  accuracyOverTime: { date: string; value: number }[];
}

export interface TranscriptionAnalytics {
  totalTranscriptions: number;
  avgAccuracy: number;
  accuracyTrend: number;
  avgProcessingTime: number;
  totalDuration: number;
  errorRate: number;
  errorRateTrend: number;
  languageBreakdown: { language: string; count: number; accuracy: number }[];
  topKeywords: { keyword: string; count: number; sentiment: 'positive' | 'neutral' | 'negative' }[];
  accuracyOverTime: { date: string; value: number }[];
  errorCategories: { category: string; count: number; percentage: number }[];
}

export interface ComplianceAnalytics {
  totalInteractions: number;
  flaggedInteractions: number;
  flaggedRate: number;
  policyViolations: number;
  violationsTrend: number;
  avgRiskScore: number;
  riskScoreTrend: number;
  complianceRate: number;
  violationCategories: { category: string; count: number; severity: 'high' | 'medium' | 'low' }[];
  riskDistribution: { level: string; count: number; percentage: number; color: string }[];
  flaggedOverTime: { date: string; flagged: number; resolved: number }[];
  recentViolations: { id: string; type: string; severity: 'high' | 'medium' | 'low'; agent: string; timestamp: string; status: 'open' | 'resolved' | 'reviewing' }[];
}
