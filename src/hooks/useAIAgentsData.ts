import { useState, useCallback } from 'react';
import type { AIAgent } from '@/types/aiAgents';

const generateMockAgents = (): AIAgent[] => [
  {
    id: 'super-1',
    name: 'Customer Service Super Agent',
    description: 'Central orchestrator that intelligently routes customer queries to specialized agents based on intent and context.',
    type: 'super_agent',
    status: 'active',
    businessCapability: 'Customer Service Orchestration',
    priorityScore: 100,
    allowedChannels: ['voice', 'chat', 'email', 'whatsapp'],
    escalationAllowed: true,
    timezone: 'America/New_York',
    interruptible: true,
    expressiveMode: true,
    defaultPersonality: true,
    firstMessage: 'Hello! Welcome to our support. How can I help you today?',
    disclosureRequirements: 'This conversation may be recorded for quality assurance purposes.',
    voices: [
      { id: 'v-eric', name: 'Eric - Smooth, Trustworthy', provider: 'ElevenLabs', isPrimary: true },
    ],
    languages: ['English', 'Spanish'],
    llmProvider: 'OpenAI',
    persona: {
      tone: 'friendly',
      style: 'Professional and welcoming',
      adaptability: 80,
      greeting: 'Hello! Welcome to our support. How can I help you today?',
      personality: 'Warm, efficient, and context-aware orchestrator that ensures every customer reaches the right specialist.',
      verbosityLevel: 60,
      riskTolerance: 'low',
      domainExpertiseLevel: 'expert',
      empathyLevel: 80,
      brandVoiceProfile: 'Approachable yet authoritative',
    },
    intents: [
      { id: 'i1', name: 'Sales Inquiry', description: 'Customer wants to buy or learn about products', examples: ['I want to buy', 'Tell me about pricing', 'Product demo'], isActive: true },
      { id: 'i2', name: 'Support Request', description: 'Customer needs help with an issue', examples: ['My order is wrong', 'App is not working', 'Need help'], isActive: true },
      { id: 'i3', name: 'General FAQ', description: 'Common questions about the company', examples: ['What are your hours?', 'Where are you located?', 'Return policy'], isActive: true },
    ],
    triggers: [
      { id: 't1', type: 'event', value: 'conversation_start', description: 'Triggered when a new conversation begins', isActive: true },
      { id: 't2', type: 'keyword', value: 'help,support,issue,problem', description: 'Common support keywords', isActive: true },
    ],
    prompt: {
      systemPrompt: `You are the central AI orchestrator for our customer service platform. Your role is to understand the customer's intent and route them to the most appropriate specialized agent.\n\nKey responsibilities:\n- Greet customers warmly\n- Identify their intent quickly\n- Route to the correct specialized agent\n- Handle small talk and general questions directly\n- Maintain context across agent transfers\n- Manage fallback scenarios gracefully`,
      fewShotExamples: [
        { id: 'e1', userMessage: 'I want to cancel my subscription and get a refund', assistantResponse: 'I understand you\'d like to cancel and discuss a refund. Let me connect you with our billing specialist who can help you with both of these right away.' },
      ],
      temperature: 0.7,
      maxTokens: 1024,
      model: 'gpt-4',
    },
    variables: [
      { id: 'v1', name: 'customer_name', type: 'string', description: 'Customer full name', required: false },
      { id: 'v2', name: 'customer_id', type: 'string', description: 'Customer account ID', required: false },
      { id: 'v3', name: 'detected_intent', type: 'string', description: 'Auto-detected customer intent', required: false },
    ],
    routing: {
      mode: 'auto',
      rules: [
        { id: 'r1', condition: 'intent == "sales"', targetAgentId: 'agent-1', priority: 1 },
        { id: 'r2', condition: 'intent == "support"', targetAgentId: 'agent-2', priority: 2 },
        { id: 'r3', condition: 'intent == "technical"', targetAgentId: 'agent-3', priority: 3 },
      ],
      defaultAgentId: 'agent-4',
    },
    fallback: {
      action: 'escalate',
      maxRetries: 2,
      customMessage: 'I\'m not quite sure how to help with that. Let me connect you with a human agent.',
      escalateTo: 'human_agent',
      timeoutSeconds: 30,
    },
    context: {
      memoryWindow: 10,
      persistAcrossSessions: true,
      contextVariables: ['customer_name', 'customer_id', 'previous_interactions'],
      shareContextWithAgents: true,
    },
    guardrails: [
      { id: 'g1', type: 'pii_protection', name: 'PII Shield', description: 'Prevent exposure of personally identifiable information', isActive: true, severity: 'high', action: 'block' },
      { id: 'g2', type: 'content_filter', name: 'Profanity Filter', description: 'Block profane or inappropriate content in responses', isActive: true, severity: 'medium', action: 'block' },
      { id: 'g3', type: 'topic_restriction', name: 'Stay On Topic', description: 'Restrict conversations to business-relevant topics', isActive: true, severity: 'low', action: 'warn' },
    ],
    createdAt: '2024-01-10',
    updatedAt: '2024-06-15',
  },
  {
    id: 'agent-1',
    name: 'Sales Agent',
    description: 'Persuasive sales specialist focused on product recommendations, upselling, and closing deals.',
    type: 'agent',
    superAgentId: 'super-1',
    status: 'active',
    businessCapability: 'Sales & Revenue Generation',
    priorityScore: 85,
    allowedChannels: ['chat', 'email', 'whatsapp'],
    escalationAllowed: true,
    timezone: 'America/New_York',
    interruptible: false,
    expressiveMode: true,
    defaultPersonality: true,
    firstMessage: 'Great to meet you! I\'d love to help you find the perfect solution.',
    disclosureRequirements: '',
    voices: [
      { id: 'v-rachel', name: 'Rachel - Friendly, Upbeat', provider: 'ElevenLabs', isPrimary: true },
    ],
    languages: ['English'],
    llmProvider: 'OpenAI',
    persona: {
      tone: 'persuasive',
      style: 'Confident and engaging',
      adaptability: 75,
      greeting: 'Great to meet you! I\'d love to help you find the perfect solution.',
      personality: 'Enthusiastic, knowledgeable, and results-driven. Focuses on understanding customer needs before recommending solutions.',
      verbosityLevel: 70,
      riskTolerance: 'medium',
      domainExpertiseLevel: 'expert',
      empathyLevel: 65,
      brandVoiceProfile: 'Confident and persuasive',
    },
    intents: [
      { id: 'i1', name: 'Product Inquiry', description: 'Customer asking about products', examples: ['What do you offer?', 'Tell me about your plans'], isActive: true },
      { id: 'i2', name: 'Pricing Question', description: 'Customer asking about costs', examples: ['How much does it cost?', 'Any discounts?'], isActive: true },
      { id: 'i3', name: 'Demo Request', description: 'Customer wants a demonstration', examples: ['Can I see a demo?', 'Show me how it works'], isActive: true },
    ],
    triggers: [
      { id: 't1', type: 'intent', value: 'sales_inquiry', description: 'Routed from Super Agent on sales intent', isActive: true },
      { id: 't2', type: 'keyword', value: 'buy,purchase,pricing,cost,plan', description: 'Sales-related keywords', isActive: true },
    ],
    prompt: {
      systemPrompt: `You are a professional sales representative. Your goal is to help customers find the right products and services while being persuasive but never pushy.\n\nKey behaviors:\n- Always greet customers warmly\n- Ask qualifying questions to understand needs\n- Highlight value propositions clearly\n- Handle objections gracefully\n- Create urgency when appropriate\n- Always aim to close or schedule follow-up`,
      fewShotExamples: [
        { id: 'e1', userMessage: "I'm interested in your enterprise plan but it seems expensive.", assistantResponse: "I completely understand budget considerations are important. Let me share how our enterprise customers typically see 3x ROI within the first quarter. Would you like me to walk you through a quick cost-benefit analysis tailored to your team size?" },
        { id: 'e2', userMessage: "What makes you different from competitors?", assistantResponse: "Great question! While others focus on features, we focus on outcomes. Our customers report 40% faster resolution times and 95% satisfaction rates. Plus, we offer dedicated onboarding that competitors charge extra for." },
      ],
      temperature: 0.8,
      maxTokens: 512,
      model: 'gpt-4',
    },
    variables: [
      { id: 'v1', name: 'lead_score', type: 'number', description: 'Qualification score (1-100)', required: false },
      { id: 'v2', name: 'budget_range', type: 'string', description: 'Customer budget range', required: false },
      { id: 'v3', name: 'company_size', type: 'number', description: 'Number of employees', required: false },
      { id: 'v4', name: 'use_case', type: 'string', description: 'Primary use case', required: true },
    ],
    routing: { mode: 'manual', rules: [], defaultAgentId: undefined },
    fallback: {
      action: 'transfer',
      maxRetries: 1,
      customMessage: 'Let me connect you with our senior sales consultant for more detailed assistance.',
      escalateTo: 'agent-2',
      timeoutSeconds: 60,
    },
    context: {
      memoryWindow: 15,
      persistAcrossSessions: true,
      contextVariables: ['customer_name', 'budget_range', 'use_case'],
      shareContextWithAgents: true,
    },
    guardrails: [
      { id: 'g1', type: 'content_filter', name: 'No False Promises', description: 'Prevent making guarantees or false claims', isActive: true, severity: 'high', action: 'block' },
      { id: 'g2', type: 'response_length', name: 'Concise Responses', description: 'Keep responses under 200 words', isActive: true, severity: 'low', action: 'warn' },
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-05-20',
  },
  {
    id: 'agent-2',
    name: 'Support Agent',
    description: 'Empathetic customer support specialist focused on quick resolution and customer satisfaction.',
    type: 'agent',
    superAgentId: 'super-1',
    status: 'active',
    businessCapability: 'Customer Support & Resolution',
    priorityScore: 90,
    allowedChannels: ['voice', 'chat', 'email'],
    escalationAllowed: true,
    timezone: 'America/Chicago',
    interruptible: true,
    expressiveMode: true,
    defaultPersonality: true,
    firstMessage: 'I\'m here to help! Let\'s get this sorted out for you.',
    disclosureRequirements: 'Your conversation may be used to improve our service quality.',
    voices: [
      { id: 'v-sarah', name: 'Sarah - Warm, Professional', provider: 'ElevenLabs', isPrimary: true },
    ],
    languages: ['English', 'French'],
    llmProvider: 'OpenAI',
    persona: {
      tone: 'empathetic',
      style: 'Warm and understanding',
      adaptability: 85,
      greeting: 'I\'m here to help! Let\'s get this sorted out for you.',
      personality: 'Patient, understanding, and thorough. Prioritizes customer feelings while efficiently solving problems.',
      verbosityLevel: 50,
      riskTolerance: 'low',
      domainExpertiseLevel: 'intermediate',
      empathyLevel: 95,
      brandVoiceProfile: 'Warm and supportive',
    },
    intents: [
      { id: 'i1', name: 'Bug Report', description: 'Customer reporting a bug', examples: ['Something is broken', 'I found a bug'], isActive: true },
      { id: 'i2', name: 'Account Issue', description: 'Account-related problems', examples: ['Can\'t log in', 'Account locked'], isActive: true },
      { id: 'i3', name: 'Billing Dispute', description: 'Payment or billing issues', examples: ['Wrong charge', 'Refund request'], isActive: true },
    ],
    triggers: [
      { id: 't1', type: 'intent', value: 'support_request', description: 'Routed from Super Agent on support intent', isActive: true },
    ],
    prompt: {
      systemPrompt: `You are a compassionate customer support specialist. Your primary goal is to help customers resolve their issues quickly while ensuring they feel heard and valued.\n\nKey behaviors:\n- Acknowledge emotions first\n- Apologize sincerely when appropriate\n- Provide clear step-by-step solutions\n- Offer alternatives when primary solution isn't viable\n- Follow up to ensure satisfaction\n- Escalate appropriately when needed`,
      fewShotExamples: [
        { id: 'e1', userMessage: "I've been waiting 3 days for a response and I'm really frustrated!", assistantResponse: "I'm truly sorry for the delay and completely understand your frustration. That's not the experience we want for you. Let me personally look into your case right now and make sure we get this resolved today." },
      ],
      temperature: 0.6,
      maxTokens: 512,
      model: 'gpt-4',
    },
    variables: [
      { id: 'v1', name: 'ticket_id', type: 'string', description: 'Support ticket ID', required: false },
      { id: 'v2', name: 'issue_category', type: 'string', description: 'Type of issue', required: true },
      { id: 'v3', name: 'priority', type: 'string', description: 'Issue priority level', required: false },
    ],
    routing: { mode: 'manual', rules: [], defaultAgentId: undefined },
    fallback: {
      action: 'escalate',
      maxRetries: 2,
      customMessage: 'I want to make sure this gets resolved properly. Let me connect you with a senior specialist.',
      escalateTo: 'human_agent',
      timeoutSeconds: 45,
    },
    context: {
      memoryWindow: 20,
      persistAcrossSessions: true,
      contextVariables: ['ticket_id', 'issue_category', 'previous_interactions'],
      shareContextWithAgents: true,
    },
    guardrails: [
      { id: 'g1', type: 'pii_protection', name: 'PII Shield', description: 'Protect customer data', isActive: true, severity: 'high', action: 'block' },
    ],
    createdAt: '2024-02-10',
    updatedAt: '2024-05-18',
  },
  {
    id: 'agent-3',
    name: 'Technical Advisor',
    description: 'Technical expert for product consultations, implementation guidance, and troubleshooting.',
    type: 'agent',
    superAgentId: 'super-1',
    status: 'active',
    businessCapability: 'Technical Consultation',
    priorityScore: 75,
    allowedChannels: ['chat', 'email'],
    escalationAllowed: true,
    timezone: 'UTC',
    interruptible: false,
    expressiveMode: false,
    defaultPersonality: true,
    firstMessage: 'Hey! I\'m here to help with the technical side of things.',
    disclosureRequirements: '',
    voices: [],
    languages: ['English'],
    llmProvider: 'OpenAI',
    persona: {
      tone: 'friendly',
      style: 'Clear and knowledgeable',
      adaptability: 60,
      greeting: 'Hey! I\'m here to help with the technical side of things.',
      personality: 'Detail-oriented, patient, and technically proficient. Explains complex concepts in accessible language.',
      verbosityLevel: 80,
      riskTolerance: 'medium',
      domainExpertiseLevel: 'expert',
      empathyLevel: 50,
      brandVoiceProfile: 'Technical and clear',
    },
    intents: [
      { id: 'i1', name: 'Setup Help', description: 'Customer needs help with setup', examples: ['How do I install?', 'Setup instructions'], isActive: true },
      { id: 'i2', name: 'API Question', description: 'Questions about APIs', examples: ['API documentation', 'How to integrate'], isActive: true },
    ],
    triggers: [
      { id: 't1', type: 'intent', value: 'technical_inquiry', description: 'Routed from Super Agent on technical intent', isActive: true },
    ],
    prompt: {
      systemPrompt: `You are a knowledgeable technical advisor who helps customers with implementation questions and best practices. Balance technical accuracy with accessibility.\n\nKey behaviors:\n- Explain complex concepts simply\n- Provide code examples when helpful\n- Recommend best practices\n- Link to relevant documentation\n- Suggest optimal configurations`,
      fewShotExamples: [
        { id: 'e1', userMessage: 'How do I set up webhooks for real-time notifications?', assistantResponse: "Great choice using webhooks! Here's a quick setup guide:\n\n1. Go to Settings → Integrations → Webhooks\n2. Add your endpoint URL (must be HTTPS)\n3. Select events you want to receive\n4. Copy the signing secret for verification" },
      ],
      temperature: 0.5,
      maxTokens: 1024,
      model: 'gpt-4',
    },
    variables: [
      { id: 'v1', name: 'tech_stack', type: 'string', description: 'Customer technology stack', required: false },
      { id: 'v2', name: 'integration_type', type: 'string', description: 'Type of integration needed', required: false },
    ],
    routing: { mode: 'manual', rules: [], defaultAgentId: undefined },
    fallback: {
      action: 'escalate',
      maxRetries: 1,
      escalateTo: 'human_agent',
      timeoutSeconds: 60,
    },
    context: {
      memoryWindow: 10,
      persistAcrossSessions: false,
      contextVariables: ['tech_stack'],
      shareContextWithAgents: true,
    },
    guardrails: [],
    createdAt: '2024-03-05',
    updatedAt: '2024-05-15',
  },
  {
    id: 'agent-4',
    name: 'Knowledge Base Agent',
    description: 'Retrieves and summarizes answers from documents, FAQs, and knowledge base articles.',
    type: 'agent',
    superAgentId: 'super-1',
    status: 'active',
    businessCapability: 'Knowledge Retrieval & FAQ',
    priorityScore: 60,
    allowedChannels: ['chat'],
    escalationAllowed: false,
    timezone: 'UTC',
    interruptible: false,
    expressiveMode: false,
    defaultPersonality: true,
    firstMessage: 'I can help you find the information you need.',
    disclosureRequirements: '',
    voices: [],
    languages: ['English'],
    llmProvider: 'Google',
    persona: {
      tone: 'formal',
      style: 'Informative and precise',
      adaptability: 50,
      greeting: 'I can help you find the information you need.',
      personality: 'Accurate, thorough, and well-organized. Provides sourced answers with references.',
      verbosityLevel: 40,
      riskTolerance: 'low',
      domainExpertiseLevel: 'intermediate',
      empathyLevel: 40,
      brandVoiceProfile: 'Informative and precise',
    },
    intents: [
      { id: 'i1', name: 'FAQ Query', description: 'Common questions', examples: ['What are your hours?', 'Return policy'], isActive: true },
      { id: 'i2', name: 'Documentation Search', description: 'Looking for documentation', examples: ['Where can I find docs?', 'User guide'], isActive: true },
    ],
    triggers: [
      { id: 't1', type: 'intent', value: 'faq', description: 'FAQ and general knowledge queries', isActive: true },
    ],
    prompt: {
      systemPrompt: 'You are a knowledge base assistant. Retrieve accurate information from the company knowledge base and present it clearly with source references.',
      fewShotExamples: [],
      temperature: 0.3,
      maxTokens: 512,
      model: 'gpt-4',
    },
    variables: [],
    routing: { mode: 'manual', rules: [], defaultAgentId: undefined },
    fallback: {
      action: 'custom_message',
      maxRetries: 1,
      customMessage: 'I couldn\'t find specific information about that. Would you like me to connect you with a support agent?',
      timeoutSeconds: 30,
    },
    context: {
      memoryWindow: 5,
      persistAcrossSessions: false,
      contextVariables: [],
      shareContextWithAgents: false,
    },
    guardrails: [
      { id: 'g1', type: 'topic_restriction', name: 'Knowledge Scope', description: 'Only answer from verified knowledge base content', isActive: true, severity: 'medium', action: 'block' },
    ],
    createdAt: '2024-04-01',
    updatedAt: '2024-06-01',
  },
];

export function useAIAgentsData() {
  const [agents, setAgents] = useState<AIAgent[]>(generateMockAgents());
  const [isLoading, setIsLoading] = useState(false);

  const superAgents = agents.filter(a => a.type === 'super_agent');
  const childAgents = agents.filter(a => a.type === 'agent');

  const getAgentsBySuper = useCallback((superAgentId: string) => {
    return agents.filter(a => a.superAgentId === superAgentId);
  }, [agents]);

  const getAgentById = useCallback((id: string) => {
    return agents.find(a => a.id === id);
  }, [agents]);

  const hasSuperAgent = superAgents.length > 0;

  const addAgent = useCallback(async (agentData: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (agentData.type === 'super_agent' && agents.some(a => a.type === 'super_agent')) {
      throw new Error('Only one Super Agent is allowed. The default Super Agent cannot be duplicated.');
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newAgent: AIAgent = {
      ...agentData,
      id: `agent-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setAgents(prev => [...prev, newAgent]);
    setIsLoading(false);
    return newAgent;
  }, [agents]);

  const updateAgent = useCallback(async (agentId: string, agentData: Partial<AIAgent>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId
          ? { ...agent, ...agentData, updatedAt: new Date().toISOString().split('T')[0] }
          : agent
      )
    );
    setIsLoading(false);
  }, []);

  const deleteAgent = useCallback(async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (agent?.type === 'super_agent') {
      throw new Error('The default Super Agent cannot be deleted.');
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
    setIsLoading(false);
  }, [agents]);

  const toggleAgentStatus = useCallback((agentId: string) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId
          ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
          : agent
      )
    );
  }, []);

  const duplicateAgent = useCallback(async (agentId: string) => {
    const original = agents.find(a => a.id === agentId);
    if (!original) return null;
    if (original.type === 'super_agent') {
      throw new Error('The default Super Agent cannot be duplicated.');
    }
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newAgent: AIAgent = {
      ...original,
      id: `agent-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setAgents(prev => [...prev, newAgent]);
    setIsLoading(false);
    return newAgent;
  }, [agents]);

  return {
    agents,
    superAgents,
    childAgents,
    isLoading,
    hasSuperAgent,
    getAgentsBySuper,
    getAgentById,
    addAgent,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
    duplicateAgent,
  };
}
