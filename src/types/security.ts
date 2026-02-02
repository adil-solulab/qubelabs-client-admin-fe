export interface ConsentSettings {
  cookieConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  thirdPartySharing: boolean;
  consentBannerEnabled: boolean;
  consentExpiryDays: number;
}

export interface GDPRSettings {
  dataPortabilityEnabled: boolean;
  rightToErasureEnabled: boolean;
  dataProcessingAgreement: boolean;
  dpoEmail: string;
  dataResidency: 'us' | 'eu' | 'asia';
  subProcessorList: string[];
}

export interface DataRetentionSettings {
  conversationRetentionDays: number;
  logRetentionDays: number;
  backupRetentionDays: number;
  autoDeleteEnabled: boolean;
  maskPII: boolean;
  maskCreditCards: boolean;
  maskPhoneNumbers: boolean;
  maskEmails: boolean;
  maskSSN: boolean;
}

export interface ModerationRule {
  id: string;
  name: string;
  type: 'profanity' | 'pii' | 'spam' | 'hate_speech' | 'custom';
  action: 'block' | 'flag' | 'redact' | 'warn';
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  customPattern?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
}

export const MODERATION_TYPES = {
  profanity: { label: 'Profanity Filter', icon: '🤬' },
  pii: { label: 'PII Detection', icon: '🔐' },
  spam: { label: 'Spam Detection', icon: '📧' },
  hate_speech: { label: 'Hate Speech', icon: '🚫' },
  custom: { label: 'Custom Rule', icon: '⚙️' },
};

export const MODERATION_ACTIONS = {
  block: { label: 'Block Message', color: 'text-destructive' },
  flag: { label: 'Flag for Review', color: 'text-warning' },
  redact: { label: 'Redact Content', color: 'text-primary' },
  warn: { label: 'Warn User', color: 'text-muted-foreground' },
};
