import { useState, useMemo } from 'react';
import {
  Search,
  Plug,
  Key,
  Webhook,
  Plus,
  Copy,
  Check,
  Trash2,
  MoreVertical,
  CheckCircle,
  MessageSquare,
  Phone,
  MessageCircle,
  Mail,
  CreditCard,
  Headphones,
  BarChart3,
  Wifi,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrationsData } from '@/hooks/useIntegrationsData';
import { usePermission } from '@/hooks/usePermission';
import { notify } from '@/hooks/useNotification';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { IntegrationDetailView } from '@/components/integrations/IntegrationDetailView';
import { ChatWidgetConfigPanel } from '@/components/channels/ChatWidgetConfigPanel';
import { CreateAPIKeyModal } from '@/components/integrations/CreateAPIKeyModal';
import { AddWebhookModal } from '@/components/integrations/AddWebhookModal';
import type { Integration, IntegrationCategory } from '@/types/integrations';
import { CATEGORY_CONFIG, INTEGRATION_ICONS } from '@/types/integrations';
import { cn } from '@/lib/utils';

type ViewMode = 'listing' | 'detail' | 'chat-widget';

const CATEGORY_LUCIDE_ICONS: Record<IntegrationCategory, React.ElementType> = {
  crm: BarChart3,
  voice: Phone,
  messaging: MessageCircle,
  email: Mail,
  chat_widget: MessageSquare,
  live_chat: Headphones,
  payment: CreditCard,
};

