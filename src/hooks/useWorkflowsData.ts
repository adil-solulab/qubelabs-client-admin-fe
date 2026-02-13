import { useState, useCallback } from 'react';
import type { Workflow, WorkflowStep, WorkflowStepType, WorkflowExecution } from '@/types/workflows';

const generateMockWorkflows = (): Workflow[] => [
  {
    id: 'wf-1',
    name: 'Order Status Lookup',
    description: 'Fetches order status from OMS API when customer provides Order ID, formats the response and returns structured data.',
    category: 'customer_service',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        name: 'Validate Order ID',
        type: 'condition',
        description: 'Check if the Order ID format is valid',
        config: { condition: 'order_id.match(/^ORD-\\d{6}$/)', outputVariable: 'is_valid' },
        order: 1,
        isActive: true,
        onSuccess: 'step-2',
        onFailure: 'step-5',
      },
      {
        id: 'step-2',
        name: 'Fetch Order from OMS',
        type: 'api_call',
        description: 'Call Order Management System API to get order details',
        config: {
          url: 'https://api.oms.example.com/v2/orders/{{order_id}}',
          method: 'GET',
          headers: { 'Authorization': 'Bearer {{api_key}}', 'Content-Type': 'application/json' },
          retryCount: 3,
          timeoutMs: 5000,
          outputVariable: 'order_data',
        },
        order: 2,
        isActive: true,
        onSuccess: 'step-3',
        onFailure: 'step-4',
      },
      {
        id: 'step-3',
        name: 'Format Response',
        type: 'transform',
        description: 'Transform raw API response into customer-friendly format',
        config: {
          transformScript: '{ status: order_data.status, estimatedDelivery: order_data.eta, trackingUrl: order_data.tracking_link }',
          outputVariable: 'formatted_response',
        },
        order: 3,
        isActive: true,
      },
      {
        id: 'step-4',
        name: 'Create Error Ticket',
        type: 'create_ticket',
        description: 'Create a support ticket if OMS API fails',
        config: {
          ticketTitle: 'OMS API Failure - Order {{order_id}}',
          ticketPriority: 'high',
        },
        order: 4,
        isActive: true,
      },
      {
        id: 'step-5',
        name: 'Invalid ID Response',
        type: 'transform',
        description: 'Return error message for invalid Order ID',
        config: {
          transformScript: '{ error: "Invalid Order ID format. Please provide ID in format ORD-XXXXXX" }',
          outputVariable: 'error_response',
        },
        order: 5,
        isActive: true,
      },
    ],
    variables: [
      { id: 'var-1', name: 'order_id', type: 'string', description: 'Customer-provided Order ID', defaultValue: '' },
      { id: 'var-2', name: 'api_key', type: 'string', description: 'OMS API authentication key', defaultValue: '' },
    ],
    triggers: [
      { id: 'trig-1', type: 'agent_event', config: { agentId: 'agent-2', eventName: 'order_status_requested' }, isActive: true },
    ],
    linkedAgentIds: ['agent-2', 'super-1'],
    executions: [
      { id: 'exec-1', workflowId: 'wf-1', status: 'completed', startedAt: '2026-02-13T06:30:00Z', completedAt: '2026-02-13T06:30:02Z', duration: 2100, triggeredBy: 'Support Agent', stepsCompleted: 3, totalSteps: 3 },
      { id: 'exec-2', workflowId: 'wf-1', status: 'completed', startedAt: '2026-02-13T05:15:00Z', completedAt: '2026-02-13T05:15:01Z', duration: 1800, triggeredBy: 'Support Agent', stepsCompleted: 3, totalSteps: 3 },
      { id: 'exec-3', workflowId: 'wf-1', status: 'failed', startedAt: '2026-02-12T14:20:00Z', completedAt: '2026-02-12T14:20:05Z', duration: 5200, triggeredBy: 'API Call', stepsCompleted: 1, totalSteps: 3, error: 'OMS API timeout after 5000ms' },
    ],
    version: '2.1',
    createdAt: '2026-01-15',
    updatedAt: '2026-02-12',
    createdBy: 'John Anderson',
    lastRunAt: '2026-02-13T06:30:02Z',
    totalRuns: 1247,
    successRate: 96.5,
  },
  {
    id: 'wf-2',
    name: 'Lead Qualification & CRM Sync',
    description: 'Qualifies incoming leads based on conversation data, scores them, and syncs to CRM with proper tagging.',
    category: 'sales',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        name: 'Extract Lead Data',
        type: 'transform',
        description: 'Parse conversation variables into lead profile',
        config: {
          transformScript: '{ name: customer_name, email: customer_email, company: company_name, budget: budget_range }',
          outputVariable: 'lead_profile',
        },
        order: 1,
        isActive: true,
      },
      {
        id: 'step-2',
        name: 'Score Lead',
        type: 'api_call',
        description: 'Call lead scoring API',
        config: {
          url: 'https://api.scoring.example.com/v1/score',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{{lead_profile}}',
          outputVariable: 'lead_score',
          retryCount: 2,
          timeoutMs: 3000,
        },
        order: 2,
        isActive: true,
      },
      {
        id: 'step-3',
        name: 'Update CRM Contact',
        type: 'crm_update',
        description: 'Create or update contact in CRM with lead data and score',
        config: {
          crmEntity: 'Contact',
          crmAction: 'upsert',
          crmFields: { 'name': '{{lead_profile.name}}', 'email': '{{lead_profile.email}}', 'score': '{{lead_score}}', 'source': 'AI Agent' },
        },
        order: 3,
        isActive: true,
      },
      {
        id: 'step-4',
        name: 'Notify Sales Team',
        type: 'send_email',
        description: 'Send email to sales team for high-value leads',
        config: {
          emailTo: 'sales-team@company.com',
          emailSubject: 'New Qualified Lead: {{lead_profile.name}}',
          emailBody: 'A new lead has been qualified with score {{lead_score}}. Company: {{lead_profile.company}}',
        },
        order: 4,
        isActive: true,
      },
    ],
    variables: [
      { id: 'var-1', name: 'customer_name', type: 'string', description: 'Lead name from conversation' },
      { id: 'var-2', name: 'customer_email', type: 'string', description: 'Lead email address' },
      { id: 'var-3', name: 'company_name', type: 'string', description: 'Lead company name' },
      { id: 'var-4', name: 'budget_range', type: 'string', description: 'Stated budget range' },
    ],
    triggers: [
      { id: 'trig-1', type: 'agent_event', config: { agentId: 'agent-1', eventName: 'lead_qualified' }, isActive: true },
    ],
    linkedAgentIds: ['agent-1'],
    executions: [
      { id: 'exec-1', workflowId: 'wf-2', status: 'completed', startedAt: '2026-02-13T04:00:00Z', completedAt: '2026-02-13T04:00:03Z', duration: 3200, triggeredBy: 'Sales Agent', stepsCompleted: 4, totalSteps: 4 },
    ],
    version: '1.3',
    createdAt: '2026-01-20',
    updatedAt: '2026-02-10',
    createdBy: 'John Anderson',
    lastRunAt: '2026-02-13T04:00:03Z',
    totalRuns: 389,
    successRate: 98.2,
  },
  {
    id: 'wf-3',
    name: 'Escalation Ticket Creator',
    description: 'Automatically creates detailed support tickets when conversations are escalated to human agents.',
    category: 'customer_service',
    status: 'active',
    steps: [
      {
        id: 'step-1',
        name: 'Gather Context',
        type: 'fetch_data',
        description: 'Fetch conversation history and customer profile',
        config: {
          url: 'https://api.internal.example.com/conversations/{{conversation_id}}',
          method: 'GET',
          outputVariable: 'conversation_data',
        },
        order: 1,
        isActive: true,
      },
      {
        id: 'step-2',
        name: 'Create Ticket',
        type: 'create_ticket',
        description: 'Create a support ticket with full context',
        config: {
          ticketTitle: 'Escalated: {{issue_summary}}',
          ticketPriority: 'high',
          outputVariable: 'ticket_id',
        },
        order: 2,
        isActive: true,
      },
      {
        id: 'step-3',
        name: 'Notify Agent',
        type: 'send_email',
        description: 'Notify the human agent about the new escalation',
        config: {
          emailTo: '{{assigned_agent_email}}',
          emailSubject: 'New Escalation - Ticket #{{ticket_id}}',
          emailBody: 'A conversation has been escalated. Customer: {{customer_name}}. Issue: {{issue_summary}}',
        },
        order: 3,
        isActive: true,
      },
      {
        id: 'step-4',
        name: 'Log to Database',
        type: 'database_query',
        description: 'Log escalation event for analytics',
        config: {
          query: "INSERT INTO escalation_log (ticket_id, conversation_id, reason, timestamp) VALUES ('{{ticket_id}}', '{{conversation_id}}', '{{escalation_reason}}', NOW())",
          database: 'analytics_db',
        },
        order: 4,
        isActive: true,
      },
    ],
    variables: [
      { id: 'var-1', name: 'conversation_id', type: 'string', description: 'Active conversation ID' },
      { id: 'var-2', name: 'issue_summary', type: 'string', description: 'AI-generated issue summary' },
      { id: 'var-3', name: 'customer_name', type: 'string', description: 'Customer name' },
      { id: 'var-4', name: 'escalation_reason', type: 'string', description: 'Reason for escalation' },
      { id: 'var-5', name: 'assigned_agent_email', type: 'string', description: 'Email of assigned human agent' },
    ],
    triggers: [
      { id: 'trig-1', type: 'agent_event', config: { agentId: 'super-1', eventName: 'escalation_triggered' }, isActive: true },
      { id: 'trig-2', type: 'webhook', config: { webhookPath: '/api/escalate' }, isActive: true },
    ],
    linkedAgentIds: ['super-1', 'agent-2'],
    executions: [
      { id: 'exec-1', workflowId: 'wf-3', status: 'completed', startedAt: '2026-02-13T07:00:00Z', completedAt: '2026-02-13T07:00:04Z', duration: 4100, triggeredBy: 'Super Agent', stepsCompleted: 4, totalSteps: 4 },
    ],
    version: '1.0',
    createdAt: '2026-02-01',
    updatedAt: '2026-02-11',
    createdBy: 'Jane Smith',
    lastRunAt: '2026-02-13T07:00:04Z',
    totalRuns: 156,
    successRate: 94.8,
  },
  {
    id: 'wf-4',
    name: 'Campaign Performance Reporter',
    description: 'Fetches campaign metrics from multiple sources, aggregates data, and sends weekly performance reports.',
    category: 'marketing',
    status: 'inactive',
    steps: [
      {
        id: 'step-1',
        name: 'Fetch Campaign Data',
        type: 'api_call',
        description: 'Get campaign metrics from marketing platform',
        config: {
          url: 'https://api.marketing.example.com/campaigns/metrics',
          method: 'GET',
          outputVariable: 'campaign_metrics',
          timeoutMs: 10000,
        },
        order: 1,
        isActive: true,
      },
      {
        id: 'step-2',
        name: 'Aggregate Results',
        type: 'transform',
        description: 'Aggregate and format metrics',
        config: {
          transformScript: '{ totalSpend: sum(campaign_metrics.spend), totalConversions: sum(campaign_metrics.conversions), avgCPC: avg(campaign_metrics.cpc) }',
          outputVariable: 'aggregated_report',
        },
        order: 2,
        isActive: true,
      },
      {
        id: 'step-3',
        name: 'Send Report',
        type: 'send_email',
        description: 'Email the weekly report to stakeholders',
        config: {
          emailTo: 'marketing@company.com',
          emailSubject: 'Weekly Campaign Performance Report',
          emailBody: 'Attached is the weekly campaign performance report with key metrics and insights.',
        },
        order: 3,
        isActive: true,
      },
    ],
    variables: [],
    triggers: [
      { id: 'trig-1', type: 'schedule', config: { cronExpression: '0 9 * * MON' }, isActive: true },
    ],
    linkedAgentIds: [],
    executions: [],
    version: '1.0',
    createdAt: '2026-02-05',
    updatedAt: '2026-02-05',
    createdBy: 'John Anderson',
    totalRuns: 0,
    successRate: 0,
  },
];

