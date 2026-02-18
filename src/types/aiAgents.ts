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

export interface VoiceConfig {
  id: string;
  name: string;
  provider: string;
  isPrimary: boolean;
}

export interface CallSettings {
  maxDuration: string;
  inactivityDuration: string;
  timezone: string;
  noiseFiltering: boolean;
  voicemailDetection: boolean;
  leaveVoicemail: boolean;
  retry: boolean;
  silenceIntro: boolean;
  silenceSpeaking: boolean;
  backgroundAudio: boolean;
  gracefulExit: boolean;
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
  callSettings?: CallSettings;
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
export type VoiceAge = 'child' | 'teen' | 'adult' | 'senior';
export type VoiceAccent = 'us_english' | 'uk_english' | 'indian_english' | 'australian' | 'african_english' | 'middle_eastern_english' | 'neutral';
export type VoiceStyleTone = 'cheerful' | 'calm' | 'professional' | 'friendly' | 'serious' | 'energetic' | 'authoritative' | 'supportive' | 'whispery' | 'conversational' | 'high_energy_sales' | 'empathetic';
export type VoiceClarity = 'softened' | 'balanced' | 'crisp';
export type VoiceSpeakingRate = 'slow' | 'normal' | 'fast' | 'very_fast';
export type VoiceEmotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'confident' | 'excited' | 'apologetic' | 'analytical';
export type VoicePauseLength = 'short' | 'medium' | 'long';
export type VoiceFallbackTone = 'professional' | 'apologetic' | 'neutral' | 'informal';

export interface VoiceProfile {
  gender: VoiceGender;
  age: VoiceAge;
  accent: VoiceAccent;
  styleTone: VoiceStyleTone;
  pitch: number;
  speakingRate: VoiceSpeakingRate;
  stability: number;
  clarity: VoiceClarity;
  expressiveness: number;
  breathiness: number;
  warmth: number;
  emotion: VoiceEmotion;
  emotionStrength: number;
  pauseLength: VoicePauseLength;
  fillersEnabled: boolean;
  interruptible: boolean;
  fallbackTone: VoiceFallbackTone;
  speed: number;
  similarity: number;
  customPronunciations: { word: string; pronunciation: string }[];
}

export const VOICE_GENDER_LABELS: Record<VoiceGender, string> = {
  male: 'Male',
  female: 'Female',
  neutral: 'Neutral / Androgynous',
};

export const VOICE_AGE_LABELS: Record<VoiceAge, string> = {
  child: 'Child',
  teen: 'Teen',
  adult: 'Adult',
  senior: 'Senior',
};

export const VOICE_ACCENT_LABELS: Record<VoiceAccent, string> = {
  us_english: 'US English',
  uk_english: 'UK English',
  indian_english: 'Indian English',
  australian: 'Australian English',
  african_english: 'African English',
  middle_eastern_english: 'Middle Eastern English',
  neutral: 'Neutral / Standard',
};

export const VOICE_STYLE_TONE_LABELS: Record<VoiceStyleTone, string> = {
  cheerful: 'Cheerful',
  calm: 'Calm',
  professional: 'Professional',
  friendly: 'Friendly',
  serious: 'Serious',
  energetic: 'Energetic',
  authoritative: 'Authoritative',
  supportive: 'Supportive',
  whispery: 'Whispery',
  conversational: 'Conversational',
  high_energy_sales: 'High-energy Sales',
  empathetic: 'Empathetic',
};

export const VOICE_CLARITY_LABELS: Record<VoiceClarity, string> = {
  softened: 'Softened',
  balanced: 'Balanced',
  crisp: 'Crisp',
};

export const VOICE_SPEAKING_RATE_LABELS: Record<VoiceSpeakingRate, string> = {
  slow: 'Slow',
  normal: 'Normal',
  fast: 'Fast',
  very_fast: 'Very Fast',
};

export const VOICE_EMOTION_LABELS: Record<VoiceEmotion, string> = {
  neutral: 'Neutral',
  happy: 'Happy',
  sad: 'Sad',
  angry: 'Angry',
  confident: 'Confident',
  excited: 'Excited',
  apologetic: 'Apologetic',
  analytical: 'Analytical',
};

export const VOICE_PAUSE_LABELS: Record<VoicePauseLength, string> = {
  short: 'Short',
  medium: 'Medium',
  long: 'Long',
};

export const VOICE_FALLBACK_TONE_LABELS: Record<VoiceFallbackTone, string> = {
  professional: 'Professional',
  apologetic: 'Apologetic',
  neutral: 'Neutral',
  informal: 'Informal',
};

export const DEFAULT_VOICE_PROFILE: VoiceProfile = {
  gender: 'female',
  age: 'adult',
  accent: 'us_english',
  styleTone: 'professional',
  pitch: 50,
  speakingRate: 'normal',
  stability: 70,
  clarity: 'balanced',
  expressiveness: 60,
  breathiness: 20,
  warmth: 65,
  emotion: 'neutral',
  emotionStrength: 50,
  pauseLength: 'medium',
  fillersEnabled: false,
  interruptible: true,
  fallbackTone: 'professional',
  speed: 75,
  similarity: 85,
  customPronunciations: [],
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
