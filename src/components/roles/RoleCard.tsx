import { Users, Shield, ShieldCheck, Pencil, Trash2, Lock, MonitorSmartphone, KeyRound } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Role } from '@/types/roles';

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  const permissionCount = role.permissions.reduce(
    (acc, p) => acc + p.actions.length, 
    0
  );
  const screenCount = role.permissions.length;

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30 h-full">
      <CardContent className="p-5 h-full flex flex-col">
        {/* Header Row: Icon + Title + Badge + Actions */}
        <div className="flex items-center gap-3 mb-3">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            role.isSystem 
              ? 'bg-primary/10 text-primary' 
              : 'bg-accent text-accent-foreground'
          }`}>
            {role.isSystem ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>
          
          {/* Title + Badge */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{role.name}</h3>
            {role.isSystem && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="text-xs gap-1 flex-shrink-0">
                    <Lock className="w-3 h-3" />
                    System
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  System roles cannot be modified or deleted
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {!role.isSystem && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(role)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Role</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(role)}
                      disabled={role.userCount > 0}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {role.userCount > 0 
                      ? 'Cannot delete - role has assigned users' 
                      : 'Delete Role'}
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        </div>
        
        {/* Description - Fixed height with 2-line clamp */}
        <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
          {role.description}
        </p>
        
        {/* Metadata Row - Pinned to bottom with consistent alignment */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {/* Users */}
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{role.userCount} {role.userCount === 1 ? 'user' : 'users'}</span>
            </div>
            
            {/* Screens */}
            <div className="flex items-center gap-1.5">
              <MonitorSmartphone className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{screenCount} screens</span>
            </div>
            
            {/* Permissions */}
            <div className="flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{permissionCount} permissions</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
