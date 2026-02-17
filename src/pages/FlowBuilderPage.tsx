import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Rocket,
  History,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Lock,
  ChevronRight,
  Phone,
  MessageSquare,
  Mail,
  GitBranch,
  Zap,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useFlowBuilderData } from '@/hooks/useFlowBuilderData';
import { usePermission } from '@/hooks/usePermission';
import { FlowCanvas } from '@/components/flowBuilder/FlowCanvas';
import { NodePropertiesPanel } from '@/components/flowBuilder/NodePropertiesPanel';
import { PublishFlowModal } from '@/components/flowBuilder/PublishFlowModal';
import { RollbackModal } from '@/components/flowBuilder/RollbackModal';
import { TestPanel } from '@/components/flowBuilder/TestPanel';
import { UnsavedChangesModal } from '@/components/flowBuilder/UnsavedChangesModal';
import { FlowListView } from '@/components/flowBuilder/FlowListView';
import { NodeToolsSidebar } from '@/components/flowBuilder/NodeToolsSidebar';
import { WorkflowSelectionModal } from '@/components/flowBuilder/WorkflowSelectionModal';
import { NODE_TYPE_CONFIG, type NodeType } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

export default function FlowBuilderPage() {
  const {
    flow,
    selectedFlowId,
    selectFlow,
    getFlowSummaries,
    getCategories,
    createFlow,
    deleteFlow,
    duplicateFlow,
    createFolder,
    renameFolder,
    deleteFolder,
    selectedNode,
    setSelectedNode,
    isConnecting,
    connectingFrom,
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
  } = useFlowBuilderData();

  const { canEdit, canPublish, withPermission } = usePermission('flow-builder');
  const [searchParams, setSearchParams] = useSearchParams();

  const [showPreview, setShowPreview] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowModalMode, setWorkflowModalMode] = useState<'add' | 'change'>('add');
  const [editingRunWorkflowNodeId, setEditingRunWorkflowNodeId] = useState<string | null>(null);
  const [returnToFlowId, setReturnToFlowId] = useState<string | null>(null);
  const hasHandledOpenFlow = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    const openFlow = searchParams.get('openFlow');
    if (openFlow && !hasHandledOpenFlow.current) {
      hasHandledOpenFlow.current = true;
      const summaries = getFlowSummaries();
      const existing = summaries.find(f => f.name === openFlow);
      if (existing) {
        selectFlow(existing.id);
      } else {
        const newFlow = createFlow(openFlow, `${openFlow} flow`, 'Base', 'chat', 'flow');
        selectFlow(newFlow.id);
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, getFlowSummaries, selectFlow, createFlow, setSearchParams]);

  const handleAddNode = (type: NodeType) => {
    withPermission('edit', () => {
      if (type === 'run_workflow') {
        setWorkflowModalMode('add');
        setEditingRunWorkflowNodeId(null);
        setWorkflowModalOpen(true);
        return;
      }
      const position = { x: 400 + Math.random() * 200, y: 300 + Math.random() * 100 };
      addNode(type, position);
      notify.created(`${NODE_TYPE_CONFIG[type].label} node added`);
    });
  };

  const handleOpenChangeWorkflow = (nodeId: string) => {
    setWorkflowModalMode('change');
    setEditingRunWorkflowNodeId(nodeId);
    setWorkflowModalOpen(true);
  };

  const handleSelectWorkflow = (workflow: { id: string; name: string }, outputs: { name: string; type: string }[]) => {
    const configUpdate = {
      label: `Run: ${workflow.name}`,
      runWorkflowConfig: {
        targetWorkflowId: workflow.id,
        targetWorkflowName: workflow.name,
        outputs,
      },
    };

    if (workflowModalMode === 'change' && editingRunWorkflowNodeId) {
      updateNodeData(editingRunWorkflowNodeId, configUpdate);
      notify.success(`Workflow changed to: ${workflow.name}`);
    } else {
      const position = { x: 400 + Math.random() * 200, y: 300 + Math.random() * 100 };
      const newNode = addNode('run_workflow', position);
      updateNodeData(newNode.id, configUpdate);
      notify.created(`Run Workflow node added: ${workflow.name}`);
    }

    setWorkflowModalOpen(false);
    setEditingRunWorkflowNodeId(null);
  };

  const handleCreateNewWorkflow = () => {
    if (flow) {
      setReturnToFlowId(flow.id);
    }
    const newWorkflow = createFlow('New Workflow', 'Backend automation workflow', 'Operations', 'chat', 'workflow');
    setWorkflowModalOpen(false);
    selectFlow(newWorkflow.id);
    notify.created('New workflow created — you can return to your flow after publishing');
  };

  const handleReturnToFlow = () => {
    if (returnToFlowId) {
      selectFlow(returnToFlowId);
      setReturnToFlowId(null);
      notify.success('Returned to flow');
    }
  };

  const workflowSummaries = getFlowSummaries().filter(f => f.flowType === 'workflow');

  const handleStartConnect = (nodeId: string, handleType: 'output' | 'yes' | 'no') => {
    startConnect(nodeId, handleType);
  };

  const handleEndConnect = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      const result = addEdge(connectingFrom, nodeId);
      if (result.success) {
        notify.success('Nodes connected');
      } else {
        notify.error(result.error || 'Invalid connection');
      }
    }
    cancelConnect();
  };

  const handleEditNode = (node: typeof selectedNode) => {
    setSelectedNode(node);
  };

  const handleDuplicateNode = (nodeId: string) => {
    withPermission('edit', () => {
      const newNode = duplicateNode(nodeId);
      if (newNode) {
        setSelectedNode(newNode);
        notify.created('Node duplicated');
      }
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    if (!flow) return;
    const node = flow.nodes.find(n => n.id === nodeId);
    deleteNode(nodeId);
    notify.deleted(`Node "${node?.data.label || 'Unknown'}" deleted`);
  };

  const handleSaveDraft = async () => {
    withPermission('edit', async () => {
      await saveDraft();
      notify.saved('Flow saved as draft');
    });
  };

  const handlePublish = async (changelog: string) => {
    withPermission('publish', async () => {
      if (!flow) return;
      await publishFlow(changelog);
      notify.success(`Version ${parseInt(flow.currentVersion) + 1}.0 published!`);
    });
  };

  const handleRollback = async (versionId: string) => {
    withPermission('edit', async () => {
      if (!flow) return;
      const version = flow.versions.find(v => v.id === versionId);
      await rollbackToVersion(versionId);
      notify.success(`Restored to version ${version?.version}`);
    });
  };

  const handleBackToList = () => {
    if (hasUnsavedChanges) {
      setPendingNavigation(() => () => selectFlow(null));
      setUnsavedChangesModalOpen(true);
    } else {
      selectFlow(null);
    }
  };

  const handleDiscardChanges = () => {
    setUnsavedChangesModalOpen(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  const handleSaveAndContinue = async () => {
    await saveDraft();
    setUnsavedChangesModalOpen(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  };

  if (!selectedFlowId || !flow) {
    return (
      <AppLayout>
        <FlowListView
          flowSummaries={getFlowSummaries()}
          categories={getCategories()}
          onSelectFlow={(id) => selectFlow(id)}
          onCreateFlow={createFlow}
          onDeleteFlow={deleteFlow}
          onDuplicateFlow={(id) => {
            duplicateFlow(id);
            notify.created('Flow duplicated');
          }}
          onCreateFolder={createFolder}
          onRenameFolder={renameFolder}
          onDeleteFolder={deleteFolder}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
        <div className="flex items-center justify-between gap-4 mb-3 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={handleBackToList}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
              <button
                className="hover:text-primary transition-colors cursor-pointer"
                onClick={handleBackToList}
              >
                Builders
              </button>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-foreground font-semibold truncate">{flow.name}</span>
            </div>
            <Badge variant="outline" className="text-xs gap-1 ml-1">
              {flow.flowType === 'workflow' ? (
                <Zap className="w-3 h-3" />
              ) : (
                <GitBranch className="w-3 h-3" />
              )}
              {flow.flowType === 'workflow' ? 'Workflow' : 'Flow'}
            </Badge>
            <Badge
              variant={flow.status === 'published' ? 'default' : 'secondary'}
              className={cn('ml-1 text-xs', flow.status === 'published' && 'bg-success')}
            >
              {flow.status}
            </Badge>
            <Badge variant="outline" className="text-xs">v{flow.currentVersion}</Badge>
            <Badge variant="outline" className="text-xs gap-1">
              {flow.channel === 'voice' && <Phone className="w-3 h-3" />}
              {flow.channel === 'chat' && <MessageSquare className="w-3 h-3" />}
              {flow.channel === 'email' && <Mail className="w-3 h-3" />}
              {flow.channel.charAt(0).toUpperCase() + flow.channel.slice(1)}
            </Badge>
            {hasUnsavedChanges && (
              <Badge variant="destructive" className="gap-1 text-xs">
                <AlertCircle className="w-3 h-3" />
                Unsaved
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant={showPreview ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-1.5" /> : <Eye className="w-4 h-4 mr-1.5" />}
              Test
            </Button>

            <Button variant="ghost" size="sm" onClick={() => setRollbackModalOpen(true)}>
              <History className="w-4 h-4 mr-1.5" />
              Versions
            </Button>

            {canEdit ? (
              <Button
                variant={hasUnsavedChanges ? 'default' : 'ghost'}
                size="sm"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1.5" />
                )}
                Save
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" disabled className="opacity-50">
                    <Lock className="w-4 h-4 mr-1.5" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Edit permission required</p></TooltipContent>
              </Tooltip>
            )}

            {canPublish ? (
              <Button size="sm" onClick={() => setPublishModalOpen(true)}>
                <Rocket className="w-4 h-4 mr-1.5" />
                Publish
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" disabled className="opacity-50">
                    <Lock className="w-4 h-4 mr-1.5" />
                    Publish
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>Publish permission required</p></TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="flex-1 flex min-h-0 border rounded-xl overflow-hidden">
          <NodeToolsSidebar onAddNode={handleAddNode} canEdit={canEdit} flowType={flow.flowType} />

          <div className="flex-1 min-w-0">
            <FlowCanvas
              nodes={flow.nodes}
              edges={flow.edges}
              selectedNode={selectedNode}
              isConnecting={isConnecting}
              connectingFrom={connectingFrom}
              connectingHandleType={connectingHandleType}
              onSelectNode={setSelectedNode}
              onEditNode={handleEditNode}
              onStartConnect={handleStartConnect}
              onEndConnect={handleEndConnect}
              onCancelConnect={cancelConnect}
              onDuplicateNode={handleDuplicateNode}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={(edgeId) => {
                deleteEdge(edgeId);
                notify.deleted('Connection removed');
              }}
              onMoveNode={moveNode}
              onCanvasClick={() => {}}
            />
          </div>

          {selectedNode && (
            <NodePropertiesPanel
              node={selectedNode}
              onUpdate={(updates) => updateNodeData(selectedNode.id, updates)}
              onDelete={() => deleteNode(selectedNode.id)}
              onClose={() => setSelectedNode(null)}
              onOpenWorkflowModal={() => handleOpenChangeWorkflow(selectedNode.id)}
              flowNodes={flow.nodes}
            />
          )}

          {showPreview && (
            <TestPanel flow={flow} />
          )}
        </div>
      </div>

      <WorkflowSelectionModal
        open={workflowModalOpen}
        onOpenChange={setWorkflowModalOpen}
        workflows={workflowSummaries}
        onSelectWorkflow={handleSelectWorkflow}
        onCreateWorkflow={handleCreateNewWorkflow}
      />

      <PublishFlowModal
        flow={flow}
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        onPublish={handlePublish}
        returnToFlowId={returnToFlowId}
        onReturnToFlow={handleReturnToFlow}
      />

      <RollbackModal
        versions={flow.versions}
        currentVersion={flow.currentVersion}
        open={rollbackModalOpen}
        onOpenChange={setRollbackModalOpen}
        onRollback={handleRollback}
      />

      <UnsavedChangesModal
        open={unsavedChangesModalOpen}
        onOpenChange={setUnsavedChangesModalOpen}
        onSave={handleSaveAndContinue}
        onDiscard={handleDiscardChanges}
      />
    </AppLayout>
  );
}
