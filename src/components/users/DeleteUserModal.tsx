import { useState } from 'react';
import { AlertTriangle, Loader2, Trash2, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { TeamUser } from '@/types/users';
import { ROLE_LABELS } from '@/types/users';

interface DeleteUserModalProps {
  user: TeamUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleteUser: (userId: string) => Promise<void>;
}

export function DeleteUserModal({ user, open, onOpenChange, onDeleteUser }: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleDelete = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      await onDeleteUser(user.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Delete User</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Are you sure you want to delete this user? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* User Preview */}
        <div className="my-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-muted">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold">{user.name}</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="outline" className="mt-1 text-xs">
                {ROLE_LABELS[user.role]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-warning">Warning</p>
              <p className="text-muted-foreground mt-0.5">
                Deleting this user will remove all their access to the platform, 
                including any active sessions and assigned conversations.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Delete User
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
