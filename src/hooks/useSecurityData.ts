import { useState, useCallback } from 'react';
import type {
  ConsentSettings,
  GDPRSettings,
  DataRetentionSettings,
  ZeroRetentionSettings,
  SSOSettings,
  RBACSettings,
  PIIProtectionSettings,
  ModerationRule,
  AuditLogEntry,
} from '@/types/security';

const mockConsentSettings: ConsentSettings = {
  cookieConsent: true,
  marketingConsent: false,
  analyticsConsent: true,
  thirdPartySharing: false,
  consentBannerEnabled: true,
  consentExpiryDays: 365,
};

const mockGDPRSettings: GDPRSettings = {
  dataPortabilityEnabled: true,
  rightToErasureEnabled: true,
  dataProcessingAgreement: true,
  dpoEmail: 'dpo@company.com',
  dataResidency: 'eu',
  subProcessorList: ['AWS', 'Google Cloud', 'Twilio', 'SendGrid'],
};

const mockDataRetention: DataRetentionSettings = {
  conversationRetentionDays: 90,
  logRetentionDays: 365,
  backupRetentionDays: 730,
  autoDeleteEnabled: true,
  maskPII: true,
  maskCreditCards: true,
  maskPhoneNumbers: true,
  maskEmails: false,
  maskSSN: true,
};

const mockZeroRetention: ZeroRetentionSettings = {
  enabled: false,
  scope: 'pii_only',
  realTimeProcessingOnly: false,
  noLogsMode: false,
  excludeAuditLogs: true,
};

const mockSSOSettings: SSOSettings = {
  enabled: false,
  provider: 'none',
  entityId: '',
  ssoUrl: '',
  certificate: '',
  enforceSSO: false,
  allowPasswordFallback: true,
  autoProvision: false,
  defaultRole: 'agent',
  domains: ['company.com'],
  sessionTimeout: 480,
};

const mockRBACSettings: RBACSettings = {
  enabled: true,
  enforceIPRestriction: false,
  allowedIPs: [],
  requireMFA: false,
  mfaMethod: 'none',
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    expiryDays: 90,
    preventReuse: 5,
  },
  sessionPolicy: {
    maxConcurrentSessions: 3,
    idleTimeoutMinutes: 30,
    absoluteTimeoutHours: 12,
  },
};

const mockPIIProtection: PIIProtectionSettings = {
  enabled: true,
  autoDetect: true,
  detectionTypes: {
    names: true,
    emails: true,
    phones: true,
    addresses: true,
    ssn: true,
    creditCards: true,
    dateOfBirth: false,
    medicalRecords: false,
  },
  action: 'redact',
  notifyOnDetection: true,
  logDetections: true,
};

