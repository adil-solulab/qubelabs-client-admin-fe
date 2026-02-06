// AI Engine Fallback Types

export type AIProviderType = 'openai' | 'anthropic' | 'google' | 'azure';
export type AIServiceType = 'stt' | 'tts' | 'llm';
export type HealthStatus = 'healthy' | 'degraded' | 'down';

export interface AIProviderHealth {
  id: string;
  name: string;
  type: AIProviderType;
  services: {
    stt: ServiceHealth;
    tts: ServiceHealth;
    llm: ServiceHealth;
  };
  lastChecked: string;
  priority: number;
}

export interface ServiceHealth {
  status: HealthStatus;
  latency: number; // in ms
  threshold: number; // latency threshold in ms
  availability: number; // percentage
  failoverTriggered: boolean;
  lastFailover?: string;
}

export interface LatencyThresholds {
  stt: number;
  tts: number;
  llm: number;
}

export interface TenantAIConfig {
  tenantId: string;
  preferredProviders: {
    stt: AIProviderType;
    tts: AIProviderType;
    llm: AIProviderType;
  };
  fallbackOrder: AIProviderType[];
  thresholds: LatencyThresholds;
  autoFailoverEnabled: boolean;
}

export interface FailoverEvent {
  id: string;
  timestamp: string;
  service: AIServiceType;
  fromProvider: AIProviderType;
  toProvider: AIProviderType;
  reason: string;
  latencyBefore: number;
  latencyAfter: number;
}

export const PROVIDER_CONFIG: Record<AIProviderType, { name: string; icon: string; color: string }> = {
  openai: { name: 'OpenAI', icon: '🟢', color: 'text-success' },
  anthropic: { name: 'Anthropic', icon: '🟣', color: 'text-purple-500' },
  google: { name: 'Google AI', icon: '🔵', color: 'text-primary' },
  azure: { name: 'Azure AI', icon: '🔷', color: 'text-blue-500' },
};

export const SERVICE_CONFIG: Record<AIServiceType, { name: string; icon: string }> = {
  stt: { name: 'Speech-to-Text', icon: '🎤' },
  tts: { name: 'Text-to-Speech', icon: '🔊' },
  llm: { name: 'Language Model', icon: '🧠' },
};

export const HEALTH_CONFIG: Record<HealthStatus, { label: string; color: string; bgColor: string }> = {
  healthy: { label: 'Healthy', color: 'text-success', bgColor: 'bg-success/10' },
  degraded: { label: 'Degraded', color: 'text-warning', bgColor: 'bg-warning/10' },
  down: { label: 'Down', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};
