import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, AlertTriangle, Pencil, Bot, ChevronDown, ChevronRight,
  ArrowLeft, MousePointer, MessageCircle, BookOpen, HelpCircle,
  Headphones, ExternalLink, Plus, Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AIAgent } from '@/types/aiAgents';
import { TONE_LABELS } from '@/types/aiAgents';
import { WelcomeModal } from '@/components/aiAgents/WelcomeModal';
import { RulesModal } from '@/components/aiAgents/RulesModal';
import { cn } from '@/lib/utils';

type ProfileSection = 'profile' | 'safety' | 'fallback';

interface SuperAgentProfileProps {
  agent: AIAgent;
  onBack: () => void;
  onEdit: (agent: AIAgent) => void;
  canEdit: boolean;
}

interface SafetyCheck {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

function TimelineConnector() {
  return (
    <div className="flex justify-center py-1">
      <div className="w-px h-6 bg-border relative">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-border" />
      </div>
    </div>
  );
}

function TimelineStep({ icon: Icon, label, className }: { icon: React.ElementType; label: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 py-2", className)}>
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </div>
  );
}

function TimelineCard({ icon: Icon, title, subtitle, actionLabel, onAction, actionVariant = 'edit' }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  actionLabel: string;
  onAction?: () => void;
  actionVariant?: 'edit' | 'link' | 'add';
}) {
  return (
    <div className="bg-muted/30 border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
        </div>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className={cn(
            "flex items-center gap-1.5 text-sm font-medium hover:underline",
            actionVariant === 'link' ? "text-primary" : actionVariant === 'add' ? "text-primary" : "text-primary"
          )}
        >
          {actionVariant === 'edit' && <Pencil className="w-3.5 h-3.5" />}
          {actionVariant === 'link' && <ExternalLink className="w-3.5 h-3.5" />}
          {actionVariant === 'add' && <Plus className="w-3.5 h-3.5" />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ExpandableSection({ title, subtitle, count, children, defaultOpen = false }: {
  title: string;
  subtitle: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setOpen(!open)}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className="text-xs text-muted-foreground">{count} safety checks</span>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4">
          <Separator className="mb-4" />
          {children}
        </div>
      )}
    </div>
  );
}

