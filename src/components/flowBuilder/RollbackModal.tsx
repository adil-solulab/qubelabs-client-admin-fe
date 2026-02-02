import { useState } from 'react';
import { History, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FlowVersion } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface RollbackModalProps {
  versions: FlowVersion[];
  currentVersion: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRollback: (versionId: string) => Promise<void>;
}

export function RollbackModal({
  versions,
  currentVersion,
  open,
  onOpenChange,
  onRollback,
}: RollbackModalProps) {
  const [selectedVersion, setSelectedVersion] = useState<FlowVersion | null>(null);
  const [isRollingBack, setIsRollingBack] = useState(false);

  const handleRollback = async () => {
    if (!selectedVersion) return;

    setIsRollingBack(true);
    await onRollback(selectedVersion.id);
    setIsRollingBack(false);
    setSelectedVersion(null);
    onOpenChange(false);
  };

  const sortedVersions = [...versions].sort((a, b) => 
    parseFloat(b.version) - parseFloat(a.version)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              <History className="w-5 h-5 text-warning" />
            </div>
            Rollback to Previous Version
          </DialogTitle>
          <DialogDescription>
            Select a previous version to restore. Current changes will be saved as draft.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-2">
            {sortedVersions.map((version) => {
              const isCurrent = version.version === currentVersion;
              const isSelected = selectedVersion?.id === version.id;

              return (
                <div
                  key={version.id}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all',
                    isCurrent && 'opacity-50 cursor-not-allowed',
                    isSelected && 'border-primary bg-primary/5',
                    !isCurrent && !isSelected && 'hover:border-primary/50'
                  )}
                  onClick={() => !isCurrent && setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">v{version.version}</span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-[10px]">Current</Badge>
                        )}
                        <Badge
                          variant={version.status === 'published' ? 'default' : 'outline'}
                          className={cn(
                            'text-[10px]',
                            version.status === 'published' && 'bg-success'
                          )}
                        >
                          {version.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{version.changelog}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{version.createdBy}</span>
                        <span>•</span>
                        <span>{version.createdAt}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {selectedVersion && (
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-warning">Warning</p>
                <p className="text-muted-foreground mt-0.5">
                  Rolling back to v{selectedVersion.version} will overwrite your current draft.
                  Make sure you've saved any important changes.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRollingBack}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRollback}
            disabled={!selectedVersion || isRollingBack}
          >
            {isRollingBack ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Rollback to v{selectedVersion?.version || '...'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
