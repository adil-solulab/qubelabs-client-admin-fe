import { useState } from 'react';
import {
  ArrowLeft,
  Palette,
  Bot,
  Settings,
  Navigation,
  Code,
  Check,
  Loader2,
  Copy,
  Sun,
  Moon,
  MessageSquare,
  Home,
  Menu,
  Plus,
  Trash2,
  Volume2,
  Mic,
  FileText,
  Bell,
  Languages,
  Type,
  Maximize2,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ChatWidgetConfig } from '@/types/channels';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface ChatWidgetConfigPanelProps {
  config: ChatWidgetConfig;
  isSaving: boolean;
  onUpdate: (updates: Partial<ChatWidgetConfig>) => Promise<void>;
  onBack: () => void;
}

export function ChatWidgetConfigPanel({
  config,
  isSaving,
  onUpdate,
  onBack,
}: ChatWidgetConfigPanelProps) {
  const [activeTab, setActiveTab] = useState('appearance');

  const handleAppearanceChange = (key: string, value: string | boolean) => {
    onUpdate({ appearance: { ...config.appearance, [key]: value } as ChatWidgetConfig['appearance'] });
  };

  const handleBotIconChange = (key: string, value: string) => {
    onUpdate({ botIcon: { ...config.botIcon, [key]: value } as ChatWidgetConfig['botIcon'] });
  };

  const handleSettingChange = (key: string, value: boolean | string) => {
    onUpdate({ settings: { ...config.settings, [key]: value } as ChatWidgetConfig['settings'] });
  };

  const handleNavigationChange = (key: string, value: boolean) => {
    onUpdate({ navigation: { ...config.navigation, [key]: value } as ChatWidgetConfig['navigation'] });
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(config.deployScript);
    notify.success('Copied', 'Deploy script copied to clipboard');
  };

  const addMenuItem = () => {
    const items = [...config.navigation.menuItems, { label: 'New Item', action: '' }];
    onUpdate({ navigation: { ...config.navigation, menuItems: items } });
  };

  const removeMenuItem = (index: number) => {
    const items = config.navigation.menuItems.filter((_, i) => i !== index);
    onUpdate({ navigation: { ...config.navigation, menuItems: items } });
  };

  const updateMenuItem = (index: number, field: string, value: string) => {
    const items = config.navigation.menuItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onUpdate({ navigation: { ...config.navigation, menuItems: items } });
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Chat Widget</h2>
          <p className="text-sm text-muted-foreground">
            Customize and deploy your embeddable web chat widget
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="appearance" className="gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="bot-icon" className="gap-1.5">
            <Bot className="w-3.5 h-3.5" />
            Bot Icon
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="navigation" className="gap-1.5">
            <Navigation className="w-3.5 h-3.5" />
            Navigation
          </TabsTrigger>
          <TabsTrigger value="deploy" className="gap-1.5">
            <Code className="w-3.5 h-3.5" />
            Deploy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">Widget Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Bot Display Name</Label>
                  <Input
                    value={config.appearance.botDisplayName}
                    onChange={(e) => handleAppearanceChange('botDisplayName', e.target.value)}
                    placeholder="AI Assistant"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Bot Description</Label>
                  <Input
                    value={config.appearance.botDescription}
                    onChange={(e) => handleAppearanceChange('botDescription', e.target.value)}
                    placeholder="How can I help you?"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Colors & Theme</Label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAppearanceChange('theme', 'light')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                        config.appearance.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <Sun className="w-4 h-4" />
                      <span className="text-sm">Light</span>
                    </button>
                    <button
                      onClick={() => handleAppearanceChange('theme', 'dark')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all',
                        config.appearance.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <Moon className="w-4 h-4" />
                      <span className="text-sm">Dark</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Brand Color Mode</Label>
                  <div className="flex gap-3">
                    {['solid', 'gradient'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => handleAppearanceChange('colorMode', mode)}
                        className={cn(
                          'px-4 py-2 rounded-lg border-2 text-sm capitalize transition-all',
                          config.appearance.colorMode === mode ? 'border-primary bg-primary/5' : 'border-border'
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Brand Color 1</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={config.appearance.brandColor1}
                        onChange={(e) => handleAppearanceChange('brandColor1', e.target.value)}
                        className="w-10 h-10 rounded-lg border cursor-pointer"
                      />
                      <Input
                        value={config.appearance.brandColor1}
                        onChange={(e) => handleAppearanceChange('brandColor1', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  {config.appearance.colorMode === 'gradient' && (
                    <div className="space-y-2">
                      <Label>Brand Color 2</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.appearance.brandColor2}
                          onChange={(e) => handleAppearanceChange('brandColor2', e.target.value)}
                          className="w-10 h-10 rounded-lg border cursor-pointer"
                        />
                        <Input
                          value={config.appearance.brandColor2}
                          onChange={(e) => handleAppearanceChange('brandColor2', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Font Style</Label>
                    <Select value={config.appearance.fontStyle} onValueChange={(v) => handleAppearanceChange('fontStyle', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default (System)</SelectItem>
                        <SelectItem value="inter">Inter</SelectItem>
                        <SelectItem value="roboto">Roboto</SelectItem>
                        <SelectItem value="opensans">Open Sans</SelectItem>
                        <SelectItem value="custom">Custom Font</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Font Size</Label>
                    <Select value={config.appearance.fontSize} onValueChange={(v) => handleAppearanceChange('fontSize', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {config.appearance.fontStyle === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="space-y-2">
                      <Label className="text-xs">Font Family Name</Label>
                      <Input
                        value={config.appearance.customFontFamily || ''}
                        onChange={(e) => handleAppearanceChange('customFontFamily', e.target.value)}
                        placeholder="e.g., Poppins"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Font URL</Label>
                      <Input
                        value={config.appearance.customFontUrl || ''}
                        onChange={(e) => handleAppearanceChange('customFontUrl', e.target.value)}
                        placeholder="https://fonts.googleapis.com/..."
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Widget Size</Label>
                    <Select value={config.appearance.widgetSize} onValueChange={(v) => handleAppearanceChange('widgetSize', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={config.appearance.position} onValueChange={(v) => handleAppearanceChange('position', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5" />
                      Desktop Initial State
                    </Label>
                    <Select value={config.appearance.initialStateDesktop} onValueChange={(v) => handleAppearanceChange('initialStateDesktop', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="half-opened">Half Opened</SelectItem>
                        <SelectItem value="minimized">Minimized</SelectItem>
                        <SelectItem value="conversational-layover">Conversational Layover</SelectItem>
                        <SelectItem value="chat-bubble">Chat Bubble</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      Mobile Initial State
                    </Label>
                    <Select value={config.appearance.initialStateMobile} onValueChange={(v) => handleAppearanceChange('initialStateMobile', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimized">Minimized</SelectItem>
                        <SelectItem value="chat-bubble">Chat Bubble</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card h-fit">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-muted/30 rounded-xl p-4 min-h-[400px] flex flex-col">
                  <div
                    className="rounded-t-xl p-3 flex items-center gap-3"
                    style={{
                      background: config.appearance.colorMode === 'gradient'
                        ? `linear-gradient(135deg, ${config.appearance.brandColor1}, ${config.appearance.brandColor2})`
                        : config.appearance.brandColor1,
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{config.appearance.botDisplayName}</p>
                      <p className="text-white/70 text-xs">{config.appearance.botDescription}</p>
                    </div>
                  </div>

                  <div className={cn(
                    'flex-1 rounded-b-xl p-3 space-y-3',
                    config.appearance.theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                  )}>
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                      <div className={cn(
                        'px-3 py-2 rounded-lg text-xs max-w-[200px]',
                        config.appearance.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'
                      )}>
                        Hello! How can I help you today?
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <div className="px-3 py-2 rounded-lg text-xs text-white max-w-[200px]"
                        style={{ backgroundColor: config.appearance.brandColor1 }}>
                        I have a question about pricing
                      </div>
                    </div>
                  </div>

                  <div className={cn(
                    'absolute bottom-8 px-3 w-full',
                    config.appearance.position === 'bottom-right' ? 'right-0' : 'left-0'
                  )}>
                    <div className={cn(
                      'rounded-full px-3 py-2 text-xs flex items-center gap-2 border',
                      config.appearance.theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-400'
                    )}>
                      Type your message...
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bot-icon">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Bot Icon Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label>Icon Shape (Desktop)</Label>
                <div className="flex gap-3">
                  {['circle', 'square', 'bar'].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => handleBotIconChange('shape', shape)}
                      className={cn(
                        'flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all capitalize',
                        config.botIcon.shape === shape ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 bg-primary/20 flex items-center justify-center',
                        shape === 'circle' && 'rounded-full',
                        shape === 'square' && 'rounded-lg',
                        shape === 'bar' && 'rounded-full w-20'
                      )}>
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs">{shape}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Icon Shape (Mobile)</Label>
                <div className="flex gap-3">
                  {['circle', 'square'].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => handleBotIconChange('mobileShape', shape)}
                      className={cn(
                        'flex flex-col items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all capitalize',
                        config.botIcon.mobileShape === shape ? 'border-primary bg-primary/5' : 'border-border'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 bg-primary/20 flex items-center justify-center',
                        shape === 'circle' ? 'rounded-full' : 'rounded-lg'
                      )}>
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-xs">{shape}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Icon Source</Label>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleBotIconChange('source', 'avatar')}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 text-sm transition-all',
                      config.botIcon.source === 'avatar' ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    Same as Avatar
                  </button>
                  <button
                    onClick={() => handleBotIconChange('source', 'custom')}
                    className={cn(
                      'px-4 py-2 rounded-lg border-2 text-sm transition-all',
                      config.botIcon.source === 'custom' ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    Upload Custom Icon
                  </button>
                </div>
              </div>

              {config.botIcon.source === 'custom' && (
                <div className="space-y-2">
                  <Label>Custom Icon URL</Label>
                  <Input
                    value={config.botIcon.customIconUrl || ''}
                    onChange={(e) => handleBotIconChange('customIconUrl', e.target.value)}
                    placeholder="https://example.com/icon.png"
                  />
                  <p className="text-xs text-muted-foreground">Recommended: 150 x 150 pixels</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Animation</Label>
                <Select value={config.botIcon.animation} onValueChange={(v) => handleBotIconChange('animation', v)}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="bounce">Bounce</SelectItem>
                    <SelectItem value="pulse">Pulse</SelectItem>
                    <SelectItem value="shake">Shake</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'autoComplete', label: 'Auto-complete', desc: 'Auto-predict words as user types', icon: Type },
                  { key: 'messageFeedback', label: 'Message Feedback', desc: 'Capture feedback for every bot message', icon: MessageSquare },
                  { key: 'attachment', label: 'Attachments', desc: 'Allow users to upload files', icon: FileText },
                  { key: 'slowMessages', label: 'Slow Messages', desc: 'Add typing indicator delay for natural feel', icon: MessageSquare },
                  { key: 'multilineInput', label: 'Multiline Input', desc: 'Allow multiple lines in text input', icon: Type },
                  { key: 'languageSwitcher', label: 'Language Switcher', desc: 'Allow users to change language', icon: Languages },
                  { key: 'rtlSupport', label: 'RTL Support', desc: 'Right-to-left text alignment', icon: Type },
                ].map((setting) => {
                  const SettingIcon = setting.icon;
                  return (
                    <div key={setting.key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <SettingIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{setting.label}</p>
                          <p className="text-xs text-muted-foreground">{setting.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.settings[setting.key as keyof typeof config.settings] as boolean}
                        onCheckedChange={(v) => handleSettingChange(setting.key, v)}
                      />
                    </div>
                  );
                })}

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Scroll Behavior</p>
                      <p className="text-xs text-muted-foreground">How widget scrolls on new messages</p>
                    </div>
                  </div>
                  <Select value={config.settings.scrollBehavior} onValueChange={(v) => handleSettingChange('scrollBehavior', v)}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">Chat History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'chatHistory', label: 'Show Conversation History', desc: 'Retain chat history after page refresh' },
                  { key: 'freshSessionPerTab', label: 'Fresh Session Per Tab', desc: 'Start fresh conversation in each new tab' },
                  { key: 'downloadTranscript', label: 'Download Transcript', desc: 'Allow users to download chat in text format' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.desc}</p>
                    </div>
                    <Switch
                      checked={config.settings[setting.key as keyof typeof config.settings] as boolean}
                      onCheckedChange={(v) => handleSettingChange(setting.key, v)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'unreadBadge', label: 'Unread Message Badge', desc: 'Show unread count on bot icon', icon: Bell },
                  { key: 'browserTabNotification', label: 'Browser Tab Notification', desc: 'Show favicon alert for unread messages', icon: Bell },
                  { key: 'messageSound', label: 'Message Sound', desc: 'Play sound for new messages', icon: Volume2 },
                ].map((setting) => {
                  const SettingIcon = setting.icon;
                  return (
                    <div key={setting.key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <SettingIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{setting.label}</p>
                          <p className="text-xs text-muted-foreground">{setting.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.settings[setting.key as keyof typeof config.settings] as boolean}
                        onCheckedChange={(v) => handleSettingChange(setting.key, v)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base">Speech & Dictation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'speechToText', label: 'Speech to Text', desc: 'Allow voice input from users', icon: Mic },
                  { key: 'autoSendSpeech', label: 'Auto Send', desc: 'Automatically send transcribed speech', icon: Mic },
                  { key: 'textToSpeech', label: 'Text to Speech', desc: 'Bot responds with voice output', icon: Volume2 },
                ].map((setting) => {
                  const SettingIcon = setting.icon;
                  return (
                    <div key={setting.key} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <SettingIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{setting.label}</p>
                          <p className="text-xs text-muted-foreground">{setting.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={config.settings[setting.key as keyof typeof config.settings] as boolean}
                        onCheckedChange={(v) => handleSettingChange(setting.key, v)}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="navigation">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Navigation Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Home Button</p>
                    <p className="text-xs text-muted-foreground">Allow users to refresh the conversation</p>
                  </div>
                </div>
                <Switch
                  checked={config.navigation.homeEnabled}
                  onCheckedChange={(v) => handleNavigationChange('homeEnabled', v)}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Menu className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Menu</p>
                      <p className="text-xs text-muted-foreground">Add navigation menu to the widget (max 10 items)</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.navigation.menuEnabled}
                    onCheckedChange={(v) => handleNavigationChange('menuEnabled', v)}
                  />
                </div>

                {config.navigation.menuEnabled && (
                  <div className="space-y-3 pl-7">
                    {config.navigation.menuItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={item.label}
                          onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                          placeholder="Menu label"
                          className="flex-1"
                        />
                        <Input
                          value={item.action}
                          onChange={(e) => updateMenuItem(index, 'action', e.target.value)}
                          placeholder="Action / URL"
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeMenuItem(index)} className="flex-shrink-0">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {config.navigation.menuItems.length < 10 && (
                      <Button variant="outline" size="sm" onClick={addMenuItem}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Menu Item
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy">
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="text-base">Deploy Chat Widget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Copy the script below and paste it into the HTML of your website, just before the closing {`</body>`} tag.
              </p>

              <div className="relative">
                <pre className="p-4 rounded-xl bg-muted/50 border text-xs font-mono overflow-x-auto max-h-[300px]">
                  <code>{config.deployScript}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-3 right-3"
                  onClick={handleCopyScript}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">Integration Guide</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Place the script before the closing body tag on every page where you want the widget</li>
                  <li>The widget will automatically initialize with your saved configuration</li>
                  <li>For SPAs (React, Angular), use the script in your index.html</li>
                  <li>Custom fonts require whitelisting in your CSP headers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
