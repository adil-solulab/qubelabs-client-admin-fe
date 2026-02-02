import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Copy, Edit, Link2, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface NodeContextMenuProps {
  children: ReactNode;
  onEdit: () => void;
  onDuplicate: () => void;
  onConnect: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

export function NodeContextMenu({
  children,
  onEdit,
  onDuplicate,
  onConnect,
  onDelete,
  canDelete,
}: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={onEdit}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Node
        </ContextMenuItem>
        <ContextMenuItem onClick={onDuplicate}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate Node
        </ContextMenuItem>
        <ContextMenuItem onClick={onConnect}>
          <Link2 className="w-4 h-4 mr-2" />
          Create Connection
        </ContextMenuItem>
        {canDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Node
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
