export type FlowType = 'flow' | 'workflow';

export type NodeType = 
  // Shared
  | 'start' | 'end' | 'condition'
  // Flow-specific (Prompt Nodes)
  | 'message' | 'text_input' | 'quick_reply' | 'carousel' | 'name_input' | 'email_input' | 'phone_input' | 'date_input'
  // Flow-specific (Action Nodes)  
  | 'dtmf' | 'assistant' | 'transfer' | 'execute_flow' | 'raise_ticket' | 'run_workflow'
  // Safety & Risk
  | 'safety_check'
  // Workflow-specific
  | 'api_call' | 'database' | 'function' | 'variable' | 'delay' | 'notification' | 'event_trigger'
  // Integration nodes (shared)
  | 'whatsapp' | 'slack' | 'telegram' | 'teams'
  | 'zendesk' | 'freshdesk'
  | 'zoho_crm' | 'salesforce' | 'hubspot';

export type NodeCategory = 'prompts' | 'messages' | 'logic' | 'actions' | 'safety' | 'channels' | 'ticketing' | 'crm' | 'workflow_actions' | 'workflow_logic';

export type FlowStatus = 'draft' | 'published';

export type FlowChannel = 'voice' | 'chat' | 'email';

export type FlowChannels = FlowChannel[];

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
  textInputConfig?: {
    placeholder: string;
    validationType: 'none' | 'email' | 'phone' | 'number' | 'regex';
    validationPattern?: string;
    required: boolean;
  };
  quickReplyConfig?: {
    options: { label: string; value: string }[];
    allowMultiple: boolean;
  };
  carouselConfig?: {
    cards: { title: string; description: string; imageUrl?: string; buttons: { label: string; value: string }[] }[];
  };
  executeFlowConfig?: {
    targetFlowId: string;
    targetFlowName: string;
    returnAfter: boolean;
  };
  raiseTicketConfig?: {
    priority: 'low' | 'medium' | 'high' | 'urgent';
    department: string;
    message: string;
  };
  databaseConfig?: {
    operation: 'read' | 'write' | 'update' | 'delete' | 'query';
    table: string;
    fields?: string;
    condition?: string;
  };
  functionConfig?: {
    code: string;
    language: 'javascript';
    timeout: number;
  };
  variableConfig?: {
    action: 'set' | 'get' | 'transform';
    variableName: string;
    value?: string;
    transformExpression?: string;
  };
  delayConfig?: {
    duration: number;
    unit: 'seconds' | 'minutes' | 'hours';
  };
  notificationConfig?: {
    type: 'email' | 'sms' | 'push' | 'webhook';
    recipient: string;
    subject?: string;
    body: string;
  };
  eventTriggerConfig?: {
    eventName: string;
    payload?: string;
  };
  runWorkflowConfig?: {
    targetWorkflowId: string;
    targetWorkflowName: string;
    outputs: { name: string; type: string }[];
  };
  safetyConfig?: {
    botType: 'voice' | 'chat' | 'both';
    checks: {
      sentimentAnalysis: boolean;
      piiDetection: boolean;
      policyViolation: boolean;
      profanityFilter: boolean;
      topicGuardrail: boolean;
    };
    sentimentThreshold: 'low' | 'medium' | 'high';
    sentimentEscalateOnRepeated: boolean;
    sentimentRepeatCount: number;
    piiTypes: ('credit_card' | 'ssn' | 'phone' | 'email' | 'address' | 'name' | 'government_id' | 'date_of_birth')[];
    policyCategories: ('harassment' | 'threats' | 'abuse' | 'fraud' | 'scams' | 'data_leakage' | 'confidential_content')[];
    profanitySeverity: 'mild' | 'moderate' | 'strong';
    profanityGraceCount: number;
    blockedTopics: string;
    onHighRisk: 'transfer_agent' | 'escalate_supervisor' | 'send_warning' | 'end_conversation' | 'warn_then_escalate';
    onMediumRisk: 'continue_with_warning' | 'continue_with_disclaimer' | 'transfer_agent' | 'log_only';
    onPiiDetected: 'mask_and_continue' | 'block_and_warn' | 'transfer_agent' | 'mask_log_continue';
    onSensitiveTopic: 'safe_fallback' | 'block_and_redirect' | 'transfer_agent' | 'log_only';
    customRules: string;
    enableLogging: boolean;
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
  channels: FlowChannels;
  flowType: FlowType;
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
  channels: FlowChannels;
  flowType: FlowType;
  status: FlowStatus;
  currentVersion: string;
  updatedAt: string;
  nodeCount: number;
}

