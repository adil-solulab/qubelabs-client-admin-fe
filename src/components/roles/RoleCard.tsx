import { Users, Shield, ShieldCheck, Pencil, Trash2, Lock } from 'lucide-react';
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
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50 hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Icon & Title */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              role.isSystem 
                ? 'bg-primary/10 text-primary' 
                : 'bg-accent text-accent-foreground'
            }`}>
              {role.isSystem ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Shield className="w-6 h-6" />
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{role.name}</h3>
                {role.isSystem && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="text-xs gap-1">
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
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {role.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{role.userCount} {role.userCount === 1 ? 'user' : 'users'}</span>
                </div>
                <div className="text-muted-foreground">
                  {screenCount} screens • {permissionCount} permissions
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </CardContent>
    </Card>
  );
}
