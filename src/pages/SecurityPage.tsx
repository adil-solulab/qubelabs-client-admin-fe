import { useState } from 'react';
import {
  Shield,
  FileCheck,
  Eye,
  EyeOff,
  Clock,
  Download,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Globe,
  Lock,
  Trash2,
  Bot,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSecurityData } from '@/hooks/useSecurityData';
import { useToast } from '@/hooks/use-toast';
import type { DataRetentionSettings } from '@/types/security';
import { MODERATION_TYPES, MODERATION_ACTIONS } from '@/types/security';
import { cn } from '@/lib/utils';

export default function SecurityPage() {
  const { toast } = useToast();
  const {
    consentSettings,
    setConsentSettings,
    gdprSettings,
    setGDPRSettings,
    dataRetention,
    setDataRetention,
    moderationRules,
    auditLogs,
    isSaving,
    saveSettings,
    exportAuditLogs,
    toggleModerationRule,
    updateModerationRule,
  } = useSecurityData();

  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [logSearch, setLogSearch] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    const matchesFilter = logFilter === 'all' || log.status === logFilter;
    const matchesSearch =
      log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.resource.toLowerCase().includes(logSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSaveSettings = async () => {
    const result = await saveSettings();
    if (result.success) {
      toast({
        title: 'Settings Saved',
        description: 'Your security settings have been updated successfully.',
      });
    }
  };

  const handleExportLogs = async () => {
    const result = await exportAuditLogs();
    if (result.success) {
      toast({
        title: 'Export Started',
        description: 'Your audit logs are being downloaded.',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security & Compliance</h1>
            <p className="text-sm text-muted-foreground">
              Manage privacy, data protection, and content moderation
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Settings
          </Button>
        </div>

        <Tabs defaultValue="consent" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="consent">Consent</TabsTrigger>
            <TabsTrigger value="gdpr">GDPR</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          </TabsList>

          {/* Consent Management Tab */}
          <TabsContent value="consent" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Consent Management
                </CardTitle>
                <CardDescription>
                  Configure user consent requirements and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Consent Banner */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Consent Banner</p>
                        <p className="text-sm text-muted-foreground">
                          Show cookie consent banner to visitors
                        </p>
                      </div>
                      <Switch
                        checked={consentSettings.consentBannerEnabled}
                        onCheckedChange={(checked) =>
                          setConsentSettings(prev => ({ ...prev, consentBannerEnabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Cookie Consent */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Cookie Consent</p>
                        <p className="text-sm text-muted-foreground">
                          Require cookie consent before tracking
                        </p>
                      </div>
                      <Switch
                        checked={consentSettings.cookieConsent}
                        onCheckedChange={(checked) =>
                          setConsentSettings(prev => ({ ...prev, cookieConsent: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Marketing Consent */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Marketing Consent</p>
                        <p className="text-sm text-muted-foreground">
                          Require opt-in for marketing communications
                        </p>
                      </div>
                      <Switch
                        checked={consentSettings.marketingConsent}
                        onCheckedChange={(checked) =>
                          setConsentSettings(prev => ({ ...prev, marketingConsent: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Analytics Consent */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Analytics Consent</p>
                        <p className="text-sm text-muted-foreground">
                          Require consent for analytics tracking
                        </p>
                      </div>
                      <Switch
                        checked={consentSettings.analyticsConsent}
                        onCheckedChange={(checked) =>
                          setConsentSettings(prev => ({ ...prev, analyticsConsent: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Third Party Sharing */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Third-Party Sharing</p>
                        <p className="text-sm text-muted-foreground">
                          Allow data sharing with third parties
                        </p>
                      </div>
                      <Switch
                        checked={consentSettings.thirdPartySharing}
                        onCheckedChange={(checked) =>
                          setConsentSettings(prev => ({ ...prev, thirdPartySharing: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Consent Expiry */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="mb-3">
                      <p className="font-medium">Consent Expiry</p>
                      <p className="text-sm text-muted-foreground">
                        Days until consent expires: {consentSettings.consentExpiryDays}
                      </p>
                    </div>
                    <Slider
                      value={[consentSettings.consentExpiryDays]}
                      min={30}
                      max={730}
                      step={30}
                      onValueChange={([value]) =>
                        setConsentSettings(prev => ({ ...prev, consentExpiryDays: value }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GDPR Tab */}
          <TabsContent value="gdpr" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  GDPR Controls
                </CardTitle>
                <CardDescription>
                  European data protection compliance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Data Portability */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Data Portability</p>
                        <p className="text-sm text-muted-foreground">
                          Allow users to export their data
                        </p>
                      </div>
                      <Switch
                        checked={gdprSettings.dataPortabilityEnabled}
                        onCheckedChange={(checked) =>
                          setGDPRSettings(prev => ({ ...prev, dataPortabilityEnabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Right to Erasure */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Right to Erasure</p>
                        <p className="text-sm text-muted-foreground">
                          Allow users to delete their data
                        </p>
                      </div>
                      <Switch
                        checked={gdprSettings.rightToErasureEnabled}
                        onCheckedChange={(checked) =>
                          setGDPRSettings(prev => ({ ...prev, rightToErasureEnabled: checked }))
                        }
                      />
                    </div>
                  </div>

                  {/* Data Processing Agreement */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-medium">Data Processing Agreement</p>
                        <p className="text-sm text-muted-foreground">
                          DPA signed with all processors
                        </p>
                      </div>
                      <Badge variant={gdprSettings.dataProcessingAgreement ? 'default' : 'destructive'}>
                        {gdprSettings.dataProcessingAgreement ? 'Active' : 'Missing'}
                      </Badge>
                    </div>
                  </div>

                  {/* Data Residency */}
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <div className="mb-3">
                      <p className="font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Data Residency
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Where your data is stored
                      </p>
                    </div>
                    <Select
                      value={gdprSettings.dataResidency}
                      onValueChange={(value: 'us' | 'eu' | 'asia') =>
                        setGDPRSettings(prev => ({ ...prev, dataResidency: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="eu">European Union</SelectItem>
                        <SelectItem value="asia">Asia Pacific</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* DPO Email */}
                <div className="p-4 rounded-xl border bg-muted/30">
                  <div className="mb-3">
                    <p className="font-medium">Data Protection Officer</p>
                    <p className="text-sm text-muted-foreground">
                      Contact email for GDPR requests
                    </p>
                  </div>
                  <Input
                    type="email"
                    value={gdprSettings.dpoEmail}
                    onChange={(e) =>
                      setGDPRSettings(prev => ({ ...prev, dpoEmail: e.target.value }))
                    }
                    placeholder="dpo@company.com"
                  />
                </div>

                {/* Sub-Processors */}
                <div className="p-4 rounded-xl border bg-muted/30">
                  <div className="mb-3">
                    <p className="font-medium">Authorized Sub-Processors</p>
                    <p className="text-sm text-muted-foreground">
                      Third-party services that process data
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {gdprSettings.subProcessorList.map((processor, i) => (
                      <Badge key={i} variant="secondary">
                        {processor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Masking & Retention Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Data Masking */}
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-primary" />
                    Data Masking
                  </CardTitle>
                  <CardDescription>
                    Automatically mask sensitive data in conversations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'maskPII', label: 'Personal Identifiable Information', desc: 'Names, addresses, IDs' },
                    { key: 'maskCreditCards', label: 'Credit Card Numbers', desc: 'All card formats' },
                    { key: 'maskPhoneNumbers', label: 'Phone Numbers', desc: 'International formats' },
                    { key: 'maskEmails', label: 'Email Addresses', desc: 'All email formats' },
                    { key: 'maskSSN', label: 'Social Security Numbers', desc: 'SSN patterns' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={dataRetention[item.key as keyof DataRetentionSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setDataRetention(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Data Retention */}
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Data Retention
                  </CardTitle>
                  <CardDescription>
                    Configure how long data is stored
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Auto Delete */}
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Auto-Delete Expired Data
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Automatically remove data past retention period
                      </p>
                    </div>
                    <Switch
                      checked={dataRetention.autoDeleteEnabled}
                      onCheckedChange={(checked) =>
                        setDataRetention(prev => ({ ...prev, autoDeleteEnabled: checked }))
                      }
                    />
                  </div>

                  {/* Retention Periods */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">Conversations</p>
                        <span className="text-sm text-muted-foreground">
                          {dataRetention.conversationRetentionDays} days
                        </span>
                      </div>
                      <Slider
                        value={[dataRetention.conversationRetentionDays]}
                        min={30}
                        max={365}
                        step={30}
                        onValueChange={([value]) =>
                          setDataRetention(prev => ({ ...prev, conversationRetentionDays: value }))
                        }
                      />
                    </div>

                    <div className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">System Logs</p>
                        <span className="text-sm text-muted-foreground">
                          {dataRetention.logRetentionDays} days
                        </span>
                      </div>
                      <Slider
                        value={[dataRetention.logRetentionDays]}
                        min={30}
                        max={730}
                        step={30}
                        onValueChange={([value]) =>
                          setDataRetention(prev => ({ ...prev, logRetentionDays: value }))
                        }
                      />
                    </div>

                    <div className="p-4 rounded-lg border bg-muted/30">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">Backups</p>
                        <span className="text-sm text-muted-foreground">
                          {dataRetention.backupRetentionDays} days
                        </span>
                      </div>
                      <Slider
                        value={[dataRetention.backupRetentionDays]}
                        min={90}
                        max={1095}
                        step={90}
                        onValueChange={([value]) =>
                          setDataRetention(prev => ({ ...prev, backupRetentionDays: value }))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Content Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  AI Content Moderation Rules
                </CardTitle>
                <CardDescription>
                  Configure automated content filtering and moderation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moderationRules.map((rule) => {
                    const typeConfig = MODERATION_TYPES[rule.type];
                    const actionConfig = MODERATION_ACTIONS[rule.action];

                    return (
                      <div
                        key={rule.id}
                        className={cn(
                          'p-4 rounded-xl border transition-colors',
                          rule.isActive ? 'bg-muted/30' : 'bg-muted/10 opacity-60'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                              {typeConfig.icon}
                            </div>
                            <div>
                              <p className="font-medium">{rule.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {typeConfig.label}
                              </p>
                            </div>
                          </div>
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => toggleModerationRule(rule.id)}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Action:</Label>
                            <Select
                              value={rule.action}
                              onValueChange={(value) =>
                                updateModerationRule(rule.id, { action: value as any })
                              }
                            >
                              <SelectTrigger className="h-8 w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(MODERATION_ACTIONS).map(([key, config]) => (
                                  <SelectItem key={key} value={key}>
                                    {config.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Severity:</Label>
                            <Select
                              value={rule.severity}
                              onValueChange={(value) =>
                                updateModerationRule(rule.id, { severity: value as any })
                              }
                            >
                              <SelectTrigger className="h-8 w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              rule.severity === 'high' && 'border-destructive text-destructive',
                              rule.severity === 'medium' && 'border-warning text-warning',
                              rule.severity === 'low' && 'border-muted-foreground'
                            )}
                          >
                            {rule.severity}
                          </Badge>
                        </div>

                        {rule.type === 'custom' && rule.customPattern && (
                          <div className="mt-3 p-2 rounded-lg bg-background">
                            <code className="text-xs text-muted-foreground">
                              Pattern: {rule.customPattern}
                            </code>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription>
                      Track all security-relevant activities
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportLogs}>
                    <Download className="w-4 h-4 mr-1" />
                    Export Logs
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search logs..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    {(['all', 'success', 'failure'] as const).map((filter) => (
                      <Button
                        key={filter}
                        variant={logFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLogFilter(filter)}
                      >
                        {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Logs Table */}
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead className="hidden lg:table-cell">Details</TableHead>
                        <TableHead className="hidden md:table-cell">IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{getStatusIcon(log.status)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(log.timestamp)}
                          </TableCell>
                          <TableCell className="font-medium">{log.userName}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-2 py-1 rounded">
                              {log.action}
                            </code>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                            {log.details}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                            {log.ipAddress}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
