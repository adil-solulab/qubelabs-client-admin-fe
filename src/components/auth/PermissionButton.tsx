import { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import type { ScreenId, ActionType } from '@/types/roles';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionButtonProps extends ButtonProps {
  screenId: ScreenId;
  action: ActionType;
  /** If true, hide the button entirely when unauthorized. Otherwise, show disabled. */
  hideWhenUnauthorized?: boolean;
  /** Custom tooltip message when unauthorized */
  unauthorizedMessage?: string;
}

export const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({ 
    screenId, 
    action, 
    hideWhenUnauthorized = false, 
    unauthorizedMessage,
    onClick,
    children,
    className,
    disabled,
    ...props 
  }, ref) => {
    const { hasPermission, isClientAdmin } = useAuth();
    
    const isAuthorized = isClientAdmin || hasPermission(screenId, action);

    // If unauthorized and should hide, return null
    if (!isAuthorized && hideWhenUnauthorized) {
      return null;
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isAuthorized) {
        e.preventDefault();
        e.stopPropagation();
        notify.error(
          'Permission denied',
          'You do not have permission to perform this action.'
        );
        return;
      }
      onClick?.(e);
    };

    const button = (
      <Button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || !isAuthorized}
        className={cn(
          !isAuthorized && 'opacity-50 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {!isAuthorized && <Lock className="w-3 h-3 mr-1.5" />}
        {children}
      </Button>
    );

    // Wrap in tooltip if unauthorized
    if (!isAuthorized) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            {unauthorizedMessage || `You don't have ${action} permission for this section.`}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

PermissionButton.displayName = 'PermissionButton';
