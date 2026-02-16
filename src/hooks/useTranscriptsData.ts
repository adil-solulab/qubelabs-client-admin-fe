import { useState, useCallback, useMemo } from 'react';
import type { Transcript, TranscriptChannel, TranscriptStatus, SentimentType } from '@/types/transcripts';

const generateMockTranscripts = (): Transcript[] => [
  {
    id: 'tr-001',
    sessionId: 'sess-2026-001',
    channel: 'voice',
    status: 'completed',
    customerName: 'Sarah Johnson',
    customerPhone: '+1 (555) 234-5678',
    agentName: 'Mike Chen',
    agentId: 'agent-1',
    botName: 'Support Bot',
    startTime: '2026-02-16T09:15:00Z',
    endTime: '2026-02-16T09:22:30Z',
    duration: 450,
    hasRecording: true,
    recordingUrl: '/recordings/tr-001.wav',
    sentiment: 'positive',
    entries: [
      { timestamp: '00:00', speaker: 'system', text: 'Call connected' },
      { timestamp: '00:02', speaker: 'bot', text: 'Thank you for calling Acme Corp. How can I help you today?' },
      { timestamp: '00:08', speaker: 'customer', text: 'Hi, I need help with my recent order. The tracking says it was delivered but I haven\'t received it.', sentiment: 'neutral' },
      { timestamp: '00:15', speaker: 'bot', text: 'I\'m sorry to hear that. Let me connect you with an agent who can help with delivery issues.' },
      { timestamp: '00:20', speaker: 'system', text: 'Transferred to Mike Chen' },
      { timestamp: '00:25', speaker: 'agent', text: 'Hi Sarah, I can see your order #45892. Let me look into the delivery status for you.' },
      { timestamp: '00:35', speaker: 'customer', text: 'Thank you, I appreciate the help.', sentiment: 'positive' },
      { timestamp: '01:10', speaker: 'agent', text: 'I\'ve confirmed with the carrier. It appears the package was left at your building\'s front desk. Can you check there?' },
      { timestamp: '01:20', speaker: 'customer', text: 'Oh! Let me check... Yes, it\'s here! Thank you so much!', sentiment: 'positive' },
      { timestamp: '01:30', speaker: 'agent', text: 'Great to hear! Is there anything else I can help you with?' },
      { timestamp: '01:35', speaker: 'customer', text: 'No, that\'s all. Thanks again!', sentiment: 'positive' },
      { timestamp: '01:40', speaker: 'system', text: 'Call ended' },
    ],
    tags: ['delivery', 'order-tracking', 'resolved'],
    summary: 'Customer inquired about undelivered package. Agent located it at building front desk. Issue resolved successfully.',
    language: 'en',
    flowName: 'Customer Support Flow',
    createdAt: '2026-02-16T09:22:30Z',
  },
  {
    id: 'tr-002',
    sessionId: 'sess-2026-002',
    channel: 'voice',
    status: 'completed',
    customerName: 'James Wilson',
    customerPhone: '+1 (555) 876-5432',
    agentName: 'Lisa Park',
    agentId: 'agent-2',
    botName: 'Sales Bot',
    startTime: '2026-02-16T10:30:00Z',
    endTime: '2026-02-16T10:45:00Z',
    duration: 900,
    hasRecording: true,
    recordingUrl: '/recordings/tr-002.wav',
    sentiment: 'neutral',
    entries: [
      { timestamp: '00:00', speaker: 'system', text: 'Call connected' },
      { timestamp: '00:03', speaker: 'bot', text: 'Welcome to Acme Corp sales. How can I assist you today?' },
      { timestamp: '00:10', speaker: 'customer', text: 'I\'m interested in your enterprise plan. Can you tell me about pricing?', sentiment: 'neutral' },
      { timestamp: '00:18', speaker: 'bot', text: 'Our enterprise plan starts at $499/month. Let me connect you with a sales specialist.' },
      { timestamp: '00:25', speaker: 'system', text: 'Transferred to Lisa Park' },
      { timestamp: '00:30', speaker: 'agent', text: 'Hi James, I\'d love to walk you through our enterprise offerings. What\'s the size of your team?' },
      { timestamp: '00:40', speaker: 'customer', text: 'We have about 150 employees across 3 offices.', sentiment: 'neutral' },
      { timestamp: '01:00', speaker: 'agent', text: 'For a team that size, I\'d recommend our Enterprise Plus plan which includes unlimited seats and dedicated support.' },
      { timestamp: '01:30', speaker: 'customer', text: 'That sounds interesting. Can you send me a proposal?', sentiment: 'positive' },
      { timestamp: '01:40', speaker: 'agent', text: 'Absolutely! I\'ll send that over to your email within the hour.' },
      { timestamp: '01:50', speaker: 'system', text: 'Call ended' },
    ],
    tags: ['sales', 'enterprise', 'pricing', 'proposal-sent'],
    summary: 'Prospect inquired about enterprise pricing for 150-person team. Agent recommended Enterprise Plus plan and will send proposal.',
    language: 'en',
    flowName: 'Sales Inquiry Flow',
    createdAt: '2026-02-16T10:45:00Z',
  },
  {
    id: 'tr-003',
    sessionId: 'sess-2026-003',
    channel: 'chat',
    status: 'completed',
    customerName: 'Maria Garcia',
    customerEmail: 'maria.g@email.com',
    agentName: 'Tom Brown',
    agentId: 'agent-3',
    botName: 'FAQ Bot',
    startTime: '2026-02-15T14:00:00Z',
    endTime: '2026-02-15T14:12:00Z',
    duration: 720,
    hasRecording: false,
    sentiment: 'negative',
    entries: [
      { timestamp: '00:00', speaker: 'bot', text: 'Hello! How can I help you today?' },
      { timestamp: '00:05', speaker: 'customer', text: 'I\'ve been trying to reset my password for 20 minutes and nothing is working!', sentiment: 'negative' },
      { timestamp: '00:10', speaker: 'bot', text: 'I understand your frustration. Let me connect you with support.' },
      { timestamp: '00:15', speaker: 'system', text: 'Transferred to Tom Brown' },
      { timestamp: '00:20', speaker: 'agent', text: 'Hi Maria, I\'m sorry about the trouble. Let me help you with the password reset.' },
      { timestamp: '00:30', speaker: 'customer', text: 'The reset link keeps saying it\'s expired.', sentiment: 'negative' },
      { timestamp: '00:45', speaker: 'agent', text: 'I see the issue. Our email system had a delay. I\'ve sent a fresh reset link - please check your inbox now.' },
      { timestamp: '01:00', speaker: 'customer', text: 'Got it. It\'s working now. Thank you.', sentiment: 'neutral' },
      { timestamp: '01:05', speaker: 'agent', text: 'Great! Sorry again for the inconvenience. Is there anything else?' },
      { timestamp: '01:10', speaker: 'customer', text: 'No, thanks.', sentiment: 'neutral' },
    ],
    tags: ['password-reset', 'technical-issue', 'resolved'],
    summary: 'Customer frustrated with password reset. Issue was delayed email system. Agent sent fresh reset link and resolved.',
    language: 'en',
    flowName: 'Product FAQ',
    createdAt: '2026-02-15T14:12:00Z',
  },
  {
    id: 'tr-004',
    sessionId: 'sess-2026-004',
    channel: 'voice',
    status: 'completed',
    customerName: 'Robert Kim',
    customerPhone: '+1 (555) 345-6789',
    agentName: 'Amy Liu',
    agentId: 'agent-4',
    startTime: '2026-02-15T11:00:00Z',
    endTime: '2026-02-15T11:08:00Z',
    duration: 480,
    hasRecording: true,
    recordingUrl: '/recordings/tr-004.wav',
    sentiment: 'positive',
    entries: [
      { timestamp: '00:00', speaker: 'system', text: 'Call connected' },
      { timestamp: '00:05', speaker: 'agent', text: 'Good morning, Acme Corp. This is Amy. How can I help?' },
      { timestamp: '00:10', speaker: 'customer', text: 'Hi Amy, I want to upgrade my subscription to the premium plan.', sentiment: 'positive' },
      { timestamp: '00:20', speaker: 'agent', text: 'Sure! I can process that upgrade for you right now. Your new plan will start immediately.' },
      { timestamp: '00:40', speaker: 'customer', text: 'Perfect, go ahead.', sentiment: 'positive' },
      { timestamp: '01:00', speaker: 'agent', text: 'All done! You\'re now on the Premium plan. You\'ll receive a confirmation email shortly.' },
      { timestamp: '01:10', speaker: 'customer', text: 'Excellent, thank you Amy!', sentiment: 'positive' },
      { timestamp: '01:15', speaker: 'system', text: 'Call ended' },
    ],
    tags: ['upgrade', 'subscription', 'premium'],
    summary: 'Customer requested subscription upgrade to Premium plan. Processed successfully.',
    language: 'en',
    createdAt: '2026-02-15T11:08:00Z',
  },
  {
    id: 'tr-005',
    sessionId: 'sess-2026-005',
    channel: 'voice',
    status: 'failed',
    customerName: 'Unknown Caller',
    customerPhone: '+1 (555) 999-0000',
    agentName: 'System',
    agentId: 'system',
    botName: 'IVR Bot',
    startTime: '2026-02-15T16:30:00Z',
    endTime: '2026-02-15T16:31:00Z',
    duration: 60,
    hasRecording: true,
    recordingUrl: '/recordings/tr-005.wav',
    sentiment: 'neutral',
    entries: [
      { timestamp: '00:00', speaker: 'system', text: 'Call connected' },
      { timestamp: '00:03', speaker: 'bot', text: 'Welcome to Acme Corp. Press 1 for sales, 2 for support.' },
      { timestamp: '00:30', speaker: 'system', text: 'No DTMF input received. Timeout.' },
      { timestamp: '00:35', speaker: 'bot', text: 'We didn\'t receive your input. Please try again.' },
      { timestamp: '01:00', speaker: 'system', text: 'Call disconnected - no response' },
    ],
    tags: ['abandoned', 'no-response'],
    summary: 'Caller did not respond to IVR prompts. Call timed out and disconnected.',
    language: 'en',
    createdAt: '2026-02-15T16:31:00Z',
  },
  {
    id: 'tr-006',
    sessionId: 'sess-2026-006',
    channel: 'email',
    status: 'completed',
    customerName: 'David Chen',
    customerEmail: 'david.chen@company.com',
    agentName: 'Support Bot',
    agentId: 'bot-1',
    botName: 'Support Bot',
    startTime: '2026-02-14T08:00:00Z',
    endTime: '2026-02-14T08:05:00Z',
    duration: 300,
    hasRecording: false,
    sentiment: 'neutral',
    entries: [
      { timestamp: '00:00', speaker: 'customer', text: 'Subject: API Rate Limit Issue\n\nHi, we\'re hitting rate limits on the /users endpoint. Can the limit be increased for our account?', sentiment: 'neutral' },
      { timestamp: '00:30', speaker: 'bot', text: 'Thank you for reaching out. I\'ve reviewed your account and your current rate limit is 1000 req/min. For enterprise accounts, we can increase this to 5000 req/min. I\'ve submitted the request and it will be applied within 24 hours.' },
      { timestamp: '01:00', speaker: 'customer', text: 'Thank you for the quick response!', sentiment: 'positive' },
    ],
    tags: ['api', 'rate-limit', 'enterprise'],
    summary: 'Customer requested API rate limit increase. Bot auto-processed the upgrade for enterprise account.',
    language: 'en',
    createdAt: '2026-02-14T08:05:00Z',
  },
  {
    id: 'tr-007',
    sessionId: 'sess-2026-007',
    channel: 'voice',
    status: 'completed',
    customerName: 'Emily Rodriguez',
    customerPhone: '+44 20 7946 0958',
    agentName: 'Jack Thompson',
    agentId: 'agent-5',
    botName: 'Support Bot',
    startTime: '2026-02-14T15:20:00Z',
    endTime: '2026-02-14T15:35:00Z',
    duration: 900,
    hasRecording: true,
    recordingUrl: '/recordings/tr-007.wav',
    sentiment: 'negative',
    entries: [
      { timestamp: '00:00', speaker: 'system', text: 'Call connected' },
      { timestamp: '00:03', speaker: 'bot', text: 'Thank you for calling Acme Corp support.' },
      { timestamp: '00:10', speaker: 'customer', text: 'I need to speak to a manager. I\'ve been charged twice for my subscription.', sentiment: 'negative' },
      { timestamp: '00:18', speaker: 'system', text: 'Transferred to Jack Thompson' },
      { timestamp: '00:25', speaker: 'agent', text: 'Hi Emily, I\'m a senior agent. Let me look into the billing issue right away.' },
      { timestamp: '01:00', speaker: 'agent', text: 'I can confirm there was a duplicate charge. I\'m processing a refund for the extra $49.99 now.' },
      { timestamp: '01:10', speaker: 'customer', text: 'How long will the refund take?', sentiment: 'neutral' },
      { timestamp: '01:15', speaker: 'agent', text: 'It will appear in your account within 3-5 business days.' },
      { timestamp: '01:25', speaker: 'customer', text: 'OK, thank you for sorting this out.', sentiment: 'neutral' },
      { timestamp: '01:30', speaker: 'system', text: 'Call ended' },
    ],
    tags: ['billing', 'refund', 'duplicate-charge', 'escalation'],
    summary: 'Customer reported duplicate billing charge. Agent confirmed and processed $49.99 refund. 3-5 day processing time.',
    language: 'en',
    createdAt: '2026-02-14T15:35:00Z',
  },
  {
    id: 'tr-008',
    sessionId: 'sess-2026-008',
    channel: 'chat',
    status: 'in_progress',
    customerName: 'Alex Patel',
    customerEmail: 'alex.p@startup.io',
    agentName: 'Support Bot',
    agentId: 'bot-1',
    botName: 'Support Bot',
    startTime: '2026-02-16T11:00:00Z',
    duration: 0,
    hasRecording: false,
    sentiment: 'neutral',
    entries: [
      { timestamp: '00:00', speaker: 'bot', text: 'Hello! How can I help you today?' },
      { timestamp: '00:05', speaker: 'customer', text: 'I need to integrate your webhook system. Where can I find the documentation?', sentiment: 'neutral' },
      { timestamp: '00:10', speaker: 'bot', text: 'You can find our webhook documentation at docs.acme.com/webhooks. Would you like me to walk you through the setup?' },
    ],
    tags: ['documentation', 'webhooks', 'integration'],
    summary: 'Customer asking about webhook integration documentation. Session in progress.',
    language: 'en',
    createdAt: '2026-02-16T11:00:00Z',
  },
];

