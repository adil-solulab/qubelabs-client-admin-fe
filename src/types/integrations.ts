export type IntegrationCategory = 'crm' | 'itsm' | 'hr' | 'tools' | 'payment' | 'live_chat' | 'retail' | 'communication';
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
  itsm: { label: 'ITSM', color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
  hr: { label: 'HR', color: 'text-green-600', bgColor: 'bg-green-500/10' },
  tools: { label: 'Tools & Utilities', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  payment: { label: 'Payment', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  live_chat: { label: 'Live Chat', color: 'text-cyan-600', bgColor: 'bg-cyan-500/10' },
  retail: { label: 'Retail & eCommerce', color: 'text-pink-600', bgColor: 'bg-pink-500/10' },
  communication: { label: 'Communication', color: 'text-indigo-600', bgColor: 'bg-indigo-500/10' },
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
  freshdesk: '🎫',
  servicenow: '🔧',
  jira: '🔷',
  bamboo: '🌿',
  workday: '💼',
  personio: '👥',
  slack: '💬',
  zapier: '⚡',
  google_sheets: '📗',
  power_automate: '🔄',
  stripe: '💳',
  razorpay: '💰',
  paypal: '🅿️',
  intercom: '💭',
  zendesk_chat: '🗨️',
  livechat: '🟢',
  twilio: '📞',
  whatsapp: '💬',
  gmail: '📧',
  shopify: '🛍️',
  woocommerce: '🛒',
  sap: '🔷',
};
