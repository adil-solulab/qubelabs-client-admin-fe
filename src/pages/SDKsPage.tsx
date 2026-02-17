import { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  Key,
  RefreshCw,
  MessageSquare,
  Phone,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  Settings2,
  ChevronRight,
  Video,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSDKsData } from '@/hooks/useSDKsData';
import { notify } from '@/hooks/useNotification';
import { GenerateCodeModal } from '@/components/sdks/GenerateCodeModal';
import { RegenerateKeyModal } from '@/components/sdks/RegenerateKeyModal';
import { WebRTCConfigurator } from '@/components/sdks/WebRTCConfigurator';
import type { EmbedWidget, ProjectKey, SDKCategory } from '@/types/sdks';
import { SDK_ICONS, SDK_CATEGORY_LABELS, SDK_CATEGORY_DESCRIPTIONS } from '@/types/sdks';
import { cn } from '@/lib/utils';

type ViewMode = 'listing' | 'webrtc-config';

const CATEGORY_ICONS: Record<SDKCategory, React.ElementType> = {
  chat: MessageSquare,
  'voice-webrtc': Phone,
};

const CATEGORY_COLORS: Record<SDKCategory, string> = {
  chat: 'from-blue-500 to-cyan-500',
  'voice-webrtc': 'from-indigo-500 to-purple-500',
};

