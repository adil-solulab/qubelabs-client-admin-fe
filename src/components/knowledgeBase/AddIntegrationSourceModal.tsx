import { useState } from 'react';
import { Plug, Loader2, CheckCircle, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SyncFrequency } from '@/types/knowledgeBase';
import { SYNC_FREQUENCY_LABELS, AVAILABLE_INTEGRATIONS } from '@/types/knowledgeBase';
import { cn } from '@/lib/utils';

interface AddIntegrationSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (
    integrationId: string,
    integrationName: string,
    integrationIcon: string,
    sourceType: string,
    syncFrequency: SyncFrequency,
    onProgress: (p: number) => void
  ) => Promise<void>;
}

type ModalState = 'select' | 'configure' | 'processing' | 'complete';

export function AddIntegrationSourceModal({ open, onOpenChange, onAdd }: AddIntegrationSourceModalProps) {
  const [state, setState] = useState<ModalState>('select');
  const [selectedIntegration, setSelectedIntegration] = useState<typeof AVAILABLE_INTEGRATIONS[0] | null>(null);
  const [syncFrequency, setSyncFrequency] = useState<SyncFrequency>('daily');
  const [progress, setProgress] = useState(0);

  const handleSelectIntegration = (integration: typeof AVAILABLE_INTEGRATIONS[0]) => {
    setSelectedIntegration(integration);
    setState('configure');
  };

  const handleConnect = async () => {
    if (!selectedIntegration) return;
    setState('processing');
    setProgress(0);

    const sourceTypeMap: Record<string, string> = {
      salesforce: 'Knowledge Articles',
      confluence: 'Wiki Pages',
      notion: 'Pages & Databases',
      zendesk: 'Help Center Articles',
      sharepoint: 'Documents',
      google_drive: 'Files & Folders',
      aws_s3: 'Bucket Objects',
      servicenow: 'Knowledge Articles',
      freshdesk: 'Solution Articles',
      database: 'Table Records',
    };

    try {
      await onAdd(
        selectedIntegration.id,
        selectedIntegration.name,
        selectedIntegration.icon,
        sourceTypeMap[selectedIntegration.id] || 'Documents',
        syncFrequency,
        setProgress
      );
      setState('complete');
    } catch {
      setState('configure');
    }
  };

  const handleClose = () => {
    setState('select');
    setSelectedIntegration(null);
    setSyncFrequency('daily');
    setProgress(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Plug className="w-4 h-4 text-primary-foreground" />
            </div>
            {state === 'select' ? 'Import from Integration' : selectedIntegration?.name}
          </DialogTitle>
          <DialogDescription>
            {state === 'select'
              ? 'Connect a third-party service to import knowledge base content automatically.'
              : `Configure the ${selectedIntegration?.name} integration to import content.`}
          </DialogDescription>
        </DialogHeader>

        {state === 'select' && (
          <div className="grid grid-cols-2 gap-2 max-h-[400px] overflow-y-auto py-1">
            {AVAILABLE_INTEGRATIONS.map((integration) => (
              <Card
                key={integration.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                onClick={() => handleSelectIntegration(integration)}
              >
                <CardContent className="p-3 flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0 mt-0.5">{integration.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{integration.name}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{integration.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {state === 'configure' && selectedIntegration && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <span className="text-3xl">{selectedIntegration.icon}</span>
              <div>
                <p className="font-medium">{selectedIntegration.name}</p>
                <p className="text-xs text-muted-foreground">{selectedIntegration.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Auto-Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={(v) => setSyncFrequency(v as SyncFrequency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SYNC_FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How often to sync new content from {selectedIntegration.name}
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5">
              <p className="text-xs font-medium">What will be imported:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">1</Badge>
                  Connect to your {selectedIntegration.name} account
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">2</Badge>
                  Discover available content and articles
                </li>
                <li className="flex items-start gap-1.5">
                  <Badge variant="secondary" className="text-[9px] mt-0.5 h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">3</Badge>
                  Import and index all content for AI training
                </li>
              </ul>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-medium">Importing from {selectedIntegration?.name}...</p>
              <p className="text-sm text-muted-foreground mt-1">
                Connecting and syncing content
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">{progress}%</p>
            </div>
          </div>
        )}

        {state === 'complete' && (
          <div className="py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">Import Complete!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Content from {selectedIntegration?.name} imported successfully. Ready for training.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {state === 'select' && (
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
          )}
          {state === 'configure' && (
            <>
              <Button variant="outline" onClick={() => setState('select')}>Back</Button>
              <Button onClick={handleConnect}>
                <Plug className="w-4 h-4 mr-2" />
                Connect & Import
              </Button>
            </>
          )}
          {state === 'complete' && (
            <Button onClick={handleClose} className="w-full">Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
