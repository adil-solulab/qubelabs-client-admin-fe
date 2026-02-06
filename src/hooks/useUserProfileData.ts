import { useState, useCallback } from 'react';
import type {
  UserProfile,
  AccountPreferences,
  NotificationPreferences,
  ActiveSession,
} from '@/types/userProfile';

const mockProfile: UserProfile = {
  id: 'user-1',
  fullName: 'John Admin',
  email: 'john@acmecorp.com',
  role: 'Client Admin',
  avatarUrl: undefined,
  phone: '+1 (555) 123-4567',
  createdAt: '2024-06-15T00:00:00Z',
};

const mockPreferences: AccountPreferences = {
  language: 'en',
  timezone: 'America/New_York',
  theme: 'system',
};

const mockNotificationPrefs: NotificationPreferences = {
  emailNotifications: true,
  inAppNotifications: true,
  alertPreferences: {
    slaBreaches: true,
    agentOffline: true,
    systemUpdates: true,
    securityAlerts: true,
    weeklyReports: false,
  },
};

const mockSessions: ActiveSession[] = [
  {
    id: 'session-1',
    device: 'MacBook Pro',
    browser: 'Chrome 121',
    location: 'New York, NY',
    ipAddress: '192.168.1.100',
    lastActive: '2025-02-02T10:30:00Z',
    isCurrent: true,
  },
  {
    id: 'session-2',
    device: 'iPhone 15',
    browser: 'Safari Mobile',
    location: 'New York, NY',
    ipAddress: '192.168.1.101',
    lastActive: '2025-02-02T08:15:00Z',
    isCurrent: false,
  },
  {
    id: 'session-3',
    device: 'Windows PC',
    browser: 'Firefox 122',
    location: 'Boston, MA',
    ipAddress: '10.0.0.50',
    lastActive: '2025-02-01T14:20:00Z',
    isCurrent: false,
  },
];

export function useUserProfileData() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [preferences, setPreferences] = useState<AccountPreferences>(mockPreferences);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(mockNotificationPrefs);
  const [sessions, setSessions] = useState<ActiveSession[]>(mockSessions);
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>): Promise<{ success: boolean }> => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setProfile(prev => ({ ...prev, ...updates }));
    setIsSaving(false);
    return { success: true };
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<AccountPreferences>): Promise<{ success: boolean }> => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setPreferences(prev => ({ ...prev, ...updates }));
    setIsSaving(false);
    return { success: true };
  }, []);

  const updateNotificationPrefs = useCallback(async (updates: Partial<NotificationPreferences>): Promise<{ success: boolean }> => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotificationPrefs(prev => ({ ...prev, ...updates }));
    setIsSaving(false);
    return { success: true };
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate validation
    if (currentPassword !== 'password123') {
      return { success: false, error: 'Current password is incorrect' };
    }
    
    return { success: true };
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<{ success: boolean; url?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate upload - create a data URL for demo
    const url = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, avatarUrl: url }));
    
    return { success: true, url };
  }, []);

  const terminateSession = useCallback(async (sessionId: string): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    return { success: true };
  }, []);

  const terminateAllSessions = useCallback(async (): Promise<{ success: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    setSessions(prev => prev.filter(s => s.isCurrent));
    return { success: true };
  }, []);

  return {
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
  };
}
