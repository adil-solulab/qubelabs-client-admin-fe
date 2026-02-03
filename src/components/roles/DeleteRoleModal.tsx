import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import type { Role } from '@/types/roles';

interface DeleteRoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export function DeleteRoleModal({ 
  open, 
  onOpenChange, 
  role, 
  onConfirm, 
  isLoading 
}: DeleteRoleModalProps) {
  if (!role) return null;

  const canDelete = !role.isSystem && role.userCount === 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            {canDelete ? (
              <>
                Are you sure you want to delete the role <strong>"{role.name}"</strong>? 
                This action cannot be undone.
              </>
            ) : role.isSystem ? (
              <>
                System roles cannot be deleted. The <strong>"{role.name}"</strong> role 
                is required for the system to function properly.
              </>
            ) : (
              <>
                Cannot delete <strong>"{role.name}"</strong> because it is currently 
                assigned to <strong>{role.userCount} users</strong>. Please reassign 
                these users to a different role first.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Role
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
