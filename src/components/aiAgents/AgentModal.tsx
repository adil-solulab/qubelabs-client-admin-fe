import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Crown, Plus, Trash2, Loader2, Shield, Volume2, Play, Pause, Search, Sliders, X, User, Mic2, Heart, MessageSquare } from 'lucide-react';
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
import type { AIAgent, AgentType, ToneLevel, FallbackAction, ChannelType, GuardrailType, GuardrailConfig, VoiceStyleTone, VoiceClarity, VoiceSpeakingRate, VoiceEmotion, VoicePauseLength, VoiceFallbackTone, VoiceAccent } from '@/types/aiAgents';
import { TONE_LABELS, FALLBACK_ACTION_LABELS, CHANNEL_LABELS, GUARDRAIL_TYPE_LABELS, LLM_PROVIDERS, LANGUAGE_OPTIONS, TIMEZONE_OPTIONS, VOICE_STYLE_TONE_LABELS, VOICE_CLARITY_LABELS, VOICE_SPEAKING_RATE_LABELS, VOICE_EMOTION_LABELS, VOICE_PAUSE_LABELS, VOICE_FALLBACK_TONE_LABELS, VOICE_GENDER_LABELS, VOICE_AGE_LABELS, VOICE_ACCENT_LABELS, DEFAULT_VOICE_PROFILE } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  type: z.enum(['super_agent', 'agent']),
  superAgentId: z.string().optional(),
  businessCapability: z.string(),
  priorityScore: z.number().min(1).max(100),
  allowedChannels: z.array(z.enum(['voice', 'chat', 'email', 'whatsapp', 'sms'])).min(1, 'Select at least one channel'),
  escalationAllowed: z.boolean(),
  personaTone: z.enum(['formal', 'friendly', 'casual', 'empathetic', 'persuasive']),
  personaStyle: z.string().min(1),
  personaGreeting: z.string().min(1),
  personaPersonality: z.string().min(1),
  personaAdaptability: z.number().min(0).max(100),
  verbosityLevel: z.number().min(0).max(100),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  domainExpertiseLevel: z.enum(['beginner', 'intermediate', 'expert']),
  empathyLevel: z.number().min(0).max(100),
  brandVoiceProfile: z.string().min(1),
  timezone: z.string().min(1),
  interruptible: z.boolean(),
  expressiveMode: z.boolean(),
  defaultPersonality: z.boolean(),
  firstMessage: z.string(),
  disclosureRequirements: z.string(),
  llmProvider: z.string().min(1),
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
  voiceGender: z.enum(['male', 'female', 'neutral']),
  voiceAge: z.enum(['child', 'teen', 'adult', 'senior']),
  voiceAccent: z.enum(['us_english', 'uk_english', 'indian_english', 'australian', 'african_english', 'middle_eastern_english', 'neutral']),
  voiceStyleTone: z.enum(['cheerful', 'calm', 'professional', 'friendly', 'serious', 'energetic', 'authoritative', 'supportive', 'whispery', 'conversational', 'high_energy_sales', 'empathetic']),
  voicePitch: z.number().min(0).max(100),
  voiceSpeakingRate: z.enum(['slow', 'normal', 'fast', 'very_fast']),
  voiceStability: z.number().min(0).max(100),
  voiceClarity: z.enum(['softened', 'balanced', 'crisp']),
  voiceExpressiveness: z.number().min(0).max(100),
  voiceBreathiness: z.number().min(0).max(100),
  voiceWarmth: z.number().min(0).max(100),
  voiceEmotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'confident', 'excited', 'apologetic', 'analytical']),
  voiceEmotionStrength: z.number().min(0).max(100),
  voicePauseLength: z.enum(['short', 'medium', 'long']),
  voiceFillersEnabled: z.boolean(),
  voiceInterruptible: z.boolean(),
  voiceFallbackTone: z.enum(['professional', 'apologetic', 'neutral', 'informal']),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface AgentModalProps {
  agent: AIAgent | null;
  isEdit: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agentData: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  superAgents: AIAgent[];
  hasSuperAgent?: boolean;
}

