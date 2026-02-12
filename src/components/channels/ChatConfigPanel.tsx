import { useState, useEffect } from 'react';
import {
  MessageSquare,
  Palette,
  Type,
  Bot,
  Move,
  Save,
  Loader2,
  Paperclip,
  Smile,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChatConfig } from '@/types/channels';
import { FONT_FAMILIES } from '@/types/channels';
import { cn } from '@/lib/utils';

interface ChatConfigPanelProps {
  config: ChatConfig;
  onUpdate: (updates: Partial<ChatConfig>) => Promise<void>;
  isSaving: boolean;
  onSave: () => void;
}

// Component for debounced text input to prevent lag
function DebouncedInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localValue, value, onChange]);

  return (
    <Input
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'Square', preview: 'rounded-none' },
  { value: 'small', label: 'Small', preview: 'rounded-md' },
  { value: 'medium', label: 'Medium', preview: 'rounded-lg' },
  { value: 'large', label: 'Large', preview: 'rounded-xl' },
];

const POSITION_OPTIONS = [
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'top-left', label: 'Top Left' },
];

const BOT_ICONS = ['🤖', '💬', '🎯', '✨', '🌟', '💡', '🔮', '🎨'];

export function ChatConfigPanel({
  config,
  onUpdate,
  isSaving,
  onSave,
}: ChatConfigPanelProps) {
  const updateTheme = (updates: Partial<ChatConfig['theme']>) => {
    onUpdate({ theme: { ...config.theme, ...updates } });
  };

  const updateTypography = (updates: Partial<ChatConfig['typography']>) => {
    onUpdate({ typography: { ...config.typography, ...updates } });
  };

  const getBorderRadiusClass = (radius: string) => {
    switch (radius) {
      case 'none': return 'rounded-none';
      case 'small': return 'rounded-md';
      case 'medium': return 'rounded-lg';
      case 'large': return 'rounded-xl';
      default: return 'rounded-lg';
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Configuration */}
      <div className="space-y-6">
        {/* Theme & Colors */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Theme & Colors
            </CardTitle>
            <CardDescription>Customize the chat widget appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <label
                    className="w-10 h-10 rounded-lg border cursor-pointer relative overflow-hidden shrink-0"
                    style={{ backgroundColor: config.theme.primaryColor }}
                  >
                    <input
                      type="color"
                      value={config.theme.primaryColor}
                      onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <DebouncedInput
                    value={config.theme.primaryColor}
                    onChange={(value) => updateTheme({ primaryColor: value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Header Color</Label>
                <div className="flex gap-2">
                  <label
                    className="w-10 h-10 rounded-lg border cursor-pointer relative overflow-hidden shrink-0"
                    style={{ backgroundColor: config.theme.headerColor }}
                  >
                    <input
                      type="color"
                      value={config.theme.headerColor}
                      onChange={(e) => updateTheme({ headerColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <DebouncedInput
                    value={config.theme.headerColor}
                    onChange={(value) => updateTheme({ headerColor: value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Background</Label>
                <div className="flex gap-2">
                  <label
                    className="w-10 h-10 rounded-lg border cursor-pointer relative overflow-hidden shrink-0"
                    style={{ backgroundColor: config.theme.backgroundColor }}
                  >
                    <input
                      type="color"
                      value={config.theme.backgroundColor}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <DebouncedInput
                    value={config.theme.backgroundColor}
                    onChange={(value) => updateTheme({ backgroundColor: value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <label
                    className="w-10 h-10 rounded-lg border cursor-pointer relative overflow-hidden shrink-0"
                    style={{ backgroundColor: config.theme.textColor }}
                  >
                    <input
                      type="color"
                      value={config.theme.textColor}
                      onChange={(e) => updateTheme({ textColor: e.target.value })}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                  </label>
                  <DebouncedInput
                    value={config.theme.textColor}
                    onChange={(value) => updateTheme({ textColor: value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Border Radius</Label>
              <div className="flex gap-2">
                {BORDER_RADIUS_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={config.theme.borderRadius === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTheme({ borderRadius: option.value as ChatConfig['theme']['borderRadius'] })}
                    className={cn('flex-1', option.preview)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Typography
            </CardTitle>
            <CardDescription>Configure fonts and text sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={config.typography.fontFamily}
                onValueChange={(value: ChatConfig['typography']['fontFamily']) => updateTypography({ fontFamily: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FONT_FAMILIES).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Body Text Size</Label>
                <Select
                  value={config.typography.fontSize}
                  onValueChange={(value: ChatConfig['typography']['fontSize']) => updateTypography({ fontSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (12px)</SelectItem>
                    <SelectItem value="medium">Medium (14px)</SelectItem>
                    <SelectItem value="large">Large (16px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Header Size</Label>
                <Select
                  value={config.typography.headerSize}
                  onValueChange={(value: ChatConfig['typography']['headerSize']) => updateTypography({ headerSize: value })}
                >
                  <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Bot Settings */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Bot Settings
            </CardTitle>
            <CardDescription>Customize the bot identity and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bot Icon</Label>
              <div className="flex gap-2 flex-wrap">
                {BOT_ICONS.map((icon) => (
                  <Button
                    key={icon}
                    variant={config.botIcon === icon ? 'default' : 'outline'}
                    size="icon"
                    className="text-xl"
                    onClick={() => onUpdate({ botIcon: icon })}
                  >
                    {icon}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bot Name</Label>
              <DebouncedInput
                value={config.botName}
                onChange={(value) => onUpdate({ botName: value })}
                placeholder="AI Assistant"
              />
            </div>

            <div className="space-y-2">
              <Label>Initial Message</Label>
              <DebouncedInput
                value={config.initialMessage}
                onChange={(value) => onUpdate({ initialMessage: value })}
                placeholder="Hello! How can I help you?"
              />
            </div>

            <div className="space-y-2">
              <Label>Input Placeholder</Label>
              <DebouncedInput
                value={config.inputPlaceholder}
                onChange={(value) => onUpdate({ inputPlaceholder: value })}
                placeholder="Type your message..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Position & Features */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Move className="w-5 h-5 text-primary" />
              Position & Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Widget Position</Label>
              <Select
                value={config.position}
                onValueChange={(value: ChatConfig['position']) => onUpdate({ position: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {POSITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Show Timestamps</span>
                </div>
                <Switch
                  checked={config.showTimestamps}
                  onCheckedChange={(checked) => onUpdate({ showTimestamps: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Typing Indicator</span>
                </div>
                <Switch
                  checked={config.showTypingIndicator}
                  onCheckedChange={(checked) => onUpdate({ showTypingIndicator: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">File Uploads</span>
                </div>
                <Switch
                  checked={config.enableFileUpload}
                  onCheckedChange={(checked) => onUpdate({ enableFileUpload: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Emoji Picker</span>
                </div>
                <Switch
                  checked={config.enableEmoji}
                  onCheckedChange={(checked) => onUpdate({ enableEmoji: checked })}
                />
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
            Save Chat Configuration
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-6">
        <Card className="gradient-card overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="text-lg">Live Preview</CardTitle>
            <CardDescription>See how your chat widget will look</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="relative bg-muted/30 rounded-xl p-4 min-h-[500px]">
              {/* Fake page content */}
              <div className="space-y-3 opacity-30">
                <div className="h-8 w-3/4 bg-muted rounded" />
                <div className="h-4 w-full bg-muted rounded" />
                <div className="h-4 w-5/6 bg-muted rounded" />
                <div className="h-4 w-4/5 bg-muted rounded" />
                <div className="h-32 w-full bg-muted rounded-lg mt-4" />
              </div>

              {/* Chat Widget Preview */}
              <div
                className={cn(
                  'absolute w-80 shadow-2xl overflow-hidden',
                  getBorderRadiusClass(config.theme.borderRadius),
                  config.position === 'bottom-right' && 'bottom-4 right-4',
                  config.position === 'bottom-left' && 'bottom-4 left-4',
                  config.position === 'top-right' && 'top-4 right-4',
                  config.position === 'top-left' && 'top-4 left-4'
                )}
                style={{ backgroundColor: config.theme.backgroundColor }}
              >
                {/* Header */}
                <div
                  className="p-4 flex items-center gap-3"
                  style={{ backgroundColor: config.theme.headerColor }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
                    {config.botIcon}
                  </div>
                  <div className="text-white">
                    <p
                      className={cn(
                        'font-semibold',
                        config.typography.headerSize === 'small' && 'text-sm',
                        config.typography.headerSize === 'medium' && 'text-base',
                        config.typography.headerSize === 'large' && 'text-lg'
                      )}
                    >
                      {config.botName}
                    </p>
                    <p className="text-xs opacity-80">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-4 space-y-3 min-h-[200px]" style={{ color: config.theme.textColor }}>
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: config.theme.primaryColor + '20' }}>
                      {config.botIcon}
                    </div>
                    <div
                      className={cn(
                        'p-3 max-w-[80%]',
                        getBorderRadiusClass(config.theme.borderRadius)
                      )}
                      style={{ backgroundColor: config.theme.primaryColor + '15' }}
                    >
                      <p
                        className={cn(
                          config.typography.fontSize === 'small' && 'text-xs',
                          config.typography.fontSize === 'medium' && 'text-sm',
                          config.typography.fontSize === 'large' && 'text-base'
                        )}
                      >
                        {config.initialMessage}
                      </p>
                      {config.showTimestamps && (
                        <p className="text-[10px] opacity-50 mt-1">Just now</p>
                      )}
                    </div>
                  </div>

                  {config.showTypingIndicator && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ backgroundColor: config.theme.primaryColor + '20' }}>
                        {config.botIcon}
                      </div>
                      <div className="flex items-center gap-1 p-3">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-75" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse delay-150" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t" style={{ borderColor: config.theme.textColor + '10' }}>
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex-1 p-2 px-3 bg-muted/50 text-muted-foreground',
                        getBorderRadiusClass(config.theme.borderRadius)
                      )}
                    >
                      <span
                        className={cn(
                          'opacity-50',
                          config.typography.fontSize === 'small' && 'text-xs',
                          config.typography.fontSize === 'medium' && 'text-sm',
                          config.typography.fontSize === 'large' && 'text-base'
                        )}
                      >
                        {config.inputPlaceholder}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {config.enableFileUpload && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      {config.enableEmoji && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted cursor-pointer">
                          <Smile className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