export default function SDKsPage() {
  const {
    sdks,
    embedWidgets,
    projectKeys,
    regenerateKey,
  } = useSDKsData();

  const [viewMode, setViewMode] = useState<ViewMode>('listing');
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<EmbedWidget | null>(null);
  const [selectedKey, setSelectedKey] = useState<ProjectKey | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const productionPublishableKey = projectKeys.find(
    k => k.type === 'publishable' && k.environment === 'production'
  )?.key || '';

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    notify.copied();
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateCode = (widget: EmbedWidget) => {
    setSelectedWidget(widget);
    setGenerateModalOpen(true);
  };

  const handleRegenerateKey = (key: ProjectKey) => {
    setSelectedKey(key);
    setRegenerateModalOpen(true);
  };

  const handleRegenerate = async (keyId: string) => {
    const result = await regenerateKey(keyId);
    if (result.success) {
      notify.success('Key regenerated', 'Your new API key has been generated. Update your integrations.');
    } else {
      notify.error('Regeneration failed', 'Could not regenerate the key. Please try again.');
    }
    return result;
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskKey = (key: string, isVisible: boolean) => {
    if (isVisible) return key;
    return key.substring(0, 7) + '••••••••••••••••••••';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const categories: SDKCategory[] = ['chat', 'voice-webrtc'];

  if (viewMode === 'webrtc-config') {
    return (
      <AppLayout>
        <WebRTCConfigurator onBack={() => setViewMode('listing')} />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SDKs & Deployment</h1>
            <p className="text-sm text-muted-foreground">
              Integrate AI capabilities into your applications across all platforms
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {sdks.length} SDKs
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
              4 Platforms
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="sdks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sdks">SDKs</TabsTrigger>
            <TabsTrigger value="embed">Embed Widgets</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
          </TabsList>

          <TabsContent value="sdks" className="space-y-8">
            {categories.map(category => {
              const CategoryIcon = CATEGORY_ICONS[category];
              const categorySdks = sdks.filter(s => s.category === category);

              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                        CATEGORY_COLORS[category]
                      )}>
                        <CategoryIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold">{SDK_CATEGORY_LABELS[category]}</h2>
                        <p className="text-xs text-muted-foreground">{SDK_CATEGORY_DESCRIPTIONS[category]}</p>
                      </div>
                    </div>
                    {category === 'voice-webrtc' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewMode('webrtc-config')}
                        className="gap-1.5"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        Configure Widget
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {categorySdks.map(sdk => {
                      const icon = SDK_ICONS[sdk.platform];
                      return (
                        <Card key={sdk.id} className="gradient-card hover:shadow-md transition-all group">
                          <CardContent className="pt-5 pb-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="w-11 h-11 rounded-xl bg-muted/50 border flex items-center justify-center text-xl">
                                {icon}
                              </div>
                              <Badge variant="outline" className="text-[10px]">
                                v{sdk.version}
                              </Badge>
                            </div>

                            <h3 className="font-semibold text-sm mb-1">{sdk.name}</h3>
                            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                              {sdk.description}
                            </p>

                            <Badge variant="secondary" className="text-[10px] mb-3">
                              {sdk.language}
                            </Badge>

                            <div className="p-2.5 rounded-lg bg-muted/50 mb-3">
                              <div className="flex items-center justify-between gap-2">
                                <code className="text-[10px] flex-1 truncate">{sdk.installCommand}</code>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 flex-shrink-0"
                                  onClick={() => handleCopy(sdk.installCommand, sdk.id)}
                                >
                                  {copiedId === sdk.id ? (
                                    <Check className="w-2.5 h-2.5 text-success" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
                                <a href={sdk.documentationUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Docs
                                </a>
                              </Button>
                              <Button size="sm" className="flex-1 text-xs">
                                <Download className="w-3 h-3 mr-1" />
                                Install
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="embed" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {embedWidgets.map((widget) => (
                <Card key={widget.id} className="gradient-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center',
                          widget.type === 'chat' ? 'bg-primary/10' : 'bg-purple-500/10'
                        )}>
                          {widget.type === 'chat' ? (
                            <MessageSquare className="w-6 h-6 text-primary" />
                          ) : (
                            <Phone className="w-6 h-6 text-purple-500" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base font-medium">{widget.name}</CardTitle>
                          <CardDescription>{widget.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">
                        {widget.type.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <pre className="p-4 rounded-xl bg-muted/50 border text-xs overflow-x-auto max-h-[150px]">
                        <code>{widget.embedCode.substring(0, 200)}...</code>
                      </pre>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCopy(widget.embedCode, widget.id)}
                      >
                        {copiedId === widget.id ? (
                          <Check className="w-4 h-4 mr-2 text-success" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copy Code
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleGenerateCode(widget)}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        Generate Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium">Integration Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <MessageSquare className="w-8 h-8 text-primary mb-3" />
                    <h4 className="font-medium mb-1">Chat Widget</h4>
                    <p className="text-sm text-muted-foreground">
                      Place the embed code just before the closing &lt;/body&gt; tag for optimal loading.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <Phone className="w-8 h-8 text-purple-500 mb-3" />
                    <h4 className="font-medium mb-1">WebRTC Widget</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensure HTTPS is enabled. WebRTC requires secure contexts for media access.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" />
                      Project API Keys
                    </CardTitle>
                    <CardDescription>
                      Manage your publishable and secret keys for each environment
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="font-medium">{key.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {maskKey(key.key, visibleKeys.has(key.id))}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleKeyVisibility(key.id)}
                            >
                              {visibleKeys.has(key.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopy(key.key, key.id)}
                            >
                              {copiedId === key.id ? (
                                <Check className="w-3 h-3 text-success" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={key.type === 'secret' ? 'destructive' : 'secondary'}
                            className="text-[10px]"
                          >
                            {key.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={key.environment === 'production' ? 'default' : 'outline'}
                            className="text-[10px]"
                          >
                            {key.environment}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(key.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRegenerateKey(key)}
                          >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            Regenerate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <Badge variant="secondary" className="mb-2">Publishable Keys</Badge>
                    <p className="text-sm text-muted-foreground">
                      Safe to use in client-side code. Used for initializing widgets and SDKs.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border bg-destructive/5 border-destructive/20">
                    <Badge variant="destructive" className="mb-2">Secret Keys</Badge>
                    <p className="text-sm text-muted-foreground">
                      Keep secure! Only use in server-side code. Never expose in client applications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <GenerateCodeModal
        widget={selectedWidget}
        publishableKey={productionPublishableKey}
        open={generateModalOpen}
        onOpenChange={setGenerateModalOpen}
        onCopy={(_code: string) => notify.copied()}
      />

      <RegenerateKeyModal
        projectKey={selectedKey}
        open={regenerateModalOpen}
        onOpenChange={setRegenerateModalOpen}
        onRegenerate={handleRegenerate}
      />
    </AppLayout>
  );
}
