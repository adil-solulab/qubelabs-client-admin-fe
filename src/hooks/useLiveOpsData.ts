import { useState, useCallback, useEffect } from 'react';
import type { 
  LiveConversation, 
  ConversationMessage, 
  Agent, 
  QueueStats,
  SentimentType,
  SupervisorMode 
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
    messages: [
      { id: 'm1', role: 'customer', content: 'Hola, tengo una pregunta sobre mi factura reciente.', timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'agent', content: 'Hello María! I\'d be happy to help you with your billing inquiry. Could you please provide your account number?', timestamp: new Date(Date.now() - 4.5 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'customer', content: 'Claro, es 12345678.', timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
      { id: 'm4', role: 'agent', content: 'Thank you. I can see your account. I notice there\'s a $50 charge from last week. Is that what you\'re asking about?', timestamp: new Date(Date.now() - 3.5 * 60 * 1000).toISOString() },
      { id: 'm5', role: 'customer', content: 'Sí, exactamente. No reconozco ese cargo.', timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), sentiment: 'negative' },
    ],
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
    messages: [
      { id: 'm1', role: 'customer', content: 'This is the third time I\'m calling about this issue!', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), sentiment: 'escalated' },
      { id: 'm2', role: 'agent', content: 'I completely understand your frustration, Sarah. Let me look into this right away and make sure we resolve it today.', timestamp: new Date(Date.now() - 14.5 * 60 * 1000).toISOString() },
      { id: 'm3', role: 'system', content: 'Supervisor started monitoring this conversation', timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString() },
      { id: 'm4', role: 'customer', content: 'I really hope so. This has been going on for weeks.', timestamp: new Date(Date.now() - 13.5 * 60 * 1000).toISOString(), sentiment: 'negative' },
    ],
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
    messages: [
      { id: 'm1', role: 'customer', content: 'I would like to request a refund for order #98765.', timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
      { id: 'm2', role: 'agent', content: 'I\'d be happy to help you with your refund request. I can see your order and I\'m processing the refund now.', timestamp: new Date(Date.now() - 2.5 * 60 * 1000).toISOString() },
    ],
  },
];

const generateMockAgents = (): Agent[] => [
  { id: 'agent-1', name: 'John Smith', status: 'busy', currentConversations: 3, maxConversations: 5, skills: ['Sales', 'Support'] },
  { id: 'agent-2', name: 'Emma Wilson', status: 'available', currentConversations: 1, maxConversations: 5, skills: ['Technical', 'Support'] },
  { id: 'agent-3', name: 'Mike Brown', status: 'away', currentConversations: 0, maxConversations: 5, skills: ['Billing', 'Support'] },
  { id: 'agent-4', name: 'Sarah Davis', status: 'busy', currentConversations: 4, maxConversations: 5, skills: ['Sales', 'Technical'] },
];

export function useLiveOpsData() {
  const [conversations, setConversations] = useState<LiveConversation[]>(generateMockConversations());
  const [agents, setAgents] = useState<Agent[]>(generateMockAgents());
  const [selectedConversation, setSelectedConversation] = useState<LiveConversation | null>(null);

  const queueStats: QueueStats = {
    totalWaiting: conversations.filter(c => c.status === 'waiting').length,
    averageWaitTime: 95,
    longestWait: 180,
    activeConversations: conversations.filter(c => c.status === 'active').length,
    availableAgents: agents.filter(a => a.status === 'available').length,
  };

  // Simulate real-time updates
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

  // Simulate new messages
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
    
    // Remove conversation from list after animation
    setTimeout(() => {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    }, 300);
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  }, [selectedConversation]);

  return {
    conversations,
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
  };
}
