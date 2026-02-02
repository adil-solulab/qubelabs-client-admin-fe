import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Plus, Trash2, Loader2, Sparkles, MessageSquare } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import type { Persona, FewShotExample, PersonaType, ToneLevel } from '@/types/aiAgents';
import { PERSONA_TYPE_LABELS, TONE_LABELS } from '@/types/aiAgents';

const personaSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  type: z.enum(['sales', 'support', 'custom'] as const),
  description: z.string().min(10, 'Description must be at least 10 characters').max(200, 'Description must be less than 200 characters'),
  systemPrompt: z.string().min(20, 'System prompt must be at least 20 characters'),
  primaryTone: z.enum(['formal', 'friendly', 'casual', 'empathetic', 'persuasive'] as const),
  adaptability: z.number().min(0).max(100),
  voiceStyle: z.string().min(5, 'Voice style description required'),
});

type PersonaFormValues = z.infer<typeof personaSchema>;

interface PersonaModalProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personaData: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  isEdit?: boolean;
}

export function PersonaModal({ persona, open, onOpenChange, onSave, isEdit = false }: PersonaModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fewShotExamples, setFewShotExamples] = useState<FewShotExample[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<PersonaFormValues>({
    resolver: zodResolver(personaSchema),
    defaultValues: {
      name: '',
      type: 'custom',
      description: '',
      systemPrompt: '',
      primaryTone: 'friendly',
      adaptability: 50,
      voiceStyle: '',
    },
  });

  useEffect(() => {
    if (persona && isEdit) {
      form.reset({
        name: persona.name,
        type: persona.type,
        description: persona.description,
        systemPrompt: persona.systemPrompt,
        primaryTone: persona.toneSettings.primary,
        adaptability: persona.toneSettings.adaptability,
        voiceStyle: persona.toneSettings.voiceStyle,
      });
      setFewShotExamples(persona.fewShotExamples);
    } else {
      form.reset({
        name: '',
        type: 'custom',
        description: '',
        systemPrompt: '',
        primaryTone: 'friendly',
        adaptability: 50,
        voiceStyle: '',
      });
      setFewShotExamples([]);
    }
    setActiveTab('basic');
  }, [persona, isEdit, form, open]);

  const addFewShotExample = () => {
    setFewShotExamples(prev => [
      ...prev,
      { id: Date.now().toString(), userMessage: '', assistantResponse: '' },
    ]);
  };

  const updateFewShotExample = (id: string, field: 'userMessage' | 'assistantResponse', value: string) => {
    setFewShotExamples(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const removeFewShotExample = (id: string) => {
    setFewShotExamples(prev => prev.filter(ex => ex.id !== id));
  };

  const onSubmit = async (values: PersonaFormValues) => {
    setIsSubmitting(true);
    try {
      await onSave({
        name: values.name,
        type: values.type,
        description: values.description,
        systemPrompt: values.systemPrompt,
        fewShotExamples: fewShotExamples.filter(ex => ex.userMessage && ex.assistantResponse),
        toneSettings: {
          primary: values.primaryTone,
          adaptability: values.adaptability,
          voiceStyle: values.voiceStyle,
        },
        isActive: persona?.isActive ?? true,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            {isEdit ? 'Edit Persona' : 'Create New Persona'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update persona settings and behavior.' : 'Define a new AI persona with custom behavior and tone.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="prompt">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Prompt
                </TabsTrigger>
                <TabsTrigger value="examples">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Few-Shot
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px] mt-4 pr-4">
                <TabsContent value="basic" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sales Pro, Support Hero" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Persona Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(PERSONA_TYPE_LABELS).map(([value, label]) => (
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
                      name="primaryTone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Tone *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(TONE_LABELS).map(([value, label]) => (
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
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe what this persona does and its key characteristics..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="voiceStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Style *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Warm and understanding, Confident and engaging"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe how this persona should sound in voice conversations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="adaptability"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Tone Adaptability</FormLabel>
                          <span className="text-sm font-medium">{field.value}%</span>
                        </div>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                            max={100}
                            step={5}
                            className="py-2"
                          />
                        </FormControl>
                        <FormDescription>
                          How much the persona adapts its tone based on conversation context
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="prompt" className="space-y-4 mt-0">
                  <FormField
                    control={form.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="You are a professional representative who..."
                            className="resize-none font-mono text-sm"
                            rows={15}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The main instructions that define this persona's behavior
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="examples" className="space-y-4 mt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Few-Shot Examples</h4>
                      <p className="text-xs text-muted-foreground">
                        Provide example conversations to guide the persona's responses
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addFewShotExample}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Example
                    </Button>
                  </div>

                  {fewShotExamples.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <MessageSquare className="w-10 h-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No examples yet. Add conversation examples to improve response quality.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={addFewShotExample}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add First Example
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {fewShotExamples.map((example, index) => (
                        <Card key={example.id} className="relative">
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                Example {index + 1}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => removeFewShotExample(example.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">User Message</label>
                              <Textarea
                                value={example.userMessage}
                                onChange={(e) => updateFewShotExample(example.id, 'userMessage', e.target.value)}
                                placeholder="What the user might say..."
                                className="mt-1 resize-none text-sm"
                                rows={2}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Assistant Response</label>
                              <Textarea
                                value={example.assistantResponse}
                                onChange={(e) => updateFewShotExample(example.id, 'assistantResponse', e.target.value)}
                                placeholder="How the persona should respond..."
                                className="mt-1 resize-none text-sm"
                                rows={3}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </ScrollArea>
            </Tabs>

            <DialogFooter className="gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEdit ? 'Save Changes' : 'Create Persona'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
