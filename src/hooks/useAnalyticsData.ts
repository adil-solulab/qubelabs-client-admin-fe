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
    exportReport,
  };
}
