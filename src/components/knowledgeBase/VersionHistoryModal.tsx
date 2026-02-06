import { useState } from 'react';
import { History, RotateCcw, Download, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { KnowledgeDocument, DocumentVersion } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

interface VersionHistoryModalProps {
  document: KnowledgeDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevert: (documentId: string, versionId: string) => Promise<void>;
}

export function VersionHistoryModal({
  document,
  open,
  onOpenChange,
  onRevert,
}: VersionHistoryModalProps) {
  const [revertingVersion, setRevertingVersion] = useState<string | null>(null);

  const handleRevert = async (version: DocumentVersion) => {
    if (!document) return;
    
    setRevertingVersion(version.id);
    try {
      await onRevert(document.id, version.id);
    } finally {
      setRevertingVersion(null);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            Version History
          </DialogTitle>
          <DialogDescription>
            View and manage versions of "{document.name}"
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {document.versions.map((version, index) => {
              const isCurrent = index === 0;
              const isReverting = revertingVersion === version.id;

              return (
                <div
                  key={version.id}
                  className={cn(
                    'p-4 rounded-xl border transition-colors',
                    isCurrent ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 border-border'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Version {version.version}</span>
                        {isCurrent && (
                          <Badge className="text-[10px]">Current</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {version.changes}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{version.uploadedBy}</span>
                        <span>•</span>
                        <span>{version.uploadedAt}</span>
                        <span>•</span>
                        <span>{version.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevert(version)}
                          disabled={isReverting}
                        >
                          {isReverting ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3 mr-1" />
                          )}
                          Revert
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Timeline connector */}
                  {index < document.versions.length - 1 && (
                    <div className="absolute left-[calc(50%-0.5px)] mt-3 w-0.5 h-3 bg-border" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            {document.versions.length} version{document.versions.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
