import { useState } from 'react';
import { Copy, Check, Code, ExternalLink, Settings, Loader2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { notify } from '@/hooks/useNotification';

interface WebRTCEmbedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WebRTCEmbedModal({ open, onOpenChange }: WebRTCEmbedModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState({
    widgetPosition: 'bottom-right',
    primaryColor: '#7C3AED',
    buttonText: 'Start Call',
    showBranding: true,
    autoConnect: false,
    enableVideo: false,
  });

  const widgetId = 'conx-widget-' + Math.random().toString(36).substr(2, 9);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    notify.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsGenerating(false);
    notify.success('Embed code generated', 'Your WebRTC widget is ready to use.');
  };

  const scriptCode = `<!-- ConX-AI WebRTC Widget -->
<script src="https://cdn.conx-ai.com/widget/v1/webrtc.js"></script>
<script>
  ConXWidget.init({
    widgetId: '${widgetId}',
    position: '${config.widgetPosition}',
    primaryColor: '${config.primaryColor}',
    buttonText: '${config.buttonText}',
    showBranding: ${config.showBranding},
    autoConnect: ${config.autoConnect},
    enableVideo: ${config.enableVideo},
    onCallStart: function(callId) {
      console.log('Call started:', callId);
    },
    onCallEnd: function(callId, duration) {
      console.log('Call ended:', callId, 'Duration:', duration);
    },
    onError: function(error) {
      console.error('Widget error:', error);
    }
  });
</script>`;

  const iframeCode = `<!-- ConX-AI WebRTC Iframe Embed -->
<iframe
  src="https://app.conx-ai.com/embed/webrtc/${widgetId}"
  width="400"
  height="600"
  frameborder="0"
  allow="microphone; camera"
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
></iframe>`;

  const reactCode = `// ConX-AI React Component
import { ConXWebRTC } from '@conx-ai/react';

function MyApp() {
  return (
    <ConXWebRTC
      widgetId="${widgetId}"
      position="${config.widgetPosition}"
      primaryColor="${config.primaryColor}"
      buttonText="${config.buttonText}"
      showBranding={${config.showBranding}}
      autoConnect={${config.autoConnect}}
      enableVideo={${config.enableVideo}}
      onCallStart={(callId) => console.log('Call started:', callId)}
      onCallEnd={(callId, duration) => console.log('Call ended:', callId)}
    />
  );
}`;

  const apiEndpoint = `POST https://api.conx-ai.com/v1/calls/webrtc

Headers:
  Authorization: Bearer YOUR_API_KEY
  Content-Type: application/json

Body:
{
  "widgetId": "${widgetId}",
  "customerId": "customer-123",
  "metadata": {
    "source": "website",
    "page": "/contact"
  }
}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            WebRTC Embed Code Generator
          </DialogTitle>
          <DialogDescription>
            Generate embeddable code for browser-based voice and video calling
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-muted/30">
            <div className="space-y-2">
              <Label>Widget Position</Label>
              <Select
                value={config.widgetPosition}
                onValueChange={(v) => setConfig(prev => ({ ...prev, widgetPosition: v }))}
              >
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-12 h-9 p-1 cursor-pointer"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => setConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={config.buttonText}
                onChange={(e) => setConfig(prev => ({ ...prev, buttonText: e.target.value }))}
              />
            </div>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label>Show Branding</Label>
                <Switch
                  checked={config.showBranding}
                  onCheckedChange={(c) => setConfig(prev => ({ ...prev, showBranding: c }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Auto Connect</Label>
                <Switch
                  checked={config.autoConnect}
                  onCheckedChange={(c) => setConfig(prev => ({ ...prev, autoConnect: c }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Video</Label>
                <Switch
                  checked={config.enableVideo}
                  onCheckedChange={(c) => setConfig(prev => ({ ...prev, enableVideo: c }))}
                />
              </div>
            </div>
          </div>

          {/* Generated Codes */}
          <Tabs defaultValue="script">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="script">Script Tag</TabsTrigger>
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>

            <TabsContent value="script" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label>JavaScript Embed</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(scriptCode, 'script')}
                >
                  {copied === 'script' ? (
                    <Check className="w-4 h-4 mr-1 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto font-mono">
                {scriptCode}
              </pre>
            </TabsContent>

            <TabsContent value="iframe" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label>iFrame Embed</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(iframeCode, 'iframe')}
                >
                  {copied === 'iframe' ? (
                    <Check className="w-4 h-4 mr-1 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto font-mono">
                {iframeCode}
              </pre>
            </TabsContent>

            <TabsContent value="react" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>React Component</Label>
                  <Badge variant="secondary" className="text-[10px]">npm install @conx-ai/react</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(reactCode, 'react')}
                >
                  {copied === 'react' ? (
                    <Check className="w-4 h-4 mr-1 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto font-mono">
                {reactCode}
              </pre>
            </TabsContent>

            <TabsContent value="api" className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <Label>API Endpoint</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(apiEndpoint, 'api')}
                >
                  {copied === 'api' ? (
                    <Check className="w-4 h-4 mr-1 text-success" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  Copy
                </Button>
              </div>
              <pre className="p-4 rounded-lg bg-muted text-sm overflow-x-auto font-mono">
                {apiEndpoint}
              </pre>
            </TabsContent>
          </Tabs>

          {/* Widget Preview */}
          <div className="p-4 rounded-xl border bg-muted/30">
            <Label className="mb-3 block">Preview</Label>
            <div className="h-32 rounded-lg bg-background border relative">
              <div 
                className={`absolute ${config.widgetPosition.includes('bottom') ? 'bottom-4' : 'top-4'} ${config.widgetPosition.includes('right') ? 'right-4' : 'left-4'}`}
              >
                <button
                  className="px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  📞 {config.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Generate & Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
