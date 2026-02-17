import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Volume2, Sliders, Play, Pause, User, Mic2, Settings2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type {
  Persona,
  ToneLevel,
  VoiceGender,
  VoiceAge,
  VoiceAccent,
  VoiceStyleTone,
  VoiceClarity,
  VoiceSpeakingRate,
  VoiceEmotion,
  VoicePauseLength,
  VoiceFallbackTone,
} from '@/types/aiAgents';
import {
  TONE_LABELS,
  VOICE_GENDER_LABELS,
  VOICE_AGE_LABELS,
  VOICE_ACCENT_LABELS,
  VOICE_STYLE_TONE_LABELS,
  VOICE_CLARITY_LABELS,
  VOICE_SPEAKING_RATE_LABELS,
  VOICE_EMOTION_LABELS,
  VOICE_PAUSE_LABELS,
  VOICE_FALLBACK_TONE_LABELS,
  DEFAULT_VOICE_PROFILE,
} from '@/types/aiAgents';

const formSchema = z.object({
  primary: z.enum(['formal', 'friendly', 'casual', 'empathetic', 'persuasive']),
  adaptability: z.number().min(0).max(100),
  voiceStyle: z.string().min(1, 'Voice style is required'),
  gender: z.enum(['male', 'female', 'neutral']),
  age: z.enum(['child', 'teen', 'adult', 'senior']),
  accent: z.enum(['us_english', 'uk_english', 'indian_english', 'australian', 'african_english', 'middle_eastern_english', 'neutral']),
  styleTone: z.enum(['cheerful', 'calm', 'professional', 'friendly', 'serious', 'energetic', 'authoritative', 'supportive', 'whispery', 'conversational', 'high_energy_sales', 'empathetic']),
  pitch: z.number().min(0).max(100),
  speakingRate: z.enum(['slow', 'normal', 'fast', 'very_fast']),
  stability: z.number().min(0).max(100),
  clarity: z.enum(['softened', 'balanced', 'crisp']),
  expressiveness: z.number().min(0).max(100),
  breathiness: z.number().min(0).max(100),
  warmth: z.number().min(0).max(100),
  emotion: z.enum(['neutral', 'happy', 'sad', 'angry', 'confident', 'excited', 'apologetic', 'analytical']),
  emotionStrength: z.number().min(0).max(100),
  pauseLength: z.enum(['short', 'medium', 'long']),
  fillersEnabled: z.boolean(),
  interruptible: z.boolean(),
  fallbackTone: z.enum(['professional', 'apologetic', 'neutral', 'informal']),
});

type FormValues = z.infer<typeof formSchema>;

interface VoiceSettingsModalProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personaId: string, toneSettings: Persona['toneSettings'], voiceProfile?: Persona['voiceProfile']) => Promise<void>;
}

const SLIDER_CONFIGS: { key: keyof FormValues; label: string; lowLabel: string; highLabel: string; description: string }[] = [
  { key: 'pitch', label: 'Pitch', lowLabel: 'Deep', highLabel: 'High', description: 'Controls the vocal pitch from deep to high' },
  { key: 'stability', label: 'Stability', lowLabel: 'Variable', highLabel: 'Stable', description: 'Higher values produce more consistent delivery' },
  { key: 'expressiveness', label: 'Expressiveness', lowLabel: 'Monotone', highLabel: 'Expressive', description: 'Controls emotional range in speech' },
  { key: 'breathiness', label: 'Breathiness', lowLabel: 'Clear', highLabel: 'Breathy', description: 'Adds airiness to the voice' },
  { key: 'warmth', label: 'Warmth', lowLabel: 'Cool', highLabel: 'Warm', description: 'Controls the warmth and friendliness of the voice' },
  { key: 'emotionStrength', label: 'Emotion Strength', lowLabel: 'Subtle', highLabel: 'Intense', description: 'Controls the intensity of the selected emotion' },
];

