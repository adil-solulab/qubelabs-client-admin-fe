import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, Phone, Building, Loader2, Shield, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { TeamUser, Skill } from '@/types/users';
import { AVAILABLE_SKILLS } from '@/types/users';
import { useRolesData } from '@/hooks/useRolesData';

const addUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  role: z.string({
    required_error: 'Please select a role',
  }),
  status: z.enum(['available', 'busy', 'offline'] as const).default('offline'),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

interface AddUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddUser: (userData: Omit<TeamUser, 'id' | 'createdAt' | 'lastActive'>) => Promise<TeamUser>;
}

export function AddUserModal({ open, onOpenChange, onAddUser }: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const { roles, getRoleById } = useRolesData();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      role: undefined,
      status: 'offline',
    },
  });

  const watchRole = form.watch('role');
  const selectedRoleData = watchRole ? getRoleById(watchRole) : null;

  // Show skills for non-admin roles
  const showSkills = watchRole && watchRole !== 'client_admin';

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

  const onSubmit = async (values: AddUserFormValues) => {
    setIsSubmitting(true);
    try {
      await onAddUser({
        name: values.name,
        email: values.email,
        role: mapRoleToLegacy(values.role),
        status: values.status,
        skills: selectedSkills,
        phone: values.phone || undefined,
        department: values.department || undefined,
      });
      form.reset();
      setSelectedSkills([]);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedSkills([]);
    onOpenChange(false);
  };

  // Group skills by category
  const skillsByCategory = AVAILABLE_SKILLS.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary-foreground" />
            </div>
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new team member account with role and skill assignments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John Smith" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="john@company.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-9" placeholder="+1 (555) 000-0000" {...field} />
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
                            <Input className="pl-9" placeholder="Support" {...field} />
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
                            <SelectValue placeholder="Select a role">
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
                        Role determines which screens and actions this user can access.
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
                      <FormLabel>Initial Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
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
                    <ScrollArea className="h-[160px] rounded-lg border p-3">
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
                                      id={skill.id}
                                      checked={isSelected}
                                      onCheckedChange={() => handleSkillToggle(skill)}
                                    />
                                    <label
                                      htmlFor={skill.id}
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
                          <Badge key={skill.id} variant="secondary" className="text-xs">
                            {skill.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <DialogFooter className="gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}