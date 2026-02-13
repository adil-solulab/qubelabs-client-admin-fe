import { Bot, Crown, Pencil, Trash2, Copy, MoreHorizontal, Power, Play, ChevronRight, Zap, Shield, MessageSquare, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import type { AIAgent } from '@/types/aiAgents';
import { TONE_LABELS } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: AIAgent;
  childCount?: number;
  onSelect: (agent: AIAgent) => void;
  onEdit: (agent: AIAgent) => void;
  onDelete: (agent: AIAgent) => void;
  onDuplicate: (agent: AIAgent) => void;
  onToggleStatus: (agentId: string) => void;
  onTest?: (agent: AIAgent) => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function AgentCard({ agent, childCount, onSelect, onEdit, onDelete, onDuplicate, onToggleStatus, onTest, canEdit, canDelete }: AgentCardProps) {
  const isSuperAgent = agent.type === 'super_agent';

  return (
    <Card
      className={cn(
        'gradient-card cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group relative',
        isSuperAgent && 'border-primary/20 bg-primary/[0.02]'
      )}
      onClick={() => onSelect(agent)}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              isSuperAgent ? 'gradient-primary' : 'bg-primary/10'
            )}>
              {isSuperAgent ? (
                <Crown className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Bot className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                <Badge variant={isSuperAgent ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                  {isSuperAgent ? 'Super Agent' : 'Agent'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{agent.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onSelect(agent)}>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {onTest && (
                  <DropdownMenuItem onClick={() => onTest(agent)}>
                    <Play className="w-4 h-4 mr-2" />
                    Test Agent
                  </DropdownMenuItem>
                )}
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(agent)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(agent)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  </>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && !isSuperAgent && (
                  <DropdownMenuItem
                    onClick={() => onDelete(agent)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="text-[10px] gap-1">
            <MessageSquare className="w-2.5 h-2.5" />
            {TONE_LABELS[agent.persona.tone]}
          </Badge>
          {agent.intents.length > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Zap className="w-2.5 h-2.5" />
              {agent.intents.filter(i => i.isActive).length} intents
            </Badge>
          )}
          {agent.guardrails.length > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Shield className="w-2.5 h-2.5" />
              {agent.guardrails.filter(g => g.isActive).length} guardrails
            </Badge>
          )}
          {isSuperAgent && childCount !== undefined && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Users className="w-2.5 h-2.5" />
              {childCount} agents
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <Badge variant={agent.status === 'active' ? 'default' : agent.status === 'draft' ? 'outline' : 'secondary'} className={cn('text-[10px]', agent.status === 'active' && 'bg-success')}>
            {agent.status}
          </Badge>
          {canEdit && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{agent.status === 'active' ? 'Active' : 'Inactive'}</span>
              <Switch
                checked={agent.status === 'active'}
                onCheckedChange={() => onToggleStatus(agent.id)}
                className="scale-75"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
