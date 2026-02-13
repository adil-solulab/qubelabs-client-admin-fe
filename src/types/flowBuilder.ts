export type NodeType = 
  | 'start' | 'message' | 'condition' | 'api_call' | 'transfer' | 'dtmf' | 'assistant' | 'end'
  | 'whatsapp' | 'slack' | 'telegram' | 'teams'
  | 'zendesk' | 'freshdesk'
  | 'zoho_crm' | 'salesforce' | 'hubspot';

export type NodeCategory = 'flow' | 'channels' | 'ticketing' | 'crm';

export type FlowStatus = 'draft' | 'published';

export type FlowChannel = 'voice' | 'chat' | 'email';

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  connections: string[];
}

export interface DTMFBranch {
  key: string;
  label: string;
  targetNodeId?: string;
}

export interface NodeData {
  label: string;
  content?: string;
  condition?: {
    variable: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string;
  };
  apiConfig?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    body?: string;
  };
  transferTo?: string;
  yesConnection?: string;
  noConnection?: string;
  dtmfConfig?: {
    prompt: string;
    timeout: number;
    maxDigits: number;
    branches: DTMFBranch[];
  };
  assistantConfig?: {
    personaId: string;
    personaName: string;
    handoffCondition?: string;
  };
  channelConfig?: {
    recipientId: string;
    messageTemplate: string;
    channel: string;
  };
  ticketConfig?: {
    action: 'create' | 'update' | 'close' | 'get';
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignee?: string;
    tags?: string;
  };
  crmConfig?: {
    action: 'create_contact' | 'update_contact' | 'create_deal' | 'update_deal' | 'get_contact' | 'search';
    objectType: 'contact' | 'lead' | 'deal' | 'account';
    fieldMapping?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  status: FlowStatus;
  nodes: FlowNode[];
  edges: FlowEdge[];
  changelog: string;
}

export interface Flow {
  id: string;
  name: string;
  description: string;
  category: string;
  channel: FlowChannel;
  currentVersion: string;
  status: FlowStatus;
  nodes: FlowNode[];
  edges: FlowEdge[];
  versions: FlowVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowSummary {
  id: string;
  name: string;
  description: string;
  category: string;
  channel: FlowChannel;
  status: FlowStatus;
  currentVersion: string;
  updatedAt: string;
  nodeCount: number;
}

export const NODE_CATEGORIES: Record<NodeCategory, { label: string; types: NodeType[] }> = {
  flow: {
    label: 'Flow',
    types: ['message', 'condition', 'api_call', 'dtmf', 'assistant', 'transfer', 'end'],
  },
  channels: {
    label: 'Channels',
    types: ['whatsapp', 'slack', 'telegram', 'teams'],
  },
  ticketing: {
    label: 'Ticketing',
    types: ['zendesk', 'freshdesk'],
  },
  crm: {
    label: 'CRM',
    types: ['zoho_crm', 'salesforce', 'hubspot'],
  },
};

export const NODE_TYPE_CONFIG: Record<NodeType, { 
  label: string; 
  icon: string; 
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  start: { 
    label: 'Start', 
    icon: '▶️', 
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30'
  },
  message: { 
    label: 'Message', 
    icon: '💬', 
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30'
  },
  condition: { 
    label: 'Condition', 
    icon: '🔀', 
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30'
  },
  api_call: { 
    label: 'API Call', 
    icon: '🔌', 
    color: 'text-info',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  transfer: { 
    label: 'Transfer', 
    icon: '👤', 
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  },
  dtmf: { 
    label: 'DTMF Input', 
    icon: '🔢', 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  assistant: { 
    label: 'AI Assistant', 
    icon: '🤖', 
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
  end: { 
    label: 'End', 
    icon: '⏹️', 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10',
    borderColor: 'border-destructive/30'
  },
  whatsapp: {
    label: 'WhatsApp',
    icon: '📱',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  slack: {
    label: 'Slack',
    icon: '💼',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    borderColor: 'border-purple-600/30'
  },
  telegram: {
    label: 'Telegram',
    icon: '✈️',
    color: 'text-sky-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30'
  },
  teams: {
    label: 'Microsoft Teams',
    icon: '🟦',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30'
  },
  zendesk: {
    label: 'Zendesk',
    icon: '🎫',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600/10',
    borderColor: 'border-emerald-600/30'
  },
  freshdesk: {
    label: 'Freshdesk',
    icon: '📋',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30'
  },
  zoho_crm: {
    label: 'Zoho CRM',
    icon: '📊',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  salesforce: {
    label: 'Salesforce',
    icon: '☁️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/30'
  },
  hubspot: {
    label: 'HubSpot',
    icon: '🔶',
    color: 'text-orange-600',
    bgColor: 'bg-orange-600/10',
    borderColor: 'border-orange-600/30'
  },
};
