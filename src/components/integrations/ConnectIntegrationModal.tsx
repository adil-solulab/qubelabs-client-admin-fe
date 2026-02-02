import { useState } from 'react';
import { ExternalLink, Loader2, Key, Lock } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { Integration } from '@/types/integrations';
import { INTEGRATION_ICONS } from '@/types/integrations';
import { cn } from '@/lib/utils';

interface ConnectIntegrationModalProps {
  integration: Integration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (integrationId: string, credentials?: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
}

export function ConnectIntegrationModal({
  integration,
  open,
  onOpenChange,
  onConnect,
}: ConnectIntegrationModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [oauthStep, setOauthStep] = useState<'initial' | 'authorizing' | 'complete'>('initial');

  const handleConnect = async () => {
    if (!integration) return;
    
    setError(null);
    setIsConnecting(true);

    if (integration.authType === 'oauth') {
      setOauthStep('authorizing');
      // Simulate OAuth redirect
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const credentials = integration.authType === 'api_key' 
      ? { apiKey, apiSecret }
      : undefined;

    const result = await onConnect(integration.id, credentials);
    
    setIsConnecting(false);

    if (result.success) {
      setOauthStep('complete');
      setTimeout(() => {
        handleClose();
      }, 1000);
    } else {
      setOauthStep('initial');
      setError(result.error || 'Failed to connect. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isConnecting) {
      setError(null);
      setApiKey('');
      setApiSecret('');
      setOauthStep('initial');
      onOpenChange(false);
    }
  };

  if (!integration) return null;

  const icon = INTEGRATION_ICONS[integration.icon] || '🔌';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
              {icon}
            </div>
            <div>
              <DialogTitle>Connect {integration.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {integration.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {integration.features.map((feature, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>

          {/* OAuth Flow */}
          {integration.authType === 'oauth' && (
            <div className="space-y-4">
              {oauthStep === 'initial' && (
                <div className="p-4 rounded-xl border bg-muted/30 text-center">
                  <ExternalLink className="w-8 h-8 mx-auto text-primary mb-3" />
                  <p className="font-medium mb-1">OAuth Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to {integration.name} to authorize access.
                  </p>
                </div>
              )}

              {oauthStep === 'authorizing' && (
                <div className="p-6 rounded-xl border bg-primary/5 text-center">
                  <Loader2 className="w-10 h-10 mx-auto text-primary mb-3 animate-spin" />
                  <p className="font-medium mb-1">Authorizing...</p>
                  <p className="text-sm text-muted-foreground">
                    Please complete authorization in the popup window.
                  </p>
                </div>
              )}

              {oauthStep === 'complete' && (
                <div className="p-6 rounded-xl border bg-success/10 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-3">
                    <Lock className="w-6 h-6 text-success" />
                  </div>
                  <p className="font-medium text-success mb-1">Connected!</p>
                  <p className="text-sm text-muted-foreground">
                    {integration.name} has been successfully connected.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* API Key Flow */}
          {integration.authType === 'api_key' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
                <div className="flex items-start gap-2">
                  <Key className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Enter your {integration.name} API credentials. You can find these in your {integration.name} dashboard.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="Enter your API secret"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isConnecting}>
            Cancel
          </Button>
          {oauthStep !== 'complete' && (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || (integration.authType === 'api_key' && (!apiKey || !apiSecret))}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              {isConnecting ? 'Connecting...' : integration.authType === 'oauth' ? 'Authorize' : 'Connect'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
