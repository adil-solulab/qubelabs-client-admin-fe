import { useState, useEffect } from 'react';
import {
  GitBranch,
  Plus,
  Save,
  Rocket,
  History,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFlowBuilderData } from '@/hooks/useFlowBuilderData';
import { usePermission } from '@/hooks/usePermission';
import { FlowCanvas } from '@/components/flowBuilder/FlowCanvas';
import { NodePropertiesPanel } from '@/components/flowBuilder/NodePropertiesPanel';
import { PublishFlowModal } from '@/components/flowBuilder/PublishFlowModal';
import { RollbackModal } from '@/components/flowBuilder/RollbackModal';
import { LivePreviewPanel } from '@/components/flowBuilder/LivePreviewPanel';
import { UnsavedChangesModal } from '@/components/flowBuilder/UnsavedChangesModal';
import { NODE_TYPE_CONFIG, type NodeType } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

export default function FlowBuilderPage() {
  const {
    flow,
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

  const [showPreview, setShowPreview] = useState(true);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Warn user before leaving with unsaved changes
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
      const newNode = addNode(type, position);
      setSelectedNode(newNode);
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

  const handleCanvasClick = (position: { x: number; y: number }) => {
    // Optional: could open node type picker at position
  };

  const handleSaveDraft = async () => {
    withPermission('edit', async () => {
      await saveDraft();
      notify.saved('Flow saved as draft');
    });
  };

  const handlePublish = async (changelog: string) => {
    withPermission('publish', async () => {
      await publishFlow(changelog);
      notify.success(`Version ${parseInt(flow.currentVersion) + 1}.0 published!`);
    });
  };

  const handleRollback = async (versionId: string) => {
    withPermission('edit', async () => {
      const version = flow.versions.find(v => v.id === versionId);
      await rollbackToVersion(versionId);
      notify.success(`Restored to version ${version?.version}`);
    });
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

  const nodeTypes: NodeType[] = ['message', 'condition', 'api_call', 'transfer', 'end'];

  return (
    <AppLayout>
      <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{flow.name}</h1>
                <Badge
                  variant={flow.status === 'published' ? 'default' : 'secondary'}
                  className={cn(flow.status === 'published' && 'bg-success')}
                >
                  {flow.status}
                </Badge>
                <Badge variant="outline">v{flow.currentVersion}</Badge>
                {hasUnsavedChanges && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Unsaved
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{flow.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Node */}
            {canEdit ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Node
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {nodeTypes.map(type => {
                    const config = NODE_TYPE_CONFIG[type];
                    return (
                      <DropdownMenuItem key={type} onClick={() => handleAddNode(type)}>
                        <span className="mr-2">{config.icon}</span>
                        {config.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" disabled className="opacity-50">
                    <Lock className="w-4 h-4 mr-2" />
                    Add Node
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit permission required</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Preview Toggle */}
            <Button
              variant={showPreview ? 'secondary' : 'outline'}
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              Preview
            </Button>

            {/* Rollback */}
            <Button variant="outline" onClick={() => setRollbackModalOpen(true)}>
              <History className="w-4 h-4 mr-2" />
              Versions
            </Button>

            {/* Save Draft */}
            {canEdit ? (
              <Button 
                variant={hasUnsavedChanges ? 'default' : 'outline'} 
                onClick={handleSaveDraft} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" disabled className="opacity-50">
                    <Lock className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit permission required</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Publish */}
            {canPublish ? (
              <Button onClick={() => setPublishModalOpen(true)}>
                <Rocket className="w-4 h-4 mr-2" />
                Publish
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button disabled className="opacity-50">
                    <Lock className="w-4 h-4 mr-2" />
                    Publish
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Publish permission required</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Canvas */}
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
              onDeleteNode={deleteNode}
              onDeleteEdge={deleteEdge}
              onMoveNode={moveNode}
              onCanvasClick={handleCanvasClick}
            />
          </div>

          {/* Right Panel */}
          <div className="flex gap-4 flex-shrink-0">
            {/* Properties Panel */}
            {selectedNode && (
              <NodePropertiesPanel
                node={selectedNode}
                onUpdate={(updates) => updateNodeData(selectedNode.id, updates)}
                onDelete={() => deleteNode(selectedNode.id)}
                onClose={() => setSelectedNode(null)}
              />
            )}

            {/* Live Preview */}
            {showPreview && (
              <LivePreviewPanel flow={flow} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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
