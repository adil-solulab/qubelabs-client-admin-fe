import {
  Globe, Database, Users, Mail, Ticket, Download, GitBranch, Shuffle, Clock, Webhook,
  MoreHorizontal, Pencil, Copy, Trash2, Play, Power, ChevronRight, Activity, CheckCircle2, XCircle, Zap
} from 'lucide-react';
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
import type { Workflow } from '@/types/workflows';
import { CATEGORY_LABELS } from '@/types/workflows';
import { cn } from '@/lib/utils';

interface WorkflowCardProps {
  workflow: Workflow;
  onSelect: (workflow: Workflow) => void;
  onEdit: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onToggleStatus: (id: string) => void;
  onExecute: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
}

const stepTypeIcons: Record<string, React.ElementType> = {
  api_call: Globe,
  database_query: Database,
  crm_update: Users,
  send_email: Mail,
  create_ticket: Ticket,
  fetch_data: Download,
  condition: GitBranch,
  transform: Shuffle,
  delay: Clock,
  webhook: Webhook,
};

export function WorkflowCard({ workflow, onSelect, onEdit, onDelete, onDuplicate, onToggleStatus, onExecute, canEdit, canDelete }: WorkflowCardProps) {
  const stepTypes = [...new Set(workflow.steps.map(s => s.type))];
  const lastExecution = workflow.executions[0];

  return (
    <Card
      className="gradient-card cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group relative"
      onClick={() => onSelect(workflow)}
    >
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{workflow.name}</h3>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0">
                  v{workflow.version}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{workflow.description}</p>
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
                <DropdownMenuItem onClick={() => onSelect(workflow)}>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExecute(workflow.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Run Now
                </DropdownMenuItem>
                {canEdit && (
                  <>
                    <DropdownMenuItem onClick={() => onEdit(workflow)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(workflow)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  </>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(workflow)}
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
            <Zap className="w-2.5 h-2.5" />
            {CATEGORY_LABELS[workflow.category]}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            {workflow.steps.length} steps
          </Badge>
          {workflow.totalRuns > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1">
              <Activity className="w-2.5 h-2.5" />
              {workflow.totalRuns} runs
            </Badge>
          )}
          {workflow.successRate > 0 && (
            <Badge variant="outline" className={cn(
              'text-[10px] gap-1',
              workflow.successRate >= 95 ? 'text-green-600' : workflow.successRate >= 80 ? 'text-yellow-600' : 'text-red-600'
            )}>
              <CheckCircle2 className="w-2.5 h-2.5" />
              {workflow.successRate.toFixed(1)}%
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1 mb-3">
          {stepTypes.slice(0, 5).map(type => {
            const Icon = stepTypeIcons[type] || Globe;
            return (
              <div key={type} className="w-6 h-6 rounded bg-muted/50 flex items-center justify-center" title={type}>
                <Icon className="w-3 h-3 text-muted-foreground" />
              </div>
            );
          })}
          {stepTypes.length > 5 && (
            <span className="text-[10px] text-muted-foreground ml-1">+{stepTypes.length - 5}</span>
          )}
        </div>

        <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <Badge
              variant={workflow.status === 'active' ? 'default' : workflow.status === 'draft' ? 'outline' : 'secondary'}
              className={cn('text-[10px]', workflow.status === 'active' && 'bg-success')}
            >
              {workflow.status}
            </Badge>
            {lastExecution && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                {lastExecution.status === 'completed' ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                ) : lastExecution.status === 'failed' ? (
                  <XCircle className="w-2.5 h-2.5 text-red-500" />
                ) : null}
                Last run {new Date(lastExecution.startedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{workflow.status === 'active' ? 'Active' : 'Inactive'}</span>
              <Switch
                checked={workflow.status === 'active'}
                onCheckedChange={() => onToggleStatus(workflow.id)}
                className="scale-75"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
