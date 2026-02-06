import { useState } from 'react';
import { Settings, BarChart3, AlertTriangle, Play, Loader2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSurveyData } from '@/hooks/useSurveyData';
import { SurveyConfigPanel } from '@/components/surveys/SurveyConfigPanel';
import { SurveyDashboard } from '@/components/surveys/SurveyDashboard';
import { SurveyEscalationPanel } from '@/components/surveys/SurveyEscalationPanel';
import { SurveyModal } from '@/components/surveys/SurveyModal';
import { notify } from '@/hooks/useNotification';

export default function SurveysPage() {
  const {
    responses,
    config,
    stats,
    escalations,
    pendingEscalations,
    isLoading,
    isGeneratingSummary,
    triggerSurvey,
    submitSurveyResponse,
    updateConfig,
    acknowledgeEscalation,
    resolveEscalation,
    addEscalationNote,
  } = useSurveyData();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [testSurveyOpen, setTestSurveyOpen] = useState(false);
  const [testResponseId, setTestResponseId] = useState<string | null>(null);
  const [isTestingLoading, setIsTestingLoading] = useState(false);

  // Simulate triggering a survey (for demo purposes)
  const handleTestSurvey = async () => {
    setIsTestingLoading(true);
    try {
      const response = await triggerSurvey(
        `conv-${Date.now()}`,
        `cust-${Date.now()}`,
        'Test Customer',
        'chat',
        'agent-1',
        'John Smith',
        'test@example.com'
      );
      setTestResponseId(response.id);
      
      // Small delay then show survey modal
      await new Promise(resolve => setTimeout(resolve, 800));
      setTestSurveyOpen(true);
      notify.success('Survey triggered', 'Test survey is now ready for response.');
    } finally {
      setIsTestingLoading(false);
    }
  };

  const handleSubmitTestSurvey = async (score: number, followUp?: string) => {
    if (!testResponseId) return;
    await submitSurveyResponse(testResponseId, score, followUp);
    setTestSurveyOpen(false);
    setTestResponseId(null);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Post-Interaction Surveys</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered feedback collection and analysis
            </p>
          </div>
          <div className="flex items-center gap-2">
            {pendingEscalations.length > 0 && (
              <Badge variant="destructive" className="animate-pulse gap-1">
                <AlertTriangle className="w-3 h-3" />
                {pendingEscalations.length} escalations
              </Badge>
            )}
            <Badge variant="outline" className={config.enabled ? "border-success text-success" : ""}>
              {config.enabled ? '● Surveys Active' : '○ Surveys Disabled'}
            </Badge>
            <Button 
              variant="outline" 
              onClick={handleTestSurvey} 
              disabled={isLoading || isTestingLoading}
              data-testid="button-test-survey"
            >
              {isTestingLoading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-1" />
              )}
              {isTestingLoading ? 'Loading...' : 'Test Survey'}
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-1">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="escalations" className="gap-1">
              <AlertTriangle className="w-4 h-4" />
              Escalations
              {pendingEscalations.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {pendingEscalations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-1">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <SurveyDashboard
              stats={stats}
              responses={responses}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="escalations" className="mt-6">
            <SurveyEscalationPanel
              escalations={escalations}
              onAcknowledge={acknowledgeEscalation}
              onResolve={resolveEscalation}
              onAddNote={addEscalationNote}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <SurveyConfigPanel
              config={config}
              onSave={updateConfig}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>

        {/* Test Survey Modal */}
        <SurveyModal
          open={testSurveyOpen}
          onOpenChange={setTestSurveyOpen}
          surveyType={config.surveyType}
          agentName="John Smith"
          followUpQuestion={config.followUpQuestion}
          onSubmit={handleSubmitTestSurvey}
          isLoading={isGeneratingSummary}
        />
      </div>
    </AppLayout>
  );
}
