import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import type { Role, ScreenPermission, ScreenId, ActionType } from '@/types/roles';
import { AVAILABLE_SCREENS, AVAILABLE_ACTIONS } from '@/types/roles';

interface RoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSave: (data: { name: string; description: string; permissions: ScreenPermission[] }) => Promise<void>;
  isLoading?: boolean;
}

export function RoleModal({ open, onOpenChange, role, onSave, isLoading }: RoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Map<ScreenId, Set<ActionType>>>(new Map());
  const [errors, setErrors] = useState<{ name?: string; permissions?: string }>({});

  const isEdit = !!role;

  useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name);
        setDescription(role.description);
        const permMap = new Map<ScreenId, Set<ActionType>>();
        role.permissions.forEach(p => {
          permMap.set(p.screenId, new Set(p.actions));
        });
        setPermissions(permMap);
      } else {
        setName('');
        setDescription('');
        setPermissions(new Map());
      }
      setErrors({});
    }
  }, [open, role]);

  const toggleScreenAccess = (screenId: ScreenId) => {
    setPermissions(prev => {
      const newMap = new Map(prev);
      if (newMap.has(screenId)) {
        newMap.delete(screenId);
      } else {
        newMap.set(screenId, new Set(['view']));
      }
      return newMap;
    });
  };

  const toggleAction = (screenId: ScreenId, action: ActionType) => {
    setPermissions(prev => {
      const newMap = new Map(prev);
      const actions = newMap.get(screenId) || new Set();
      
      if (action === 'view') {
        // If removing view, remove all actions for this screen
        if (actions.has('view')) {
          newMap.delete(screenId);
        } else {
          actions.add('view');
          newMap.set(screenId, actions);
        }
      } else {
        // For non-view actions, ensure view is enabled
        if (actions.has(action)) {
          actions.delete(action);
        } else {
          actions.add('view');
          actions.add(action);
        }
        newMap.set(screenId, actions);
      }
      
      return newMap;
    });
  };

  const handleSubmit = async () => {
    const newErrors: { name?: string; permissions?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Role name is required';
    }
    
    if (permissions.size === 0) {
      newErrors.permissions = 'At least one screen permission is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const permissionArray: ScreenPermission[] = [];
    permissions.forEach((actions, screenId) => {
      permissionArray.push({
        screenId,
        actions: Array.from(actions),
      });
    });

    await onSave({
      name: name.trim(),
      description: description.trim(),
      permissions: permissionArray,
    });
  };

  // Group screens by category
  const screensByCategory = AVAILABLE_SCREENS.reduce((acc, screen) => {
    if (!acc[screen.category]) acc[screen.category] = [];
    acc[screen.category].push(screen);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_SCREENS>);

  const categoryLabels: Record<string, string> = {
    core: 'Core Modules',
    operations: 'Operations',
    settings: 'Settings & Admin',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Role' : 'Create New Role'}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? 'Modify the role name, description, and permissions.' 
              : 'Define a new custom role with specific screen and action permissions.'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4 py-2 pr-1">
          {/* Basic Info - Fixed height section */}
          <div className="flex-shrink-0 space-y-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name *</Label>
              <Input
                id="role-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g., Sales Agent, Support Lead"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this role can do..."
                rows={2}
              />
            </div>
          </div>

          {/* Permissions - Flexible scrollable section */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <Label>Permissions *</Label>
              {errors.permissions && (
                <span className="text-sm text-destructive">{errors.permissions}</span>
              )}
            </div>
            
            <ScrollArea className="flex-1 min-h-0 border rounded-lg">
              <div className="p-4 space-y-6">
                {Object.entries(screensByCategory).map(([category, screens]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                      {categoryLabels[category]}
                    </h4>
                    <div className="space-y-3">
                      {screens.map(screen => {
                        const screenPerms = permissions.get(screen.id);
                        const hasAccess = !!screenPerms;
                        
                        return (
                          <div 
                            key={screen.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              hasAccess 
                                ? 'bg-primary/5 border-primary/20' 
                                : 'bg-muted/30 border-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`screen-${screen.id}`}
                                  checked={hasAccess}
                                  onCheckedChange={() => toggleScreenAccess(screen.id)}
                                />
                                <Label 
                                  htmlFor={`screen-${screen.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {screen.label}
                                </Label>
                              </div>
                              {hasAccess && (
                                <Badge variant="secondary" className="text-xs">
                                  {screenPerms?.size || 0} actions
                                </Badge>
                              )}
                            </div>
                            
                            {hasAccess && (
                              <div className="flex flex-wrap gap-2 mt-2 ml-6">
                                {AVAILABLE_ACTIONS.map(action => (
                                  <label
                                    key={action.id}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                                      screenPerms?.has(action.id)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                                  >
                                    <Checkbox
                                      checked={screenPerms?.has(action.id) || false}
                                      onCheckedChange={() => toggleAction(screen.id, action.id)}
                                      className="sr-only"
                                    />
                                    {action.label}
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
