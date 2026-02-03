import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Pencil, Mail, Phone, Building, Loader2, X, Shield, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TeamUser, Skill } from '@/types/users';
import { AVAILABLE_SKILLS, STATUS_LABELS } from '@/types/users';
import { useRolesData } from '@/hooks/useRolesData';
import { notify } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';

const editUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  role: z.string(),
  status: z.enum(['available', 'busy', 'offline'] as const),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

interface EditUserDrawerProps {
  user: TeamUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateUser: (userId: string, userData: Partial<TeamUser>) => Promise<void>;
}

export function EditUserDrawer({ user, open, onOpenChange, onUpdateUser }: EditUserDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const { roles, getRoleById } = useRolesData();
  const previousRoleRef = useRef<string | null>(null);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      role: 'agent',
      status: 'offline',
    },
  });

  const watchRole = form.watch('role');
  const selectedRoleData = watchRole ? getRoleById(watchRole) : null;

  // Show skills for non-admin roles
  const showSkills = watchRole && watchRole !== 'client_admin';

  // Update form when user changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
        role: user.role,
        status: user.status,
      });
      setSelectedSkills(user.skills);
      previousRoleRef.current = user.role;
    }
  }, [user, form]);

  // Show info toast when role changes
  useEffect(() => {
    if (previousRoleRef.current && watchRole && previousRoleRef.current !== watchRole && user) {
      const newRole = getRoleById(watchRole);
      if (newRole) {
        notify.info(
          'User permissions updated',
          `Role changed to "${newRole.name}". New permissions will apply immediately.`
        );
      }
      previousRoleRef.current = watchRole;
    }
  }, [watchRole, getRoleById, user]);

  const handleSkillToggle = (skill: Skill) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.id === skill.id);
      if (exists) {
        return prev.filter(s => s.id !== skill.id);
      }
      return [...prev, skill];
    });
  };

  // Map role ID to legacy role type for TeamUser
  const mapRoleToLegacy = (roleId: string): 'client_admin' | 'supervisor' | 'agent' => {
    if (roleId === 'client_admin') return 'client_admin';
    if (roleId === 'supervisor') return 'supervisor';
    return 'agent'; // Custom roles default to agent-level
  };

  const onSubmit = async (values: EditUserFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await onUpdateUser(user.id, {
        ...values,
        role: mapRoleToLegacy(values.role),
        skills: selectedSkills,
        phone: values.phone || undefined,
        department: values.department || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Group skills by category
  const skillsByCategory = AVAILABLE_SKILLS.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col h-full overflow-hidden">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-primary" />
            Edit User
          </SheetTitle>
          <SheetDescription>
            Update user information, role, and skill assignments.
          </SheetDescription>
        </SheetHeader>

        {/* User Preview Card */}
        <div className="flex-shrink-0 mt-4 p-4 rounded-xl border bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-14 h-14">
                <AvatarFallback className="gradient-primary text-primary-foreground text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background',
                getStatusColor(user.status)
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{user.name}</h3>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs gap-1">
                  <Shield className="w-3 h-3" />
                  {selectedRoleData?.name || user.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {user.lastActive}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-4 flex-shrink-0" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 min-h-0 pr-4">
              <div className="space-y-4 py-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Role Selection */}
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue>
                              {selectedRoleData && (
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-primary" />
                                  {selectedRoleData.name}
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              <div className="flex items-center gap-2">
                                <Shield className={`w-4 h-4 ${role.isSystem ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div>
                                  <span>{role.name}</span>
                                  {role.isSystem && (
                                    <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1">
                                      System
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Role determines screen and action access.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Role Permission Preview */}
                {selectedRoleData && (
                  <Alert className="bg-muted/50 border-muted">
                    <Info className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      <strong>{selectedRoleData.name}</strong> has access to{' '}
                      <span className="text-primary font-medium">{selectedRoleData.permissions.length} screens</span>{' '}
                      with{' '}
                      <span className="text-primary font-medium">
                        {selectedRoleData.permissions.reduce((acc, p) => acc + p.actions.length, 0)} permissions
                      </span>.
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <div className={cn('w-2 h-2 rounded-full', getStatusColor(value))} />
                                {label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Skills Section - For non-admin roles */}
                {showSkills && (
                  <div className="space-y-3">
                    <div>
                      <FormLabel>Assigned Skills</FormLabel>
                      <FormDescription>
                        Skills affect conversation routing, not permissions.
                      </FormDescription>
                    </div>
                    <ScrollArea className="h-[140px] rounded-lg border p-3">
                      <div className="space-y-4">
                        {Object.entries(skillsByCategory).map(([category, skills]) => (
                          <div key={category}>
                            <p className="text-xs font-medium text-muted-foreground mb-2">{category}</p>
                            <div className="grid grid-cols-2 gap-2">
                              {skills.map((skill) => {
                                const isSelected = selectedSkills.some(s => s.id === skill.id);
                                return (
                                  <div
                                    key={skill.id}
                                    className="flex items-center space-x-2"
                                  >
                                    <Checkbox
                                      id={`edit-${skill.id}`}
                                      checked={isSelected}
                                      onCheckedChange={() => handleSkillToggle(skill)}
                                    />
                                    <label
                                      htmlFor={`edit-${skill.id}`}
                                      className="text-sm cursor-pointer flex-1"
                                    >
                                      {skill.name}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedSkills.map(skill => (
                          <Badge key={skill.id} variant="secondary" className="text-xs gap-1">
                            {skill.name}
                            <X 
                              className="w-3 h-3 cursor-pointer hover:text-destructive"
                              onClick={() => handleSkillToggle(skill)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <SheetFooter className="flex-shrink-0 gap-2 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}