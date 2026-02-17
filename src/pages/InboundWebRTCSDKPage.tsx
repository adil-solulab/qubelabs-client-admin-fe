import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Phone,
  PhoneCall,
  Copy,
  Check,
  Code,
  Settings,
  Palette,
  Eye,
  Shield,
  Zap,
  Globe,
  ChevronLeft,
  Download,
  BookOpen,
  Volume2,
  Mic,
  MicOff,
  PhoneOff,
  Wifi,
  WifiOff,
  Clock,
  MessageSquare,
  X,
  Play,
  Square,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
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

export default function InboundWebRTCSDKPage() {
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

  const npmCode = `npm install @conx/webrtc-sdk`;

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
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <PhoneCall className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Inbound WebRTC SDK</h1>
              <p className="text-sm text-muted-foreground">
                Create an embeddable "Call Us" button for browser-based voice calls to your AI agents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <BookOpen className="w-4 h-4 mr-1.5" />
              Docs
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              Download SDK
            </Button>
            <Badge variant="outline">v1.0.0</Badge>
          </div>
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
                          <p className="text-xs text-muted-foreground">Use the tabs above to customize appearance, select an agent, and set behavior</p>
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
                        <CardTitle className="text-base">React / Next.js Integration</CardTitle>
                        <CardDescription className="text-xs">Use the React component for seamless integration</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-[10px]">React</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center justify-between">
                          <code className="text-xs">{npmCode}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(npmCode, 'npm')}
                          >
                            {copiedId === 'npm' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <pre className="p-4 rounded-xl bg-muted/50 border text-[11px] overflow-x-auto max-h-[200px] leading-relaxed">
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
                    <CardTitle className="text-base">SDK Events & Callbacks</CardTitle>
                    <CardDescription className="text-xs">Available JavaScript events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { event: 'onCallStart', desc: 'Fired when the call is connected', params: '()' },
                        { event: 'onCallEnd', desc: 'Fired when the call ends', params: '(summary: CallSummary)' },
                        { event: 'onError', desc: 'Fired on connection or audio error', params: '(error: Error)' },
                        { event: 'onMuteChange', desc: 'Fired when mute state changes', params: '(muted: boolean)' },
                        { event: 'onNetworkChange', desc: 'Fired when network quality changes', params: '(quality: NetworkQuality)' },
                        { event: 'onConsentGiven', desc: 'Fired when user gives consent', params: '()' },
                      ].map(item => (
                        <div key={item.event} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/20">
                          <code className="text-xs font-mono text-primary flex-shrink-0">{item.event}</code>
                          <span className="text-xs text-muted-foreground flex-1">{item.desc}</span>
                          <code className="text-[10px] font-mono text-muted-foreground">{item.params}</code>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px]">Interactive</Badge>
                </div>
                <CardDescription className="text-xs">See how the widget will look on your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-[3/4] rounded-xl border-2 border-dashed border-muted-foreground/20 bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-8 bg-muted/50 border-b flex items-center px-3 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="flex-1 mx-4">
                      <div className="h-4 rounded bg-muted flex items-center justify-center">
                        <span className="text-[8px] text-muted-foreground">yourwebsite.com</span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-12 inset-x-4 space-y-2">
                    <div className="h-3 bg-muted/40 rounded w-3/4" />
                    <div className="h-3 bg-muted/40 rounded w-full" />
                    <div className="h-3 bg-muted/40 rounded w-5/6" />
                    <div className="h-6 mt-3" />
                    <div className="h-3 bg-muted/40 rounded w-2/3" />
                    <div className="h-3 bg-muted/40 rounded w-4/5" />
                  </div>

                  {previewState === 'idle' && (
                    <div className={cn("absolute", positionClasses[config.buttonPosition])}>
                      <button
                        onClick={startPreview}
                        className={cn(
                          "flex items-center justify-center font-medium shadow-lg transition-all hover:scale-105 relative",
                          buttonSizeClasses[config.buttonSize],
                          config.buttonStyle === 'pill' ? 'rounded-full' : config.buttonStyle === 'circle' ? 'rounded-full !px-0 w-10 h-10' : 'rounded-xl'
                        )}
                        style={{
                          backgroundColor: config.buttonColor,
                          color: config.buttonTextColor,
                        }}
                      >
                        {config.showPulse && (
                          <span
                            className="absolute inset-0 rounded-full animate-ping opacity-20"
                            style={{ backgroundColor: config.buttonColor }}
                          />
                        )}
                        {config.showIcon && <Phone className="w-3.5 h-3.5" />}
                        {config.buttonStyle !== 'circle' && <span className="text-xs">{config.buttonText}</span>}
                      </button>
                    </div>
                  )}

                  {(previewState === 'connecting' || previewState === 'active' || previewState === 'ended') && (
                    <div className="absolute bottom-3 right-3 left-3">
                      <div
                        className={cn(
                          "rounded-2xl shadow-2xl border overflow-hidden",
                          config.theme === 'dark' ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
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
                    <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setPreviewState('idle'); setPreviewMuted(false); setPreviewDuration(0); }}>
                      <Square className="w-3 h-3 mr-1" />
                      Reset Preview
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Integration Stats</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">3</p>
                      <p className="text-[10px] text-muted-foreground">Active Widgets</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">1.2K</p>
                      <p className="text-[10px] text-muted-foreground">Calls This Month</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-foreground">4:32</p>
                      <p className="text-[10px] text-muted-foreground">Avg Duration</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-bold text-green-600">98.5%</p>
                      <p className="text-[10px] text-muted-foreground">Connection Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
