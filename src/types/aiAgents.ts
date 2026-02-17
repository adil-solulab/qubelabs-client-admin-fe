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

export type VoiceCategory = 'conversational' | 'narration' | 'characters' | 'news' | 'meditation';
export type VoiceProviderType = 'ElevenLabs' | 'Google Cloud' | 'Amazon Polly' | 'Azure Speech' | 'OpenAI';

export interface VoiceConfig {
  id: string;
  name: string;
  provider: string;
  isPrimary: boolean;
  gender?: 'male' | 'female' | 'non-binary';
  accent?: string;
  category?: VoiceCategory;
  description?: string;
  tags?: string[];
  useCase?: string;
  sampleText?: string;
  age?: 'young' | 'middle-aged' | 'mature';
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
  timezone: string;
  interruptible: boolean;
  expressiveMode: boolean;
  defaultPersonality: boolean;
  firstMessage: string;
  disclosureRequirements: string;
  voices: VoiceConfig[];
  voiceProfile?: VoiceProfile;
  languages: string[];
  llmProvider: string;
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

export const LLM_PROVIDERS: Record<string, string[]> = {
  'OpenAI': ['GPT-4o', 'GPT-4 Turbo', 'GPT-4', 'GPT-3.5 Turbo'],
  'Anthropic': ['Claude 4 Opus', 'Claude 4 Sonnet', 'Claude 3.5 Haiku'],
  'Google': ['Gemini 2.5 Flash', 'Gemini 2.5 Pro', 'Gemini 2.0 Flash'],
  'Meta': ['Llama 3.1 405B', 'Llama 3.1 70B'],
};

export const VOICE_OPTIONS: VoiceConfig[] = [
  { id: 'v-eric', name: 'Eric', provider: 'ElevenLabs', isPrimary: true, gender: 'male', accent: 'American', category: 'conversational', description: 'Smooth, trustworthy mid-range voice perfect for customer interactions', tags: ['smooth', 'trustworthy', 'professional'], useCase: 'Customer Service, Sales', age: 'middle-aged', sampleText: 'Hello, thank you for calling. How may I assist you today?' },
  { id: 'v-sarah', name: 'Sarah', provider: 'ElevenLabs', isPrimary: false, gender: 'female', accent: 'American', category: 'conversational', description: 'Warm, professional voice with natural cadence and clarity', tags: ['warm', 'professional', 'clear'], useCase: 'Support, Onboarding', age: 'middle-aged', sampleText: 'I am happy to help you with that. Let me look into it right away.' },
  { id: 'v-adam', name: 'Adam', provider: 'ElevenLabs', isPrimary: false, gender: 'male', accent: 'American', category: 'narration', description: 'Deep, authoritative voice that commands attention and trust', tags: ['deep', 'authoritative', 'commanding'], useCase: 'Announcements, IVR', age: 'mature', sampleText: 'Welcome to our platform. Your security and satisfaction are our top priorities.' },
  { id: 'v-rachel', name: 'Rachel', provider: 'ElevenLabs', isPrimary: false, gender: 'female', accent: 'American', category: 'conversational', description: 'Friendly, upbeat voice with natural warmth and energy', tags: ['friendly', 'upbeat', 'energetic'], useCase: 'Sales, Marketing', age: 'young', sampleText: 'Great news! I have some exciting options for you today.' },
  { id: 'v-josh', name: 'Josh', provider: 'ElevenLabs', isPrimary: false, gender: 'male', accent: 'American', category: 'meditation', description: 'Calm, reassuring voice ideal for sensitive or support conversations', tags: ['calm', 'reassuring', 'soothing'], useCase: 'Healthcare, Wellness', age: 'middle-aged', sampleText: 'Take your time. I am here to help whenever you are ready.' },
  { id: 'v-emily', name: 'Emily', provider: 'ElevenLabs', isPrimary: false, gender: 'female', accent: 'British', category: 'news', description: 'Energetic, clear voice with a British accent and crisp delivery', tags: ['energetic', 'clear', 'articulate'], useCase: 'News, Reports', age: 'young', sampleText: 'Here is your latest update with all the details you need.' },
  { id: 'v-marcus', name: 'Marcus', provider: 'ElevenLabs', isPrimary: false, gender: 'male', accent: 'British', category: 'narration', description: 'Rich, sophisticated voice with British elegance and warmth', tags: ['rich', 'sophisticated', 'elegant'], useCase: 'Finance, Legal', age: 'mature', sampleText: 'Allow me to walk you through the details of your account.' },
  { id: 'v-priya', name: 'Priya', provider: 'ElevenLabs', isPrimary: false, gender: 'female', accent: 'Indian', category: 'conversational', description: 'Articulate, patient voice with gentle Indian accent', tags: ['articulate', 'patient', 'gentle'], useCase: 'Tech Support, Education', age: 'middle-aged', sampleText: 'Let me guide you through the process step by step.' },
  { id: 'v-carlos', name: 'Carlos', provider: 'ElevenLabs', isPrimary: false, gender: 'male', accent: 'Neutral', category: 'characters', description: 'Versatile, expressive voice with strong emotional range', tags: ['versatile', 'expressive', 'dynamic'], useCase: 'Interactive, Gaming', age: 'young', sampleText: 'This is going to be an amazing experience. Let us get started!' },
  { id: 'v-olivia', name: 'Olivia', provider: 'Google Cloud', isPrimary: false, gender: 'female', accent: 'Australian', category: 'conversational', description: 'Bright, approachable voice with Australian warmth', tags: ['bright', 'approachable', 'friendly'], useCase: 'Hospitality, Travel', age: 'young', sampleText: 'Welcome! Let me help you plan something wonderful.' },
  { id: 'v-james', name: 'James', provider: 'Azure Speech', isPrimary: false, gender: 'male', accent: 'American', category: 'news', description: 'Confident, measured voice ideal for professional communications', tags: ['confident', 'measured', 'professional'], useCase: 'Corporate, Training', age: 'middle-aged', sampleText: 'Let us review the key points from today is discussion.' },
  { id: 'v-aria', name: 'Aria', provider: 'OpenAI', isPrimary: false, gender: 'female', accent: 'Neutral', category: 'conversational', description: 'Natural, balanced voice with exceptional clarity and warmth', tags: ['natural', 'balanced', 'clear'], useCase: 'General Purpose, Assistants', age: 'middle-aged', sampleText: 'I am here to help you with whatever you need.' },
  { id: 'v-kai', name: 'Kai', provider: 'ElevenLabs', isPrimary: false, gender: 'non-binary', accent: 'Neutral', category: 'meditation', description: 'Gentle, androgynous voice with a calming, inclusive quality', tags: ['gentle', 'calming', 'inclusive'], useCase: 'Wellness, Accessibility', age: 'young', sampleText: 'Breathe in, breathe out. You are doing great.' },
  { id: 'v-sofia', name: 'Sofia', provider: 'Amazon Polly', isPrimary: false, gender: 'female', accent: 'Neutral', category: 'narration', description: 'Smooth, polished voice with great tonal control', tags: ['smooth', 'polished', 'controlled'], useCase: 'E-Learning, Audiobooks', age: 'middle-aged', sampleText: 'In this section, we will explore the fundamentals of the topic.' },
];

export const VOICE_CATEGORY_LABELS: Record<VoiceCategory, string> = {
  conversational: 'Conversational',
  narration: 'Narration',
  characters: 'Characters',
  news: 'News & Reports',
  meditation: 'Meditation & Calm',
};

export const LANGUAGE_OPTIONS = [
  'English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian',
  'Dutch', 'Japanese', 'Chinese (Mandarin)', 'Korean', 'Arabic', 'Hindi',
  'Russian', 'Turkish', 'Polish', 'Swedish', 'Thai', 'Vietnamese',
];

export const TIMEZONE_OPTIONS = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland',
];

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

