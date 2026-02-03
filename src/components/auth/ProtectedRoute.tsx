import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import type { ScreenId } from '@/types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  screenId?: ScreenId;
}

// Map routes to screen IDs
const routeToScreenId: Record<string, ScreenId> = {
  '/': 'dashboard',
  '/users': 'users',
  '/ai-agents': 'ai-agents',
  '/knowledge-base': 'knowledge-base',
  '/channels': 'channels',
  '/flow-builder': 'flow-builder',
  '/live-ops': 'live-ops',
  '/outbound-calls': 'outbound-calls',
  '/analytics': 'analytics',
  '/integrations': 'integrations',
  '/billing': 'billing',
  '/security': 'security',
  '/roles': 'roles',
  '/sdks': 'sdks',
  '/theme': 'theme',
};

// Routes that are always accessible (no permission check)
const publicRoutes = ['/login', '/forgot-password', '/profile'];

export function ProtectedRoute({ children, screenId }: ProtectedRouteProps) {
  const location = useLocation();
  const { canAccessScreen, isClientAdmin, currentRole } = useAuth();

  // Determine the screen ID from route if not provided
  const effectiveScreenId = screenId || routeToScreenId[location.pathname];

  // Check if this is a public route
  const isPublicRoute = publicRoutes.includes(location.pathname);

  // Check access permission
  const hasAccess = isPublicRoute || 
                    isClientAdmin || 
                    !effectiveScreenId || 
                    canAccessScreen(effectiveScreenId);

  useEffect(() => {
    if (!hasAccess && currentRole) {
      notify.error(
        'Access denied',
        'You do not have permission to access this page.'
      );
    }
  }, [hasAccess, currentRole, location.pathname]);

  if (!hasAccess) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}