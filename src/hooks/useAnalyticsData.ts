import { useState, useMemo } from 'react';
import type {
  TimeRange,
  ChannelType,
  ConversationMetrics,
  AgentMetrics,
  SentimentDataPoint,
  ChannelUtilization,
  CSATNPSData,
  ConversationTrend,
  OutcomeKPI,
  CampaignMetrics,
  ChannelAnalytics,
  SpeechAnalytics,
  LLMAnalytics,
  TranscriptionAnalytics,
  ComplianceAnalytics,
} from '@/types/analytics';

const generateDateLabels = (range: TimeRange): string[] => {
  const labels: string[] = [];
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
};

const generateConversationTrends = (range: TimeRange): ConversationTrend[] => {
  const labels = generateDateLabels(range);
  return labels.map(date => ({
    date,
    voice: Math.floor(Math.random() * 50) + 20,
    chat: Math.floor(Math.random() * 80) + 40,
    email: Math.floor(Math.random() * 30) + 10,
    total: 0,
  })).map(item => ({ ...item, total: item.voice + item.chat + item.email }));
};

const generateSentimentTrends = (range: TimeRange): SentimentDataPoint[] => {
  const labels = generateDateLabels(range);
  return labels.map(date => ({
    date,
    positive: Math.floor(Math.random() * 40) + 30,
    neutral: Math.floor(Math.random() * 30) + 20,
    negative: Math.floor(Math.random() * 15) + 5,
    escalated: Math.floor(Math.random() * 10) + 2,
  }));
};

const generateCSATHistory = (range: TimeRange): { date: string; value: number }[] => {
  const labels = generateDateLabels(range);
  return labels.map(date => ({
    date,
    value: Math.floor(Math.random() * 15) + 80,
  }));
};

const generateNPSHistory = (range: TimeRange): { date: string; value: number }[] => {
  const labels = generateDateLabels(range);
  return labels.map(date => ({
    date,
    value: Math.floor(Math.random() * 30) + 40,
  }));
};

const generateSparkline = (count: number, min: number, max: number): number[] => {
  return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min)) + min);
};

