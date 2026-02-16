import { useState, useCallback, useEffect } from 'react';
import type {
  Lead,
  Campaign,
  CampaignTemplate,
  CampaignSegment,
  CallOutcomeStats,
  SentimentStats,
  UploadProgress,
  SentimentType,
  LeadStatus,
  CreateCampaignData,
  CampaignStatus,
} from '@/types/outboundCalling';

const generateMockLeads = (campaignId: string): Lead[] => [
  { id: `${campaignId}-lead-1`, name: 'John Smith', phone: '+1 555-0101', email: 'john@acme.com', company: 'Acme Corp', status: 'completed', callAttempts: 1, outcome: 'answered', sentiment: 'positive', duration: 245, lastCallAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: `${campaignId}-lead-2`, name: 'Sarah Johnson', phone: '+1 555-0102', email: 'sarah@techco.io', company: 'TechCo', status: 'completed', callAttempts: 2, outcome: 'answered', sentiment: 'neutral', duration: 180, lastCallAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
  { id: `${campaignId}-lead-3`, name: 'Mike Wilson', phone: '+1 555-0103', email: 'mike@startup.io', company: 'Startup Inc', status: 'escalated', callAttempts: 1, outcome: 'escalated', sentiment: 'negative', duration: 120, escalatedTo: 'Agent Smith', lastCallAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: `${campaignId}-lead-4`, name: 'Emily Brown', phone: '+1 555-0104', email: 'emily@corp.com', company: 'Corp LLC', status: 'no_answer', callAttempts: 3, outcome: 'no_answer', lastCallAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
  { id: `${campaignId}-lead-5`, name: 'David Lee', phone: '+1 555-0105', email: 'david@enterprise.com', company: 'Enterprise', status: 'calling', callAttempts: 0 },
  { id: `${campaignId}-lead-6`, name: 'Lisa Chen', phone: '+1 555-0106', email: 'lisa@global.io', company: 'Global Inc', status: 'pending', callAttempts: 0 },
  { id: `${campaignId}-lead-7`, name: 'Tom Anderson', phone: '+1 555-0107', email: 'tom@local.com', company: 'Local Biz', status: 'completed', callAttempts: 1, outcome: 'voicemail', duration: 45, lastCallAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
  { id: `${campaignId}-lead-8`, name: 'Amy White', phone: '+1 555-0108', email: 'amy@services.com', company: 'Services Co', status: 'failed', callAttempts: 2, outcome: 'failed', lastCallAt: new Date(Date.now() - 15 * 60 * 1000).toISOString() },
  { id: `${campaignId}-lead-9`, name: 'Chris Martin', phone: '+1 555-0109', email: 'chris@solutions.io', company: 'Solutions', status: 'completed', callAttempts: 1, outcome: 'answered', sentiment: 'positive', duration: 320, lastCallAt: new Date(Date.now() - 120 * 60 * 1000).toISOString() },
  { id: `${campaignId}-lead-10`, name: 'Jennifer Davis', phone: '+1 555-0110', email: 'jen@media.com', company: 'Media Group', status: 'pending', callAttempts: 0 },
];

const generateMockCampaigns = (): Campaign[] => [
  {
    id: 'campaign-1',
    name: 'Q1 Sales Outreach',
    description: 'Reach out to potential enterprise customers for Q1 product launch',
    status: 'running',
    channel: 'voice',
    templateId: 'tmpl-1',
    templateName: 'Sales Pitch v2',
    segmentId: 'seg-1',
    segmentName: 'Enterprise Leads',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    totalLeads: 10,
    calledLeads: 8,
    successfulCalls: 5,
    failedCalls: 2,
    escalatedCalls: 1,
    averageDuration: 185,
    deliveryRate: 80,
    responseRate: 62,
  },
  {
    id: 'campaign-2',
    name: 'Product Launch Announcement',
    description: 'Announce new product features to existing customers via WhatsApp',
    status: 'scheduled',
    channel: 'whatsapp',
    templateId: 'tmpl-3',
    templateName: 'Product Update Template',
    segmentId: 'seg-2',
    segmentName: 'Active Customers',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalLeads: 2500,
    calledLeads: 0,
    successfulCalls: 0,
    failedCalls: 0,
    escalatedCalls: 0,
    averageDuration: 0,
  },
  {
    id: 'campaign-3',
    name: 'Customer Satisfaction Survey',
    description: 'Send satisfaction survey to recent support ticket customers',
    status: 'completed',
    channel: 'sms',
    templateId: 'tmpl-5',
    templateName: 'Survey Follow-up',
    segmentId: 'seg-3',
    segmentName: 'Recent Support Tickets',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalLeads: 850,
    calledLeads: 850,
    successfulCalls: 720,
    failedCalls: 80,
    escalatedCalls: 50,
    averageDuration: 0,
    deliveryRate: 95,
    responseRate: 42,
  },
  {
    id: 'campaign-4',
    name: 'Trial Conversion Follow-up',
    description: 'Follow up with trial users nearing expiration',
    status: 'paused',
    channel: 'email',
    templateId: 'tmpl-6',
    templateName: 'Trial Expiry Reminder',
    segmentId: 'seg-4',
    segmentName: 'Trial Users (Expiring)',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalLeads: 320,
    calledLeads: 180,
    successfulCalls: 150,
    failedCalls: 20,
    escalatedCalls: 10,
    averageDuration: 0,
    deliveryRate: 88,
    responseRate: 35,
  },
  {
    id: 'campaign-5',
    name: 'Renewal Reminder',
    description: 'Remind customers about upcoming contract renewals',
    status: 'draft',
    channel: 'voice',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    totalLeads: 0,
    calledLeads: 0,
    successfulCalls: 0,
    failedCalls: 0,
    escalatedCalls: 0,
    averageDuration: 0,
  },
];

const generateMockTemplates = (): CampaignTemplate[] => [
  { id: 'tmpl-1', name: 'Sales Pitch v2', channel: 'voice', content: 'Hi {{name}}, this is calling from ConX. We have an exciting offer for {{company}}...', variables: ['name', 'company'], category: 'Sales', status: 'approved', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tmpl-2', name: 'Cold Outreach Intro', channel: 'voice', content: 'Hello {{name}}, I am reaching out regarding our enterprise solutions...', variables: ['name'], category: 'Outreach', status: 'approved', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tmpl-3', name: 'Product Update Template', channel: 'whatsapp', content: 'Hi {{name}}! We are excited to announce new features in ConX. Check out what is new: {{link}}', variables: ['name', 'link'], category: 'Product', status: 'approved', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tmpl-4', name: 'Appointment Confirmation', channel: 'whatsapp', content: 'Dear {{name}}, your appointment is confirmed for {{date}} at {{time}}.', variables: ['name', 'date', 'time'], category: 'Transactional', status: 'approved', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tmpl-5', name: 'Survey Follow-up', channel: 'sms', content: 'Hi {{name}}, we would love to hear your feedback! Take our quick survey: {{surveyLink}}', variables: ['name', 'surveyLink'], category: 'Survey', status: 'approved', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tmpl-6', name: 'Trial Expiry Reminder', channel: 'email', content: 'Dear {{name}}, your trial for {{plan}} is expiring on {{expiryDate}}. Upgrade now to continue enjoying premium features.', variables: ['name', 'plan', 'expiryDate'], category: 'Retention', status: 'approved', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'tmpl-7', name: 'Promotional Offer', channel: 'email', content: 'Hi {{name}}, exclusive offer just for you! Get {{discount}}% off on {{product}}.', variables: ['name', 'discount', 'product'], category: 'Marketing', status: 'pending', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
];

const generateMockSegments = (): CampaignSegment[] => [
  { id: 'seg-1', name: 'Enterprise Leads', description: 'Enterprise-tier potential customers', userCount: 1250, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), filters: ['Company size > 500', 'Industry: Technology'] },
  { id: 'seg-2', name: 'Active Customers', description: 'Customers active in the last 30 days', userCount: 2500, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), filters: ['Last active < 30 days'] },
  { id: 'seg-3', name: 'Recent Support Tickets', description: 'Users who raised support tickets in the past week', userCount: 850, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), filters: ['Ticket created < 7 days'] },
  { id: 'seg-4', name: 'Trial Users (Expiring)', description: 'Trial users whose trials expire within 7 days', userCount: 320, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), filters: ['Plan: Trial', 'Expiry < 7 days'] },
  { id: 'seg-5', name: 'High-Value Prospects', description: 'Prospects with high engagement scores', userCount: 450, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), filters: ['Engagement score > 80'] },
  { id: 'seg-6', name: 'Churned Users', description: 'Users who have not logged in for 60+ days', userCount: 1100, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), filters: ['Last active > 60 days'] },
];