export function useWorkflowsData() {
  const [workflows, setWorkflows] = useState<Workflow[]>(generateMockWorkflows());
  const [isLoading, setIsLoading] = useState(false);

  const activeWorkflows = workflows.filter(w => w.status === 'active');
  const totalExecutions = workflows.reduce((sum, w) => sum + w.totalRuns, 0);
  const avgSuccessRate = workflows.filter(w => w.totalRuns > 0).reduce((sum, w) => sum + w.successRate, 0) / Math.max(1, workflows.filter(w => w.totalRuns > 0).length);

  const addWorkflow = useCallback(async (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executions' | 'totalRuns' | 'successRate' | 'version'>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newWorkflow: Workflow = {
      ...data,
      id: `wf-${Date.now()}`,
      version: '1.0',
      executions: [],
      totalRuns: 0,
      successRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setIsLoading(false);
    return newWorkflow;
  }, []);

  const updateWorkflow = useCallback(async (id: string, data: Partial<Workflow>) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setWorkflows(prev =>
      prev.map(wf =>
        wf.id === id
          ? { ...wf, ...data, updatedAt: new Date().toISOString().split('T')[0] }
          : wf
      )
    );
    setIsLoading(false);
  }, []);

  const deleteWorkflow = useCallback(async (id: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setWorkflows(prev => prev.filter(wf => wf.id !== id));
    setIsLoading(false);
  }, []);

  const toggleWorkflowStatus = useCallback((id: string) => {
    setWorkflows(prev =>
      prev.map(wf =>
        wf.id === id
          ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' as const }
          : wf
      )
    );
  }, []);

  const duplicateWorkflow = useCallback(async (id: string) => {
    const original = workflows.find(wf => wf.id === id);
    if (!original) return null;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const newWorkflow: Workflow = {
      ...original,
      id: `wf-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      executions: [],
      totalRuns: 0,
      successRate: 0,
      version: '1.0',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setWorkflows(prev => [...prev, newWorkflow]);
    setIsLoading(false);
    return newWorkflow;
  }, [workflows]);

  const executeWorkflow = useCallback(async (id: string) => {
    const workflow = workflows.find(wf => wf.id === id);
    if (!workflow) return;
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId: id,
      status: 'running',
      startedAt: new Date().toISOString(),
      triggeredBy: 'Manual',
      stepsCompleted: 0,
      totalSteps: workflow.steps.filter(s => s.isActive).length,
    };
    setWorkflows(prev =>
      prev.map(wf =>
        wf.id === id
          ? { ...wf, executions: [execution, ...wf.executions] }
          : wf
      )
    );
    await new Promise(resolve => setTimeout(resolve, 2000));
    const completed: WorkflowExecution = {
      ...execution,
      status: 'completed',
      completedAt: new Date().toISOString(),
      duration: 2000 + Math.random() * 3000,
      stepsCompleted: execution.totalSteps,
    };
    setWorkflows(prev =>
      prev.map(wf =>
        wf.id === id
          ? {
              ...wf,
              executions: [completed, ...wf.executions.filter(e => e.id !== execution.id)],
              lastRunAt: completed.completedAt,
              totalRuns: wf.totalRuns + 1,
              successRate: Math.min(100, wf.successRate + (100 - wf.successRate) * 0.01),
            }
          : wf
      )
    );
  }, [workflows]);

  const addStep = useCallback((workflowId: string, stepType: WorkflowStepType) => {
    setWorkflows(prev =>
      prev.map(wf => {
        if (wf.id !== workflowId) return wf;
        const newStep: WorkflowStep = {
          id: `step-${Date.now()}`,
          name: `New Step`,
          type: stepType,
          description: '',
          config: {},
          order: wf.steps.length + 1,
          isActive: true,
        };
        return { ...wf, steps: [...wf.steps, newStep] };
      })
    );
  }, []);

  const updateStep = useCallback((workflowId: string, stepId: string, data: Partial<WorkflowStep>) => {
    setWorkflows(prev =>
      prev.map(wf => {
        if (wf.id !== workflowId) return wf;
        return {
          ...wf,
          steps: wf.steps.map(s => (s.id === stepId ? { ...s, ...data } : s)),
        };
      })
    );
  }, []);

  const deleteStep = useCallback((workflowId: string, stepId: string) => {
    setWorkflows(prev =>
      prev.map(wf => {
        if (wf.id !== workflowId) return wf;
        return {
          ...wf,
          steps: wf.steps.filter(s => s.id !== stepId).map((s, i) => ({ ...s, order: i + 1 })),
        };
      })
    );
  }, []);

  return {
    workflows,
    activeWorkflows,
    totalExecutions,
    avgSuccessRate,
    isLoading,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    duplicateWorkflow,
    executeWorkflow,
    addStep,
    updateStep,
    deleteStep,
  };
}
