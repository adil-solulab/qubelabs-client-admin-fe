import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import type { ScreenId, ActionType } from '@/types/roles';

/**
 * Hook for checking and enforcing action-level permissions
 */
export function usePermission(screenId: ScreenId) {
  const { hasPermission, isClientAdmin, currentRole } = useAuth();

  /**
   * Check if current user can perform an action
   */
  const can = useCallback((action: ActionType): boolean => {
    if (isClientAdmin) return true;
    return hasPermission(screenId, action);
  }, [screenId, hasPermission, isClientAdmin]);

  /**
   * Execute an action only if permitted, otherwise show error toast
   * Returns true if action was permitted, false otherwise
   */
  const withPermission = useCallback(<T,>(
    action: ActionType,
    callback: () => T
  ): T | undefined => {
    if (!can(action)) {
      notify.error(
        'Permission denied',
        'You do not have permission to perform this action.'
      );
      return undefined;
    }
    return callback();
  }, [can]);

  /**
   * Create a permission-gated handler
   */
  const createHandler = useCallback(<T extends (...args: any[]) => any>(
    action: ActionType,
    handler: T
  ): T | (() => void) => {
    if (!can(action)) {
      return (() => {
        notify.error(
          'Permission denied',
          'You do not have permission to perform this action.'
        );
      }) as any;
    }
    return handler;
  }, [can]);

  return {
    can,
    withPermission,
    createHandler,
    canView: can('view'),
    canCreate: can('create'),
    canEdit: can('edit'),
    canDelete: can('delete'),
    canExport: can('export'),
    canPublish: can('publish'),
    currentRole,
  };
}
