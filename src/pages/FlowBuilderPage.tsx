import { useState, useEffect } from 'react';
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
import { LivePreviewPanel } from '@/components/flowBuilder/LivePreviewPanel';
import { UnsavedChangesModal } from '@/components/flowBuilder/UnsavedChangesModal';
import { FlowListView } from '@/components/flowBuilder/FlowListView';
import { NodeToolsSidebar } from '@/components/flowBuilder/NodeToolsSidebar';
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

  const [showPreview, setShowPreview] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

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

  const handleAddNode = (type: NodeType) => {
    withPermission('edit', () => {
      const position = { x: 400 + Math.random() * 200, y: 300 + Math.random() * 100 };
      addNode(type, position);
      notify.created(`${NODE_TYPE_CONFIG[type].label} node added`);
    });
  };

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
                Flows
              </button>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-foreground font-semibold truncate">{flow.name}</span>
            </div>
            <Badge
              variant={flow.status === 'published' ? 'default' : 'secondary'}
              className={cn('ml-2 text-xs', flow.status === 'published' && 'bg-success')}
            >
              {flow.status}
            </Badge>
            <Badge variant="outline" className="text-xs">v{flow.currentVersion}</Badge>
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
              Preview
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
          <NodeToolsSidebar onAddNode={handleAddNode} canEdit={canEdit} />

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
            />
          )}

          {showPreview && (
            <LivePreviewPanel flow={flow} />
          )}
        </div>
      </div>

      <PublishFlowModal
        flow={flow}
        open={publishModalOpen}
        onOpenChange={setPublishModalOpen}
        onPublish={handlePublish}
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
