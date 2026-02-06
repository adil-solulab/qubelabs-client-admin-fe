import { useState, useCallback } from 'react';
import type { Role, ScreenPermission, ActionType } from '@/types/roles';
import { SYSTEM_ROLES } from '@/types/roles';

// Initial mock data with system roles + custom roles
const generateMockRoles = (): Role[] => [
  ...SYSTEM_ROLES,
  {
    id: 'sales_agent',
    name: 'Sales Agent',
    description: 'Specialized role for sales team members with access to outbound calling.',
    isSystem: false,
    permissions: [
      { screenId: 'dashboard', actions: ['view'] },
      { screenId: 'knowledge-base', actions: ['view'] },
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
    description: 'Specialized role for support team with knowledge base editing access.',
    isSystem: false,
    permissions: [
      { screenId: 'dashboard', actions: ['view'] },
      { screenId: 'knowledge-base', actions: ['view', 'create', 'edit'] },
      { screenId: 'live-ops', actions: ['view', 'edit'] },
      { screenId: 'analytics', actions: ['view'] },
    ],
    userCount: 8,
    createdAt: '2024-07-01',
    updatedAt: '2024-07-10',
  },
];

export function useRolesData() {
  const [roles, setRoles] = useState<Role[]>(generateMockRoles());
  const [isLoading, setIsLoading] = useState(false);

  const createRole = useCallback(async (roleData: {
    name: string;
    description: string;
    permissions: ScreenPermission[];
  }) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newRole: Role = {
      id: `custom_${Date.now()}`,
      name: roleData.name,
      description: roleData.description,
      isSystem: false,
      permissions: roleData.permissions,
      userCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };
    
    setRoles(prev => [...prev, newRole]);
    setIsLoading(false);
    return newRole;
  }, []);

  const updateRole = useCallback(async (roleId: string, roleData: {
    name?: string;
    description?: string;
    permissions?: ScreenPermission[];
  }) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setRoles(prev => 
      prev.map(role => {
        if (role.id === roleId && !role.isSystem) {
          return {
            ...role,
            ...roleData,
            updatedAt: new Date().toISOString().split('T')[0],
          };
        }
        return role;
      })
    );
    setIsLoading(false);
  }, []);

  const deleteRole = useCallback(async (roleId: string): Promise<{ success: boolean; error?: string }> => {
    const role = roles.find(r => r.id === roleId);
    
    if (!role) {
      return { success: false, error: 'Role not found' };
    }
    
    if (role.isSystem) {
      return { success: false, error: 'Cannot delete system roles' };
    }
    
    if (role.userCount > 0) {
      return { success: false, error: `Cannot delete role assigned to ${role.userCount} users` };
    }
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setRoles(prev => prev.filter(r => r.id !== roleId));
    setIsLoading(false);
    return { success: true };
  }, [roles]);

  const hasPermission = useCallback((roleId: string, screenId: string, action: ActionType): boolean => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return false;
    
    const screenPerm = role.permissions.find(p => p.screenId === screenId);
    if (!screenPerm) return false;
    
    return screenPerm.actions.includes(action);
  }, [roles]);

  const canAccessScreen = useCallback((roleId: string, screenId: string): boolean => {
    return hasPermission(roleId, screenId, 'view');
  }, [hasPermission]);

  const getRoleById = useCallback((roleId: string): Role | undefined => {
    return roles.find(r => r.id === roleId);
  }, [roles]);

  return {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    hasPermission,
    canAccessScreen,
    getRoleById,
  };
}
