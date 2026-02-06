import { useState } from 'react';
import { Settings, Save, Loader2, RefreshCw, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Integration } from '@/types/integrations';
import { INTEGRATION_ICONS } from '@/types/integrations';
import { notify } from '@/hooks/useNotification';

interface ConfigureIntegrationModalProps {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConfigureIntegrationModal({
  integration,
  open,
  onOpenChange,
}: ConfigureIntegrationModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState('15');
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    notify.success('Settings saved', `${integration?.name} configuration updated successfully.`);
    onOpenChange(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
    notify.success('Sync complete', `${integration?.name} data has been synchronized.`);
  };

  const handleClose = () => {
    if (!isSaving && !isSyncing) {
      onOpenChange(false);
    }
  };

  if (!integration) return null;

  const icon = INTEGRATION_ICONS[integration.icon] || '🔌';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {icon}
            </div>
            <div>
              <DialogTitle>Configure {integration.name}</DialogTitle>
              <DialogDescription className="mt-1">
                Manage settings and sync options
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status */}
          <div className="p-4 rounded-xl border bg-success/5 border-success/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <span className="font-medium text-success">Connected</span>
              </div>
              {integration.connectedAt && (
                <span className="text-xs text-muted-foreground">
                  Since {new Date(integration.connectedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Enabled Features</Label>
            <div className="flex flex-wrap gap-2">
              {integration.features.map((feature, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Sync Settings */}
          <div className="space-y-4">
            <h4 className="font-medium">Sync Settings</h4>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSync">Auto Sync</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically sync data in the background
                </p>
              </div>
              <Switch
                id="autoSync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
              />
            </div>

            {autoSync && (
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(e.target.value)}
                  min="5"
                  max="60"
                />
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleSync}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          <Separator />

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
            <Input
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhook"
            />
            <p className="text-xs text-muted-foreground">
              Receive real-time notifications when events occur in {integration.name}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSaving || isSyncing}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isSyncing}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
