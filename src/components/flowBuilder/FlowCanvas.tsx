import { useRef, useState, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Grid3X3, MousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FlowNode } from './FlowNode';
import { DeleteEdgeModal } from './DeleteEdgeModal';
import { DeleteNodeModal } from './DeleteNodeModal';
import type { FlowNode as FlowNodeType, FlowEdge } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface FlowCanvasProps {
  nodes: FlowNodeType[];
  edges: FlowEdge[];
  selectedNode: FlowNodeType | null;
  isConnecting: boolean;
  connectingFrom: string | null;
  connectingHandleType: 'output' | 'yes' | 'no' | null;
  onSelectNode: (node: FlowNodeType | null) => void;
  onEditNode: (node: FlowNodeType) => void;
  onStartConnect: (nodeId: string, handleType: 'output' | 'yes' | 'no') => void;
  onEndConnect: (nodeId: string) => void;
  onCancelConnect: () => void;
  onDuplicateNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onMoveNode: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasClick: (position: { x: number; y: number }) => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;
const GRID_SIZE = 40;

export function FlowCanvas({
  nodes,
  edges,
  selectedNode,
  isConnecting,
  connectingFrom,
  connectingHandleType,
  onSelectNode,
  onEditNode,
  onStartConnect,
  onEndConnect,
  onCancelConnect,
  onDuplicateNode,
  onDeleteNode,
  onDeleteEdge,
  onMoveNode,
  onCanvasClick,
}: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [selectedEdge, setSelectedEdge] = useState<FlowEdge | null>(null);
  const [deleteEdgeModalOpen, setDeleteEdgeModalOpen] = useState(false);
  const [deleteNodeModalOpen, setDeleteNodeModalOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<FlowNodeType | null>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Update canvas offset on resize
  useEffect(() => {
    const updateOffset = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasOffset({ x: rect.left, y: rect.top });
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Handle panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle click or Alt+Left click to pan
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
    
    if (isConnecting) {
      setMousePos({
        x: (e.clientX - canvasOffset.x - panOffset.x) / zoom,
        y: (e.clientY - canvasOffset.y - panOffset.y) / zoom,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isConnecting) {
      onCancelConnect();
      return;
    }
    const target = e.target as HTMLElement;
    if (target === innerRef.current || target.classList.contains('canvas-grid') || target === canvasRef.current || target.closest('[data-canvas-layer]')) {
      onSelectNode(null);
      setSelectedEdge(null);
      const x = (e.clientX - canvasOffset.x - panOffset.x) / zoom;
      const y = (e.clientY - canvasOffset.y - panOffset.y) / zoom;
      onCanvasClick({ x, y });
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const handleZoomOut = () => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  const handleResetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Get node center position for edge drawing
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    return { x: node.position.x, y: node.position.y };
  };

  // Get handle position on node
  const getHandlePosition = (nodeId: string, handleType: 'input' | 'output' | 'yes' | 'no') => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    
    const nodeWidth = 180;
    const nodeHeight = 80;
    
    if (handleType === 'input') {
      return { x: node.position.x - nodeWidth / 2 - 12, y: node.position.y };
    }
    if (handleType === 'yes') {
      return { x: node.position.x + nodeWidth / 2 + 12, y: node.position.y - nodeHeight / 4 };
    }
    if (handleType === 'no') {
      return { x: node.position.x + nodeWidth / 2 + 12, y: node.position.y + nodeHeight / 4 };
    }
    // output
    return { x: node.position.x + nodeWidth / 2 + 12, y: node.position.y };
  };

  // Handle edge click
  const handleEdgeClick = (edge: FlowEdge, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEdge(edge);
    onSelectNode(null);
  };

  const handleDeleteEdge = () => {
    if (selectedEdge) {
      onDeleteEdge(selectedEdge.id);
      setSelectedEdge(null);
      setDeleteEdgeModalOpen(false);
    }
  };

  const handleConfirmDeleteNode = (node: FlowNodeType) => {
    setNodeToDelete(node);
    setDeleteNodeModalOpen(true);
  };

  const handleDeleteNodeConfirmed = () => {
    if (nodeToDelete) {
      onDeleteNode(nodeToDelete.id);
      setNodeToDelete(null);
      setDeleteNodeModalOpen(false);
    }
  };

  // Render edge
  const renderEdge = (edge: FlowEdge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;

    // Determine handle type based on label
    let sourceHandleType: 'output' | 'yes' | 'no' = 'output';
    if (edge.label === 'Yes') sourceHandleType = 'yes';
    if (edge.label === 'No') sourceHandleType = 'no';

    const startPos = getHandlePosition(edge.source, sourceHandleType);
    const endPos = getHandlePosition(edge.target, 'input');
    if (!startPos || !endPos) return null;

    // Create bezier curve
    const dx = endPos.x - startPos.x;
    const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
    
    const path = `M ${startPos.x} ${startPos.y} 
                  C ${startPos.x + controlOffset} ${startPos.y}, 
                    ${endPos.x - controlOffset} ${endPos.y}, 
                    ${endPos.x} ${endPos.y}`;

    const isSelected = selectedEdge?.id === edge.id;
    const edgeColor = edge.label === 'Yes' 
      ? 'hsl(var(--success))' 
      : edge.label === 'No' 
        ? 'hsl(var(--destructive))' 
        : 'hsl(var(--primary))';

    return (
      <g key={edge.id} className="cursor-pointer" onClick={(e) => handleEdgeClick(edge, e as unknown as React.MouseEvent)}>
        {/* Invisible wider path for easier clicking */}
        <path
          d={path}
          fill="none"
          stroke="transparent"
          strokeWidth="20"
          className="cursor-pointer"
        />
        {/* Visible edge */}
        <path
          d={path}
          fill="none"
          stroke={isSelected ? edgeColor : 'hsl(var(--muted-foreground))'}
          strokeWidth={isSelected ? 3 : 2}
          strokeOpacity={isSelected ? 1 : 0.6}
          markerEnd={`url(#arrowhead${isSelected ? '-selected' : ''})`}
          className="transition-all duration-200"
        />
        {/* Label */}
        {edge.label && (
          <g>
            <rect
              x={(startPos.x + endPos.x) / 2 - 12}
              y={(startPos.y + endPos.y) / 2 - 8}
              width="24"
              height="16"
              rx="4"
              fill={edge.label === 'Yes' ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
            />
            <text
              x={(startPos.x + endPos.x) / 2}
              y={(startPos.y + endPos.y) / 2 + 4}
              textAnchor="middle"
              className="text-[10px] font-bold fill-white pointer-events-none"
            >
              {edge.label === 'Yes' ? 'Y' : 'N'}
            </text>
          </g>
        )}
        {/* Delete button when selected */}
        {isSelected && (
          <g 
            onClick={(e) => { e.stopPropagation(); setDeleteEdgeModalOpen(true); }}
            className="cursor-pointer"
          >
            <circle
              cx={(startPos.x + endPos.x) / 2}
              cy={(startPos.y + endPos.y) / 2 + 20}
              r="12"
              fill="hsl(var(--destructive))"
              className="hover:opacity-80 transition-opacity"
            />
            <text
              x={(startPos.x + endPos.x) / 2}
              y={(startPos.y + endPos.y) / 2 + 24}
              textAnchor="middle"
              className="text-xs font-bold fill-white pointer-events-none"
            >
              ×
            </text>
          </g>
        )}
      </g>
    );
  };

  // Render connecting line
  const renderConnectingLine = () => {
    if (!isConnecting || !connectingFrom) return null;
    
    const startPos = getHandlePosition(connectingFrom, connectingHandleType || 'output');
    if (!startPos) return null;

    const dx = mousePos.x - startPos.x;
    const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);
    
    const path = `M ${startPos.x} ${startPos.y} 
                  C ${startPos.x + controlOffset} ${startPos.y}, 
                    ${mousePos.x - controlOffset} ${mousePos.y}, 
                    ${mousePos.x} ${mousePos.y}`;

    return (
      <g>
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeDasharray="8,4"
          className="animate-pulse"
        />
        {/* Target indicator */}
        <circle
          cx={mousePos.x}
          cy={mousePos.y}
          r="8"
          fill="hsl(var(--primary))"
          fillOpacity="0.3"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="animate-pulse"
        />
      </g>
    );
  };

  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <div
        ref={canvasRef}
        className={cn(
          'w-full h-full overflow-hidden bg-muted/20 rounded-xl border',
          isPanning && 'cursor-grabbing',
          !isPanning && 'cursor-default'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Transformed content */}
        <div
          ref={innerRef}
          className="w-full h-full origin-top-left"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
          }}
        >
          {/* Grid Pattern */}
          {showGrid && (
            <div
              className="canvas-grid absolute pointer-events-none"
              style={{
                width: 5000,
                height: 5000,
                left: -2500,
                top: -2500,
                backgroundImage: `
                  linear-gradient(hsl(var(--border) / 0.4) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--border) / 0.4) 1px, transparent 1px)
                `,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              }}
            />
          )}

          {/* SVG Layer for Edges */}
          <svg 
            className="absolute pointer-events-none"
            style={{
              width: 5000,
              height: 5000,
              left: -2500,
              top: -2500,
              overflow: 'visible',
            }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
              >
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity="0.6"
                />
              </marker>
              <marker
                id="arrowhead-selected"
                markerWidth="12"
                markerHeight="8"
                refX="10"
                refY="4"
                orient="auto"
              >
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill="hsl(var(--primary))"
                />
              </marker>
            </defs>
            <g style={{ transform: 'translate(2500px, 2500px)' }}>
              {edges.map(renderEdge)}
              {renderConnectingLine()}
            </g>
          </svg>

          {/* Nodes */}
          <div 
            className="absolute"
            data-canvas-layer="nodes"
            style={{
              width: 5000,
              height: 5000,
              left: -2500,
              top: -2500,
            }}
          >
            <div style={{ transform: 'translate(2500px, 2500px)' }}>
              {nodes.map(node => (
                <FlowNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  isConnecting={isConnecting && connectingFrom !== node.id}
                  zoom={zoom}
                  onSelect={() => { onSelectNode(node); setSelectedEdge(null); }}
                  onEdit={() => onEditNode(node)}
                  onStartConnect={(handleType) => onStartConnect(node.id, handleType)}
                  onEndConnect={() => onEndConnect(node.id)}
                  onDuplicate={() => onDuplicateNode(node.id)}
                  onDelete={() => handleConfirmDeleteNode(node)}
                  onMove={(pos) => onMoveNode(node.id, pos)}
                  canvasOffset={canvasOffset}
                  panOffset={panOffset}
                  gridSize={GRID_SIZE}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <TooltipProvider>
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-card/90 backdrop-blur-sm rounded-lg border p-1 shadow-lg">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          
          <span className="text-xs font-medium min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
          
          <div className="w-px h-6 bg-border" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleResetView}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant={showGrid ? 'secondary' : 'ghost'} 
                size="icon" 
                className="h-8 w-8"
                onClick={() => setShowGrid(!showGrid)}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Grid</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* Pan hint */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-card/80 backdrop-blur-sm px-2 py-1 rounded border">
        <MousePointer className="w-3 h-3 inline mr-1" />
        Alt + Drag or Middle-click to pan • Ctrl + Scroll to zoom
      </div>

      {/* Connection mode indicator */}
      {isConnecting && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg animate-pulse flex items-center gap-2">
          <span className="w-2 h-2 bg-primary-foreground rounded-full animate-ping" />
          Drop on a node's input handle to connect • Click canvas to cancel
        </div>
      )}

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-muted-foreground text-sm">
            Click "Add Node" to start building your flow
          </p>
        </div>
      )}

      {/* Modals */}
      <DeleteEdgeModal
        open={deleteEdgeModalOpen}
        onOpenChange={setDeleteEdgeModalOpen}
        onConfirm={handleDeleteEdge}
      />
      
      <DeleteNodeModal
        open={deleteNodeModalOpen}
        onOpenChange={setDeleteNodeModalOpen}
        onConfirm={handleDeleteNodeConfirmed}
        nodeName={nodeToDelete?.data.label}
      />
    </div>
  );
}
