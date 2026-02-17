import { useState, useCallback } from 'react';
import type { SDK, EmbedWidget, ProjectKey } from '@/types/sdks';

const mockSDKs: SDK[] = [
  {
    id: 'chat-web',
    platform: 'web',
    category: 'chat',
    name: 'Chat SDK for Web',
    description: 'JavaScript/TypeScript SDK for embedding AI chat in web applications',
    version: '2.4.1',
    installCommand: 'npm install @conx/chat-sdk',
    documentationUrl: 'https://docs.conx.ai/sdk/chat/web',
    icon: 'web',
    language: 'JavaScript / TypeScript',
  },
  {
    id: 'chat-ios',
    platform: 'ios',
    category: 'chat',
    name: 'Chat SDK for iOS',
    description: 'Swift SDK for embedding AI chat in iOS applications',
    version: '1.8.0',
    installCommand: 'pod install ConXChatSDK',
    documentationUrl: 'https://docs.conx.ai/sdk/chat/ios',
    icon: 'ios',
    language: 'Swift',
  },
  {
    id: 'chat-android',
    platform: 'android',
    category: 'chat',
    name: 'Chat SDK for Android',
    description: 'Kotlin SDK for embedding AI chat in Android applications',
    version: '1.6.2',
    installCommand: "implementation 'ai.conx:chat-sdk:1.6.2'",
    documentationUrl: 'https://docs.conx.ai/sdk/chat/android',
    icon: 'android',
    language: 'Kotlin',
  },
  {
    id: 'chat-react-native',
    platform: 'react-native',
    category: 'chat',
    name: 'Chat SDK for React Native',
    description: 'React Native SDK for embedding AI chat in cross-platform mobile apps',
    version: '1.5.0',
    installCommand: 'npm install @conx/chat-sdk-react-native',
    documentationUrl: 'https://docs.conx.ai/sdk/chat/react-native',
    icon: 'react-native',
    language: 'React Native (JS/TS)',
  },
  {
    id: 'webrtc-web',
    platform: 'web',
    category: 'voice-webrtc',
    name: 'Voice WebRTC SDK for Web',
    description: 'JavaScript/TypeScript SDK for browser-based voice calls to AI agents',
    version: '1.2.0',
    installCommand: 'npm install @conx/webrtc-sdk',
    documentationUrl: 'https://docs.conx.ai/sdk/webrtc/web',
    icon: 'web',
    language: 'JavaScript / TypeScript',
  },
  {
    id: 'webrtc-ios',
    platform: 'ios',
    category: 'voice-webrtc',
    name: 'Voice WebRTC SDK for iOS',
    description: 'Swift SDK for in-app voice calls to AI agents on iOS',
    version: '1.1.0',
    installCommand: 'pod install ConXWebRTCSDK',
    documentationUrl: 'https://docs.conx.ai/sdk/webrtc/ios',
    icon: 'ios',
    language: 'Swift',
  },
  {
    id: 'webrtc-android',
    platform: 'android',
    category: 'voice-webrtc',
    name: 'Voice WebRTC SDK for Android',
    description: 'Kotlin SDK for in-app voice calls to AI agents on Android',
    version: '1.0.3',
    installCommand: "implementation 'ai.conx:webrtc-sdk:1.0.3'",
    documentationUrl: 'https://docs.conx.ai/sdk/webrtc/android',
    icon: 'android',
    language: 'Kotlin',
  },
  {
    id: 'webrtc-react-native',
    platform: 'react-native',
    category: 'voice-webrtc',
    name: 'Voice WebRTC SDK for React Native',
    description: 'React Native SDK for in-app voice calls to AI agents',
    version: '1.0.1',
    installCommand: 'npm install @conx/webrtc-sdk-react-native',
    documentationUrl: 'https://docs.conx.ai/sdk/webrtc/react-native',
    icon: 'react-native',
    language: 'React Native (JS/TS)',
  },
];

const mockEmbedWidgets: EmbedWidget[] = [
  {
    id: 'widget-chat',
    name: 'Chat Widget',
    type: 'chat',
    description: 'Embeddable chat widget for customer support',
    embedCode: `<!-- ConX Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AIChat']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aichat','https://cdn.conx.ai/chat.js'));
  aichat('init', { 
    projectKey: 'YOUR_PROJECT_KEY',
    theme: 'light',
    position: 'bottom-right'
  });
</script>`,
    customizable: true,
  },
  {
    id: 'widget-webrtc',
    name: 'WebRTC Calling Widget',
    type: 'webrtc',
    description: 'Voice calling widget with WebRTC',
    embedCode: `<!-- ConX WebRTC Calling Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AICall']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aicall','https://cdn.conx.ai/call.js'));
  aicall('init', { 
    projectKey: 'YOUR_PROJECT_KEY',
    enableVoice: true
  });
</script>`,
    customizable: true,
  },
];

const mockProjectKeys: ProjectKey[] = [
  {
    id: 'key-pub-prod',
    name: 'Production Publishable Key',
    key: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
    type: 'publishable',
    environment: 'production',
    createdAt: '2025-01-01T00:00:00Z',
    lastUsed: '2025-02-02T10:30:00Z',
  },
  {
    id: 'key-pub-dev',
    name: 'Development Publishable Key',
    key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
    type: 'publishable',
    environment: 'development',
    createdAt: '2025-01-01T00:00:00Z',
    lastUsed: '2025-02-01T14:20:00Z',
  },
  {
    id: 'key-sec-prod',
    name: 'Production Secret Key',
    key: 'sk_live_xxxxxxxxxxxxxxxxxxxxxxxx',
    type: 'secret',
    environment: 'production',
    createdAt: '2025-01-01T00:00:00Z',
    lastUsed: '2025-02-02T08:15:00Z',
  },
  {
    id: 'key-sec-dev',
    name: 'Development Secret Key',
    key: 'sk_test_xxxxxxxxxxxxxxxxxxxxxxxx',
    type: 'secret',
    environment: 'development',
    createdAt: '2025-01-01T00:00:00Z',
  },
];

export function useSDKsData() {
  const [sdks] = useState<SDK[]>(mockSDKs);
  const [embedWidgets] = useState<EmbedWidget[]>(mockEmbedWidgets);
  const [projectKeys, setProjectKeys] = useState<ProjectKey[]>(mockProjectKeys);

  const regenerateKey = useCallback(async (keyId: string): Promise<{ success: boolean; newKey: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newKeyValue = `${keyId.includes('pub') ? 'pk' : 'sk'}_${keyId.includes('prod') ? 'live' : 'test'}_${Math.random().toString(36).substring(2, 26)}`;
    
    setProjectKeys(prev => prev.map(key =>
      key.id === keyId
        ? { ...key, key: newKeyValue, createdAt: new Date().toISOString() }
        : key
    ));

    return { success: true, newKey: newKeyValue };
  }, []);

  const getEmbedCodeWithKey = useCallback((widget: EmbedWidget, publishableKey: string): string => {
    return widget.embedCode.replace('YOUR_PROJECT_KEY', publishableKey);
  }, []);

  return {
    sdks,
    embedWidgets,
    projectKeys,
    regenerateKey,
    getEmbedCodeWithKey,
  };
}
