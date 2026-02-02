import { useState } from 'react';
import { LogOut, Loader2, AlertTriangle, Monitor, Smartphone, Globe } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface LogoutAllSessionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionCount: number;
  onLogoutAll: () => Promise<{ success: boolean }>;
}

export function LogoutAllSessionsModal({
  open,
  onOpenChange,
  sessionCount,
  onLogoutAll,
}: LogoutAllSessionsModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogoutAll = async () => {
    setIsLoading(true);
    await onLogoutAll();
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-xl">Logout from all devices?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            This will log you out from all other devices and sessions except the current one.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Info Box */}
        <div className="my-4 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Affected sessions:</span>
            </div>
            <span className="font-semibold">{sessionCount - 1} other device{sessionCount - 1 !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Warning List */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>All other sessions will be immediately terminated</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>Users on those devices will need to log in again</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
            <span>Unsaved work on other devices may be lost</span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLogoutAll} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Logout All Devices
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
