export type ChannelType = 'voice' | 'chat' | 'email';

export interface VoiceConfig {
  enabled: boolean;
  inboundEnabled: boolean;
  outboundEnabled: boolean;
  webRtcEnabled: boolean;
  phoneNumber: string;
  welcomeMessage: string;
  holdMusic: 'default' | 'classical' | 'jazz' | 'none';
  maxQueueTime: number;
  dtmf: {
    enabled: boolean;
    options: DTMFOption[];
  };
  voiceProvider: 'elevenlabs' | 'google' | 'amazon';
  voiceId: string;
}

export interface DTMFOption {
  key: string;
  action: string;
  destination: string;
}

export interface ChatConfig {
  enabled: boolean;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    headerColor: string;
    textColor: string;
    borderRadius: 'none' | 'small' | 'medium' | 'large';
  };
  typography: {
    fontFamily: 'inter' | 'roboto' | 'opensans' | 'lato';
    fontSize: 'small' | 'medium' | 'large';
    headerSize: 'small' | 'medium' | 'large';
  };
  botIcon: string;
  botName: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  initialMessage: string;
  inputPlaceholder: string;
  showTypingIndicator: boolean;
  showTimestamps: boolean;
  enableFileUpload: boolean;
  enableEmoji: boolean;
}

export interface EmailConfig {
  enabled: boolean;
  aiReplies: {
    enabled: boolean;
    autoReply: boolean;
    replyDelay: number;
    tone: 'formal' | 'friendly' | 'neutral';
    signatureEnabled: boolean;
    signature: string;
  };
  summaries: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    includeMetrics: boolean;
  };
  routing: {
    enabled: boolean;
    rules: RoutingRule[];
    defaultAssignee: string;
  };
  allowedDomains: string[];
  blockedDomains: string[];
}

export interface RoutingRule {
  id: string;
  name: string;
  condition: 'subject_contains' | 'from_domain' | 'priority' | 'sentiment';
  value: string;
  action: 'assign_to' | 'add_tag' | 'set_priority' | 'auto_reply';
  target: string;
  enabled: boolean;
}

export const FONT_FAMILIES = {
  inter: 'Inter',
  roboto: 'Roboto',
  opensans: 'Open Sans',
  lato: 'Lato',
};

export const VOICE_PROVIDERS = {
  elevenlabs: 'ElevenLabs',
  google: 'Google TTS',
  amazon: 'Amazon Polly',
};
