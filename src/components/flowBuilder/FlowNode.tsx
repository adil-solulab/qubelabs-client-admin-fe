import { useState, useRef, useEffect } from 'react';
import { Trash2, Link2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FlowNode as FlowNodeType } from '@/types/flowBuilder';
import { NODE_TYPE_CONFIG } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected: boolean;
  isConnecting: boolean;
  onSelect: () => void;
  onStartConnect: () => void;
  onEndConnect: () => void;
  onDelete: () => void;
  onMove: (position: { x: number; y: number }) => void;
  canvasOffset: { x: number; y: number };
}

export function FlowNode({
  node,
  isSelected,
  isConnecting,
  onSelect,
  onStartConnect,
  onEndConnect,
  onDelete,
  onMove,
  canvasOffset,
}: FlowNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const config = NODE_TYPE_CONFIG[node.type];

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    
    e.stopPropagation();
    onSelect();
    
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - canvasOffset.x - dragOffset.x;
      const newY = e.clientY - canvasOffset.y - dragOffset.y;
      onMove({ x: Math.max(0, newX), y: Math.max(0, newY) });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, canvasOffset, onMove]);

  return (
    <div
      ref={nodeRef}
      className={cn(
        'absolute cursor-grab select-none transition-shadow',
        isDragging && 'cursor-grabbing z-50',
        isSelected && 'z-40'
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={cn(
          'relative min-w-[160px] rounded-xl border-2 shadow-lg transition-all',
          config.bgColor,
          config.borderColor,
          isSelected && 'ring-2 ring-primary ring-offset-2 shadow-glow',
          isConnecting && 'ring-2 ring-warning ring-offset-2 cursor-pointer'
        )}
        onClick={(e) => {
          if (isConnecting) {
            e.stopPropagation();
            onEndConnect();
          }
        }}
      >
        {/* Header */}
        <div className={cn('px-3 py-2 rounded-t-lg border-b', config.borderColor)}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{config.icon}</span>
            <span className="text-xs font-medium text-muted-foreground">{config.label}</span>
            <GripVertical className="w-3 h-3 ml-auto text-muted-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="px-3 py-2">
          <p className="text-sm font-medium truncate max-w-[140px]">{node.data.label}</p>
          {node.data.content && (
            <p className="text-xs text-muted-foreground truncate max-w-[140px] mt-1">
              {node.data.content}
            </p>
          )}
          {node.type === 'condition' && node.data.condition && (
            <p className="text-xs text-warning mt-1">
              {node.data.condition.variable} {node.data.condition.operator} "{node.data.condition.value}"
            </p>
          )}
          {node.type === 'api_call' && node.data.apiConfig && (
            <p className="text-xs text-blue-500 mt-1">
              {node.data.apiConfig.method} {node.data.apiConfig.url.slice(0, 20)}...
            </p>
          )}
        </div>

        {/* Connection points */}
        {node.type !== 'start' && (
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-muted border-2 border-border"
            title="Input"
          />
        )}
        {node.type !== 'end' && (
          <>
            {node.type === 'condition' ? (
              <>
                <div
                  className="absolute -bottom-2 left-1/4 -translate-x-1/2 w-4 h-4 rounded-full bg-success border-2 border-success cursor-pointer hover:scale-125 transition-transform"
                  title="Yes"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartConnect();
                  }}
                />
                <div
                  className="absolute -bottom-2 left-3/4 -translate-x-1/2 w-4 h-4 rounded-full bg-destructive border-2 border-destructive cursor-pointer hover:scale-125 transition-transform"
                  title="No"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartConnect();
                  }}
                />
              </>
            ) : (
              <div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-primary cursor-pointer hover:scale-125 transition-transform"
                title="Output"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartConnect();
                }}
              />
            )}
          </>
        )}

        {/* Actions */}
        {isSelected && (
          <div className="absolute -right-2 -top-2 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-6 w-6 rounded-full shadow"
              onClick={(e) => {
                e.stopPropagation();
                onStartConnect();
              }}
            >
              <Link2 className="w-3 h-3" />
            </Button>
            {node.type !== 'start' && (
              <Button
                variant="destructive"
                size="icon"
                className="h-6 w-6 rounded-full shadow"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
