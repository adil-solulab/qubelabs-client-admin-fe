import { useState } from 'react';
import { Plus, Loader2, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import type { APIKey } from '@/types/integrations';

interface CreateAPIKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, permissions: string[]) => Promise<{ success: boolean; key?: APIKey }>;
}

const availablePermissions = [
  { id: 'read', label: 'Read', description: 'Read data from the API' },
  { id: 'write', label: 'Write', description: 'Create and update data' },
  { id: 'delete', label: 'Delete', description: 'Delete data' },
  { id: 'admin', label: 'Admin', description: 'Full administrative access' },
];

export function CreateAPIKeyModal({
  open,
  onOpenChange,
  onCreate,
}: CreateAPIKeyModalProps) {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>(['read']);
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<APIKey | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePermissionToggle = (permissionId: string) => {
    setPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleCreate = async () => {
    if (!name) return;

    setIsCreating(true);
    const result = await onCreate(name, permissions);
    setIsCreating(false);

    if (result.success && result.key) {
      setCreatedKey(result.key);
    }
  };

  const handleCopy = async () => {
    if (createdKey) {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName('');
    setPermissions(['read']);
    setCreatedKey(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key for accessing the platform programmatically.
          </DialogDescription>
        </DialogHeader>

        {!createdKey ? (
          <>
            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Production API Key"
                />
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <Label>Permissions</Label>
                {availablePermissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={permission.id}
                      checked={permissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={permission.id} className="cursor-pointer font-medium">
                        {permission.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} disabled={isCreating}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!name || permissions.length === 0 || isCreating}>
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Key
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl border bg-success/10 border-success/30">
                <p className="font-medium text-success mb-2">API Key Created!</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Make sure to copy your API key now. You won't be able to see it again.
                </p>
                
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 rounded-lg bg-background text-sm font-mono break-all">
                    {createdKey.key}
                  </code>
                  <Button size="icon" variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-sm">
                <p className="text-muted-foreground">
                  ⚠️ Store this key securely. It provides access to your account based on the permissions you selected.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
