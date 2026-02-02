import { useState, useCallback } from 'react';
import type { VoiceConfig, ChatConfig, EmailConfig, DTMFOption, RoutingRule } from '@/types/channels';

const defaultVoiceConfig: VoiceConfig = {
  enabled: true,
  inboundEnabled: true,
  outboundEnabled: false,
  webRtcEnabled: true,
  phoneNumber: '+1 (555) 123-4567',
  welcomeMessage: 'Welcome to our support line. How can I help you today?',
  holdMusic: 'default',
  maxQueueTime: 300,
  dtmf: {
    enabled: true,
    options: [
      { key: '1', action: 'Route to', destination: 'Sales' },
      { key: '2', action: 'Route to', destination: 'Support' },
      { key: '3', action: 'Route to', destination: 'Billing' },
      { key: '0', action: 'Route to', destination: 'Operator' },
    ],
  },
  voiceProvider: 'elevenlabs',
  voiceId: 'rachel',
};

const defaultChatConfig: ChatConfig = {
  enabled: true,
  theme: {
    primaryColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    headerColor: '#7C3AED',
    textColor: '#1F2937',
    borderRadius: 'large',
  },
  typography: {
    fontFamily: 'inter',
    fontSize: 'medium',
    headerSize: 'medium',
  },
  botIcon: '🤖',
  botName: 'AI Assistant',
  position: 'bottom-right',
  initialMessage: 'Hello! How can I help you today?',
  inputPlaceholder: 'Type your message...',
  showTypingIndicator: true,
  showTimestamps: true,
  enableFileUpload: true,
  enableEmoji: true,
};

const defaultEmailConfig: EmailConfig = {
  enabled: true,
  aiReplies: {
    enabled: true,
    autoReply: false,
    replyDelay: 5,
    tone: 'friendly',
    signatureEnabled: true,
    signature: 'Best regards,\nAI Support Team',
  },
  summaries: {
    enabled: true,
    frequency: 'daily',
    recipients: ['admin@company.com'],
    includeMetrics: true,
  },
  routing: {
    enabled: true,
    rules: [
      { id: '1', name: 'Sales Inquiries', condition: 'subject_contains', value: 'pricing', action: 'assign_to', target: 'Sales Team', enabled: true },
      { id: '2', name: 'Urgent Issues', condition: 'priority', value: 'high', action: 'set_priority', target: 'urgent', enabled: true },
      { id: '3', name: 'Support Requests', condition: 'subject_contains', value: 'help', action: 'assign_to', target: 'Support Team', enabled: true },
    ],
    defaultAssignee: 'General Queue',
  },
  allowedDomains: [],
  blockedDomains: ['spam.com', 'junk.net'],
};

export function useChannelsData() {
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>(defaultVoiceConfig);
  const [chatConfig, setChatConfig] = useState<ChatConfig>(defaultChatConfig);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>(defaultEmailConfig);
  const [isSaving, setIsSaving] = useState(false);

  const updateVoiceConfig = useCallback(async (updates: Partial<VoiceConfig>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setVoiceConfig(prev => ({ ...prev, ...updates }));
    setIsSaving(false);
  }, []);

  const updateChatConfig = useCallback(async (updates: Partial<ChatConfig>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setChatConfig(prev => ({ ...prev, ...updates }));
    setIsSaving(false);
  }, []);

  const updateEmailConfig = useCallback(async (updates: Partial<EmailConfig>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setEmailConfig(prev => ({ ...prev, ...updates }));
    setIsSaving(false);
  }, []);

  const toggleChannel = useCallback(async (channel: 'voice' | 'chat' | 'email', enabled: boolean) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    switch (channel) {
      case 'voice':
        setVoiceConfig(prev => ({ ...prev, enabled }));
        break;
      case 'chat':
        setChatConfig(prev => ({ ...prev, enabled }));
        break;
      case 'email':
        setEmailConfig(prev => ({ ...prev, enabled }));
        break;
    }
    
    setIsSaving(false);
  }, []);

  const addDTMFOption = useCallback((option: DTMFOption) => {
    setVoiceConfig(prev => ({
      ...prev,
      dtmf: {
        ...prev.dtmf,
        options: [...prev.dtmf.options, option],
      },
    }));
  }, []);

  const removeDTMFOption = useCallback((key: string) => {
    setVoiceConfig(prev => ({
      ...prev,
      dtmf: {
        ...prev.dtmf,
        options: prev.dtmf.options.filter(o => o.key !== key),
      },
    }));
  }, []);

  const addRoutingRule = useCallback((rule: RoutingRule) => {
    setEmailConfig(prev => ({
      ...prev,
      routing: {
        ...prev.routing,
        rules: [...prev.routing.rules, rule],
      },
    }));
  }, []);

  const updateRoutingRule = useCallback((ruleId: string, updates: Partial<RoutingRule>) => {
    setEmailConfig(prev => ({
      ...prev,
      routing: {
        ...prev.routing,
        rules: prev.routing.rules.map(r => r.id === ruleId ? { ...r, ...updates } : r),
      },
    }));
  }, []);

  const removeRoutingRule = useCallback((ruleId: string) => {
    setEmailConfig(prev => ({
      ...prev,
      routing: {
        ...prev.routing,
        rules: prev.routing.rules.filter(r => r.id !== ruleId),
      },
    }));
  }, []);

  return {
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
  };
}