export type VoiceGender = 'male' | 'female' | 'neutral';
export type VoiceAge = 'young' | 'middle_aged' | 'old';
export type VoiceAccent = 'american' | 'british' | 'australian' | 'indian' | 'neutral';

export interface VoiceProfile {
  gender: VoiceGender;
  age: VoiceAge;
  accent: VoiceAccent;
  pitch: number;
  speed: number;
  stability: number;
  clarity: number;
  expressiveness: number;
  breathiness: number;
  warmth: number;
}

export const VOICE_GENDER_LABELS: Record<VoiceGender, string> = {
  male: 'Male',
  female: 'Female',
  neutral: 'Neutral / Androgynous',
};

export const VOICE_AGE_LABELS: Record<VoiceAge, string> = {
  young: 'Young',
  middle_aged: 'Middle Aged',
  old: 'Mature',
};

export const VOICE_ACCENT_LABELS: Record<VoiceAccent, string> = {
  american: 'American English',
  british: 'British English',
  australian: 'Australian English',
  indian: 'Indian English',
  neutral: 'Neutral / Standard',
};

export const DEFAULT_VOICE_PROFILE: VoiceProfile = {
  gender: 'female',
  age: 'middle_aged',
  accent: 'american',
  pitch: 50,
  speed: 50,
  stability: 70,
  clarity: 75,
  expressiveness: 60,
  breathiness: 20,
  warmth: 65,
};

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
  voiceProfile?: VoiceProfile;
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
