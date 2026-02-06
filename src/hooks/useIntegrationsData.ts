import { useState, useCallback } from 'react';
import type { Integration, APIKey, WebhookEndpoint, IntegrationStatus } from '@/types/integrations';

const mockIntegrations: Integration[] = [
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Voice, SMS, and WhatsApp messaging platform',
    category: 'communication',
    icon: 'twilio',
    status: 'connected',
    authType: 'api_key',
    connectedAt: '2025-01-15T10:00:00Z',
    lastSync: '2025-02-02T08:30:00Z',
    features: ['Voice calls', 'SMS', 'WhatsApp', 'Video'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Official WhatsApp Business API integration',
    category: 'messaging',
    icon: 'whatsapp',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-20T14:00:00Z',
    lastSync: '2025-02-02T09:15:00Z',
    features: ['Messaging', 'Templates', 'Media sharing', 'Business profile'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Google email service for sending and receiving emails',
    category: 'communication',
    icon: 'gmail',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Send emails', 'Read emails', 'Labels', 'Attachments'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    category: 'messaging',
    icon: 'slack',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-10T09:00:00Z',
    lastSync: '2025-02-02T10:00:00Z',
    features: ['Messages', 'Channels', 'Notifications', 'File sharing'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Customer relationship management platform',
    category: 'crm',
    icon: 'salesforce',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-25T11:00:00Z',
    lastSync: '2025-02-02T07:45:00Z',
    features: ['Contacts', 'Leads', 'Opportunities', 'Cases'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Inbound marketing, sales, and CRM platform',
    category: 'crm',
    icon: 'hubspot',
    status: 'disconnected',
    authType: 'oauth',
    features: ['Contacts', 'Deals', 'Marketing', 'Automation'],
  },
  {
    id: 'sap',
    name: 'SAP',
    description: 'Enterprise resource planning and business software',
    category: 'crm',
    icon: 'sap',
    status: 'disconnected',
    authType: 'api_key',
    features: ['ERP', 'CRM', 'Analytics', 'Supply chain'],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    description: 'Customer service and support ticketing platform',
    category: 'support',
    icon: 'zendesk',
    status: 'connected',
    authType: 'oauth',
    connectedAt: '2025-01-18T16:00:00Z',
    lastSync: '2025-02-02T08:00:00Z',
    features: ['Tickets', 'Knowledge base', 'Live chat', 'Analytics'],
  },
];

const mockAPIKeys: APIKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'sk_live_xxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2025-01-01T00:00:00Z',
    lastUsed: '2025-02-02T10:30:00Z',
    permissions: ['read', 'write', 'delete'],
    isActive: true,
  },
  {
    id: 'key-2',
    name: 'Development API Key',
    key: 'sk_test_xxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2025-01-15T00:00:00Z',
    lastUsed: '2025-02-01T14:20:00Z',
    permissions: ['read', 'write'],
    isActive: true,
  },
  {
    id: 'key-3',
    name: 'Mobile App Key',
    key: 'sk_mobile_xxxxxxxxxxxxxxxxxxxxx',
    createdAt: '2025-01-20T00:00:00Z',
    permissions: ['read'],
    isActive: false,
  },
];

const mockWebhooks: WebhookEndpoint[] = [
  {
    id: 'wh-1',
    name: 'Conversation Events',
    url: 'https://api.example.com/webhooks/conversations',
    events: ['conversation.started', 'conversation.ended', 'message.received'],
    isActive: true,
    createdAt: '2025-01-10T00:00:00Z',
    lastTriggered: '2025-02-02T09:45:00Z',
  },
  {
    id: 'wh-2',
    name: 'Ticket Updates',
    url: 'https://api.example.com/webhooks/tickets',
    events: ['ticket.created', 'ticket.updated', 'ticket.resolved'],
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    lastTriggered: '2025-02-02T08:30:00Z',
  },
];

export function useIntegrationsData() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(mockWebhooks);

  const connectIntegration = useCallback(async (integrationId: string, credentials?: Record<string, string>): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate random failure
    if (Math.random() > 0.9) {
      return { success: false, error: 'Failed to authenticate. Please check your credentials.' };
    }

    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? {
            ...int,
            status: 'connected' as IntegrationStatus,
            connectedAt: new Date().toISOString(),
            lastSync: new Date().toISOString(),
          }
        : int
    ));

    return { success: true };
  }, []);

  const disconnectIntegration = useCallback(async (integrationId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    setIntegrations(prev => prev.map(int =>
      int.id === integrationId
        ? {
            ...int,
            status: 'disconnected' as IntegrationStatus,
            connectedAt: undefined,
            lastSync: undefined,
          }
        : int
    ));

    return { success: true };
  }, []);

  const createAPIKey = useCallback(async (name: string, permissions: string[]): Promise<{ success: boolean; key?: APIKey }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newKey: APIKey = {
      id: `key-${Date.now()}`,
      name,
      key: `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      permissions,
      isActive: true,
    };

    setApiKeys(prev => [newKey, ...prev]);
    return { success: true, key: newKey };
  }, []);

  const revokeAPIKey = useCallback(async (keyId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setApiKeys(prev => prev.filter(k => k.id !== keyId));
    return { success: true };
  }, []);

  const toggleAPIKey = useCallback(async (keyId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setApiKeys(prev => prev.map(k =>
      k.id === keyId ? { ...k, isActive: !k.isActive } : k
    ));
    return { success: true };
  }, []);

  const createWebhook = useCallback(async (name: string, url: string, events: string[]): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const newWebhook: WebhookEndpoint = {
      id: `wh-${Date.now()}`,
      name,
      url,
      events,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    setWebhooks(prev => [newWebhook, ...prev]);
    return { success: true };
  }, []);

  return {
    integrations,
    apiKeys,
    webhooks,
    connectIntegration,
    disconnectIntegration,
    createAPIKey,
    revokeAPIKey,
    toggleAPIKey,
    createWebhook,
  };
}
