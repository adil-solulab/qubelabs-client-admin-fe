export type AgentType = 'super_agent' | 'agent';
export type AgentStatus = 'active' | 'inactive' | 'draft';
export type ToneLevel = 'formal' | 'friendly' | 'casual' | 'empathetic' | 'persuasive';
export type TriggerType = 'intent' | 'keyword' | 'event' | 'schedule' | 'api';
export type RoutingMode = 'auto' | 'manual' | 'round_robin';
export type FallbackAction = 'escalate' | 'retry' | 'transfer' | 'end' | 'custom_message';
export type GuardrailType = 'content_filter' | 'pii_protection' | 'topic_restriction' | 'response_length' | 'language_filter' | 'custom';
export type VariableType = 'string' | 'number' | 'boolean' | 'date' | 'email' | 'phone' | 'custom';

export type ChannelType = 'voice' | 'chat' | 'email' | 'whatsapp' | 'sms';

export const CHANNEL_LABELS: Record<ChannelType, string> = {
  voice: 'Voice',
  chat: 'Chat',
  email: 'Email',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
};

export interface AgentPersona {
  tone: ToneLevel;
  style: string;
  adaptability: number;
  greeting: string;
  personality: string;
  verbosityLevel: number;
  riskTolerance: 'low' | 'medium' | 'high';
  domainExpertiseLevel: 'beginner' | 'intermediate' | 'expert';
  empathyLevel: number;
  brandVoiceProfile: string;
}

export interface IntentConfig {
  id: string;
  name: string;
  description: string;
  examples: string[];
  isActive: boolean;
}

export interface TriggerConfig {
  id: string;
  type: TriggerType;
  value: string;
  description: string;
  isActive: boolean;
}

export interface PromptConfig {
  systemPrompt: string;
  fewShotExamples: FewShotExample[];
  temperature: number;
  maxTokens: number;
  model: string;
}

export interface FewShotExample {
  id: string;
  userMessage: string;
  assistantResponse: string;
}

export interface VariableConfig {
  id: string;
  name: string;
  type: VariableType;
  description: string;
  required: boolean;
  defaultValue?: string;
  validationRule?: string;
}

export interface RoutingRule {
  id: string;
  condition: string;
  targetAgentId: string;
  priority: number;
}

export interface RoutingConfig {
  mode: RoutingMode;
  rules: RoutingRule[];
  defaultAgentId?: string;
}

export interface FallbackConfig {
  action: FallbackAction;
  maxRetries: number;
  customMessage?: string;
  escalateTo?: string;
  timeoutSeconds: number;
}

export interface ContextConfig {
  memoryWindow: number;
  persistAcrossSessions: boolean;
  contextVariables: string[];
  shareContextWithAgents: boolean;
}

export interface GuardrailConfig {
  id: string;
  type: GuardrailType;
  name: string;
  description: string;
  isActive: boolean;
  severity: 'low' | 'medium' | 'high';
  action: 'warn' | 'block' | 'flag';
}

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  superAgentId?: string;
  status: AgentStatus;
  businessCapability: string;
  priorityScore: number;
  allowedChannels: ChannelType[];
  escalationAllowed: boolean;
  persona: AgentPersona;
  intents: IntentConfig[];
  triggers: TriggerConfig[];
  prompt: PromptConfig;
  variables: VariableConfig[];
  routing: RoutingConfig;
  fallback: FallbackConfig;
  context: ContextConfig;
  guardrails: GuardrailConfig[];
  createdAt: string;
  updatedAt: string;
}

export const TONE_LABELS: Record<ToneLevel, string> = {
  formal: 'Formal',
  friendly: 'Friendly',
  casual: 'Casual',
  empathetic: 'Empathetic',
  persuasive: 'Persuasive',
};

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  intent: 'Intent Match',
  keyword: 'Keyword',
  event: 'Event',
  schedule: 'Schedule',
  api: 'API Call',
};

export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  string: 'Text',
  number: 'Number',
  boolean: 'Yes/No',
  date: 'Date',
  email: 'Email',
  phone: 'Phone',
  custom: 'Custom',
};

export const GUARDRAIL_TYPE_LABELS: Record<GuardrailType, string> = {
  content_filter: 'Content Filter',
  pii_protection: 'PII Protection',
  topic_restriction: 'Topic Restriction',
  response_length: 'Response Length',
  language_filter: 'Language Filter',
  custom: 'Custom Rule',
};

export const FALLBACK_ACTION_LABELS: Record<FallbackAction, string> = {
  escalate: 'Escalate to Human',
  retry: 'Retry',
  transfer: 'Transfer to Agent',
  end: 'End Conversation',
  custom_message: 'Custom Message',
};

export type PersonaType = 'sales' | 'support' | 'custom';

export interface Persona {
  id: string;
  name: string;
  type: PersonaType;
  description: string;
  systemPrompt: string;
  fewShotExamples: FewShotExample[];
  toneSettings: {
    primary: ToneLevel;
    adaptability: number;
    voiceStyle: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentTask {
  id: string;
  name: string;
  personaId: string;
  order: number;
  condition?: string;
  description: string;
}

export interface TaskSequence {
  id: string;
  name: string;
  description: string;
  tasks: AgentTask[];
  isActive: boolean;
}

export const PERSONA_TYPE_LABELS: Record<PersonaType, string> = {
  sales: 'Sales',
  support: 'Support',
  custom: 'Custom',
};

export const DEFAULT_PERSONAS: Partial<Persona>[] = [
  {
    type: 'sales',
    name: 'Sales Agent',
    description: 'Polite and persuasive sales representative focused on conversions',
    toneSettings: {
      primary: 'persuasive',
      adaptability: 75,
      voiceStyle: 'Confident and engaging',
    },
  },
  {
    type: 'support',
    name: 'Support Agent',
    description: 'Empathetic customer support specialist focused on resolution',
    toneSettings: {
      primary: 'empathetic',
      adaptability: 85,
      voiceStyle: 'Warm and understanding',
    },
  },
];
