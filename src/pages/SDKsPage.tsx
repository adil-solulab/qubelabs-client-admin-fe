import { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  ExternalLink,
  Key,
  RefreshCw,
  MessageSquare,
  Video,
  Download,
  Terminal,
  Eye,
  EyeOff,
  Sparkles,
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
import { useToast } from '@/hooks/use-toast';
import { GenerateCodeModal } from '@/components/sdks/GenerateCodeModal';
import { RegenerateKeyModal } from '@/components/sdks/RegenerateKeyModal';
import type { EmbedWidget, ProjectKey } from '@/types/sdks';
import { SDK_ICONS } from '@/types/sdks';
import { cn } from '@/lib/utils';

export default function SDKsPage() {
  const { toast } = useToast();
  const {
    sdks,
    embedWidgets,
    projectKeys,
    regenerateKey,
  } = useSDKsData();

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
    toast({
      title: 'Copied to clipboard',
      description: 'The content has been copied to your clipboard.',
    });
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
      toast({
        title: 'Key Regenerated',
        description: 'Your new API key has been generated. Update your integrations.',
      });
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

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">SDKs & Deployment</h1>
            <p className="text-sm text-muted-foreground">
              Integrate AI capabilities into your applications
            </p>
          </div>
          <Badge variant="outline" className="w-fit">
            <Sparkles className="w-3 h-3 mr-1" />
            {sdks.length} SDKs Available
          </Badge>
        </div>

        <Tabs defaultValue="sdks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sdks">SDKs</TabsTrigger>
            <TabsTrigger value="embed">Embed Widgets</TabsTrigger>
            <TabsTrigger value="keys">API Keys</TabsTrigger>
          </TabsList>

          {/* SDKs Tab */}
          <TabsContent value="sdks" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sdks.map((sdk) => {
                const icon = SDK_ICONS[sdk.platform];

                return (
                  <Card key={sdk.id} className="gradient-card hover:shadow-md transition-all">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                          {icon}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          v{sdk.version}
                        </Badge>
                      </div>

                      <h3 className="font-semibold mb-1">{sdk.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {sdk.description}
                      </p>

                      <Badge variant="secondary" className="text-[10px] mb-4">
                        {sdk.language}
                      </Badge>

                      {/* Install Command */}
                      <div className="p-3 rounded-lg bg-muted/50 mb-4">
                        <div className="flex items-center justify-between gap-2">
                          <code className="text-xs flex-1 truncate">{sdk.installCommand}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleCopy(sdk.installCommand, sdk.id)}
                          >
                            {copiedId === sdk.id ? (
                              <Check className="w-3 h-3 text-success" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a href={sdk.documentationUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Docs
                          </a>
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Install
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Start Guide */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary" />
                  Quick Start Guide
                </CardTitle>
                <CardDescription>
                  Get started with the Web SDK in 3 steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Install the SDK</p>
                      <div className="mt-2 p-3 rounded-lg bg-muted/50">
                        <code className="text-xs">npm install @company/ai-sdk</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Initialize with your API key</p>
                      <div className="mt-2 p-3 rounded-lg bg-muted/50">
                        <pre className="text-xs">
{`import { AIClient } from '@company/ai-sdk';

const client = new AIClient({
  apiKey: '${productionPublishableKey || 'YOUR_API_KEY'}'
});`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Start a conversation</p>
                      <div className="mt-2 p-3 rounded-lg bg-muted/50">
                        <pre className="text-xs">
{`const response = await client.chat({
  message: 'Hello, how can I help?',
  agentId: 'your-agent-id'
});`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Embed Widgets Tab */}
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
                            <MessageSquare className={cn('w-6 h-6', widget.type === 'chat' ? 'text-primary' : 'text-purple-500')} />
                          ) : (
                            <Video className="w-6 h-6 text-purple-500" />
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
                    {/* Preview Code */}
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

            {/* Integration Tips */}
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
                    <Video className="w-8 h-8 text-purple-500 mb-3" />
                    <h4 className="font-medium mb-1">WebRTC Widget</h4>
                    <p className="text-sm text-muted-foreground">
                      Ensure HTTPS is enabled. WebRTC requires secure contexts for media access.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
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

                {/* Key Usage Notes */}
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

      {/* Modals */}
      <GenerateCodeModal
        widget={selectedWidget}
        publishableKey={productionPublishableKey}
        open={generateModalOpen}
        onOpenChange={setGenerateModalOpen}
        onCopy={() => {
          toast({
            title: 'Copied to clipboard',
            description: 'The embed code has been copied to your clipboard.',
          });
        }}
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
