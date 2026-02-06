import { useState } from 'react';
import { Unplug, Loader2, AlertTriangle } from 'lucide-react';
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
import type { Integration } from '@/types/integrations';
import { INTEGRATION_ICONS } from '@/types/integrations';

interface DisconnectIntegrationModalProps {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDisconnect: (integrationId: string) => Promise<{ success: boolean }>;
}

export function DisconnectIntegrationModal({
  integration,
  open,
  onOpenChange,
  onDisconnect,
}: DisconnectIntegrationModalProps) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnect = async () => {
    if (!integration) return;

    setIsDisconnecting(true);
    await onDisconnect(integration.id);
    setIsDisconnecting(false);
    onOpenChange(false);
  };

  if (!integration) return null;

  const icon = INTEGRATION_ICONS[integration.icon] || '🔌';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Unplug className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Disconnect {integration.name}?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to disconnect this integration? This action will:
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Integration Info */}
        <div className="my-4 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center text-xl">
              {icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{integration.name}</p>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          </div>
        </div>

        {/* Warning List */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>Stop all syncing between {integration.name} and your workspace</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>Remove all stored credentials and access tokens</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>Disable any automations that rely on this integration</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-sm text-muted-foreground">
            You can reconnect this integration at any time. Your data in {integration.name} will not be affected.
          </p>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDisconnecting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDisconnect} disabled={isDisconnecting}>
            {isDisconnecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Unplug className="w-4 h-4 mr-2" />
            )}
            Disconnect
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
