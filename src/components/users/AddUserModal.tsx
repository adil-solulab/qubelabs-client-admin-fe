import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Mail, Phone, Building, Loader2 } from 'lucide-react';
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
import type { TeamUser, Skill } from '@/types/users';
import { AVAILABLE_SKILLS, ROLE_LABELS } from '@/types/users';

const addUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(['client_admin', 'supervisor', 'agent'] as const, {
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

  const handleSkillToggle = (skill: Skill) => {
    setSelectedSkills(prev => {
      const exists = prev.find(s => s.id === skill.id);
      if (exists) {
        return prev.filter(s => s.id !== skill.id);
      }
      return [...prev, skill];
    });
  };

  const onSubmit = async (values: AddUserFormValues) => {
    setIsSubmitting(true);
    try {
      await onAddUser({
        name: values.name,
        email: values.email,
        role: values.role,
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            {/* Skills Section - Only for agents */}
            {watchRole === 'agent' && (
              <div className="space-y-2">
                <FormLabel>Assigned Skills</FormLabel>
                <ScrollArea className="h-[140px] rounded-lg border p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_SKILLS.map((skill) => {
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
                </ScrollArea>
                {selectedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSkills.map(skill => (
                      <Badge key={skill.id} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2 pt-4">
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
