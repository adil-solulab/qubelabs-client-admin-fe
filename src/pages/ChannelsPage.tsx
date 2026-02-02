import { useState } from 'react';
import { Phone, MessageSquare, Mail, Power } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useChannelsData } from '@/hooks/useChannelsData';
import { notify } from '@/hooks/useNotification';
import { VoiceConfigPanel } from '@/components/channels/VoiceConfigPanel';
import { ChatConfigPanel } from '@/components/channels/ChatConfigPanel';
import { EmailConfigPanel } from '@/components/channels/EmailConfigPanel';
import { cn } from '@/lib/utils';

export default function ChannelsPage() {
  const {
    voiceConfig,
    chatConfig,
    emailConfig,
    isSaving,
    updateVoiceConfig,
    updateChatConfig,
    updateEmailConfig,
    toggleChannel,
    addDTMFOption,
    removeDTMFOption,
    addRoutingRule,
    updateRoutingRule,
    removeRoutingRule,
  } = useChannelsData();

  const [activeTab, setActiveTab] = useState('voice');

  const handleToggleChannel = async (channel: 'voice' | 'chat' | 'email', enabled: boolean) => {
    await toggleChannel(channel, enabled);
    const channelName = channel.charAt(0).toUpperCase() + channel.slice(1);
    if (enabled) {
      notify.success(`${channelName} channel enabled`);
    } else {
      notify.info(`${channelName} channel disabled`);
    }
  };

  const handleSaveVoice = async () => {
    try {
      await updateVoiceConfig({});
      notify.saved('Voice configuration');
    } catch {
      notify.error('Failed to save', 'Could not save voice settings.');
    }
  };

  const handleSaveChat = async () => {
    try {
      await updateChatConfig({});
      notify.saved('Chat configuration');
    } catch {
      notify.error('Failed to save', 'Could not save chat settings.');
    }
  };

  const handleSaveEmail = async () => {
    try {
      await updateEmailConfig({});
      notify.saved('Email configuration');
    } catch {
      notify.error('Failed to save', 'Could not save email settings.');
    }
  };

  const channels = [
    {
      id: 'voice',
      name: 'Voice',
      icon: Phone,
      enabled: voiceConfig.enabled,
      description: 'Inbound, outbound & WebRTC calls',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      id: 'chat',
      name: 'Chat',
      icon: MessageSquare,
      enabled: chatConfig.enabled,
      description: 'Web chat widget',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      id: 'email',
      name: 'Email',
      icon: Mail,
      enabled: emailConfig.enabled,
      description: 'AI replies & routing',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Channel Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Configure voice, chat, and email channels for your AI agents
          </p>
        </div>

        {/* Channel Status Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <Card
              key={channel.id}
              className={cn(
                'gradient-card cursor-pointer transition-all hover:shadow-glow',
                activeTab === channel.id && 'ring-2 ring-primary'
              )}
              onClick={() => setActiveTab(channel.id)}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', channel.bgColor)}>
                      <channel.icon className={cn('w-5 h-5', channel.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{channel.name}</p>
                        <Badge
                          variant={channel.enabled ? 'default' : 'secondary'}
                          className={cn(
                            'text-[10px]',
                            channel.enabled ? 'bg-success text-success-foreground' : ''
                          )}
                        >
                          {channel.enabled ? 'ON' : 'OFF'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{channel.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={channel.enabled}
                    onCheckedChange={(checked) => handleToggleChannel(channel.id as 'voice' | 'chat' | 'email', checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Configuration Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="voice" className="gap-2">
              <Phone className="w-4 h-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="mt-6">
            <VoiceConfigPanel
              config={voiceConfig}
              onUpdate={updateVoiceConfig}
              onAddDTMF={addDTMFOption}
              onRemoveDTMF={removeDTMFOption}
              isSaving={isSaving}
              onSave={handleSaveVoice}
            />
          </TabsContent>

          <TabsContent value="chat" className="mt-6">
            <ChatConfigPanel
              config={chatConfig}
              onUpdate={updateChatConfig}
              isSaving={isSaving}
              onSave={handleSaveChat}
            />
          </TabsContent>

          <TabsContent value="email" className="mt-6">
            <EmailConfigPanel
              config={emailConfig}
              onUpdate={updateEmailConfig}
              onAddRule={addRoutingRule}
              onUpdateRule={updateRoutingRule}
              onRemoveRule={removeRoutingRule}
              isSaving={isSaving}
              onSave={handleSaveEmail}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
