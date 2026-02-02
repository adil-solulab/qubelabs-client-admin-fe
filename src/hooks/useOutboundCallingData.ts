import { useState, useCallback, useEffect } from 'react';
import type {
  Lead,
  Campaign,
  CallOutcomeStats,
  SentimentStats,
  UploadProgress,
  SentimentType,
  LeadStatus,
} from '@/types/outboundCalling';

const generateMockLeads = (): Lead[] => [
  { id: 'lead-1', name: 'John Smith', phone: '+1 555-0101', email: 'john@acme.com', company: 'Acme Corp', status: 'completed', callAttempts: 1, outcome: 'answered', sentiment: 'positive', duration: 245, lastCallAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'lead-2', name: 'Sarah Johnson', phone: '+1 555-0102', email: 'sarah@techco.io', company: 'TechCo', status: 'completed', callAttempts: 2, outcome: 'answered', sentiment: 'neutral', duration: 180, lastCallAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: 'lead-3', name: 'Mike Wilson', phone: '+1 555-0103', email: 'mike@startup.io', company: 'Startup Inc', status: 'escalated', callAttempts: 1, outcome: 'escalated', sentiment: 'negative', duration: 120, escalatedTo: 'Agent Smith', lastCallAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'lead-4', name: 'Emily Brown', phone: '+1 555-0104', email: 'emily@corp.com', company: 'Corp LLC', status: 'no_answer', callAttempts: 3, outcome: 'no_answer', lastCallAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
  { id: 'lead-5', name: 'David Lee', phone: '+1 555-0105', email: 'david@enterprise.com', company: 'Enterprise', status: 'calling', callAttempts: 0 },
  { id: 'lead-6', name: 'Lisa Chen', phone: '+1 555-0106', email: 'lisa@global.io', company: 'Global Inc', status: 'pending', callAttempts: 0 },
  { id: 'lead-7', name: 'Tom Anderson', phone: '+1 555-0107', email: 'tom@local.com', company: 'Local Biz', status: 'completed', callAttempts: 1, outcome: 'voicemail', duration: 45, lastCallAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
  { id: 'lead-8', name: 'Amy White', phone: '+1 555-0108', email: 'amy@services.com', company: 'Services Co', status: 'failed', callAttempts: 2, outcome: 'failed', lastCallAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: 'lead-9', name: 'Chris Martin', phone: '+1 555-0109', email: 'chris@solutions.io', company: 'Solutions', status: 'completed', callAttempts: 1, outcome: 'answered', sentiment: 'positive', duration: 320, lastCallAt: new Date(Date.now() - 120 * 60 * 1000).toISOString() },
  { id: 'lead-10', name: 'Jennifer Davis', phone: '+1 555-0110', email: 'jen@media.com', company: 'Media Group', status: 'pending', callAttempts: 0 },
];

const generateMockCampaign = (): Campaign => ({
  id: 'campaign-1',
  name: 'Q1 Sales Outreach',
  description: 'Reach out to potential enterprise customers for Q1 product launch',
  status: 'running',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  totalLeads: 10,
  calledLeads: 8,
  successfulCalls: 5,
  failedCalls: 2,
  escalatedCalls: 1,
  averageDuration: 185,
  script: 'Hi {name}, this is calling from {company}. I wanted to discuss...',
});

export function useOutboundCallingData() {
  const [leads, setLeads] = useState<Lead[]>(generateMockLeads());
  const [campaign, setCampaign] = useState<Campaign>(generateMockCampaign());
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const outcomeStats: CallOutcomeStats = {
    answered: leads.filter(l => l.outcome === 'answered').length,
    voicemail: leads.filter(l => l.outcome === 'voicemail').length,
    noAnswer: leads.filter(l => l.outcome === 'no_answer').length,
    busy: leads.filter(l => l.outcome === 'busy').length,
    failed: leads.filter(l => l.outcome === 'failed').length,
    escalated: leads.filter(l => l.outcome === 'escalated').length,
  };

  const sentimentStats: SentimentStats = {
    positive: leads.filter(l => l.sentiment === 'positive').length,
    neutral: leads.filter(l => l.sentiment === 'neutral').length,
    negative: leads.filter(l => l.sentiment === 'negative').length,
    escalated: leads.filter(l => l.sentiment === 'escalated').length,
  };

  // Simulate calling progress
  useEffect(() => {
    if (campaign.status !== 'running') return;

    const interval = setInterval(() => {
      setLeads(prev => {
        const callingLead = prev.find(l => l.status === 'calling');
        const pendingLead = prev.find(l => l.status === 'pending');

        if (callingLead) {
          // Complete current call
          const outcomes: Lead['outcome'][] = ['answered', 'voicemail', 'no_answer', 'answered'];
          const sentiments: SentimentType[] = ['positive', 'neutral', 'negative', 'positive'];
          const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
          const randomSentiment = sentiments[Math.floor(Math.random() * sentiments.length)];

          return prev.map(l =>
            l.id === callingLead.id
              ? {
                  ...l,
                  status: randomOutcome === 'no_answer' ? 'no_answer' as LeadStatus : 'completed' as LeadStatus,
                  outcome: randomOutcome,
                  sentiment: randomOutcome === 'answered' ? randomSentiment : undefined,
                  duration: randomOutcome === 'answered' ? Math.floor(Math.random() * 300) + 60 : undefined,
                  callAttempts: l.callAttempts + 1,
                  lastCallAt: new Date().toISOString(),
                }
              : l
          );
        } else if (pendingLead) {
          // Start calling next lead
          return prev.map(l =>
            l.id === pendingLead.id
              ? { ...l, status: 'calling' as LeadStatus }
              : l
          );
        }

        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [campaign.status]);

  const uploadLeads = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    });

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => prev ? { ...prev, progress: i, status: i < 50 ? 'uploading' : 'processing' } : null);
    }

    // Simulate adding new leads
    const newLeads: Lead[] = [
      { id: `lead-new-${Date.now()}-1`, name: 'New Lead 1', phone: '+1 555-0201', email: 'new1@company.com', company: 'New Company 1', status: 'pending', callAttempts: 0 },
      { id: `lead-new-${Date.now()}-2`, name: 'New Lead 2', phone: '+1 555-0202', email: 'new2@company.com', company: 'New Company 2', status: 'pending', callAttempts: 0 },
      { id: `lead-new-${Date.now()}-3`, name: 'New Lead 3', phone: '+1 555-0203', email: 'new3@company.com', company: 'New Company 3', status: 'pending', callAttempts: 0 },
    ];

    setUploadProgress({
      fileName: file.name,
      progress: 100,
      status: 'completed',
      totalLeads: 3,
      validLeads: 3,
    });

    setLeads(prev => [...prev, ...newLeads]);
    setCampaign(prev => ({ ...prev, totalLeads: prev.totalLeads + 3 }));
    setIsUploading(false);

    return { success: true, leadsAdded: 3 };
  }, []);

  const startCampaign = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setCampaign(prev => ({
      ...prev,
      status: 'running',
      startedAt: new Date().toISOString(),
    }));
    return { success: true };
  }, []);

  const pauseCampaign = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setCampaign(prev => ({ ...prev, status: 'paused' }));
    return { success: true };
  }, []);

  const resumeCampaign = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setCampaign(prev => ({ ...prev, status: 'running' }));
    return { success: true };
  }, []);

  const escalateLead = useCallback(async (leadId: string, agentName: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setLeads(prev => prev.map(l =>
      l.id === leadId
        ? { ...l, status: 'escalated' as LeadStatus, outcome: 'escalated', escalatedTo: agentName }
        : l
    ));
    setCampaign(prev => ({ ...prev, escalatedCalls: prev.escalatedCalls + 1 }));
    return { success: true };
  }, []);

  const clearUploadProgress = useCallback(() => {
    setUploadProgress(null);
  }, []);

  return {
    leads,
    campaign,
    outcomeStats,
    sentimentStats,
    uploadProgress,
    isUploading,
    uploadLeads,
    startCampaign,
    pauseCampaign,
    resumeCampaign,
    escalateLead,
    clearUploadProgress,
  };
}
