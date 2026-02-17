export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
}

export interface AccountPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  alertPreferences: {
    slaBreaches: boolean;
    securityAlerts: boolean;
  };
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export type TwoFactorMethod = 'app' | 'security_questions' | null;

export interface TwoFactorState {
  enabled: boolean;
  method: TwoFactorMethod;
  appConfigured: boolean;
  securityQuestionsConfigured: boolean;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string;
}

export const SECURITY_QUESTIONS_LIST = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was the name of your first school?',
  'What is your mother\'s maiden name?',
  'What was the make of your first car?',
  'What is the name of the street you grew up on?',
  'What was your childhood nickname?',
  'What is the name of your favorite childhood friend?',
  'In what city did you meet your spouse/significant other?',
  'What was the first concert you attended?',
];

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
];

export const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
];
