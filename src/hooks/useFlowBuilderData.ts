import { useState, useCallback } from 'react';
import type { Flow, FlowNode, FlowEdge, FlowVersion, NodeType, NodeData } from '@/types/flowBuilder';

const generateMockFlow = (): Flow => ({
  id: '1',
  name: 'Customer Support Flow',
  description: 'Main customer support conversation flow',
  currentVersion: '2.1',
  status: 'draft',
  nodes: [
    {
      id: 'start-1',
      type: 'start',
      position: { x: 400, y: 50 },
      data: { label: 'Start' },
      connections: ['msg-1'],
    },
    {
      id: 'msg-1',
      type: 'message',
      position: { x: 400, y: 150 },
      data: { label: 'Welcome Message', content: 'Hello! How can I help you today?' },
      connections: ['cond-1'],
    },
    {
      id: 'cond-1',
      type: 'condition',
      position: { x: 400, y: 280 },
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
      position: { x: 250, y: 420 },
      data: { label: 'Sales Response', content: 'Let me connect you with our sales team!' },
      connections: ['transfer-1'],
    },
    {
      id: 'msg-3',
      type: 'message',
      position: { x: 550, y: 420 },
      data: { label: 'Support Response', content: 'I\'ll help you with support.' },
      connections: ['api-1'],
    },
    {
      id: 'transfer-1',
      type: 'transfer',
      position: { x: 250, y: 550 },
      data: { label: 'Transfer to Sales', transferTo: 'Sales Team' },
      connections: ['end-1'],
    },
    {
      id: 'api-1',
      type: 'api_call',
      position: { x: 550, y: 550 },
      data: {
        label: 'Get User Info',
        apiConfig: { method: 'GET', url: '/api/user/{userId}' },
      },
      connections: ['end-2'],
    },
    {
      id: 'end-1',
      type: 'end',
      position: { x: 250, y: 680 },
      data: { label: 'End (Sales)' },
      connections: [],
    },
    {
      id: 'end-2',
      type: 'end',
      position: { x: 550, y: 680 },
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
    {
      id: 'v1',
      version: '1.0',
      createdAt: '2024-04-01',
      createdBy: 'John Anderson',
      status: 'published',
      nodes: [],
      edges: [],
      changelog: 'Initial flow creation',
    },
    {
      id: 'v2',
      version: '2.0',
      createdAt: '2024-04-15',
      createdBy: 'Sarah Mitchell',
      status: 'published',
      nodes: [],
      edges: [],
      changelog: 'Added conditional branching for sales vs support',
    },
    {
      id: 'v3',
      version: '2.1',
      createdAt: '2024-05-01',
      createdBy: 'John Anderson',
      status: 'draft',
      nodes: [],
      edges: [],
      changelog: 'Added API call node for user lookup',
    },
  ],
  createdAt: '2024-04-01',
  updatedAt: '2024-05-01',
});

export function useFlowBuilderData() {
  const [flow, setFlow] = useState<Flow>(generateMockFlow());
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      },
      connections: [],
    };

    setFlow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      status: 'draft',
    }));

    return newNode;
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<FlowNode>) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, ...updates } : node
      ),
      status: 'draft',
    }));
  }, []);

  const updateNodeData = useCallback((nodeId: string, dataUpdates: Partial<NodeData>) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...dataUpdates } } : node
      ),
      status: 'draft',
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId),
      status: 'draft',
    }));
    setSelectedNode(null);
  }, []);

  const moveNode = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, position } : node
      ),
    }));
  }, []);

  const addEdge = useCallback((source: string, target: string, label?: string) => {
    const edgeExists = flow.edges.some(e => e.source === source && e.target === target);
    if (edgeExists) return;

    const newEdge: FlowEdge = {
      id: `e-${Date.now()}`,
      source,
      target,
      label,
    };

    setFlow(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
      nodes: prev.nodes.map(node =>
        node.id === source
          ? { ...node, connections: [...node.connections, target] }
          : node
      ),
      status: 'draft',
    }));
  }, [flow.edges]);

  const deleteEdge = useCallback((edgeId: string) => {
    const edge = flow.edges.find(e => e.id === edgeId);
    if (!edge) return;

    setFlow(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== edgeId),
      nodes: prev.nodes.map(node =>
        node.id === edge.source
          ? { ...node, connections: node.connections.filter(c => c !== edge.target) }
          : node
      ),
      status: 'draft',
    }));
  }, [flow.edges]);

  const publishFlow = useCallback(async (changelog: string) => {
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

    setFlow(prev => ({
      ...prev,
      status: 'published',
      currentVersion: newVersion.version,
      versions: [...prev.versions, newVersion],
      updatedAt: new Date().toISOString().split('T')[0],
    }));

    setIsSaving(false);
  }, [flow]);

  const rollbackToVersion = useCallback(async (versionId: string) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const version = flow.versions.find(v => v.id === versionId);
    if (version) {
      setFlow(prev => ({
        ...prev,
        currentVersion: version.version,
        status: 'draft',
        updatedAt: new Date().toISOString().split('T')[0],
      }));
    }

    setIsSaving(false);
  }, [flow.versions]);

  const saveDraft = useCallback(async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setFlow(prev => ({
      ...prev,
      updatedAt: new Date().toISOString().split('T')[0],
    }));
    setIsSaving(false);
  }, []);

  return {
    flow,
    selectedNode,
    setSelectedNode,
    isConnecting,
    setIsConnecting,
    connectingFrom,
    setConnectingFrom,
    isSaving,
    addNode,
    updateNode,
    updateNodeData,
    deleteNode,
    moveNode,
    addEdge,
    deleteEdge,
    publishFlow,
    rollbackToVersion,
    saveDraft,
  };
}
