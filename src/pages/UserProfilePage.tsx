import { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Shield,
  Bell,
  Camera,
  Loader2,
  Save,
  Lock,
  Monitor,
  Smartphone,
  Globe,
  LogOut,
  Trash2,
  Sun,
  Moon,
  Laptop,
  Check,
  Phone,
  KeyRound,
  QrCode,
  HelpCircle,
  Settings,
  X,
  AlertTriangle,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useUserProfileData } from '@/hooks/useUserProfileData';
import { useTheme, ThemeMode } from '@/hooks/useTheme';
import { notify } from '@/hooks/useNotification';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { LogoutAllSessionsModal } from '@/components/profile/LogoutAllSessionsModal';
import { LANGUAGES, TIMEZONES, SECURITY_QUESTIONS_LIST } from '@/types/userProfile';
import type { SecurityQuestion } from '@/types/userProfile';
import { cn } from '@/lib/utils';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import type { Country } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

type ProfileTab = 'profile' | 'sessions' | 'security' | 'settings';

export default function UserProfilePage() {
  const {
    profile,
    preferences,
    notificationPrefs,
    sessions,
    twoFactor,
    securityQuestions,
    isSaving,
    updateProfile,
    updatePreferences,
    updateNotificationPrefs,
    changePassword,
    uploadAvatar,
    terminateSession,
    terminateAllSessions,
    enableTwoFactor,
    disableTwoFactor,
    saveSecurityQuestions,
  } = useUserProfileData();

  const { updateTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [editedName, setEditedName] = useState(profile.fullName);
  const [editedPhone, setEditedPhone] = useState<string | undefined>(profile.phone);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const [terminateSessionId, setTerminateSessionId] = useState<string | null>(null);
  const [isTerminating, setIsTerminating] = useState(false);
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [setup2FAStep, setSetup2FAStep] = useState<'choose' | 'app' | 'questions'>('choose');
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [setupQuestionsOpen, setSetupQuestionsOpen] = useState(false);
  const [editingQuestions, setEditingQuestions] = useState<SecurityQuestion[]>([
    { id: '1', question: '', answer: '' },
    { id: '2', question: '', answer: '' },
    { id: '3', question: '', answer: '' },
  ]);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<Country>('US');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const locale = navigator.language || navigator.languages?.[0] || 'en-US';
      const parts = locale.split('-');
      const countryCode = parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
      if (countryCode && countryCode.length === 2) {
        setDetectedCountry(countryCode as Country);
      }
    } catch {}
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data?.country_code && data.country_code.length === 2) {
          setDetectedCountry(data.country_code as Country);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      notify.validationError('Full name cannot be empty.');
      return;
    }
    const result = await updateProfile({ fullName: editedName.trim() });
    if (result.success) {
      notify.saved('Name');
      setIsEditingName(false);
    }
  };

  const handleSavePhone = async () => {
    if (editedPhone && !isValidPhoneNumber(editedPhone)) {
      notify.validationError('Please enter a valid phone number.');
      return;
    }
    const result = await updateProfile({ phone: editedPhone });
    if (result.success) {
      notify.saved('Phone number');
      setIsEditingPhone(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify.validationError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify.validationError('Image must be less than 5MB.');
      return;
    }
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null || prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);
    const result = await uploadAvatar(file);
    clearInterval(interval);
    setUploadProgress(100);
    setTimeout(() => {
      setUploadProgress(null);
      if (result.success) notify.uploaded('Profile photo');
    }, 500);
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    const result = await updatePreferences({ [key]: value });
    if (result.success) {
      if (key === 'theme') updateTheme({ mode: value as ThemeMode });
      notify.saved('Preference');
    }
  };

  const handleNotificationChange = async (key: string, value: boolean, isAlert = false) => {
    let updates;
    if (isAlert) {
      updates = { alertPreferences: { ...notificationPrefs.alertPreferences, [key]: value } };
    } else {
      updates = { [key]: value };
    }
    const result = await updateNotificationPrefs(updates);
    if (result.success) notify.saved('Notification preferences');
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) notify.success('Password changed', 'Your password has been updated successfully.');
    return result;
  };

  const handleTerminateSession = async () => {
    if (!terminateSessionId) return;
    setIsTerminating(true);
    const result = await terminateSession(terminateSessionId);
    setIsTerminating(false);
    if (result.success) notify.success('Session terminated', 'The device has been logged out.');
    setTerminateSessionId(null);
  };

  const handleLogoutAll = async () => {
    const result = await terminateAllSessions();
    if (result.success) notify.success('All sessions terminated', 'All other devices have been logged out.');
    return result;
  };

  const handleEnable2FA = async (method: 'app' | 'security_questions') => {
    setIsEnabling2FA(true);
    const result = await enableTwoFactor(method);
    setIsEnabling2FA(false);
    if (result.success) {
      notify.success('2FA Enabled', `Two-factor authentication via ${method === 'app' ? 'authenticator app' : 'security questions'} is now active.`);
      setSetup2FAOpen(false);
      setSetup2FAStep('choose');
      setVerificationCode('');
    }
  };

  const handleDisable2FA = async () => {
    const result = await disableTwoFactor();
    if (result.success) notify.success('2FA Disabled', 'Two-factor authentication has been turned off.');
  };

  const handleSaveSecurityQuestions = async () => {
    const valid = editingQuestions.every(q => q.question && q.answer.trim());
    if (!valid) {
      notify.validationError('Please fill in all questions and answers.');
      return;
    }
    setIsSavingQuestions(true);
    const result = await saveSecurityQuestions(editingQuestions);
    setIsSavingQuestions(false);
    if (result.success) {
      notify.success('Security Questions Saved', 'Your security questions have been updated.');
      setSetupQuestionsOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const sessionToTerminate = sessions.find(s => s.id === terminateSessionId);

  const MOCK_SECRET = 'JBSWY3DPEHPK3PXP';

  return (
    <AppLayout>
      <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
            <AvatarFallback className="text-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile.fullName}</h1>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{profile.role}</Badge>
              {twoFactor.enabled && (
                <Badge variant="default" className="bg-success/10 text-success border-success/30 text-[10px]">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  2FA Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ProfileTab)} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Sessions</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* ===== PROFILE TAB ===== */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Manage your personal details and profile photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                      <AvatarFallback className="text-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        {profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{profile.fullName}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                    {uploadProgress !== null && (
                      <div className="mt-2 space-y-1">
                        <Progress value={uploadProgress} className="h-1" />
                        <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 h-5">Full Name</Label>
                    {isEditingName ? (
                      <div className="flex gap-2">
                        <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} className="flex-1" />
                        <Button size="sm" onClick={handleSaveName} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setIsEditingName(false); setEditedName(profile.fullName); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 min-h-[46px]">
                        <span>{profile.fullName}</span>
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>Edit</Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 h-5">
                      Email
                      <Badge variant="secondary" className="text-[10px]">Read-only</Badge>
                    </Label>
                    <div className="p-3 rounded-lg border bg-muted/30 text-muted-foreground min-h-[46px] flex items-center">
                      {profile.email}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 h-5">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </Label>
                    {isEditingPhone ? (
                      <div className="flex gap-2 items-start">
                        <PhoneInput
                          international
                          countryCallingCodeEditable={false}
                          defaultCountry={detectedCountry}
                          placeholder="Enter phone number"
                          value={editedPhone}
                          onChange={(value) => setEditedPhone(value)}
                          className="phone-input-wrapper h-11 rounded-md border border-input bg-background px-3 text-sm flex-1"
                        />
                        <Button size="sm" className="h-11" onClick={handleSavePhone} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-11" onClick={() => { setIsEditingPhone(false); setEditedPhone(profile.phone); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 min-h-[46px]">
                        <span className={profile.phone ? '' : 'text-muted-foreground'}>
                          {profile.phone || 'Not set'}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => { setIsEditingPhone(true); setEditedPhone(profile.phone); }}>
                          {profile.phone ? 'Edit' : 'Add'}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 h-5">
                      Role
                      <Badge variant="secondary" className="text-[10px]">Read-only</Badge>
                    </Label>
                    <div className="p-3 rounded-lg border bg-muted/30 min-h-[46px] flex items-center">
                      <Badge variant="outline">{profile.role}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 h-5">Member Since</Label>
                    <div className="p-3 rounded-lg border bg-muted/30 text-muted-foreground min-h-[46px] flex items-center">
                      {new Date(profile.createdAt).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SESSIONS TAB ===== */}
          <TabsContent value="sessions" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-primary" />
                      Active Sessions
                    </CardTitle>
                    <CardDescription>Devices where your account is currently logged in</CardDescription>
                  </div>
                  {sessions.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setLogoutAllOpen(true)}
                    >
                      <LogOut className="w-4 h-4 mr-1.5" />
                      Logout All Others
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.map(session => (
                    <div
                      key={session.id}
                      className={cn(
                        'flex items-center justify-between p-4 rounded-xl border transition-colors',
                        session.isCurrent ? 'bg-primary/5 border-primary/30' : 'bg-muted/30 hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          session.isCurrent ? 'bg-primary/10' : 'bg-muted'
                        )}>
                          {getDeviceIcon(session.device)}
                        </div>
                        <div>
                          <p className="text-sm font-medium flex items-center gap-2">
                            {session.device}
                            <span className="text-muted-foreground font-normal">
                              {session.browser}
                            </span>
                            {session.isCurrent && (
                              <Badge variant="default" className="text-[10px]">This device</Badge>
                            )}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {session.location}
                            </span>
                            <span>{session.ipAddress}</span>
                            <span>Last active: {formatDate(session.lastActive)}</span>
                          </div>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setTerminateSessionId(session.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1.5" />
                          Terminate
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {sessions.length === 1 && (
                  <div className="mt-4 p-4 rounded-xl border bg-muted/20 text-center">
                    <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-sm font-medium">Only one active session</p>
                    <p className="text-xs text-muted-foreground mt-1">This is the only device logged into your account.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SECURITY TAB ===== */}
          <TabsContent value="security" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Password
                </CardTitle>
                <CardDescription>Manage your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Account Password</p>
                      <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Two-Factor Authentication (2FA)
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={cn(
                  'flex items-center justify-between p-4 rounded-xl border',
                  twoFactor.enabled ? 'bg-success/5 border-success/30' : 'bg-muted/30'
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      twoFactor.enabled ? 'bg-success/10' : 'bg-muted'
                    )}>
                      {twoFactor.enabled ? (
                        <ShieldCheck className="w-5 h-5 text-success" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {twoFactor.enabled ? '2FA is enabled' : '2FA is not enabled'}
                        {twoFactor.enabled && (
                          <Badge variant="outline" className="text-[10px] text-success border-success/30">
                            {twoFactor.method === 'app' ? 'Authenticator App' : 'Security Questions'}
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {twoFactor.enabled
                          ? 'Your account has an extra layer of protection'
                          : 'Protect your account with a second verification step'}
                      </p>
                    </div>
                  </div>
                  {twoFactor.enabled ? (
                    <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleDisable2FA}>
                      Disable 2FA
                    </Button>
                  ) : (
                    <Button onClick={() => { setSetup2FAOpen(true); setSetup2FAStep('choose'); }}>
                      Enable 2FA
                    </Button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className={cn(
                    'p-4 rounded-xl border',
                    twoFactor.method === 'app' ? 'border-primary/30 bg-primary/5' : 'bg-muted/30'
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <QrCode className="w-5 h-5 text-primary" />
                      <p className="font-medium text-sm">Authenticator App</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use an app like Google Authenticator or Authy to generate verification codes
                    </p>
                    {twoFactor.appConfigured && (
                      <Badge variant="outline" className="mt-2 text-[10px] text-success border-success/30">Configured</Badge>
                    )}
                  </div>
                  <div className={cn(
                    'p-4 rounded-xl border',
                    twoFactor.method === 'security_questions' ? 'border-primary/30 bg-primary/5' : 'bg-muted/30'
                  )}>
                    <div className="flex items-center gap-3 mb-2">
                      <HelpCircle className="w-5 h-5 text-primary" />
                      <p className="font-medium text-sm">Security Questions</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Answer security questions to verify your identity when logging in
                    </p>
                    {twoFactor.securityQuestionsConfigured && (
                      <Badge variant="outline" className="mt-2 text-[10px] text-success border-success/30">Configured</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  Security Questions
                </CardTitle>
                <CardDescription>
                  Set up questions for account recovery and verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      securityQuestions.length > 0 ? 'bg-success/10' : 'bg-muted'
                    )}>
                      <KeyRound className={cn('w-5 h-5', securityQuestions.length > 0 ? 'text-success' : 'text-muted-foreground')} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {securityQuestions.length > 0 ? `${securityQuestions.length} questions configured` : 'No security questions set'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {securityQuestions.length > 0 ? 'Your recovery questions are set up' : 'Set up questions for account recovery'}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSetupQuestionsOpen(true)}>
                    {securityQuestions.length > 0 ? 'Update Questions' : 'Set Up Questions'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== SETTINGS TAB ===== */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Preferences
                </CardTitle>
                <CardDescription>Language, timezone, and appearance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {LANGUAGES.map(lang => (
                          <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="flex gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Laptop },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => handlePreferenceChange('theme', value)}
                        className={cn(
                          'flex-1 p-4 rounded-xl border transition-all',
                          preferences.theme === value
                            ? 'border-primary bg-primary/5 ring-1 ring-primary'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <Icon className={cn('w-5 h-5 mx-auto mb-2', preferences.theme === value ? 'text-primary' : 'text-muted-foreground')} />
                        <p className={cn('text-sm font-medium text-center', preferences.theme === value ? 'text-primary' : '')}>{label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Control how you receive updates and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email Notifications
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        In-App Notifications
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Show notifications in the app</p>
                    </div>
                    <Switch
                      checked={notificationPrefs.inAppNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('inAppNotifications', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Alert Preferences</Label>
                  <div className="space-y-2">
                    {[
                      { key: 'slaBreaches', label: 'SLA Breaches', desc: 'When response time exceeds thresholds' },
                      { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts and security events' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                          checked={notificationPrefs.alertPreferences[key as keyof typeof notificationPrefs.alertPreferences]}
                          onCheckedChange={(checked) => handleNotificationChange(key, checked, true)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ===== MODALS ===== */}

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
        onChangePassword={handleChangePassword}
      />

      <LogoutAllSessionsModal
        open={logoutAllOpen}
        onOpenChange={setLogoutAllOpen}
        sessionCount={sessions.length}
        onLogoutAll={handleLogoutAll}
      />

      {/* Terminate Single Session Confirmation */}
      <AlertDialog open={!!terminateSessionId} onOpenChange={(open) => { if (!open) setTerminateSessionId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-lg">Terminate session?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This will immediately log out the device and end the session. The user on that device will need to log in again.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {sessionToTerminate && (
            <div className="my-3 p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  {getDeviceIcon(sessionToTerminate.device)}
                </div>
                <div>
                  <p className="text-sm font-medium">{sessionToTerminate.device} - {sessionToTerminate.browser}</p>
                  <p className="text-xs text-muted-foreground">
                    {sessionToTerminate.location} - {sessionToTerminate.ipAddress}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>Any unsaved work on that device may be lost.</span>
          </div>

          <AlertDialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setTerminateSessionId(null)} disabled={isTerminating}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleTerminateSession} disabled={isTerminating}>
              {isTerminating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Terminate Session
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Setup 2FA Modal */}
      <Dialog open={setup2FAOpen} onOpenChange={(open) => { if (!open) { setSetup2FAOpen(false); setSetup2FAStep('choose'); setVerificationCode(''); } }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Set Up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              {setup2FAStep === 'choose' && 'Choose your preferred 2FA method'}
              {setup2FAStep === 'app' && 'Scan the QR code with your authenticator app'}
              {setup2FAStep === 'questions' && 'Answer these questions to enable 2FA'}
            </DialogDescription>
          </DialogHeader>

          {setup2FAStep === 'choose' && (
            <div className="space-y-3 py-4">
              <button
                className="w-full p-4 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                onClick={() => setSetup2FAStep('app')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Authenticator App</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Use Google Authenticator, Authy, or similar app
                    </p>
                  </div>
                </div>
              </button>
              <button
                className="w-full p-4 rounded-xl border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                onClick={() => setSetup2FAStep('questions')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Security Questions</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Set up questions and answers for verification
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {setup2FAStep === 'app' && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-xl border-2 border-dashed border-primary/30 bg-muted/30 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-primary/40 mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground">QR Code Placeholder</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Or enter this code manually:</Label>
                <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30 font-mono text-sm">
                  <span className="flex-1 tracking-wider">{MOCK_SECRET}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      navigator.clipboard.writeText(MOCK_SECRET);
                      notify.success('Copied', 'Secret key copied to clipboard');
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Enter verification code from your app</Label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  maxLength={6}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSetup2FAStep('choose')}>Back</Button>
                <Button
                  onClick={() => handleEnable2FA('app')}
                  disabled={verificationCode.length !== 6 || isEnabling2FA}
                >
                  {isEnabling2FA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Verify & Enable
                </Button>
              </DialogFooter>
            </div>
          )}

          {setup2FAStep === 'questions' && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Choose 3 security questions and provide answers. These will be used to verify your identity.
              </p>
              {editingQuestions.map((q, idx) => (
                <div key={q.id} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                  <Label className="text-xs font-medium">Question {idx + 1}</Label>
                  <Select
                    value={q.question}
                    onValueChange={(val) => {
                      const updated = [...editingQuestions];
                      updated[idx] = { ...updated[idx], question: val };
                      setEditingQuestions(updated);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select a question" /></SelectTrigger>
                    <SelectContent>
                      {SECURITY_QUESTIONS_LIST.filter(sq =>
                        !editingQuestions.some((eq, i) => i !== idx && eq.question === sq)
                      ).map(sq => (
                        <SelectItem key={sq} value={sq}>{sq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Your answer"
                    value={q.answer}
                    onChange={(e) => {
                      const updated = [...editingQuestions];
                      updated[idx] = { ...updated[idx], answer: e.target.value };
                      setEditingQuestions(updated);
                    }}
                  />
                </div>
              ))}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSetup2FAStep('choose')}>Back</Button>
                <Button
                  onClick={() => handleEnable2FA('security_questions')}
                  disabled={!editingQuestions.every(q => q.question && q.answer.trim()) || isEnabling2FA}
                >
                  {isEnabling2FA ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Save & Enable 2FA
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Setup Security Questions Modal (standalone, separate from 2FA) */}
      <Dialog open={setupQuestionsOpen} onOpenChange={setSetupQuestionsOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" />
              Security Questions
            </DialogTitle>
            <DialogDescription>
              Set up recovery questions for your account. Choose 3 questions and provide answers.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editingQuestions.map((q, idx) => (
              <div key={q.id} className="space-y-2 p-3 rounded-lg border bg-muted/30">
                <Label className="text-xs font-medium">Question {idx + 1}</Label>
                <Select
                  value={q.question}
                  onValueChange={(val) => {
                    const updated = [...editingQuestions];
                    updated[idx] = { ...updated[idx], question: val };
                    setEditingQuestions(updated);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select a question" /></SelectTrigger>
                  <SelectContent>
                    {SECURITY_QUESTIONS_LIST.filter(sq =>
                      !editingQuestions.some((eq, i) => i !== idx && eq.question === sq)
                    ).map(sq => (
                      <SelectItem key={sq} value={sq}>{sq}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Your answer"
                  value={q.answer}
                  onChange={(e) => {
                    const updated = [...editingQuestions];
                    updated[idx] = { ...updated[idx], answer: e.target.value };
                    setEditingQuestions(updated);
                  }}
                />
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSetupQuestionsOpen(false)} disabled={isSavingQuestions}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSecurityQuestions}
              disabled={!editingQuestions.every(q => q.question && q.answer.trim()) || isSavingQuestions}
            >
              {isSavingQuestions ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