export function AgentModal({ agent, isEdit, open, onOpenChange, onSave, superAgents, hasSuperAgent = false }: AgentModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basics');
  const [guardrails, setGuardrails] = useState<GuardrailConfig[]>([]);
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handleVoicePreview = () => {
    setIsPlayingPreview(true);
    setTimeout(() => setIsPlayingPreview(false), 3000);
  };

  const addGuardrail = () => {
    const newGuardrail: GuardrailConfig = {
      id: `guardrail-${Date.now()}`,
      type: 'content_filter',
      name: '',
      description: '',
      isActive: true,
      severity: 'medium',
      action: 'warn',
    };
    setGuardrails(prev => [...prev, newGuardrail]);
  };

  const updateGuardrail = (id: string, updates: Partial<GuardrailConfig>) => {
    setGuardrails(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const removeGuardrail = (id: string) => {
    setGuardrails(prev => prev.filter(g => g.id !== id));
  };

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'agent',
      superAgentId: superAgents[0]?.id || '',
      businessCapability: '',
      priorityScore: 50,
      allowedChannels: ['chat'] as ChannelType[],
      escalationAllowed: true,
      personaTone: 'friendly',
      personaStyle: 'Professional',
      personaGreeting: 'Hello! How can I help you today?',
      personaPersonality: '',
      personaAdaptability: 70,
      verbosityLevel: 50,
      riskTolerance: 'medium' as const,
      domainExpertiseLevel: 'intermediate' as const,
      empathyLevel: 50,
      brandVoiceProfile: '',
      timezone: 'UTC',
      interruptible: true,
      expressiveMode: false,
      defaultPersonality: true,
      firstMessage: '',
      disclosureRequirements: '',
      llmProvider: 'OpenAI',
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
      voiceGender: 'female',
      voiceAge: 'adult',
      voiceAccent: 'us_english',
      voiceStyleTone: 'professional',
      voicePitch: 50,
      voiceSpeakingRate: 'normal',
      voiceStability: 70,
      voiceClarity: 'balanced',
      voiceExpressiveness: 60,
      voiceBreathiness: 20,
      voiceWarmth: 65,
      voiceEmotion: 'neutral',
      voiceEmotionStrength: 50,
      voicePauseLength: 'medium',
      voiceFillersEnabled: false,
      voiceInterruptible: true,
      voiceFallbackTone: 'professional',
    },
  });

  useEffect(() => {
    if (agent && isEdit) {
      form.reset({
        name: agent.name,
        description: agent.description,
        type: agent.type,
        superAgentId: agent.superAgentId || '',
        businessCapability: agent.businessCapability || '',
        priorityScore: agent.priorityScore || 50,
        allowedChannels: agent.allowedChannels || ['chat'],
        escalationAllowed: agent.escalationAllowed ?? true,
        personaTone: agent.persona.tone,
        personaStyle: agent.persona.style,
        personaGreeting: agent.persona.greeting,
        personaPersonality: agent.persona.personality,
        personaAdaptability: agent.persona.adaptability,
        verbosityLevel: agent.persona.verbosityLevel ?? 50,
        riskTolerance: agent.persona.riskTolerance || 'medium',
        domainExpertiseLevel: agent.persona.domainExpertiseLevel || 'intermediate',
        empathyLevel: agent.persona.empathyLevel ?? 50,
        brandVoiceProfile: agent.persona.brandVoiceProfile || '',
        timezone: agent.timezone || 'UTC',
        interruptible: agent.interruptible ?? true,
        expressiveMode: agent.expressiveMode ?? false,
        defaultPersonality: agent.defaultPersonality ?? true,
        firstMessage: agent.firstMessage || '',
        disclosureRequirements: agent.disclosureRequirements || '',
        llmProvider: agent.llmProvider || 'OpenAI',
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
        voiceGender: agent.voiceProfile?.gender ?? 'female',
        voiceAge: agent.voiceProfile?.age ?? 'adult',
        voiceAccent: agent.voiceProfile?.accent ?? 'us_english',
        voiceStyleTone: agent.voiceProfile?.styleTone ?? 'professional',
        voicePitch: agent.voiceProfile?.pitch ?? 50,
        voiceSpeakingRate: agent.voiceProfile?.speakingRate ?? 'normal',
        voiceStability: agent.voiceProfile?.stability ?? 70,
        voiceClarity: agent.voiceProfile?.clarity ?? 'balanced',
        voiceExpressiveness: agent.voiceProfile?.expressiveness ?? 60,
        voiceBreathiness: agent.voiceProfile?.breathiness ?? 20,
        voiceWarmth: agent.voiceProfile?.warmth ?? 65,
        voiceEmotion: agent.voiceProfile?.emotion ?? 'neutral',
        voiceEmotionStrength: agent.voiceProfile?.emotionStrength ?? 50,
        voicePauseLength: agent.voiceProfile?.pauseLength ?? 'medium',
        voiceFillersEnabled: agent.voiceProfile?.fillersEnabled ?? false,
        voiceInterruptible: agent.voiceProfile?.interruptible ?? true,
        voiceFallbackTone: agent.voiceProfile?.fallbackTone ?? 'professional',
      });
      setLanguages(agent.languages || ['English']);
    } else if (!isEdit) {
      form.reset({
        name: '',
        description: '',
        type: 'agent',
        superAgentId: superAgents[0]?.id || '',
        businessCapability: '',
        priorityScore: 50,
        allowedChannels: ['chat'] as ChannelType[],
        escalationAllowed: true,
        personaTone: 'friendly',
        personaStyle: 'Professional',
        personaGreeting: 'Hello! How can I help you today?',
        personaPersonality: '',
        personaAdaptability: 70,
        verbosityLevel: 50,
        riskTolerance: 'medium' as const,
        domainExpertiseLevel: 'intermediate' as const,
        empathyLevel: 50,
        brandVoiceProfile: '',
        timezone: 'UTC',
        interruptible: true,
        expressiveMode: false,
        defaultPersonality: true,
        firstMessage: '',
        disclosureRequirements: '',
        llmProvider: 'OpenAI',
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
        voiceGender: 'female',
        voiceAge: 'adult',
        voiceAccent: 'us_english',
        voiceStyleTone: 'professional',
        voicePitch: 50,
        voiceSpeakingRate: 'normal',
        voiceStability: 70,
        voiceClarity: 'balanced',
        voiceExpressiveness: 60,
        voiceBreathiness: 20,
        voiceWarmth: 65,
        voiceEmotion: 'neutral',
        voiceEmotionStrength: 50,
        voicePauseLength: 'medium',
        voiceFillersEnabled: false,
        voiceInterruptible: true,
        voiceFallbackTone: 'professional',
      });
      setLanguages(['English']);
    }
    setActiveTab('basics');
    if (agent && isEdit) {
      setGuardrails(agent.guardrails || []);
    } else if (!isEdit) {
      setGuardrails([]);
    }
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
        businessCapability: values.businessCapability,
        priorityScore: values.priorityScore,
        allowedChannels: values.allowedChannels as ChannelType[],
        escalationAllowed: values.escalationAllowed,
        timezone: values.timezone,
        interruptible: values.interruptible,
        expressiveMode: values.expressiveMode,
        defaultPersonality: values.defaultPersonality,
        firstMessage: values.firstMessage,
        disclosureRequirements: values.disclosureRequirements,
        voices: [],
        voiceProfile: {
          gender: values.voiceGender,
          age: values.voiceAge,
          accent: values.voiceAccent,
          styleTone: values.voiceStyleTone,
          pitch: values.voicePitch,
          speakingRate: values.voiceSpeakingRate,
          stability: values.voiceStability,
          clarity: values.voiceClarity,
          expressiveness: values.voiceExpressiveness,
          breathiness: values.voiceBreathiness,
          warmth: values.voiceWarmth,
          emotion: values.voiceEmotion,
          emotionStrength: values.voiceEmotionStrength,
          pauseLength: values.voicePauseLength,
          fillersEnabled: values.voiceFillersEnabled,
          interruptible: values.voiceInterruptible,
          fallbackTone: values.voiceFallbackTone,
          customPronunciations: [],
        },
        languages: languages,
        llmProvider: values.llmProvider,
        persona: {
          tone: values.personaTone as ToneLevel,
          style: values.personaStyle,
          adaptability: values.personaAdaptability,
          greeting: values.personaGreeting,
          personality: values.personaPersonality,
          verbosityLevel: values.verbosityLevel,
          riskTolerance: values.riskTolerance,
          domainExpertiseLevel: values.domainExpertiseLevel,
          empathyLevel: values.empathyLevel,
          brandVoiceProfile: values.brandVoiceProfile,
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
        guardrails: guardrails,
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
                <TabsList className="w-full grid grid-cols-5">
                  <TabsTrigger value="basics" className="text-xs">Basics</TabsTrigger>
                  <TabsTrigger value="persona" className="text-xs">Persona</TabsTrigger>
                  <TabsTrigger value="prompt" className="text-xs">Prompt</TabsTrigger>
                  <TabsTrigger value="behavior" className="text-xs">Behavior</TabsTrigger>
                  <TabsTrigger value="guardrails" className="text-xs">Guardrails</TabsTrigger>
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
                  {form.watch('type') !== 'super_agent' && (
                  <FormField
                    control={form.control}
                    name="businessCapability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Capability</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select capability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Customer Service Orchestration">Customer Service Orchestration</SelectItem>
                            <SelectItem value="Sales & Revenue Generation">Sales & Revenue Generation</SelectItem>
                            <SelectItem value="Customer Support & Resolution">Customer Support & Resolution</SelectItem>
                            <SelectItem value="Technical Consultation">Technical Consultation</SelectItem>
                            <SelectItem value="Knowledge Retrieval & FAQ">Knowledge Retrieval & FAQ</SelectItem>
                            <SelectItem value="Lead Qualification">Lead Qualification</SelectItem>
                            <SelectItem value="Appointment Booking">Appointment Booking</SelectItem>
                            <SelectItem value="Order Management">Order Management</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priorityScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority Score ({field.value})</FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={100}
                              step={1}
                              value={[field.value]}
                              onValueChange={([v]) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormDescription>Higher score = higher priority</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="escalationAllowed"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <FormLabel>Escalation Allowed</FormLabel>
                            <FormDescription>Allow this agent to escalate to humans</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="allowedChannels"
                    render={() => (
                      <FormItem>
                        <FormLabel>Allowed Channels</FormLabel>
                        <div className="flex flex-wrap gap-2">
                          {(Object.entries(CHANNEL_LABELS) as [ChannelType, string][]).map(([value, label]) => {
                            const channels = form.watch('allowedChannels');
                            const isSelected = channels.includes(value);
                            return (
                              <button
                                key={value}
                                type="button"
                                onClick={() => {
                                  const current = form.getValues('allowedChannels');
                                  if (isSelected) {
                                    form.setValue('allowedChannels', current.filter(c => c !== value), { shouldValidate: true });
                                  } else {
                                    form.setValue('allowedChannels', [...current, value], { shouldValidate: true });
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Professional">Professional</SelectItem>
                            <SelectItem value="Casual">Casual</SelectItem>
                            <SelectItem value="Friendly">Friendly</SelectItem>
                            <SelectItem value="Formal">Formal</SelectItem>
                            <SelectItem value="Empathetic">Empathetic</SelectItem>
                            <SelectItem value="Confident">Confident</SelectItem>
                            <SelectItem value="Concise">Concise</SelectItem>
                          </SelectContent>
                        </Select>
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="verbosityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Verbosity Level ({field.value}%)</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[field.value]}
                              onValueChange={([v]) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormDescription>How detailed the responses should be</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="empathyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empathy Level ({field.value}%)</FormLabel>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={5}
                              value={[field.value]}
                              onValueChange={([v]) => field.onChange(v)}
                            />
                          </FormControl>
                          <FormDescription>Emotional sensitivity in responses</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="riskTolerance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Risk Tolerance</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="domainExpertiseLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domain Expertise</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="brandVoiceProfile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Voice Profile</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Approachable yet authoritative" {...field} />
                        </FormControl>
                        <FormDescription>Describe the brand voice this agent should adopt</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="prompt" className="space-y-5 mt-4">
                  <FormField
                    control={form.control}
                    name="systemPrompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Prompt</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Define the agent's behavior, capabilities, and constraints..." rows={6} className="font-mono text-sm" {...field} />
                        </FormControl>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[10px] text-muted-foreground">Type {'{{ }}'} to add variables</p>
                          <div className="flex items-center gap-3">
                            <FormField
                              control={form.control}
                              name="defaultPersonality"
                              render={({ field: dpField }) => (
                                <div className="flex items-center gap-1.5">
                                  <Switch checked={dpField.value} onCheckedChange={dpField.onChange} className="scale-75" />
                                  <span className="text-xs text-muted-foreground">Default personality</span>
                                </div>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="timezone"
                              render={({ field: tzField }) => (
                                <Select onValueChange={tzField.onChange} value={tzField.value}>
                                  <SelectTrigger className="h-7 text-xs w-auto gap-1 border-none shadow-none px-2 text-muted-foreground hover:text-foreground">
                                    <SelectValue placeholder="Set timezone" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TIMEZONE_OPTIONS.map(tz => (
                                      <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="firstMessage"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel>First Message</FormLabel>
                            <FormField
                              control={form.control}
                              name="disclosureRequirements"
                              render={({ field: drField }) => (
                                <button
                                  type="button"
                                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                                  onClick={() => {
                                    const val = drField.value ? '' : 'This conversation may be recorded for quality assurance purposes.';
                                    drField.onChange(val);
                                  }}
                                >
                                  Disclosure Requirements
                                </button>
                              )}
                            />
                          </div>
                          <FormControl>
                            <Textarea placeholder="Hi, I'm here to help you with your questions. How can I assist you today?" rows={2} {...field} />
                          </FormControl>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-[10px] text-muted-foreground">The first message the agent will say. If empty, the agent will wait for the user to start the conversation.</p>
                            <FormField
                              control={form.control}
                              name="interruptible"
                              render={({ field: intField }) => (
                                <div className="flex items-center gap-1.5">
                                  <Switch checked={intField.value} onCheckedChange={intField.onChange} className="scale-75" />
                                  <span className="text-xs text-muted-foreground">Interruptible</span>
                                </div>
                              )}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">Voice Identity</h4>
                      </div>

                      <FormField
                        control={form.control}
                        name="voiceGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Gender</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {(Object.entries(VOICE_GENDER_LABELS) as [string, string][]).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => field.onChange(value)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                    field.value === value
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Age</FormLabel>
                            <div className="flex gap-2">
                              {(Object.entries(VOICE_AGE_LABELS) as [string, string][]).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => field.onChange(value)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                    field.value === value
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceAccent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Accent</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(Object.entries(VOICE_ACCENT_LABELS) as [string, string][]).map(([value, label]) => (
                                  <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceStyleTone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Voice Style / Tone</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(Object.entries(VOICE_STYLE_TONE_LABELS) as [string, string][]).map(([value, label]) => (
                                  <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">Voice Technical Settings</h4>
                      </div>

                      <FormField
                        control={form.control}
                        name="voicePitch"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">Pitch</FormLabel>
                              <span className="text-xs font-medium text-primary tabular-nums">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="py-1" />
                            </FormControl>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-muted-foreground">Deep</span>
                              <span className="text-[10px] text-muted-foreground">High</span>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceSpeakingRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Speaking Rate</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(Object.entries(VOICE_SPEAKING_RATE_LABELS) as [string, string][]).map(([value, label]) => (
                                  <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceStability"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">Stability</FormLabel>
                              <span className="text-xs font-medium text-primary tabular-nums">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="py-1" />
                            </FormControl>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-muted-foreground">Variable</span>
                              <span className="text-[10px] text-muted-foreground">Stable</span>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceClarity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Clarity</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {(Object.entries(VOICE_CLARITY_LABELS) as [string, string][]).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => field.onChange(value)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                    field.value === value
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">Emotions & Expressiveness</h4>
                      </div>

                      <FormField
                        control={form.control}
                        name="voiceEmotion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Emotion</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(Object.entries(VOICE_EMOTION_LABELS) as [string, string][]).map(([value, label]) => (
                                  <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceEmotionStrength"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">Emotion Strength</FormLabel>
                              <span className="text-xs font-medium text-primary tabular-nums">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="py-1" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceExpressiveness"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">Expressiveness</FormLabel>
                              <span className="text-xs font-medium text-primary tabular-nums">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="py-1" />
                            </FormControl>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-muted-foreground">Monotone</span>
                              <span className="text-[10px] text-muted-foreground">Expressive</span>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceWarmth"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">Warmth</FormLabel>
                              <span className="text-xs font-medium text-primary tabular-nums">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="py-1" />
                            </FormControl>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-muted-foreground">Cool</span>
                              <span className="text-[10px] text-muted-foreground">Warm</span>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceBreathiness"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel className="text-xs">Breathiness</FormLabel>
                              <span className="text-xs font-medium text-primary tabular-nums">{field.value}%</span>
                            </div>
                            <FormControl>
                              <Slider min={0} max={100} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} className="py-1" />
                            </FormControl>
                            <div className="flex justify-between">
                              <span className="text-[10px] text-muted-foreground">Clear</span>
                              <span className="text-[10px] text-muted-foreground">Breathy</span>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">Conversational Behavior</h4>
                      </div>

                      <FormField
                        control={form.control}
                        name="voicePauseLength"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Pause Length</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {(Object.entries(VOICE_PAUSE_LABELS) as [string, string][]).map(([value, label]) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => field.onChange(value)}
                                  className={cn(
                                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                                    field.value === value
                                      ? 'bg-primary text-primary-foreground border-primary'
                                      : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                  )}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceFillersEnabled"
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                            <div>
                              <p className="text-xs font-medium">Fillers</p>
                              <p className="text-[10px] text-muted-foreground">"uh", "hmm", "let me check"</p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceInterruptible"
                        render={({ field }) => (
                          <div className="flex items-center justify-between p-2 rounded-lg border bg-background">
                            <div>
                              <p className="text-xs font-medium">Interruptibility</p>
                              <p className="text-[10px] text-muted-foreground">Can user interrupt mid-sentence?</p>
                            </div>
                            <Switch checked={field.value} onCheckedChange={field.onChange} className="scale-75" />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="voiceFallbackTone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Fallback Tone</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {(Object.entries(VOICE_FALLBACK_TONE_LABELS) as [string, string][]).map(([value, label]) => (
                                  <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Mic2 className="w-4 h-4 text-primary" />
                        <h4 className="text-sm font-semibold">Voice Preview</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant={isPlayingPreview ? 'default' : 'outline'}
                          size="sm"
                          className="h-8 text-xs gap-1.5"
                          onClick={handleVoicePreview}
                        >
                          {isPlayingPreview ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          {isPlayingPreview ? 'Playing...' : 'Preview Voice'}
                        </Button>
                        {isPlayingPreview && (
                          <div className="flex items-end gap-0.5 h-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                              <div
                                key={i}
                                className="w-0.5 bg-primary rounded-full animate-pulse"
                                style={{ height: `${4 + Math.random() * 12}px`, animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {VOICE_GENDER_LABELS[form.watch('voiceGender')]} · {VOICE_AGE_LABELS[form.watch('voiceAge')]} · {VOICE_ACCENT_LABELS[form.watch('voiceAccent')]} · {VOICE_STYLE_TONE_LABELS[form.watch('voiceStyleTone')]} · {VOICE_SPEAKING_RATE_LABELS[form.watch('voiceSpeakingRate')]} · {VOICE_EMOTION_LABELS[form.watch('voiceEmotion')]}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name="expressiveMode"
                        render={({ field }) => (
                          <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">&#127908;</span>
                              <span className="text-sm font-semibold">Expressive Mode</span>
                              <Badge variant="secondary" className="text-[9px] h-4 bg-primary/10 text-primary">New</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Enhance your agent with emotionally intelligent speech, natural intonation, and expressive audio.</p>
                            <div className="flex gap-2">
                              <Button type="button" variant={field.value ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => field.onChange(true)}>
                                Enable
                              </Button>
                              <Button type="button" variant={!field.value ? 'default' : 'outline'} size="sm" className="h-7 text-xs" onClick={() => field.onChange(false)}>
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Language</h4>
                        <p className="text-xs text-muted-foreground">Choose the default and additional languages</p>
                        <div className="space-y-1.5">
                          {languages.map((lang, i) => (
                            <div key={lang} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">&#127760;</span>
                                <span className="text-xs font-medium">{lang}</span>
                                {i === 0 && <Badge variant="secondary" className="text-[9px] h-4">Default</Badge>}
                              </div>
                              {i > 0 && (
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setLanguages(prev => prev.filter((_, idx) => idx !== i))}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <Select
                          onValueChange={(lang) => {
                            if (!languages.includes(lang)) {
                              setLanguages(prev => [...prev, lang]);
                            }
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="+ Add additional languages" />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_OPTIONS.filter(l => !languages.includes(l)).map(l => (
                              <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">LLM</h4>
                        <p className="text-xs text-muted-foreground">Select provider and model for the LLM</p>
                        <FormField
                          control={form.control}
                          name="llmProvider"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={(v) => {
                                field.onChange(v);
                                const models = LLM_PROVIDERS[v];
                                if (models && models.length > 0) {
                                  form.setValue('model', models[0].toLowerCase().replace(/\s+/g, '-'));
                                }
                              }} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.keys(LLM_PROVIDERS).map(p => (
                                    <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="model"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {(LLM_PROVIDERS[form.watch('llmProvider')] || []).map(m => (
                                    <SelectItem key={m} value={m.toLowerCase().replace(/\s+/g, '-')} className="text-xs">{m}</SelectItem>
                                  ))}
                                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                  <SelectItem value="claude-3">Claude 3</SelectItem>
                                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="temperature"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Temperature ({field.value})</FormLabel>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={2}
                                  step={0.1}
                                  value={[field.value]}
                                  onValueChange={([v]) => field.onChange(v)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxTokens"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Max Tokens</FormLabel>
                              <FormControl>
                                <Input type="number" min={1} max={4096} className="h-8 text-xs" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
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
                          {field.value > 20 && (
                            <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                              ⚠ Higher message count increases token utilization and may raise costs
                            </p>
                          )}
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

                <TabsContent value="guardrails" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">Guardrails</h4>
                      <p className="text-xs text-muted-foreground">Safety rules that control agent behavior</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addGuardrail}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Rule
                    </Button>
                  </div>

                  {guardrails.length === 0 && (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <Shield className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No guardrails configured</p>
                      <p className="text-xs text-muted-foreground mt-1">Add rules to control agent safety and compliance</p>
                      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addGuardrail}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add First Rule
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {guardrails.map((guardrail, index) => (
                      <div key={guardrail.id} className="border rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={guardrail.isActive}
                              onCheckedChange={(checked) => updateGuardrail(guardrail.id, { isActive: checked })}
                            />
                            <span className="text-xs font-medium text-muted-foreground">Rule {index + 1}</span>
                          </div>
                          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeGuardrail(guardrail.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Name</Label>
                            <Input
                              placeholder="Rule name"
                              value={guardrail.name}
                              onChange={(e) => updateGuardrail(guardrail.id, { name: e.target.value })}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={guardrail.type}
                              onValueChange={(v) => updateGuardrail(guardrail.id, { type: v as GuardrailType })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(GUARDRAIL_TYPE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs">Description</Label>
                          <Textarea
                            placeholder="Describe what this rule does..."
                            value={guardrail.description}
                            onChange={(e) => updateGuardrail(guardrail.id, { description: e.target.value })}
                            rows={2}
                            className="text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs">Severity</Label>
                            <Select
                              value={guardrail.severity}
                              onValueChange={(v) => updateGuardrail(guardrail.id, { severity: v as 'low' | 'medium' | 'high' })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Action</Label>
                            <Select
                              value={guardrail.action}
                              onValueChange={(v) => updateGuardrail(guardrail.id, { action: v as 'warn' | 'block' | 'flag' })}
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="warn">Warn</SelectItem>
                                <SelectItem value="block">Block</SelectItem>
                                <SelectItem value="flag">Flag for Review</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}
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
