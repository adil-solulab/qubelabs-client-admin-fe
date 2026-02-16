import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import type { Role, ScreenPermission } from '@/types/roles';
import { SYSTEM_ROLES } from '@/types/roles';
import type { ActionType, ScreenId } from '@/types/roles';
import { notify } from '@/hooks/useNotification';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatar?: string;
}

interface SessionData {
  userId: string;
  roleId: string;
  roleName: string;
  permissions: ScreenPermission[];
  cachedAt: number;
  version: number;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  currentRole: Role | null;
  session: SessionData | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  setUserRole: (roleId: string) => void;
  hasPermission: (screenId: ScreenId, action: ActionType) => boolean;
  canAccessScreen: (screenId: ScreenId) => boolean;
  isClientAdmin: boolean;
  isSupervisor: boolean;
  isAgent: boolean;
  refreshSession: () => void;
  notifyRoleChange: (userId: string, newRoleId: string) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Session storage key
const SESSION_KEY = 'auth_session';
const ROLE_VERSION_KEY = 'role_versions';

// Mock roles including custom ones
const ALL_ROLES: Role[] = [
  ...SYSTEM_ROLES,
  {
    id: 'sales_agent',
    name: 'Sales Agent',
    description: 'Specialized role for sales team members',
    isSystem: false,
    permissions: [
      { screenId: 'dashboard', actions: ['view'] },
      { screenId: 'live-ops', actions: ['view'] },
      { screenId: 'outbound-calls', actions: ['view', 'create', 'edit'] },
      { screenId: 'analytics', actions: ['view'] },
      { screenId: 'transcripts', actions: ['view'] },
    ],
    userCount: 5,
    createdAt: '2024-06-15',
    updatedAt: '2024-06-20',
  },
  {
    id: 'support_agent',
    name: 'Support Agent',
    description: 'Specialized role for support team',
    isSystem: false,
    permissions: [
      { screenId: 'dashboard', actions: ['view'] },
      { screenId: 'knowledge-base', actions: ['view', 'create', 'edit'] },
      { screenId: 'live-ops', actions: ['view', 'edit'] },
      { screenId: 'transcripts', actions: ['view'] },
    ],
    userCount: 8,
    createdAt: '2024-07-01',
    updatedAt: '2024-07-10',
  },
];

// Get role version from storage (simulates server-side version tracking)
function getRoleVersions(): Record<string, number> {
  try {
    const stored = localStorage.getItem(ROLE_VERSION_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setRoleVersion(userId: string, version: number) {
  const versions = getRoleVersions();
  versions[userId] = version;
  localStorage.setItem(ROLE_VERSION_KEY, JSON.stringify(versions));
}

function incrementRoleVersion(userId: string): number {
  const versions = getRoleVersions();
  const newVersion = (versions[userId] || 0) + 1;
  versions[userId] = newVersion;
  localStorage.setItem(ROLE_VERSION_KEY, JSON.stringify(versions));
  return newVersion;
}

// Default to Client Admin for demo purposes
const DEFAULT_USER: CurrentUser = {
  id: '1',
  name: 'John Anderson',
  email: 'john.anderson@acmecorp.com',
  roleId: 'client_admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(DEFAULT_USER);
  const [session, setSession] = useState<SessionData | null>(null);
  const sessionCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Resolve role from session cache or roles list
  const currentRole = session 
    ? ALL_ROLES.find(r => r.id === session.roleId) || null 
    : currentUser 
      ? ALL_ROLES.find(r => r.id === currentUser.roleId) || null 
      : null;

  // Create session with cached permissions
  const createSession = useCallback((user: CurrentUser): SessionData => {
    const role = ALL_ROLES.find(r => r.id === user.roleId);
    const versions = getRoleVersions();
    
    const sessionData: SessionData = {
      userId: user.id,
      roleId: user.roleId,
      roleName: role?.name || 'Unknown',
      permissions: role?.permissions || [],
      cachedAt: Date.now(),
      version: versions[user.id] || 1,
    };

    // Store session
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    } catch (e) {
      console.error('Failed to store session:', e);
    }

    return sessionData;
  }, []);

  // Load session from storage
  const loadSession = useCallback((): SessionData | null => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Refresh session - re-resolve role and permissions
  const refreshSession = useCallback(() => {
    if (!currentUser) return;

    const role = ALL_ROLES.find(r => r.id === currentUser.roleId);
    const versions = getRoleVersions();
    const currentVersion = versions[currentUser.id] || 1;

    const newSession: SessionData = {
      userId: currentUser.id,
      roleId: currentUser.roleId,
      roleName: role?.name || 'Unknown',
      permissions: role?.permissions || [],
      cachedAt: Date.now(),
      version: currentVersion,
    };

    setSession(newSession);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  }, [currentUser]);

  // Check for role changes (simulated polling)
  const checkForRoleChanges = useCallback(() => {
    if (!session || !currentUser) return;

    const versions = getRoleVersions();
    const serverVersion = versions[currentUser.id] || 1;

    if (serverVersion > session.version) {
      // Role has been updated by admin
      notify.info(
        'Permissions Updated',
        'Your access permissions have changed. Refreshing session...'
      );

      // Auto-refresh session after a short delay
      setTimeout(() => {
        refreshSession();
        notify.success('Session Refreshed', 'Your permissions are now up to date.');
      }, 1000);
    }
  }, [session, currentUser, refreshSession]);

  // Notify that a user's role has changed (called when admin updates a role)
  const notifyRoleChange = useCallback((userId: string, newRoleId: string) => {
    // Increment version to trigger refresh on affected user
    incrementRoleVersion(userId);

    // If it's the current user, trigger immediate check
    if (currentUser?.id === userId) {
      // Update user's role
      setCurrentUserState(prev => prev ? { ...prev, roleId: newRoleId } : null);
      
      // Show notification
      notify.info(
        'Permissions Updated',
        'Your access permissions have changed.'
      );

      // Refresh session with new role
      setTimeout(() => {
        const role = ALL_ROLES.find(r => r.id === newRoleId);
        const versions = getRoleVersions();
        
        const newSession: SessionData = {
          userId,
          roleId: newRoleId,
          roleName: role?.name || 'Unknown',
          permissions: role?.permissions || [],
          cachedAt: Date.now(),
          version: versions[userId] || 1,
        };

        setSession(newSession);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      }, 100);
    }
  }, [currentUser]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock validation
    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    // Create user based on email pattern for demo
    let roleId = 'agent';
    if (email.includes('admin')) {
      roleId = 'client_admin';
    } else if (email.includes('supervisor')) {
      roleId = 'supervisor';
    }

    const user: CurrentUser = {
      id: `user_${Date.now()}`,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      roleId,
    };

    // Initialize role version
    setRoleVersion(user.id, 1);

    // Set user and create session
    setCurrentUserState(user);
    const sessionData = createSession(user);
    setSession(sessionData);

    notify.success('Login Successful', `Welcome back! Role: ${sessionData.roleName}`);

    return { success: true };
  }, [createSession]);

  // Logout function
  const logout = useCallback(() => {
    setCurrentUserState(null);
    setSession(null);
    sessionStorage.removeItem(SESSION_KEY);
    notify.info('Logged Out', 'You have been signed out successfully.');
  }, []);

  // Set current user with session creation
  const setCurrentUser = useCallback((user: CurrentUser | null) => {
    setCurrentUserState(user);
    if (user) {
      const sessionData = createSession(user);
      setSession(sessionData);
    } else {
      setSession(null);
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [createSession]);

  // Set user role (for role switcher in demo)
  const setUserRole = useCallback((roleId: string) => {
    if (!currentUser) return;

    const oldRoleId = currentUser.roleId;
    const newUser = { ...currentUser, roleId };
    
    setCurrentUserState(newUser);
    
    // Increment version and refresh session
    incrementRoleVersion(currentUser.id);
    
    const role = ALL_ROLES.find(r => r.id === roleId);
    const versions = getRoleVersions();
    
    const newSession: SessionData = {
      userId: currentUser.id,
      roleId,
      roleName: role?.name || 'Unknown',
      permissions: role?.permissions || [],
      cachedAt: Date.now(),
      version: versions[currentUser.id] || 1,
    };

    setSession(newSession);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

    // Only show notification if role actually changed
    if (oldRoleId !== roleId) {
      notify.info(
        'Role Changed',
        `Switched to ${role?.name || 'Unknown'} role. Permissions updated.`
      );
    }
  }, [currentUser]);

  // Check permissions from cached session
  const hasPermission = useCallback((screenId: ScreenId, action: ActionType): boolean => {
    // Use session cache first, fall back to role lookup
    if (session) {
      if (session.roleId === 'client_admin') return true;
      const screenPerm = session.permissions.find(p => p.screenId === screenId);
      return screenPerm?.actions.includes(action) || false;
    }
    
    if (!currentRole) return false;
    if (currentRole.id === 'client_admin') return true;
    const screenPerm = currentRole.permissions.find(p => p.screenId === screenId);
    return screenPerm?.actions.includes(action) || false;
  }, [session, currentRole]);

  // Check screen access from cached session
  const canAccessScreen = useCallback((screenId: ScreenId): boolean => {
    // Use session cache first
    if (session) {
      if (session.roleId === 'client_admin') return true;
      return session.permissions.some(p => p.screenId === screenId);
    }
    
    if (!currentRole) return false;
    if (currentRole.id === 'client_admin') return true;
    return currentRole.permissions.some(p => p.screenId === screenId);
  }, [session, currentRole]);

  const isClientAdmin = session?.roleId === 'client_admin' || currentRole?.id === 'client_admin';
  const isSupervisor = session?.roleId === 'supervisor' || currentRole?.id === 'supervisor';
  const isAgent = (!isClientAdmin && !isSupervisor && (session !== null || currentRole !== null));

  // Initialize session on mount
  useEffect(() => {
    if (currentUser && !session) {
      const storedSession = loadSession();
      
      if (storedSession && storedSession.userId === currentUser.id) {
        // Check if session is still valid (version check)
        const versions = getRoleVersions();
        const serverVersion = versions[currentUser.id] || 1;

        if (storedSession.version < serverVersion) {
          // Session is stale, refresh it
          notify.info(
            'Session Refreshed',
            'Your access permissions have been updated.'
          );
          refreshSession();
        } else {
          setSession(storedSession);
        }
      } else {
        // Create new session
        const newSession = createSession(currentUser);
        setSession(newSession);
      }
    }
  }, [currentUser, session, loadSession, createSession, refreshSession]);

  // Set up periodic role change check
  useEffect(() => {
    // Check every 10 seconds for role changes (in production, use WebSocket/SSE)
    sessionCheckInterval.current = setInterval(checkForRoleChanges, 10000);

    return () => {
      if (sessionCheckInterval.current) {
        clearInterval(sessionCheckInterval.current);
      }
    };
  }, [checkForRoleChanges]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      session,
      setCurrentUser,
      setUserRole,
      hasPermission,
      canAccessScreen,
      isClientAdmin,
      isSupervisor,
      isAgent,
      refreshSession,
      notifyRoleChange,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Export role data for use in role management
export function getAllRoles(): Role[] {
  return ALL_ROLES;
}
