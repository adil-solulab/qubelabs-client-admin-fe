import { useState, useCallback, useEffect } from 'react';
import type { Flow, FlowNode, FlowEdge, FlowVersion, NodeType, NodeData, FlowSummary } from '@/types/flowBuilder';

const generateMockFlows = (): Flow[] => [
  {
    id: 'flow-1',
    name: 'Customer Support Flow',
    description: 'Main customer support conversation flow',
    category: 'Base',
    currentVersion: '2.1',
    status: 'published',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 300 },
        data: { label: 'Start' },
        connections: ['msg-1'],
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 350, y: 300 },
        data: { label: 'Welcome Message', content: 'Hello! How can I help you today?' },
        connections: ['cond-1'],
      },
      {
        id: 'cond-1',
        type: 'condition',
        position: { x: 600, y: 300 },
        data: {
          label: 'Check Intent',
          condition: { variable: 'intent', operator: 'equals', value: 'sales' },
          yesConnection: 'msg-2',
          noConnection: 'msg-3',
        },
        connections: ['msg-2', 'msg-3'],
      },
      {
        id: 'msg-2',
        type: 'message',
        position: { x: 900, y: 180 },
        data: { label: 'Sales Response', content: 'Let me connect you with our sales team!' },
        connections: ['transfer-1'],
      },
      {
        id: 'msg-3',
        type: 'message',
        position: { x: 900, y: 420 },
        data: { label: 'Support Response', content: 'I\'ll help you with support.' },
        connections: ['api-1'],
      },
      {
        id: 'transfer-1',
        type: 'transfer',
        position: { x: 1150, y: 180 },
        data: { label: 'Transfer to Sales', transferTo: 'Sales Team' },
        connections: ['end-1'],
      },
      {
        id: 'api-1',
        type: 'api_call',
        position: { x: 1150, y: 420 },
        data: {
          label: 'Get User Info',
          apiConfig: { method: 'GET', url: '/api/user/{userId}' },
        },
        connections: ['end-2'],
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 1400, y: 180 },
        data: { label: 'End (Sales)' },
        connections: [],
      },
      {
        id: 'end-2',
        type: 'end',
        position: { x: 1400, y: 420 },
        data: { label: 'End (Support)' },
        connections: [],
      },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'msg-1' },
      { id: 'e2', source: 'msg-1', target: 'cond-1' },
      { id: 'e3', source: 'cond-1', target: 'msg-2', label: 'Yes' },
      { id: 'e4', source: 'cond-1', target: 'msg-3', label: 'No' },
      { id: 'e5', source: 'msg-2', target: 'transfer-1' },
      { id: 'e6', source: 'msg-3', target: 'api-1' },
      { id: 'e7', source: 'transfer-1', target: 'end-1' },
      { id: 'e8', source: 'api-1', target: 'end-2' },
    ],
    versions: [
      { id: 'v1', version: '1.0', createdAt: '2024-04-01', createdBy: 'John Anderson', status: 'published', nodes: [], edges: [], changelog: 'Initial flow creation' },
      { id: 'v2', version: '2.0', createdAt: '2024-04-15', createdBy: 'Sarah Mitchell', status: 'published', nodes: [], edges: [], changelog: 'Added conditional branching for sales vs support' },
      { id: 'v3', version: '2.1', createdAt: '2024-05-01', createdBy: 'John Anderson', status: 'draft', nodes: [], edges: [], changelog: 'Added API call node for user lookup' },
    ],
    createdAt: '2024-04-01',
    updatedAt: '2024-05-01',
  },
  {
    id: 'flow-2',
    name: 'Handle Customer',
    description: 'Customer inquiry handling and routing',
    category: 'Base',
    currentVersion: '1.2',
    status: 'published',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 300 },
        data: { label: 'Start' },
        connections: ['msg-1'],
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 350, y: 300 },
        data: { label: 'Greeting', content: 'Welcome! How may I assist you?' },
        connections: ['assistant-1'],
      },
      {
        id: 'assistant-1',
        type: 'assistant',
        position: { x: 600, y: 300 },
        data: { label: 'AI Handler', assistantConfig: { personaId: 'cs-1', personaName: 'Support Bot', handoffCondition: 'escalation_requested' } },
        connections: ['end-1'],
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 850, y: 300 },
        data: { label: 'End' },
        connections: [],
      },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'msg-1' },
      { id: 'e2', source: 'msg-1', target: 'assistant-1' },
      { id: 'e3', source: 'assistant-1', target: 'end-1' },
    ],
    versions: [
      { id: 'v1', version: '1.0', createdAt: '2024-03-10', createdBy: 'John Anderson', status: 'published', nodes: [], edges: [], changelog: 'Initial flow' },
      { id: 'v2', version: '1.2', createdAt: '2026-02-12', createdBy: 'Sarah Mitchell', status: 'published', nodes: [], edges: [], changelog: 'Added AI handler' },
    ],
    createdAt: '2024-03-10',
    updatedAt: '2026-02-12',
  },
  {
    id: 'flow-3',
    name: 'Product FAQ',
    description: 'Automated product FAQ responses',
    category: 'FAQs',
    currentVersion: '1.0',
    status: 'published',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 300 },
        data: { label: 'Start' },
        connections: ['cond-1'],
      },
      {
        id: 'cond-1',
        type: 'condition',
        position: { x: 350, y: 300 },
        data: { label: 'Check Topic', condition: { variable: 'topic', operator: 'equals', value: 'pricing' } },
        connections: ['msg-1', 'msg-2'],
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 600, y: 180 },
        data: { label: 'Pricing Info', content: 'Our pricing starts at $99/month for the starter plan.' },
        connections: ['end-1'],
      },
      {
        id: 'msg-2',
        type: 'message',
        position: { x: 600, y: 420 },
        data: { label: 'General FAQ', content: 'Let me find the answer for you...' },
        connections: ['end-1'],
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 850, y: 300 },
        data: { label: 'End' },
        connections: [],
      },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'cond-1' },
      { id: 'e2', source: 'cond-1', target: 'msg-1', label: 'Yes' },
      { id: 'e3', source: 'cond-1', target: 'msg-2', label: 'No' },
      { id: 'e4', source: 'msg-1', target: 'end-1' },
      { id: 'e5', source: 'msg-2', target: 'end-1' },
    ],
    versions: [
      { id: 'v1', version: '1.0', createdAt: '2024-05-10', createdBy: 'Emily Rodriguez', status: 'published', nodes: [], edges: [], changelog: 'Initial FAQ flow' },
    ],
    createdAt: '2024-05-10',
    updatedAt: '2024-05-10',
  },
  {
    id: 'flow-4',
    name: 'Billing FAQ',
    description: 'Handle billing and payment inquiries',
    category: 'FAQs',
    currentVersion: '1.1',
    status: 'draft',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 300 },
        data: { label: 'Start' },
        connections: ['msg-1'],
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 350, y: 300 },
        data: { label: 'Billing Help', content: 'I can help you with billing questions.' },
        connections: ['dtmf-1'],
      },
      {
        id: 'dtmf-1',
        type: 'dtmf',
        position: { x: 600, y: 300 },
        data: { label: 'Billing Menu', dtmfConfig: { prompt: 'Press 1 for invoices, 2 for refunds', timeout: 10, maxDigits: 1, branches: [{ key: '1', label: 'Invoices' }, { key: '2', label: 'Refunds' }] } },
        connections: ['end-1'],
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 850, y: 300 },
        data: { label: 'End' },
        connections: [],
      },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'msg-1' },
      { id: 'e2', source: 'msg-1', target: 'dtmf-1' },
      { id: 'e3', source: 'dtmf-1', target: 'end-1' },
    ],
    versions: [
      { id: 'v1', version: '1.0', createdAt: '2024-05-15', createdBy: 'Michael Chen', status: 'published', nodes: [], edges: [], changelog: 'Initial billing flow' },
      { id: 'v2', version: '1.1', createdAt: '2024-05-20', createdBy: 'Michael Chen', status: 'draft', nodes: [], edges: [], changelog: 'Added DTMF menu' },
    ],
    createdAt: '2024-05-15',
    updatedAt: '2024-05-20',
  },
  {
    id: 'flow-5',
    name: 'Appointment Booking',
    description: 'Schedule and manage customer appointments',
    category: 'Operations',
    currentVersion: '1.0',
    status: 'published',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        position: { x: 100, y: 300 },
        data: { label: 'Start' },
        connections: ['msg-1'],
      },
      {
        id: 'msg-1',
        type: 'message',
        position: { x: 350, y: 300 },
        data: { label: 'Schedule Prompt', content: 'I can help you schedule an appointment.' },
        connections: ['api-1'],
      },
      {
        id: 'api-1',
        type: 'api_call',
        position: { x: 600, y: 300 },
        data: { label: 'Check Availability', apiConfig: { method: 'GET', url: '/api/slots/available' } },
        connections: ['end-1'],
      },
      {
        id: 'end-1',
        type: 'end',
        position: { x: 850, y: 300 },
        data: { label: 'End' },
        connections: [],
      },
    ],
    edges: [
      { id: 'e1', source: 'start-1', target: 'msg-1' },
      { id: 'e2', source: 'msg-1', target: 'api-1' },
      { id: 'e3', source: 'api-1', target: 'end-1' },
    ],
    versions: [
      { id: 'v1', version: '1.0', createdAt: '2024-06-01', createdBy: 'Lisa Park', status: 'published', nodes: [], edges: [], changelog: 'Initial appointment flow' },
    ],
    createdAt: '2024-06-01',
    updatedAt: '2024-06-01',
  },
];

