import { useState } from 'react';
import {
  Mail,
  Bot,
  FileText,
  GitBranch,
  Plus,
  Trash2,
  Save,
  Loader2,
  Clock,
  Users,
  Shield,
  AlertTriangle,
  ToggleLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmailConfig, RoutingRule } from '@/types/channels';
import { cn } from '@/lib/utils';

interface EmailConfigPanelProps {
  config: EmailConfig;
  onUpdate: (updates: Partial<EmailConfig>) => Promise<void>;
  onAddRule: (rule: RoutingRule) => void;
  onUpdateRule: (ruleId: string, updates: Partial<RoutingRule>) => void;
  onRemoveRule: (ruleId: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

const CONDITION_OPTIONS = [
  { value: 'subject_contains', label: 'Subject Contains' },
  { value: 'from_domain', label: 'From Domain' },
  { value: 'priority', label: 'Priority Is' },
  { value: 'sentiment', label: 'Sentiment Is' },
];

const ACTION_OPTIONS = [
  { value: 'assign_to', label: 'Assign To' },
  { value: 'add_tag', label: 'Add Tag' },
  { value: 'set_priority', label: 'Set Priority' },
  { value: 'auto_reply', label: 'Auto Reply' },
];

export function EmailConfigPanel({
  config,
  onUpdate,
  onAddRule,
  onUpdateRule,
  onRemoveRule,
  isSaving,
  onSave,
}: EmailConfigPanelProps) {
  const [newRecipient, setNewRecipient] = useState('');
  const [newBlockedDomain, setNewBlockedDomain] = useState('');

  const updateAiReplies = (updates: Partial<EmailConfig['aiReplies']>) => {
    onUpdate({ aiReplies: { ...config.aiReplies, ...updates } });
  };

  const updateSummaries = (updates: Partial<EmailConfig['summaries']>) => {
    onUpdate({ summaries: { ...config.summaries, ...updates } });
  };

  const updateRouting = (updates: Partial<EmailConfig['routing']>) => {
    onUpdate({ routing: { ...config.routing, ...updates } });
  };

  const handleAddRecipient = () => {
    if (newRecipient && newRecipient.includes('@')) {
      updateSummaries({ recipients: [...config.summaries.recipients, newRecipient] });
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    updateSummaries({ recipients: config.summaries.recipients.filter(r => r !== email) });
  };

  const handleAddBlockedDomain = () => {
    if (newBlockedDomain) {
      onUpdate({ blockedDomains: [...config.blockedDomains, newBlockedDomain] });
      setNewBlockedDomain('');
    }
  };

  const handleRemoveBlockedDomain = (domain: string) => {
    onUpdate({ blockedDomains: config.blockedDomains.filter(d => d !== domain) });
  };

  const handleAddRule = () => {
    const newRule: RoutingRule = {
      id: Date.now().toString(),
      name: 'New Rule',
      condition: 'subject_contains',
      value: '',
      action: 'assign_to',
      target: '',
      enabled: true,
    };
    onAddRule(newRule);
  };

  return (
    <div className="space-y-6">
      {/* AI Replies */}
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                AI Replies
              </CardTitle>
              <CardDescription>Configure AI-powered email responses</CardDescription>
            </div>
            <Switch
              checked={config.aiReplies.enabled}
              onCheckedChange={(checked) => updateAiReplies({ enabled: checked })}
            />
          </div>
        </CardHeader>
        {config.aiReplies.enabled && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border bg-background/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">Auto Reply</p>
                  <p className="text-sm text-muted-foreground">Automatically respond to incoming emails</p>
                </div>
              </div>
              <Switch
                checked={config.aiReplies.autoReply}
                onCheckedChange={(checked) => updateAiReplies({ autoReply: checked })}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reply Delay
                </Label>
                <span className="text-sm font-medium">{config.aiReplies.replyDelay} minutes</span>
              </div>
              <Slider
                value={[config.aiReplies.replyDelay]}
                onValueChange={([value]) => updateAiReplies({ replyDelay: value })}
                min={0}
                max={60}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Response Tone</Label>
              <Select
                value={config.aiReplies.tone}
                onValueChange={(value: EmailConfig['aiReplies']['tone']) => updateAiReplies({ tone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Email Signature</Label>
                <Switch
                  checked={config.aiReplies.signatureEnabled}
                  onCheckedChange={(checked) => updateAiReplies({ signatureEnabled: checked })}
                />
              </div>
              {config.aiReplies.signatureEnabled && (
                <Textarea
                  value={config.aiReplies.signature}
                  onChange={(e) => updateAiReplies({ signature: e.target.value })}
                  placeholder="Best regards,&#10;Your Team"
                  rows={3}
                />
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Summaries */}
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Email Summaries
              </CardTitle>
              <CardDescription>Receive periodic email activity reports</CardDescription>
            </div>
            <Switch
              checked={config.summaries.enabled}
              onCheckedChange={(checked) => updateSummaries({ enabled: checked })}
            />
          </div>
        </CardHeader>
        {config.summaries.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select
                value={config.summaries.frequency}
                onValueChange={(value: EmailConfig['summaries']['frequency']) => updateSummaries({ frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Recipients
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {config.summaries.recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1 pr-1">
                    {email}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive/20"
                      onClick={() => handleRemoveRecipient(email)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="email@example.com"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRecipient()}
                />
                <Button onClick={handleAddRecipient}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
              <span className="text-sm">Include Performance Metrics</span>
              <Switch
                checked={config.summaries.includeMetrics}
                onCheckedChange={(checked) => updateSummaries({ includeMetrics: checked })}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Routing Rules */}
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-primary" />
                Routing Rules
              </CardTitle>
              <CardDescription>Automatically route emails based on conditions</CardDescription>
            </div>
            <Switch
              checked={config.routing.enabled}
              onCheckedChange={(checked) => updateRouting({ enabled: checked })}
            />
          </div>
        </CardHeader>
        {config.routing.enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {config.routing.rules.map((rule) => (
                <div
                  key={rule.id}
                  className={cn(
                    'p-4 rounded-xl border transition-opacity',
                    rule.enabled ? 'bg-background/50' : 'bg-muted/30 opacity-60'
                  )}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <Input
                      value={rule.name}
                      onChange={(e) => onUpdateRule(rule.id, { name: e.target.value })}
                      className="font-medium border-none p-0 h-auto text-base focus-visible:ring-0"
                      placeholder="Rule name..."
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => onUpdateRule(rule.id, { enabled: checked })}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemoveRule(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">When</Label>
                      <Select
                        value={rule.condition}
                        onValueChange={(value: RoutingRule['condition']) => onUpdateRule(rule.id, { condition: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Value</Label>
                      <Input
                        value={rule.value}
                        onChange={(e) => onUpdateRule(rule.id, { value: e.target.value })}
                        placeholder="Enter value..."
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Then</Label>
                      <Select
                        value={rule.action}
                        onValueChange={(value: RoutingRule['action']) => onUpdateRule(rule.id, { action: value })}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ACTION_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Target</Label>
                      <Input
                        value={rule.target}
                        onChange={(e) => onUpdateRule(rule.id, { target: e.target.value })}
                        placeholder="Enter target..."
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" onClick={handleAddRule} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>

            <div className="space-y-2">
              <Label>Default Assignee</Label>
              <Input
                value={config.routing.defaultAssignee}
                onChange={(e) => updateRouting({ defaultAssignee: e.target.value })}
                placeholder="General Queue"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Blocked Domains */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Domain Filtering
          </CardTitle>
          <CardDescription>Block spam and unwanted email domains</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Blocked Domains
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {config.blockedDomains.map((domain) => (
                <Badge key={domain} variant="destructive" className="gap-1 pr-1">
                  {domain}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-destructive-foreground/20"
                    onClick={() => handleRemoveBlockedDomain(domain)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newBlockedDomain}
                onChange={(e) => setNewBlockedDomain(e.target.value)}
                placeholder="spam.com"
                onKeyDown={(e) => e.key === 'Enter' && handleAddBlockedDomain()}
              />
              <Button onClick={handleAddBlockedDomain}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Email Configuration
        </Button>
      </div>
    </div>
  );
}
