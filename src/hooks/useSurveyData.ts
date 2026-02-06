import { useState, useCallback, useEffect } from 'react';
import {
  SurveyConfig,
  SurveyResponse,
  SurveyEscalation,
  SurveyStats,
  AISummary,
  SurveyType,
  DeliveryChannel,
  EscalationNote,
  DEFAULT_SURVEY_CONFIG,
  getNPSCategory,
} from '@/types/surveys';
import { notify } from '@/hooks/useNotification';

const STORAGE_KEY = 'survey_data';
const CONFIG_STORAGE_KEY = 'survey_config';

// Mock AI summarization (simulates AI processing)
const generateAISummary = async (
  score: number,
  surveyType: SurveyType,
  followUpResponse?: string
): Promise<AISummary> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI processing

  const isNegative = surveyType === 'csat' ? score <= 2 : score <= 6;
  const isPositive = surveyType === 'csat' ? score >= 4 : score >= 9;

  const negativeIssues = [
    'Long wait time reported',
    'Issue not fully resolved',
    'Communication could be clearer',
    'Multiple transfers during call',
    'Agent knowledge gaps identified',
  ];

  const positivePoints = [
    'Quick resolution appreciated',
    'Agent was helpful and knowledgeable',
    'Clear communication throughout',
    'Issue resolved on first contact',
  ];

  const neutralPoints = [
    'Service met basic expectations',
    'Room for improvement in response time',
    'Additional follow-up may be needed',
  ];

  let sentiment: 'positive' | 'neutral' | 'negative';
  let sentimentScore: number;
  let keyIssues: string[];
  let suggestedActions: string[];
  let summary: string;

  if (isNegative) {
    sentiment = 'negative';
    sentimentScore = -0.7 - Math.random() * 0.3;
    keyIssues = negativeIssues.slice(0, 2 + Math.floor(Math.random() * 2));
    suggestedActions = [
      'Schedule follow-up call with customer',
      'Review agent training for this issue type',
      'Escalate to supervisor for review',
    ];
    summary = `Customer expressed dissatisfaction with the interaction. ${followUpResponse ? `Feedback: "${followUpResponse}". ` : ''}Key concerns include ${keyIssues.slice(0, 2).join(' and ').toLowerCase()}. Immediate follow-up recommended.`;
  } else if (isPositive) {
    sentiment = 'positive';
    sentimentScore = 0.7 + Math.random() * 0.3;
    keyIssues = [];
    suggestedActions = ['Consider for agent recognition program', 'Use as training example'];
    summary = `Customer had a positive experience. ${followUpResponse ? `Additional feedback: "${followUpResponse}". ` : ''}${positivePoints[Math.floor(Math.random() * positivePoints.length)]}. No action required.`;
  } else {
    sentiment = 'neutral';
    sentimentScore = -0.2 + Math.random() * 0.4;
    keyIssues = neutralPoints.slice(0, 1 + Math.floor(Math.random() * 2));
    suggestedActions = ['Monitor for patterns', 'Consider proactive outreach'];
    summary = `Customer feedback is neutral. ${followUpResponse ? `Comment: "${followUpResponse}". ` : ''}${keyIssues[0]}. Continue monitoring customer satisfaction.`;
  }

  return {
    id: `ai-${Date.now()}`,
    sentiment,
    sentimentScore,
    summary,
    keyIssues,
    suggestedActions,
    generatedAt: new Date().toISOString(),
  };
};

