import { useState, useEffect, useRef } from 'react';
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
  Plus,
  X,
  Upload,
  FileSpreadsheet,
  Users,
  AlertCircle,
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
  LeadSourceType,
} from '@/types/outboundCalling';
import { CHANNEL_CONFIG } from '@/types/outboundCalling';
import type { FlowSummary, FlowType, FlowChannel, Flow } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';

interface CreateCampaignWizardProps {
  templates: CampaignTemplate[];
  segments: CampaignSegment[];
  flows?: FlowSummary[];
  onCreateFlow?: (name: string, description: string, category: string, channel?: FlowChannel, flowType?: FlowType) => Flow;
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
  onCreateFlow,
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
  const [leadSource, setLeadSource] = useState<LeadSourceType>('csv');
  const [leadFile, setLeadFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [flowId, setFlowId] = useState('');
  const [workflowId, setWorkflowId] = useState('');
  const [flowSearch, setFlowSearch] = useState('');
  const [workflowSearch, setWorkflowSearch] = useState('');

  const [showCreateFlow, setShowCreateFlow] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDesc, setNewFlowDesc] = useState('');
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [newWorkflowDesc, setNewWorkflowDesc] = useState('');

  const conversationalFlows = flows.filter(f => f.flowType === 'flow');
  const automationWorkflows = flows.filter(f => f.flowType === 'workflow');

  const handleCreateNewFlow = () => {
    if (!onCreateFlow || !newFlowName.trim()) return;
    const newFlow = onCreateFlow(newFlowName.trim(), newFlowDesc.trim(), 'General', 'chat', 'flow');
    setFlowId(newFlow.id);
    setNewFlowName('');
    setNewFlowDesc('');
    setShowCreateFlow(false);
  };

