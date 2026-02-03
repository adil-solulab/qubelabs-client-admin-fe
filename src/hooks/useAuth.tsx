import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Role } from '@/types/roles';
import { SYSTEM_ROLES } from '@/types/roles';
import type { ActionType, ScreenId } from '@/types/roles';

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  avatar?: string;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  currentRole: Role | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  setUserRole: (roleId: string) => void;
  hasPermission: (screenId: ScreenId, action: ActionType) => boolean;
  canAccessScreen: (screenId: ScreenId) => boolean;
  isClientAdmin: boolean;
  isSupervisor: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    ],
    userCount: 8,
    createdAt: '2024-07-01',
    updatedAt: '2024-07-10',
  },
];

// Default to Client Admin for demo purposes
const DEFAULT_USER: CurrentUser = {
  id: '1',
  name: 'John Anderson',
  email: 'john.anderson@acmecorp.com',
  roleId: 'client_admin',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(DEFAULT_USER);

  const currentRole = currentUser 
    ? ALL_ROLES.find(r => r.id === currentUser.roleId) || null 
    : null;

  const setUserRole = useCallback((roleId: string) => {
    setCurrentUser(prev => prev ? { ...prev, roleId } : null);
  }, []);

  const hasPermission = useCallback((screenId: ScreenId, action: ActionType): boolean => {
    if (!currentRole) return false;
    const screenPerm = currentRole.permissions.find(p => p.screenId === screenId);
    return screenPerm?.actions.includes(action) || false;
  }, [currentRole]);

  const canAccessScreen = useCallback((screenId: ScreenId): boolean => {
    if (!currentRole) return false;
    // Client admin can access everything
    if (currentRole.id === 'client_admin') return true;
    return currentRole.permissions.some(p => p.screenId === screenId);
  }, [currentRole]);

  const isClientAdmin = currentRole?.id === 'client_admin';
  const isSupervisor = currentRole?.id === 'supervisor';
  const isAgent = currentRole?.id === 'agent' || 
    (!isClientAdmin && !isSupervisor && currentRole !== null);

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentRole,
      setCurrentUser,
      setUserRole,
      hasPermission,
      canAccessScreen,
      isClientAdmin,
      isSupervisor,
      isAgent,
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
