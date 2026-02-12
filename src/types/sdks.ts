export type SDKPlatform = 'web';

export interface SDK {
  id: string;
  platform: SDKPlatform;
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
};

export const SDK_LANGUAGES: Record<SDKPlatform, string> = {
  web: 'JavaScript/TypeScript',
};
