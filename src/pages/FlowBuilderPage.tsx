import { useState } from 'react';
import {
  GitBranch,
  Plus,
  Save,
  Rocket,
  History,
  Play,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useFlowBuilderData } from '@/hooks/useFlowBuilderData';
import { useToast } from '@/hooks/use-toast';
import { FlowCanvas } from '@/components/flowBuilder/FlowCanvas';
import { NodePropertiesPanel } from '@/components/flowBuilder/NodePropertiesPanel';
import { PublishFlowModal } from '@/components/flowBuilder/PublishFlowModal';
import { RollbackModal } from '@/components/flowBuilder/RollbackModal';
import { LivePreviewPanel } from '@/components/flowBuilder/LivePreviewPanel';
import { NODE_TYPE_CONFIG, type NodeType } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

export default function FlowBuilderPage() {
  const { toast } = useToast();
  const {
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
    publishFlow,
    rollbackToVersion,
    saveDraft,
  } = useFlowBuilderData();

  const [showPreview, setShowPreview] = useState(true);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [rollbackModalOpen, setRollbackModalOpen] = useState(false);
  const [addNodePosition, setAddNodePosition] = useState<{ x: number; y: number } | null>(null);

  const handleAddNode = (type: NodeType) => {
    const position = addNodePosition || { x: 400, y: 300 };
    const newNode = addNode(type, position);
    setSelectedNode(newNode);
    setAddNodePosition(null);
    toast({
      title: 'Node Added',
      description: `Added new ${NODE_TYPE_CONFIG[type].label} node`,
    });
  };

  const handleCanvasClick = (position: { x: number; y: number }) => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectingFrom(null);
    } else {
      setAddNodePosition(position);
    }
  };

  const handleStartConnect = (nodeId: string) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
  };

  const handleEndConnect = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      addEdge(connectingFrom, nodeId);
      toast({
        title: 'Connection Created',
        description: 'Nodes connected successfully',
      });
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  };

  const handleSaveDraft = async () => {
    await saveDraft();
    toast({
      title: 'Draft Saved',
      description: 'Your flow has been saved as draft.',
    });
  };

  const handlePublish = async (changelog: string) => {
    await publishFlow(changelog);
    toast({
      title: 'Flow Published',
      description: `Version ${parseInt(flow.currentVersion) + 1}.0 is now live!`,
    });
  };

  const handleRollback = async (versionId: string) => {
    const version = flow.versions.find(v => v.id === versionId);
    await rollbackToVersion(versionId);
    toast({
      title: 'Rollback Complete',
      description: `Restored to version ${version?.version}`,
    });
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
              </div>
              <p className="text-sm text-muted-foreground">{flow.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Add Node */}
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
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>

            {/* Publish */}
            <Button onClick={() => setPublishModalOpen(true)}>
              <Rocket className="w-4 h-4 mr-2" />
              Publish
            </Button>
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
              onSelectNode={setSelectedNode}
              onStartConnect={handleStartConnect}
              onEndConnect={handleEndConnect}
              onDeleteNode={deleteNode}
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

        {/* Connection Mode Indicator */}
        {isConnecting && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg animate-pulse">
            Click a node to connect, or click canvas to cancel
          </div>
        )}
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
    </AppLayout>
  );
}
