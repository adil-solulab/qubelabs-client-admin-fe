import { useState } from 'react';
import {
  Plug,
  Unplug,
  Settings,
  RefreshCw,
  Key,
  Plus,
  Trash2,
  MoreVertical,
  Copy,
  Check,
  ExternalLink,
  Search,
  Filter,
  Webhook,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useIntegrationsData } from '@/hooks/useIntegrationsData';
import { notify } from '@/hooks/useNotification';
import { ConnectIntegrationModal } from '@/components/integrations/ConnectIntegrationModal';
import { DisconnectIntegrationModal } from '@/components/integrations/DisconnectIntegrationModal';
import { CreateAPIKeyModal } from '@/components/integrations/CreateAPIKeyModal';
import type { Integration, IntegrationCategory } from '@/types/integrations';
import { CATEGORY_CONFIG, STATUS_CONFIG, INTEGRATION_ICONS } from '@/types/integrations';
import { cn } from '@/lib/utils';

export default function IntegrationsPage() {
  const {
    integrations,
    apiKeys,
    webhooks,
    connectIntegration,
    disconnectIntegration,
    createAPIKey,
    revokeAPIKey,
    toggleAPIKey,
  } = useIntegrationsData();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory | 'all'>('all');
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [createKeyModalOpen, setCreateKeyModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || int.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const connectedCount = integrations.filter(i => i.status === 'connected').length;

  const handleConnect = async (integrationId: string, credentials?: Record<string, string>) => {
    const result = await connectIntegration(integrationId, credentials);
    const int = integrations.find(i => i.id === integrationId);
    if (result.success) {
      notify.connected(int?.name || 'Integration');
    } else {
      notify.error('Connection failed', result.error || 'Could not connect. Please try again.');
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

  const handleConnectClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConnectModalOpen(true);
  };

  const handleDisconnectClick = (integration: Integration) => {
    setSelectedIntegration(integration);
    setDisconnectModalOpen(true);
  };

  const handleCreateKey = async (name: string, permissions: string[]) => {
    const result = await createAPIKey(name, permissions);
    if (result.success) {
      notify.created('API Key');
    } else {
      notify.error('Failed to create API key', 'Please try again.');
    }
    return result;
  };

  const handleRevokeKey = async (keyId: string) => {
    await revokeAPIKey(keyId);
    notify.deleted('API Key');
  };

  const handleToggleKey = async (keyId: string) => {
    await toggleAPIKey(keyId);
    const key = apiKeys.find(k => k.id === keyId);
    if (key?.isActive) {
      notify.info('API Key disabled');
    } else {
      notify.success('API Key enabled');
    }
  };

  const handleCopyKey = async (keyId: string, key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
    notify.copied();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground">
              Connect third-party services and manage API access
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            <Plug className="w-3 h-3 mr-1" />
            {connectedCount} of {integrations.length} connected
          </Badge>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Filters */}
            <Card className="gradient-card">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search integrations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(['all', 'communication', 'crm', 'support', 'messaging'] as const).map(cat => (
                      <Button
                        key={cat}
                        variant={categoryFilter === cat ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCategoryFilter(cat)}
                      >
                        {cat === 'all' ? 'All' : CATEGORY_CONFIG[cat].label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredIntegrations.map(integration => {
                const icon = INTEGRATION_ICONS[integration.icon] || '🔌';
                const categoryConfig = CATEGORY_CONFIG[integration.category];
                const statusConfig = STATUS_CONFIG[integration.status];
                const isConnected = integration.status === 'connected';

                return (
                  <Card key={integration.id} className={cn(
                    'gradient-card transition-all hover:shadow-md',
                    isConnected && 'ring-1 ring-success/30'
                  )}>
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                          {icon}
                        </div>
                        <Badge variant="secondary" className={cn('text-[10px]', statusConfig.bgColor, statusConfig.color)}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-1">{integration.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {integration.description}
                      </p>

                      <Badge variant="outline" className={cn('text-[10px] mb-4', categoryConfig.color)}>
                        {categoryConfig.label}
                      </Badge>

                      {isConnected && integration.lastSync && (
                        <p className="text-xs text-muted-foreground mb-3">
                          Last sync: {formatTime(integration.lastSync)}
                        </p>
                      )}

                      <div className="flex gap-2">
                        {isConnected ? (
                          <>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Settings className="w-3.5 h-3.5 mr-1" />
                              Configure
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDisconnectClick(integration)}
                            >
                              <Unplug className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleConnectClick(integration)}
                          >
                            <Plug className="w-3.5 h-3.5 mr-1" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* API Keys Tab */}
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
                              <Badge key={p} variant="outline" className="text-[10px]">
                                {p}
                              </Badge>
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

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium">Webhook Endpoints</CardTitle>
                    <CardDescription>Configure endpoints to receive real-time events</CardDescription>
                  </div>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Endpoint
                  </Button>
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
                          <Badge key={event} variant="secondary" className="text-[10px]">
                            {event}
                          </Badge>
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

      {/* Modals */}
      <ConnectIntegrationModal
        integration={selectedIntegration}
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        onConnect={handleConnect}
      />

      <DisconnectIntegrationModal
        integration={selectedIntegration}
        open={disconnectModalOpen}
        onOpenChange={setDisconnectModalOpen}
        onDisconnect={handleDisconnect}
      />

      <CreateAPIKeyModal
        open={createKeyModalOpen}
        onOpenChange={setCreateKeyModalOpen}
        onCreate={handleCreateKey}
      />
    </AppLayout>
  );
}
