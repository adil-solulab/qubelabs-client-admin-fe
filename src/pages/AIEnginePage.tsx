import { useState } from 'react';
import {
  Activity,
  Zap,
  RefreshCw,
  Settings,
  AlertTriangle,
  ArrowRightLeft,
  Clock,
  TrendingUp,
  Shield,
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  GripVertical,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useAIEngineData } from '@/hooks/useAIEngineData';
import { notify } from '@/hooks/useNotification';
import { PROVIDER_CONFIG, SERVICE_CONFIG, HEALTH_CONFIG } from '@/types/aiEngine';
import type { AIProviderType, AIServiceType, HealthStatus } from '@/types/aiEngine';
import { cn } from '@/lib/utils';

export default function AIEnginePage() {
  const {
    providers,
    tenantConfig,
    failoverEvents,
    isSaving,
    updatePreferredProvider,
    updateFallbackOrder,
    updateThresholds,
    toggleAutoFailover,
    triggerManualFailover,
    refreshHealthStatus,
  } = useAIEngineData();

  const [activeTab, setActiveTab] = useState('monitoring');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const handleToggleAutoFailover = async (enabled: boolean) => {
    await toggleAutoFailover(enabled);
    if (enabled) {
      notify.success('Auto-failover enabled', 'System will automatically switch providers when thresholds are breached.');
    } else {
      notify.info('Auto-failover disabled', 'You will need to manually switch providers.');
    }
  };

  const handleManualFailover = async (service: AIServiceType, toProvider: AIProviderType) => {
    const result = await triggerManualFailover(service, toProvider);
    if (result.success) {
      notify.success('Failover complete', `${SERVICE_CONFIG[service].name} switched to ${PROVIDER_CONFIG[toProvider].name}`);
    }
  };

  const handleRefresh = async () => {
    await refreshHealthStatus();
    notify.info('Health status refreshed');
  };

  const handleThresholdChange = async (service: AIServiceType, value: number) => {
    await updateThresholds({ [service]: value });
  };

  const getOverallHealth = (): HealthStatus => {
    const preferredProviders = [
      providers.find(p => p.type === tenantConfig.preferredProviders.stt),
      providers.find(p => p.type === tenantConfig.preferredProviders.tts),
      providers.find(p => p.type === tenantConfig.preferredProviders.llm),
    ].filter(Boolean);

    const hasDown = preferredProviders.some(p => 
      Object.values(p!.services).some(s => s.status === 'down')
    );
    const hasDegraded = preferredProviders.some(p => 
      Object.values(p!.services).some(s => s.status === 'degraded')
    );

    if (hasDown) return 'down';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const overallHealth = getOverallHealth();

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Engine Management</h1>
            <p className="text-sm text-muted-foreground">
              Monitor AI provider health and configure automatic failover
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('gap-1', HEALTH_CONFIG[overallHealth].bgColor, HEALTH_CONFIG[overallHealth].color)}>
              <div className={cn(
                'w-2 h-2 rounded-full',
                overallHealth === 'healthy' && 'bg-success animate-pulse',
                overallHealth === 'degraded' && 'bg-warning',
                overallHealth === 'down' && 'bg-destructive'
              )} />
              System {HEALTH_CONFIG[overallHealth].label}
            </Badge>
            <Button variant="outline" onClick={handleRefresh} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Auto-Failover Toggle */}
        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Automatic Failover</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically switch to backup providers when latency thresholds are breached
                  </p>
                </div>
              </div>
              <Switch
                checked={tenantConfig.autoFailoverEnabled}
                onCheckedChange={handleToggleAutoFailover}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-xl">
            <TabsTrigger value="monitoring" className="gap-2">
              <Activity className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="configuration" className="gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="thresholds" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Thresholds
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Events
            </TabsTrigger>
          </TabsList>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {providers.map(provider => {
                const config = PROVIDER_CONFIG[provider.type];
                const isPreferred = Object.values(tenantConfig.preferredProviders).includes(provider.type);
                
                return (
                  <Card key={provider.id} className={cn(
                    'gradient-card',
                    isPreferred && 'ring-2 ring-primary/50'
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.name}
                        </CardTitle>
                        {isPreferred && (
                          <Badge variant="secondary" className="text-[10px]">Active</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        Last checked: {formatTime(provider.lastChecked)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(['stt', 'tts', 'llm'] as AIServiceType[]).map(service => {
                        const serviceHealth = provider.services[service];
                        const healthConfig = HEALTH_CONFIG[serviceHealth.status];
                        
                        return (
                          <div key={service} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="flex items-center gap-1">
                                {SERVICE_CONFIG[service].icon} {SERVICE_CONFIG[service].name}
                              </span>
                              <Badge variant="outline" className={cn('text-[10px]', healthConfig.color)}>
                                {healthConfig.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={serviceHealth.status === 'down' ? 0 : Math.min(100, (serviceHealth.threshold - serviceHealth.latency) / serviceHealth.threshold * 100)} 
                                className="h-1.5 flex-1"
                              />
                              <span className="text-[10px] text-muted-foreground w-12 text-right">
                                {serviceHealth.status === 'down' ? 'N/A' : `${Math.round(serviceHealth.latency)}ms`}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="pt-2 text-xs text-muted-foreground">
                        Availability: {Math.min(
                          provider.services.stt.availability,
                          provider.services.tts.availability,
                          provider.services.llm.availability
                        ).toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="configuration" className="space-y-6 mt-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Preferred Providers</CardTitle>
                <CardDescription>
                  Configure which AI provider to use for each service
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {(['stt', 'tts', 'llm'] as AIServiceType[]).map(service => (
                  <div key={service} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                        {SERVICE_CONFIG[service].icon}
                      </div>
                      <div>
                        <p className="font-medium">{SERVICE_CONFIG[service].name}</p>
                        <p className="text-sm text-muted-foreground">
                          Current latency: {Math.round(
                            providers.find(p => p.type === tenantConfig.preferredProviders[service])?.services[service].latency || 0
                          )}ms
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={tenantConfig.preferredProviders[service]}
                        onValueChange={(value) => updatePreferredProvider(service, value as AIProviderType)}
                      >
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(provider => (
                            <SelectItem key={provider.id} value={provider.type}>
                              {PROVIDER_CONFIG[provider.type].icon} {PROVIDER_CONFIG[provider.type].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ArrowRightLeft className="w-4 h-4 mr-1" />
                            Failover
                            <ChevronDown className="w-3 h-3 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {providers
                            .filter(p => p.type !== tenantConfig.preferredProviders[service])
                            .map(provider => (
                              <DropdownMenuItem
                                key={provider.id}
                                onClick={() => handleManualFailover(service, provider.type)}
                              >
                                {PROVIDER_CONFIG[provider.type].icon} Switch to {PROVIDER_CONFIG[provider.type].name}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Fallback Priority Order</CardTitle>
                <CardDescription>
                  Drag to reorder or use arrows. Providers are tried in this order during automatic failover.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tenantConfig.fallbackOrder.map((providerType, index) => {
                    const canMoveUp = index > 0;
                    const canMoveDown = index < tenantConfig.fallbackOrder.length - 1;

                    const handleMove = async (direction: 'up' | 'down') => {
                      const newOrder = [...tenantConfig.fallbackOrder];
                      const targetIndex = direction === 'up' ? index - 1 : index + 1;
                      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
                      await updateFallbackOrder(newOrder);
                    };

                    const handleDragStart = (e: React.DragEvent) => {
                      setDraggedIndex(index);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', index.toString());
                    };

                    const handleDragOver = (e: React.DragEvent) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (draggedIndex !== null && draggedIndex !== index) {
                        setDragOverIndex(index);
                      }
                    };

                    const handleDragLeave = () => {
                      setDragOverIndex(null);
                    };

                    const handleDrop = async (e: React.DragEvent) => {
                      e.preventDefault();
                      if (draggedIndex !== null && draggedIndex !== index) {
                        const newOrder = [...tenantConfig.fallbackOrder];
                        const [removed] = newOrder.splice(draggedIndex, 1);
                        newOrder.splice(index, 0, removed);
                        await updateFallbackOrder(newOrder);
                      }
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    };

                    const handleDragEnd = () => {
                      setDraggedIndex(null);
                      setDragOverIndex(null);
                    };

                    const isDragging = draggedIndex === index;
                    const isDragOver = dragOverIndex === index;

                    return (
                      <div
                        key={providerType}
                        draggable
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border bg-muted/30 group cursor-grab active:cursor-grabbing transition-all",
                          isDragging && "opacity-50 scale-[0.98]",
                          isDragOver && "border-primary ring-2 ring-primary/30 bg-primary/5"
                        )}
                      >
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            disabled={!canMoveUp || isSaving}
                            onClick={() => handleMove('up')}
                          >
                            <ChevronUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            disabled={!canMoveDown || isSaving}
                            onClick={() => handleMove('down')}
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                        </div>
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="outline" className="w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </Badge>
                        <span>{PROVIDER_CONFIG[providerType].icon}</span>
                        <span className="font-medium">{PROVIDER_CONFIG[providerType].name}</span>
                        {index === 0 && (
                          <Badge variant="secondary" className="ml-auto text-[10px]">Primary</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thresholds Tab */}
          <TabsContent value="thresholds" className="space-y-6 mt-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Latency Thresholds</CardTitle>
                <CardDescription>
                  Set maximum acceptable latency for each service. Failover triggers when exceeded.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {(['stt', 'tts', 'llm'] as AIServiceType[]).map(service => {
                  const threshold = tenantConfig.thresholds[service];
                  const currentLatency = providers.find(
                    p => p.type === tenantConfig.preferredProviders[service]
                  )?.services[service].latency || 0;
                  const isNearThreshold = currentLatency > threshold * 0.8;
                  
                  return (
                    <div key={service} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2 text-base">
                          {SERVICE_CONFIG[service].icon} {SERVICE_CONFIG[service].name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-sm font-mono',
                            isNearThreshold && 'text-warning'
                          )}>
                            {Math.round(currentLatency)}ms
                          </span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-sm font-mono font-bold">{threshold}ms</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[threshold]}
                          onValueChange={([value]) => handleThresholdChange(service, value)}
                          min={service === 'llm' ? 500 : 100}
                          max={service === 'llm' ? 3000 : 1000}
                          step={50}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{service === 'llm' ? '500ms' : '100ms'}</span>
                          <span>{service === 'llm' ? '3000ms' : '1000ms'}</span>
                        </div>
                      </div>
                      {isNearThreshold && (
                        <div className="flex items-center gap-2 text-warning text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          Current latency is approaching threshold
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6 mt-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-lg">Failover Events</CardTitle>
                <CardDescription>
                  History of automatic and manual failover events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Latency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {failoverEvents.map(event => (
                        <TableRow key={event.id}>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-muted-foreground" />
                              {formatTime(event.timestamp)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {SERVICE_CONFIG[event.service].icon} {SERVICE_CONFIG[event.service].name}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {PROVIDER_CONFIG[event.fromProvider].icon} {PROVIDER_CONFIG[event.fromProvider].name}
                          </TableCell>
                          <TableCell className="text-sm">
                            {PROVIDER_CONFIG[event.toProvider].icon} {PROVIDER_CONFIG[event.toProvider].name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                            {event.reason}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-destructive">{event.latencyBefore}ms</span>
                              <span>→</span>
                              <span className="text-success">{event.latencyAfter}ms</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
