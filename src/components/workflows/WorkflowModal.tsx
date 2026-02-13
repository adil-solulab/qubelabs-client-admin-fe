import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { Workflow, WorkflowCategory } from '@/types/workflows';
import { CATEGORY_LABELS } from '@/types/workflows';

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  category: z.enum(['customer_service', 'sales', 'operations', 'marketing', 'custom']),
});

type WorkflowFormValues = z.infer<typeof workflowSchema>;

interface WorkflowModalProps {
  workflow: Workflow | null;
  isEdit: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { name: string; description: string; category: WorkflowCategory }) => Promise<void>;
}

export function WorkflowModal({ workflow, isEdit, open, onOpenChange, onSave }: WorkflowModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'custom',
    },
  });

  useEffect(() => {
    if (workflow && isEdit) {
      form.reset({
        name: workflow.name,
        description: workflow.description,
        category: workflow.category,
      });
    } else if (!isEdit) {
      form.reset({
        name: '',
        description: '',
        category: 'custom',
      });
    }
  }, [workflow, isEdit, open, form]);

  const handleSubmit = async (values: WorkflowFormValues) => {
    setIsSaving(true);
    try {
      await onSave({
        name: values.name,
        description: values.description,
        category: values.category as WorkflowCategory,
      });
      onOpenChange(false);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            {isEdit ? 'Edit Workflow' : 'Create Workflow'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form id="workflow-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Workflow Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Order Status Lookup" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this workflow does..." rows={3} {...field} />
                    </FormControl>
                    <FormDescription>Explain the business logic this workflow executes</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="workflow-form" disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
