import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Phone,
  PhoneCall,
  Copy,
  Check,
  Code,
  Settings,
  Palette,
  Shield,
  Volume2,
  Mic,
  MicOff,
  PhoneOff,
  Wifi,
  Clock,
  X,
  Play,
  Square,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

interface WidgetConfig {
  buttonText: string;
  buttonPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  buttonColor: string;
  buttonTextColor: string;
  buttonSize: 'small' | 'medium' | 'large';
  buttonStyle: 'pill' | 'rounded' | 'circle';
  showIcon: boolean;
  showPulse: boolean;
  enableMute: boolean;
  enableSpeaker: boolean;
  enableHold: boolean;
  showCallDuration: boolean;
  showNetworkQuality: boolean;
  maxCallDuration: number;
  theme: 'light' | 'dark' | 'auto';
  borderRadius: number;
  fontFamily: string;
  allowedDomains: string;
}

const DEFAULT_CONFIG: WidgetConfig = {
  buttonText: 'Call Us',
  buttonPosition: 'bottom-right',
  buttonColor: '#3B82F6',
  buttonTextColor: '#FFFFFF',
  buttonSize: 'medium',
  buttonStyle: 'pill',
  showIcon: true,
  showPulse: true,
  enableMute: true,
  enableSpeaker: true,
  enableHold: true,
  showCallDuration: true,
  showNetworkQuality: true,
  maxCallDuration: 30,
  theme: 'light',
  borderRadius: 16,
  fontFamily: 'Inter, system-ui, sans-serif',
  allowedDomains: '*',
};

const COLOR_PRESETS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
];

interface WebRTCConfiguratorProps {
  onBack: () => void;
}

