import { useState, useCallback } from 'react';
import type { Connector, ConnectorStatus, ChatWidgetConfig, ChannelCategory, WebRTCConfig, IceServer } from '@/types/channels';

const generateConnectors = (): Connector[] => [
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'voice',
    description: 'Cloud communications platform for voice calls, SIP trunking, and phone number management',
    icon: 'twilio',
    status: 'connected',
    connectedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    config: { accountSid: 'AC***************3f8a', authToken: '••••••••••••••••', phoneNumber: '+1 (555) 123-4567', region: 'us1' },
    configFields: [
      { key: 'accountSid', label: 'Account SID', type: 'text', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', required: true },
      { key: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Enter your auth token', required: true },
      { key: 'phoneNumber', label: 'Phone Number', type: 'text', placeholder: '+1 (555) 000-0000', required: true, helpText: 'Your Twilio phone number for inbound/outbound calls' },
      { key: 'region', label: 'Region', type: 'select', options: [{ value: 'us1', label: 'US (Virginia)' }, { value: 'ie1', label: 'EU (Ireland)' }, { value: 'au1', label: 'AU (Sydney)' }] },
    ],
  },
  {
    id: 'vonage',
    name: 'Vonage',
    category: 'voice',
    description: 'Communications APIs for voice, video, and messaging',
    icon: 'vonage',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'text', placeholder: 'Enter API key', required: true },
      { key: 'apiSecret', label: 'API Secret', type: 'password', placeholder: 'Enter API secret', required: true },
      { key: 'applicationId', label: 'Application ID', type: 'text', placeholder: 'Enter application ID' },
    ],
  },
  {
    id: 'genesys',
    name: 'Genesys Cloud',
    category: 'voice',
    description: 'Enterprise contact center platform with AI-powered voice routing',
    icon: 'genesys',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'region', label: 'Region', type: 'select', options: [{ value: 'mypurecloud.com', label: 'Americas' }, { value: 'mypurecloud.ie', label: 'EMEA' }, { value: 'mypurecloud.com.au', label: 'APAC' }] },
    ],
  },
  {
    id: 'asterisk',
    name: 'Asterisk / FreePBX',
    category: 'voice',
    description: 'Open-source PBX system for on-premise voice infrastructure',
    icon: 'asterisk',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'serverUrl', label: 'Server URL', type: 'url', placeholder: 'https://pbx.example.com', required: true },
      { key: 'amiUser', label: 'AMI Username', type: 'text', required: true },
      { key: 'amiPassword', label: 'AMI Password', type: 'password', required: true },
      { key: 'amiPort', label: 'AMI Port', type: 'number', placeholder: '5038' },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'messaging',
    description: 'Official WhatsApp Business API for customer conversations',
    icon: 'whatsapp',
    status: 'connected',
    connectedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    config: { phoneNumberId: '1234567890', businessAccountId: 'BA***************', accessToken: '••••••••••••••••' },
    configFields: [
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
      { key: 'businessAccountId', label: 'Business Account ID', type: 'text', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true, helpText: 'Permanent token from Meta Business Suite' },
      { key: 'webhookVerifyToken', label: 'Webhook Verify Token', type: 'text', helpText: 'Token for webhook verification' },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'messaging',
    description: 'Workspace messaging platform for team collaboration and customer support',
    icon: 'slack',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'xoxb-...', required: true },
      { key: 'signingSecret', label: 'Signing Secret', type: 'password', required: true },
      { key: 'appId', label: 'App ID', type: 'text' },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'messaging',
    description: 'Cloud-based messaging app with bot API support',
    icon: 'telegram',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'Enter BotFather token', required: true, helpText: 'Get this from @BotFather on Telegram' },
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', helpText: 'Auto-generated after connection' },
    ],
  },
  {
    id: 'msteams',
    name: 'Microsoft Teams',
    category: 'messaging',
    description: 'Enterprise messaging and collaboration platform',
    icon: 'teams',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'appId', label: 'App ID', type: 'text', required: true },
      { key: 'appPassword', label: 'App Password', type: 'password', required: true },
      { key: 'tenantId', label: 'Tenant ID', type: 'text', helpText: 'Azure AD tenant ID' },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    category: 'messaging',
    description: 'Meta Messenger platform for customer engagement',
    icon: 'facebook',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'pageAccessToken', label: 'Page Access Token', type: 'password', required: true },
      { key: 'pageId', label: 'Page ID', type: 'text', required: true },
      { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    category: 'messaging',
    description: 'Instagram messaging for business communications',
    icon: 'instagram',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'igAccountId', label: 'Instagram Account ID', type: 'text', required: true },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    description: 'Twilio SendGrid email delivery and marketing platform',
    icon: 'sendgrid',
    status: 'connected',
    connectedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    config: { apiKey: '••••••••••••••••', fromEmail: 'support@company.com', fromName: 'ConX Support' },
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'fromEmail', label: 'From Email', type: 'text', placeholder: 'noreply@company.com', required: true },
      { key: 'fromName', label: 'From Name', type: 'text', placeholder: 'Company Support' },
    ],
  },
  {
    id: 'ses',
    name: 'Amazon SES',
    category: 'email',
    description: 'Amazon Simple Email Service for high-volume email sending',
    icon: 'aws',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
      { key: 'region', label: 'AWS Region', type: 'select', options: [{ value: 'us-east-1', label: 'US East (N. Virginia)' }, { value: 'us-west-2', label: 'US West (Oregon)' }, { value: 'eu-west-1', label: 'EU (Ireland)' }] },
      { key: 'fromEmail', label: 'Verified From Email', type: 'text', required: true },
    ],
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    category: 'email',
    description: 'Email API service for transactional and bulk email',
    icon: 'mailgun',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'domain', label: 'Domain', type: 'text', placeholder: 'mg.example.com', required: true },
      { key: 'fromEmail', label: 'From Email', type: 'text', required: true },
    ],
  },
  {
    id: 'smtp',
    name: 'Custom SMTP',
    category: 'email',
    description: 'Connect any SMTP-compatible email server',
    icon: 'smtp',
    status: 'disconnected',
    config: {},
    configFields: [
      { key: 'host', label: 'SMTP Host', type: 'text', placeholder: 'smtp.example.com', required: true },
      { key: 'port', label: 'Port', type: 'number', placeholder: '587', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
      { key: 'encryption', label: 'Encryption', type: 'select', options: [{ value: 'tls', label: 'TLS' }, { value: 'ssl', label: 'SSL' }, { value: 'none', label: 'None' }] },
    ],
  },
];

