export type IntegrationCategory = 'crm' | 'voice' | 'communication' | 'live_chat' | 'payment';
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending';
export type AuthType = 'oauth' | 'api_key' | 'webhook';

export interface IntegrationField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'url';
  placeholder: string;
  required: boolean;
}

export interface IntegrationInstruction {
  step: number;
  text: string;
}

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
  fields?: IntegrationField[];
  instructions?: IntegrationInstruction[];
  docsUrl?: string;
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
  crm: { label: 'CRM', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  voice: { label: 'Voice', color: 'text-violet-600', bgColor: 'bg-violet-500/10' },
  communication: { label: 'Communications', color: 'text-indigo-600', bgColor: 'bg-indigo-500/10' },
  live_chat: { label: 'LiveChat', color: 'text-cyan-600', bgColor: 'bg-cyan-500/10' },
  payment: { label: 'Payments', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
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
  salesforce: '☁️',
  hubspot: '🧡',
  zoho: '📊',
  dynamics: '▶️',
  twilio: '📞',
  vonage: '📱',
  genesys: '🎧',
  five9: '5️⃣',
  whatsapp: '💬',
  gmail: '📧',
  slack: '💬',
  microsoft_teams: '👥',
  intercom: '💭',
  zendesk_chat: '🗨️',
  livechat: '🟢',
  freshchat: '💚',
  stripe: '💳',
  razorpay: '💰',
  paypal: '🅿️',
};
