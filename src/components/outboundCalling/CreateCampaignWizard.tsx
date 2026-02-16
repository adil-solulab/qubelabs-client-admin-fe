import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Phone,
  MessageCircle,
  MessageSquare,
  Mail,
  Users,
  Calendar,
  Target,
  Rocket,
  Save,
  Loader2,
  Clock,
  Repeat,
  Send,
  ChevronRight,
  FileText,
  Radio,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type {
  CampaignChannel,
  CampaignTemplate,
  CampaignSegment,
  CreateCampaignData,
  ScheduleType,
  GoalType,
} from '@/types/outboundCalling';
import { CHANNEL_CONFIG } from '@/types/outboundCalling';
import { cn } from '@/lib/utils';

interface CreateCampaignWizardProps {
  templates: CampaignTemplate[];
  segments: CampaignSegment[];
  onSubmit: (data: CreateCampaignData) => Promise<void>;
  onSaveDraft: (data: Partial<CreateCampaignData>) => Promise<void>;
  onCancel: () => void;
}

const STEPS = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Template', icon: Radio },
  { id: 3, label: 'Audience', icon: Users },
  { id: 4, label: 'Schedule', icon: Calendar },
  { id: 5, label: 'Goal', icon: Target },
  { id: 6, label: 'Review', icon: Rocket },
];

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
  const [templateId, setTemplateId] = useState('');
  const [segmentId, setSegmentId] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('delivery');
  const [goalTarget, setGoalTarget] = useState([80]);
  const [goalDuration, setGoalDuration] = useState('24');
  const [goalUnit, setGoalUnit] = useState<'hours' | 'days'>('hours');

  const filteredTemplates = templates.filter(t => t.channel === channel && t.status === 'approved');
  const selectedTemplate = templates.find(t => t.id === templateId);
  const selectedSegment = segments.find(s => s.id === segmentId);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return name.trim().length > 0;
      case 2: return templateId.length > 0;
      case 3: return segmentId.length > 0;
      case 4: return scheduleType === 'now' || (scheduleDate && scheduleTime);
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
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
      templateId,
      segmentId,
      schedule: {
        type: scheduleType,
        date: scheduleDate,
        time: scheduleTime,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      goal: {
        type: goalType,
        targetPercentage: goalTarget[0],
        trackDuration: parseInt(goalDuration),
        trackUnit: goalUnit,
      },
    });
    setIsSubmitting(false);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    await onSaveDraft({
      name: name || undefined,
      description: description || undefined,
      channel,
      templateId: templateId || undefined,
      segmentId: segmentId || undefined,
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
          <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Set up your outbound campaign in a few simple steps
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => isCompleted && setCurrentStep(step.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap',
                  isActive && 'bg-primary text-primary-foreground',
                  isCompleted && 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium',
                  isActive && 'bg-primary-foreground/20',
                  isCompleted && 'bg-primary/20',
                  !isActive && !isCompleted && 'bg-muted'
                )}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : <StepIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground mx-1 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 mb-6">
        {currentStep === 1 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Basic Information</h2>
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
                        onClick={() => { setChannel(ch); setTemplateId(''); }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Message Template</h2>
                <p className="text-sm text-muted-foreground">
                  Select an approved template for your {CHANNEL_CONFIG[channel].label} campaign
                </p>
              </div>

              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium">No approved templates</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    No approved templates found for {CHANNEL_CONFIG[channel].label} channel
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setTemplateId(template.id)}
                      className={cn(
                        'w-full text-left p-4 rounded-xl border-2 transition-all',
                        templateId === template.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{template.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {template.content}
                          </p>
                          {template.variables.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              {template.variables.map((v) => (
                                <Badge key={v} variant="secondary" className="text-xs">
                                  {`{{${v}}}`}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1',
                          templateId === template.id
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground/30'
                        )}>
                          {templateId === template.id && (
                            <Check className="w-3 h-3 text-primary-foreground" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedTemplate && (
                <div className="p-4 rounded-xl bg-muted/50 border">
                  <h4 className="text-sm font-medium mb-2">Template Preview</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedTemplate.content}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Target Audience</h2>
                <p className="text-sm text-muted-foreground">
                  Select a segment from your user base or create a new one
                </p>
              </div>

              <div className="space-y-3">
                {segments.map((segment) => (
                  <button
                    key={segment.id}
                    onClick={() => setSegmentId(segment.id)}
                    className={cn(
                      'w-full text-left p-4 rounded-xl border-2 transition-all',
                      segmentId === segment.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{segment.name}</p>
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-3 h-3 mr-1" />
                            {segment.userCount.toLocaleString()} users
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{segment.description}</p>
                        {segment.filters && segment.filters.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {segment.filters.map((f, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        segmentId === segment.id
                          ? 'border-primary bg-primary'
                          : 'border-muted-foreground/30'
                      )}>
                        {segmentId === segment.id && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Schedule Campaign</h2>
                <p className="text-sm text-muted-foreground">
                  Choose when to send your campaign
                </p>
              </div>

              <RadioGroup value={scheduleType} onValueChange={(v) => setScheduleType(v as ScheduleType)} className="space-y-3">
                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    scheduleType === 'now' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  )}
                >
                  <RadioGroupItem value="now" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-primary" />
                      <span className="font-medium">Send Now</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Campaign will start within 10 minutes after launch
                    </p>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    scheduleType === 'later' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  )}
                >
                  <RadioGroupItem value="later" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Schedule for Later</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set a specific date and time to send
                    </p>
                    {scheduleType === 'later' && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Date</Label>
                          <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Time</Label>
                          <Input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all',
                    scheduleType === 'recurring' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                  )}
                >
                  <RadioGroupItem value="recurring" className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Repeat className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">Run Multiple Times</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Configure a recurring campaign schedule
                    </p>
                    {scheduleType === 'recurring' && (
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Start Date</Label>
                          <Input
                            type="date"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Time</Label>
                          <Input
                            type="time"
                            value={scheduleTime}
                            onChange={(e) => setScheduleTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {currentStep === 5 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Campaign Goal</h2>
                <p className="text-sm text-muted-foreground">
                  Set the objective you want to track for this campaign
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Goal Type</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { type: 'delivery' as GoalType, label: 'Delivery', desc: 'Track successful message delivery', icon: Send },
                      { type: 'conversion' as GoalType, label: 'Conversion', desc: 'Track user conversions after campaign', icon: Target },
                      { type: 'response' as GoalType, label: 'Response', desc: 'Track user response rate', icon: MessageCircle },
                    ].map((goal) => {
                      const GoalIcon = goal.icon;
                      return (
                        <button
                          key={goal.type}
                          onClick={() => setGoalType(goal.type)}
                          className={cn(
                            'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                            goalType === goal.type
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30'
                          )}
                        >
                          <GoalIcon className={cn('w-6 h-6', goalType === goal.type ? 'text-primary' : 'text-muted-foreground')} />
                          <span className="font-medium text-sm">{goal.label}</span>
                          <span className="text-xs text-muted-foreground">{goal.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Target Percentage</Label>
                    <span className="text-sm font-medium text-primary">{goalTarget[0]}%</span>
                  </div>
                  <Slider
                    value={goalTarget}
                    onValueChange={setGoalTarget}
                    min={10}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Track Goal For</Label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      value={goalDuration}
                      onChange={(e) => setGoalDuration(e.target.value)}
                      className="w-24"
                      min="1"
                    />
                    <Select value={goalUnit} onValueChange={(v) => setGoalUnit(v as 'hours' | 'days')}>
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours">Hours</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 6 && (
          <Card className="gradient-card">
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Review & Launch</h2>
                <p className="text-sm text-muted-foreground">
                  Review all campaign details before launching
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Campaign Name</span>
                    <span className="font-medium">{name}</span>
                  </div>
                  {description && (
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-sm text-muted-foreground flex-shrink-0">Description</span>
                      <span className="text-sm text-right">{description}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Channel</span>
                    <Badge className={cn(CHANNEL_CONFIG[channel].bgColor, CHANNEL_CONFIG[channel].color)}>
                      {CHANNEL_CONFIG[channel].label}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Template</span>
                    <span className="font-medium">{selectedTemplate?.name || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Audience</span>
                    <span className="font-medium">
                      {selectedSegment?.name || '-'}
                      {selectedSegment && (
                        <span className="text-muted-foreground ml-1">
                          ({selectedSegment.userCount.toLocaleString()} users)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Schedule</span>
                    <span className="font-medium capitalize">
                      {scheduleType === 'now' ? 'Send Now' : scheduleType === 'later' ? `${scheduleDate} at ${scheduleTime}` : 'Recurring'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Goal</span>
                    <span className="font-medium capitalize">
                      {goalType} - {goalTarget[0]}% in {goalDuration} {goalUnit}
                    </span>
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="p-4 rounded-xl border bg-muted/30">
                    <h4 className="text-sm font-medium mb-2">Message Preview</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTemplate.content}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSavingDraft}>
            {isSavingDraft ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save as Draft
          </Button>

          {currentStep < 6 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting || !canProceed()}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              Launch Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