const defaultChatWidgetConfig: ChatWidgetConfig = {
  appearance: {
    botLogo: '',
    botDisplayName: 'ConX Assistant',
    botDescription: 'AI-powered support assistant',
    theme: 'light',
    brandColor1: '#0094FF',
    brandColor2: '#00FF7A',
    colorMode: 'solid',
    complementaryColor: '#0094FF',
    accentColor: '#0094FF',
    fontStyle: 'default',
    fontSize: 'medium',
    widgetSize: 'medium',
    position: 'bottom-right',
    initialStateDesktop: 'minimized',
    initialStateMobile: 'minimized',
  },
  botIcon: {
    shape: 'circle',
    mobileShape: 'circle',
    source: 'avatar',
    animation: 'none',
  },
  settings: {
    autoComplete: true,
    messageFeedback: true,
    attachment: true,
    slowMessages: true,
    multilineInput: false,
    languageSwitcher: false,
    rtlSupport: false,
    scrollBehavior: 'bottom',
    chatHistory: true,
    freshSessionPerTab: false,
    downloadTranscript: true,
    unreadBadge: true,
    browserTabNotification: true,
    messageSound: true,
    speechToText: false,
    textToSpeech: false,
    autoSendSpeech: false,
  },
  navigation: {
    homeEnabled: true,
    menuEnabled: false,
    menuItems: [],
  },
  deployScript: `<script type="text/javascript">
  window.ymConfig = {
    bot: 'x1234567890',
    host: 'https://cloud.yellow.ai'
  };
  (function() {
    var w = window, ic = w.YellowMessenger;
    if ("function" === typeof ic) ic("reattach_activator"),
    ic("update", w.ymConfig);
    else {
      var d = document, i = function() {
        i.c(arguments)
      };
      i.q = []; i.c = function(args) { i.q.push(args) };
      w.YellowMessenger = i;
      var l = function() {
        var s = d.createElement("script");
        s.type = "text/javascript";
        s.async = true;
        s.src = "https://cdn.yellowmessenger.com/plugin/widget-v2/latest/dist/main.min.js";
        var x = d.getElementsByTagName("script")[0];
        x.parentNode.insertBefore(s, x);
      };
      w.attachEvent ? w.attachEvent("onload", l) : w.addEventListener("load", l, false);
    }
  })();
</script>`,
};

const defaultWebRTCConfig: WebRTCConfig = {
  iceServers: [
    { id: 'stun-1', type: 'stun', url: 'stun:stun.l.google.com:19302', priority: 1, enabled: true },
    { id: 'stun-2', type: 'stun', url: 'stun:stun1.l.google.com:19302', priority: 2, enabled: true },
    { id: 'turn-1', type: 'turn', url: 'turn:turn.conx.ai:3478', username: 'conx_user', credential: '••••••••', priority: 3, enabled: true },
    { id: 'turn-2', type: 'turn', url: 'turns:turn.conx.ai:5349', username: 'conx_user', credential: '••••••••', priority: 4, enabled: false },
  ],
  audioCodecs: {
    opus: { enabled: true, bitrate: 32000, stereo: false, dtx: true, fec: true },
    g711u: { enabled: true },
    g711a: { enabled: false },
    g722: { enabled: true },
    priority: ['opus', 'g722', 'g711u', 'g711a'],
  },
  audioProcessing: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    noiseSuppressionLevel: 'high',
    comfortNoise: true,
    vadEnabled: true,
    vadSensitivity: 60,
  },
  bandwidth: {
    maxAudioBitrate: 64000,
    adaptiveBitrate: true,
    jitterBufferTarget: 50,
    jitterBufferMax: 200,
    packetLossThreshold: 5,
  },
  sipGateway: {
    enabled: false,
    serverUrl: '',
    transport: 'wss',
    registrarUrl: '',
    username: '',
    password: '',
    domain: '',
    outboundProxy: '',
    registrationExpiry: 3600,
    keepAliveInterval: 30,
  },
  security: {
    srtp: true,
    srtpMode: 'required',
    dtls: true,
    dtlsFingerprint: 'sha-256',
    oauthEnabled: false,
    oauthProvider: '',
    oauthClientId: '',
  },
  network: {
    iceTransportPolicy: 'all',
    iceCandidatePoolSize: 2,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    tcpCandidates: true,
    continuousGathering: true,
    connectionTimeout: 30,
    keepAliveInterval: 15,
  },
};