export default function IntegrationsPage() {
  const {
    integrations,
    apiKeys,
    webhooks,
    chatWidgetConfig,
    isSavingWidget,
    connectIntegration,
    disconnectIntegration,
    updateChatWidgetConfig,
    createAPIKey,
    revokeAPIKey,
    toggleAPIKey,
    createWebhook,
  } = useIntegrationsData();

  const { withPermission } = usePermission('integrations');

  const [viewMode, setViewMode] = useState<ViewMode>('listing');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | 'all'>('all');
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [addWebhookModalOpen, setAddWebhookModalOpen] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const categoryOrder: IntegrationCategory[] = ['crm', 'voice', 'messaging', 'email', 'chat_widget', 'live_chat', 'payment'];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    integrations.forEach(int => {
      const matchesSearch = !searchQuery ||
        int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (matchesSearch) {
        counts[int.category] = (counts[int.category] || 0) + 1;
      }
    });
    counts['chat_widget'] = 1;
    return counts;
  }, [integrations, searchQuery]);

  const connectedCount = useMemo(() => {
    return integrations.filter(i => i.status === 'connected').length;
  }, [integrations]);

  const categoryConnectedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    integrations.forEach(int => {
      if (int.status === 'connected') {
        counts[int.category] = (counts[int.category] || 0) + 1;
      }
    });
    return counts;
  }, [integrations]);

  const filteredIntegrations = useMemo(() => {
    return integrations.filter(int => {
      const matchesSearch = !searchQuery ||
        int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        int.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || activeCategory === 'chat_widget' || int.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [integrations, searchQuery, activeCategory]);

  const groupedIntegrations = useMemo(() => {
    const groups: Record<string, Integration[]> = {};
    filteredIntegrations.forEach(int => {
      if (!groups[int.category]) groups[int.category] = [];
      groups[int.category].push(int);
    });
    return groups;
  }, [filteredIntegrations]);

  const handleOpenDetail = (integration: Integration) => {
    setSelectedIntegration(integration);
    setViewMode('detail');
  };

  const handleBackToListing = () => {
    setViewMode('listing');
    setSelectedIntegration(null);
  };

  const handleConnect = async (integrationId: string, credentials?: Record<string, string>) => {
    const result = await connectIntegration(integrationId, credentials);
    const int = integrations.find(i => i.id === integrationId);
    if (result.success) {
      notify.connected(int?.name || 'Integration');
    } else {
      notify.error('Connection failed', result.error || 'Could not connect.');
    }
    return result;
  };

  const handleDisconnect = async (integrationId: string) => {
    const int = integrations.find(i => i.id === integrationId);
    const result = await disconnectIntegration(integrationId);
    if (result.success) {
      notify.disconnected(int?.name || 'Integration');
    }
    return result;
  };

  const handleCreateKey = async (name: string, permissions: string[]) => {
    const result = await createAPIKey(name, permissions);
    if (result.success) notify.created('API Key');
    else notify.error('Failed to create API key');
    return result;
  };

  const handleRevokeKey = async (keyId: string) => {
    withPermission('delete', async () => {
      await revokeAPIKey(keyId);
      notify.deleted('API Key');
    });
  };

  const handleToggleKey = async (keyId: string) => {
    withPermission('edit', async () => {
      await toggleAPIKey(keyId);
      const key = apiKeys.find(k => k.id === keyId);
      if (key?.isActive) notify.info('API Key disabled');
      else notify.success('API Key enabled');
    });
  };

  const handleCopyKey = async (keyId: string, key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
    notify.copied();
  };

  const handleAddWebhook = async (name: string, url: string, events: string[]) => {
    const result = await createWebhook(name, url, events);
    if (result.success) notify.created('Webhook Endpoint');
    else notify.error('Failed to create webhook');
    return result;
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (viewMode === 'detail' && selectedIntegration) {
    const liveIntegration = integrations.find(i => i.id === selectedIntegration.id) || selectedIntegration;
    return (
      <AppLayout>
        <IntegrationDetailView
          integration={liveIntegration}
          onBack={handleBackToListing}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      </AppLayout>
    );
  }

  if (viewMode === 'chat-widget') {
    return (
      <AppLayout>
        <ChatWidgetConfigPanel
          config={chatWidgetConfig}
          isSaving={isSavingWidget}
          onUpdate={updateChatWidgetConfig}
          onBack={handleBackToListing}
        />
      </AppLayout>
    );
  }

  const totalCount = integrations.length + 1;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations & Channels</h1>
            <p className="text-sm text-muted-foreground">
              Connect third-party services and communication channels to your AI platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1.5 text-xs gap-1.5">
              <Wifi className="w-3 h-3 text-success" />
              {connectedCount} connected
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="integrations" className="gap-1.5">
                <Plug className="w-3.5 h-3.5" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="gap-1.5">
                <Key className="w-3.5 h-3.5" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="gap-1.5">
                <Webhook className="w-3.5 h-3.5" />
                Webhooks
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="integrations" className="mt-0">
            <div className="grid lg:grid-cols-[240px,1fr] gap-6">
              <div className="space-y-1">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm"
                  />
                </div>

                <nav className="space-y-0.5">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors',
                      activeCategory === 'all'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Plug className="w-4 h-4" />
                      <span>All</span>
                    </div>
                    <span className={cn(
                      'text-xs font-medium',
                      activeCategory === 'all' ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {totalCount}
                    </span>
                  </button>

                  {categoryOrder.map(cat => {
                    const config = CATEGORY_CONFIG[cat];
                    const CatIcon = CATEGORY_LUCIDE_ICONS[cat];
                    const count = categoryCounts[cat] || 0;
                    const activeCount = categoryConnectedCounts[cat] || 0;
                    if (count === 0 && searchQuery) return null;

                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={cn(
                          'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors',
                          activeCategory === cat
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <CatIcon className="w-4 h-4" />
                          <span>{config.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {activeCount > 0 && activeCategory !== cat && (
                            <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          )}
                          <span className={cn(
                            'text-xs font-medium',
                            activeCategory === cat ? 'text-primary-foreground/80' : 'text-muted-foreground'
                          )}>
                            {count}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-8">
                {(activeCategory === 'all' || activeCategory === 'chat_widget') && (
                  <div>
                    {activeCategory === 'all' && (
                      <h2 className="text-base font-semibold text-foreground mb-4">Chat Widget (1)</h2>
                    )}
                    <Card
                      className="gradient-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group max-w-md border-purple-200 dark:border-purple-800/40"
                      onClick={() => setViewMode('chat-widget')}
                    >
                      <CardContent className="pt-5 pb-5">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl flex-shrink-0 border border-purple-200 dark:border-purple-800/40 group-hover:border-primary/30 transition-colors">
                            <MessageSquare className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                                Chat Widget
                              </h3>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-success/10 text-success border-success/30">
                                <Wifi className="w-2.5 h-2.5 mr-0.5" />
                                Active
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Embeddable web chat widget with full customization - appearance, bot icon, settings, navigation, and deploy script.
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Settings2 className="w-4 h-4 text-muted-foreground" />
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {['Appearance', 'Bot Icon', 'Settings', 'Navigation', 'Deploy'].map(f => (
                            <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeCategory === 'all' ? (
                  categoryOrder.filter(c => c !== 'chat_widget').map(cat => {
                    const items = groupedIntegrations[cat];
                    if (!items || items.length === 0) return null;
                    const config = CATEGORY_CONFIG[cat];

                    return (
                      <div key={cat}>
                        <h2 className="text-base font-semibold text-foreground mb-4">
                          {config.label} ({items.length})
                        </h2>
                        <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                          {items.map(integration => (
                            <IntegrationCard
                              key={integration.id}
                              integration={integration}
                              onClick={() => handleOpenDetail(integration)}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : activeCategory !== 'chat_widget' ? (
                  <div>
                    <h2 className="text-base font-semibold text-foreground mb-4">
                      {CATEGORY_CONFIG[activeCategory]?.label} ({filteredIntegrations.length})
                    </h2>
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                      {filteredIntegrations.map(integration => (
                        <IntegrationCard
                          key={integration.id}
                          integration={integration}
                          onClick={() => handleOpenDetail(integration)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}

                {filteredIntegrations.length === 0 && activeCategory !== 'chat_widget' && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Plug className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold mb-1">No integrations found</h3>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting your search or category filter
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">API Keys</CardTitle>
                    <CardDescription>Manage your API keys for programmatic access</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setCreateKeyModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-1" />
                    Create Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map(apiKey => (
                      <TableRow key={apiKey.id}>
                        <TableCell className="font-medium">{apiKey.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {apiKey.key.substring(0, 20)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyKey(apiKey.id, apiKey.key)}
                            >
                              {copiedKeyId === apiKey.id ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {apiKey.permissions.map(p => (
                              <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(apiKey.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={apiKey.isActive}
                            onCheckedChange={() => handleToggleKey(apiKey.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleCopyKey(apiKey.id, apiKey.key)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Key
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRevokeKey(apiKey.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Revoke Key
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Webhook Endpoints</CardTitle>
                    <CardDescription>Configure endpoints to receive real-time events</CardDescription>
                  </div>
                  <PermissionButton
                    screenId="integrations"
                    action="create"
                    size="sm"
                    onClick={() => {
                      withPermission('create', () => setAddWebhookModalOpen(true));
                    }}
                    unauthorizedMessage="You don't have permission to add webhook endpoints."
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Endpoint
                  </PermissionButton>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {webhooks.map(webhook => (
                    <div
                      key={webhook.id}
                      className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Webhook className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{webhook.name}</p>
                            <code className="text-xs text-muted-foreground">{webhook.url}</code>
                          </div>
                        </div>
                        <Switch checked={webhook.isActive} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {webhook.events.map(event => (
                          <Badge key={event} variant="secondary" className="text-[10px]">{event}</Badge>
                        ))}
                      </div>
                      {webhook.lastTriggered && (
                        <p className="text-xs text-muted-foreground mt-3">
                          Last triggered: {formatTime(webhook.lastTriggered)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateAPIKeyModal
        open={createKeyModalOpen}
        onOpenChange={setCreateKeyModalOpen}
        onCreate={handleCreateKey}
      />

      <AddWebhookModal
        open={addWebhookModalOpen}
        onOpenChange={setAddWebhookModalOpen}
        onAdd={handleAddWebhook}
      />
    </AppLayout>
  );
}

function IntegrationCard({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  const icon = INTEGRATION_ICONS[integration.icon] || '🔌';
  const isConnected = integration.status === 'connected';

  return (
    <Card
      className={cn(
        'gradient-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 group',
        isConnected && 'ring-1 ring-success/20'
      )}
      onClick={onClick}
    >
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-2xl flex-shrink-0 border group-hover:border-primary/30 transition-colors">
            {icon}
          </div>
          {isConnected && (
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-1" />
          )}
        </div>
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
          {integration.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {integration.description}
        </p>
      </CardContent>
    </Card>
  );
}
