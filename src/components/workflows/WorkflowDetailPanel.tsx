import { useState } from 'react';
import {
  ArrowLeft, Activity, Pencil, Copy, Trash2, Play, ChevronDown, ChevronRight,
  Globe, Database, Users, Mail, Ticket, Download, GitBranch, Shuffle, Clock, Webhook,
  Variable, Zap, CheckCircle2, XCircle, Loader2, AlertCircle, Timer
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Workflow } from '@/types/workflows';
import { STEP_TYPE_CONFIG, CATEGORY_LABELS } from '@/types/workflows';
import { cn } from '@/lib/utils';

interface WorkflowDetailPanelProps {
  workflow: Workflow;
  onBack: () => void;
  onEdit: (workflow: Workflow) => void;
  onDuplicate: (workflow: Workflow) => void;
  onDelete: (workflow: Workflow) => void;
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

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, count }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg">
      <button
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">{title}</span>
          {count !== undefined && (
            <Badge variant="secondary" className="text-[10px] px-1.5 h-4">{count}</Badge>
          )}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <div className="px-3 pb-3 pt-1">
          <Separator className="mb-3" />
          {children}
        </div>
      )}
    </div>
  );
}

export function WorkflowDetailPanel({ workflow, onBack, onEdit, onDuplicate, onDelete, onExecute, canEdit, canDelete }: WorkflowDetailPanelProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{workflow.name}</h2>
              <Badge variant="outline" className="text-xs">v{workflow.version}</Badge>
              <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'} className={cn('text-xs', workflow.status === 'active' && 'bg-success')}>
                {workflow.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{workflow.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onExecute(workflow.id)}>
            <Play className="w-4 h-4 mr-1" /> Run
          </Button>
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(workflow)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onDuplicate(workflow)}>
              <Copy className="w-4 h-4 mr-1" /> Duplicate
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(workflow)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Category</p>
            <p className="text-sm font-medium">{CATEGORY_LABELS[workflow.category]}</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Total Runs</p>
            <p className="text-sm font-medium">{workflow.totalRuns.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Success Rate</p>
            <p className={cn('text-sm font-medium', workflow.successRate >= 95 ? 'text-green-600' : workflow.successRate >= 80 ? 'text-yellow-600' : 'text-red-600')}>
              {workflow.successRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="gradient-card">
          <CardContent className="pt-3 pb-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Last Run</p>
            <p className="text-sm font-medium">
              {workflow.lastRunAt ? new Date(workflow.lastRunAt).toLocaleDateString() : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <CollapsibleSection title="Workflow Steps" icon={Activity} count={workflow.steps.length}>
          <div className="space-y-2">
            {workflow.steps.map((step, index) => {
              const Icon = stepTypeIcons[step.type] || Globe;
              const config = STEP_TYPE_CONFIG[step.type];
              return (
                <div key={step.id} className="relative">
                  {index > 0 && (
                    <div className="absolute left-5 -top-2 w-px h-2 bg-border" />
                  )}
                  <div className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-all',
                    step.isActive ? 'bg-muted/30' : 'bg-muted/10 opacity-60'
                  )}>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono w-4 text-right">{step.order}</span>
                      <div className={cn('w-8 h-8 rounded flex items-center justify-center', config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium">{step.name}</p>
                        <Badge variant="outline" className="text-[10px]">{config.label}</Badge>
                        {!step.isActive && <Badge variant="secondary" className="text-[10px]">Disabled</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                      {step.config.url && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-mono">{step.config.method || 'GET'}</Badge>
                          <code className="text-[10px] text-muted-foreground font-mono truncate">{step.config.url}</code>
                        </div>
                      )}
                      {step.config.query && (
                        <pre className="mt-1.5 text-[10px] text-muted-foreground font-mono bg-background p-1.5 rounded border truncate">{step.config.query}</pre>
                      )}
                      {step.config.condition && (
                        <code className="mt-1.5 text-[10px] text-muted-foreground font-mono block">{step.config.condition}</code>
                      )}
                      {step.config.emailTo && (
                        <p className="mt-1 text-[10px] text-muted-foreground">To: {step.config.emailTo}</p>
                      )}
                      {step.config.outputVariable && (
                        <div className="mt-1.5 flex items-center gap-1">
                          <Variable className="w-3 h-3 text-muted-foreground" />
                          <code className="text-[10px] font-mono text-primary">{step.config.outputVariable}</code>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {step.config.retryCount && (
                        <span className="text-[10px] text-muted-foreground">{step.config.retryCount} retries</span>
                      )}
                      {step.config.timeoutMs && (
                        <span className="text-[10px] text-muted-foreground">{step.config.timeoutMs}ms timeout</span>
                      )}
                    </div>
                  </div>
                  {(step.onSuccess || step.onFailure) && (
                    <div className="ml-11 mt-1 flex gap-3">
                      {step.onSuccess && (
                        <span className="text-[10px] text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" /> {step.onSuccess}
                        </span>
                      )}
                      {step.onFailure && (
                        <span className="text-[10px] text-red-600 flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> {step.onFailure}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Variables" icon={Variable} count={workflow.variables.length} defaultOpen={false}>
          {workflow.variables.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variables configured</p>
          ) : (
            <div className="space-y-2">
              {workflow.variables.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
                  <code className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">{v.name}</code>
                  <Badge variant="outline" className="text-[10px]">{v.type}</Badge>
                  <span className="text-xs text-muted-foreground flex-1 truncate">{v.description}</span>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Triggers" icon={Zap} count={workflow.triggers.length} defaultOpen={false}>
          {workflow.triggers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No triggers configured</p>
          ) : (
            <div className="space-y-2">
              {workflow.triggers.map(trigger => (
                <div key={trigger.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
                  <Badge variant="outline" className="text-[10px] capitalize">{trigger.type.replace('_', ' ')}</Badge>
                  <div className="flex-1 min-w-0">
                    {trigger.config.agentId && <p className="text-xs">Agent: {trigger.config.agentId}</p>}
                    {trigger.config.eventName && <p className="text-xs text-muted-foreground">Event: {trigger.config.eventName}</p>}
                    {trigger.config.cronExpression && <p className="text-xs font-mono text-muted-foreground">{trigger.config.cronExpression}</p>}
                    {trigger.config.webhookPath && <p className="text-xs font-mono text-muted-foreground">{trigger.config.webhookPath}</p>}
                  </div>
                  <Badge variant={trigger.isActive ? 'default' : 'secondary'} className={cn('text-[10px]', trigger.isActive && 'bg-success')}>
                    {trigger.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Execution History" icon={Timer} count={workflow.executions.length} defaultOpen={false}>
          {workflow.executions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No executions yet</p>
          ) : (
            <div className="space-y-2">
              {workflow.executions.slice(0, 10).map(exec => (
                <div key={exec.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
                  <div className="flex-shrink-0">
                    {exec.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {exec.status === 'failed' && <XCircle className="w-4 h-4 text-red-500" />}
                    {exec.status === 'running' && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                    {exec.status === 'cancelled' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={exec.status === 'completed' ? 'default' : exec.status === 'failed' ? 'destructive' : 'secondary'} className={cn('text-[10px]', exec.status === 'completed' && 'bg-success')}>
                        {exec.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{exec.stepsCompleted}/{exec.totalSteps} steps</span>
                    </div>
                    {exec.error && <p className="text-xs text-red-500 mt-0.5">{exec.error}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">{new Date(exec.startedAt).toLocaleString()}</p>
                    {exec.duration && <p className="text-[10px] text-muted-foreground">{(exec.duration / 1000).toFixed(1)}s</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
}
