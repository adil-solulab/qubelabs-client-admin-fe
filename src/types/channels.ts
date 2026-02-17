export type ChannelCategory = 'voice' | 'messaging' | 'chat-widget' | 'email';
export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'pending';

export interface Connector {
  id: string;
  name: string;
  category: ChannelCategory;
  description: string;
  icon: string;
  status: ConnectorStatus;
  connectedAt?: string;
  config: Record<string, string>;
  configFields: ConnectorField[];
}

export interface ConnectorField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'toggle' | 'number' | 'url';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

export interface ChatWidgetConfig {
  appearance: {
    botLogo: string;
    botDisplayName: string;
    botDescription: string;
    theme: 'light' | 'dark';
    brandColor1: string;
    brandColor2: string;
    colorMode: 'solid' | 'gradient';
    complementaryColor: string;
    accentColor: string;
    fontStyle: 'default' | 'inter' | 'roboto' | 'opensans' | 'custom';
    customFontFamily?: string;
    customFontUrl?: string;
    fontSize: 'small' | 'medium' | 'large';
    widgetSize: 'small' | 'medium' | 'large';
    position: 'bottom-right' | 'bottom-left';
    initialStateDesktop: 'half-opened' | 'minimized' | 'conversational-layover' | 'chat-bubble';
    initialStateMobile: 'minimized' | 'chat-bubble';
  };
  botIcon: {
    shape: 'circle' | 'square' | 'bar';
    mobileShape: 'circle' | 'square';
    source: 'avatar' | 'custom';
    customIconUrl?: string;
    animation: 'none' | 'bounce' | 'pulse' | 'shake';
  };
  settings: {
    autoComplete: boolean;
    messageFeedback: boolean;
    attachment: boolean;
    slowMessages: boolean;
    multilineInput: boolean;
    languageSwitcher: boolean;
    rtlSupport: boolean;
    scrollBehavior: 'bottom' | 'top' | 'off';
    chatHistory: boolean;
    freshSessionPerTab: boolean;
    downloadTranscript: boolean;
    unreadBadge: boolean;
    browserTabNotification: boolean;
    messageSound: boolean;
    speechToText: boolean;
    textToSpeech: boolean;
    autoSendSpeech: boolean;
  };
  navigation: {
    homeEnabled: boolean;
    menuEnabled: boolean;
    menuItems: { label: string; action: string }[];
  };
  deployScript: string;
}

export interface IceServer {
  id: string;
  type: 'stun' | 'turn';
  url: string;
  username?: string;
  credential?: string;
  priority: number;
  enabled: boolean;
}

export interface WebRTCConfig {
  iceServers: IceServer[];
  audioCodecs: {
    opus: { enabled: boolean; bitrate: number; stereo: boolean; dtx: boolean; fec: boolean };
    g711u: { enabled: boolean };
    g711a: { enabled: boolean };
    g722: { enabled: boolean };
    priority: string[];
  };
  audioProcessing: {
    echoCancellation: boolean;
    noiseSuppression: boolean;
    autoGainControl: boolean;
    noiseSuppressionLevel: 'low' | 'moderate' | 'high' | 'very-high';
    comfortNoise: boolean;
    vadEnabled: boolean;
    vadSensitivity: number;
  };
  bandwidth: {
    maxAudioBitrate: number;
    adaptiveBitrate: boolean;
    jitterBufferTarget: number;
    jitterBufferMax: number;
    packetLossThreshold: number;
  };
  sipGateway: {
    enabled: boolean;
    serverUrl: string;
    transport: 'udp' | 'tcp' | 'tls' | 'wss';
    registrarUrl: string;
    username: string;
    password: string;
    domain: string;
    outboundProxy: string;
    registrationExpiry: number;
    keepAliveInterval: number;
  };
  security: {
    srtp: boolean;
    srtpMode: 'required' | 'preferred' | 'disabled';
    dtls: boolean;
    dtlsFingerprint: 'sha-256' | 'sha-1';
    oauthEnabled: boolean;
    oauthProvider: string;
    oauthClientId: string;
  };
  network: {
    iceTransportPolicy: 'all' | 'relay';
    iceCandidatePoolSize: number;
    bundlePolicy: 'balanced' | 'max-compat' | 'max-bundle';
    rtcpMuxPolicy: 'require' | 'negotiate';
    tcpCandidates: boolean;
    continuousGathering: boolean;
    connectionTimeout: number;
    keepAliveInterval: number;
  };
}

export interface ChannelCategoryInfo {
  id: ChannelCategory;
  name: string;
  description: string;
  connectorCount: number;
  activeCount: number;
}