export function useChannelsData() {
  const [connectors, setConnectors] = useState<Connector[]>(generateConnectors());
  const [chatWidgetConfig, setChatWidgetConfig] = useState<ChatWidgetConfig>(defaultChatWidgetConfig);
  const [webRTCConfig, setWebRTCConfig] = useState<WebRTCConfig>(defaultWebRTCConfig);
  const [isSaving, setIsSaving] = useState(false);

  const getConnectorsByCategory = useCallback((category: ChannelCategory) => {
    return connectors.filter(c => c.category === category);
  }, [connectors]);

  const getConnector = useCallback((id: string) => {
    return connectors.find(c => c.id === id) || null;
  }, [connectors]);

  const connectConnector = useCallback(async (id: string, config: Record<string, string>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnectors(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'connected' as ConnectorStatus, config, connectedAt: new Date().toISOString() } : c
    ));
    setIsSaving(false);
    return { success: true };
  }, []);

  const disconnectConnector = useCallback(async (id: string) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setConnectors(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'disconnected' as ConnectorStatus, config: {}, connectedAt: undefined } : c
    ));
    setIsSaving(false);
    return { success: true };
  }, []);

  const updateConnectorConfig = useCallback(async (id: string, config: Record<string, string>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setConnectors(prev => prev.map(c =>
      c.id === id ? { ...c, config } : c
    ));
    setIsSaving(false);
    return { success: true };
  }, []);

  const updateChatWidgetConfig = useCallback(async (updates: Partial<ChatWidgetConfig>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setChatWidgetConfig(prev => {
      const merged = { ...prev };
      if (updates.appearance) merged.appearance = { ...prev.appearance, ...updates.appearance };
      if (updates.botIcon) merged.botIcon = { ...prev.botIcon, ...updates.botIcon };
      if (updates.settings) merged.settings = { ...prev.settings, ...updates.settings };
      if (updates.navigation) merged.navigation = { ...prev.navigation, ...updates.navigation };
      return merged;
    });
    setIsSaving(false);
  }, []);

  const updateWebRTCConfig = useCallback(async (updates: Partial<WebRTCConfig>) => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setWebRTCConfig(prev => {
      const merged = { ...prev };
      if (updates.iceServers) merged.iceServers = updates.iceServers;
      if (updates.audioCodecs) merged.audioCodecs = { ...prev.audioCodecs, ...updates.audioCodecs };
      if (updates.audioProcessing) merged.audioProcessing = { ...prev.audioProcessing, ...updates.audioProcessing };
      if (updates.bandwidth) merged.bandwidth = { ...prev.bandwidth, ...updates.bandwidth };
      if (updates.sipGateway) merged.sipGateway = { ...prev.sipGateway, ...updates.sipGateway };
      if (updates.security) merged.security = { ...prev.security, ...updates.security };
      if (updates.network) merged.network = { ...prev.network, ...updates.network };
      return merged;
    });
    setIsSaving(false);
  }, []);

  const getCategoryStats = useCallback(() => {
    const categories: ChannelCategory[] = ['voice', 'messaging', 'chat-widget', 'email'];
    return categories.map(cat => {
      const catConnectors = cat === 'chat-widget' ? [] : connectors.filter(c => c.category === cat);
      return {
        id: cat,
        name: cat === 'voice' ? 'Voice' : cat === 'messaging' ? 'Messaging' : cat === 'chat-widget' ? 'Chat Widget' : 'Email',
        description: cat === 'voice' ? 'Voice calling & telephony providers' : cat === 'messaging' ? 'Messaging platforms & social channels' : cat === 'chat-widget' ? 'Embeddable web chat widget' : 'Email service providers',
        connectorCount: cat === 'chat-widget' ? 1 : catConnectors.length,
        activeCount: cat === 'chat-widget' ? 1 : catConnectors.filter(c => c.status === 'connected').length,
      };
    });
  }, [connectors]);

  return {
    connectors,
    chatWidgetConfig,
    webRTCConfig,
    isSaving,
    getConnectorsByCategory,
    getConnector,
    connectConnector,
    disconnectConnector,
    updateConnectorConfig,
    updateChatWidgetConfig,
    updateWebRTCConfig,
    getCategoryStats,
  };
}
