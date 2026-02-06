import { Volume2, Waves, Zap, TrendingUp, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { Persona } from '@/types/aiAgents';
import { TONE_LABELS } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

interface ToneAdaptationWidgetProps {
  personas: Persona[];
  onEditPersona?: (persona: Persona) => void;
}

const TONE_SCENARIOS = [
  { context: 'Frustrated Customer', suggestedTone: 'empathetic', urgency: 'high' },
  { context: 'New Lead Inquiry', suggestedTone: 'persuasive', urgency: 'medium' },
  { context: 'Technical Question', suggestedTone: 'formal', urgency: 'low' },
  { context: 'VIP Client Call', suggestedTone: 'friendly', urgency: 'high' },
];

export function ToneAdaptationWidget({ personas, onEditPersona }: ToneAdaptationWidgetProps) {
  const activePersonas = personas.filter(p => p.isActive);
  const avgAdaptability = activePersonas.length > 0
    ? Math.round(activePersonas.reduce((sum, p) => sum + p.toneSettings.adaptability, 0) / activePersonas.length)
    : 0;

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary" />
            Dynamic Tone Adaptation
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Voice AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Adaptability */}
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              System Adaptability
            </span>
            <span className="font-semibold">{avgAdaptability}%</span>
          </div>
          <Progress value={avgAdaptability} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Average tone flexibility across {activePersonas.length} active personas
          </p>
        </div>

        {/* Voice Style Distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Waves className="w-4 h-4 text-muted-foreground" />
            Active Voice Styles
          </h4>
          <div className="grid gap-2">
            {activePersonas.slice(0, 3).map(persona => (
              <div
                key={persona.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg border bg-background/50',
                  onEditPersona && 'cursor-pointer hover:bg-muted/50 transition-colors group'
                )}
                onClick={() => onEditPersona?.(persona)}
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    persona.type === 'sales' ? 'bg-success' :
                    persona.type === 'support' ? 'bg-primary' :
                    'bg-accent'
                  )} />
                  <span className="text-sm font-medium">{persona.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {TONE_LABELS[persona.toneSettings.primary]}
                  </Badge>
                  {onEditPersona && (
                    <Settings2 className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
            ))}
            {activePersonas.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No active personas
              </p>
            )}
          </div>
        </div>

        {/* Contextual Adaptation Examples */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Context-Based Suggestions
          </h4>
          <div className="space-y-2">
            {TONE_SCENARIOS.map((scenario, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg border bg-background/50 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    getUrgencyColor(scenario.urgency).replace('text-', 'bg-')
                  )} />
                  <span className="text-muted-foreground">{scenario.context}</span>
                </div>
                <span className="text-xs font-medium">
                  → {TONE_LABELS[scenario.suggestedTone as keyof typeof TONE_LABELS]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center pt-2 border-t">
          {onEditPersona 
            ? 'Click a persona above to edit its voice settings'
            : 'Tone adapts in real-time based on conversation sentiment and context'}
        </p>
      </CardContent>
    </Card>
  );
}