/** @deprecated Use FLOW_NODE_CATEGORIES or WORKFLOW_NODE_CATEGORIES instead */
export const NODE_CATEGORIES: Record<string, { label: string; types: NodeType[] }> = {
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

export const FLOW_NODE_CATEGORIES: Record<string, { label: string; types: NodeType[] }> = {
  prompts: {
    label: 'Prompts',
    types: ['text_input', 'name_input', 'email_input', 'phone_input', 'date_input', 'quick_reply'],
  },
  messages: {
    label: 'Messages',
    types: ['message', 'carousel'],
  },
  logic: {
    label: 'Logic',
    types: ['condition'],
  },
  actions: {
    label: 'Actions',
    types: ['run_workflow', 'execute_flow', 'raise_ticket', 'assistant', 'transfer', 'dtmf', 'delay', 'end'],
  },
  safety: {
    label: 'Safety & Risk',
    types: ['safety_check'],
  },
};

export const WORKFLOW_NODE_CATEGORIES: Record<string, { label: string; types: NodeType[] }> = {
  workflow_actions: {
    label: 'Actions',
    types: ['api_call', 'database', 'function', 'variable', 'notification', 'event_trigger'],
  },
  workflow_logic: {
    label: 'Logic',
    types: ['condition', 'delay'],
  },
  messaging: {
    label: 'Messaging',
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
  safety: {
    label: 'Safety & Risk',
    types: ['safety_check'],
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
  text_input: {
    label: 'Text Input',
    icon: '📝',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  quick_reply: {
    label: 'Quick Reply',
    icon: '⚡',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  carousel: {
    label: 'Carousel',
    icon: '🎠',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30'
  },
  name_input: {
    label: 'Name Input',
    icon: '👤',
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30'
  },
  email_input: {
    label: 'Email Input',
    icon: '📧',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30'
  },
  phone_input: {
    label: 'Phone Input',
    icon: '📞',
    color: 'text-green-600',
    bgColor: 'bg-green-600/10',
    borderColor: 'border-green-600/30'
  },
  date_input: {
    label: 'Date Input',
    icon: '📅',
    color: 'text-violet-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30'
  },
  execute_flow: {
    label: 'Execute Flow',
    icon: '🔄',
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
    borderColor: 'border-blue-600/30'
  },
  run_workflow: {
    label: 'Run Workflow',
    icon: '⚡',
    color: 'text-purple-600',
    bgColor: 'bg-purple-600/10',
    borderColor: 'border-purple-600/30'
  },
  raise_ticket: {
    label: 'Raise Ticket',
    icon: '🎫',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30'
  },
  database: {
    label: 'Database',
    icon: '🗄️',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-600/10',
    borderColor: 'border-emerald-600/30'
  },
  function: {
    label: 'Function',
    icon: '⚙️',
    color: 'text-slate-600',
    bgColor: 'bg-slate-600/10',
    borderColor: 'border-slate-600/30'
  },
  variable: {
    label: 'Variable',
    icon: '📦',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-600/10',
    borderColor: 'border-yellow-600/30'
  },
  delay: {
    label: 'Delay',
    icon: '⏱️',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30'
  },
  notification: {
    label: 'Notification',
    icon: '🔔',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  },
  event_trigger: {
    label: 'Event Trigger',
    icon: '⚡',
    color: 'text-amber-600',
    bgColor: 'bg-amber-600/10',
    borderColor: 'border-amber-600/30'
  },
  safety_check: {
    label: 'Safety Check',
    icon: '🛡️',
    color: 'text-red-600',
    bgColor: 'bg-red-600/10',
    borderColor: 'border-red-600/30'
  },
};
