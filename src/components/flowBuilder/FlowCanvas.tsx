import { useRef, useState, useEffect } from 'react';
import { FlowNode } from './FlowNode';
import type { FlowNode as FlowNodeType, FlowEdge } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface FlowCanvasProps {
  nodes: FlowNodeType[];
  edges: FlowEdge[];
  selectedNode: FlowNodeType | null;
  isConnecting: boolean;
  connectingFrom: string | null;
  onSelectNode: (node: FlowNodeType | null) => void;
  onStartConnect: (nodeId: string) => void;
  onEndConnect: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, position: { x: number; y: number }) => void;
  onCanvasClick: (position: { x: number; y: number }) => void;
}

export function FlowCanvas({
  nodes,
  edges,
  selectedNode,
  isConnecting,
  connectingFrom,
  onSelectNode,
  onStartConnect,
  onEndConnect,
  onDeleteNode,
  onMoveNode,
  onCanvasClick,
}: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      onSelectNode(null);
      const x = e.clientX - canvasOffset.x;
      const y = e.clientY - canvasOffset.y;
      onCanvasClick({ x, y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isConnecting) {
      setMousePos({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
    }
  };

  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    return { x: node.position.x, y: node.position.y };
  };

  const renderEdge = (edge: FlowEdge) => {
    const sourcePos = getNodeCenter(edge.source);
    const targetPos = getNodeCenter(edge.target);
    if (!sourcePos || !targetPos) return null;

    const sourceNode = nodes.find(n => n.id === edge.source);
    
    // Calculate offset for connection points
    let startY = sourcePos.y + 30;
    let startX = sourcePos.x;
    
    // For condition nodes, offset based on yes/no
    if (sourceNode?.type === 'condition') {
      if (edge.label === 'Yes') {
        startX = sourcePos.x - 40;
      } else if (edge.label === 'No') {
        startX = sourcePos.x + 40;
      }
    }
    
    const endY = targetPos.y - 40;
    const midY = (startY + endY) / 2;

    // Create curved path
    const path = `M ${startX} ${startY} 
                  C ${startX} ${midY}, ${targetPos.x} ${midY}, ${targetPos.x} ${endY}`;

    return (
      <g key={edge.id}>
        <path
          d={path}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth="2"
          strokeOpacity="0.5"
          markerEnd="url(#arrowhead)"
        />
        {edge.label && (
          <text
            x={(startX + targetPos.x) / 2}
            y={midY - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[10px] font-medium"
          >
            {edge.label}
          </text>
        )}
      </g>
    );
  };

  const renderConnectingLine = () => {
    if (!isConnecting || !connectingFrom) return null;
    
    const sourcePos = getNodeCenter(connectingFrom);
    if (!sourcePos) return null;

    const startY = sourcePos.y + 30;
    const path = `M ${sourcePos.x} ${startY} L ${mousePos.x} ${mousePos.y}`;

    return (
      <path
        d={path}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeDasharray="5,5"
        className="animate-pulse"
      />
    );
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full overflow-auto bg-muted/20 rounded-xl border"
      onClick={handleCanvasClick}
      onMouseMove={handleMouseMove}
    >
      {/* Grid Pattern */}
      <div
        className="canvas-bg absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* SVG Layer for Edges */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="hsl(var(--muted-foreground))"
              fillOpacity="0.5"
            />
          </marker>
        </defs>
        {edges.map(renderEdge)}
        {renderConnectingLine()}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <FlowNode
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          isConnecting={isConnecting && connectingFrom !== node.id}
          onSelect={() => onSelectNode(node)}
          onStartConnect={() => onStartConnect(node.id)}
          onEndConnect={() => onEndConnect(node.id)}
          onDelete={() => onDeleteNode(node.id)}
          onMove={(pos) => onMoveNode(node.id, pos)}
          canvasOffset={canvasOffset}
        />
      ))}

      {/* Empty state hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">
            Click "Add Node" to start building your flow
          </p>
        </div>
      )}
    </div>
  );
}
