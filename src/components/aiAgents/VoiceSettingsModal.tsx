import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Volume2, Sliders } from 'lucide-react';
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
import type { Persona, ToneLevel } from '@/types/aiAgents';
import { TONE_LABELS } from '@/types/aiAgents';

const formSchema = z.object({
  primary: z.enum(['formal', 'friendly', 'casual', 'empathetic', 'persuasive']),
  adaptability: z.number().min(0).max(100),
  voiceStyle: z.string().min(1, 'Voice style is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface VoiceSettingsModalProps {
  persona: Persona | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (personaId: string, toneSettings: Persona['toneSettings']) => Promise<void>;
}

export function VoiceSettingsModal({ persona, open, onOpenChange, onSave }: VoiceSettingsModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      primary: 'friendly',
      adaptability: 50,
      voiceStyle: '',
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (persona) {
      form.reset({
        primary: persona.toneSettings.primary,
        adaptability: persona.toneSettings.adaptability,
        voiceStyle: persona.toneSettings.voiceStyle,
      });
    }
  }, [persona, form]);

  const onSubmit = async (data: FormValues) => {
    if (!persona) return;
    await onSave(persona.id, {
      primary: data.primary,
      adaptability: data.adaptability,
      voiceStyle: data.voiceStyle,
    });
    onOpenChange(false);
  };

  if (!persona) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-primary" />
            Voice Settings: {persona.name}
          </DialogTitle>
          <DialogDescription>
            Configure the tone and voice style for this persona.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Primary Tone */}
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

            {/* Adaptability Slider */}
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

            {/* Voice Style */}
            <FormField
              control={form.control}
              name="voiceStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Voice Style</FormLabel>
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

            {/* Preview Info */}
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

            <DialogFooter>
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
