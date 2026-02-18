import { useState, useMemo } from 'react';
import {
  Search,
  Plug,
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
  Filter,
  LayoutGrid,
  List,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIntegrationsData } from '@/hooks/useIntegrationsData';
import { usePermission } from '@/hooks/usePermission';
import { notify } from '@/hooks/useNotification';
import { IntegrationDetailView } from '@/components/integrations/IntegrationDetailView';
import { ChatWidgetConfigPanel } from '@/components/channels/ChatWidgetConfigPanel';
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
    chatWidgetConfig,
    isSavingWidget,
    connectIntegration,
    disconnectIntegration,
    updateChatWidgetConfig,
  } = useIntegrationsData();

  const { withPermission } = usePermission('integrations');

  const [viewMode, setViewMode] = useState<ViewMode>('listing');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<IntegrationCategory | 'all'>('all');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid');

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
    counts['chat_widget'] = (counts['chat_widget'] || 0) + 1;
    return counts;
  }, [integrations, searchQuery]);

  const connectedCount = useMemo(() => {
    return integrations.filter(i => i.status === 'connected').length;
  }, [integrations]);

  const totalCount = integrations.length + 1;

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

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations & Channels</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Connect third-party services and communication channels to your AI platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-card">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold">{connectedCount}</span>
              <span className="text-xs text-muted-foreground">of {totalCount} connected</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px,1fr] gap-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-card"
              />
            </div>

            <nav className="space-y-0.5">
              <button
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                  activeCategory === 'all'
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Plug className="w-4 h-4" />
                  <span>All Integrations</span>
                </div>
                <span className={cn(
                  'text-xs font-medium px-1.5 py-0.5 rounded-md',
                  activeCategory === 'all' ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}>
                  {totalCount}
                </span>
              </button>

              <div className="pt-2 pb-1 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Categories</span>
              </div>

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
                      'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all',
                      activeCategory === cat
                        ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <CatIcon className="w-4 h-4" />
                      <span>{config.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {activeCount > 0 && activeCategory !== cat && (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                      <span className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded-md',
                        activeCategory === cat ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}>
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {activeCategory === 'all' ? 'All categories' : CATEGORY_CONFIG[activeCategory]?.label}
                  {' '}
                  <span className="font-medium text-foreground">
                    ({activeCategory === 'all' ? totalCount : (filteredIntegrations.length + (activeCategory === 'chat_widget' ? 1 : 0))})
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1 border rounded-lg p-0.5">
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    layoutMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={cn(
                    'p-1.5 rounded-md transition-colors',
                    layoutMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {(activeCategory === 'all' || activeCategory === 'chat_widget') && (
              <div>
                {activeCategory === 'all' && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 rounded-full bg-purple-500" />
                    <h2 className="text-sm font-semibold text-foreground">Chat Widget</h2>
                    <span className="text-xs text-muted-foreground">(1)</span>
                  </div>
                )}
                <Card
                  className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 group border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/20"
                  onClick={() => setViewMode('chat-widget')}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0 border border-purple-200/50 dark:border-purple-800/30 group-hover:scale-105 transition-transform">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                            Chat Widget
                          </h3>
                          <Badge className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/10">
                            Active
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                          Embeddable web chat widget with full customization - appearance, bot icon, settings, navigation, and deploy script.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {['Appearance', 'Bot Icon', 'Settings', 'Navigation', 'Deploy'].map(f => (
                            <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Settings2 className="w-4 h-4 text-muted-foreground" />
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
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
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn('w-1 h-4 rounded-full', config.barColor)} />
                      <h2 className="text-sm font-semibold text-foreground">{config.label}</h2>
                      <span className="text-xs text-muted-foreground">({items.length})</span>
                      {(categoryConnectedCounts[cat] || 0) > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 ml-auto">
                          <Wifi className="w-2.5 h-2.5 mr-0.5 text-green-500" />
                          {categoryConnectedCounts[cat]} active
                        </Badge>
                      )}
                    </div>
                    {layoutMode === 'grid' ? (
                      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                        {items.map(integration => (
                          <IntegrationCard
                            key={integration.id}
                            integration={integration}
                            onClick={() => handleOpenDetail(integration)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {items.map(integration => (
                          <IntegrationListItem
                            key={integration.id}
                            integration={integration}
                            onClick={() => handleOpenDetail(integration)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : activeCategory !== 'chat_widget' ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-semibold text-foreground">
                    {CATEGORY_CONFIG[activeCategory]?.label}
                  </h2>
                  <span className="text-xs text-muted-foreground">({filteredIntegrations.length})</span>
                </div>
                {layoutMode === 'grid' ? (
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {filteredIntegrations.map(integration => (
                      <IntegrationCard
                        key={integration.id}
                        integration={integration}
                        onClick={() => handleOpenDetail(integration)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredIntegrations.map(integration => (
                      <IntegrationListItem
                        key={integration.id}
                        integration={integration}
                        onClick={() => handleOpenDetail(integration)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {filteredIntegrations.length === 0 && activeCategory !== 'chat_widget' && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Plug className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-1">No integrations found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Try adjusting your search or category filter to find what you're looking for
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
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
        'cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 group overflow-hidden',
        isConnected && 'border-green-500/20'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-muted/80 flex items-center justify-center text-xl flex-shrink-0 border group-hover:border-primary/30 group-hover:scale-105 transition-all">
            {icon}
          </div>
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-medium text-green-600">Connected</span>
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted">Not connected</span>
            )}
          </div>
        </div>
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
          {integration.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
          {integration.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 2).map(f => (
              <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>
            ))}
            {integration.features.length > 2 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">+{integration.features.length - 2}</span>
            )}
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </CardContent>
    </Card>
  );
}

function IntegrationListItem({
  integration,
  onClick,
}: {
  integration: Integration;
  onClick: () => void;
}) {
  const icon = INTEGRATION_ICONS[integration.icon] || '🔌';
  const isConnected = integration.status === 'connected';

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border bg-card cursor-pointer transition-all hover:bg-accent/50 group',
        isConnected && 'border-green-500/15'
      )}
      onClick={onClick}
    >
      <div className="w-9 h-9 rounded-lg bg-muted/80 flex items-center justify-center text-lg flex-shrink-0 border group-hover:border-primary/30 transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium group-hover:text-primary transition-colors">{integration.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{integration.description}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex gap-1 max-w-[150px] overflow-hidden">
          {integration.features.slice(0, 2).map(f => (
            <span key={f} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">{f}</span>
          ))}
        </div>
        {isConnected ? (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-medium text-green-600">Connected</span>
          </div>
        ) : (
          <span className="text-[10px] text-muted-foreground">Not connected</span>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