// Generate mock survey responses
const generateMockResponses = (): SurveyResponse[] => {
  const now = new Date();
  return [
    {
      id: 'sr-1',
      surveyConfigId: 'config-1',
      conversationId: 'conv-101',
      customerId: 'cust-201',
      customerName: 'James Wilson',
      customerEmail: 'james.w@email.com',
      channel: 'voice',
      agentId: 'agent-1',
      agentName: 'Sarah Johnson',
      surveyType: 'csat',
      score: 2,
      followUpResponse: 'Had to explain my issue multiple times. Very frustrating.',
      status: 'completed',
      sentAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString(),
      deliveryChannel: 'chat',
      aiSummary: {
        id: 'ai-1',
        sentiment: 'negative',
        sentimentScore: -0.8,
        summary: 'Customer expressed significant frustration with having to repeat information. Issue escalated due to low satisfaction score.',
        keyIssues: ['Multiple explanations required', 'Communication breakdown', 'Long resolution time'],
        suggestedActions: ['Follow up with customer', 'Review call recording', 'Agent coaching recommended'],
        generatedAt: new Date(now.getTime() - 1.4 * 60 * 60 * 1000).toISOString(),
      },
      escalation: {
        id: 'esc-1',
        responseId: 'sr-1',
        conversationId: 'conv-101',
        customerId: 'cust-201',
        customerName: 'James Wilson',
        score: 2,
        surveyType: 'csat',
        reason: 'Low CSAT score (2/5) - Customer frustration detected',
        status: 'pending',
        createdAt: new Date(now.getTime() - 1.4 * 60 * 60 * 1000).toISOString(),
        notes: [
          { id: 'n1', content: 'Escalation created automatically due to low score', createdBy: 'System', createdAt: new Date(now.getTime() - 1.4 * 60 * 60 * 1000).toISOString() },
        ],
      },
    },
    {
      id: 'sr-2',
      surveyConfigId: 'config-1',
      conversationId: 'conv-102',
      customerId: 'cust-202',
      customerName: 'Emily Chen',
      channel: 'chat',
      agentId: 'ai-1',
      agentName: 'AI Assistant',
      surveyType: 'nps',
      score: 9,
      followUpResponse: 'The AI was super helpful and quick!',
      status: 'completed',
      sentAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 3.8 * 60 * 60 * 1000).toISOString(),
      deliveryChannel: 'chat',
      aiSummary: {
        id: 'ai-2',
        sentiment: 'positive',
        sentimentScore: 0.9,
        summary: 'Customer highly satisfied with AI assistant interaction. Quick resolution and helpful responses noted.',
        keyIssues: [],
        suggestedActions: ['Use as positive example for AI training'],
        generatedAt: new Date(now.getTime() - 3.7 * 60 * 60 * 1000).toISOString(),
      },
    },
    {
      id: 'sr-3',
      surveyConfigId: 'config-1',
      conversationId: 'conv-103',
      customerId: 'cust-203',
      customerName: 'Robert Martinez',
      customerPhone: '+1 555-0123',
      channel: 'voice',
      agentId: 'agent-2',
      agentName: 'Mike Brown',
      surveyType: 'csat',
      score: 1,
      followUpResponse: 'Absolutely terrible experience. Nobody could help me.',
      status: 'completed',
      sentAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
      deliveryChannel: 'sms',
      aiSummary: {
        id: 'ai-3',
        sentiment: 'negative',
        sentimentScore: -0.95,
        summary: 'Critical negative feedback. Customer reports complete failure to resolve issue. Immediate escalation required.',
        keyIssues: ['Complete service failure', 'No resolution provided', 'Customer at risk of churn'],
        suggestedActions: ['Immediate manager callback', 'Service recovery process', 'Compensation consideration'],
        generatedAt: new Date(now.getTime() - 24 * 60 * 1000).toISOString(),
      },
      escalation: {
        id: 'esc-2',
        responseId: 'sr-3',
        conversationId: 'conv-103',
        customerId: 'cust-203',
        customerName: 'Robert Martinez',
        score: 1,
        surveyType: 'csat',
        reason: 'Critical CSAT score (1/5) - Service failure reported',
        status: 'pending',
        createdAt: new Date(now.getTime() - 24 * 60 * 1000).toISOString(),
        notes: [
          { id: 'n2', content: 'CRITICAL: Lowest possible score received', createdBy: 'System', createdAt: new Date(now.getTime() - 24 * 60 * 1000).toISOString() },
        ],
      },
    },
    {
      id: 'sr-4',
      surveyConfigId: 'config-1',
      conversationId: 'conv-104',
      customerId: 'cust-204',
      customerName: 'Lisa Park',
      channel: 'email',
      agentId: 'ai-1',
      agentName: 'AI Assistant',
      surveyType: 'nps',
      score: 5,
      status: 'completed',
      sentAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 5.5 * 60 * 60 * 1000).toISOString(),
      deliveryChannel: 'email',
      aiSummary: {
        id: 'ai-4',
        sentiment: 'negative',
        sentimentScore: -0.5,
        summary: 'NPS detractor identified. Customer unlikely to recommend service. Follow-up needed to understand concerns.',
        keyIssues: ['Low recommendation likelihood', 'Unspecified concerns'],
        suggestedActions: ['Proactive outreach', 'Gather detailed feedback'],
        generatedAt: new Date(now.getTime() - 5.4 * 60 * 60 * 1000).toISOString(),
      },
      escalation: {
        id: 'esc-3',
        responseId: 'sr-4',
        conversationId: 'conv-104',
        customerId: 'cust-204',
        customerName: 'Lisa Park',
        score: 5,
        surveyType: 'nps',
        reason: 'NPS Detractor (5/10) - At-risk customer',
        status: 'acknowledged',
        assignedTo: 'John Smith',
        createdAt: new Date(now.getTime() - 5.4 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
        notes: [
          { id: 'n3', content: 'Escalation created for NPS detractor', createdBy: 'System', createdAt: new Date(now.getTime() - 5.4 * 60 * 60 * 1000).toISOString() },
          { id: 'n4', content: 'Assigned to John Smith for follow-up', createdBy: 'System', createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString() },
        ],
      },
    },
    {
      id: 'sr-5',
      surveyConfigId: 'config-1',
      conversationId: 'conv-105',
      customerId: 'cust-205',
      customerName: 'David Kim',
      channel: 'chat',
      agentId: 'agent-3',
      agentName: 'Emma Wilson',
      surveyType: 'csat',
      score: 5,
      followUpResponse: 'Emma was amazing! Solved my problem in minutes.',
      status: 'completed',
      sentAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(now.getTime() - 55 * 60 * 1000).toISOString(),
      deliveryChannel: 'chat',
      aiSummary: {
        id: 'ai-5',
        sentiment: 'positive',
        sentimentScore: 0.95,
        summary: 'Excellent customer experience. Agent Emma Wilson received specific praise for quick and effective resolution.',
        keyIssues: [],
        suggestedActions: ['Recognize agent performance', 'Share as best practice example'],
        generatedAt: new Date(now.getTime() - 54 * 60 * 1000).toISOString(),
      },
    },
  ];
};

