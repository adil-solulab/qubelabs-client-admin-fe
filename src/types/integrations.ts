export type IntegrationCategory = 'communication' | 'crm' | 'support' | 'messaging';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type AuthType = 'oauth' | 'api_key' | 'webhook';

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon: string;
  status: IntegrationStatus;
  authType: AuthType;
  connectedAt?: string;
  lastSync?: string;
  settings?: Record<string, any>;
  features: string[];
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  permissions: string[];
  isActive: boolean;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
  lastTriggered?: string;
}

export const CATEGORY_CONFIG: Record<IntegrationCategory, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  communication: { label: 'Communication', color: 'text-primary', bgColor: 'bg-primary/10' },
  crm: { label: 'CRM', color: 'text-success', bgColor: 'bg-success/10' },
  support: { label: 'Support', color: 'text-warning', bgColor: 'bg-warning/10' },
  messaging: { label: 'Messaging', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
};

export const STATUS_CONFIG: Record<IntegrationStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  connected: { label: 'Connected', color: 'text-success', bgColor: 'bg-success/10' },
  disconnected: { label: 'Not Connected', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  error: { label: 'Error', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  pending: { label: 'Pending', color: 'text-warning', bgColor: 'bg-warning/10' },
};

export const INTEGRATION_ICONS: Record<string, string> = {
  twilio: '📞',
  whatsapp: '💬',
  gmail: '📧',
  slack: '💼',
  salesforce: '☁️',
  hubspot: '🧡',
  sap: '🔷',
  zendesk: '🎫',
};
