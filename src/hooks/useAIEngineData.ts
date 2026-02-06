import { useState, useCallback, useEffect } from 'react';
import type {
  AIProviderHealth,
  TenantAIConfig,
  FailoverEvent,
  AIProviderType,
  AIServiceType,
  LatencyThresholds,
} from '@/types/aiEngine';

const generateMockProviders = (): AIProviderHealth[] => [
  {
    id: 'openai',
    name: 'OpenAI',
    type: 'openai',
    services: {
      stt: { status: 'healthy', latency: 120, threshold: 300, availability: 99.9, failoverTriggered: false },
      tts: { status: 'healthy', latency: 85, threshold: 200, availability: 99.8, failoverTriggered: false },
      llm: { status: 'healthy', latency: 450, threshold: 1000, availability: 99.5, failoverTriggered: false },
    },
    lastChecked: new Date().toISOString(),
    priority: 1,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    type: 'anthropic',
    services: {
      stt: { status: 'degraded', latency: 280, threshold: 300, availability: 97.5, failoverTriggered: false },
      tts: { status: 'healthy', latency: 95, threshold: 200, availability: 99.2, failoverTriggered: false },
      llm: { status: 'healthy', latency: 380, threshold: 1000, availability: 99.7, failoverTriggered: false },
    },
    lastChecked: new Date().toISOString(),
    priority: 2,
  },
  {
    id: 'google',
    name: 'Google AI',
    type: 'google',
    services: {
      stt: { status: 'healthy', latency: 95, threshold: 300, availability: 99.9, failoverTriggered: false },
      tts: { status: 'down', latency: 0, threshold: 200, availability: 85.0, failoverTriggered: true, lastFailover: new Date(Date.now() - 3600000).toISOString() },
      llm: { status: 'healthy', latency: 520, threshold: 1000, availability: 99.3, failoverTriggered: false },
    },
    lastChecked: new Date().toISOString(),
    priority: 3,
  },
  {
    id: 'azure',
    name: 'Azure AI',
    type: 'azure',
    services: {
      stt: { status: 'healthy', latency: 110, threshold: 300, availability: 99.7, failoverTriggered: false },
      tts: { status: 'healthy', latency: 75, threshold: 200, availability: 99.9, failoverTriggered: false },
      llm: { status: 'degraded', latency: 890, threshold: 1000, availability: 98.5, failoverTriggered: false },
    },
    lastChecked: new Date().toISOString(),
    priority: 4,
  },
];

const generateMockTenantConfig = (): TenantAIConfig => ({
  tenantId: 'tenant-1',
  preferredProviders: {
    stt: 'openai',
    tts: 'openai',
    llm: 'openai',
  },
  fallbackOrder: ['openai', 'anthropic', 'google', 'azure'],
  thresholds: {
    stt: 300,
    tts: 200,
    llm: 1000,
  },
  autoFailoverEnabled: true,
});

const generateMockFailoverEvents = (): FailoverEvent[] => [
  {
    id: 'fo-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    service: 'tts',
    fromProvider: 'google',
    toProvider: 'openai',
    reason: 'Latency threshold exceeded (450ms > 200ms)',
    latencyBefore: 450,
    latencyAfter: 85,
  },
  {
    id: 'fo-2',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    service: 'llm',
    fromProvider: 'azure',
    toProvider: 'anthropic',
    reason: 'Provider unavailable',
    latencyBefore: 0,
    latencyAfter: 380,
  },
  {
    id: 'fo-3',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    service: 'stt',
    fromProvider: 'anthropic',
    toProvider: 'google',
    reason: 'Latency threshold exceeded (350ms > 300ms)',
    latencyBefore: 350,
    latencyAfter: 95,
  },
];

export function useAIEngineData() {
  const [providers, setProviders] = useState<AIProviderHealth[]>(generateMockProviders());
  const [tenantConfig, setTenantConfig] = useState<TenantAIConfig>(generateMockTenantConfig());
  const [failoverEvents, setFailoverEvents] = useState<FailoverEvent[]>(generateMockFailoverEvents());
  const [isSaving, setIsSaving] = useState(false);

  // Simulate real-time latency updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProviders(prev => prev.map(provider => ({
        ...provider,
        services: {
          stt: {
            ...provider.services.stt,
            latency: provider.services.stt.status !== 'down' 
              ? Math.max(50, provider.services.stt.latency + (Math.random() - 0.5) * 30)
              : 0,
          },
          tts: {
            ...provider.services.tts,
            latency: provider.services.tts.status !== 'down'
              ? Math.max(50, provider.services.tts.latency + (Math.random() - 0.5) * 20)
              : 0,
          },
          llm: {
            ...provider.services.llm,
            latency: provider.services.llm.status !== 'down'
              ? Math.max(100, provider.services.llm.latency + (Math.random() - 0.5) * 100)
              : 0,
          },
        },
        lastChecked: new Date().toISOString(),
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const updatePreferredProvider = useCallback(async (service: AIServiceType, provider: AIProviderType) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setTenantConfig(prev => ({
      ...prev,
      preferredProviders: {
        ...prev.preferredProviders,
        [service]: provider,
      },
    }));
    setIsSaving(false);
  }, []);

  const updateFallbackOrder = useCallback(async (order: AIProviderType[]) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setTenantConfig(prev => ({
      ...prev,
      fallbackOrder: order,
    }));
    setIsSaving(false);
  }, []);

  const updateThresholds = useCallback(async (thresholds: Partial<LatencyThresholds>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setTenantConfig(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        ...thresholds,
      },
    }));
    setIsSaving(false);
  }, []);

  const toggleAutoFailover = useCallback(async (enabled: boolean) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setTenantConfig(prev => ({
      ...prev,
      autoFailoverEnabled: enabled,
    }));
    setIsSaving(false);
  }, []);

  const triggerManualFailover = useCallback(async (service: AIServiceType, toProvider: AIProviderType) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const fromProvider = tenantConfig.preferredProviders[service];
    const fromProviderData = providers.find(p => p.type === fromProvider);
    const toProviderData = providers.find(p => p.type === toProvider);
    
    const newEvent: FailoverEvent = {
      id: `fo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      service,
      fromProvider,
      toProvider,
      reason: 'Manual failover triggered',
      latencyBefore: fromProviderData?.services[service].latency || 0,
      latencyAfter: toProviderData?.services[service].latency || 0,
    };

    setFailoverEvents(prev => [newEvent, ...prev]);
    setTenantConfig(prev => ({
      ...prev,
      preferredProviders: {
        ...prev.preferredProviders,
        [service]: toProvider,
      },
    }));
    setIsSaving(false);
    
    return { success: true };
  }, [tenantConfig.preferredProviders, providers]);

  const refreshHealthStatus = useCallback(async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProviders(generateMockProviders());
    setIsSaving(false);
  }, []);

  return {
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
  };
}