  const handleCreateNewWorkflow = () => {
    if (!onCreateFlow || !newWorkflowName.trim()) return;
    const newWf = onCreateFlow(newWorkflowName.trim(), newWorkflowDesc.trim(), 'General', 'chat', 'workflow');
    setWorkflowId(newWf.id);
    setNewWorkflowName('');
    setNewWorkflowDesc('');
    setShowCreateWorkflow(false);
  };

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
    { id: 2, label: leadSource === 'csv' ? 'Upload Leads' : 'Flow & Workflow' },
    { id: 3, label: 'Review' },
  ];

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const validateFile = (file: File): string | null => {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.csv') && !ext.endsWith('.xls') && !ext.endsWith('.xlsx')) {
      return `Invalid file type "${file.name.split('.').pop()}". Only .csv, .xls, and .xlsx files are accepted.`;
    }
    if (file.size === 0) {
      return 'The file is empty. Please upload a file with lead data.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`;
    }
    return null;
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setLeadFile(null);
    } else {
      setFileError(null);
      setLeadFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        setFileError(error);
        setLeadFile(null);
      } else {
        setFileError(null);
        setLeadFile(file);
      }
    }
    if (e.target) e.target.value = '';
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return name.trim().length > 0;
      case 2:
        if (leadSource === 'csv') return !!leadFile;
        return true;
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
      leadSource,
      leadFile: leadFile || undefined,
      leadFileName: leadFile?.name || undefined,
      flowId: leadSource === 'flow' ? (flowId || undefined) : undefined,
      flowName: leadSource === 'flow' ? (selectedFlow?.name || undefined) : undefined,
      workflowId: leadSource === 'flow' ? (workflowId || undefined) : undefined,
      workflowName: leadSource === 'flow' ? (selectedWorkflow?.name || undefined) : undefined,
    });
    setIsSubmitting(false);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await onSaveDraft({
      name: name || undefined,
      description: description || undefined,
      channel,
      leadSource,
      leadFileName: leadFile?.name || undefined,
      flowId: leadSource === 'flow' ? (flowId || undefined) : undefined,
      workflowId: leadSource === 'flow' ? (workflowId || undefined) : undefined,
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

                <div className="space-y-3">
                  <Label>Lead Source *</Label>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Choose where to get your campaign leads from
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLeadSource('csv')}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        leadSource === 'csv'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        leadSource === 'csv' ? 'bg-green-100 dark:bg-green-950/40' : 'bg-muted'
                      )}>
                        <FileSpreadsheet className={cn(
                          'w-6 h-6',
                          leadSource === 'csv' ? 'text-green-600' : 'text-muted-foreground'
                        )} />
                      </div>
                      <span className="text-sm font-medium">CSV / Excel File</span>
                      <span className="text-[10px] text-muted-foreground text-center">
                        Upload a .csv or .xls file with your leads
                      </span>
                      {leadSource === 'csv' && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setLeadSource('flow')}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        leadSource === 'flow'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        leadSource === 'flow' ? 'bg-blue-100 dark:bg-blue-950/40' : 'bg-muted'
                      )}>
                        <GitBranch className={cn(
                          'w-6 h-6',
                          leadSource === 'flow' ? 'text-blue-600' : 'text-muted-foreground'
                        )} />
                      </div>
                      <span className="text-sm font-medium">Flow / Workflow</span>
                      <span className="text-[10px] text-muted-foreground text-center">
                        Use a conversational flow or automation workflow
                      </span>
                      {leadSource === 'flow' && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && leadSource === 'csv' && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold mb-0.5">Upload Lead File</h2>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV or Excel file containing your campaign leads
                </p>
              </div>

              <div
                className={cn(
                  'border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
                  dragOver && 'border-primary bg-primary/5',
                  leadFile ? 'border-green-500 bg-green-500/5' : 'border-border hover:border-primary/50'
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {leadFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="font-medium">{leadFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(leadFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLeadFile(null);
                        setFileError(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Drop your file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              {fileError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-destructive">{fileError}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV (.csv)
                </span>
                <span className="flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Excel (.xls, .xlsx)
                </span>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                Your file should include columns for lead name, phone number, and optionally email, company, and notes.
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && leadSource === 'flow' && (
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

                {showCreateFlow ? (
                  <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Create New Flow</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShowCreateFlow(false); setNewFlowName(''); setNewFlowDesc(''); }}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Flow name *"
                      value={newFlowName}
                      onChange={(e) => setNewFlowName(e.target.value)}
                      autoFocus
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newFlowDesc}
                      onChange={(e) => setNewFlowDesc(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setShowCreateFlow(false); setNewFlowName(''); setNewFlowDesc(''); }}>
                        Cancel
                      </Button>
                      <Button size="sm" disabled={!newFlowName.trim()} onClick={handleCreateNewFlow}>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Create
                      </Button>
                    </div>
                  </div>
                ) : onCreateFlow ? (
                  <button
                    onClick={() => setShowCreateFlow(true)}
                    className="w-full text-left px-3 py-2.5 rounded-lg border border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-2 text-sm text-primary"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Create New Flow</span>
                  </button>
                ) : null}

                {conversationalFlows.length === 0 && !showCreateFlow ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No conversational flows available</p>
                    <p className="text-xs">Create one above or in the Flow Builder</p>
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

                {showCreateWorkflow ? (
                  <div className="p-3 rounded-lg border border-purple-400/30 bg-purple-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Create New Workflow</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setShowCreateWorkflow(false); setNewWorkflowName(''); setNewWorkflowDesc(''); }}>
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Workflow name *"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      autoFocus
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={newWorkflowDesc}
                      onChange={(e) => setNewWorkflowDesc(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setShowCreateWorkflow(false); setNewWorkflowName(''); setNewWorkflowDesc(''); }}>
                        Cancel
                      </Button>
                      <Button size="sm" disabled={!newWorkflowName.trim()} onClick={handleCreateNewWorkflow}>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Create
                      </Button>
                    </div>
                  </div>
                ) : onCreateFlow ? (
                  <button
                    onClick={() => setShowCreateWorkflow(true)}
                    className="w-full text-left px-3 py-2.5 rounded-lg border border-dashed border-purple-400/40 hover:border-purple-500 hover:bg-purple-500/5 transition-all flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Create New Workflow</span>
                  </button>
                ) : null}

                {automationWorkflows.length === 0 && !showCreateWorkflow ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No automation workflows available</p>
                    <p className="text-xs">Create one above or in the Flow Builder</p>
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
                  <span className="text-sm text-muted-foreground">Lead Source</span>
                  <div className="flex items-center gap-1.5">
                    {leadSource === 'csv' ? (
                      <>
                        <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        <span className="font-medium text-sm">CSV / Excel File</span>
                      </>
                    ) : (
                      <>
                        <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-medium text-sm">Flow / Workflow</span>
                      </>
                    )}
                  </div>
                </div>
                {leadSource === 'csv' && leadFile && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Lead File</span>
                    <div className="flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" />
                      <span className="font-medium text-sm">{leadFile.name}</span>
                      <span className="text-xs text-muted-foreground">({(leadFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  </div>
                )}
                {leadSource === 'flow' && (
                  <>
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
                  </>
                )}
              </div>

              {leadSource === 'flow' && !selectedFlow && !selectedWorkflow && (
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
