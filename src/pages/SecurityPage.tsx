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
  KeyRound,
  Users,
  Fingerprint,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Plus,
  X,
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
import { notify } from '@/hooks/useNotification';
import type { DataRetentionSettings } from '@/types/security';
import { MODERATION_TYPES, MODERATION_ACTIONS, SSO_PROVIDERS } from '@/types/security';
import { cn } from '@/lib/utils';

export default function SecurityPage() {
  const {
    consentSettings,
    setConsentSettings,
    gdprSettings,
    setGDPRSettings,
    dataRetention,
    setDataRetention,
    zeroRetention,
    setZeroRetention,
    ssoSettings,
    setSSOSettings,
    rbacSettings,
    setRBACSettings,
    piiProtection,
    setPIIProtection,
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
  const [newIP, setNewIP] = useState('');
  const [newDomain, setNewDomain] = useState('');

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
      notify.saved('Security settings');
    } else {
      notify.error('Save failed', 'Could not save security settings.');
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportLogs = async () => {
    setIsExporting(true);
    const result = await exportAuditLogs();
    setIsExporting(false);
    if (result.success) {
      notify.success('Export started', 'Your audit logs are being downloaded.');
    } else {
      notify.error('Export failed', 'Could not export audit logs.');
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

  const addIP = () => {
    if (newIP.trim() && !rbacSettings.allowedIPs.includes(newIP.trim())) {
      setRBACSettings(prev => ({ ...prev, allowedIPs: [...prev.allowedIPs, newIP.trim()] }));
      setNewIP('');
    }
  };

  const removeIP = (ip: string) => {
    setRBACSettings(prev => ({ ...prev, allowedIPs: prev.allowedIPs.filter(i => i !== ip) }));
  };

  const addDomain = () => {
    if (newDomain.trim() && !ssoSettings.domains.includes(newDomain.trim())) {
      setSSOSettings(prev => ({ ...prev, domains: [...prev.domains, newDomain.trim()] }));
      setNewDomain('');
    }
  };

  const removeDomain = (domain: string) => {
    setSSOSettings(prev => ({ ...prev, domains: prev.domains.filter(d => d !== domain) }));
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Security & Compliance</h1>
            <p className="text-sm text-muted-foreground">
              Manage authentication, access control, privacy, and content moderation
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

        <Tabs defaultValue="compliance" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl">
            <TabsTrigger value="compliance" className="gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="sso" className="gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SSO</span>
            </TabsTrigger>
            <TabsTrigger value="rbac" className="gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RBAC</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Moderation</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Audit Logs</span>
            </TabsTrigger>
          </TabsList>

          {/* ========== COMPLIANCE TAB ========== */}
          <TabsContent value="compliance" className="space-y-6">
            {/* PII Protection */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  PII Protection
                </CardTitle>
                <CardDescription>
                  Automatically detect and protect personally identifiable information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">Enable PII Protection</p>
                      <p className="text-xs text-muted-foreground">Detect and handle PII in conversations</p>
                    </div>
                    <Switch
                      checked={piiProtection.enabled}
                      onCheckedChange={(checked) => setPIIProtection(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">Auto-Detect PII</p>
                      <p className="text-xs text-muted-foreground">Use AI to find PII automatically</p>
                    </div>
                    <Switch
                      checked={piiProtection.autoDetect}
                      onCheckedChange={(checked) => setPIIProtection(prev => ({ ...prev, autoDetect: checked }))}
                    />
                  </div>
                </div>

                {piiProtection.enabled && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { key: 'names', label: 'Names', desc: 'Full names and identities' },
                        { key: 'emails', label: 'Email Addresses', desc: 'All email formats' },
                        { key: 'phones', label: 'Phone Numbers', desc: 'International formats' },
                        { key: 'addresses', label: 'Physical Addresses', desc: 'Street and mailing addresses' },
                        { key: 'ssn', label: 'Social Security Numbers', desc: 'SSN patterns' },
                        { key: 'creditCards', label: 'Credit Card Numbers', desc: 'All card formats' },
                        { key: 'dateOfBirth', label: 'Date of Birth', desc: 'DOB patterns' },
                        { key: 'medicalRecords', label: 'Medical Records', desc: 'HIPAA-protected data' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch
                            checked={piiProtection.detectionTypes[item.key as keyof typeof piiProtection.detectionTypes]}
                            onCheckedChange={(checked) =>
                              setPIIProtection(prev => ({
                                ...prev,
                                detectionTypes: { ...prev.detectionTypes, [item.key]: checked },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <Label className="text-sm font-medium mb-2 block">Action on Detection</Label>
                        <Select
                          value={piiProtection.action}
                          onValueChange={(value: 'redact' | 'mask' | 'hash' | 'tokenize') =>
                            setPIIProtection(prev => ({ ...prev, action: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="redact">Redact (Remove)</SelectItem>
                            <SelectItem value="mask">Mask (Replace with ***)</SelectItem>
                            <SelectItem value="hash">Hash (One-way encrypt)</SelectItem>
                            <SelectItem value="tokenize">Tokenize (Reversible)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">Notify on Detection</p>
                            <p className="text-xs text-muted-foreground">Alert admins</p>
                          </div>
                          <Switch
                            checked={piiProtection.notifyOnDetection}
                            onCheckedChange={(checked) =>
                              setPIIProtection(prev => ({ ...prev, notifyOnDetection: checked }))
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">Log Detections</p>
                            <p className="text-xs text-muted-foreground">Record in audit log</p>
                          </div>
                          <Switch
                            checked={piiProtection.logDetections}
                            onCheckedChange={(checked) =>
                              setPIIProtection(prev => ({ ...prev, logDetections: checked }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Zero Retention Policy */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Ban className="w-5 h-5 text-primary" />
                  Zero Retention Policy
                </CardTitle>
                <CardDescription>
                  Process data in real-time without storing it permanently
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div>
                    <p className="font-medium text-sm">Enable Zero Retention</p>
                    <p className="text-xs text-muted-foreground">Data is processed but never stored on disk</p>
                  </div>
                  <Switch
                    checked={zeroRetention.enabled}
                    onCheckedChange={(checked) => setZeroRetention(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                {zeroRetention.enabled && (
                  <>
                    <div className="p-3 rounded-lg border bg-destructive/5 border-destructive/20">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-destructive">
                          Zero Retention mode will prevent data from being stored. Analytics and historical reporting will be limited. This cannot be undone for data processed during this period.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/30">
                      <Label className="text-sm font-medium mb-2 block">Retention Scope</Label>
                      <Select
                        value={zeroRetention.scope}
                        onValueChange={(value: 'all' | 'pii_only' | 'conversations_only') =>
                          setZeroRetention(prev => ({ ...prev, scope: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Data</SelectItem>
                          <SelectItem value="pii_only">PII Data Only</SelectItem>
                          <SelectItem value="conversations_only">Conversations Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">Real-Time Only</p>
                          <p className="text-xs text-muted-foreground">Process in memory</p>
                        </div>
                        <Switch
                          checked={zeroRetention.realTimeProcessingOnly}
                          onCheckedChange={(checked) =>
                            setZeroRetention(prev => ({ ...prev, realTimeProcessingOnly: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">No Logs Mode</p>
                          <p className="text-xs text-muted-foreground">Suppress all logs</p>
                        </div>
                        <Switch
                          checked={zeroRetention.noLogsMode}
                          onCheckedChange={(checked) =>
                            setZeroRetention(prev => ({ ...prev, noLogsMode: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">Preserve Audit Logs</p>
                          <p className="text-xs text-muted-foreground">Keep audit trail even with zero retention</p>
                        </div>
                        <Switch
                          checked={zeroRetention.excludeAuditLogs}
                          onCheckedChange={(checked) =>
                            setZeroRetention(prev => ({ ...prev, excludeAuditLogs: checked }))
                          }
                        />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Consent & GDPR - collapsed into summary cards */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-primary" />
                    Consent Management
                  </CardTitle>
                  <CardDescription>Configure user consent requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: 'consentBannerEnabled', label: 'Consent Banner', desc: 'Show cookie consent banner' },
                    { key: 'cookieConsent', label: 'Cookie Consent', desc: 'Require consent before tracking' },
                    { key: 'marketingConsent', label: 'Marketing Consent', desc: 'Opt-in for marketing' },
                    { key: 'analyticsConsent', label: 'Analytics Consent', desc: 'Consent for analytics' },
                    { key: 'thirdPartySharing', label: 'Third-Party Sharing', desc: 'Allow data sharing' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={consentSettings[item.key as keyof typeof consentSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setConsentSettings(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">Consent Expiry</p>
                      <span className="text-sm text-muted-foreground">{consentSettings.consentExpiryDays} days</span>
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
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    GDPR Controls
                  </CardTitle>
                  <CardDescription>European data protection compliance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">Data Portability</p>
                      <p className="text-xs text-muted-foreground">Allow users to export data</p>
                    </div>
                    <Switch
                      checked={gdprSettings.dataPortabilityEnabled}
                      onCheckedChange={(checked) =>
                        setGDPRSettings(prev => ({ ...prev, dataPortabilityEnabled: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">Right to Erasure</p>
                      <p className="text-xs text-muted-foreground">Allow users to delete data</p>
                    </div>
                    <Switch
                      checked={gdprSettings.rightToErasureEnabled}
                      onCheckedChange={(checked) =>
                        setGDPRSettings(prev => ({ ...prev, rightToErasureEnabled: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">Data Processing Agreement</p>
                      <p className="text-xs text-muted-foreground">DPA signed with processors</p>
                    </div>
                    <Badge variant={gdprSettings.dataProcessingAgreement ? 'default' : 'destructive'}>
                      {gdprSettings.dataProcessingAgreement ? 'Active' : 'Missing'}
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <Label className="text-sm font-medium mb-2 block">Data Residency</Label>
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
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <Label className="text-sm font-medium mb-2 block">DPO Email</Label>
                    <Input
                      type="email"
                      value={gdprSettings.dpoEmail}
                      onChange={(e) => setGDPRSettings(prev => ({ ...prev, dpoEmail: e.target.value }))}
                      placeholder="dpo@company.com"
                    />
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/30">
                    <p className="text-sm font-medium mb-2">Sub-Processors</p>
                    <div className="flex flex-wrap gap-2">
                      {gdprSettings.subProcessorList.map((processor, i) => (
                        <Badge key={i} variant="secondary">{processor}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Retention & Masking */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-primary" />
                    Data Masking
                  </CardTitle>
                  <CardDescription>Mask sensitive data in conversations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { key: 'maskPII', label: 'PII', desc: 'Names, addresses, IDs' },
                    { key: 'maskCreditCards', label: 'Credit Cards', desc: 'All card formats' },
                    { key: 'maskPhoneNumbers', label: 'Phone Numbers', desc: 'International formats' },
                    { key: 'maskEmails', label: 'Email Addresses', desc: 'All email formats' },
                    { key: 'maskSSN', label: 'SSN', desc: 'SSN patterns' },
                  ].map(item => (
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

              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Data Retention
                  </CardTitle>
                  <CardDescription>How long data is stored</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Auto-Delete Expired
                      </p>
                      <p className="text-xs text-muted-foreground">Remove data past retention period</p>
                    </div>
                    <Switch
                      checked={dataRetention.autoDeleteEnabled}
                      onCheckedChange={(checked) =>
                        setDataRetention(prev => ({ ...prev, autoDeleteEnabled: checked }))
                      }
                    />
                  </div>
                  {(() => {
                    const minBackupDays = Math.max(dataRetention.conversationRetentionDays, dataRetention.logRetentionDays);
                    const backupStep = 30;
                    const minBackupValue = minBackupDays + backupStep;
                    return (
                      <>
                        {[
                          { key: 'conversationRetentionDays', label: 'Conversations', min: 30, max: 365, step: 30 },
                          { key: 'logRetentionDays', label: 'System Logs', min: 30, max: 730, step: 30 },
                        ].map(item => (
                          <div key={item.key} className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium">{item.label}</p>
                              <span className="text-sm text-muted-foreground">
                                {dataRetention[item.key as keyof DataRetentionSettings] as number} days
                              </span>
                            </div>
                            <Slider
                              value={[dataRetention[item.key as keyof DataRetentionSettings] as number]}
                              min={item.min}
                              max={item.max}
                              step={item.step}
                              onValueChange={([value]) => {
                                setDataRetention(prev => {
                                  const updated = { ...prev, [item.key]: value };
                                  const newMin = Math.max(updated.conversationRetentionDays, updated.logRetentionDays);
                                  const newMinBackup = newMin + backupStep;
                                  if (updated.backupRetentionDays < newMinBackup) {
                                    updated.backupRetentionDays = newMinBackup;
                                  }
                                  return updated;
                                });
                              }}
                            />
                          </div>
                        ))}
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">Backups</p>
                            <span className="text-sm text-muted-foreground">
                              {dataRetention.backupRetentionDays} days
                            </span>
                          </div>
                          <Slider
                            value={[Math.max(dataRetention.backupRetentionDays, minBackupValue)]}
                            min={minBackupValue}
                            max={1825}
                            step={backupStep}
                            onValueChange={([value]) => {
                              const clamped = Math.max(value, minBackupValue);
                              setDataRetention(prev => ({ ...prev, backupRetentionDays: clamped }));
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must be greater than conversations ({dataRetention.conversationRetentionDays} days) and logs ({dataRetention.logRetentionDays} days)
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ========== SSO TAB ========== */}
          <TabsContent value="sso" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Single Sign-On (SSO)
                </CardTitle>
                <CardDescription>
                  Configure SSO to allow users to authenticate with your identity provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div>
                    <p className="font-medium">Enable SSO</p>
                    <p className="text-sm text-muted-foreground">Allow sign-in through your identity provider</p>
                  </div>
                  <Switch
                    checked={ssoSettings.enabled}
                    onCheckedChange={(checked) => setSSOSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                {ssoSettings.enabled && (
                  <>
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <Label className="text-sm font-medium mb-3 block">Identity Provider</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(SSO_PROVIDERS).filter(([key]) => key !== 'none').map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => setSSOSettings(prev => ({ ...prev, provider: key as any }))}
                            className={cn(
                              'p-3 rounded-lg border text-left transition-all',
                              ssoSettings.provider === key
                                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                                : 'hover:border-primary/50 bg-muted/30'
                            )}
                          >
                            <span className="text-lg mr-2">{config.icon}</span>
                            <span className="text-sm font-medium">{config.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Entity ID / Issuer</Label>
                        <Input
                          value={ssoSettings.entityId}
                          onChange={(e) => setSSOSettings(prev => ({ ...prev, entityId: e.target.value }))}
                          placeholder="https://idp.company.com/entity"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">SSO Login URL</Label>
                        <Input
                          value={ssoSettings.ssoUrl}
                          onChange={(e) => setSSOSettings(prev => ({ ...prev, ssoUrl: e.target.value }))}
                          placeholder="https://idp.company.com/sso/login"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">X.509 Certificate</Label>
                      <textarea
                        className="w-full min-h-[80px] p-3 rounded-lg border bg-background text-sm font-mono resize-y"
                        value={ssoSettings.certificate}
                        onChange={(e) => setSSOSettings(prev => ({ ...prev, certificate: e.target.value }))}
                        placeholder="-----BEGIN CERTIFICATE-----&#10;Paste your certificate here...&#10;-----END CERTIFICATE-----"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">Enforce SSO</p>
                          <p className="text-xs text-muted-foreground">Require SSO for all users</p>
                        </div>
                        <Switch
                          checked={ssoSettings.enforceSSO}
                          onCheckedChange={(checked) => setSSOSettings(prev => ({ ...prev, enforceSSO: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">Password Fallback</p>
                          <p className="text-xs text-muted-foreground">Allow email/password login</p>
                        </div>
                        <Switch
                          checked={ssoSettings.allowPasswordFallback}
                          onCheckedChange={(checked) =>
                            setSSOSettings(prev => ({ ...prev, allowPasswordFallback: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="font-medium text-sm">Auto-Provision Users</p>
                          <p className="text-xs text-muted-foreground">Create accounts on first login</p>
                        </div>
                        <Switch
                          checked={ssoSettings.autoProvision}
                          onCheckedChange={(checked) =>
                            setSSOSettings(prev => ({ ...prev, autoProvision: checked }))
                          }
                        />
                      </div>
                      <div className="p-3 rounded-lg border bg-muted/30">
                        <Label className="text-sm font-medium mb-2 block">Default Role</Label>
                        <Select
                          value={ssoSettings.defaultRole}
                          onValueChange={(value: 'agent' | 'supervisor' | 'client_admin') =>
                            setSSOSettings(prev => ({ ...prev, defaultRole: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="client_admin">Client Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border bg-muted/30">
                      <Label className="text-sm font-medium mb-3 block">Allowed Email Domains</Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {ssoSettings.domains.map((domain) => (
                          <Badge key={domain} variant="secondary" className="gap-1 pr-1">
                            {domain}
                            <button
                              onClick={() => removeDomain(domain)}
                              className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          placeholder="example.com"
                          onKeyDown={(e) => e.key === 'Enter' && addDomain()}
                        />
                        <Button variant="outline" size="sm" onClick={addDomain}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border bg-muted/30">
                      <div className="flex justify-between mb-2">
                        <p className="text-sm font-medium">Session Timeout</p>
                        <span className="text-sm text-muted-foreground">{ssoSettings.sessionTimeout} min</span>
                      </div>
                      <Slider
                        value={[ssoSettings.sessionTimeout]}
                        min={15}
                        max={1440}
                        step={15}
                        onValueChange={([value]) => setSSOSettings(prev => ({ ...prev, sessionTimeout: value }))}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== RBAC TAB ========== */}
          <TabsContent value="rbac" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Role-Based Access Control
                </CardTitle>
                <CardDescription>
                  Manage access policies, MFA, password requirements, and session controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div>
                    <p className="font-medium">Enable RBAC</p>
                    <p className="text-sm text-muted-foreground">Enforce role-based permissions across the platform</p>
                  </div>
                  <Switch
                    checked={rbacSettings.enabled}
                    onCheckedChange={(checked) => setRBACSettings(prev => ({ ...prev, enabled: checked }))}
                  />
                </div>

                {rbacSettings.enabled && (
                  <>
                    {/* MFA */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          Multi-Factor Authentication
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">Require MFA</p>
                            <p className="text-xs text-muted-foreground">All users must use MFA</p>
                          </div>
                          <Switch
                            checked={rbacSettings.requireMFA}
                            onCheckedChange={(checked) =>
                              setRBACSettings(prev => ({ ...prev, requireMFA: checked }))
                            }
                          />
                        </div>
                        {rbacSettings.requireMFA && (
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <Label className="text-sm font-medium mb-2 block">MFA Method</Label>
                            <Select
                              value={rbacSettings.mfaMethod}
                              onValueChange={(value: 'totp' | 'sms' | 'email') =>
                                setRBACSettings(prev => ({ ...prev, mfaMethod: value }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="totp">Authenticator App (TOTP)</SelectItem>
                                <SelectItem value="sms">SMS Code</SelectItem>
                                <SelectItem value="email">Email Code</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Password Policy */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4 text-primary" />
                          Password Policy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">Minimum Length</p>
                            <span className="text-sm text-muted-foreground">{rbacSettings.passwordPolicy.minLength} chars</span>
                          </div>
                          <Slider
                            value={[rbacSettings.passwordPolicy.minLength]}
                            min={6}
                            max={32}
                            step={1}
                            onValueChange={([value]) =>
                              setRBACSettings(prev => ({
                                ...prev,
                                passwordPolicy: { ...prev.passwordPolicy, minLength: value },
                              }))
                            }
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {[
                            { key: 'requireUppercase', label: 'Require Uppercase' },
                            { key: 'requireNumbers', label: 'Require Numbers' },
                            { key: 'requireSpecialChars', label: 'Require Special Characters' },
                          ].map(item => (
                            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                              <p className="font-medium text-sm">{item.label}</p>
                              <Switch
                                checked={rbacSettings.passwordPolicy[item.key as keyof typeof rbacSettings.passwordPolicy] as boolean}
                                onCheckedChange={(checked) =>
                                  setRBACSettings(prev => ({
                                    ...prev,
                                    passwordPolicy: { ...prev.passwordPolicy, [item.key]: checked },
                                  }))
                                }
                              />
                            </div>
                          ))}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium">Password Expiry</p>
                              <span className="text-sm text-muted-foreground">{rbacSettings.passwordPolicy.expiryDays} days</span>
                            </div>
                            <Slider
                              value={[rbacSettings.passwordPolicy.expiryDays]}
                              min={30}
                              max={365}
                              step={30}
                              onValueChange={([value]) =>
                                setRBACSettings(prev => ({
                                  ...prev,
                                  passwordPolicy: { ...prev.passwordPolicy, expiryDays: value },
                                }))
                              }
                            />
                          </div>
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium">Prevent Reuse</p>
                              <span className="text-sm text-muted-foreground">Last {rbacSettings.passwordPolicy.preventReuse}</span>
                            </div>
                            <Slider
                              value={[rbacSettings.passwordPolicy.preventReuse]}
                              min={1}
                              max={24}
                              step={1}
                              onValueChange={([value]) =>
                                setRBACSettings(prev => ({
                                  ...prev,
                                  passwordPolicy: { ...prev.passwordPolicy, preventReuse: value },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Session Policy */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          Session Policy
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="p-3 rounded-lg border bg-muted/30">
                          <div className="flex justify-between mb-2">
                            <p className="text-sm font-medium">Max Concurrent Sessions</p>
                            <span className="text-sm text-muted-foreground">{rbacSettings.sessionPolicy.maxConcurrentSessions}</span>
                          </div>
                          <Slider
                            value={[rbacSettings.sessionPolicy.maxConcurrentSessions]}
                            min={1}
                            max={10}
                            step={1}
                            onValueChange={([value]) =>
                              setRBACSettings(prev => ({
                                ...prev,
                                sessionPolicy: { ...prev.sessionPolicy, maxConcurrentSessions: value },
                              }))
                            }
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium">Idle Timeout</p>
                              <span className="text-sm text-muted-foreground">{rbacSettings.sessionPolicy.idleTimeoutMinutes} min</span>
                            </div>
                            <Slider
                              value={[rbacSettings.sessionPolicy.idleTimeoutMinutes]}
                              min={5}
                              max={120}
                              step={5}
                              onValueChange={([value]) =>
                                setRBACSettings(prev => ({
                                  ...prev,
                                  sessionPolicy: { ...prev.sessionPolicy, idleTimeoutMinutes: value },
                                }))
                              }
                            />
                          </div>
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex justify-between mb-2">
                              <p className="text-sm font-medium">Absolute Timeout</p>
                              <span className="text-sm text-muted-foreground">{rbacSettings.sessionPolicy.absoluteTimeoutHours} hrs</span>
                            </div>
                            <Slider
                              value={[rbacSettings.sessionPolicy.absoluteTimeoutHours]}
                              min={1}
                              max={24}
                              step={1}
                              onValueChange={([value]) =>
                                setRBACSettings(prev => ({
                                  ...prev,
                                  sessionPolicy: { ...prev.sessionPolicy, absoluteTimeoutHours: value },
                                }))
                              }
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* IP Restrictions */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          IP Restrictions
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                          <div>
                            <p className="font-medium text-sm">Enforce IP Allowlist</p>
                            <p className="text-xs text-muted-foreground">Only allow access from listed IPs</p>
                          </div>
                          <Switch
                            checked={rbacSettings.enforceIPRestriction}
                            onCheckedChange={(checked) =>
                              setRBACSettings(prev => ({ ...prev, enforceIPRestriction: checked }))
                            }
                          />
                        </div>
                        {rbacSettings.enforceIPRestriction && (
                          <div className="p-3 rounded-lg border bg-muted/30">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {rbacSettings.allowedIPs.length === 0 && (
                                <p className="text-sm text-muted-foreground">No IPs added yet</p>
                              )}
                              {rbacSettings.allowedIPs.map((ip) => (
                                <Badge key={ip} variant="secondary" className="gap-1 pr-1 font-mono text-xs">
                                  {ip}
                                  <button
                                    onClick={() => removeIP(ip)}
                                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={newIP}
                                onChange={(e) => setNewIP(e.target.value)}
                                placeholder="192.168.1.0/24"
                                className="font-mono text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && addIP()}
                              />
                              <Button variant="outline" size="sm" onClick={addIP}>
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ========== MODERATION TAB ========== */}
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

          {/* ========== AUDIT LOGS TAB ========== */}
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
                  <Button variant="outline" size="sm" onClick={handleExportLogs} disabled={isExporting}>
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-1" />
                    )}
                    {isExporting ? 'Exporting...' : 'Export Logs'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
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