export function VoiceSettingsModal({ persona, open, onOpenChange, onSave }: VoiceSettingsModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primary: 'friendly',
      adaptability: 50,
      voiceStyle: '',
      gender: DEFAULT_VOICE_PROFILE.gender,
      age: DEFAULT_VOICE_PROFILE.age,
      accent: DEFAULT_VOICE_PROFILE.accent,
      styleTone: DEFAULT_VOICE_PROFILE.styleTone,
      pitch: DEFAULT_VOICE_PROFILE.pitch,
      speakingRate: DEFAULT_VOICE_PROFILE.speakingRate,
      stability: DEFAULT_VOICE_PROFILE.stability,
      clarity: DEFAULT_VOICE_PROFILE.clarity,
      expressiveness: DEFAULT_VOICE_PROFILE.expressiveness,
      breathiness: DEFAULT_VOICE_PROFILE.breathiness,
      warmth: DEFAULT_VOICE_PROFILE.warmth,
      emotion: DEFAULT_VOICE_PROFILE.emotion,
      emotionStrength: DEFAULT_VOICE_PROFILE.emotionStrength,
      pauseLength: DEFAULT_VOICE_PROFILE.pauseLength,
      fillersEnabled: DEFAULT_VOICE_PROFILE.fillersEnabled,
      interruptible: DEFAULT_VOICE_PROFILE.interruptible,
      fallbackTone: DEFAULT_VOICE_PROFILE.fallbackTone,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (persona) {
      const vp = persona.voiceProfile || DEFAULT_VOICE_PROFILE;
      form.reset({
        primary: persona.toneSettings.primary,
        adaptability: persona.toneSettings.adaptability,
        voiceStyle: persona.toneSettings.voiceStyle,
        gender: vp.gender,
        age: vp.age,
        accent: vp.accent,
        styleTone: vp.styleTone,
        pitch: vp.pitch,
        speakingRate: vp.speakingRate,
        stability: vp.stability,
        clarity: vp.clarity,
        expressiveness: vp.expressiveness,
        breathiness: vp.breathiness,
        warmth: vp.warmth,
        emotion: vp.emotion,
        emotionStrength: vp.emotionStrength,
        pauseLength: vp.pauseLength,
        fillersEnabled: vp.fillersEnabled,
        interruptible: vp.interruptible,
        fallbackTone: vp.fallbackTone,
      });
    }
  }, [persona, form]);

  const onSubmit = async (data: FormValues) => {
    if (!persona) return;
    await onSave(
      persona.id,
      {
        primary: data.primary,
        adaptability: data.adaptability,
        voiceStyle: data.voiceStyle,
      },
      {
        gender: data.gender,
        age: data.age,
        accent: data.accent,
        styleTone: data.styleTone,
        pitch: data.pitch,
        speakingRate: data.speakingRate,
        stability: data.stability,
        clarity: data.clarity,
        expressiveness: data.expressiveness,
        breathiness: data.breathiness,
        warmth: data.warmth,
        emotion: data.emotion,
        emotionStrength: data.emotionStrength,
        pauseLength: data.pauseLength,
        fillersEnabled: data.fillersEnabled,
        interruptible: data.interruptible,
        fallbackTone: data.fallbackTone,
        customPronunciations: [],
      }
    );
    onOpenChange(false);
  };

  const handlePreview = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setTimeout(() => setIsPlaying(false), 3000);
    }
  };

  if (!persona) return null;

  const watchedGender = form.watch('gender');
  const watchedAge = form.watch('age');
  const watchedAccent = form.watch('accent');
  const watchedStyleTone = form.watch('styleTone');
  const watchedSpeakingRate = form.watch('speakingRate');
  const watchedClarity = form.watch('clarity');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Voice Settings: {persona.name}
          </DialogTitle>
          <DialogDescription>
            Configure the tone, voice characteristics, and audio profile for this persona.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <Tabs defaultValue="tone" className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-full grid-cols-4 mb-3">
                <TabsTrigger value="tone" className="text-xs">Tone & Style</TabsTrigger>
                <TabsTrigger value="voice" className="text-xs">Voice Profile</TabsTrigger>
                <TabsTrigger value="audio" className="text-xs">Audio Controls</TabsTrigger>
                <TabsTrigger value="behavior" className="text-xs">Behavior</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto pr-1">
                <TabsContent value="tone" className="mt-0 space-y-5">
                  <FormField
                    control={form.control}
                    name="primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Tone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select primary tone" />
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
                        <FormDescription>
                          The default communication style for this persona.
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
                          <FormLabel>Adaptability</FormLabel>
                          <span className="text-sm font-medium text-primary">{field.value}%</span>
                        </div>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={5}
                            value={[field.value]}
                            onValueChange={([value]) => field.onChange(value)}
                            className="py-2"
                          />
                        </FormControl>
                        <FormDescription>
                          How dynamically the tone adjusts based on conversation context.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="voiceStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Style Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Warm and understanding"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Describe the vocal characteristics (e.g., "Confident and engaging").
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Sliders className="w-4 h-4 text-muted-foreground" />
                      Live Preview
                    </div>
                    <p className="text-xs text-muted-foreground">
                      This persona will use a <strong>{TONE_LABELS[form.watch('primary')]}</strong> tone 
                      with <strong>{form.watch('adaptability')}%</strong> adaptability, speaking in a 
                      "<strong>{form.watch('voiceStyle') || '...'}</strong>" style.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="mt-0 space-y-5">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Gender</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.entries(VOICE_GENDER_LABELS) as [VoiceGender, string][]).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className={cn(
                                'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all',
                                field.value === value
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/30'
                              )}
                            >
                              <User className={cn(
                                'w-5 h-5',
                                field.value === value ? 'text-primary' : 'text-muted-foreground'
                              )} />
                              <span className="text-xs font-medium">{label}</span>
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Voice Age</FormLabel>
                        <div className="grid grid-cols-4 gap-2">
                          {(Object.entries(VOICE_AGE_LABELS) as [VoiceAge, string][]).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className={cn(
                                'flex items-center justify-center gap-1.5 p-2.5 rounded-lg border-2 transition-all text-xs font-medium',
                                field.value === value
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:border-primary/30 text-muted-foreground'
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent / Language Style</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select accent" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(VOICE_ACCENT_LABELS) as [VoiceAccent, string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The regional accent for the AI voice.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="styleTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Style & Tone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select style tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(VOICE_STYLE_TONE_LABELS) as [VoiceStyleTone, string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The overall speaking style and tonal quality of the voice.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="speakingRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speaking Rate</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select speaking rate" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(VOICE_SPEAKING_RATE_LABELS) as [VoiceSpeakingRate, string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How fast the voice speaks.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clarity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clarity</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.entries(VOICE_CLARITY_LABELS) as [VoiceClarity, string][]).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className={cn(
                                'flex items-center justify-center gap-1.5 p-2.5 rounded-lg border-2 transition-all text-xs font-medium',
                                field.value === value
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:border-primary/30 text-muted-foreground'
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <FormDescription>
                          Controls how clear and crisp the voice sounds.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-3 rounded-lg bg-muted/50 border space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Mic2 className="w-4 h-4 text-muted-foreground" />
                      Voice Profile Summary
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary" className="text-xs">
                        {VOICE_GENDER_LABELS[watchedGender]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {VOICE_AGE_LABELS[watchedAge]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {VOICE_ACCENT_LABELS[watchedAccent]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {VOICE_STYLE_TONE_LABELS[watchedStyleTone]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {VOICE_SPEAKING_RATE_LABELS[watchedSpeakingRate]}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {VOICE_CLARITY_LABELS[watchedClarity]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A {VOICE_AGE_LABELS[watchedAge].toLowerCase()}, {VOICE_GENDER_LABELS[watchedGender].toLowerCase()} voice 
                      with {VOICE_ACCENT_LABELS[watchedAccent].toLowerCase()} accent, {VOICE_STYLE_TONE_LABELS[watchedStyleTone].toLowerCase()} style 
                      at {VOICE_SPEAKING_RATE_LABELS[watchedSpeakingRate].toLowerCase()} pace.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
                    <Button
                      type="button"
                      size="sm"
                      variant={isPlaying ? "destructive" : "default"}
                      onClick={handlePreview}
                      className="shrink-0"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 mr-1.5" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                          Preview
                        </>
                      )}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">Test Voice</p>
                      <p className="text-[10px] text-muted-foreground">
                        {isPlaying ? 'Playing sample audio...' : 'Listen to a sample with current settings'}
                      </p>
                    </div>
                    {isPlaying && (
                      <div className="flex items-end gap-0.5 h-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-1 bg-primary rounded-full animate-pulse"
                            style={{
                              height: `${8 + Math.random() * 12}px`,
                              animationDelay: `${i * 0.1}s`,
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="audio" className="mt-0 space-y-4">
                  <div className="p-3 rounded-lg bg-muted/30 border mb-4">
                    <p className="text-xs text-muted-foreground">
                      Fine-tune the audio characteristics of the voice. These controls affect how the synthesized voice sounds.
                    </p>
                  </div>

                  {SLIDER_CONFIGS.map((config) => (
                    <FormField
                      key={config.key}
                      control={form.control}
                      name={config.key as keyof FormValues}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="text-sm">{config.label}</FormLabel>
                            <span className="text-xs font-medium text-primary tabular-nums">{field.value as number}%</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={100}
                              step={1}
                              value={[field.value as number]}
                              onValueChange={([value]) => field.onChange(value)}
                              className="py-1"
                            />
                          </FormControl>
                          <div className="flex justify-between">
                            <span className="text-[10px] text-muted-foreground">{config.lowLabel}</span>
                            <span className="text-[10px] text-muted-foreground">{config.highLabel}</span>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <span className="text-xs text-muted-foreground">Reset to defaults</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        const dp = DEFAULT_VOICE_PROFILE;
                        form.setValue('pitch', dp.pitch);
                        form.setValue('stability', dp.stability);
                        form.setValue('expressiveness', dp.expressiveness);
                        form.setValue('breathiness', dp.breathiness);
                        form.setValue('warmth', dp.warmth);
                        form.setValue('emotionStrength', dp.emotionStrength);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="behavior" className="mt-0 space-y-5">
                  <div className="p-3 rounded-lg bg-muted/30 border mb-4">
                    <p className="text-xs text-muted-foreground">
                      Configure behavioral settings that control how the voice responds in different situations.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="emotion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emotion</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select emotion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(VOICE_EMOTION_LABELS) as [VoiceEmotion, string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The default emotional tone of the voice.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pauseLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pause Length</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {(Object.entries(VOICE_PAUSE_LABELS) as [VoicePauseLength, string][]).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => field.onChange(value)}
                              className={cn(
                                'flex items-center justify-center gap-1.5 p-2.5 rounded-lg border-2 transition-all text-xs font-medium',
                                field.value === value
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border hover:border-primary/30 text-muted-foreground'
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <FormDescription>
                          Controls the length of pauses between sentences.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fillersEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Fillers</FormLabel>
                          <FormDescription className="text-xs">
                            Enable natural filler words (um, uh) for more human-like speech.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interruptible"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm">Interruptible</FormLabel>
                          <FormDescription className="text-xs">
                            Allow the caller to interrupt the AI while it is speaking.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fallbackTone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fallback Tone</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fallback tone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(Object.entries(VOICE_FALLBACK_TONE_LABELS) as [VoiceFallbackTone, string][]).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          The tone used when the AI encounters an error or uncertainty.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </div>
            </Tabs>

            <DialogFooter className="mt-4 pt-3 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Settings'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
