import { useState } from 'react';
import { Star, Send, MessageSquare, Smile, Meh, Frown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SurveyType, CSAT_LABELS } from '@/types/surveys';
import { cn } from '@/lib/utils';

interface SurveyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyType: SurveyType;
  agentName?: string;
  followUpQuestion?: string;
  onSubmit: (score: number, followUp?: string) => Promise<void>;
  isLoading?: boolean;
}

export function SurveyModal({
  open,
  onOpenChange,
  surveyType,
  agentName,
  followUpQuestion = 'What could we have done better?',
  onSubmit,
  isLoading = false,
}: SurveyModalProps) {
  const [score, setScore] = useState<number | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);

  const handleSubmit = async () => {
    if (score === null) return;
    await onSubmit(score, followUp || undefined);
    setScore(null);
    setFollowUp('');
    setShowFollowUp(false);
  };

  const handleScoreSelect = (newScore: number) => {
    setScore(newScore);
    // Show follow-up for low scores
    if (surveyType === 'csat' && newScore <= 3) {
      setShowFollowUp(true);
    } else if (surveyType === 'nps' && newScore <= 6) {
      setShowFollowUp(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
            {surveyType === 'csat' ? 'How was your experience?' : 'Would you recommend us?'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {agentName 
              ? `Your feedback helps ${agentName} improve.`
              : 'Your feedback helps us improve our service.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* CSAT Rating (Stars) */}
          {surveyType === 'csat' && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleScoreSelect(value)}
                    className={cn(
                      "p-2 rounded-lg transition-all transform hover:scale-110",
                      score !== null && value <= score
                        ? "text-yellow-500"
                        : "text-muted-foreground hover:text-yellow-400"
                    )}
                  >
                    <Star
                      className={cn(
                        "w-10 h-10 transition-all",
                        score !== null && value <= score && "fill-current"
                      )}
                    />
                  </button>
                ))}
              </div>
              {score !== null && (
                <p className="text-center text-sm font-medium animate-fade-in">
                  {CSAT_LABELS[score]}
                </p>
              )}
            </div>
          )}

          {/* NPS Rating (0-10) */}
          {surveyType === 'nps' && (
            <div className="space-y-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
              <div className="flex justify-center gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleScoreSelect(value)}
                    className={cn(
                      "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                      score === value
                        ? value <= 6
                          ? "bg-destructive text-destructive-foreground"
                          : value <= 8
                          ? "bg-warning text-warning-foreground"
                          : "bg-success text-success-foreground"
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              {score !== null && (
                <div className="flex justify-center gap-2 animate-fade-in">
                  {score <= 6 && <Frown className="w-5 h-5 text-destructive" />}
                  {score >= 7 && score <= 8 && <Meh className="w-5 h-5 text-warning" />}
                  {score >= 9 && <Smile className="w-5 h-5 text-success" />}
                  <span className="text-sm font-medium">
                    {score <= 6 ? 'Detractor' : score <= 8 ? 'Passive' : 'Promoter'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Follow-up Question */}
          {showFollowUp && (
            <div className="space-y-2 animate-fade-in">
              <Label htmlFor="followup">{followUpQuestion}</Label>
              <Textarea
                id="followup"
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={score === null || isLoading}
          >
            {isLoading ? 'Submitting...' : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Submit Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
