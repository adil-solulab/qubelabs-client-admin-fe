import { useState, useRef, useEffect } from 'react';
import { Trash2, Link2, GripVertical, MoreHorizontal, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NodeContextMenu } from './NodeContextMenu';
import type { FlowNode as FlowNodeType } from '@/types/flowBuilder';
import { NODE_TYPE_CONFIG } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected: boolean;
  isConnecting: boolean;
  connectingFromType?: 'output' | 'yes' | 'no';
  zoom: number;
  onSelect: () => void;
  onEdit: () => void;
  onStartConnect: (handleType: 'output' | 'yes' | 'no') => void;
  onEndConnect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove: (position: { x: number; y: number }) => void;
  canvasOffset: { x: number; y: number };
  panOffset: { x: number; y: number };
  gridSize: number;
}

export function FlowNode({
  node,
  isSelected,
  isConnecting,
  zoom,
  onSelect,
  onEdit,
  onStartConnect,
  onEndConnect,
  onDuplicate,
  onDelete,
  onMove,
  canvasOffset,
  panOffset,
  gridSize,
}: FlowNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSnapGuides, setShowSnapGuides] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const config = NODE_TYPE_CONFIG[node.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || 
        (e.target as HTMLElement).closest('[data-handle]')) return;
    
    e.stopPropagation();
    e.preventDefault();
    onSelect();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate position accounting for zoom and pan
      const rawX = (e.clientX - canvasOffset.x - panOffset.x) / zoom - dragOffset.x;
      const rawY = (e.clientY - canvasOffset.y - panOffset.y) / zoom - dragOffset.y;
      
      // Snap to grid
      const snappedX = Math.round(rawX / gridSize) * gridSize;
      const snappedY = Math.round(rawY / gridSize) * gridSize;
      
      setShowSnapGuides(true);
      onMove({ x: Math.max(50, snappedX), y: Math.max(50, snappedY) });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setShowSnapGuides(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, canvasOffset, panOffset, zoom, gridSize, onMove]);

  const handleStartConnect = (handleType: 'output' | 'yes' | 'no') => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onStartConnect(handleType);
  };

  const handleEndConnection = (e: React.MouseEvent) => {
    if (isConnecting) {
      e.stopPropagation();
      e.preventDefault();
      onEndConnect();
    }
  };

  return (
    <NodeContextMenu
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onConnect={() => onStartConnect('output')}
      onDelete={onDelete}
      canDelete={node.type !== 'start'}
    >
      <div
        ref={nodeRef}
        className={cn(
          'absolute cursor-grab select-none transition-all duration-150',
          isDragging && 'cursor-grabbing z-50 scale-105',
          isSelected && 'z-40',
          showSnapGuides && 'transition-none'
        )}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: 'translate(-50%, -50%)',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Input Handle - Left side */}
        {node.type !== 'start' && (
          <div
            data-handle="input"
            className={cn(
              'absolute -left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full',
              'bg-card border-2 border-muted-foreground/50 cursor-crosshair',
              'transition-all duration-200 hover:scale-125 hover:border-primary hover:bg-primary/20',
              isConnecting && 'border-primary bg-primary/30 scale-125 animate-pulse'
            )}
            title="Drop connection here"
            onClick={handleEndConnection}
          />
        )}

        <div
          className={cn(
            'relative min-w-[180px] rounded-xl border-2 shadow-lg transition-all duration-200',
            config.bgColor,
            config.borderColor,
            isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-xl',
            isConnecting && node.type !== 'start' && 'ring-2 ring-success/50 ring-offset-2',
            isDragging && 'shadow-2xl'
          )}
        >
          {/* Header */}
          <div className={cn('px-3 py-2 rounded-t-lg border-b flex items-center gap-2', config.borderColor)}>
            <span className="text-lg">{config.icon}</span>
            <span className="text-xs font-medium text-muted-foreground flex-1">{config.label}</span>
            <GripVertical className="w-3 h-3 text-muted-foreground/50" />
            
            {/* Menu Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 p-0 hover:bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartConnect('output'); }}>
                  <Link2 className="w-4 h-4 mr-2" />
                  Connect
                </DropdownMenuItem>
                {node.type !== 'start' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate max-w-[160px]">{node.data.label}</p>
            {node.data.content && (
              <p className="text-xs text-muted-foreground truncate max-w-[160px] mt-1">
                {node.data.content}
              </p>
            )}
            {node.type === 'condition' && node.data.condition && (
              <p className="text-xs text-warning mt-1 truncate max-w-[160px]">
                {node.data.condition.variable} {node.data.condition.operator} "{node.data.condition.value}"
              </p>
            )}
            {node.type === 'api_call' && node.data.apiConfig && (
              <p className="text-xs text-blue-500 mt-1 truncate max-w-[160px]">
                {node.data.apiConfig.method} {node.data.apiConfig.url.slice(0, 20)}...
              </p>
            )}
          </div>
        </div>

        {/* Output Handles - Right side */}
        {node.type !== 'end' && (
          <>
            {node.type === 'condition' ? (
              <>
                {/* Yes handle */}
                <div
                  data-handle="yes"
                  className={cn(
                    'absolute -right-3 top-1/3 -translate-y-1/2 w-5 h-5 rounded-full',
                    'bg-success border-2 border-success cursor-crosshair',
                    'transition-all duration-200 hover:scale-150 hover:shadow-lg hover:shadow-success/50',
                    'flex items-center justify-center'
                  )}
                  title="Yes - Drag to connect"
                  onMouseDown={handleStartConnect('yes')}
                >
                  <span className="text-[8px] font-bold text-success-foreground">Y</span>
                </div>
                {/* No handle */}
                <div
                  data-handle="no"
                  className={cn(
                    'absolute -right-3 top-2/3 -translate-y-1/2 w-5 h-5 rounded-full',
                    'bg-destructive border-2 border-destructive cursor-crosshair',
                    'transition-all duration-200 hover:scale-150 hover:shadow-lg hover:shadow-destructive/50',
                    'flex items-center justify-center'
                  )}
                  title="No - Drag to connect"
                  onMouseDown={handleStartConnect('no')}
                >
                  <span className="text-[8px] font-bold text-destructive-foreground">N</span>
                </div>
              </>
            ) : (
              <div
                data-handle="output"
                className={cn(
                  'absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full',
                  'bg-primary border-2 border-primary cursor-crosshair',
                  'transition-all duration-200 hover:scale-150 hover:shadow-lg hover:shadow-primary/50'
                )}
                title="Drag to connect"
                onMouseDown={handleStartConnect('output')}
              />
            )}
          </>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -inset-1 border-2 border-primary/30 rounded-xl pointer-events-none" />
        )}
      </div>
    </NodeContextMenu>
  );
}
