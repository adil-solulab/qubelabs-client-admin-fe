import { useState } from 'react';
import {
  Settings,
  Save,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Mail,
  Smartphone,
  Clock,
  AlertTriangle,
  Star,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SurveyConfig, SurveyType, DeliveryChannel } from '@/types/surveys';
import { cn } from '@/lib/utils';

interface SurveyConfigPanelProps {
  config: SurveyConfig;
  onSave: (updates: Partial<SurveyConfig>) => Promise<void>;
  isLoading?: boolean;
}

export function SurveyConfigPanel({
  config,
  onSave,
  isLoading = false,
}: SurveyConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<SurveyConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = (updates: Partial<SurveyConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(localConfig);
    setHasChanges(false);
  };

  const toggleTrigger = (trigger: 'voice_end' | 'chat_end' | 'email_resolved') => {
    const current = localConfig.triggerOn;
    const updated = current.includes(trigger)
      ? current.filter(t => t !== trigger)
      : [...current, trigger];
    updateConfig({ triggerOn: updated });
  };

  const toggleChannel = (channel: DeliveryChannel) => {
    const current = localConfig.deliveryChannels;
    const updated = current.includes(channel)
      ? current.filter(c => c !== channel)
      : [...current, channel];
    updateConfig({ deliveryChannels: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Survey Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Configure automatic post-interaction surveys
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="enabled" className="text-sm">Surveys Enabled</Label>
            <Switch
              id="enabled"
              checked={localConfig.enabled}
              onCheckedChange={(enabled) => updateConfig({ enabled })}
            />
          </div>
          {hasChanges && (
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-1" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Survey Type */}
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {localConfig.surveyType === 'csat' ? (
                <Star className="w-4 h-4 text-yellow-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-primary" />
              )}
              Survey Type
            </CardTitle>
            <CardDescription>Choose the type of feedback to collect</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={localConfig.surveyType}
              onValueChange={(v: SurveyType) => updateConfig({ surveyType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csat">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    CSAT (1-5 Stars)
                  </div>
                </SelectItem>
                <SelectItem value="nps">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    NPS (0-10 Scale)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              {localConfig.surveyType === 'csat' ? (
                <p><strong>CSAT</strong> measures immediate satisfaction with a single interaction using a 1-5 star rating.</p>
              ) : (
                <p><strong>NPS</strong> measures customer loyalty by asking how likely they are to recommend (0-10).</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trigger Settings */}
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ToggleRight className="w-4 h-4" />
              Trigger Events
            </CardTitle>
            <CardDescription>When to send surveys automatically</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                localConfig.triggerOn.includes('voice_end') ? "border-primary bg-primary/5" : "border-border"
              )}
              onClick={() => toggleTrigger('voice_end')}
            >
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>After Voice Call Ends</span>
              </div>
              <Switch checked={localConfig.triggerOn.includes('voice_end')} />
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                localConfig.triggerOn.includes('chat_end') ? "border-primary bg-primary/5" : "border-border"
              )}
              onClick={() => toggleTrigger('chat_end')}
            >
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>After Chat Session Ends</span>
              </div>
              <Switch checked={localConfig.triggerOn.includes('chat_end')} />
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                localConfig.triggerOn.includes('email_resolved') ? "border-primary bg-primary/5" : "border-border"
              )}
              onClick={() => toggleTrigger('email_resolved')}
            >
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>After Email Resolved</span>
              </div>
              <Switch checked={localConfig.triggerOn.includes('email_resolved')} />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Channels */}
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Delivery Channels
            </CardTitle>
            <CardDescription>How to send surveys to customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                localConfig.deliveryChannels.includes('chat') ? "border-primary bg-primary/5" : "border-border"
              )}
              onClick={() => toggleChannel('chat')}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span>In-Chat Survey</span>
              </div>
              <Switch checked={localConfig.deliveryChannels.includes('chat')} />
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                localConfig.deliveryChannels.includes('sms') ? "border-primary bg-primary/5" : "border-border"
              )}
              onClick={() => toggleChannel('sms')}
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span>SMS Survey</span>
              </div>
              <Switch checked={localConfig.deliveryChannels.includes('sms')} />
            </div>

            <div
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors",
                localConfig.deliveryChannels.includes('email') ? "border-primary bg-primary/5" : "border-border"
              )}
              onClick={() => toggleChannel('email')}
            >
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Email Survey</span>
              </div>
              <Switch checked={localConfig.deliveryChannels.includes('email')} />
            </div>
          </CardContent>
        </Card>

        {/* Timing Settings */}
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timing & Expiration
            </CardTitle>
            <CardDescription>Control when surveys are sent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Delay after interaction</Label>
                <Badge variant="outline">{localConfig.delaySeconds}s</Badge>
              </div>
              <Slider
                value={[localConfig.delaySeconds]}
                onValueChange={([v]) => updateConfig({ delaySeconds: v })}
                min={0}
                max={60}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Wait time before sending survey after interaction ends
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Survey expiration</Label>
                <Badge variant="outline">{localConfig.expirationHours}h</Badge>
              </div>
              <Slider
                value={[localConfig.expirationHours]}
                onValueChange={([v]) => updateConfig({ expirationHours: v })}
                min={1}
                max={72}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Survey link expires after this time
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Escalation Thresholds */}
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Escalation Thresholds
            </CardTitle>
            <CardDescription>Auto-escalate negative feedback</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>CSAT Negative Threshold</Label>
                <Badge variant="outline" className="text-destructive">
                  ≤ {localConfig.thresholds.csatNegative}/5
                </Badge>
              </div>
              <Slider
                value={[localConfig.thresholds.csatNegative]}
                onValueChange={([v]) => updateConfig({ 
                  thresholds: { ...localConfig.thresholds, csatNegative: v } 
                })}
                min={1}
                max={3}
                step={1}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>NPS Detractor Threshold</Label>
                <Badge variant="outline" className="text-destructive">
                  ≤ {localConfig.thresholds.npsDetractor}/10
                </Badge>
              </div>
              <Slider
                value={[localConfig.thresholds.npsDetractor]}
                onValueChange={([v]) => updateConfig({ 
                  thresholds: { ...localConfig.thresholds, npsDetractor: v } 
                })}
                min={0}
                max={6}
                step={1}
              />
            </div>

            <div className="p-3 rounded-lg bg-destructive/10 text-sm text-destructive">
              Scores at or below these thresholds will automatically create escalations and notify supervisors.
            </div>
          </CardContent>
        </Card>

        {/* Follow-up Question */}
        <Card className="gradient-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Follow-up Question</CardTitle>
            <CardDescription>Ask for more details on low scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="followup-enabled">Enable follow-up question</Label>
              <Switch
                id="followup-enabled"
                checked={localConfig.followUpEnabled}
                onCheckedChange={(followUpEnabled) => updateConfig({ followUpEnabled })}
              />
            </div>

            {localConfig.followUpEnabled && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="followup-question">Question text</Label>
                <Textarea
                  id="followup-question"
                  value={localConfig.followUpQuestion}
                  onChange={(e) => updateConfig({ followUpQuestion: e.target.value })}
                  placeholder="What could we have done better?"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Shown to customers who give low ratings
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