export function SuperAgentProfile({ agent, onBack, onEdit, canEdit }: SuperAgentProfileProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ProfileSection>('profile');
  const [fallbackMode, setFallbackMode] = useState<string>('instruct');
  const [retryCount, setRetryCount] = useState(agent.fallback.maxRetries);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [welcomeMode, setWelcomeMode] = useState<string>('send_message');
  const [welcomeGreeting, setWelcomeGreeting] = useState(agent.persona.greeting);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [rules, setRules] = useState<string[]>([]);

  const [customerQueryFilters, setCustomerQueryFilters] = useState<SafetyCheck[]>([
    { id: 'banned', name: 'Banned Topics', description: 'Restricts conversations on improper topics like violence etc.', enabled: false },
    { id: 'violence', name: 'Violence', description: 'Detects and blocks harmful, offensive, or abusive language in incoming message.', enabled: false },
    { id: 'sexual', name: 'Sexual content', description: 'Blocks sexually explicit or inappropriate language in incoming messages to ensure safe and respectful conversations.', enabled: false },
  ]);

  const [aiResponseFilters, setAiResponseFilters] = useState<SafetyCheck[]>([
    { id: 'hallucination', name: 'Hallucination Prevention', description: 'Prevents AI from generating unverified or fabricated information.', enabled: true },
    { id: 'bias', name: 'Bias Detection', description: 'Identifies and mitigates biased language in AI responses.', enabled: false },
    { id: 'compliance', name: 'Regulatory Compliance', description: 'Ensures responses meet industry-specific compliance requirements.', enabled: true },
  ]);

  const toggleFilter = (filters: SafetyCheck[], setFilters: React.Dispatch<React.SetStateAction<SafetyCheck[]>>, id: string) => {
    setFilters(prev => prev.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f));
  };

  const handleViewFlow = () => {
    navigate('/flow-builder?openFlow=Live Agent');
  };

  const sidebarSections: { id: ProfileSection; label: string; icon: React.ElementType; description: string; tag?: string }[] = [
    { id: 'profile', label: 'Profile', icon: User, description: "Define your super agent's identity by setting its name, persona, role, scope & process.", tag: 'Mandatory' },
    { id: 'safety', label: 'AI Safety & Conduct', icon: AlertTriangle, description: "Safeguard every AI Interaction. Configure filters to ensure the AI Agent handles information responsibly, protects sensitive data, and maintains ethical, compliant interactions." },
    { id: 'fallback', label: 'Fallback', icon: AlertTriangle, description: "Handle unexpected situations. Configure actions for unexpected AI technical issues or when the super agent is unable to answer a query." },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Super agent profile</h1>
      </div>

      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0">
          <nav className="space-y-1">
            {sidebarSections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors",
                  activeSection === section.id
                    ? "bg-transparent"
                    : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <section.icon className={cn(
                    "w-4 h-4",
                    activeSection === section.id ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    activeSection === section.id ? "text-primary" : "text-foreground"
                  )}>
                    {section.label}
                  </span>
                </div>
                {activeSection === section.id && (
                  <div className="ml-6 mt-1">
                    {section.tag && (
                      <Badge variant="outline" className="text-[10px] mb-1.5 border-primary/30 text-primary">{section.tag}</Badge>
                    )}
                    <p className="text-xs text-muted-foreground leading-relaxed">{section.description}</p>
                  </div>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 min-w-0">
          {activeSection === 'profile' && (
            <div className="space-y-0">
              <div className="bg-card border rounded-lg p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                      <Bot className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h2 className="text-base font-semibold">{agent.name}</h2>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => onEdit(agent)}
                      className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-y-3 gap-x-8 text-sm">
                  <span className="text-muted-foreground">Company</span>
                  <span className="text-foreground">QubeLabs</span>

                  <span className="text-muted-foreground">Model</span>
                  <span className="text-foreground">{agent.prompt.model}</span>

                  <span className="text-muted-foreground">Persona</span>
                  <span className="text-foreground">{TONE_LABELS[agent.persona.tone]} and {agent.persona.style.toLowerCase()}</span>

                  <span className="text-muted-foreground">Channels</span>
                  <span className="text-foreground">-</span>

                  <span className="text-muted-foreground">My role</span>
                  <span className="text-foreground">{agent.description}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">HOW I HANDLE QUERIES</h3>

                <TimelineStep icon={MousePointer} label="Customer has a query" />
                <TimelineConnector />

                <TimelineCard
                  icon={MessageCircle}
                  title="Choose how to welcome"
                  subtitle={welcomeMode === 'send_message' ? 'Send message' : welcomeMode === 'trigger_flow' ? 'Trigger welcome flow' : 'Instruct super agent'}
                  actionLabel="Edit"
                  onAction={canEdit ? () => setWelcomeModalOpen(true) : undefined}
                  actionVariant="edit"
                />
                <TimelineConnector />

                <TimelineCard
                  icon={BookOpen}
                  title="Rules to follow"
                  subtitle={`${rules.length} rules added`}
                  actionLabel="Add"
                  onAction={canEdit ? () => setRulesModalOpen(true) : undefined}
                  actionVariant="add"
                />
                <TimelineConnector />

                <TimelineCard
                  icon={HelpCircle}
                  title="AI Safety & Conduct"
                  actionLabel="Manage"
                  onAction={() => setActiveSection('safety')}
                  actionVariant="edit"
                />
                <TimelineConnector />

                <TimelineStep icon={HelpCircle} label="Customer asks a query" />
                <TimelineConnector />

                <TimelineStep icon={Bot} label="Super agent attempts to answer" />
                <TimelineConnector />

                <TimelineCard
                  icon={HelpCircle}
                  title="If Super agent is unable to answer"
                  actionLabel="Manage"
                  onAction={() => setActiveSection('fallback')}
                  actionVariant="edit"
                />
                <TimelineConnector />

                <TimelineCard
                  icon={Headphones}
                  title="Live agent transfer"
                  actionLabel="View flow"
                  onAction={handleViewFlow}
                  actionVariant="link"
                />
              </div>
            </div>
          )}

          {activeSection === 'safety' && (
            <div className="space-y-6">
              <div className="bg-muted/30 border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Provides foundational content moderation through a standard, built-in safety check.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Advanced safety checks</h3>

                <div className="space-y-4">
                  <ExpandableSection
                    title="Customer query filters"
                    subtitle="Filter incoming queries to block unsafe or unwanted inputs."
                    count={customerQueryFilters.filter(f => f.enabled).length}
                    defaultOpen={true}
                  >
                    <div className="space-y-4">
                      {customerQueryFilters.map(filter => (
                        <div key={filter.id} className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{filter.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{filter.description}</p>
                          </div>
                          <Switch
                            checked={filter.enabled}
                            onCheckedChange={() => toggleFilter(customerQueryFilters, setCustomerQueryFilters, filter.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>

                  <ExpandableSection
                    title="AI response filters"
                    subtitle="Review AI responses to prevent harmful or sensitive outputs."
                    count={aiResponseFilters.filter(f => f.enabled).length}
                  >
                    <div className="space-y-4">
                      {aiResponseFilters.map(filter => (
                        <div key={filter.id} className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">{filter.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{filter.description}</p>
                          </div>
                          <Switch
                            checked={filter.enabled}
                            onCheckedChange={() => toggleFilter(aiResponseFilters, setAiResponseFilters, filter.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </ExpandableSection>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'fallback' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-foreground mb-1">If super agent is unable to proceed further</h3>
                <p className="text-sm text-muted-foreground">
                  Don't worry, it's rare, but it's always smart to be prepared for unexpected technical issues
                </p>
              </div>

              <div className="flex gap-8">
                <div className="flex-1 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-3">Next steps after failure</h4>
                    <Select value={fallbackMode} onValueChange={setFallbackMode}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instruct">
                          <div className="text-left">
                            <p className="font-medium">Instruct super agent</p>
                            <p className="text-xs text-muted-foreground">Craft a flexible fallback by giving direct instructions to the AI.</p>
                          </div>
                        </SelectItem>
                        <SelectItem value="trigger_flow">
                          <div className="text-left">
                            <p className="font-medium">Trigger global fallback flow</p>
                            <p className="text-xs text-muted-foreground">Automate structured conversations with pre-defined steps.</p>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Retries for information validation failures</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      How many times should the AI agent retry if the customer sends invalid information?
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() => setRetryCount(Math.max(0, retryCount - 1))}
                          className="px-2 py-1.5 hover:bg-muted transition-colors border-r"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-medium min-w-[40px] text-center">{retryCount}</span>
                        <button
                          onClick={() => setRetryCount(Math.min(10, retryCount + 1))}
                          className="px-2 py-1.5 hover:bg-muted transition-colors border-l"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-72 flex-shrink-0">
                  <div className="bg-muted/30 border rounded-lg p-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">HERE ARE THE POSSIBLE SCENARIOS:</h4>
                    <ul className="space-y-2.5 text-sm text-foreground">
                      <li>If Knowledge base fails</li>
                      <li>If APIs or workflows fail.</li>
                      <li>If the customer's input fails validation after multiple attempts.</li>
                      <li>During outages affecting our AI provider, answers won't be sent.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <WelcomeModal
        open={welcomeModalOpen}
        onOpenChange={setWelcomeModalOpen}
        greeting={welcomeGreeting}
        onSave={(mode, greeting) => {
          setWelcomeMode(mode);
          setWelcomeGreeting(greeting);
        }}
      />

      <RulesModal
        open={rulesModalOpen}
        onOpenChange={setRulesModalOpen}
        rules={rules}
        onSave={setRules}
      />
    </div>
  );
}