export function useAnalyticsData() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [channelFilter, setChannelFilter] = useState<ChannelType>('all');

  const conversationMetrics: ConversationMetrics = useMemo(() => ({
    totalConversations: timeRange === '7d' ? 1247 : timeRange === '30d' ? 5832 : 18456,
    avgDuration: 185,
    resolutionRate: 87.5,
    firstContactResolution: 72.3,
    avgResponseTime: 12,
    handoffRate: 8.2,
    trend: 12.5,
  }), [timeRange]);

  const agentMetrics: AgentMetrics[] = useMemo(() => [
    { agentId: 'ai-1', agentName: 'AI Assistant', conversationsHandled: 3420, avgHandleTime: 145, csat: 92, resolutionRate: 89, availability: 100 },
    { agentId: 'agent-1', agentName: 'John Smith', conversationsHandled: 856, avgHandleTime: 312, csat: 88, resolutionRate: 94, availability: 85 },
    { agentId: 'agent-2', agentName: 'Emma Wilson', conversationsHandled: 742, avgHandleTime: 285, csat: 91, resolutionRate: 92, availability: 90 },
    { agentId: 'agent-3', agentName: 'Mike Brown', conversationsHandled: 523, avgHandleTime: 298, csat: 85, resolutionRate: 88, availability: 78 },
    { agentId: 'agent-4', agentName: 'Sarah Davis', conversationsHandled: 691, avgHandleTime: 267, csat: 94, resolutionRate: 96, availability: 92 },
  ], []);

  const channelUtilization: ChannelUtilization[] = useMemo(() => {
    const data = [
      { channel: 'chat' as ChannelType, conversations: 2845, percentage: 48.8, avgDuration: 145, csat: 91 },
      { channel: 'voice' as ChannelType, conversations: 1923, percentage: 33.0, avgDuration: 285, csat: 88 },
      { channel: 'email' as ChannelType, conversations: 1064, percentage: 18.2, avgDuration: 0, csat: 85 },
    ];
    if (channelFilter === 'all') return data;
    return data.filter(d => d.channel === channelFilter);
  }, [channelFilter]);

  const csatNpsData: CSATNPSData = useMemo(() => ({
    csat: 89.5,
    csatTrend: 2.3,
    nps: 62,
    npsTrend: 5,
    promoters: 68,
    passives: 22,
    detractors: 10,
    csatHistory: generateCSATHistory(timeRange),
    npsHistory: generateNPSHistory(timeRange),
  }), [timeRange]);

  const sentimentTrends = useMemo(() => generateSentimentTrends(timeRange), [timeRange]);
  const conversationTrends = useMemo(() => generateConversationTrends(timeRange), [timeRange]);

  const outcomeKPIs: OutcomeKPI[] = useMemo(() => [
    {
      id: 'time-saved',
      label: 'Time Saved',
      value: '1,240h',
      numericValue: 1240,
      change: 18.5,
      changeLabel: 'vs last period',
      trendDirection: 'up',
      sparklineData: generateSparkline(12, 80, 140),
      unit: 'hours',
      icon: 'clock',
      color: 'primary',
    },
    {
      id: 'effort-saved',
      label: 'Effort Saved',
      value: '68%',
      numericValue: 68,
      change: 5.2,
      changeLabel: 'vs last period',
      trendDirection: 'up',
      sparklineData: generateSparkline(12, 55, 75),
      unit: '%',
      icon: 'zap',
      color: 'success',
    },
    {
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: '24.8%',
      numericValue: 24.8,
      change: 3.1,
      changeLabel: 'vs last period',
      trendDirection: 'up',
      sparklineData: generateSparkline(12, 18, 28),
      unit: '%',
      icon: 'target',
      color: 'warning',
    },
    {
      id: 'engagement-rate',
      label: 'Engagement Rate',
      value: '78.3%',
      numericValue: 78.3,
      change: -1.2,
      changeLabel: 'vs last period',
      trendDirection: 'down',
      sparklineData: generateSparkline(12, 70, 85),
      unit: '%',
      icon: 'heart',
      color: 'destructive',
    },
    {
      id: 'csat-outcome',
      label: 'CSAT Score',
      value: '89.5%',
      numericValue: 89.5,
      change: 2.3,
      changeLabel: 'vs last period',
      trendDirection: 'up',
      sparklineData: generateSparkline(12, 82, 94),
      unit: '%',
      icon: 'star',
      color: 'primary',
    },
  ], []);

  const campaignMetrics: CampaignMetrics = useMemo(() => ({
    totalCampaigns: 12,
    activeCampaigns: 4,
    totalSent: 45680,
    openRate: 42.3,
    openRateTrend: 3.8,
    clickThroughRate: 12.7,
    ctrTrend: 1.2,
    bounceRate: 2.1,
    bounceRateTrend: -0.5,
    unsubscribeRate: 0.3,
    conversionRate: 8.4,
    conversionTrend: 2.1,
    revenue: 128450,
    campaigns: [
      { id: 'c1', name: 'Spring Onboarding Series', status: 'completed', sent: 12500, delivered: 12250, opens: 5680, clicks: 1820, conversions: 456, openRate: 46.4, ctr: 14.9, sentAt: '2024-05-01' },
      { id: 'c2', name: 'Product Update Announcement', status: 'active', sent: 8900, delivered: 8720, opens: 3840, clicks: 1050, conversions: 312, openRate: 44.0, ctr: 12.0, sentAt: '2024-05-10' },
      { id: 'c3', name: 'Customer Feedback Survey', status: 'active', sent: 6200, delivered: 6050, opens: 2420, clicks: 680, conversions: 189, openRate: 40.0, ctr: 11.2, sentAt: '2024-05-15' },
      { id: 'c4', name: 'Feature Launch - AI Assistant', status: 'active', sent: 10800, delivered: 10650, opens: 4520, clicks: 1380, conversions: 520, openRate: 42.4, ctr: 13.0, sentAt: '2024-05-18' },
      { id: 'c5', name: 'Retention Win-Back Campaign', status: 'paused', sent: 3400, delivered: 3320, opens: 1120, clicks: 340, conversions: 98, openRate: 33.7, ctr: 10.2, sentAt: '2024-05-05' },
      { id: 'c6', name: 'Q2 Newsletter', status: 'draft', sent: 0, delivered: 0, opens: 0, clicks: 0, conversions: 0, openRate: 0, ctr: 0, sentAt: '' },
    ],
    funnelData: [
      { stage: 'Sent', count: 45680, percentage: 100, color: 'hsl(var(--primary))' },
      { stage: 'Delivered', count: 44890, percentage: 98.3, color: '#3b82f6' },
      { stage: 'Opened', count: 19280, percentage: 42.3, color: '#22c55e' },
      { stage: 'Clicked', count: 5790, percentage: 12.7, color: '#f59e0b' },
      { stage: 'Converted', count: 3840, percentage: 8.4, color: '#ef4444' },
    ],
    engagementOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({
      date,
      opens: Math.floor(Math.random() * 500) + 200,
      clicks: Math.floor(Math.random() * 150) + 50,
      conversions: Math.floor(Math.random() * 50) + 10,
    })),
  }), [timeRange]);

  const channelAnalytics: ChannelAnalytics[] = useMemo(() => [
    {
      channel: 'Chat',
      conversations: 2845,
      avgResponseTime: 8,
      avgDuration: 145,
      csat: 91,
      resolutionRate: 88,
      trend: 15.2,
      volumeOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({ date, value: Math.floor(Math.random() * 120) + 60 })),
    },
    {
      channel: 'Voice',
      conversations: 1923,
      avgResponseTime: 18,
      avgDuration: 285,
      csat: 88,
      resolutionRate: 92,
      trend: 8.7,
      volumeOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({ date, value: Math.floor(Math.random() * 80) + 40 })),
    },
    {
      channel: 'Email',
      conversations: 1064,
      avgResponseTime: 120,
      avgDuration: 0,
      csat: 85,
      resolutionRate: 78,
      trend: -3.1,
      volumeOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({ date, value: Math.floor(Math.random() * 50) + 20 })),
    },
  ], [timeRange]);

  const speechAnalytics: SpeechAnalytics = useMemo(() => ({
    totalUtterances: 28450,
    avgConfidence: 94.2,
    speechToTextAccuracy: 96.8,
    topIntents: [
      { intent: 'Billing Inquiry', count: 4520, percentage: 22.1 },
      { intent: 'Technical Support', count: 3890, percentage: 19.0 },
      { intent: 'Account Management', count: 3210, percentage: 15.7 },
      { intent: 'Product Information', count: 2780, percentage: 13.6 },
      { intent: 'Order Status', count: 2340, percentage: 11.4 },
      { intent: 'Complaint', count: 1560, percentage: 7.6 },
      { intent: 'Feedback', count: 1120, percentage: 5.5 },
      { intent: 'General Inquiry', count: 1030, percentage: 5.0 },
    ],
    sentimentBreakdown: [
      { label: 'Positive', value: 42, color: '#22c55e' },
      { label: 'Neutral', value: 38, color: '#6b7280' },
      { label: 'Negative', value: 20, color: '#f59e0b' },
    ],
    emotionDetection: [
      { emotion: 'Satisfied', count: 8450, percentage: 29.7 },
      { emotion: 'Neutral', count: 7890, percentage: 27.7 },
      { emotion: 'Frustrated', count: 4230, percentage: 14.9 },
      { emotion: 'Happy', count: 3890, percentage: 13.7 },
      { emotion: 'Confused', count: 2340, percentage: 8.2 },
      { emotion: 'Angry', count: 1650, percentage: 5.8 },
    ],
  }), []);

  const llmAnalytics: LLMAnalytics = useMemo(() => ({
    totalPrompts: 156780,
    promptSuccessRate: 94.6,
    successRateTrend: 1.8,
    totalTokensUsed: 42500000,
    avgTokensPerRequest: 271,
    avgResponseTime: 1.2,
    responseTimeTrend: -0.3,
    responseAccuracy: 91.2,
    accuracyTrend: 2.1,
    costEstimate: 2145.80,
    modelUsage: [
      { model: 'GPT-4o', requests: 89450, tokens: 28500000, percentage: 57.1 },
      { model: 'GPT-4o-mini', requests: 45230, tokens: 9800000, percentage: 28.9 },
      { model: 'Claude 3.5', requests: 15600, tokens: 3200000, percentage: 9.9 },
      { model: 'Custom Fine-tuned', requests: 6500, tokens: 1000000, percentage: 4.1 },
    ],
    promptCategories: [
      { category: 'Customer Support', count: 52340, successRate: 96.2 },
      { category: 'Sales Assistance', count: 34560, successRate: 93.8 },
      { category: 'Knowledge Retrieval', count: 28900, successRate: 95.1 },
      { category: 'Summarization', count: 18450, successRate: 97.4 },
      { category: 'Translation', count: 12340, successRate: 91.5 },
      { category: 'Sentiment Analysis', count: 10190, successRate: 89.3 },
    ],
    tokenUsageOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({
      date,
      input: Math.floor(Math.random() * 200000) + 100000,
      output: Math.floor(Math.random() * 100000) + 50000,
    })),
    accuracyOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({
      date,
      value: Math.floor(Math.random() * 8) + 88,
    })),
  }), [timeRange]);

  const transcriptionAnalytics: TranscriptionAnalytics = useMemo(() => ({
    totalTranscriptions: 18920,
    avgAccuracy: 96.4,
    accuracyTrend: 0.8,
    avgProcessingTime: 2.3,
    totalDuration: 4560,
    errorRate: 3.6,
    errorRateTrend: -0.5,
    languageBreakdown: [
      { language: 'English', count: 14230, accuracy: 97.8 },
      { language: 'Spanish', count: 2340, accuracy: 95.2 },
      { language: 'French', count: 1120, accuracy: 94.6 },
      { language: 'German', count: 780, accuracy: 93.8 },
      { language: 'Portuguese', count: 450, accuracy: 92.4 },
    ],
    topKeywords: [
      { keyword: 'refund', count: 2340, sentiment: 'negative' },
      { keyword: 'thank you', count: 1890, sentiment: 'positive' },
      { keyword: 'account', count: 1650, sentiment: 'neutral' },
      { keyword: 'upgrade', count: 1420, sentiment: 'positive' },
      { keyword: 'issue', count: 1280, sentiment: 'negative' },
      { keyword: 'billing', count: 1120, sentiment: 'neutral' },
      { keyword: 'feature', count: 980, sentiment: 'positive' },
      { keyword: 'cancel', count: 870, sentiment: 'negative' },
      { keyword: 'support', count: 780, sentiment: 'neutral' },
      { keyword: 'excellent', count: 650, sentiment: 'positive' },
    ],
    accuracyOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({
      date,
      value: Math.floor(Math.random() * 5) + 93,
    })),
    errorCategories: [
      { category: 'Background Noise', count: 245, percentage: 36.1 },
      { category: 'Accent Variation', count: 178, percentage: 26.2 },
      { category: 'Cross-talk', count: 124, percentage: 18.3 },
      { category: 'Technical Jargon', count: 89, percentage: 13.1 },
      { category: 'Low Volume', count: 43, percentage: 6.3 },
    ],
  }), [timeRange]);

  const complianceAnalytics: ComplianceAnalytics = useMemo(() => ({
    totalInteractions: 24560,
    flaggedInteractions: 342,
    flaggedRate: 1.4,
    policyViolations: 28,
    violationsTrend: -12.5,
    avgRiskScore: 18.3,
    riskScoreTrend: -3.2,
    complianceRate: 98.6,
    violationCategories: [
      { category: 'Data Privacy', count: 8, severity: 'high' },
      { category: 'Unauthorized Disclosure', count: 5, severity: 'high' },
      { category: 'Script Deviation', count: 7, severity: 'medium' },
      { category: 'Tone & Language', count: 4, severity: 'medium' },
      { category: 'Missing Consent', count: 3, severity: 'high' },
      { category: 'Documentation Gap', count: 1, severity: 'low' },
    ],
    riskDistribution: [
      { level: 'Low Risk', count: 23450, percentage: 95.5, color: '#22c55e' },
      { level: 'Medium Risk', count: 768, percentage: 3.1, color: '#f59e0b' },
      { level: 'High Risk', count: 342, percentage: 1.4, color: '#ef4444' },
    ],
    flaggedOverTime: generateDateLabels(timeRange).slice(-14).map(date => ({
      date,
      flagged: Math.floor(Math.random() * 15) + 5,
      resolved: Math.floor(Math.random() * 12) + 3,
    })),
    recentViolations: [
      { id: 'v1', type: 'Data Privacy', severity: 'high', agent: 'Mike Brown', timestamp: '2024-05-20 14:32', status: 'open' },
      { id: 'v2', type: 'Unauthorized Disclosure', severity: 'high', agent: 'AI Assistant', timestamp: '2024-05-19 09:15', status: 'reviewing' },
      { id: 'v3', type: 'Script Deviation', severity: 'medium', agent: 'Emma Wilson', timestamp: '2024-05-18 16:45', status: 'resolved' },
      { id: 'v4', type: 'Tone & Language', severity: 'medium', agent: 'John Smith', timestamp: '2024-05-17 11:20', status: 'resolved' },
      { id: 'v5', type: 'Missing Consent', severity: 'high', agent: 'Sarah Davis', timestamp: '2024-05-16 08:50', status: 'reviewing' },
    ],
  }), [timeRange]);

  const exportReport = async (format: 'pdf' | 'csv' | 'excel'): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return { success: true };
  };

  return {
    timeRange,
    setTimeRange,
    channelFilter,
    setChannelFilter,
    conversationMetrics,
    agentMetrics,
    channelUtilization,
    csatNpsData,
    sentimentTrends,
    conversationTrends,
    outcomeKPIs,
    campaignMetrics,
    channelAnalytics,
    speechAnalytics,
    llmAnalytics,
    transcriptionAnalytics,
    complianceAnalytics,
    exportReport,
  };
}
