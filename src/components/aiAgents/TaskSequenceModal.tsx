import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GripVertical, Plus, Trash2, GitBranch, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { TaskSequence, Persona } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

const taskSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Task name is required'),
  personaId: z.string().min(1, 'Persona is required'),
  description: z.string().min(1, 'Description is required'),
  condition: z.string().optional(),
  order: z.number(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Sequence name is required'),
  description: z.string().min(1, 'Description is required'),
  isActive: z.boolean(),
  tasks: z.array(taskSchema).min(1, 'At least one task is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskSequenceModalProps {
  sequence: TaskSequence | null;
  personas: Persona[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<TaskSequence, 'id'>) => Promise<void>;
  isEdit: boolean;
}

export function TaskSequenceModal({
  sequence,
  personas,
  open,
  onOpenChange,
  onSave,
  isEdit,
}: TaskSequenceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
      tasks: [{ id: Date.now().toString(), name: '', personaId: '', description: '', order: 1 }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });

  useEffect(() => {
    if (open) {
      if (isEdit && sequence) {
        form.reset({
          name: sequence.name,
          description: sequence.description,
          isActive: sequence.isActive,
          tasks: sequence.tasks.map((t, i) => ({
            id: t.id,
            name: t.name,
            personaId: t.personaId,
            description: t.description,
            condition: t.condition || '',
            order: i + 1,
          })),
        });
      } else {
        form.reset({
          name: '',
          description: '',
          isActive: true,
          tasks: [{ id: Date.now().toString(), name: '', personaId: '', description: '', order: 1 }],
        });
      }
    }
  }, [open, isEdit, sequence, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSave({
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        tasks: data.tasks.map((t, index) => ({
          id: t.id,
          name: t.name,
          personaId: t.personaId,
          description: t.description,
          condition: t.condition || undefined,
          order: index + 1,
        })),
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTask = () => {
    append({
      id: Date.now().toString(),
      name: '',
      personaId: '',
      description: '',
      condition: '',
      order: fields.length + 1,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Edit Task Sequence' : 'Create Task Sequence'}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Define multi-step AI conversation workflows
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
            {/*
              Keep the modal's built-in padding (DialogContent has p-6).
              Avoid negative margins here because DialogContent has overflow-hidden,
              which would clip input focus rings on the left/right.
            */}
            <ScrollArea className="flex-1 pr-3">
              {/* px-2/-mx-2 gives focus rings room inside the scroll viewport */}
              <div className="space-y-6 py-2 px-2 -mx-2">
                {/* Basic Info */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sequence Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sales Qualification Flow" {...field} />
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
                          <Textarea
                            placeholder="Describe the purpose of this sequence..."
                            className="resize-none"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <FormLabel className="mb-0">Active</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Enable this sequence for use in conversations
                          </p>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tasks Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-sm">Tasks</h3>
                      <p className="text-xs text-muted-foreground">
                        Drag to reorder. Each task uses a persona to handle that step.
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addTask}>
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Task
                    </Button>
                  </div>

                  {form.formState.errors.tasks?.root && (
                    <p className="text-sm text-destructive">{form.formState.errors.tasks.root.message}</p>
                  )}

                  <div className="space-y-3 pb-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          'relative rounded-lg border bg-card p-4 ml-4 transition-all',
                          draggedIndex === index && 'opacity-50 border-primary',
                          'hover:border-primary/50'
                        )}
                      >
                        {/* Order indicator */}
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>

                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <div className="cursor-grab active:cursor-grabbing pt-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <FormField
                                control={form.control}
                                name={`tasks.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Task Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., Initial Greeting" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`tasks.${index}.personaId`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-xs">Persona</FormLabel>
                                    <Select value={field.value} onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select persona" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {personas.map(persona => (
                                          <SelectItem key={persona.id} value={persona.id}>
                                            <div className="flex items-center gap-2">
                                              <Badge variant="outline" className="text-[10px]">
                                                {persona.type}
                                              </Badge>
                                              {persona.name}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`tasks.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs">Description</FormLabel>
                                  <FormControl>
                                    <Input placeholder="What does this task do?" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`tasks.${index}.condition`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-xs flex items-center gap-1.5">
                                    <Zap className="w-3 h-3" />
                                    Condition (optional)
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., If customer has concerns"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Delete Button */}
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Sequence'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
