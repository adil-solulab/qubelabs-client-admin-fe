import { useState } from 'react';
import { RefreshCw, Loader2, AlertTriangle, Key } from 'lucide-react';
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
import type { ProjectKey } from '@/types/sdks';

interface RegenerateKeyModalProps {
  projectKey: ProjectKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegenerate: (keyId: string) => Promise<{ success: boolean; newKey: string }>;
}

export function RegenerateKeyModal({
  projectKey,
  open,
  onOpenChange,
  onRegenerate,
}: RegenerateKeyModalProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!projectKey) return;

    setIsRegenerating(true);
    await onRegenerate(projectKey.id);
    setIsRegenerating(false);
    onOpenChange(false);
  };

  if (!projectKey) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-warning" />
            </div>
            <AlertDialogTitle className="text-xl">Regenerate API Key?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to regenerate this API key? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Key Info */}
        <div className="my-4 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{projectKey.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={projectKey.environment === 'production' ? 'default' : 'secondary'}>
                  {projectKey.environment}
                </Badge>
                <Badge variant="outline">
                  {projectKey.type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Warning List */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>The current key will be immediately invalidated</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>All applications using this key will stop working</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>You'll need to update all integrations with the new key</span>
          </div>
        </div>

        {projectKey.environment === 'production' && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This is a production key. Regenerating it will affect live applications.
            </p>
          </div>
        )}

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRegenerating}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRegenerate} disabled={isRegenerating}>
            {isRegenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Regenerate Key
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
