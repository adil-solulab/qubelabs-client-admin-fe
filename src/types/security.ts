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

export interface ZeroRetentionSettings {
  enabled: boolean;
  scope: 'all' | 'pii_only' | 'conversations_only';
  realTimeProcessingOnly: boolean;
  noLogsMode: boolean;
  excludeAuditLogs: boolean;
}

export interface SSOSettings {
  enabled: boolean;
  provider: 'saml' | 'oidc' | 'azure_ad' | 'okta' | 'google' | 'none';
  entityId: string;
  ssoUrl: string;
  certificate: string;
  enforceSSO: boolean;
  allowPasswordFallback: boolean;
  autoProvision: boolean;
  defaultRole: 'agent' | 'supervisor' | 'client_admin';
  domains: string[];
  sessionTimeout: number;
}

export interface RBACSettings {
  enabled: boolean;
  enforceIPRestriction: boolean;
  allowedIPs: string[];
  requireMFA: boolean;
  mfaMethod: 'totp' | 'sms' | 'email' | 'none';
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    preventReuse: number;
  };
  sessionPolicy: {
    maxConcurrentSessions: number;
    idleTimeoutMinutes: number;
    absoluteTimeoutHours: number;
  };
}

export interface PIIProtectionSettings {
  enabled: boolean;
  autoDetect: boolean;
  detectionTypes: {
    names: boolean;
    emails: boolean;
    phones: boolean;
    addresses: boolean;
    ssn: boolean;
    creditCards: boolean;
    dateOfBirth: boolean;
    medicalRecords: boolean;
  };
  action: 'redact' | 'mask' | 'hash' | 'tokenize';
  notifyOnDetection: boolean;
  logDetections: boolean;
}

export interface ModerationRule {
  id: string;
  name: string;
  type: 'profanity' | 'spam' | 'hate_speech' | 'custom';
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

export const SSO_PROVIDERS = {
  none: { label: 'Not Configured', icon: '⚪' },
  saml: { label: 'SAML 2.0', icon: '🔐' },
  oidc: { label: 'OpenID Connect', icon: '🌐' },
  azure_ad: { label: 'Azure Active Directory', icon: '☁️' },
  okta: { label: 'Okta', icon: '🔑' },
  google: { label: 'Google Workspace', icon: '🅖' },
};
