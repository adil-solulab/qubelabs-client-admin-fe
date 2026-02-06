export type NodeType = 'start' | 'message' | 'condition' | 'api_call' | 'transfer' | 'dtmf' | 'assistant' | 'end';

export type FlowStatus = 'draft' | 'published';

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
  // DTMF node specific
  dtmfConfig?: {
    prompt: string;
    timeout: number;
    maxDigits: number;
    branches: DTMFBranch[];
  };
  // Assistant node specific
  assistantConfig?: {
    personaId: string;
    personaName: string;
    handoffCondition?: string;
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
  currentVersion: string;
  status: FlowStatus;
  nodes: FlowNode[];
  edges: FlowEdge[];
  versions: FlowVersion[];
  createdAt: string;
  updatedAt: string;
}

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
};
