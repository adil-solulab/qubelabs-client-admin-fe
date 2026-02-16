import { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Wifi,
  ChevronRight,
  ArrowLeft,
  Shield,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useChannelsData } from '@/hooks/useChannelsData';
import { notify } from '@/hooks/useNotification';
import { ConnectorConfigPanel, CONNECTOR_ICONS, CONNECTOR_COLORS } from '@/components/channels/ConnectorConfigPanel';
import { ChatWidgetConfigPanel } from '@/components/channels/ChatWidgetConfigPanel';
import type { ChannelCategory, Connector } from '@/types/channels';
import { cn } from '@/lib/utils';

type ViewMode = 'categories' | 'connectors' | 'connector-config' | 'chat-widget';

const CATEGORY_CONFIG: Record<ChannelCategory, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  voice: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800/40' },
  messaging: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800/40' },
  'chat-widget': { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800/40' },
  email: { icon: Mail, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800/40' },
};

export default function ChannelsPage() {
  const {
    connectors,
    chatWidgetConfig,
    isSaving,
    getConnectorsByCategory,
    connectConnector,
    disconnectConnector,
    updateConnectorConfig,
    updateChatWidgetConfig,
    getCategoryStats,
  } = useChannelsData();

  const [viewMode, setViewMode] = useState<ViewMode>('categories');
  const [selectedCategory, setSelectedCategory] = useState<ChannelCategory | null>(null);
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);

  const categoryStats = getCategoryStats();

  const handleCategoryClick = (category: ChannelCategory) => {
    if (category === 'chat-widget') {
      setViewMode('chat-widget');
      setSelectedCategory('chat-widget');
    } else {
      setSelectedCategory(category);
      setViewMode('connectors');
    }
  };

  const handleConnectorClick = (connector: Connector) => {
    setSelectedConnector(connector);
    setViewMode('connector-config');
  };

  const handleBackToCategories = () => {
    setViewMode('categories');
    setSelectedCategory(null);
    setSelectedConnector(null);
  };

  const handleBackToConnectors = () => {
    setViewMode('connectors');
    setSelectedConnector(null);
  };

  const handleConnect = async (id: string, config: Record<string, string>) => {
    const result = await connectConnector(id, config);
    if (result.success) {
      notify.success('Connected', 'Connector has been connected successfully.');
      const updated = connectors.find(c => c.id === id);
      if (updated) setSelectedConnector({ ...updated, status: 'connected', config, connectedAt: new Date().toISOString() });
    }
    return result;
  };

  const handleDisconnect = async (id: string) => {
    const result = await disconnectConnector(id);
    if (result.success) {
      notify.info('Disconnected', 'Connector has been disconnected.');
      const updated = connectors.find(c => c.id === id);
      if (updated) setSelectedConnector({ ...updated, status: 'disconnected', config: {}, connectedAt: undefined });
    }
    return result;
  };

  const handleUpdateConfig = async (id: string, config: Record<string, string>) => {
    const result = await updateConnectorConfig(id, config);
    if (result.success) {
      notify.saved('Connector configuration');
    }
    return result;
  };

  const categoryConnectors = selectedCategory && selectedCategory !== 'chat-widget'
    ? getConnectorsByCategory(selectedCategory)
    : [];

  const getCategoryLabel = (id: ChannelCategory) => {
    return id === 'voice' ? 'Voice' : id === 'messaging' ? 'Messaging' : id === 'chat-widget' ? 'Chat Widget' : 'Email';
  };

  if (viewMode === 'connector-config' && selectedConnector) {
    const liveConnector = connectors.find(c => c.id === selectedConnector.id) || selectedConnector;
    return (
      <AppLayout>
        <ConnectorConfigPanel
          connector={liveConnector}
          isSaving={isSaving}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          onUpdateConfig={handleUpdateConfig}
          onBack={handleBackToConnectors}
        />
      </AppLayout>
    );
  }

  if (viewMode === 'chat-widget') {
    return (
      <AppLayout>
        <ChatWidgetConfigPanel
          config={chatWidgetConfig}
          isSaving={isSaving}
          onUpdate={updateChatWidgetConfig}
          onBack={handleBackToCategories}
        />
      </AppLayout>
    );
  }

  if (viewMode === 'connectors' && selectedCategory) {
    return (
      <AppLayout>
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-5">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleBackToCategories}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors" onClick={handleBackToCategories}>Channels</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-medium text-foreground">{getCategoryLabel(selectedCategory)}</span>
            </div>
          </div>

          <div className="mb-5">
            <h1 className="text-xl font-bold text-foreground">
              {getCategoryLabel(selectedCategory)} Connectors
            </h1>
            <p className="text-sm text-muted-foreground">
              Connect third-party {getCategoryLabel(selectedCategory).toLowerCase()} services to your platform
            </p>
          </div>

          <div className="space-y-2">
            {categoryConnectors.map((connector) => {
              const Icon = CONNECTOR_ICONS[connector.id] || Shield;
              const colors = CONNECTOR_COLORS[connector.id] || { color: 'text-primary', bg: 'bg-primary/10' };
              const isConnected = connector.status === 'connected';

              return (
                <div
                  key={connector.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl border bg-card cursor-pointer transition-all hover:bg-accent/50 group',
                    isConnected && 'border-success/20'
                  )}
                  onClick={() => handleConnectorClick(connector)}
                >
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
                    <Icon className={cn('w-5 h-5', colors.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold">{connector.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{connector.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {isConnected ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-success" />
                        <span className="text-xs font-medium text-success">Connected</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not connected</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="animate-fade-in">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-foreground">Channels</h1>
          <p className="text-sm text-muted-foreground">
            Connect and manage communication channels for your AI agents
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((cat) => {
            const config = CATEGORY_CONFIG[cat.id];
            const CatIcon = config.icon;

            return (
              <Card
                key={cat.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 border',
                  config.border
                )}
                onClick={() => handleCategoryClick(cat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', config.bg)}>
                      <CatIcon className={cn('w-5 h-5', config.color)} />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <h3 className="text-sm font-bold mb-0.5">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{cat.description}</p>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">
                      {cat.connectorCount} {cat.connectorCount === 1 ? 'connector' : 'connectors'}
                    </span>
                    {cat.activeCount > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-success/10 text-success border-success/30">
                        <Wifi className="w-2.5 h-2.5 mr-0.5" />
                        {cat.activeCount} active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-foreground mb-3">All Connectors</h2>
          <div className="space-y-1.5">
            {connectors.map((connector) => {
              const Icon = CONNECTOR_ICONS[connector.id] || Shield;
              const colors = CONNECTOR_COLORS[connector.id] || { color: 'text-primary', bg: 'bg-primary/10' };
              const isConnected = connector.status === 'connected';
              const catConfig = CATEGORY_CONFIG[connector.category];

              return (
                <div
                  key={connector.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card cursor-pointer transition-all hover:bg-accent/50 group"
                  onClick={() => handleConnectorClick(connector)}
                >
                  <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colors.bg)}>
                    <Icon className={cn('w-4 h-4', colors.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{connector.name}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 flex-shrink-0">
                    {getCategoryLabel(connector.category)}
                  </Badge>
                  {isConnected ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-[11px] font-medium text-success">Connected</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">Not connected</span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
