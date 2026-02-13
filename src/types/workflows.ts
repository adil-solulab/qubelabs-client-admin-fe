export type WorkflowStatus = 'active' | 'inactive' | 'draft' | 'error';
export type WorkflowStepType = 'api_call' | 'database_query' | 'crm_update' | 'send_email' | 'create_ticket' | 'fetch_data' | 'condition' | 'transform' | 'delay' | 'webhook';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type WorkflowCategory = 'customer_service' | 'sales' | 'operations' | 'marketing' | 'custom';

export interface WorkflowStep {
  id: string;
  name: string;
  type: WorkflowStepType;
  description: string;
  config: StepConfig;
  order: number;
  isActive: boolean;
  onSuccess?: string;
  onFailure?: string;
}

export interface StepConfig {
  url?: string;
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: string;
  query?: string;
  database?: string;
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
  ticketTitle?: string;
  ticketPriority?: 'low' | 'medium' | 'high' | 'urgent';
  crmEntity?: string;
  crmAction?: string;
  crmFields?: Record<string, string>;
  condition?: string;
  transformScript?: string;
  delaySeconds?: number;
  webhookUrl?: string;
  retryCount?: number;
  timeoutMs?: number;
  outputVariable?: string;
}

export interface WorkflowVariable {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: string;
  description: string;
}

export interface WorkflowTrigger {
  id: string;
  type: 'agent_event' | 'api_call' | 'schedule' | 'webhook' | 'manual';
  config: {
    agentId?: string;
    eventName?: string;
    endpoint?: string;
    cronExpression?: string;
    webhookPath?: string;
  };
  isActive: boolean;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  triggeredBy: string;
  stepsCompleted: number;
  totalSteps: number;
  error?: string;
  output?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  category: WorkflowCategory;
  status: WorkflowStatus;
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  triggers: WorkflowTrigger[];
  linkedAgentIds: string[];
  executions: WorkflowExecution[];
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastRunAt?: string;
  totalRuns: number;
  successRate: number;
}

export const STEP_TYPE_CONFIG: Record<WorkflowStepType, { label: string; icon: string; color: string; description: string }> = {
  api_call: { label: 'API Call', icon: 'Globe', color: 'bg-blue-500/10 text-blue-600', description: 'Make HTTP requests to external APIs' },
  database_query: { label: 'Database Query', icon: 'Database', color: 'bg-purple-500/10 text-purple-600', description: 'Execute database queries' },
  crm_update: { label: 'CRM Update', icon: 'Users', color: 'bg-green-500/10 text-green-600', description: 'Update CRM records' },
  send_email: { label: 'Send Email', icon: 'Mail', color: 'bg-orange-500/10 text-orange-600', description: 'Send email notifications' },
  create_ticket: { label: 'Create Ticket', icon: 'Ticket', color: 'bg-red-500/10 text-red-600', description: 'Create support tickets' },
  fetch_data: { label: 'Fetch Data', icon: 'Download', color: 'bg-cyan-500/10 text-cyan-600', description: 'Fetch data from backend services' },
  condition: { label: 'Condition', icon: 'GitBranch', color: 'bg-yellow-500/10 text-yellow-600', description: 'Branch based on conditions' },
  transform: { label: 'Transform Data', icon: 'Shuffle', color: 'bg-indigo-500/10 text-indigo-600', description: 'Transform and format data' },
  delay: { label: 'Delay', icon: 'Clock', color: 'bg-gray-500/10 text-gray-600', description: 'Wait for a specified duration' },
  webhook: { label: 'Webhook', icon: 'Webhook', color: 'bg-pink-500/10 text-pink-600', description: 'Send webhook notifications' },
};

export const CATEGORY_LABELS: Record<WorkflowCategory, string> = {
  customer_service: 'Customer Service',
  sales: 'Sales',
  operations: 'Operations',
  marketing: 'Marketing',
  custom: 'Custom',
};

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
