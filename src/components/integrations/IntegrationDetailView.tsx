import { useState } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Unplug,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Integration } from '@/types/integrations';
import { INTEGRATION_ICONS, STATUS_CONFIG } from '@/types/integrations';
import { cn } from '@/lib/utils';

interface IntegrationDetailViewProps {
  integration: Integration;
  onBack: () => void;
  onConnect: (integrationId: string, credentials?: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
  onDisconnect: (integrationId: string) => Promise<{ success: boolean }>;
}

export function IntegrationDetailView({
  integration,
  onBack,
  onConnect,
  onDisconnect,
}: IntegrationDetailViewProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const icon = INTEGRATION_ICONS[integration.icon] || '🔌';
  const isConnected = integration.status === 'connected';
  const statusConfig = STATUS_CONFIG[integration.status];

  const handleFieldChange = (key: string, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setError(null);
  };

  const toggleFieldVisibility = (key: string) => {
    setVisibleFields(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const fields = integration.fields || [];
  const instructions = integration.instructions || [];

  const handleConnect = async () => {
    const requiredFields = fields.filter(f => f.required);
    const missing = requiredFields.filter(f => !formValues[f.key]?.trim());
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.map(f => f.label).join(', ')}`);
      return;
    }

    setIsConnecting(true);
    setError(null);
    const result = await onConnect(integration.id, formValues);
    setIsConnecting(false);

    if (!result.success) {
      setError(result.error || 'Connection failed. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    await onDisconnect(integration.id);
    setIsDisconnecting(false);
  };

  const charCount = formValues['account_name']?.length || 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={onBack} className="hover:text-foreground transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Integrations
        </button>
        <span>/</span>
        <span className="text-foreground font-medium">{integration.name}</span>
      </div>

      <div className="grid lg:grid-cols-[1fr,340px] gap-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-3xl flex-shrink-0 border">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{integration.name}</h1>
                <Badge variant="secondary" className={cn('text-[10px]', statusConfig.bgColor, statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{integration.description}</p>
            </div>
          </div>

          <Card className="gradient-card">
            <CardContent className="pt-6">
              <h2 className="font-semibold text-base mb-1">
                {isConnected ? 'Connection Settings' : 'Add Account'}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {isConnected
                  ? 'Your integration is connected. You can update settings or disconnect below.'
                  : 'Fill in the credentials below to connect this integration.'}
              </p>

              <div className="space-y-5">
                {fields.map((field) => {
                  const isPassword = field.type === 'password';
                  const isVisible = visibleFields.has(field.key);
                  const isAccountName = field.key === 'account_name';
                  const isSelect = field.type === 'select';

                  return (
                    <div key={field.key} className="space-y-1.5">
                      <Label className="text-sm">
                        {field.label}
                        {field.required && <span className="text-destructive ml-0.5">*</span>}
                      </Label>
                      {isAccountName && (
                        <p className="text-xs text-muted-foreground">
                          Your account name should be unique, and it can't be edited once created.
                        </p>
                      )}
                      {field.helpText && !isAccountName && (
                        <p className="text-xs text-muted-foreground">{field.helpText}</p>
                      )}
                      {isSelect && field.options ? (
                        <Select
                          value={formValues[field.key] || ''}
                          onValueChange={(val) => handleFieldChange(field.key, val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="relative">
                          <Input
                            type={isPassword && !isVisible ? 'password' : field.type === 'number' ? 'number' : 'text'}
                            placeholder={field.placeholder}
                            value={formValues[field.key] || ''}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            disabled={isConnected && field.key === 'account_name'}
                            className={cn(isPassword && 'pr-10')}
                          />
                          {isPassword && (
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              onClick={() => toggleFieldVisibility(field.key)}
                            >
                              {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      )}
                      {isAccountName && (
                        <p className="text-xs text-right text-muted-foreground">{charCount}/20</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 mt-6">
                {isConnected ? (
                  <>
                    <Button onClick={handleConnect} disabled={isConnecting}>
                      {isConnecting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Update
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDisconnect}
                      disabled={isDisconnecting}
                      className="text-destructive hover:text-destructive"
                    >
                      {isDisconnecting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Unplug className="w-4 h-4 mr-2" />
                      )}
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleConnect} disabled={isConnecting}>
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    {isConnecting ? 'Connecting...' : 'Connect'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky lg:top-6 h-fit">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Instructions
                </h3>
                {integration.docsUrl && (
                  <a
                    href={integration.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    Learn more
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <ScrollArea className="max-h-[500px]">
                <ol className="space-y-4">
                  {instructions.map((instruction) => (
                    <li key={instruction.step} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                        {instruction.step}
                      </span>
                      <p className="text-muted-foreground leading-relaxed">{instruction.text}</p>
                    </li>
                  ))}
                </ol>
              </ScrollArea>

              {integration.features.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Features
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {integration.features.map(feature => (
                      <Badge key={feature} variant="secondary" className="text-[10px]">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
