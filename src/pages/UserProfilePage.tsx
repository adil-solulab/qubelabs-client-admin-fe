import { useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useUserProfileData } from '@/hooks/useUserProfileData';
import { useToast } from '@/hooks/use-toast';
import { ChangePasswordModal } from '@/components/profile/ChangePasswordModal';
import { LogoutAllSessionsModal } from '@/components/profile/LogoutAllSessionsModal';
import { LANGUAGES, TIMEZONES } from '@/types/userProfile';
import { cn } from '@/lib/utils';

export default function UserProfilePage() {
  const { toast } = useToast();
  const {
    profile,
    preferences,
    notificationPrefs,
    sessions,
    isSaving,
    updateProfile,
    updatePreferences,
    updateNotificationPrefs,
    changePassword,
    uploadAvatar,
    terminateSession,
    terminateAllSessions,
  } = useUserProfileData();

  const [editedName, setEditedName] = useState(profile.fullName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Full name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    const result = await updateProfile({ fullName: editedName.trim() });
    if (result.success) {
      toast({
        title: 'Profile Updated',
        description: 'Your name has been saved successfully.',
      });
      setIsEditingName(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image must be less than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate upload progress
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
      if (result.success) {
        toast({
          title: 'Photo Uploaded',
          description: 'Your profile photo has been updated.',
        });
      }
    }, 500);
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    const result = await updatePreferences({ [key]: value });
    if (result.success) {
      toast({
        title: 'Preference Updated',
        description: 'Your preference has been saved.',
      });
    }
  };

  const handleNotificationChange = async (key: string, value: boolean, isAlert = false) => {
    let updates;
    if (isAlert) {
      updates = {
        alertPreferences: {
          ...notificationPrefs.alertPreferences,
          [key]: value,
        },
      };
    } else {
      updates = { [key]: value };
    }
    
    const result = await updateNotificationPrefs(updates);
    if (result.success) {
      toast({
        title: 'Notifications Updated',
        description: 'Your notification preferences have been saved.',
      });
    }
  };

  const handleChangePassword = async (currentPassword: string, newPassword: string) => {
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });
    }
    return result;
  };

  const handleTerminateSession = async (sessionId: string) => {
    const result = await terminateSession(sessionId);
    if (result.success) {
      toast({
        title: 'Session Terminated',
        description: 'The device has been logged out.',
      });
    }
  };

  const handleLogoutAll = async () => {
    const result = await terminateAllSessions();
    if (result.success) {
      toast({
        title: 'All Sessions Terminated',
        description: 'All other devices have been logged out.',
      });
    }
    return result;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Profile Information */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal details and profile photo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{profile.fullName}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                {uploadProgress !== null && (
                  <div className="mt-2 space-y-1">
                    <Progress value={uploadProgress} className="h-1" />
                    <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Profile Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label>Full Name</Label>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <Input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveName} disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <span>{profile.fullName}</span>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>
                      Edit
                    </Button>
                  </div>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Email
                  <Badge variant="secondary" className="text-[10px]">Read-only</Badge>
                </Label>
                <div className="p-3 rounded-lg border bg-muted/30 text-muted-foreground">
                  {profile.email}
                </div>
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Role
                  <Badge variant="secondary" className="text-[10px]">Read-only</Badge>
                </Label>
                <div className="p-3 rounded-lg border bg-muted/30">
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
              </div>

              {/* Member Since */}
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="p-3 rounded-lg border bg-muted/30 text-muted-foreground">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Preferences */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Account Preferences
            </CardTitle>
            <CardDescription>
              Language, timezone, and appearance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Language */}
              <div className="space-y-2">
                <Label>Language</Label>
                <Select
                  value={preferences.language}
                  onValueChange={(value) => handlePreferenceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select
                  value={preferences.timezone}
                  onValueChange={(value) => handlePreferenceChange('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Theme */}
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
                    <Icon className={cn(
                      'w-5 h-5 mx-auto mb-2',
                      preferences.theme === value ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <p className={cn(
                      'text-sm font-medium text-center',
                      preferences.theme === value ? 'text-primary' : ''
                    )}>
                      {label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Password and session management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Change Password */}
            <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                Change Password
              </Button>
            </div>

            {/* Active Sessions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Active Sessions</Label>
                {sessions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setLogoutAllOpen(true)}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout All
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      session.isCurrent ? 'bg-primary/5 border-primary/30' : 'bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        {getDeviceIcon(session.device)}
                      </div>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-2">
                          {session.device} • {session.browser}
                          {session.isCurrent && (
                            <Badge variant="default" className="text-[10px]">Current</Badge>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {session.location} • {formatDate(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleTerminateSession(session.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="gradient-card">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control how you receive updates and alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Toggles */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.emailNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border bg-muted/30">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    In-App Notifications
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show notifications in the app
                  </p>
                </div>
                <Switch
                  checked={notificationPrefs.inAppNotifications}
                  onCheckedChange={(checked) => handleNotificationChange('inAppNotifications', checked)}
                />
              </div>
            </div>

            {/* Alert Preferences */}
            <div className="space-y-3">
              <Label>Alert Preferences</Label>
              <div className="space-y-2">
                {[
                  { key: 'slaBreaches', label: 'SLA Breaches', desc: 'When response time exceeds thresholds' },
                  { key: 'agentOffline', label: 'Agent Offline', desc: 'When AI agents go offline unexpectedly' },
                  { key: 'systemUpdates', label: 'System Updates', desc: 'Platform updates and maintenance' },
                  { key: 'securityAlerts', label: 'Security Alerts', desc: 'Login attempts and security events' },
                  { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Summary of weekly performance' },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
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
      </div>

      {/* Modals */}
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
    </AppLayout>
  );
}
