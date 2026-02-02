import { ArrowRight, Bot, Zap, GitBranch } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { TaskSequence, Persona } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

interface TaskSequenceVisualizerProps {
  sequence: TaskSequence;
  personas: Persona[];
}

export function TaskSequenceVisualizer({ sequence, personas }: TaskSequenceVisualizerProps) {
  const getPersona = (id: string) => personas.find(p => p.id === id);

  const getPersonaColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-success/20 border-success/50 text-success';
      case 'support': return 'bg-primary/20 border-primary/50 text-primary';
      case 'custom': return 'bg-accent/20 border-accent/50 text-accent';
      default: return 'bg-muted border-border text-muted-foreground';
    }
  };

  return (
    <Card className="gradient-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{sequence.name}</CardTitle>
              <p className="text-xs text-muted-foreground">{sequence.description}</p>
            </div>
          </div>
          <Badge variant={sequence.isActive ? 'default' : 'secondary'}>
            {sequence.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Task Flow Visualization */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20" />
          
          <div className="space-y-4">
            {sequence.tasks.map((task, index) => {
              const persona = getPersona(task.personaId);
              const isLast = index === sequence.tasks.length - 1;
              
              return (
                <div key={task.id} className="relative flex items-start gap-4">
                  {/* Node */}
                  <div className="relative z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          'w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer hover:scale-110',
                          persona ? getPersonaColor(persona.type) : 'bg-muted border-border'
                        )}>
                          <Bot className="w-5 h-5" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{persona?.name || 'Unknown Persona'}</p>
                        <p className="text-xs text-muted-foreground">{persona?.toneSettings.voiceStyle}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    {/* Order Badge */}
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                      <span className="text-[10px] font-bold">{task.order}</span>
                    </div>
                  </div>
                  
                  {/* Task Details */}
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-sm">{task.name}</h4>
                      {task.condition && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Zap className="w-2.5 h-2.5" />
                          {task.condition}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {task.description}
                    </p>
                    {persona && (
                      <Badge variant="secondary" className="mt-2 text-[10px]">
                        {persona.name}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Arrow (except last) */}
                  {!isLast && (
                    <div className="absolute left-6 -bottom-2 transform -translate-x-1/2">
                      <ArrowRight className="w-3 h-3 text-primary rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>{sequence.tasks.length} tasks in sequence</span>
          <span>{new Set(sequence.tasks.map(t => t.personaId)).size} personas involved</span>
        </div>
      </CardContent>
    </Card>
  );
}
