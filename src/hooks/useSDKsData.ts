import { useState, useCallback } from 'react';
import type { SDK, EmbedWidget, ProjectKey, SDKPlatform } from '@/types/sdks';

const mockSDKs: SDK[] = [
  {
    id: 'sdk-web',
    platform: 'web',
    name: 'Web SDK',
    description: 'JavaScript/TypeScript SDK for web applications',
    version: '2.4.1',
    installCommand: 'npm install @company/ai-sdk',
    documentationUrl: 'https://docs.example.com/sdk/web',
    icon: 'web',
    language: 'JavaScript/TypeScript',
  },
  {
    id: 'sdk-android',
    platform: 'android',
    name: 'Android SDK',
    description: 'Native Android SDK for mobile applications',
    version: '2.3.0',
    installCommand: "implementation 'com.company:ai-sdk:2.3.0'",
    documentationUrl: 'https://docs.example.com/sdk/android',
    icon: 'android',
    language: 'Kotlin/Java',
  },
  {
    id: 'sdk-ios',
    platform: 'ios',
    name: 'iOS SDK',
    description: 'Native iOS SDK for Apple devices',
    version: '2.3.0',
    installCommand: "pod 'CompanyAISDK', '~> 2.3.0'",
    documentationUrl: 'https://docs.example.com/sdk/ios',
    icon: 'ios',
    language: 'Swift',
  },
  {
    id: 'sdk-flutter',
    platform: 'flutter',
    name: 'Flutter SDK',
    description: 'Cross-platform SDK for Flutter apps',
    version: '2.2.0',
    installCommand: 'flutter pub add company_ai_sdk',
    documentationUrl: 'https://docs.example.com/sdk/flutter',
    icon: 'flutter',
    language: 'Dart',
  },
  {
    id: 'sdk-react-native',
    platform: 'react-native',
    name: 'React Native SDK',
    description: 'Cross-platform SDK for React Native apps',
    version: '2.4.0',
    installCommand: 'npm install @company/ai-sdk-react-native',
    documentationUrl: 'https://docs.example.com/sdk/react-native',
    icon: 'react-native',
    language: 'JavaScript/TypeScript',
  },
];

const mockEmbedWidgets: EmbedWidget[] = [
  {
    id: 'widget-chat',
    name: 'Chat Widget',
    type: 'chat',
    description: 'Embeddable chat widget for customer support',
    embedCode: `<!-- AI Chat Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AIChat']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aichat','https://cdn.example.com/chat.js'));
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
    description: 'Voice and video calling widget with WebRTC',
    embedCode: `<!-- WebRTC Calling Widget -->
<script>
  (function(w,d,s,o,f,js,fjs){
    w['AICall']=o;w[o]=w[o]||function(){
    (w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','aicall','https://cdn.example.com/call.js'));
  aicall('init', { 
    projectKey: 'YOUR_PROJECT_KEY',
    enableVideo: true,
    enableScreenShare: true
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
