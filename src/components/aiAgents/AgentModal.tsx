import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Crown, Plus, Trash2, Loader2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import type { AIAgent, AgentType, ToneLevel, FallbackAction } from '@/types/aiAgents';
import { TONE_LABELS, FALLBACK_ACTION_LABELS } from '@/types/aiAgents';

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  type: z.enum(['super_agent', 'agent']),
  superAgentId: z.string().optional(),
  personaTone: z.enum(['formal', 'friendly', 'casual', 'empathetic', 'persuasive']),
  personaStyle: z.string().min(1),
  personaGreeting: z.string().min(1),
  personaPersonality: z.string().min(1),
  personaAdaptability: z.number().min(0).max(100),
  systemPrompt: z.string().min(1, 'System prompt is required'),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(1).max(4096),
  fallbackAction: z.enum(['escalate', 'retry', 'transfer', 'end', 'custom_message']),
  fallbackMaxRetries: z.number().min(0).max(10),
  fallbackTimeout: z.number().min(5).max(300),
  fallbackMessage: z.string().optional(),
  memoryWindow: z.number().min(1).max(50),
  persistSessions: z.boolean(),
  shareContext: z.boolean(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface AgentModalProps {
  agent: AIAgent | null;
  isEdit: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agentData: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  superAgents: AIAgent[];
}

export function AgentModal({ agent, isEdit, open, onOpenChange, onSave, superAgents }: AgentModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'agent',
      superAgentId: superAgents[0]?.id || '',
      personaTone: 'friendly',
      personaStyle: 'Professional',
      personaGreeting: 'Hello! How can I help you today?',
      personaPersonality: '',
      personaAdaptability: 70,
      systemPrompt: '',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 512,
      fallbackAction: 'escalate',
      fallbackMaxRetries: 2,
      fallbackTimeout: 30,
      fallbackMessage: '',
      memoryWindow: 10,
      persistSessions: true,
      shareContext: true,
    },
  });

  useEffect(() => {
    if (agent && isEdit) {
      form.reset({
        name: agent.name,
        description: agent.description,
        type: agent.type,
        superAgentId: agent.superAgentId || '',
        personaTone: agent.persona.tone,
        personaStyle: agent.persona.style,
        personaGreeting: agent.persona.greeting,
        personaPersonality: agent.persona.personality,
        personaAdaptability: agent.persona.adaptability,
        systemPrompt: agent.prompt.systemPrompt,
        model: agent.prompt.model,
        temperature: agent.prompt.temperature,
        maxTokens: agent.prompt.maxTokens,
        fallbackAction: agent.fallback.action,
        fallbackMaxRetries: agent.fallback.maxRetries,
        fallbackTimeout: agent.fallback.timeoutSeconds,
        fallbackMessage: agent.fallback.customMessage || '',
        memoryWindow: agent.context.memoryWindow,
        persistSessions: agent.context.persistAcrossSessions,
        shareContext: agent.context.shareContextWithAgents,
      });
    } else if (!isEdit) {
      form.reset({
        name: '',
        description: '',
        type: 'agent',
        superAgentId: superAgents[0]?.id || '',
        personaTone: 'friendly',
        personaStyle: 'Professional',
        personaGreeting: 'Hello! How can I help you today?',
        personaPersonality: '',
        personaAdaptability: 70,
        systemPrompt: '',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 512,
        fallbackAction: 'escalate',
        fallbackMaxRetries: 2,
        fallbackTimeout: 30,
        fallbackMessage: '',
        memoryWindow: 10,
        persistSessions: true,
        shareContext: true,
      });
    }
    setActiveTab('basics');
  }, [agent, isEdit, open, form, superAgents]);

  const handleSubmit = async (values: AgentFormValues) => {
    setIsSaving(true);
    try {
      const agentData: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'> = {
        name: values.name,
        description: values.description,
        type: values.type as AgentType,
        superAgentId: values.type === 'agent' ? values.superAgentId : undefined,
        status: agent?.status || 'draft',
        persona: {
          tone: values.personaTone as ToneLevel,
          style: values.personaStyle,
          adaptability: values.personaAdaptability,
          greeting: values.personaGreeting,
          personality: values.personaPersonality,
        },
        intents: agent?.intents || [],
        triggers: agent?.triggers || [],
        prompt: {
          systemPrompt: values.systemPrompt,
          fewShotExamples: agent?.prompt.fewShotExamples || [],
          temperature: values.temperature,
          maxTokens: values.maxTokens,
          model: values.model,
        },
        variables: agent?.variables || [],
        routing: agent?.routing || { mode: 'manual', rules: [] },
        fallback: {
          action: values.fallbackAction as FallbackAction,
          maxRetries: values.fallbackMaxRetries,
          customMessage: values.fallbackMessage,
          timeoutSeconds: values.fallbackTimeout,
        },
        context: {
          memoryWindow: values.memoryWindow,
          persistAcrossSessions: values.persistSessions,
          contextVariables: agent?.context.contextVariables || [],
          shareContextWithAgents: values.shareContext,
        },
        guardrails: agent?.guardrails || [],
      };
      await onSave(agentData);
      onOpenChange(false);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {form.watch('type') === 'super_agent' ? (
              <Crown className="w-5 h-5 text-primary" />
            ) : (
              <Bot className="w-5 h-5 text-primary" />
            )}
            {isEdit ? 'Edit Agent' : 'Create Agent'}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <Form {...form}>
            <form id="agent-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="basics" className="text-xs">Basics</TabsTrigger>
                  <TabsTrigger value="persona" className="text-xs">Persona</TabsTrigger>
                  <TabsTrigger value="prompt" className="text-xs">Prompt</TabsTrigger>
                  <TabsTrigger value="behavior" className="text-xs">Behavior</TabsTrigger>
                </TabsList>

                <TabsContent value="basics" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sales Agent" {...field} />
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
                          <Textarea placeholder="Describe what this agent does..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Agent Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="super_agent">Super Agent (Orchestrator)</SelectItem>
                            <SelectItem value="agent">Agent (Specialist)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {field.value === 'super_agent'
                            ? 'Super Agents route queries to specialized agents'
                            : 'Agents handle specific tasks assigned by a Super Agent'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch('type') === 'agent' && superAgents.length > 0 && (
                    <FormField
                      control={form.control}
                      name="superAgentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Super Agent</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a Super Agent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {superAgents.map(sa => (
                                <SelectItem key={sa.id} value={sa.id}>{sa.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </TabsContent>

                <TabsContent value="persona" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="personaTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(TONE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personaStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communication Style</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Confident and engaging" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personaGreeting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Greeting Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="The first message users see..." rows={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personaPersonality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personality</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the agent's personality traits..." rows={3} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="personaAdaptability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adaptability ({field.value}%)</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={([v]) => field.onChange(v)}
                          />
                        </FormControl>
                        <FormDescription>How much the agent adapts its tone based on conversation context</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="prompt" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Define the agent's behavior, capabilities, and constraints..." rows={8} className="font-mono text-sm" {...field} />
                        </FormControl>
                        <FormDescription>The core instructions that define how this agent behaves</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              <SelectItem value="claude-3">Claude 3</SelectItem>
                              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature ({field.value})</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={2}
                              step={0.1}
                              value={[field.value]}
                              onValueChange={([v]) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="maxTokens"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Tokens</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} max={4096} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="behavior" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Fallback Behavior</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="fallbackAction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fallback Action</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(FALLBACK_ACTION_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fallbackMaxRetries"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Retries</FormLabel>
                            <FormControl>
                              <Input type="number" min={0} max={10} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fallbackTimeout"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timeout (sec)</FormLabel>
                            <FormControl>
                              <Input type="number" min={5} max={300} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {(form.watch('fallbackAction') === 'custom_message') && (
                      <FormField
                        control={form.control}
                        name="fallbackMessage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custom Fallback Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Message to show when fallback triggers..." rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Context Handling</h4>
                    <FormField
                      control={form.control}
                      name="memoryWindow"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Memory Window ({field.value} messages)</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={50}
                              step={1}
                              value={[field.value]}
                              onValueChange={([v]) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormDescription>Number of previous messages the agent remembers</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-6">
                      <FormField
                        control={form.control}
                        name="persistSessions"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="cursor-pointer">Persist Across Sessions</FormLabel>
                              <FormDescription className="text-xs">Remember context between conversations</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="shareContext"
                        render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0">
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div>
                              <FormLabel className="cursor-pointer">Share Context</FormLabel>
                              <FormDescription className="text-xs">Share context with other agents</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="agent-form" disabled={isSaving}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
