import { useState } from 'react';
import {
  CheckCircle2, Clock, ArrowUpCircle, PhoneCall, Voicemail,
  X, Tag, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { DispositionOutcome, CallDisposition } from '@/types/liveOps';

interface PostCallDispositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  duration: number;
  onSubmit: (disposition: CallDisposition) => void;
}

const OUTCOME_OPTIONS: { value: DispositionOutcome; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { value: 'resolved', label: 'Resolved', icon: CheckCircle2, description: 'Issue fully resolved' },
  { value: 'follow_up', label: 'Follow Up', icon: Clock, description: 'Needs follow-up action' },
  { value: 'escalated', label: 'Escalated', icon: ArrowUpCircle, description: 'Escalated to specialist' },
  { value: 'callback_scheduled', label: 'Callback', icon: PhoneCall, description: 'Callback scheduled' },
  { value: 'voicemail', label: 'Voicemail', icon: Voicemail, description: 'Left voicemail' },
];

const SUGGESTED_TAGS = [
  'Billing', 'Technical', 'Account', 'Complaint', 'Feature Request',
  'Bug Report', 'Refund', 'Subscription', 'Onboarding', 'Upsell',
];

export function PostCallDispositionModal({
  open,
  onOpenChange,
  customerName,
  duration,
  onSubmit,
}: PostCallDispositionModalProps) {
  const [outcome, setOutcome] = useState<DispositionOutcome | null>(null);
  const [summary, setSummary] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [followUpDate, setFollowUpDate] = useState('');

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (!outcome || !summary.trim()) return;
    onSubmit({
      outcome,
      summary: summary.trim(),
      tags: selectedTags,
      followUpDate: followUpDate || undefined,
    });
    setOutcome(null);
    setSummary('');
    setSelectedTags([]);
    setFollowUpDate('');
    onOpenChange(false);
  };

  const isValid = outcome && summary.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Post-Call Disposition
          </DialogTitle>
          <DialogDescription>
            Summarize the call with {customerName} ({formatDuration(duration)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div>
            <label className="text-sm font-medium mb-2.5 block">Call Outcome</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {OUTCOME_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = outcome === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setOutcome(option.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all text-center',
                      selected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    )}
                  >
                    <Icon className={cn('w-5 h-5', selected ? 'text-primary' : 'text-muted-foreground')} />
                    <span className={cn('text-xs font-medium', selected && 'text-primary')}>{option.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{option.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Call Summary</label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe the key points and resolution of the call..."
              className="min-h-[80px] resize-none text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all text-[11px]',
                    selectedTags.includes(tag) && 'shadow-sm'
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  {selectedTags.includes(tag) && <X className="w-2.5 h-2.5 mr-0.5" />}
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {(outcome === 'follow_up' || outcome === 'callback_scheduled') && (
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {outcome === 'callback_scheduled' ? 'Callback Date' : 'Follow-up Date'}
              </label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Submit Disposition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