const generateMockConfig = (): SurveyConfig => ({
  id: 'config-1',
  ...DEFAULT_SURVEY_CONFIG,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
});

export function useSurveyData() {
  const [responses, setResponses] = useState<SurveyResponse[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return generateMockResponses();
      }
    }
    return generateMockResponses();
  });

  const [config, setConfig] = useState<SurveyConfig>(() => {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return generateMockConfig();
      }
    }
    return generateMockConfig();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  }, [responses]);

  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  // Calculate stats
  const stats: SurveyStats = {
    totalSent: responses.length,
    totalCompleted: responses.filter(r => r.status === 'completed').length,
    responseRate: responses.length > 0 
      ? Math.round((responses.filter(r => r.status === 'completed').length / responses.length) * 100) 
      : 0,
    averageCsat: (() => {
      const csatResponses = responses.filter(r => r.surveyType === 'csat' && r.status === 'completed');
      if (csatResponses.length === 0) return 0;
      return Number((csatResponses.reduce((acc, r) => acc + r.score, 0) / csatResponses.length).toFixed(1));
    })(),
    npsScore: (() => {
      const npsResponses = responses.filter(r => r.surveyType === 'nps' && r.status === 'completed');
      if (npsResponses.length === 0) return 0;
      const promoters = npsResponses.filter(r => r.score >= 9).length;
      const detractors = npsResponses.filter(r => r.score <= 6).length;
      return Math.round(((promoters - detractors) / npsResponses.length) * 100);
    })(),
    promoters: responses.filter(r => r.surveyType === 'nps' && r.score >= 9).length,
    passives: responses.filter(r => r.surveyType === 'nps' && r.score >= 7 && r.score <= 8).length,
    detractors: responses.filter(r => r.surveyType === 'nps' && r.score <= 6).length,
    pendingEscalations: responses.filter(r => r.escalation?.status === 'pending').length,
  };

  // Get all escalations
  const escalations = responses
    .filter(r => r.escalation)
    .map(r => r.escalation!)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const pendingEscalations = escalations.filter(e => e.status === 'pending');

  // Trigger survey after conversation ends
  const triggerSurvey = useCallback(async (
    conversationId: string,
    customerId: string,
    customerName: string,
    channel: 'voice' | 'chat' | 'email',
    agentId?: string,
    agentName?: string,
    customerEmail?: string,
    customerPhone?: string
  ): Promise<SurveyResponse> => {
    setIsLoading(true);

    // Simulate delay based on config
    await new Promise(resolve => setTimeout(resolve, config.delaySeconds * 1000));

    const newResponse: SurveyResponse = {
      id: `sr-${Date.now()}`,
      surveyConfigId: config.id,
      conversationId,
      customerId,
      customerName,
      customerEmail,
      customerPhone,
      channel,
      agentId,
      agentName,
      surveyType: config.surveyType,
      score: 0,
      status: 'sent',
      sentAt: new Date().toISOString(),
      deliveryChannel: config.deliveryChannels[0],
    };

    setResponses(prev => [...prev, newResponse]);
    setIsLoading(false);

    notify.success('Survey sent', `${config.surveyType.toUpperCase()} survey sent to ${customerName}`);
    return newResponse;
  }, [config]);

  // Submit survey response (customer action)
  const submitSurveyResponse = useCallback(async (
    responseId: string,
    score: number,
    followUpResponse?: string
  ) => {
    setIsLoading(true);
    setIsGeneratingSummary(true);

    // Generate AI summary
    const response = responses.find(r => r.id === responseId);
    if (!response) {
      setIsLoading(false);
      setIsGeneratingSummary(false);
      return;
    }

    const aiSummary = await generateAISummary(score, response.surveyType, followUpResponse);

    // Check if escalation is needed
    const needsEscalation = response.surveyType === 'csat' 
      ? score <= config.thresholds.csatNegative
      : score <= config.thresholds.npsDetractor;

    let escalation: SurveyEscalation | undefined;
    if (needsEscalation) {
      escalation = {
        id: `esc-${Date.now()}`,
        responseId,
        conversationId: response.conversationId,
        customerId: response.customerId,
        customerName: response.customerName,
        score,
        surveyType: response.surveyType,
        reason: response.surveyType === 'csat'
          ? `Low CSAT score (${score}/5) - Negative feedback detected`
          : `NPS Detractor (${score}/10) - At-risk customer identified`,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: [{
          id: `note-${Date.now()}`,
          content: 'Escalation created automatically due to low satisfaction score',
          createdBy: 'System',
          createdAt: new Date().toISOString(),
        }],
      };

      // Notify supervisors
      notify.warning(
        '⚠️ Survey Escalation',
        `${response.customerName} gave a ${score}/${response.surveyType === 'csat' ? 5 : 10} rating. Review required.`
      );
    }

    setResponses(prev => prev.map(r => {
      if (r.id !== responseId) return r;
      return {
        ...r,
        score,
        followUpResponse,
        status: 'completed',
        completedAt: new Date().toISOString(),
        aiSummary,
        escalation,
      };
    }));

    setIsLoading(false);
    setIsGeneratingSummary(false);

    notify.success('Survey completed', 'Thank you for your feedback!');
  }, [responses, config.thresholds]);

  // Update config
  const updateConfig = useCallback(async (updates: Partial<SurveyConfig>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    setConfig(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));

    setIsLoading(false);
    notify.success('Configuration saved', 'Survey settings have been updated.');
  }, []);

  // Acknowledge escalation
  const acknowledgeEscalation = useCallback(async (escalationId: string, assignTo: string) => {
    setResponses(prev => prev.map(r => {
      if (r.escalation?.id !== escalationId) return r;
      return {
        ...r,
        escalation: {
          ...r.escalation,
          status: 'acknowledged',
          assignedTo: assignTo,
          acknowledgedAt: new Date().toISOString(),
          notes: [
            ...r.escalation.notes,
            {
              id: `note-${Date.now()}`,
              content: `Escalation acknowledged and assigned to ${assignTo}`,
              createdBy: 'System',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      };
    }));

    notify.success('Escalation acknowledged', `Assigned to ${assignTo} for follow-up.`);
  }, []);

  // Resolve escalation
  const resolveEscalation = useCallback(async (escalationId: string, resolution: string) => {
    setResponses(prev => prev.map(r => {
      if (r.escalation?.id !== escalationId) return r;
      return {
        ...r,
        escalation: {
          ...r.escalation,
          status: 'resolved',
          resolvedAt: new Date().toISOString(),
          notes: [
            ...r.escalation.notes,
            {
              id: `note-${Date.now()}`,
              content: `Resolved: ${resolution}`,
              createdBy: 'Current User',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      };
    }));

    notify.success('Escalation resolved', 'The escalation has been marked as resolved.');
  }, []);

  // Add note to escalation
  const addEscalationNote = useCallback(async (escalationId: string, note: string) => {
    setResponses(prev => prev.map(r => {
      if (r.escalation?.id !== escalationId) return r;
      return {
        ...r,
        escalation: {
          ...r.escalation,
          notes: [
            ...r.escalation.notes,
            {
              id: `note-${Date.now()}`,
              content: note,
              createdBy: 'Current User',
              createdAt: new Date().toISOString(),
            },
          ],
        },
      };
    }));

    notify.success('Note added', 'Your note has been added to the escalation.');
  }, []);

  // Get responses by sentiment
  const getResponsesBySentiment = useCallback((sentiment: 'positive' | 'neutral' | 'negative') => {
    return responses.filter(r => r.aiSummary?.sentiment === sentiment);
  }, [responses]);

  return {
    responses,
    config,
    stats,
    escalations,
    pendingEscalations,
    isLoading,
    isGeneratingSummary,
    triggerSurvey,
    submitSurveyResponse,
    updateConfig,
    acknowledgeEscalation,
    resolveEscalation,
    addEscalationNote,
    getResponsesBySentiment,
  };
}
