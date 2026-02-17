import { useState, useCallback, useEffect, useMemo } from 'react';
import type { 
  LiveConversation, 
  ConversationMessage, 
  Agent, 
  QueueStats,
  SentimentType,
  SupervisorMode,
  CallDisposition 
} from '@/types/liveOps';

const generateMockConversations = (): LiveConversation[] => [
  {
    id: 'conv-1',
    customerId: 'cust-1',
    customerName: 'María García',
    agentId: 'ai-1',
    agentName: 'AI Assistant',
    channel: 'voice',
    status: 'active',
    sentiment: 'neutral',
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    duration: 300,
    topic: 'Billing Inquiry (Spanish)',
    isAiHandled: true,
    supervisorMode: null,
    groupId: 'grp-1',
    priority: 'medium',
    messages: [
      { id: 'm1', role: 'customer', content: 'Hola, tengo una pregunta sobre mi factura reciente.', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'agent', content: 'Hello María! I\'d be happy to help you with your billing inquiry. Could you please provide your account number?', timestamp: new Date(Date.now() - 4.5 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'customer', content: 'Claro, es 12345678.', timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
      { id: 'm4', role: 'agent', content: 'Thank you. I can see your account. I notice there\'s a $50 charge from last week. Is that what you\'re asking about?', timestamp: new Date(Date.now() - 3.5 * 60 * 1000).toISOString() },
      { id: 'm5', role: 'customer', content: 'Sí, exactamente. No reconozco ese cargo.', timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), sentiment: 'negative' },
    ],
    customerInfo: {
      phone: '+1 (555) 234-5678',
      email: 'maria.garcia@email.com',
      crmId: 'CRM-10234',
      company: 'García Consulting',
      location: 'Miami, FL',
      tier: 'premium',
      lifetimeValue: '$12,450',
      tags: ['Spanish-speaking', 'Premium', 'Billing'],
      previousInteractions: [
        { id: 'pi-1', channel: 'voice', topic: 'Account Setup', date: '2025-12-10', outcome: 'resolved', agent: 'Emma Wilson' },
        { id: 'pi-2', channel: 'chat', topic: 'Plan Upgrade', date: '2026-01-15', outcome: 'resolved', agent: 'AI Assistant' },
        { id: 'pi-3', channel: 'voice', topic: 'Billing Dispute', date: '2026-02-01', outcome: 'escalated', agent: 'John Smith' },
      ],
    },
    recordingInfo: { available: true, url: '#recording-conv-1', duration: 300, transcriptUrl: '#transcript-conv-1' },
    networkQuality: 'good',
    coPilotSuggestions: [
      { id: 'cp-1', type: 'intent', content: 'Customer is disputing an unrecognized charge of $50', confidence: 0.95 },
      { id: 'cp-2', type: 'reply', content: 'I can see the $50 charge was from a subscription renewal. Would you like me to issue a refund?', confidence: 0.88 },
      { id: 'cp-3', type: 'action', content: 'Open billing dispute form for account CRM-10234', confidence: 0.82 },
      { id: 'cp-4', type: 'knowledge', content: 'Policy: Disputes under $100 can be auto-refunded within 30 days', confidence: 0.91 },
    ],
    notes: ['Customer prefers communication in Spanish', 'Previous billing dispute was resolved with credit'],
  },
  {
    id: 'conv-2',
    customerId: 'cust-2',
    customerName: 'Michael Chen',
    agentId: 'ai-1',
    agentName: 'AI Assistant',
    channel: 'chat',
    status: 'active',
    sentiment: 'positive',
    startedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    duration: 480,
    topic: 'Product Demo',
    isAiHandled: true,
    supervisorMode: null,
    groupId: 'grp-2',
    priority: 'low',
    messages: [
      { id: 'm1', role: 'customer', content: 'I\'d like to learn more about your enterprise plan.', timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'agent', content: 'Great choice! Our enterprise plan includes unlimited users, priority support, and custom integrations. What specific features are you most interested in?', timestamp: new Date(Date.now() - 7.5 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'customer', content: 'The custom integrations sound perfect for us!', timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(), sentiment: 'positive' },
    ],
  },
  {
    id: 'conv-3',
    customerId: 'cust-3',
    customerName: 'Sarah Johnson',
    agentId: 'agent-1',
    agentName: 'John Smith',
    channel: 'voice',
    status: 'active',
    sentiment: 'escalated',
    startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    duration: 900,
    topic: 'Technical Issue - Urgent',
    isAiHandled: false,
    supervisorMode: 'monitoring',
    supervisorId: 'sup-1',
    groupId: 'grp-1',
    priority: 'urgent',
    messages: [
      { id: 'm1', role: 'customer', content: 'This is the third time I\'m calling about this issue!', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), sentiment: 'escalated' },
      { id: 'm2', role: 'agent', content: 'I completely understand your frustration, Sarah. Let me look into this right away and make sure we resolve it today.', timestamp: new Date(Date.now() - 14.5 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'system', content: 'Supervisor started monitoring this conversation', timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
      { id: 'm4', role: 'customer', content: 'I really hope so. This has been going on for weeks.', timestamp: new Date(Date.now() - 13.5 * 60 * 1000).toISOString(), sentiment: 'negative' },
    ],
    customerInfo: {
      phone: '+1 (555) 987-6543',
      email: 'sarah.j@techcorp.io',
      crmId: 'CRM-20891',
      company: 'TechCorp Industries',
      location: 'Austin, TX',
      tier: 'enterprise',
      lifetimeValue: '$85,200',
      tags: ['Enterprise', 'Technical', 'Escalation-History'],
      previousInteractions: [
        { id: 'pi-4', channel: 'voice', topic: 'API Integration Issue', date: '2026-01-28', outcome: 'escalated', agent: 'David Kim' },
        { id: 'pi-5', channel: 'voice', topic: 'Same API Issue - Follow Up', date: '2026-02-05', outcome: 'callback', agent: 'John Smith' },
        { id: 'pi-6', channel: 'email', topic: 'Service Level Complaint', date: '2026-02-10', outcome: 'escalated', agent: 'Carlos Mendez' },
        { id: 'pi-7', channel: 'chat', topic: 'Account Status Check', date: '2026-02-14', outcome: 'resolved', agent: 'AI Assistant' },
      ],
    },
    recordingInfo: { available: true, url: '#recording-conv-3', duration: 900, transcriptUrl: '#transcript-conv-3' },
    networkQuality: 'excellent',
    coPilotSuggestions: [
      { id: 'cp-5', type: 'intent', content: 'Repeat caller — 3rd contact about unresolved API integration issue', confidence: 0.97 },
      { id: 'cp-6', type: 'reply', content: 'Sarah, I can see this has been ongoing. Let me escalate to our engineering team with a priority ticket.', confidence: 0.90 },
      { id: 'cp-7', type: 'action', content: 'Create P1 engineering ticket for API webhook failures on account CRM-20891', confidence: 0.93 },
      { id: 'cp-8', type: 'knowledge', content: 'Known issue: Webhook delivery failures affecting enterprise accounts since Feb 3. Fix ETA: Feb 20.', confidence: 0.96 },
      { id: 'cp-9', type: 'action', content: 'Offer 15% service credit per enterprise SLA breach policy', confidence: 0.85 },
    ],
    notes: ['Enterprise customer — high priority', 'Recurring API webhook issue', 'Supervisor monitoring active'],
  },
  {
    id: 'conv-4',
    customerId: 'cust-4',
    customerName: 'David Miller',
    agentId: '',
    agentName: '',
    channel: 'chat',
    status: 'waiting',
    sentiment: 'neutral',
    startedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: 0,
    waitTime: 120,
    queuePosition: 1,
    topic: 'General Inquiry',
    isAiHandled: false,
    supervisorMode: null,
    groupId: 'grp-3',
    priority: 'low',
    messages: [
      { id: 'm1', role: 'customer', content: 'Hello, I need help with my account settings.', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'system', content: 'You are in queue. Estimated wait time: 2 minutes', timestamp: new Date(Date.now() - 1.9 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'conv-5',
    customerId: 'cust-5',
    customerName: 'Lisa Park',
    agentId: 'ai-1',
    agentName: 'AI Assistant',
    channel: 'email',
    status: 'active',
    sentiment: 'neutral',
    startedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    duration: 180,
    topic: 'Refund Request',
    isAiHandled: true,
    supervisorMode: null,
    groupId: 'grp-4',
    priority: 'high',
    messages: [
      { id: 'm1', role: 'customer', content: 'I would like to request a refund for order #98765.', timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'agent', content: 'I\'d be happy to help you with your refund request. I can see your order and I\'m processing the refund now.', timestamp: new Date(Date.now() - 2.5 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'conv-6',
    customerId: 'cust-6',
    customerName: 'James Wilson',
    agentId: 'agent-2',
    agentName: 'Emma Wilson',
    channel: 'chat',
    status: 'resolved',
    sentiment: 'positive',
    startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    duration: 1500,
    topic: 'Password Reset',
    isAiHandled: false,
    supervisorMode: null,
    groupId: 'grp-2',
    priority: 'medium',
    messages: [
      { id: 'm1', role: 'customer', content: 'I can\'t log in to my account. I need to reset my password.', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'agent', content: 'I can help you with that. I\'ve sent a password reset link to your registered email address.', timestamp: new Date(Date.now() - 44 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'customer', content: 'Got it, I was able to reset successfully. Thank you!', timestamp: new Date(Date.now() - 22 * 60 * 1000).toISOString(), sentiment: 'positive' },
      { id: 'm4', role: 'system', content: 'Conversation resolved', timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    ],
  },
  {
    id: 'conv-7',
    customerId: 'cust-7',
    customerName: 'Anna Thompson',
    agentId: 'ai-1',
    agentName: 'AI Assistant',
    channel: 'voice',
    status: 'resolved',
    sentiment: 'neutral',
    startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    duration: 1500,
    topic: 'Subscription Upgrade',
    isAiHandled: true,
    supervisorMode: null,
    groupId: 'grp-3',
    priority: 'low',
    messages: [
      { id: 'm1', role: 'customer', content: 'I\'d like to upgrade my subscription to the pro plan.', timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'agent', content: 'I\'ve upgraded your subscription to the Pro plan. You now have access to all premium features.', timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'customer', content: 'Perfect, thanks for the quick help!', timestamp: new Date(Date.now() - 36 * 60 * 1000).toISOString(), sentiment: 'positive' },
      { id: 'm4', role: 'system', content: 'Conversation resolved', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
    ],
    customerInfo: {
      phone: '+1 (555) 111-2233',
      email: 'anna.t@email.com',
      crmId: 'CRM-30567',
      location: 'Portland, OR',
      tier: 'standard',
      lifetimeValue: '$2,800',
      tags: ['Standard', 'Subscription'],
      previousInteractions: [
        { id: 'pi-8', channel: 'chat', topic: 'Plan Inquiry', date: '2025-11-20', outcome: 'resolved', agent: 'AI Assistant' },
      ],
    },
    recordingInfo: { available: true, url: '#recording-conv-7', duration: 1500, transcriptUrl: '#transcript-conv-7' },
    networkQuality: 'fair',
    disposition: {
      outcome: 'resolved',
      summary: 'Customer upgraded from Standard to Pro plan. Confirmed new features access.',
      tags: ['Subscription', 'Upgrade', 'Upsell'],
    },
  },
  {
    id: 'conv-8',
    customerId: 'cust-8',
    customerName: 'Robert Kim',
    agentId: '',
    agentName: '',
    channel: 'chat',
    status: 'missed',
    sentiment: 'negative',
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    duration: 0,
    waitTime: 300,
    topic: 'Order Status Check',
    isAiHandled: false,
    supervisorMode: null,
    groupId: 'grp-4',
    priority: 'high',
    messages: [
      { id: 'm1', role: 'customer', content: 'Where is my order #54321? It\'s been 2 weeks!', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), sentiment: 'negative' },
      { id: 'm2', role: 'system', content: 'You are in queue. Estimated wait time: 5 minutes', timestamp: new Date(Date.now() - 29.5 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'system', content: 'Customer disconnected - conversation missed', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
    ],
  },
];

const generateMockAgents = (): Agent[] => [
  { id: 'agent-1', name: 'John Smith', status: 'busy', currentConversations: 3, maxConversations: 5, skills: ['Sales', 'Support'] },
  { id: 'agent-2', name: 'Emma Wilson', status: 'available', currentConversations: 1, maxConversations: 5, skills: ['Technical', 'Support'] },
  { id: 'agent-3', name: 'Mike Brown', status: 'away', currentConversations: 0, maxConversations: 5, skills: ['Billing', 'Support'] },
  { id: 'agent-4', name: 'Sarah Davis', status: 'busy', currentConversations: 4, maxConversations: 5, skills: ['Sales', 'Technical'] },
  { id: 'agent-5', name: 'Rachel Green', status: 'available', currentConversations: 2, maxConversations: 5, skills: ['Support', 'Billing'] },
  { id: 'agent-6', name: 'David Kim', status: 'available', currentConversations: 0, maxConversations: 5, skills: ['Technical', 'Escalation'] },
  { id: 'agent-7', name: 'Priya Sharma', status: 'busy', currentConversations: 3, maxConversations: 5, skills: ['Sales', 'VIP Support'] },
  { id: 'agent-8', name: 'Carlos Mendez', status: 'available', currentConversations: 1, maxConversations: 5, skills: ['Support', 'Escalation'] },
  { id: 'agent-9', name: 'Lisa Park', status: 'busy', currentConversations: 4, maxConversations: 5, skills: ['VIP Support', 'Technical'] },
  { id: 'agent-10', name: 'James O\'Connor', status: 'available', currentConversations: 2, maxConversations: 5, skills: ['Sales', 'Support'] },
];

export function useLiveOpsData() {
  const [conversations, setConversations] = useState<LiveConversation[]>(generateMockConversations());
  const [agents, setAgents] = useState<Agent[]>(generateMockAgents());
  const [selectedConversation, setSelectedConversation] = useState<LiveConversation | null>(null);

  const conversationsWithSLA = useMemo(() => {
    return conversations.map(conv => {
      let slaBreached = false;
      if (conv.status === 'active' && conv.duration > 600) {
        slaBreached = true;
      }
      if (conv.status === 'waiting' && (conv.waitTime || 0) > 120) {
        slaBreached = true;
      }
      return { ...conv, slaBreached };
    });
  }, [conversations]);

  const queueStats: QueueStats = {
    totalWaiting: conversationsWithSLA.filter(c => c.status === 'waiting').length,
    averageWaitTime: 95,
    longestWait: 180,
    activeConversations: conversationsWithSLA.filter(c => c.status === 'active').length,
    availableAgents: agents.filter(a => a.status === 'available').length,
  };

  const chatCategoryStats = useMemo(() => ({
    active: conversationsWithSLA.filter(c => c.status === 'active').length,
    queued: conversationsWithSLA.filter(c => c.status === 'waiting').length,
    resolved: conversationsWithSLA.filter(c => c.status === 'resolved').length,
    missed: conversationsWithSLA.filter(c => c.status === 'missed').length,
  }), [conversationsWithSLA]);

  const slaStats = useMemo(() => {
    const breached = conversationsWithSLA.filter(c => c.slaBreached);
    return {
      totalBreached: breached.length,
      activeBreached: breached.filter(c => c.status === 'active').length,
      queueBreached: breached.filter(c => c.status === 'waiting').length,
    };
  }, [conversationsWithSLA]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConversations(prev => prev.map(conv => {
        if (conv.status === 'active') {
          return { ...conv, duration: conv.duration + 1 };
        }
        if (conv.status === 'waiting' && conv.waitTime) {
          return { ...conv, waitTime: conv.waitTime + 1 };
        }
        return conv;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const activeConvs = conversations.filter(c => c.status === 'active');
      if (activeConvs.length > 0) {
        const randomConv = activeConvs[Math.floor(Math.random() * activeConvs.length)];
        const isCustomer = Math.random() > 0.5;
        
        if (Math.random() > 0.7) {
          const newMessage: ConversationMessage = {
            id: `m-${Date.now()}`,
            role: isCustomer ? 'customer' : 'agent',
            content: isCustomer 
              ? ['I see, thank you.', 'That makes sense.', 'Can you explain more?', 'Got it!'][Math.floor(Math.random() * 4)]
              : ['Of course! Let me help you with that.', 'I understand. Here\'s what we can do...', 'Great question!'][Math.floor(Math.random() * 3)],
            timestamp: new Date().toISOString(),
          };

          setConversations(prev => prev.map(conv => 
            conv.id === randomConv.id 
              ? { ...conv, messages: [...conv.messages, newMessage] }
              : conv
          ));

          if (selectedConversation?.id === randomConv.id) {
            setSelectedConversation(prev => prev ? {
              ...prev,
              messages: [...prev.messages, newMessage]
            } : null);
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [conversations, selectedConversation]);

  const startMonitoring = useCallback(async (conversationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, supervisorMode: 'monitoring' as SupervisorMode, supervisorId: 'current-user' }
        : conv
    ));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { ...prev, supervisorMode: 'monitoring', supervisorId: 'current-user' } : null);
    }
  }, [selectedConversation]);

  const startWhisper = useCallback(async (conversationId: string, message: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const whisperMessage: ConversationMessage = {
      id: `w-${Date.now()}`,
      role: 'whisper',
      content: message,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { 
            ...conv, 
            supervisorMode: 'whispering' as SupervisorMode, 
            supervisorId: 'current-user',
            messages: [...conv.messages, whisperMessage]
          }
        : conv
    ));
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { 
        ...prev, 
        supervisorMode: 'whispering', 
        supervisorId: 'current-user',
        messages: [...prev.messages, whisperMessage]
      } : null);
    }
  }, [selectedConversation]);

  const bargeIn = useCallback(async (conversationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bargeMessage: ConversationMessage = {
      id: `b-${Date.now()}`,
      role: 'system',
      content: 'Supervisor has joined the conversation',
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { 
            ...conv, 
            supervisorMode: 'barged_in' as SupervisorMode, 
            supervisorId: 'current-user',
            messages: [...conv.messages, bargeMessage]
          }
        : conv
    ));
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { 
        ...prev, 
        supervisorMode: 'barged_in', 
        supervisorId: 'current-user',
        messages: [...prev.messages, bargeMessage]
      } : null);
    }
  }, [selectedConversation]);

  const transferToAgent = useCallback(async (conversationId: string, agentId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const agent = agents.find(a => a.id === agentId);
    const transferMessage: ConversationMessage = {
      id: `t-${Date.now()}`,
      role: 'system',
      content: `Conversation transferred to ${agent?.name || 'agent'}`,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { 
            ...conv, 
            agentId,
            agentName: agent?.name || 'Agent',
            isAiHandled: false,
            status: 'active',
            supervisorMode: null,
            messages: [...conv.messages, transferMessage]
          }
        : conv
    ));
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { 
        ...prev, 
        agentId,
        agentName: agent?.name || 'Agent',
        isAiHandled: false,
        status: 'active',
        supervisorMode: null,
        messages: [...prev.messages, transferMessage]
      } : null);
    }
  }, [agents, selectedConversation]);

  const stopSupervision = useCallback(async (conversationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, supervisorMode: null, supervisorId: undefined }
        : conv
    ));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? { ...prev, supervisorMode: null, supervisorId: undefined } : null);
    }
  }, [selectedConversation]);

  const endConversation = useCallback(async (conversationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const endMessage: ConversationMessage = {
      id: `end-${Date.now()}`,
      role: 'system',
      content: 'Conversation ended',
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { 
            ...conv, 
            status: 'ended' as const,
            supervisorMode: null,
            messages: [...conv.messages, endMessage]
          }
        : conv
    ));
    
    setTimeout(() => {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    }, 300);
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  }, [selectedConversation]);

  const takeOverConversation = useCallback(async (conversationId: string, agentId: string, agentName: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const takeOverMessage: ConversationMessage = {
      id: `takeover-${Date.now()}`,
      role: 'system',
      content: `${agentName} has taken over this conversation`,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? {
            ...conv,
            agentId,
            agentName,
            isAiHandled: false,
            status: 'active' as const,
            supervisorMode: null,
            messages: [...conv.messages, takeOverMessage]
          }
        : conv
    ));

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? {
        ...prev,
        agentId,
        agentName,
        isAiHandled: false,
        status: 'active',
        supervisorMode: null,
        messages: [...prev.messages, takeOverMessage]
      } : null);
    }
  }, [selectedConversation]);

  const escalateConversation = useCallback(async (conversationId: string, reason: string) => {
    await new Promise(resolve => setTimeout(resolve, 600));

    const escalateMessage: ConversationMessage = {
      id: `escalate-${Date.now()}`,
      role: 'system',
      content: `Conversation escalated: ${reason}`,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? {
            ...conv,
            sentiment: 'escalated' as SentimentType,
            priority: 'urgent' as const,
            messages: [...conv.messages, escalateMessage]
          }
        : conv
    ));

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? {
        ...prev,
        sentiment: 'escalated',
        priority: 'urgent',
        messages: [...prev.messages, escalateMessage]
      } : null);
    }
  }, [selectedConversation]);

  const sendMessage = useCallback(async (conversationId: string, content: string, senderRole: 'agent' | 'customer' = 'agent') => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const newMessage: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: senderRole,
      content,
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, messages: [...conv.messages, newMessage] }
        : conv
    ));

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null);
    }
  }, [selectedConversation]);

  const resolveConversation = useCallback(async (conversationId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const resolveMessage: ConversationMessage = {
      id: `resolve-${Date.now()}`,
      role: 'system',
      content: 'Conversation resolved',
      timestamp: new Date().toISOString(),
    };

    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? {
            ...conv,
            status: 'resolved' as const,
            resolvedAt: new Date().toISOString(),
            supervisorMode: null,
            messages: [...conv.messages, resolveMessage]
          }
        : conv
    ));

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? {
        ...prev,
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
        supervisorMode: null,
        messages: [...prev.messages, resolveMessage]
      } : null);
    }
  }, [selectedConversation]);

  const addNote = useCallback((conversationId: string, note: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, notes: [...(conv.notes || []), note] }
        : conv
    ));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? {
        ...prev,
        notes: [...(prev.notes || []), note]
      } : null);
    }
  }, [selectedConversation]);

  const setDisposition = useCallback((conversationId: string, disposition: CallDisposition) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId
        ? { ...conv, disposition }
        : conv
    ));
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(prev => prev ? {
        ...prev,
        disposition
      } : null);
    }
  }, [selectedConversation]);

  return {
    conversations: conversationsWithSLA,
    agents,
    queueStats,
    selectedConversation,
    setSelectedConversation,
    startMonitoring,
    startWhisper,
    bargeIn,
    transferToAgent,
    stopSupervision,
    endConversation,
    resolveConversation,
    takeOverConversation,
    escalateConversation,
    sendMessage,
    chatCategoryStats,
    slaStats,
    addNote,
    setDisposition,
  };
}
