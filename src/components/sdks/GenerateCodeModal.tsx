import { useState } from 'react';
import { Copy, Check, Code, Settings } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmbedWidget } from '@/types/sdks';

interface GenerateCodeModalProps {
  widget: EmbedWidget | null;
  publishableKey: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCopy: (code: string) => void;
}

export function GenerateCodeModal({
  widget,
  publishableKey,
  open,
  onOpenChange,
  onCopy,
}: GenerateCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableScreenShare, setEnableScreenShare] = useState(true);

  if (!widget) return null;

  const generateCode = () => {
    if (widget.type === 'chat') {
      return `<!-- AI Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AIChat']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aichat','https://cdn.example.com/chat.js'));
  aichat('init', { 
    projectKey: '${publishableKey}',
    theme: '${theme}',
    position: '${position}'
  });
</script>`;
    } else {
      return `<!-- WebRTC Calling Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AICall']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aicall','https://cdn.example.com/call.js'));
  aicall('init', { 
    projectKey: '${publishableKey}',
    enableVideo: ${enableVideo},
    enableScreenShare: ${enableScreenShare}
  });
</script>`;
    }
  };

  const code = generateCode();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy(code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-primary" />
            Generate {widget.name} Code
          </DialogTitle>
          <DialogDescription>
            Customize your embed code and copy it to your website.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Customization Options */}
          <div className="p-4 rounded-xl border bg-muted/30 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">Customization</span>
            </div>

            {widget.type === 'chat' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={(v) => setTheme(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={position} onValueChange={(v) => setPosition(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {widget.type === 'webrtc' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Video</Label>
                    <p className="text-xs text-muted-foreground">Allow video calls</p>
                  </div>
                  <Switch checked={enableVideo} onCheckedChange={setEnableVideo} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Screen Share</Label>
                    <p className="text-xs text-muted-foreground">Allow screen sharing</p>
                  </div>
                  <Switch checked={enableScreenShare} onCheckedChange={setEnableScreenShare} />
                </div>
              </div>
            )}
          </div>

          {/* Generated Code */}
          <div className="space-y-2">
            <Label>Generated Code</Label>
            <div className="relative">
              <pre className="p-4 rounded-xl bg-muted/50 border text-sm overflow-x-auto max-h-[200px]">
                <code className="text-xs">{code}</code>
              </pre>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-1 text-success" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