export function useOutboundCallingData() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(generateMockCampaigns());
  const [templates] = useState<CampaignTemplate[]>(generateMockTemplates());
  const [segments] = useState<CampaignSegment[]>(generateMockSegments());
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>(generateMockLeads('campaign-1'));
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || null;

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

  useEffect(() => {
    if (!selectedCampaign || selectedCampaign.status !== 'running') return;

    const interval = setInterval(() => {
      setLeads(prev => {
        const callingLead = prev.find(l => l.status === 'calling');
        const pendingLead = prev.find(l => l.status === 'pending');

        if (callingLead) {
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
  }, [selectedCampaign]);

  const selectCampaign = useCallback((campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setLeads(generateMockLeads(campaignId));
  }, []);

  const deselectCampaign = useCallback(() => {
    setSelectedCampaignId(null);
  }, []);

  const createCampaign = useCallback(async (data: CreateCampaignData) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const template = data.templateId ? generateMockTemplates().find(t => t.id === data.templateId) : undefined;
    const segment = data.segmentId ? generateMockSegments().find(s => s.id === data.segmentId) : undefined;

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: data.name,
      description: data.description,
      status: data.schedule?.type === 'now' ? 'running' : data.schedule ? 'scheduled' : 'draft',
      channel: data.channel,
      templateId: data.templateId,
      templateName: template?.name,
      segmentId: data.segmentId,
      segmentName: segment?.name,
      schedule: data.schedule,
      goal: data.goal,
      flowId: data.flowId,
      flowName: data.flowName,
      workflowId: data.workflowId,
      workflowName: data.workflowName,
      createdAt: new Date().toISOString(),
      startedAt: data.schedule?.type === 'now' ? new Date().toISOString() : undefined,
      scheduledAt: data.schedule?.type === 'later' ? `${data.schedule.date}T${data.schedule.time}` : undefined,
      totalLeads: segment?.userCount || 0,
      calledLeads: 0,
      successfulCalls: 0,
      failedCalls: 0,
      escalatedCalls: 0,
      averageDuration: 0,
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  }, []);

  const saveDraft = useCallback(async (data: Partial<CreateCampaignData>) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: data.name || 'Untitled Campaign',
      description: data.description,
      status: 'draft',
      channel: data.channel || 'voice',
      templateId: data.templateId,
      segmentId: data.segmentId,
      createdAt: new Date().toISOString(),
      totalLeads: 0,
      calledLeads: 0,
      successfulCalls: 0,
      failedCalls: 0,
      escalatedCalls: 0,
      averageDuration: 0,
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  }, []);

  const deleteCampaign = useCallback(async (campaignId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
  }, []);

  const updateCampaignStatus = useCallback(async (campaignId: string, status: CampaignStatus) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setCampaigns(prev => prev.map(c =>
      c.id === campaignId
        ? { ...c, status, ...(status === 'running' ? { startedAt: new Date().toISOString() } : {}) }
        : c
    ));
  }, []);

  const uploadLeads = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadProgress({
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    });

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => prev ? { ...prev, progress: i, status: i < 50 ? 'uploading' : 'processing' } : null);
    }

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
    setIsUploading(false);

    return { success: true, leadsAdded: 3 };
  }, []);

  const escalateLead = useCallback(async (leadId: string, agentName: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setLeads(prev => prev.map(l =>
      l.id === leadId
        ? { ...l, status: 'escalated' as LeadStatus, outcome: 'escalated', escalatedTo: agentName }
        : l
    ));
    return { success: true };
  }, []);

  const clearUploadProgress = useCallback(() => {
    setUploadProgress(null);
  }, []);

  return {
    campaigns,
    templates,
    segments,
    selectedCampaign,
    leads,
    outcomeStats,
    sentimentStats,
    uploadProgress,
    isUploading,
    selectCampaign,
    deselectCampaign,
    createCampaign,
    saveDraft,
    deleteCampaign,
    updateCampaignStatus,
    uploadLeads,
    escalateLead,
    clearUploadProgress,
  };
}
