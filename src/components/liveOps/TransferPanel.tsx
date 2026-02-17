import { useState, useMemo } from 'react';
import { Users, Shuffle, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/liveOps';

interface TeamGroup {
  id: string;
  name: string;
  agentIds: string[];
}

const TEAMS: TeamGroup[] = [
  { id: 'grp-1', name: 'Customer Support', agentIds: ['agent-1', 'agent-2', 'agent-5', 'agent-8'] },
  { id: 'grp-2', name: 'Escalation', agentIds: ['agent-6', 'agent-8'] },
  { id: 'grp-3', name: 'Sales', agentIds: ['agent-1', 'agent-4', 'agent-7', 'agent-10'] },
  { id: 'grp-4', name: 'VIP Support', agentIds: ['agent-7', 'agent-9'] },
  { id: 'grp-5', name: 'Technical Support', agentIds: ['agent-2', 'agent-4', 'agent-6', 'agent-9'] },
  { id: 'grp-6', name: 'Billing & Finance', agentIds: ['agent-3', 'agent-5', 'agent-10'] },
];

interface TransferPanelProps {
  agents: Agent[];
  onTransfer: (agentId: string) => void;
  onCancel: () => void;
  compact?: boolean;
}

export function TransferPanel({ agents, onTransfer, onCancel, compact = false }: TransferPanelProps) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  const availableAgents = useMemo(() =>
    agents.filter(a => a.status === 'available' || a.status === 'busy'),
    [agents]
  );

  const selectedTeamData = TEAMS.find(t => t.id === selectedTeam);

  const teamAgents = useMemo(() => {
    if (!selectedTeamData) return [];
    return availableAgents.filter(a => selectedTeamData.agentIds.includes(a.id));
  }, [selectedTeamData, availableAgents]);

  const handleRandomAssign = () => {
    const available = teamAgents.filter(a =>
      a.status === 'available' && a.currentConversations < a.maxConversations
    );
    if (available.length > 0) {
      const randomAgent = available[Math.floor(Math.random() * available.length)];
      onTransfer(randomAgent.id);
    } else {
      const anyAvailable = teamAgents.filter(a => a.currentConversations < a.maxConversations);
      if (anyAvailable.length > 0) {
        const randomAgent = anyAvailable[Math.floor(Math.random() * anyAvailable.length)];
        onTransfer(randomAgent.id);
      }
    }
  };

  const getTeamAvailableCount = (team: TeamGroup) => {
    return availableAgents.filter(a => team.agentIds.includes(a.id)).length;
  };

  if (selectedTeam && selectedTeamData) {
    return (
      <div className={cn("p-3 rounded-lg border bg-muted/30", compact && "p-2")}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setSelectedTeam(null)}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
            <p className={cn("text-xs font-medium", compact && "text-[11px]")}>
              {selectedTeamData.name}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onCancel}>
            Cancel
          </Button>
        </div>
        <div className={cn("space-y-1 max-h-40 overflow-y-auto", compact && "max-h-32")}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2 border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10",
              compact && "h-7 text-xs"
            )}
            onClick={handleRandomAssign}
            disabled={teamAgents.filter(a => a.currentConversations < a.maxConversations).length === 0}
          >
            <Shuffle className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary font-medium">Randomly assign based on availability</span>
          </Button>
          {teamAgents.length > 0 ? (
            teamAgents.map(agent => (
              <Button
                key={agent.id}
                variant="ghost"
                size="sm"
                className={cn("w-full justify-start", compact && "h-7 text-xs")}
                onClick={() => onTransfer(agent.id)}
                disabled={agent.currentConversations >= agent.maxConversations}
              >
                <div className={cn(
                  'w-2 h-2 rounded-full mr-2',
                  agent.status === 'available' && 'bg-success',
                  agent.status === 'busy' && 'bg-warning'
                )} />
                <span className="text-sm">{agent.name}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {agent.currentConversations}/{agent.maxConversations}
                </span>
              </Button>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              No available agents in this team
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("p-3 rounded-lg border bg-muted/30", compact && "p-2")}>
      <div className="flex items-center justify-between mb-2">
        <p className={cn("text-xs font-medium", compact && "text-[11px]")}>Select Team</p>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onCancel}>
          Cancel
        </Button>
      </div>
      <div className={cn("space-y-1 max-h-40 overflow-y-auto", compact && "max-h-32")}>
        {TEAMS.map(team => {
          const count = getTeamAvailableCount(team);
          return (
            <Button
              key={team.id}
              variant="ghost"
              size="sm"
              className={cn("w-full justify-between group", compact && "h-7 text-xs")}
              onClick={() => setSelectedTeam(team.id)}
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm">{team.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {count} online
                </Badge>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
