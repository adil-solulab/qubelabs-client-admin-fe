import { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Wifi,
  ChevronRight,
  Hash,
  Globe,
  Send,
  Cloud,
  Server,
  Camera,
  Shield,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useChannelsData } from '@/hooks/useChannelsData';
import { notify } from '@/hooks/useNotification';
import { ConnectorConfigPanel, CONNECTOR_ICONS, CONNECTOR_COLORS } from '@/components/channels/ConnectorConfigPanel';
import { ChatWidgetConfigPanel } from '@/components/channels/ChatWidgetConfigPanel';
import type { ChannelCategory, Connector } from '@/types/channels';
import { cn } from '@/lib/utils';

type ViewMode = 'categories' | 'connectors' | 'connector-config' | 'chat-widget';

const CATEGORY_CONFIG: Record<ChannelCategory, { icon: React.ElementType; color: string; bg: string }> = {
  voice: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  messaging: { icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
  'chat-widget': { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
  email: { icon: Mail, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/30' },
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
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBackToCategories}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Channels
            </button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{getCategoryLabel(selectedCategory)}</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">
              {getCategoryLabel(selectedCategory)} Connectors
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect third-party {getCategoryLabel(selectedCategory).toLowerCase()} services to your platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryConnectors.map((connector) => {
              const Icon = CONNECTOR_ICONS[connector.id] || Shield;
              const colors = CONNECTOR_COLORS[connector.id] || { color: 'text-primary', bg: 'bg-primary/10' };
              const isConnected = connector.status === 'connected';

              return (
                <Card
                  key={connector.id}
                  className={cn(
                    'gradient-card cursor-pointer transition-all hover:shadow-md',
                    isConnected && 'ring-1 ring-success/30'
                  )}
                  onClick={() => handleConnectorClick(connector)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', colors.bg)}>
                        <Icon className={cn('w-6 h-6', colors.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold">{connector.name}</h3>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs flex-shrink-0',
                              isConnected ? 'text-success border-success/30 bg-success/10' : 'text-muted-foreground'
                            )}
                          >
                            {isConnected ? (
                              <><Wifi className="w-3 h-3 mr-1" />Connected</>
                            ) : (
                              'Not Connected'
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{connector.description}</p>
                        {isConnected && connector.connectedAt && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Connected {new Date(connector.connectedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Channels</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect and manage communication channels for your AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryStats.map((cat) => {
            const config = CATEGORY_CONFIG[cat.id];
            const CatIcon = config.icon;

            return (
              <Card
                key={cat.id}
                className="gradient-card cursor-pointer transition-all hover:shadow-glow hover:-translate-y-0.5"
                onClick={() => handleCategoryClick(cat.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center', config.bg)}>
                      <CatIcon className={cn('w-7 h-7', config.color)} />
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>

                  <h2 className="text-lg font-bold mb-1">{cat.name}</h2>
                  <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>

                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {cat.connectorCount} {cat.connectorCount === 1 ? 'connector' : 'connectors'}
                    </Badge>
                    {cat.activeCount > 0 && (
                      <Badge className="text-xs bg-success/10 text-success border-success/30">
                        <Wifi className="w-3 h-3 mr-1" />
                        {cat.activeCount} active
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
