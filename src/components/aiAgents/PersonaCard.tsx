import { Bot, Pencil, Trash2, Play, MoreHorizontal, Zap, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Persona } from '@/types/aiAgents';
import { PERSONA_TYPE_LABELS, TONE_LABELS } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
  persona: Persona;
  onEdit: (persona: Persona) => void;
  onTest: (persona: Persona) => void;
  onDelete: (persona: Persona) => void;
  onToggleActive: (personaId: string) => void;
}

export function PersonaCard({ persona, onEdit, onTest, onDelete, onToggleActive }: PersonaCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-success/10 text-success border-success/30';
      case 'support': return 'bg-primary/10 text-primary border-primary/30';
      case 'custom': return 'bg-accent/10 text-accent border-accent/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sales': return '💼';
      case 'support': return '🎧';
      case 'custom': return '⚙️';
      default: return '🤖';
    }
  };

  return (
    <Card className={cn(
      'gradient-card transition-all duration-300 hover:shadow-glow group',
      !persona.isActive && 'opacity-60'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-2xl">
              {getTypeIcon(persona.type)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{persona.name}</h3>
              <Badge variant="outline" className={cn('text-xs', getTypeColor(persona.type))}>
                {PERSONA_TYPE_LABELS[persona.type]}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={persona.isActive}
              onCheckedChange={() => onToggleActive(persona.id)}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(persona)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Persona
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onTest(persona)}>
                  <Play className="w-4 h-4 mr-2" />
                  Test Persona
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(persona)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {persona.description}
        </p>

        {/* Tone Settings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Primary Tone
            </span>
            <Badge variant="secondary" className="text-xs">
              {TONE_LABELS[persona.toneSettings.primary]}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Volume2 className="w-3 h-3" />
              Voice Style
            </span>
            <span className="text-xs">{persona.toneSettings.voiceStyle}</span>
          </div>
        </div>

        {/* Adaptability Meter */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tone Adaptability</span>
            <span className="font-medium">{persona.toneSettings.adaptability}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary transition-all"
              style={{ width: `${persona.toneSettings.adaptability}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>{persona.fewShotExamples.length} examples</span>
          <span>Updated {persona.updatedAt}</span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(persona)}
          >
            <Pencil className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onTest(persona)}
          >
            <Play className="w-3 h-3 mr-1" />
            Test
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
