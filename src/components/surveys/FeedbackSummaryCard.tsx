import { format, formatDistanceToNow } from 'date-fns';
import {
  MessageSquare,
  Star,
  TrendingUp,
  User,
  Phone,
  Mail,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SurveyResponse, CSAT_LABELS, getNPSCategory, NPS_CATEGORIES } from '@/types/surveys';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface FeedbackSummaryCardProps {
  response: SurveyResponse;
  onViewConversation?: () => void;
  compact?: boolean;
}

export function FeedbackSummaryCard({
  response,
  onViewConversation,
  compact = false,
}: FeedbackSummaryCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const isNegative = response.surveyType === 'csat' 
    ? response.score <= 2 
    : response.score <= 6;
  
  const isPositive = response.surveyType === 'csat'
    ? response.score >= 4
    : response.score >= 9;

  const getScoreDisplay = () => {
    if (response.surveyType === 'csat') {
      return (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                "w-4 h-4",
                star <= response.score ? "text-yellow-500 fill-current" : "text-muted-foreground/30"
              )}
            />
          ))}
          <span className="ml-2 text-sm font-medium">
            ({response.score}/5)
          </span>
        </div>
      );
    }
    
    const category = getNPSCategory(response.score);
    const categoryInfo = NPS_CATEGORIES[category];
    
    return (
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-2xl font-bold",
          categoryInfo.color
        )}>
          {response.score}
        </span>
        <div className="text-sm">
          <span className={cn("font-medium", categoryInfo.color)}>
            {categoryInfo.label}
          </span>
          <span className="text-muted-foreground">/10</span>
        </div>
      </div>
    );
  };

  const getSentimentBadge = () => {
    if (!response.aiSummary) return null;
    
    const { sentiment } = response.aiSummary;
    const config = {
      positive: { label: 'Positive', color: 'bg-success/10 text-success border-success/20' },
      neutral: { label: 'Neutral', color: 'bg-muted text-muted-foreground' },
      negative: { label: 'Negative', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    
    return (
      <Badge variant="outline" className={config[sentiment].color}>
        {config[sentiment].label}
      </Badge>
    );
  };

  const getChannelIcon = () => {
    switch (response.channel) {
      case 'voice': return <Phone className="w-3 h-3" />;
      case 'chat': return <MessageSquare className="w-3 h-3" />;
      case 'email': return <Mail className="w-3 h-3" />;
    }
  };

  return (
    <Card className={cn(
      "gradient-card card-interactive animate-list-item-in",
      isNegative && "border-destructive/30",
      isPositive && "border-success/30"
    )}>
      <CardContent className={cn("pt-4", compact && "pb-3")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isNegative && "bg-destructive/10",
              isPositive && "bg-success/10",
              !isNegative && !isPositive && "bg-muted"
            )}>
              {response.surveyType === 'csat' ? (
                <Star className={cn(
                  "w-5 h-5",
                  isNegative && "text-destructive",
                  isPositive && "text-success",
                  !isNegative && !isPositive && "text-muted-foreground"
                )} />
              ) : (
                <TrendingUp className={cn(
                  "w-5 h-5",
                  isNegative && "text-destructive",
                  isPositive && "text-success",
                  !isNegative && !isPositive && "text-muted-foreground"
                )} />
              )}
            </div>
            <div>
              <h4 className="font-semibold">{response.customerName}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {getChannelIcon()}
                <span className="capitalize">{response.channel}</span>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(response.completedAt || response.sentAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getSentimentBadge()}
            {response.escalation && (
              <Badge variant="destructive" className="text-[10px]">
                Escalated
              </Badge>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            {getScoreDisplay()}
            {response.agentName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                {response.agentName}
              </div>
            )}
          </div>
          {response.surveyType === 'csat' && (
            <p className="mt-1 text-sm text-muted-foreground">
              {CSAT_LABELS[response.score]}
            </p>
          )}
        </div>

        {/* Follow-up Response */}
        {response.followUpResponse && (
          <div className="mt-3 p-3 rounded-lg bg-muted/30 border-l-2 border-primary">
            <p className="text-sm italic">"{response.followUpResponse}"</p>
          </div>
        )}

        {/* AI Summary */}
        {response.aiSummary && !compact && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails} className="mt-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Analysis
                </span>
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 space-y-3 animate-fade-in">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm">{response.aiSummary.summary}</p>
              </div>

              {response.aiSummary.keyIssues.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Key Issues Identified
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {response.aiSummary.keyIssues.map((issue, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {issue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {response.aiSummary.suggestedActions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    Suggested Actions
                  </p>
                  <ul className="text-sm space-y-1">
                    {response.aiSummary.suggestedActions.map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions */}
        {onViewConversation && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" size="sm" onClick={onViewConversation} className="w-full">
              <ExternalLink className="w-3 h-3 mr-1" />
              View Conversation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
