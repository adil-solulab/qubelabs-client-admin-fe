import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  X,
  Loader2,
  ExternalLink,
  Wifi,
  WifiOff,
  Phone,
  MessageCircle,
  Hash,
  Globe,
  Send,
  Cloud,
  Server,
  Mail,
  MessageSquare,
  Shield,
  Camera,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Connector } from '@/types/channels';
import { cn } from '@/lib/utils';

interface ConnectorConfigPanelProps {
  connector: Connector;
  isSaving: boolean;
  onConnect: (id: string, config: Record<string, string>) => Promise<{ success: boolean }>;
  onDisconnect: (id: string) => Promise<{ success: boolean }>;
  onUpdateConfig: (id: string, config: Record<string, string>) => Promise<{ success: boolean }>;
  onBack: () => void;
}

const CONNECTOR_ICONS: Record<string, React.ElementType> = {
  twilio: Phone,
  vonage: Phone,
  genesys: Phone,
  asterisk: Server,
  whatsapp: MessageCircle,
  slack: Hash,
  telegram: Send,
  msteams: MessageSquare,
  facebook: Globe,
  instagram: Camera,
  sendgrid: Mail,
  ses: Cloud,
  mailgun: Mail,
  smtp: Server,
};

const CONNECTOR_COLORS: Record<string, { color: string; bg: string }> = {
  twilio: { color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/30' },
  vonage: { color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/30' },
  genesys: { color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  asterisk: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  whatsapp: { color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
  slack: { color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  telegram: { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  msteams: { color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
  facebook: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  instagram: { color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-950/30' },
  sendgrid: { color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  ses: { color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  mailgun: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  smtp: { color: 'text-gray-600', bg: 'bg-gray-50 dark:bg-gray-950/30' },
};

export function ConnectorConfigPanel({
  connector,
  isSaving,
  onConnect,
  onDisconnect,
  onUpdateConfig,
  onBack,
}: ConnectorConfigPanelProps) {
  const [formData, setFormData] = useState<Record<string, string>>({ ...connector.config });
  const [isConnecting, setIsConnecting] = useState(false);

  const Icon = CONNECTOR_ICONS[connector.id] || Shield;
  const colors = CONNECTOR_COLORS[connector.id] || { color: 'text-primary', bg: 'bg-primary/10' };
  const isConnected = connector.status === 'connected';

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    await onConnect(connector.id, formData);
    setIsConnecting(false);
  };

  const handleSave = async () => {
    await onUpdateConfig(connector.id, formData);
  };

  const handleDisconnect = async () => {
    await onDisconnect(connector.id);
    setFormData({});
  };

  const requiredFields = connector.configFields.filter(f => f.required);
  const hasAllRequired = requiredFields.every(f => formData[f.key]?.trim());

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors.bg)}>
          <Icon className={cn('w-6 h-6', colors.color)} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{connector.name}</h2>
            <Badge
              variant="outline"
              className={cn(
                'text-xs',
                isConnected ? 'text-success border-success/30 bg-success/10' : 'text-muted-foreground'
              )}
            >
              {isConnected ? (
                <><Wifi className="w-3 h-3 mr-1" />Connected</>
              ) : (
                <><WifiOff className="w-3 h-3 mr-1" />Disconnected</>
              )}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{connector.description}</p>
        </div>
      </div>

      {isConnected && connector.connectedAt && (
        <Card className="gradient-card mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <div>
                  <p className="text-sm font-medium">Connection Active</p>
                  <p className="text-xs text-muted-foreground">
                    Connected since {new Date(connector.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                    Disconnect
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Disconnect {connector.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove the connection and stop all communications through this connector. You can reconnect anytime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDisconnect} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Disconnect
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connector.configFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.type === 'select' ? (
                <Select
                  value={formData[field.key] || ''}
                  onValueChange={(v) => handleFieldChange(field.key, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.key}
                  type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                />
              )}

              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          ))}

          <div className="flex gap-2 pt-4 border-t">
            {isConnected ? (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            ) : (
              <Button onClick={handleConnect} disabled={isConnecting || !hasAllRequired}>
                {isConnecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { CONNECTOR_ICONS, CONNECTOR_COLORS };
