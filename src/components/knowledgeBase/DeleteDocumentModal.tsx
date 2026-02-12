import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, FileText } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { KnowledgeDocument } from '@/types/knowledgeBase';
import { FILE_TYPE_LABELS } from '@/types/knowledgeBase';

interface DeleteDocumentModalProps {
  document: KnowledgeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (documentId: string) => Promise<void>;
}

export function DeleteDocumentModal({
  document,
  open,
  onOpenChange,
  onDelete,
}: DeleteDocumentModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!document) return;

    setIsDeleting(true);
    try {
      await onDelete(document.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!document) return null;

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'docx': case 'doc': return '📝';
      case 'txt': return '📃';
      case 'md': return '📋';
      case 'csv': return '📊';
      case 'xlsx': return '📈';
      default: return '📁';
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Delete Document</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete this document? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Document Preview */}
        <div className="my-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {getFileTypeIcon(document.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold truncate">{document.name}</h4>
              <p className="text-sm text-muted-foreground">{document.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  .{document.fileType.toUpperCase()}
                </Badge>
                <span className="text-xs text-muted-foreground">{document.size}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning">Warning</p>
              <p className="text-muted-foreground mt-0.5">
                Deleting this document will remove all training data and version history.
                AI agents will no longer have access to this knowledge.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete Document
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
