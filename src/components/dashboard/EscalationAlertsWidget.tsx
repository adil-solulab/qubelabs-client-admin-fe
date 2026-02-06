import { useState, useEffect } from 'react';
import { AlertOctagon, ArrowUpRight, Clock, User, CheckCircle, Star, TrendingUp } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';
import { useSurveyData } from '@/hooks/useSurveyData';

interface EscalationAlertsWidgetProps {
  isLoading?: boolean;
}

interface Escalation {
  id: string;
  customer: string;
  reason: string;
  agent: string;
  waitTime: string;
  priority: 'high' | 'medium' | 'low';
  type: 'survey' | 'conversation';
  score?: number;
  surveyType?: 'csat' | 'nps';
}

const priorityStyles = {
  high: 'bg-destructive/10 text-destructive border-destructive/30',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  low: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
};

export function EscalationAlertsWidget({ isLoading }: EscalationAlertsWidgetProps) {
  const { pendingEscalations, acknowledgeEscalation } = useSurveyData();
  
  // Convert survey escalations to display format
  const surveyEscalations: Escalation[] = pendingEscalations.map(e => ({
    id: e.id,
    customer: e.customerName,
    reason: e.reason,
    agent: 'Survey Response',
    waitTime: getWaitTime(e.createdAt),
    priority: e.score <= 2 ? 'high' : 'medium',
    type: 'survey',
    score: e.score,
    surveyType: e.surveyType,
  }));

  const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  function getWaitTime(createdAt: string): string {
    const diff = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }

  const handleViewEscalation = (escalation: Escalation) => {
    setSelectedEscalation(escalation);
    setDetailModalOpen(true);
  };

  const handleTakeOver = async () => {
    if (!selectedEscalation) return;
    await acknowledgeEscalation(selectedEscalation.id, 'Current User');
    notify.success('Escalation Accepted', `You are now handling ${selectedEscalation.customer}'s feedback.`);
    setDetailModalOpen(false);
    setSelectedEscalation(null);
  };

  const handleReassign = () => {
    if (!selectedEscalation) return;
    notify.info('Reassignment', `Escalation for ${selectedEscalation.customer} has been sent to the queue.`);
    setDetailModalOpen(false);
    setSelectedEscalation(null);
  };

  return (
    <>
      <DashboardWidget
        title="Escalation Alerts"
        icon={AlertOctagon}
        iconColor="text-destructive"
        isLoading={isLoading}
        className="lg:col-span-2"
        action={
          surveyEscalations.length > 0 ? (
            <Badge variant="destructive" className="animate-pulse">
              {surveyEscalations.length} pending
            </Badge>
          ) : (
            <Badge variant="secondary">
              <CheckCircle className="w-3 h-3 mr-1" />
              All clear
            </Badge>
          )
        }
      >
        {surveyEscalations.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-sm">No pending escalations</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {surveyEscalations.map((escalation) => (
              <div 
                key={escalation.id}
                className={cn(
                  "p-3 rounded-lg border transition-colors cursor-pointer hover:shadow-md",
                  priorityStyles[escalation.priority]
                )}
                onClick={() => handleViewEscalation(escalation)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{escalation.customer}</span>
                      {escalation.surveyType && (
                        <Badge variant="outline" className="text-xs gap-1">
                          {escalation.surveyType === 'csat' ? (
                            <Star className="w-3 h-3" />
                          ) : (
                            <TrendingUp className="w-3 h-3" />
                          )}
                          {escalation.score}/{escalation.surveyType === 'csat' ? 5 : 10}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{escalation.reason}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {escalation.waitTime}
                      </span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEscalation(escalation);
                    }}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardWidget>

      {/* Escalation Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-destructive" />
              Escalation Details
            </DialogTitle>
            <DialogDescription>
              Review and take action on this escalated conversation.
            </DialogDescription>
          </DialogHeader>

          {selectedEscalation && (
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-xl border",
                priorityStyles[selectedEscalation.priority]
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg text-foreground">{selectedEscalation.customer}</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedEscalation.priority} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedEscalation.reason}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Current Handler</p>
                  <p className="font-medium">{selectedEscalation.agent}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Wait Time</p>
                  <p className="font-mono">{selectedEscalation.waitTime}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReassign}>
              Reassign
            </Button>
            <Button onClick={handleTakeOver}>
              <User className="w-4 h-4 mr-2" />
              Take Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