export function useFlowBuilderData() {
  const [flows, setFlows] = useState<Flow[]>(generateMockFlows());
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [initialFlowSnapshot, setInitialFlowSnapshot] = useState<{ nodes: FlowNode[]; edges: FlowEdge[] } | null>(null);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingHandleType, setConnectingHandleType] = useState<'output' | 'yes' | 'no' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const flow = flows.find(f => f.id === selectedFlowId) ?? null;

  useEffect(() => {
    if (flow && initialFlowSnapshot) {
      const currentStr = JSON.stringify({ nodes: flow.nodes, edges: flow.edges });
      const initialStr = JSON.stringify(initialFlowSnapshot);
      setHasUnsavedChanges(currentStr !== initialStr);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [flow, initialFlowSnapshot]);

  const selectFlow = useCallback((flowId: string | null) => {
    setSelectedFlowId(flowId);
    setSelectedNode(null);
    setIsConnecting(false);
    setConnectingFrom(null);
    setConnectingHandleType(null);
    if (flowId) {
      const f = flows.find(fl => fl.id === flowId);
      if (f) {
        setInitialFlowSnapshot({ nodes: f.nodes, edges: f.edges });
      }
    } else {
      setInitialFlowSnapshot(null);
    }
    setHasUnsavedChanges(false);
  }, [flows]);

  const getFlowSummaries = useCallback((): FlowSummary[] => {
    return flows.map(f => ({
      id: f.id,
      name: f.name,
      description: f.description,
      category: f.category,
      status: f.status,
      currentVersion: f.currentVersion,
      updatedAt: f.updatedAt,
      nodeCount: f.nodes.length,
    }));
  }, [flows]);

  const getCategories = useCallback((): string[] => {
    return [...new Set(flows.map(f => f.category))];
  }, [flows]);

  const createFlow = useCallback((name: string, description: string, category: string) => {
    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      name,
      description,
      category,
      currentVersion: '1.0',
      status: 'draft',
      nodes: [
        {
          id: `start-${Date.now()}`,
          type: 'start',
          position: { x: 200, y: 300 },
          data: { label: 'Start' },
          connections: [],
        },
      ],
      edges: [],
      versions: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setFlows(prev => [...prev, newFlow]);
    return newFlow;
  }, []);

  const deleteFlow = useCallback((flowId: string) => {
    setFlows(prev => prev.filter(f => f.id !== flowId));
    if (selectedFlowId === flowId) {
      setSelectedFlowId(null);
      setSelectedNode(null);
    }
  }, [selectedFlowId]);

  const duplicateFlow = useCallback((flowId: string) => {
    const original = flows.find(f => f.id === flowId);
    if (!original) return null;
    const newFlow: Flow = {
      ...original,
      id: `flow-${Date.now()}`,
      name: `${original.name} (Copy)`,
      status: 'draft',
      currentVersion: '1.0',
      versions: [],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    setFlows(prev => [...prev, newFlow]);
    return newFlow;
  }, [flows]);

  const updateFlowMeta = useCallback((flowId: string, updates: { name?: string; description?: string; category?: string }) => {
    setFlows(prev => prev.map(f => f.id === flowId ? { ...f, ...updates } : f));
  }, []);

  const updateCurrentFlow = useCallback((updater: (f: Flow) => Flow) => {
    if (!selectedFlowId) return;
    setFlows(prev => prev.map(f => f.id === selectedFlowId ? updater(f) : f));
  }, [selectedFlowId]);

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}`,
        content: type === 'message' ? 'Enter your message here...' : undefined,
        condition: type === 'condition' ? { variable: '', operator: 'equals', value: '' } : undefined,
        apiConfig: type === 'api_call' ? { method: 'GET', url: '' } : undefined,
        dtmfConfig: type === 'dtmf' ? {
          prompt: 'Press 1 for sales, 2 for support, or 0 for operator.',
          timeout: 10,
          maxDigits: 1,
          branches: [
            { key: '1', label: 'Sales' },
            { key: '2', label: 'Support' },
            { key: '0', label: 'Operator' },
          ]
        } : undefined,
        assistantConfig: type === 'assistant' ? {
          personaId: '',
          personaName: 'Select Assistant',
          handoffCondition: 'escalation_requested',
        } : undefined,
      },
      connections: [],
    };
    updateCurrentFlow(f => ({
      ...f,
      nodes: [...f.nodes, newNode],
      status: 'draft',
    }));
    return newNode;
  }, [updateCurrentFlow]);

  const duplicateNode = useCallback((nodeId: string) => {
    if (!flow) return null;
    const node = flow.nodes.find(n => n.id === nodeId);
    if (!node || node.type === 'start') return null;
    const newNode: FlowNode = {
      id: `${node.type}-${Date.now()}`,
      type: node.type,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
      data: { ...node.data, label: `${node.data.label} (Copy)` },
      connections: [],
    };
    updateCurrentFlow(f => ({
      ...f,
      nodes: [...f.nodes, newNode],
      status: 'draft',
    }));
    return newNode;
  }, [flow, updateCurrentFlow]);

  const updateNodeData = useCallback((nodeId: string, dataUpdates: Partial<NodeData>) => {
    updateCurrentFlow(f => ({
      ...f,
      nodes: f.nodes.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...dataUpdates } } : node
      ),
      status: 'draft',
    }));
    setSelectedNode(prev => {
      if (prev && prev.id === nodeId) {
        return { ...prev, data: { ...prev.data, ...dataUpdates } };
      }
      return prev;
    });
  }, [updateCurrentFlow]);

  const deleteNode = useCallback((nodeId: string) => {
    updateCurrentFlow(f => ({
      ...f,
      nodes: f.nodes.filter(node => node.id !== nodeId),
      edges: f.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
      status: 'draft',
    }));
    setSelectedNode(null);
  }, [updateCurrentFlow]);

  const moveNode = useCallback((nodeId: string, position: { x: number; y: number }) => {
    updateCurrentFlow(f => ({
      ...f,
      nodes: f.nodes.map(node =>
        node.id === nodeId ? { ...node, position } : node
      ),
    }));
  }, [updateCurrentFlow]);

  const startConnect = useCallback((nodeId: string, handleType: 'output' | 'yes' | 'no') => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
    setConnectingHandleType(handleType);
  }, []);

  const cancelConnect = useCallback(() => {
    setIsConnecting(false);
    setConnectingFrom(null);
    setConnectingHandleType(null);
  }, []);

  const addEdge = useCallback((source: string, target: string) => {
    if (!flow) return { success: false, error: 'No flow selected' };
    if (source === target) return { success: false, error: 'Cannot connect node to itself' };
    const sourceNode = flow.nodes.find(n => n.id === source);
    const targetNode = flow.nodes.find(n => n.id === target);
    if (!sourceNode || !targetNode) return { success: false, error: 'Invalid nodes' };
    if (targetNode.type === 'start') return { success: false, error: 'Cannot connect to start node' };
    if (sourceNode.type === 'end') return { success: false, error: 'Cannot connect from end node' };
    const edgeExists = flow.edges.some(e => e.source === source && e.target === target);
    if (edgeExists) return { success: false, error: 'Connection already exists' };

    let label: string | undefined;
    if (sourceNode.type === 'condition') {
      label = connectingHandleType === 'yes' ? 'Yes' : connectingHandleType === 'no' ? 'No' : undefined;
    }

    const newEdge: FlowEdge = { id: `e-${Date.now()}`, source, target, label };
    updateCurrentFlow(f => ({
      ...f,
      edges: [...f.edges, newEdge],
      nodes: f.nodes.map(node =>
        node.id === source ? { ...node, connections: [...node.connections, target] } : node
      ),
      status: 'draft',
    }));
    cancelConnect();
    return { success: true };
  }, [flow, connectingHandleType, cancelConnect, updateCurrentFlow]);

  const deleteEdge = useCallback((edgeId: string) => {
    if (!flow) return;
    const edge = flow.edges.find(e => e.id === edgeId);
    if (!edge) return;
    updateCurrentFlow(f => ({
      ...f,
      edges: f.edges.filter(e => e.id !== edgeId),
      nodes: f.nodes.map(node =>
        node.id === edge.source
          ? { ...node, connections: node.connections.filter(c => c !== edge.target) }
          : node
      ),
      status: 'draft',
    }));
  }, [flow, updateCurrentFlow]);

  const publishFlow = useCallback(async (changelog: string) => {
    if (!flow) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newVersion: FlowVersion = {
      id: `v-${Date.now()}`,
      version: `${parseInt(flow.currentVersion) + 1}.0`,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'John Anderson',
      status: 'published',
      nodes: flow.nodes,
      edges: flow.edges,
      changelog,
    };
    updateCurrentFlow(f => ({
      ...f,
      status: 'published',
      currentVersion: newVersion.version,
      versions: [...f.versions, newVersion],
      updatedAt: new Date().toISOString().split('T')[0],
    }));
    setInitialFlowSnapshot({ nodes: flow.nodes, edges: flow.edges });
    setIsSaving(false);
    setHasUnsavedChanges(false);
  }, [flow, updateCurrentFlow]);

  const rollbackToVersion = useCallback(async (versionId: string) => {
    if (!flow) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const version = flow.versions.find(v => v.id === versionId);
    if (version) {
      updateCurrentFlow(f => ({
        ...f,
        currentVersion: version.version,
        status: 'draft',
        updatedAt: new Date().toISOString().split('T')[0],
      }));
    }
    setIsSaving(false);
  }, [flow, updateCurrentFlow]);

  const saveDraft = useCallback(async () => {
    if (!flow) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    updateCurrentFlow(f => ({
      ...f,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
    setInitialFlowSnapshot({ nodes: flow.nodes, edges: flow.edges });
    setIsSaving(false);
    setHasUnsavedChanges(false);
  }, [flow, updateCurrentFlow]);

  return {
    flows,
    flow,
    selectedFlowId,
    selectFlow,
    getFlowSummaries,
    getCategories,
    createFlow,
    deleteFlow,
    duplicateFlow,
    updateFlowMeta,
    selectedNode,
    setSelectedNode,
    isConnecting,
    setIsConnecting,
    connectingFrom,
    setConnectingFrom,
    connectingHandleType,
    isSaving,
    hasUnsavedChanges,
    addNode,
    duplicateNode,
    updateNodeData,
    deleteNode,
    moveNode,
    startConnect,
    cancelConnect,
    addEdge,
    deleteEdge,
    publishFlow,
    rollbackToVersion,
    saveDraft,
  };
}
