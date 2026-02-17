import { useState, useCallback } from 'react';
import type { 
  ActiveCall, 
  ActiveChat, 
  ActiveEmail, 
  SentimentData, 
  UsageData, 
  ChannelUtilization, 
  Alert,
  CreditData,
} from '@/types/dashboard';

// Mock data generators
const generateActiveCalls = (): ActiveCall[] => [
  { id: '1', caller: '+1 (555) 123-4567', agent: 'Sarah Johnson', duration: '04:32', sentiment: 'positive', status: 'active' },
  { id: '2', caller: '+1 (555) 987-6543', agent: 'Mike Chen', duration: '12:15', sentiment: 'neutral', status: 'active' },
  { id: '3', caller: '+1 (555) 456-7890', agent: 'AI Agent #3', duration: '02:45', sentiment: 'negative', status: 'on-hold' },
  { id: '4', caller: '+1 (555) 321-0987', agent: 'Emma Wilson', duration: '08:22', sentiment: 'positive', status: 'active' },
  { id: '5', caller: '+1 (555) 654-3210', agent: 'AI Agent #1', duration: '01:18', sentiment: 'neutral', status: 'transferring' },
];

const generateActiveChats = (): ActiveChat[] => [
  { id: '1', customer: 'John Doe', agent: 'AI Bot Alpha', channel: 'Website', waitTime: '00:45', status: 'bot-handled' },
  { id: '2', customer: 'Jane Smith', agent: 'Tom Hardy', channel: 'Mobile App', waitTime: '02:12', status: 'active' },
  { id: '3', customer: 'Alex Brown', agent: 'AI Bot Beta', channel: 'WhatsApp', waitTime: '00:30', status: 'bot-handled' },
  { id: '4', customer: 'Maria Garcia', agent: 'Pending...', channel: 'Facebook', waitTime: '05:43', status: 'waiting' },
  { id: '5', customer: 'Chris Lee', agent: 'Lisa Park', channel: 'Website', waitTime: '01:55', status: 'active' },
  { id: '6', customer: 'Pat Wilson', agent: 'AI Bot Alpha', channel: 'Telegram', waitTime: '00:22', status: 'bot-handled' },
];

const generateActiveEmails = (): ActiveEmail[] => [
  { id: '1', from: 'ceo@acmecorp.com', subject: 'Urgent: Contract Renewal Discussion', priority: 'high', received: '5 min ago', status: 'pending' },
  { id: '2', from: 'support@techstart.io', subject: 'Integration API Question', priority: 'medium', received: '15 min ago', status: 'in-progress' },
  { id: '3', from: 'billing@enterprise.com', subject: 'Invoice Clarification Needed', priority: 'high', received: '32 min ago', status: 'pending' },
  { id: '4', from: 'user@gmail.com', subject: 'Feature Request: Dark Mode', priority: 'low', received: '1 hour ago', status: 'resolved' },
  { id: '5', from: 'admin@startup.co', subject: 'Onboarding Help Required', priority: 'medium', received: '2 hours ago', status: 'in-progress' },
];

const generateSentiment = (): SentimentData => ({
  positive: 67,
  neutral: 24,
  negative: 9,
  trend: 'up',
  change: 4.2,
});

const generateUsageData = (): UsageData[] => [
  { current: 45230, limit: 50000, unit: 'minutes', category: 'Voice Minutes' },
  { current: 892, limit: 1000, unit: 'agents', category: 'AI Agent Sessions' },
  { current: 12450, limit: 20000, unit: 'messages', category: 'Chat Messages' },
  { current: 3200, limit: 5000, unit: 'emails', category: 'Email Processed' },
];

const generateChannelUtilization = (): ChannelUtilization => ({
  voice: 45,
  chat: 38,
  email: 17,
});

const generateCreditData = (): CreditData => ({
  available: 7250,
  used: 12750,
  total: 20000,
  pending: 340,
  expiring: 1500,
  expiryDate: '2026-03-15',
  resetDate: '2026-03-01',
  breakdown: [
    { category: 'Voice Calls', used: 5200, allocated: 8000, icon: '📞' },
    { category: 'AI Agent Sessions', used: 3800, allocated: 5000, icon: '🤖' },
    { category: 'Chat Messages', used: 2450, allocated: 4000, icon: '💬' },
    { category: 'Email Processing', used: 1300, allocated: 3000, icon: '📧' },
  ],
});

const generateAlerts = (): Alert[] => [
  { id: '1', type: 'sla-breach', severity: 'critical', title: 'SLA Breach Imminent', description: 'Customer wait time exceeding 5 minutes on 3 chats', timestamp: '2 min ago', acknowledged: false },
  { id: '2', type: 'sentiment-drop', severity: 'warning', title: 'Sentiment Drop Detected', description: 'Voice channel sentiment dropped 12% in last hour', timestamp: '8 min ago', acknowledged: false },
  { id: '3', type: 'idle-agent', severity: 'warning', title: 'Idle Agents Alert', description: '4 human agents idle for more than 10 minutes', timestamp: '15 min ago', acknowledged: true },
  { id: '4', type: 'capacity', severity: 'info', title: 'Approaching Capacity', description: 'Voice minutes at 90% of monthly limit', timestamp: '1 hour ago', acknowledged: true },
  { id: '5', type: 'system', severity: 'info', title: 'Scheduled Maintenance', description: 'System maintenance scheduled for tonight 2:00 AM UTC', timestamp: '3 hours ago', acknowledged: true },
];

export function useDashboardData() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>(generateActiveCalls());
  const [activeChats, setActiveChats] = useState<ActiveChat[]>(generateActiveChats());
  const [activeEmails, setActiveEmails] = useState<ActiveEmail[]>(generateActiveEmails());
  const [sentimentData, setSentimentData] = useState<SentimentData>(generateSentiment());
  const [usageData, setUsageData] = useState<UsageData[]>(generateUsageData());
  const [channelUtilization, setChannelUtilization] = useState<ChannelUtilization>(generateChannelUtilization());
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts());
  const [creditData, setCreditData] = useState<CreditData>(generateCreditData());

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setActiveCalls(generateActiveCalls());
    setActiveChats(generateActiveChats());
    setActiveEmails(generateActiveEmails());
    setSentimentData(generateSentiment());
    setUsageData(generateUsageData());
    setChannelUtilization(generateChannelUtilization());
    setAlerts(generateAlerts());
    setCreditData(generateCreditData());
    
    setIsLoading(false);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  }, []);

  return {
    isLoading,
    activeCalls,
    activeChats,
    activeEmails,
    sentimentData,
    usageData,
    channelUtilization,
    alerts,
    creditData,
    refreshData,
    acknowledgeAlert,
  };
}
