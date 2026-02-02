import { useState } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Globe,
  Music,
  Hash,
  Plus,
  Trash2,
  Mic,
  Save,
  Loader2,
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
import type { VoiceConfig, DTMFOption } from '@/types/channels';
import { VOICE_PROVIDERS } from '@/types/channels';
import { cn } from '@/lib/utils';

interface VoiceConfigPanelProps {
  config: VoiceConfig;
  onUpdate: (updates: Partial<VoiceConfig>) => Promise<void>;
  onAddDTMF: (option: DTMFOption) => void;
  onRemoveDTMF: (key: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

export function VoiceConfigPanel({
  config,
  onUpdate,
  onAddDTMF,
  onRemoveDTMF,
  isSaving,
  onSave,
}: VoiceConfigPanelProps) {
  const [newDTMFKey, setNewDTMFKey] = useState('');
  const [newDTMFDest, setNewDTMFDest] = useState('');

  const handleAddDTMF = () => {
    if (newDTMFKey && newDTMFDest) {
      onAddDTMF({ key: newDTMFKey, action: 'Route to', destination: newDTMFDest });
      setNewDTMFKey('');
      setNewDTMFDest('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Call Types */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Call Configuration
          </CardTitle>
          <CardDescription>Configure inbound and outbound calling options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Inbound Calls */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-background/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <PhoneIncoming className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Inbound Calls</p>
                <p className="text-sm text-muted-foreground">Receive calls from customers</p>
              </div>
            </div>
            <Switch
              checked={config.inboundEnabled}
              onCheckedChange={(checked) => onUpdate({ inboundEnabled: checked })}
            />
          </div>

          {/* Outbound Calls */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-background/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PhoneOutgoing className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Outbound Calls</p>
                <p className="text-sm text-muted-foreground">Make calls to customers</p>
              </div>
            </div>
            <Switch
              checked={config.outboundEnabled}
              onCheckedChange={(checked) => onUpdate({ outboundEnabled: checked })}
            />
          </div>

          {/* WebRTC */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-background/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium">WebRTC Calling</p>
                <p className="text-sm text-muted-foreground">Enable browser-based calling</p>
              </div>
            </div>
            <Switch
              checked={config.webRtcEnabled}
              onCheckedChange={(checked) => onUpdate({ webRtcEnabled: checked })}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label>Phone Number</Label>
            <Input
              value={config.phoneNumber}
              onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <Label>Welcome Message</Label>
            <Textarea
              value={config.welcomeMessage}
              onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
              placeholder="Welcome to our support line..."
              rows={3}
            />
          </div>

          {/* Hold Music */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              Hold Music
            </Label>
            <Select
              value={config.holdMusic}
              onValueChange={(value: VoiceConfig['holdMusic']) => onUpdate({ holdMusic: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="classical">Classical</SelectItem>
                <SelectItem value="jazz">Jazz</SelectItem>
                <SelectItem value="none">No Music</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Queue Time */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Max Queue Time</Label>
              <span className="text-sm font-medium">{Math.floor(config.maxQueueTime / 60)}m {config.maxQueueTime % 60}s</span>
            </div>
            <Slider
              value={[config.maxQueueTime]}
              onValueChange={([value]) => onUpdate({ maxQueueTime: value })}
              min={60}
              max={600}
              step={30}
            />
          </div>
        </CardContent>
      </Card>

      {/* DTMF / IVR */}
      <Card className="gradient-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                DTMF / IVR Setup
              </CardTitle>
              <CardDescription>Configure touch-tone menu options</CardDescription>
            </div>
            <Switch
              checked={config.dtmf.enabled}
              onCheckedChange={(checked) => onUpdate({ dtmf: { ...config.dtmf, enabled: checked } })}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {config.dtmf.enabled && (
            <>
              <div className="space-y-2">
                {config.dtmf.options.map((option) => (
                  <div
                    key={option.key}
                    className="flex items-center justify-between p-3 rounded-lg border bg-background/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center text-lg font-bold">
                        {option.key}
                      </Badge>
                      <div>
                        <p className="font-medium text-sm">{option.action}</p>
                        <p className="text-xs text-muted-foreground">{option.destination}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onRemoveDTMF(option.key)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={newDTMFKey}
                  onChange={(e) => setNewDTMFKey(e.target.value.slice(0, 1))}
                  placeholder="Key"
                  className="w-16"
                  maxLength={1}
                />
                <Input
                  value={newDTMFDest}
                  onChange={(e) => setNewDTMFDest(e.target.value)}
                  placeholder="Destination (e.g., Sales)"
                  className="flex-1"
                />
                <Button onClick={handleAddDTMF} disabled={!newDTMFKey || !newDTMFDest}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Voice Provider */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            Voice Settings
          </CardTitle>
          <CardDescription>Configure AI voice synthesis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Voice Provider</Label>
            <Select
              value={config.voiceProvider}
              onValueChange={(value: VoiceConfig['voiceProvider']) => onUpdate({ voiceProvider: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VOICE_PROVIDERS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Voice ID</Label>
            <Select
              value={config.voiceId}
              onValueChange={(value) => onUpdate({ voiceId: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rachel">Rachel (Female)</SelectItem>
                <SelectItem value="adam">Adam (Male)</SelectItem>
                <SelectItem value="bella">Bella (Female)</SelectItem>
                <SelectItem value="josh">Josh (Male)</SelectItem>
              </SelectContent>
            </Select>
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
          Save Voice Configuration
        </Button>
      </div>
    </div>
  );
}
