export interface ActiveCall {
  id: string;
  caller: string;
  agent: string;
  duration: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: 'active' | 'on-hold' | 'transferring';
}

export interface ActiveChat {
  id: string;
  customer: string;
  agent: string;
  channel: string;
  waitTime: string;
  status: 'active' | 'waiting' | 'bot-handled';
}

export interface ActiveEmail {
  id: string;
  from: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  received: string;
  status: 'pending' | 'in-progress' | 'resolved';
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface UsageData {
  current: number;
  limit: number;
  unit: string;
  category: string;
}

export interface ChannelUtilization {
  voice: number;
  chat: number;
  email: number;
}

export interface Alert {
  id: string;
  type: 'sla-breach' | 'sentiment-drop' | 'idle-agent' | 'system' | 'capacity';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface CreditData {
  available: number;
  used: number;
  total: number;
  pending: number;
  expiring: number;
  expiryDate: string;
  resetDate: string;
  breakdown: {
    category: string;
    used: number;
    allocated: number;
    icon: string;
  }[];
}

export type Environment = 'production' | 'test';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
