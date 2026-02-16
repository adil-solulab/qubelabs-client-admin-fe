import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Rocket,
  Save,
  Loader2,
  FileText,
  GitBranch,
  Zap,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  CampaignChannel,
  CampaignTemplate,
  CampaignSegment,
  CreateCampaignData,
} from '@/types/outboundCalling';
import { CHANNEL_CONFIG } from '@/types/outboundCalling';
import type { FlowSummary } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface CreateCampaignWizardProps {
  templates: CampaignTemplate[];
  segments: CampaignSegment[];
  flows?: FlowSummary[];
  onSubmit: (data: CreateCampaignData) => Promise<void>;
  onSaveDraft: (data: Partial<CreateCampaignData>) => Promise<void>;
  onCancel: () => void;
}

const ChannelCard = ({
  channel,
  selected,
  onClick,
}: {
  channel: CampaignChannel;
  selected: boolean;
  onClick: () => void;
}) => {
  const config = CHANNEL_CONFIG[channel];
  const icons = { voice: Phone, whatsapp: MessageCircle, sms: MessageSquare, email: Mail };
  const Icon = icons[channel];

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/30 hover:bg-muted/50'
      )}
    >
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.bgColor)}>
        <Icon className={cn('w-6 h-6', config.color)} />
      </div>
      <span className="text-sm font-medium">{config.label}</span>
      {selected && (
        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}
    </button>
  );
};

export function CreateCampaignWizard({
  templates,
  segments,
  flows = [],
  onSubmit,
  onSaveDraft,
  onCancel,
}: CreateCampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState<CampaignChannel>('voice');
  const [flowId, setFlowId] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [flowSearch, setFlowSearch] = useState('');
  const [workflowSearch, setWorkflowSearch] = useState('');

  const conversationalFlows = flows.filter(f => f.flowType === 'flow');
  const automationWorkflows = flows.filter(f => f.flowType === 'workflow');

  const filteredFlows = conversationalFlows.filter(f =>
    f.name.toLowerCase().includes(flowSearch.toLowerCase())
  );
  const filteredWorkflows = automationWorkflows.filter(f =>
    f.name.toLowerCase().includes(workflowSearch.toLowerCase())
  );

  const selectedFlow = conversationalFlows.find(f => f.id === flowId);
  const selectedWorkflow = automationWorkflows.find(f => f.id === workflowId);

  const STEPS = [
    { id: 1, label: 'Basic Info' },
    { id: 2, label: 'Flow & Workflow' },
    { id: 3, label: 'Review' },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 1: return name.trim().length > 0;
      case 2: return true;
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit({
      name,
      description,
      channel,
      flowId: flowId || undefined,
      flowName: selectedFlow?.name || undefined,
      workflowId: workflowId || undefined,
      workflowName: selectedWorkflow?.name || undefined,
    });
    setIsSubmitting(false);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await onSaveDraft({
      name: name || undefined,
      description: description || undefined,
      channel,
      flowId: flowId || undefined,
      workflowId: workflowId || undefined,
    });
    setIsSavingDraft(false);
  };

  return (
    <div className="flex flex-col animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Create Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Set up your outbound campaign
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((step, index) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isCompleted && setCurrentStep(step.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                  isActive && 'bg-primary-foreground/20',
                  isCompleted && 'bg-primary/20',
                  !isActive && !isCompleted && 'bg-muted'
                )}>
                  {isCompleted ? <Check className="w-3 h-3" /> : step.id}
                </div>
                <span className="font-medium">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  'w-8 h-px mx-1',
                  currentStep > step.id ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 mb-6">
        {currentStep === 1 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold mb-0.5">Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  Name your campaign and select the communication channel
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    placeholder="e.g., Q1 Sales Outreach"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="campaign-desc">Description</Label>
                  <Textarea
                    id="campaign-desc"
                    placeholder="Describe the purpose of this campaign..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Select Channel *</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(['voice', 'whatsapp', 'sms', 'email'] as CampaignChannel[]).map((ch) => (
                      <ChannelCard
                        key={ch}
                        channel={ch}
                        selected={channel === ch}
                        onClick={() => setChannel(ch)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <Card className="gradient-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
                    <GitBranch className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Conversational Flow</h2>
                    <p className="text-xs text-muted-foreground">
                      Select a flow to handle the conversation logic for this campaign
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search flows..."
                    value={flowSearch}
                    onChange={(e) => setFlowSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {conversationalFlows.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No conversational flows available</p>
                    <p className="text-xs">Create flows in the Flow Builder first</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    <button
                      onClick={() => setFlowId('')}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm',
                        !flowId ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <span className="text-muted-foreground italic">None (no flow)</span>
                    </button>
                    {filteredFlows.map((flow) => (
                      <button
                        key={flow.id}
                        onClick={() => setFlowId(flow.id)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center gap-3',
                          flowId === flow.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
                        )}
                      >
                        <GitBranch className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{flow.name}</p>
                          {flow.description && (
                            <p className="text-xs text-muted-foreground truncate">{flow.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {flow.status}
                        </Badge>
                        {flowId === flow.id && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="gradient-card">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center">
                    <Zap className="w-4.5 h-4.5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Automation Workflow</h2>
                    <p className="text-xs text-muted-foreground">
                      Select a workflow for backend automation and post-call processing
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={workflowSearch}
                    onChange={(e) => setWorkflowSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {automationWorkflows.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No automation workflows available</p>
                    <p className="text-xs">Create workflows in the Flow Builder first</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    <button
                      onClick={() => setWorkflowId('')}
                      className={cn(
                        'w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm',
                        !workflowId ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <span className="text-muted-foreground italic">None (no workflow)</span>
                    </button>
                    {filteredWorkflows.map((wf) => (
                      <button
                        key={wf.id}
                        onClick={() => setWorkflowId(wf.id)}
                        className={cn(
                          'w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center gap-3',
                          workflowId === wf.id ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
                        )}
                      >
                        <Zap className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{wf.name}</p>
                          {wf.description && (
                            <p className="text-xs text-muted-foreground truncate">{wf.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">
                          {wf.status}
                        </Badge>
                        {workflowId === wf.id && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 3 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold mb-0.5">Review & Launch</h2>
                <p className="text-sm text-muted-foreground">
                  Confirm your campaign details before launching
                </p>
              </div>

              <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Campaign Name</span>
                  <span className="font-medium text-sm">{name}</span>
                </div>
                {description && (
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Description</span>
                    <span className="text-sm text-right">{description}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Channel</span>
                  <Badge className={cn(CHANNEL_CONFIG[channel].bgColor, CHANNEL_CONFIG[channel].color, 'border-0')}>
                    {CHANNEL_CONFIG[channel].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversational Flow</span>
                  {selectedFlow ? (
                    <div className="flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                      <span className="font-medium text-sm">{selectedFlow.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Not assigned</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Automation Workflow</span>
                  {selectedWorkflow ? (
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-medium text-sm">{selectedWorkflow.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Not assigned</span>
                  )}
                </div>
              </div>

              {!selectedFlow && !selectedWorkflow && (
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
                  <p className="text-xs text-warning">
                    No flow or workflow is assigned. You can add them later from the campaign detail view.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel} size="sm">
            Cancel
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingDraft} size="sm">
            {isSavingDraft ? (
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1.5" />
            )}
            Save as Draft
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed()} size="sm">
              Next
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()} size="sm">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-1.5" />
              )}
              Launch Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