export function WebRTCConfigurator({ onBack }: WebRTCConfiguratorProps) {
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<'idle' | 'connecting' | 'active' | 'ended'>('idle');
  const [previewMuted, setPreviewMuted] = useState(false);
  const [previewDuration, setPreviewDuration] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (connectTimeoutRef.current) { clearTimeout(connectTimeoutRef.current); connectTimeoutRef.current = null; }
    if (endTimeoutRef.current) { clearTimeout(endTimeoutRef.current); endTimeoutRef.current = null; }
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  const updateConfig = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    notify.copied();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startPreview = () => {
    clearAllTimers();
    setPreviewState('connecting');
    setPreviewDuration(0);
    setPreviewMuted(false);
    connectTimeoutRef.current = setTimeout(() => {
      setPreviewState('active');
      intervalRef.current = setInterval(() => {
        setPreviewDuration(prev => {
          if (prev >= 15) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }, 2000);
  };

  const endPreview = () => {
    clearAllTimers();
    setPreviewState('ended');
    setPreviewMuted(false);
    setPreviewDuration(0);
    endTimeoutRef.current = setTimeout(() => setPreviewState('idle'), 3000);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const jsStr = (s: string) => JSON.stringify(s);

  const embedCode = useMemo(() => {
    return `<!-- ConX Inbound WebRTC SDK -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['ConXCall']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','conxcall','https://cdn.conx.ai/webrtc-sdk.js'));
  conxcall('init', {
    projectKey: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
    button: {
      text: ${jsStr(config.buttonText)},
      position: ${jsStr(config.buttonPosition)},
      color: ${jsStr(config.buttonColor)},
      textColor: ${jsStr(config.buttonTextColor)},
      size: ${jsStr(config.buttonSize)},
      style: ${jsStr(config.buttonStyle)},
      showIcon: ${config.showIcon},
      showPulse: ${config.showPulse}
    },
    ui: {
      theme: ${jsStr(config.theme)},
      borderRadius: ${config.borderRadius},
      fontFamily: ${jsStr(config.fontFamily)}
    },
    features: {
      enableMute: ${config.enableMute},
      enableSpeaker: ${config.enableSpeaker},
      enableHold: ${config.enableHold},
      showCallDuration: ${config.showCallDuration},
      showNetworkQuality: ${config.showNetworkQuality},
      maxCallDuration: ${config.maxCallDuration}
    },
    security: {
      allowedDomains: ${jsStr(config.allowedDomains)}
    }
  });
</script>`;
  }, [config]);

  const reactCode = useMemo(() => {
    const esc = (s: string) => s.replace(/"/g, '\\"');
    return `import { ConXCallButton } from '@conx/webrtc-sdk/react';

function App() {
  return (
    <ConXCallButton
      projectKey="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
      buttonText="${esc(config.buttonText)}"
      position="${esc(config.buttonPosition)}"
      color="${esc(config.buttonColor)}"
      theme="${esc(config.theme)}"
      onCallStart={() => console.log('Call started')}
      onCallEnd={(summary) => console.log('Call ended', summary)}
      onError={(err) => console.error('Call error', err)}
    />
  );
}`;
  }, [config]);

  const buttonSizeClasses = {
    small: 'px-3 py-1.5 text-xs gap-1.5',
    medium: 'px-4 py-2.5 text-sm gap-2',
    large: 'px-6 py-3 text-base gap-2.5',
  };

  const buttonStyleClasses = {
    pill: 'rounded-full',
    rounded: `rounded-[${config.borderRadius}px]`,
    circle: 'rounded-full aspect-square !px-0 w-12 h-12',
  };

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Voice WebRTC Widget Configurator</h2>
            <p className="text-sm text-muted-foreground">
              Configure the embeddable "Call Us" button for browser-based voice calls
            </p>
          </div>
        </div>
        <Badge variant="outline">v1.2.0</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="appearance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance" className="text-xs">
                <Palette className="w-3.5 h-3.5 mr-1" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="behavior" className="text-xs">
                <Settings className="w-3.5 h-3.5 mr-1" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="security" className="text-xs">
                <Shield className="w-3.5 h-3.5 mr-1" />
                Security
              </TabsTrigger>
              <TabsTrigger value="code" className="text-xs">
                <Code className="w-3.5 h-3.5 mr-1" />
                Embed Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Button Appearance</CardTitle>
                  <CardDescription className="text-xs">Customize how the Call Us button looks on your website</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Button Text</Label>
                      <Input
                        value={config.buttonText}
                        onChange={e => updateConfig('buttonText', e.target.value)}
                        placeholder="Call Us"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Position</Label>
                      <Select value={config.buttonPosition} onValueChange={v => updateConfig('buttonPosition', v as WidgetConfig['buttonPosition'])}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottom-right">Bottom Right</SelectItem>
                          <SelectItem value="bottom-left">Bottom Left</SelectItem>
                          <SelectItem value="top-right">Top Right</SelectItem>
                          <SelectItem value="top-left">Top Left</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Button Style</Label>
                      <Select value={config.buttonStyle} onValueChange={v => updateConfig('buttonStyle', v as WidgetConfig['buttonStyle'])}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pill">Pill</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="circle">Circle (Icon Only)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Button Size</Label>
                      <Select value={config.buttonSize} onValueChange={v => updateConfig('buttonSize', v as WidgetConfig['buttonSize'])}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Button Color</Label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLOR_PRESETS.map(c => (
                        <button
                          key={c.value}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all",
                            config.buttonColor === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
                          )}
                          style={{ backgroundColor: c.value }}
                          onClick={() => updateConfig('buttonColor', c.value)}
                          title={c.name}
                        />
                      ))}
                      <div className="flex items-center gap-1.5 ml-2">
                        <Input
                          type="color"
                          value={config.buttonColor}
                          onChange={e => updateConfig('buttonColor', e.target.value)}
                          className="w-8 h-8 p-0.5 cursor-pointer"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{config.buttonColor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Show Phone Icon</Label>
                        <p className="text-[10px] text-muted-foreground">Display icon next to text</p>
                      </div>
                      <Switch checked={config.showIcon} onCheckedChange={v => updateConfig('showIcon', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-xs">Pulse Animation</Label>
                        <p className="text-[10px] text-muted-foreground">Attract attention with pulse</p>
                      </div>
                      <Switch checked={config.showPulse} onCheckedChange={v => updateConfig('showPulse', v)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Theme & Styling</CardTitle>
                  <CardDescription className="text-xs">Customize the call dialog appearance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Theme</Label>
                      <Select value={config.theme} onValueChange={v => updateConfig('theme', v as WidgetConfig['theme'])}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="auto">Auto (Match Website)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Font Family</Label>
                      <Select value={config.fontFamily} onValueChange={v => updateConfig('fontFamily', v)}>
                        <SelectTrigger className="text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter, system-ui, sans-serif">Inter</SelectItem>
                          <SelectItem value="system-ui, sans-serif">System Default</SelectItem>
                          <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                          <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Border Radius</Label>
                      <span className="text-xs text-muted-foreground font-mono">{config.borderRadius}px</span>
                    </div>
                    <Slider
                      value={[config.borderRadius]}
                      onValueChange={([v]) => updateConfig('borderRadius', v)}
                      min={0}
                      max={24}
                      step={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Call Controls</CardTitle>
                  <CardDescription className="text-xs">Configure available call features for the end user</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'enableMute' as const, label: 'Mute Button', desc: 'Allow users to mute microphone' },
                      { key: 'enableSpeaker' as const, label: 'Speaker Button', desc: 'Allow users to toggle speaker' },
                      { key: 'enableHold' as const, label: 'Hold Button', desc: 'Allow users to place call on hold' },
                      { key: 'showCallDuration' as const, label: 'Call Duration', desc: 'Display elapsed call time' },
                      { key: 'showNetworkQuality' as const, label: 'Network Quality', desc: 'Show connection quality indicator' },
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-2 rounded-lg border bg-muted/20">
                        <div>
                          <Label className="text-xs">{item.label}</Label>
                          <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                        </div>
                        <Switch
                          checked={config[item.key] as boolean}
                          onCheckedChange={v => updateConfig(item.key, v)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Max Call Duration (minutes)</Label>
                      <span className="text-xs font-mono text-muted-foreground">{config.maxCallDuration} min</span>
                    </div>
                    <Slider
                      value={[config.maxCallDuration]}
                      onValueChange={([v]) => updateConfig('maxCallDuration', v)}
                      min={5}
                      max={60}
                      step={5}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Domain Restrictions</CardTitle>
                  <CardDescription className="text-xs">Control where the widget can be embedded</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Allowed Domains</Label>
                    <Input
                      value={config.allowedDomains}
                      onChange={e => updateConfig('allowedDomains', e.target.value)}
                      placeholder="*.example.com, app.mysite.com"
                      className="text-sm"
                    />
                    <p className="text-[10px] text-muted-foreground">Use * to allow all domains, or specify comma-separated domain patterns</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Quick Start</CardTitle>
                  <CardDescription className="text-xs">Get started in 3 simple steps</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                      <div>
                        <p className="text-sm font-medium">Configure your widget</p>
                        <p className="text-xs text-muted-foreground">Use the tabs above to customize appearance and set behavior</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                      <div>
                        <p className="text-sm font-medium">Copy the embed code</p>
                        <p className="text-xs text-muted-foreground">Add the generated script tag to your website's HTML</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/20">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                      <div>
                        <p className="text-sm font-medium">Test & publish</p>
                        <p className="text-xs text-muted-foreground">Preview the widget on your site and go live</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">HTML Embed Code</CardTitle>
                      <CardDescription className="text-xs">Paste this snippet before the closing &lt;/body&gt; tag</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px]">HTML</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-muted/50 border text-[11px] overflow-x-auto max-h-[300px] leading-relaxed">
                      <code>{embedCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(embedCode, 'embed')}
                    >
                      {copiedId === 'embed' ? <Check className="w-3.5 h-3.5 mr-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedId === 'embed' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">React / Next.js Component</CardTitle>
                      <CardDescription className="text-xs">Use the React component for framework integration</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px]">React</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-muted/50 border text-[11px] overflow-x-auto leading-relaxed">
                      <code>npm install @conx/webrtc-sdk</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy('npm install @conx/webrtc-sdk', 'npm')}
                    >
                      {copiedId === 'npm' ? <Check className="w-3.5 h-3.5 mr-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedId === 'npm' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-muted/50 border text-[11px] overflow-x-auto max-h-[250px] leading-relaxed">
                      <code>{reactCode}</code>
                    </pre>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 right-2"
                      onClick={() => handleCopy(reactCode, 'react')}
                    >
                      {copiedId === 'react' ? <Check className="w-3.5 h-3.5 mr-1 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedId === 'react' ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">SDK Events Reference</CardTitle>
                  <CardDescription className="text-xs">Available event callbacks for the WebRTC SDK</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      { event: 'onCallStart', desc: 'Fired when the call is established' },
                      { event: 'onCallEnd', desc: 'Fired when the call ends, includes call summary' },
                      { event: 'onError', desc: 'Fired when an error occurs during the call' },
                      { event: 'onMuteChange', desc: 'Fired when user toggles microphone mute' },
                      { event: 'onHoldChange', desc: 'Fired when user toggles call hold' },
                      { event: 'onNetworkQualityChange', desc: 'Fired when network quality changes' },
                    ].map(item => (
                      <div key={item.event} className="flex items-start gap-2 p-2 rounded-lg border bg-muted/20">
                        <code className="text-[11px] font-semibold text-primary whitespace-nowrap">{item.event}</code>
                        <span className="text-[11px] text-muted-foreground">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Live Preview</CardTitle>
                <Badge variant="outline" className="text-[10px]">Interactive</Badge>
              </div>
              <CardDescription className="text-xs">See how the widget will look on your website</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "relative w-full aspect-[3/4] rounded-xl border-2 overflow-hidden",
                  config.theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                )}
              >
                <div className={cn(
                  "h-8 flex items-center px-3 gap-1.5",
                  config.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                )}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className={cn(
                    "text-[8px] ml-2",
                    config.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>yourwebsite.com</span>
                </div>

                <div className="p-3 space-y-2">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 rounded-full",
                        config.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                      )}
                      style={{ width: `${60 + Math.random() * 40}%` }}
                    />
                  ))}
                </div>

                {previewState === 'idle' && (
                  <div className={`absolute ${positionClasses[config.buttonPosition]}`}>
                    <button
                      onClick={startPreview}
                      className={cn(
                        "flex items-center font-medium shadow-lg transition-all hover:scale-105",
                        buttonSizeClasses[config.buttonSize],
                        buttonStyleClasses[config.buttonStyle],
                        config.showPulse && "animate-pulse"
                      )}
                      style={{
                        backgroundColor: config.buttonColor,
                        color: config.buttonTextColor,
                      }}
                    >
                      {config.showIcon && <Phone className="w-3.5 h-3.5" />}
                      {config.buttonStyle !== 'circle' && config.buttonText}
                    </button>
                  </div>
                )}

                {previewState !== 'idle' && (
                  <div className={`absolute ${positionClasses[config.buttonPosition]} w-[200px]`}>
                    <div
                      className={cn(
                        "shadow-xl border overflow-hidden",
                        config.theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      )}
                      style={{ borderRadius: `${config.borderRadius}px` }}
                    >
                      <div
                        className="p-3 flex items-center justify-between"
                        style={{ backgroundColor: config.buttonColor }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                            <PhoneCall className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-white">AI Agent</p>
                            <p className="text-[8px] text-white/70">
                              {previewState === 'connecting' && 'Connecting...'}
                              {previewState === 'active' && 'In Call'}
                              {previewState === 'ended' && 'Call Ended'}
                            </p>
                          </div>
                        </div>
                        {config.showCallDuration && previewState === 'active' && (
                          <span className="text-[10px] text-white/80 font-mono">{formatDuration(previewDuration)}</span>
                        )}
                      </div>

                      <div className="p-3 space-y-2">
                        {previewState === 'connecting' && (
                          <div className="flex items-center justify-center py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}

                        {previewState === 'active' && (
                          <>
                            {config.showNetworkQuality && (
                              <div className="flex items-center gap-1 justify-end">
                                <Wifi className="w-2.5 h-2.5 text-green-500" />
                                <span className="text-[8px] text-green-500">Excellent</span>
                              </div>
                            )}
                            <div className="flex items-center justify-center gap-3 py-2">
                              {config.enableMute && (
                                <button
                                  onClick={() => setPreviewMuted(!previewMuted)}
                                  className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                    previewMuted
                                      ? 'bg-red-100 text-red-600'
                                      : config.theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                  )}
                                >
                                  {previewMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              {config.enableSpeaker && (
                                <button className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  config.theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                )}>
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {config.enableHold && (
                                <button className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center",
                                  config.theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                )}>
                                  <Clock className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={endPreview}
                                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                              >
                                <PhoneOff className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </>
                        )}

                        {previewState === 'ended' && (
                          <div className="text-center py-2">
                            <p className="text-[10px] text-muted-foreground">Thank you for calling. Have a great day!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                {previewState === 'idle' ? (
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={startPreview}>
                    <Play className="w-3 h-3 mr-1" />
                    Test Widget
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={endPreview}>
                    <Square className="w-3 h-3 mr-1" />
                    Reset Preview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Integration Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Calls', value: '1,247' },
                  { label: 'Avg Duration', value: '3:42' },
                  { label: 'Success Rate', value: '98.5%' },
                  { label: 'Active Sites', value: '12' },
                ].map(stat => (
                  <div key={stat.label} className="p-2.5 rounded-lg border bg-muted/20 text-center">
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
