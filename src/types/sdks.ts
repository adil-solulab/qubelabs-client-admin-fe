export type SDKPlatform = 'web' | 'ios' | 'android' | 'react-native';
export type SDKCategory = 'chat' | 'voice-webrtc';

export interface SDK {
  id: string;
  platform: SDKPlatform;
  category: SDKCategory;
  name: string;
  description: string;
  version: string;
  installCommand: string;
  documentationUrl: string;
  icon: string;
  language: string;
}

export interface EmbedWidget {
  id: string;
  name: string;
  type: 'chat' | 'webrtc';
  description: string;
  embedCode: string;
  customizable: boolean;
}

export interface ProjectKey {
  id: string;
  name: string;
  key: string;
  type: 'publishable' | 'secret';
  environment: 'production' | 'development';
  createdAt: string;
  lastUsed?: string;
}

export const SDK_ICONS: Record<SDKPlatform, string> = {
  web: '🌐',
  ios: '🍎',
  android: '🤖',
  'react-native': '⚛️',
};

export const SDK_LANGUAGES: Record<SDKPlatform, string> = {
  web: 'JavaScript / TypeScript',
  ios: 'Swift',
  android: 'Kotlin',
  'react-native': 'React Native (JS/TS)',
};

export const SDK_CATEGORY_LABELS: Record<SDKCategory, string> = {
  chat: 'Chat SDK',
  'voice-webrtc': 'Voice WebRTC SDK',
};

export const SDK_CATEGORY_DESCRIPTIONS: Record<SDKCategory, string> = {
  chat: 'Embed AI-powered chat into your applications',
  'voice-webrtc': 'Enable browser-based and in-app voice calls to your AI agents',
};
