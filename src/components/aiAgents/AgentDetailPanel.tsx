import { useState } from 'react';
import {
  Bot, Crown, ArrowLeft, MessageSquare, Zap, Target, Brain, Variable, GitBranch,
  AlertTriangle, Database, Shield, Pencil, Play, Copy, Trash2, ChevronDown, ChevronRight,
  Globe, Volume2, Languages, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { AIAgent } from '@/types/aiAgents';
import { TONE_LABELS, TRIGGER_TYPE_LABELS, VARIABLE_TYPE_LABELS, GUARDRAIL_TYPE_LABELS, FALLBACK_ACTION_LABELS, CHANNEL_LABELS, VOICE_GENDER_LABELS, VOICE_AGE_LABELS, VOICE_ACCENT_LABELS, VOICE_STYLE_TONE_LABELS } from '@/types/aiAgents';
import { cn } from '@/lib/utils';

interface AgentDetailPanelProps {
  agent: AIAgent;
  childAgents?: AIAgent[];
  onBack: () => void;
  onEdit: (agent: AIAgent) => void;
  onTest?: (agent: AIAgent) => void;
  onDuplicate: (agent: AIAgent) => void;
  onDelete: (agent: AIAgent) => void;
  onSelectChild?: (agent: AIAgent) => void;
  canEdit: boolean;
  canDelete: boolean;
}

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

export function AgentDetailPanel({ agent, childAgents, onBack, onEdit, onTest, onDuplicate, onDelete, onSelectChild, canEdit, canDelete }: AgentDetailPanelProps) {
  const isSuperAgent = agent.type === 'super_agent';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            isSuperAgent ? 'gradient-primary' : 'bg-primary/10'
          )}>
            {isSuperAgent ? <Crown className="w-5 h-5 text-primary-foreground" /> : <Bot className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{agent.name}</h2>
              <Badge variant={isSuperAgent ? 'default' : 'secondary'} className="text-xs">
                {isSuperAgent ? 'Super Agent' : 'Agent'}
              </Badge>
              <Badge variant={agent.status === 'active' ? 'default' : 'secondary'} className={cn('text-xs', agent.status === 'active' && 'bg-success')}>
                {agent.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onTest && (
            <Button variant="outline" size="sm" onClick={() => onTest(agent)}>
              <Play className="w-4 h-4 mr-1" /> Test
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onEdit(agent)}>
              <Pencil className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => onDuplicate(agent)}>
              <Copy className="w-4 h-4 mr-1" /> Duplicate
            </Button>
          )}
          {canDelete && !isSuperAgent && (
            <Button variant="destructive" size="sm" onClick={() => onDelete(agent)}>
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isSuperAgent && childAgents && childAgents.length > 0 && (
          <CollapsibleSection title="Connected Agents" icon={Bot} count={childAgents.length}>
            <div className="grid md:grid-cols-2 gap-2">
              {childAgents.map(child => (
                <button
                  key={child.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary/30 hover:bg-muted/50 transition-all text-left w-full"
                  onClick={() => onSelectChild?.(child)}
                >
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{child.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{child.description}</p>
                  </div>
                  <Badge variant={child.status === 'active' ? 'default' : 'secondary'} className={cn('text-[10px] flex-shrink-0 ml-auto', child.status === 'active' && 'bg-success')}>
                    {child.status}
                  </Badge>
                </button>
              ))}
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Agent Metadata" icon={Bot}>
          <div className="grid gap-3">
            <div className={cn("grid gap-3", agent.type !== 'super_agent' ? "grid-cols-2" : "grid-cols-1")}>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Agent ID</p>
                <p className="text-sm font-medium font-mono">{agent.id}</p>
              </div>
              {agent.type !== 'super_agent' && (
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Business Capability</p>
                <p className="text-sm font-medium">{agent.businessCapability || '-'}</p>
              </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Priority Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${agent.priorityScore || 0}%` }} />
                  </div>
                  <span className="text-xs font-medium">{agent.priorityScore || 0}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Escalation Allowed</p>
                <Badge variant={agent.escalationAllowed ? 'default' : 'secondary'} className={cn('text-xs', agent.escalationAllowed && 'bg-success')}>
                  {agent.escalationAllowed ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Allowed Channels</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {(agent.allowedChannels || []).map(ch => (
                  <Badge key={ch} variant="outline" className="text-[10px]">{CHANNEL_LABELS[ch]}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Agent Settings" icon={Globe}>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Timezone</p>
                <p className="text-sm font-medium">{agent.timezone || 'UTC'}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Interruptible</p>
                <Badge variant={agent.interruptible ? 'default' : 'secondary'} className={cn('text-xs', agent.interruptible && 'bg-primary')}>
                  {agent.interruptible ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Expressive Mode</p>
                <Badge variant={agent.expressiveMode ? 'default' : 'secondary'} className={cn('text-xs', agent.expressiveMode && 'bg-primary')}>
                  {agent.expressiveMode ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
            {agent.firstMessage && (
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">First Message</p>
                <p className="text-sm">{agent.firstMessage}</p>
              </div>
            )}
            {agent.disclosureRequirements && (
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Disclosure Requirements</p>
                <p className="text-sm">{agent.disclosureRequirements}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Languages</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(agent.languages || []).map((lang, i) => (
                    <Badge key={lang} variant="outline" className="text-[10px]">
                      {lang} {i === 0 && '(Default)'}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">LLM Provider & Model</p>
                <div className="flex items-center gap-2 mt-1">
                  <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{agent.llmProvider || 'OpenAI'}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-sm">{agent.prompt.model}</span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Voice Persona" icon={Volume2}>
          <div className="grid gap-3">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Voice Identity</p>
              {agent.voiceProfile ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-[9px] h-4">{VOICE_GENDER_LABELS[agent.voiceProfile.gender]}</Badge>
                  <Badge variant="outline" className="text-[9px] h-4">{VOICE_AGE_LABELS[agent.voiceProfile.age]}</Badge>
                  <Badge variant="outline" className="text-[9px] h-4">{VOICE_ACCENT_LABELS[agent.voiceProfile.accent]}</Badge>
                  <Badge variant="outline" className="text-[9px] h-4">{VOICE_STYLE_TONE_LABELS[agent.voiceProfile.styleTone]}</Badge>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">No voice configured</p>
              )}
            </div>
            {agent.voiceProfile && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Pitch</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${agent.voiceProfile.pitch}%` }} />
                      </div>
                      <span className="text-xs font-medium">{agent.voiceProfile.pitch}%</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Stability</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${agent.voiceProfile.stability}%` }} />
                      </div>
                      <span className="text-xs font-medium">{agent.voiceProfile.stability}%</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Speed</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${agent.voiceProfile.speed}%` }} />
                      </div>
                      <span className="text-xs font-medium">{agent.voiceProfile.speed}%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Emotion</p>
                    <Badge variant="outline" className="text-xs capitalize">{agent.voiceProfile.emotion}</Badge>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Expressiveness</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${agent.voiceProfile.expressiveness}%` }} />
                      </div>
                      <span className="text-xs font-medium">{agent.voiceProfile.expressiveness}%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            {agent.callSettings && (
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Call Settings</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Badge variant="outline" className="text-[9px] h-4">Max: {agent.callSettings.maxDuration}</Badge>
                  <Badge variant="outline" className="text-[9px] h-4">Inactivity: {agent.callSettings.inactivityDuration}</Badge>
                  {agent.callSettings.noiseFiltering && <Badge variant="secondary" className="text-[9px] h-4">Noise Filter</Badge>}
                  {agent.callSettings.voicemailDetection && <Badge variant="secondary" className="text-[9px] h-4">Voicemail</Badge>}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Prompt Persona" icon={MessageSquare}>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tone</p>
                <p className="text-sm font-medium">{TONE_LABELS[agent.persona.tone]}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Style</p>
                <p className="text-sm font-medium">{agent.persona.style}</p>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Greeting</p>
              <p className="text-sm">{agent.persona.greeting}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Personality</p>
              <p className="text-sm">{agent.persona.personality}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Adaptability</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${agent.persona.adaptability}%` }} />
                  </div>
                  <span className="text-xs font-medium">{agent.persona.adaptability}%</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Verbosity Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${agent.persona.verbosityLevel}%` }} />
                  </div>
                  <span className="text-xs font-medium">{agent.persona.verbosityLevel}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Empathy Level</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${agent.persona.empathyLevel}%` }} />
                  </div>
                  <span className="text-xs font-medium">{agent.persona.empathyLevel}%</span>
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk Tolerance</p>
                <Badge variant="outline" className="text-xs capitalize">{agent.persona.riskTolerance}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Domain Expertise</p>
                <Badge variant="outline" className="text-xs capitalize">{agent.persona.domainExpertiseLevel}</Badge>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Brand Voice</p>
                <p className="text-sm font-medium">{agent.persona.brandVoiceProfile || '-'}</p>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Intent Understanding" icon={Target} count={agent.intents.filter(i => i.isActive).length} defaultOpen={false}>
          {agent.intents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No intents configured</p>
          ) : (
            <div className="space-y-2">
              {agent.intents.map(intent => (
                <div key={intent.id} className="p-2.5 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">{intent.name}</p>
                    <Badge variant={intent.isActive ? 'default' : 'secondary'} className={cn('text-[10px]', intent.isActive && 'bg-success')}>{intent.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1.5">{intent.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {intent.examples.map((ex, i) => (
                      <Badge key={i} variant="outline" className="text-[10px]">{ex}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Start Triggers" icon={Zap} count={agent.triggers.filter(t => t.isActive).length} defaultOpen={false}>
          {agent.triggers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No triggers configured</p>
          ) : (
            <div className="space-y-2">
              {agent.triggers.map(trigger => (
                <div key={trigger.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
                  <Badge variant="outline" className="text-[10px]">{TRIGGER_TYPE_LABELS[trigger.type]}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{trigger.description}</p>
                    <p className="text-xs text-muted-foreground font-mono">{trigger.value}</p>
                  </div>
                  <Badge variant={trigger.isActive ? 'default' : 'secondary'} className={cn('text-[10px]', trigger.isActive && 'bg-success')}>{trigger.isActive ? 'On' : 'Off'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Prompt Logic" icon={Brain} defaultOpen={false}>
          <div className="space-y-3">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">System Prompt</p>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-[10px]">Model: {agent.prompt.model}</Badge>
                  <Badge variant="outline" className="text-[10px]">Temp: {agent.prompt.temperature}</Badge>
                </div>
              </div>
              <pre className="text-xs whitespace-pre-wrap font-mono bg-background p-2 rounded border mt-1.5 max-h-40 overflow-y-auto">{agent.prompt.systemPrompt}</pre>
            </div>
            {agent.prompt.fewShotExamples.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">Few-Shot Examples ({agent.prompt.fewShotExamples.length})</p>
                <div className="space-y-2">
                  {agent.prompt.fewShotExamples.map(ex => (
                    <div key={ex.id} className="p-2.5 rounded-lg bg-muted/50 border space-y-1.5">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">User</Badge>
                        <p className="text-xs">{ex.userMessage}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="text-[10px] flex-shrink-0">Agent</Badge>
                        <p className="text-xs">{ex.assistantResponse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Variables" icon={Variable} count={agent.variables.length} defaultOpen={false}>
          {agent.variables.length === 0 ? (
            <p className="text-sm text-muted-foreground">No variables configured</p>
          ) : (
            <div className="space-y-2">
              {agent.variables.map(v => (
                <div key={v.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
                  <code className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border">{v.name}</code>
                  <Badge variant="outline" className="text-[10px]">{VARIABLE_TYPE_LABELS[v.type]}</Badge>
                  <span className="text-xs text-muted-foreground flex-1 truncate">{v.description}</span>
                  {v.required && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Routing Logic" icon={GitBranch} count={agent.routing.rules.length} defaultOpen={false}>
          <div className="space-y-2">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Routing Mode</p>
              <Badge variant="outline" className="text-xs capitalize">{agent.routing.mode}</Badge>
            </div>
            {agent.routing.rules.length > 0 && (
              <div className="space-y-2">
                {agent.routing.rules.map(rule => (
                  <div key={rule.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
                    <Badge variant="outline" className="text-[10px]">P{rule.priority}</Badge>
                    <code className="text-xs font-mono flex-1">{rule.condition}</code>
                    <span className="text-xs text-muted-foreground">{rule.targetAgentId}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Fallback Behavior" icon={AlertTriangle} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Action</p>
              <p className="text-sm font-medium">{FALLBACK_ACTION_LABELS[agent.fallback.action]}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Max Retries</p>
              <p className="text-sm font-medium">{agent.fallback.maxRetries}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Timeout</p>
              <p className="text-sm font-medium">{agent.fallback.timeoutSeconds}s</p>
            </div>
            {agent.fallback.customMessage && (
              <div className="p-2.5 rounded-lg bg-muted/50 col-span-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Custom Message</p>
                <p className="text-sm">{agent.fallback.customMessage}</p>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Context Handling" icon={Database} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Memory Window</p>
              <p className="text-sm font-medium">{agent.context.memoryWindow} messages</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Persist Sessions</p>
              <p className="text-sm font-medium">{agent.context.persistAcrossSessions ? 'Yes' : 'No'}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/50">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Share Context</p>
              <p className="text-sm font-medium">{agent.context.shareContextWithAgents ? 'Yes' : 'No'}</p>
            </div>
            {agent.context.contextVariables.length > 0 && (
              <div className="p-2.5 rounded-lg bg-muted/50">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Context Variables</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.context.contextVariables.map((v, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] font-mono">{v}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Guardrails" icon={Shield} count={agent.guardrails.filter(g => g.isActive).length} defaultOpen={false}>
          {agent.guardrails.length === 0 ? (
            <p className="text-sm text-muted-foreground">No guardrails configured</p>
          ) : (
            <div className="space-y-2">
              {agent.guardrails.map(g => (
                <div key={g.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border">
                  <Badge variant="outline" className="text-[10px]">{GUARDRAIL_TYPE_LABELS[g.type]}</Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground">{g.description}</p>
                  </div>
                  <Badge variant={g.severity === 'high' ? 'destructive' : g.severity === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                    {g.severity}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{g.action}</Badge>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      </div>
    </div>
  );
}