const mockModerationRules: ModerationRule[] = [
  {
    id: 'rule-1',
    name: 'Profanity Filter',
    type: 'profanity',
    action: 'redact',
    severity: 'medium',
    isActive: true,
  },
  {
    id: 'rule-3',
    name: 'Spam Detection',
    type: 'spam',
    action: 'flag',
    severity: 'low',
    isActive: true,
  },
  {
    id: 'rule-4',
    name: 'Hate Speech Filter',
    type: 'hate_speech',
    action: 'block',
    severity: 'high',
    isActive: true,
  },
  {
    id: 'rule-5',
    name: 'Competitor Mentions',
    type: 'custom',
    action: 'flag',
    severity: 'low',
    isActive: false,
    customPattern: 'competitor|rival|alternative',
  },
];

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: '2025-02-02T10:30:00Z',
    userId: 'user-1',
    userName: 'John Admin',
    action: 'settings.update',
    resource: 'GDPR Settings',
    details: 'Updated data residency to EU',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log-2',
    timestamp: '2025-02-02T09:15:00Z',
    userId: 'user-2',
    userName: 'Sarah Manager',
    action: 'user.create',
    resource: 'User Management',
    details: 'Created new user: mike@company.com',
    ipAddress: '192.168.1.101',
    status: 'success',
  },
  {
    id: 'log-3',
    timestamp: '2025-02-02T08:45:00Z',
    userId: 'user-1',
    userName: 'John Admin',
    action: 'api_key.revoke',
    resource: 'API Keys',
    details: 'Revoked API key: Production Key',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log-4',
    timestamp: '2025-02-01T16:20:00Z',
    userId: 'user-3',
    userName: 'Unknown User',
    action: 'auth.login',
    resource: 'Authentication',
    details: 'Failed login attempt',
    ipAddress: '203.0.113.50',
    status: 'failure',
  },
  {
    id: 'log-5',
    timestamp: '2025-02-01T14:00:00Z',
    userId: 'user-2',
    userName: 'Sarah Manager',
    action: 'sso.configure',
    resource: 'SSO Settings',
    details: 'Configured SAML SSO provider',
    ipAddress: '192.168.1.101',
    status: 'success',
  },
  {
    id: 'log-6',
    timestamp: '2025-02-01T11:30:00Z',
    userId: 'user-1',
    userName: 'John Admin',
    action: 'data.export',
    resource: 'Data Export',
    details: 'Exported customer data for GDPR request',
    ipAddress: '192.168.1.100',
    status: 'success',
  },
  {
    id: 'log-7',
    timestamp: '2025-02-01T10:00:00Z',
    userId: 'system',
    userName: 'System',
    action: 'retention.execute',
    resource: 'Data Retention',
    details: 'Auto-deleted 1,247 expired conversations',
    ipAddress: '10.0.0.1',
    status: 'success',
  },
  {
    id: 'log-8',
    timestamp: '2025-01-31T18:45:00Z',
    userId: 'user-4',
    userName: 'Mike Developer',
    action: 'rbac.update',
    resource: 'RBAC Settings',
    details: 'Updated password policy requirements',
    ipAddress: '192.168.1.105',
    status: 'success',
  },
];

export function useSecurityData() {
  const [consentSettings, setConsentSettings] = useState<ConsentSettings>(mockConsentSettings);
  const [gdprSettings, setGDPRSettings] = useState<GDPRSettings>(mockGDPRSettings);
  const [dataRetention, setDataRetention] = useState<DataRetentionSettings>(mockDataRetention);
  const [zeroRetention, setZeroRetention] = useState<ZeroRetentionSettings>(mockZeroRetention);
  const [ssoSettings, setSSOSettings] = useState<SSOSettings>(mockSSOSettings);
  const [rbacSettings, setRBACSettings] = useState<RBACSettings>(mockRBACSettings);
  const [piiProtection, setPIIProtection] = useState<PIIProtectionSettings>(mockPIIProtection);
  const [moderationRules, setModerationRules] = useState<ModerationRule[]>(mockModerationRules);
  const [auditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [isSaving, setIsSaving] = useState(false);

  const saveSettings = useCallback(async (): Promise<{ success: boolean }> => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    return { success: true };
  }, []);

  const exportAuditLogs = useCallback(async (): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true };
  }, []);

  const toggleModerationRule = useCallback((ruleId: string) => {
    setModerationRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  }, []);

  const updateModerationRule = useCallback((ruleId: string, updates: Partial<ModerationRule>) => {
    setModerationRules(prev =>
      prev.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  }, []);

  return {
    consentSettings,
    setConsentSettings,
    gdprSettings,
    setGDPRSettings,
    dataRetention,
    setDataRetention,
    zeroRetention,
    setZeroRetention,
    ssoSettings,
    setSSOSettings,
    rbacSettings,
    setRBACSettings,
    piiProtection,
    setPIIProtection,
    moderationRules,
    auditLogs,
    isSaving,
    saveSettings,
    exportAuditLogs,
    toggleModerationRule,
    updateModerationRule,
  };
}
