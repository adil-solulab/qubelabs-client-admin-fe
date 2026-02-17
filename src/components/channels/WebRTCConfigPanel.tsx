import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Server,
  Shield,
  Wifi,
  Settings2,
  Radio,
  Mic,
  Network,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Edit2,
  Check,
  X,
  Loader2,
  Volume2,
  Lock,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WebRTCConfig, IceServer } from '@/types/channels';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface WebRTCConfigPanelProps {
  config: WebRTCConfig;
  isSaving: boolean;
  onUpdate: (updates: Partial<WebRTCConfig>) => Promise<void>;
  onBack: () => void;
}

const emptyIceServer: Omit<IceServer, 'id'> = {
  type: 'stun',
  url: '',
  username: '',
  credential: '',
  priority: 1,
  enabled: true,
};

export function WebRTCConfigPanel({
  config,
  isSaving,
  onUpdate,
  onBack,
}: WebRTCConfigPanelProps) {
  const [activeTab, setActiveTab] = useState('ice-servers');
  const [addingServer, setAddingServer] = useState(false);
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [serverForm, setServerForm] = useState<Omit<IceServer, 'id'>>(emptyIceServer);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateServerForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!serverForm.url.trim()) errors.url = 'URL is required';
    if (serverForm.type === 'turn' && !serverForm.username?.trim()) errors.username = 'Username is required for TURN servers';
    if (serverForm.type === 'turn' && !serverForm.credential?.trim()) errors.credential = 'Credential is required for TURN servers';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddServer = async () => {
    if (!validateServerForm()) return;
    const newServer: IceServer = {
      ...serverForm,
      id: `ice-${Date.now()}`,
    };
    await onUpdate({ iceServers: [...config.iceServers, newServer] });
    notify.saved('WebRTC configuration');
    setAddingServer(false);
    setServerForm(emptyIceServer);
    setFormErrors({});
  };

  const handleEditServer = async () => {
    if (!validateServerForm() || !editingServerId) return;
    const updated = config.iceServers.map((s) =>
      s.id === editingServerId ? { ...serverForm, id: editingServerId } : s
    );
    await onUpdate({ iceServers: updated });
    notify.saved('WebRTC configuration');
    setEditingServerId(null);
    setServerForm(emptyIceServer);
    setFormErrors({});
  };

  const handleDeleteServer = async (id: string) => {
    await onUpdate({ iceServers: config.iceServers.filter((s) => s.id !== id) });
    notify.saved('WebRTC configuration');
  };

  const handleToggleServer = async (id: string, enabled: boolean) => {
    const updated = config.iceServers.map((s) =>
      s.id === id ? { ...s, enabled } : s
    );
    await onUpdate({ iceServers: updated });
    notify.saved('WebRTC configuration');
  };

  const startEditServer = (server: IceServer) => {
    setEditingServerId(server.id);
    setServerForm({
      type: server.type,
      url: server.url,
      username: server.username,
      credential: server.credential,
      priority: server.priority,
      enabled: server.enabled,
    });
    setAddingServer(false);
    setFormErrors({});
  };

  const cancelServerForm = () => {
    setAddingServer(false);
    setEditingServerId(null);
    setServerForm(emptyIceServer);
    setFormErrors({});
  };

  const handleAudioCodecChange = async (key: string, value: Record<string, boolean | number>) => {
    await onUpdate({
      audioCodecs: { ...config.audioCodecs, [key]: { ...((config.audioCodecs as Record<string, unknown>)[key] as Record<string, unknown>), ...value } },
    });
    notify.saved('WebRTC configuration');
  };

  const handleCodecPriorityMove = async (index: number, direction: 'up' | 'down') => {
    const priority = [...config.audioCodecs.priority];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= priority.length) return;
    [priority[index], priority[newIndex]] = [priority[newIndex], priority[index]];
    await onUpdate({ audioCodecs: { ...config.audioCodecs, priority } });
    notify.saved('WebRTC configuration');
  };

  const handleAudioProcessingChange = async (key: string, value: boolean | string | number) => {
    await onUpdate({
      audioProcessing: { ...config.audioProcessing, [key]: value } as WebRTCConfig['audioProcessing'],
    });
    notify.saved('WebRTC configuration');
  };

  const handleBandwidthChange = async (key: string, value: boolean | number) => {
    await onUpdate({
      bandwidth: { ...config.bandwidth, [key]: value } as WebRTCConfig['bandwidth'],
    });
    notify.saved('WebRTC configuration');
  };

  const handleSipChange = async (key: string, value: boolean | string | number) => {
    await onUpdate({
      sipGateway: { ...config.sipGateway, [key]: value } as WebRTCConfig['sipGateway'],
    });
    notify.saved('WebRTC configuration');
  };

  const handleSecurityChange = async (key: string, value: boolean | string) => {
    await onUpdate({
      security: { ...config.security, [key]: value } as WebRTCConfig['security'],
    });
    notify.saved('WebRTC configuration');
  };

  const handleNetworkChange = async (key: string, value: boolean | string | number) => {
    await onUpdate({
      network: { ...config.network, [key]: value } as WebRTCConfig['network'],
    });
    notify.saved('WebRTC configuration');
  };

  const renderServerForm = (isEditing: boolean) => (
    <Card className="border-dashed">
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              value={serverForm.type}
              onValueChange={(v) => setServerForm({ ...serverForm, type: v as 'stun' | 'turn' })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="stun">STUN</SelectItem>
                <SelectItem value="turn">TURN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={serverForm.url}
              onChange={(e) => setServerForm({ ...serverForm, url: e.target.value })}
              placeholder="stun:stun.example.com:3478"
              className={cn(formErrors.url && 'border-destructive')}
            />
            {formErrors.url && <p className="text-xs text-destructive">{formErrors.url}</p>}
          </div>
        </div>
        {serverForm.type === 'turn' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={serverForm.username || ''}
                onChange={(e) => setServerForm({ ...serverForm, username: e.target.value })}
                placeholder="Username"
                className={cn(formErrors.username && 'border-destructive')}
              />
              {formErrors.username && <p className="text-xs text-destructive">{formErrors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label>Credential</Label>
              <Input
                type="password"
                value={serverForm.credential || ''}
                onChange={(e) => setServerForm({ ...serverForm, credential: e.target.value })}
                placeholder="Credential"
                className={cn(formErrors.credential && 'border-destructive')}
              />
              {formErrors.credential && <p className="text-xs text-destructive">{formErrors.credential}</p>}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label>Priority</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={serverForm.priority}
            onChange={(e) => setServerForm({ ...serverForm, priority: parseInt(e.target.value) || 1 })}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={cancelServerForm}>
            <X className="w-4 h-4 mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={isEditing ? handleEditServer : handleAddServer} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            {isEditing ? 'Save' : 'Add Server'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Radio className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">WebRTC Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Integrations &gt; WebRTC Configuration
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="ice-servers" className="gap-1.5">
            <Server className="w-3.5 h-3.5" />
            ICE Servers
          </TabsTrigger>
          <TabsTrigger value="audio-codecs" className="gap-1.5">
            <Volume2 className="w-3.5 h-3.5" />
            Audio Codecs
          </TabsTrigger>
          <TabsTrigger value="audio-processing" className="gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            Audio Processing
          </TabsTrigger>
          <TabsTrigger value="bandwidth" className="gap-1.5">
            <Wifi className="w-3.5 h-3.5" />
            Bandwidth &amp; Quality
          </TabsTrigger>
          <TabsTrigger value="sip-gateway" className="gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            SIP Gateway
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="network" className="gap-1.5">
            <Network className="w-3.5 h-3.5" />
            Network
          </TabsTrigger>
        </TabsList>

        {/* ICE Servers Tab */}
        <TabsContent value="ice-servers">
          <Card className="gradient-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">STUN/TURN Servers</CardTitle>
              <Button
                size="sm"
                onClick={() => {
                  setAddingServer(true);
                  setEditingServerId(null);
                  setServerForm(emptyIceServer);
                  setFormErrors({});
                }}
                disabled={addingServer}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Server
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {addingServer && renderServerForm(false)}

              {config.iceServers.length === 0 && !addingServer && (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No ICE servers configured</p>
                  <p className="text-xs mt-1">Add STUN or TURN servers to enable WebRTC connectivity</p>
                </div>
              )}

              {config.iceServers.map((server) => (
                <div key={server.id}>
                  {editingServerId === server.id ? (
                    renderServerForm(true)
                  ) : (
                    <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={server.type === 'stun' ? 'secondary' : 'default'} className="uppercase text-[10px]">
                            {server.type}
                          </Badge>
                          <span className="text-sm font-medium truncate">{server.url}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Priority: {server.priority}
                          {server.username && ` · User: ${server.username}`}
                        </p>
                      </div>
                      <Switch
                        checked={server.enabled}
                        onCheckedChange={(checked) => handleToggleServer(server.id, checked)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEditServer(server)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteServer(server.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Codecs Tab */}
        <TabsContent value="audio-codecs">
          <div className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">Opus Codec</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Opus</Label>
                    <p className="text-xs text-muted-foreground">High-quality, low-latency audio codec</p>
                  </div>
                  <Switch
                    checked={config.audioCodecs.opus.enabled}
                    onCheckedChange={(checked) => handleAudioCodecChange('opus', { enabled: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Bitrate</Label>
                    <span className="text-sm font-medium text-primary">{config.audioCodecs.opus.bitrate.toLocaleString()} bps</span>
                  </div>
                  <Slider
                    value={[config.audioCodecs.opus.bitrate]}
                    onValueChange={([v]) => handleAudioCodecChange('opus', { bitrate: v })}
                    min={8000}
                    max={128000}
                    step={1000}
                    disabled={!config.audioCodecs.opus.enabled}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>8,000</span>
                    <span>128,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <Label className="text-sm">Stereo</Label>
                    <Switch
                      checked={config.audioCodecs.opus.stereo}
                      onCheckedChange={(checked) => handleAudioCodecChange('opus', { stereo: checked })}
                      disabled={!config.audioCodecs.opus.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <Label className="text-sm">DTX</Label>
                    <Switch
                      checked={config.audioCodecs.opus.dtx}
                      onCheckedChange={(checked) => handleAudioCodecChange('opus', { dtx: checked })}
                      disabled={!config.audioCodecs.opus.enabled}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <Label className="text-sm">FEC</Label>
                    <Switch
                      checked={config.audioCodecs.opus.fec}
                      onCheckedChange={(checked) => handleAudioCodecChange('opus', { fec: checked })}
                      disabled={!config.audioCodecs.opus.enabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">Other Codecs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'g711u', label: 'G.711μ (PCMU)', desc: 'μ-law PCM codec, 64 kbps' },
                  { key: 'g711a', label: 'G.711a (PCMA)', desc: 'A-law PCM codec, 64 kbps' },
                  { key: 'g722', label: 'G.722', desc: 'Wideband audio codec, 64 kbps' },
                ].map((codec) => (
                  <div key={codec.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <Label>{codec.label}</Label>
                      <p className="text-xs text-muted-foreground">{codec.desc}</p>
                    </div>
                    <Switch
                      checked={(config.audioCodecs[codec.key as keyof typeof config.audioCodecs] as { enabled: boolean }).enabled}
                      onCheckedChange={(checked) => handleAudioCodecChange(codec.key, { enabled: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">Codec Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {config.audioCodecs.priority.map((codec, index) => (
                    <div key={codec} className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/30">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">{index + 1}</Badge>
                      <span className="text-sm font-medium flex-1">{codec}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCodecPriorityMove(index, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleCodecPriorityMove(index, 'down')}
                          disabled={index === config.audioCodecs.priority.length - 1}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audio Processing Tab */}
        <TabsContent value="audio-processing">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Audio Processing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Echo Cancellation</Label>
                  <p className="text-xs text-muted-foreground">Remove acoustic echo from audio</p>
                </div>
                <Switch
                  checked={config.audioProcessing.echoCancellation}
                  onCheckedChange={(checked) => handleAudioProcessingChange('echoCancellation', checked)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Noise Suppression</Label>
                    <p className="text-xs text-muted-foreground">Reduce background noise</p>
                  </div>
                  <Switch
                    checked={config.audioProcessing.noiseSuppression}
                    onCheckedChange={(checked) => handleAudioProcessingChange('noiseSuppression', checked)}
                  />
                </div>
                {config.audioProcessing.noiseSuppression && (
                  <div className="ml-4 space-y-2 p-3 rounded-lg border bg-muted/30">
                    <Label className="text-xs">Suppression Level</Label>
                    <Select
                      value={config.audioProcessing.noiseSuppressionLevel}
                      onValueChange={(v) => handleAudioProcessingChange('noiseSuppressionLevel', v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="very-high">Very High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Gain Control</Label>
                  <p className="text-xs text-muted-foreground">Automatically adjust microphone volume</p>
                </div>
                <Switch
                  checked={config.audioProcessing.autoGainControl}
                  onCheckedChange={(checked) => handleAudioProcessingChange('autoGainControl', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Comfort Noise</Label>
                  <p className="text-xs text-muted-foreground">Generate background noise during silence</p>
                </div>
                <Switch
                  checked={config.audioProcessing.comfortNoise}
                  onCheckedChange={(checked) => handleAudioProcessingChange('comfortNoise', checked)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Voice Activity Detection (VAD)</Label>
                    <p className="text-xs text-muted-foreground">Detect when speech is present</p>
                  </div>
                  <Switch
                    checked={config.audioProcessing.vadEnabled}
                    onCheckedChange={(checked) => handleAudioProcessingChange('vadEnabled', checked)}
                  />
                </div>
                {config.audioProcessing.vadEnabled && (
                  <div className="ml-4 space-y-2 p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">VAD Sensitivity</Label>
                      <span className="text-sm font-medium text-primary">{config.audioProcessing.vadSensitivity}%</span>
                    </div>
                    <Slider
                      value={[config.audioProcessing.vadSensitivity]}
                      onValueChange={([v]) => handleAudioProcessingChange('vadSensitivity', v)}
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bandwidth & Quality Tab */}
        <TabsContent value="bandwidth">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Bandwidth &amp; Quality Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Audio Bitrate (bps)</Label>
                  <Input
                    type="number"
                    value={config.bandwidth.maxAudioBitrate}
                    onChange={(e) => handleBandwidthChange('maxAudioBitrate', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <Label>Adaptive Bitrate</Label>
                    <p className="text-xs text-muted-foreground">Adjust bitrate based on network conditions</p>
                  </div>
                  <Switch
                    checked={config.bandwidth.adaptiveBitrate}
                    onCheckedChange={(checked) => handleBandwidthChange('adaptiveBitrate', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jitter Buffer Target (ms)</Label>
                  <Input
                    type="number"
                    value={config.bandwidth.jitterBufferTarget}
                    onChange={(e) => handleBandwidthChange('jitterBufferTarget', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jitter Buffer Max (ms)</Label>
                  <Input
                    type="number"
                    value={config.bandwidth.jitterBufferMax}
                    onChange={(e) => handleBandwidthChange('jitterBufferMax', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Packet Loss Threshold (%)</Label>
                <Input
                  type="number"
                  value={config.bandwidth.packetLossThreshold}
                  onChange={(e) => handleBandwidthChange('packetLossThreshold', parseFloat(e.target.value) || 0)}
                  min={0}
                  max={100}
                  step={0.1}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SIP Gateway Tab */}
        <TabsContent value="sip-gateway">
          <Card className="gradient-card">
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle className="text-base">SIP Gateway</CardTitle>
                <Switch
                  checked={config.sipGateway.enabled}
                  onCheckedChange={(checked) => handleSipChange('enabled', checked)}
                />
              </div>
            </CardHeader>
            <CardContent className={cn('space-y-5', !config.sipGateway.enabled && 'opacity-50 pointer-events-none')}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Server URL</Label>
                  <Input
                    value={config.sipGateway.serverUrl}
                    onChange={(e) => handleSipChange('serverUrl', e.target.value)}
                    placeholder="sip.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Transport</Label>
                  <Select
                    value={config.sipGateway.transport}
                    onValueChange={(v) => handleSipChange('transport', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="udp">UDP</SelectItem>
                      <SelectItem value="tcp">TCP</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="wss">WSS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Registrar URL</Label>
                <Input
                  value={config.sipGateway.registrarUrl}
                  onChange={(e) => handleSipChange('registrarUrl', e.target.value)}
                  placeholder="sip:registrar.example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={config.sipGateway.username}
                    onChange={(e) => handleSipChange('username', e.target.value)}
                    placeholder="SIP username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={config.sipGateway.password}
                    onChange={(e) => handleSipChange('password', e.target.value)}
                    placeholder="SIP password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domain</Label>
                  <Input
                    value={config.sipGateway.domain}
                    onChange={(e) => handleSipChange('domain', e.target.value)}
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Outbound Proxy</Label>
                  <Input
                    value={config.sipGateway.outboundProxy}
                    onChange={(e) => handleSipChange('outboundProxy', e.target.value)}
                    placeholder="sip:proxy.example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Registration Expiry (seconds)</Label>
                  <Input
                    type="number"
                    value={config.sipGateway.registrationExpiry}
                    onChange={(e) => handleSipChange('registrationExpiry', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keep-Alive Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={config.sipGateway.keepAliveInterval}
                    onChange={(e) => handleSipChange('keepAliveInterval', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  SRTP
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable SRTP</Label>
                    <p className="text-xs text-muted-foreground">Secure Real-time Transport Protocol</p>
                  </div>
                  <Switch
                    checked={config.security.srtp}
                    onCheckedChange={(checked) => handleSecurityChange('srtp', checked)}
                  />
                </div>
                {config.security.srtp && (
                  <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                    <Label className="text-xs">SRTP Mode</Label>
                    <Select
                      value={config.security.srtpMode}
                      onValueChange={(v) => handleSecurityChange('srtpMode', v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="required">Required</SelectItem>
                        <SelectItem value="preferred">Preferred</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  DTLS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable DTLS</Label>
                    <p className="text-xs text-muted-foreground">Datagram Transport Layer Security</p>
                  </div>
                  <Switch
                    checked={config.security.dtls}
                    onCheckedChange={(checked) => handleSecurityChange('dtls', checked)}
                  />
                </div>
                {config.security.dtls && (
                  <div className="space-y-2 p-3 rounded-lg border bg-muted/30">
                    <Label className="text-xs">Fingerprint Algorithm</Label>
                    <Select
                      value={config.security.dtlsFingerprint}
                      onValueChange={(v) => handleSecurityChange('dtlsFingerprint', v)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sha-256">SHA-256</SelectItem>
                        <SelectItem value="sha-1">SHA-1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  OAuth
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable OAuth</Label>
                    <p className="text-xs text-muted-foreground">OAuth-based authentication for WebRTC</p>
                  </div>
                  <Switch
                    checked={config.security.oauthEnabled}
                    onCheckedChange={(checked) => handleSecurityChange('oauthEnabled', checked)}
                  />
                </div>
                {config.security.oauthEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg border bg-muted/30">
                    <div className="space-y-2">
                      <Label className="text-xs">Provider</Label>
                      <Input
                        value={config.security.oauthProvider}
                        onChange={(e) => handleSecurityChange('oauthProvider', e.target.value)}
                        placeholder="OAuth provider"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Client ID</Label>
                      <Input
                        value={config.security.oauthClientId}
                        onChange={(e) => handleSecurityChange('oauthClientId', e.target.value)}
                        placeholder="Client ID"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Network Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ICE Transport Policy</Label>
                  <Select
                    value={config.network.iceTransportPolicy}
                    onValueChange={(v) => handleNetworkChange('iceTransportPolicy', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="relay">Relay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>ICE Candidate Pool Size</Label>
                  <Input
                    type="number"
                    value={config.network.iceCandidatePoolSize}
                    onChange={(e) => handleNetworkChange('iceCandidatePoolSize', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bundle Policy</Label>
                  <Select
                    value={config.network.bundlePolicy}
                    onValueChange={(v) => handleNetworkChange('bundlePolicy', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="max-compat">Max Compat</SelectItem>
                      <SelectItem value="max-bundle">Max Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>RTCP Mux Policy</Label>
                  <Select
                    value={config.network.rtcpMuxPolicy}
                    onValueChange={(v) => handleNetworkChange('rtcpMuxPolicy', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="require">Require</SelectItem>
                      <SelectItem value="negotiate">Negotiate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <Label>TCP Candidates</Label>
                    <p className="text-xs text-muted-foreground">Allow TCP ICE candidates</p>
                  </div>
                  <Switch
                    checked={config.network.tcpCandidates}
                    onCheckedChange={(checked) => handleNetworkChange('tcpCandidates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <Label>Continuous ICE Gathering</Label>
                    <p className="text-xs text-muted-foreground">Keep gathering candidates</p>
                  </div>
                  <Switch
                    checked={config.network.continuousGathering}
                    onCheckedChange={(checked) => handleNetworkChange('continuousGathering', checked)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Connection Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={config.network.connectionTimeout}
                    onChange={(e) => handleNetworkChange('connectionTimeout', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Keep-Alive Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={config.network.keepAliveInterval}
                    onChange={(e) => handleNetworkChange('keepAliveInterval', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