export interface TranscriptFilters {
  search: string;
  channel: TranscriptChannel | 'all';
  status: TranscriptStatus | 'all';
  sentiment: SentimentType | 'all';
  dateFrom: string;
  dateTo: string;
  hasRecording: boolean | null;
}

export function useTranscriptsData() {
  const [transcripts, setTranscripts] = useState<Transcript[]>(generateMockTranscripts());
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TranscriptFilters>({
    search: '',
    channel: 'all',
    status: 'all',
    sentiment: 'all',
    dateFrom: '',
    dateTo: '',
    hasRecording: null,
  });

  const filteredTranscripts = useMemo(() => {
    return transcripts.filter(t => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches = 
          t.customerName.toLowerCase().includes(q) ||
          t.agentName.toLowerCase().includes(q) ||
          t.sessionId.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q)) ||
          (t.summary && t.summary.toLowerCase().includes(q)) ||
          (t.flowName && t.flowName.toLowerCase().includes(q));
        if (!matches) return false;
      }
      if (filters.channel !== 'all' && t.channel !== filters.channel) return false;
      if (filters.status !== 'all' && t.status !== filters.status) return false;
      if (filters.sentiment !== 'all' && t.sentiment !== filters.sentiment) return false;
      if (filters.hasRecording !== null && t.hasRecording !== filters.hasRecording) return false;
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transcripts, filters]);

  const selectedTranscript = useMemo(() => {
    return transcripts.find(t => t.id === selectedTranscriptId) || null;
  }, [transcripts, selectedTranscriptId]);

  const deleteTranscript = useCallback((id: string) => {
    setTranscripts(prev => prev.filter(t => t.id !== id));
    if (selectedTranscriptId === id) {
      setSelectedTranscriptId(null);
    }
  }, [selectedTranscriptId]);

  const deleteMultiple = useCallback((ids: string[]) => {
    setTranscripts(prev => prev.filter(t => !ids.includes(t.id)));
    if (selectedTranscriptId && ids.includes(selectedTranscriptId)) {
      setSelectedTranscriptId(null);
    }
  }, [selectedTranscriptId]);

  const stats = useMemo(() => ({
    total: transcripts.length,
    voice: transcripts.filter(t => t.channel === 'voice').length,
    chat: transcripts.filter(t => t.channel === 'chat').length,
    email: transcripts.filter(t => t.channel === 'email').length,
    withRecording: transcripts.filter(t => t.hasRecording).length,
    avgDuration: Math.round(transcripts.reduce((sum, t) => sum + t.duration, 0) / transcripts.length),
  }), [transcripts]);

  return {
    transcripts: filteredTranscripts,
    allTranscripts: transcripts,
    selectedTranscript,
    selectedTranscriptId,
    setSelectedTranscriptId,
    filters,
    setFilters,
    updateFilter: useCallback(<K extends keyof TranscriptFilters>(key: K, value: TranscriptFilters[K]) => {
      setFilters(prev => ({ ...prev, [key]: value }));
    }, []),
    deleteTranscript,
    deleteMultiple,
    stats,
  };
}
