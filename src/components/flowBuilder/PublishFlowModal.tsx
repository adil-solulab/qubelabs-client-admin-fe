import { useState } from 'react';
import { Rocket, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Flow } from '@/types/flowBuilder';

interface PublishFlowModalProps {
  flow: Flow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (changelog: string) => Promise<void>;
}

export function PublishFlowModal({
  flow,
  open,
  onOpenChange,
  onPublish,
}: PublishFlowModalProps) {
  const [changelog, setChangelog] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (!changelog.trim()) return;

    setIsPublishing(true);
    await onPublish(changelog);
    setIsPublishing(false);
    setChangelog('');
    onOpenChange(false);
  };

  const newVersion = `${parseInt(flow.currentVersion) + 1}.0`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary" />
            </div>
            Publish Flow
          </DialogTitle>
          <DialogDescription>
            You are about to publish "{flow.name}" to production.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Version Info */}
          <div className="p-4 rounded-xl border bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Current Version</span>
              <Badge variant="outline">v{flow.currentVersion}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Version</span>
              <Badge className="bg-primary">v{newVersion}</Badge>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border text-center">
              <p className="text-2xl font-bold">{flow.nodes.length}</p>
              <p className="text-xs text-muted-foreground">Nodes</p>
            </div>
            <div className="p-3 rounded-lg border text-center">
              <p className="text-2xl font-bold">{flow.edges.length}</p>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>

          {/* Changelog */}
          <div className="space-y-2">
            <Label>Changelog *</Label>
            <Textarea
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Describe what changed in this version..."
              rows={3}
            />
          </div>

          {/* Warning */}
          <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                Publishing will make this flow live for all customers immediately.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPublishing}>
            Cancel
          </Button>
          <Button onClick={handlePublish} disabled={!changelog.trim() || isPublishing}>
            {isPublishing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4 mr-2" />
            )}
            Publish to Production
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
