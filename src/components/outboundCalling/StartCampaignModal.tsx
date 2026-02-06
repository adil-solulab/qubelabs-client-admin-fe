import { useState } from 'react';
import { Play, Loader2, Phone, Users, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Campaign } from '@/types/outboundCalling';

interface StartCampaignModalProps {
  campaign: Campaign;
  pendingLeadsCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function StartCampaignModal({
  campaign,
  pendingLeadsCount,
  open,
  onOpenChange,
  onConfirm,
}: StartCampaignModalProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleConfirm = async () => {
    setIsStarting(true);
    await onConfirm();
    setIsStarting(false);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Play className="w-6 h-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-xl">Start Campaign</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            You are about to start the AI calling campaign. The AI will begin making calls to all pending leads.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Campaign Preview */}
        <div className="my-4 p-4 rounded-xl border bg-muted/30">
          <h4 className="font-semibold mb-3">{campaign.name}</h4>
          {campaign.description && (
            <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{pendingLeadsCount}</p>
                <p className="text-[10px] text-muted-foreground">Leads to Call</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold">{campaign.totalLeads}</p>
                <p className="text-[10px] text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-primary">Before you start</p>
              <p className="text-muted-foreground mt-0.5">
                Ensure your AI persona and call script are configured correctly. 
                You can pause the campaign at any time if needed.
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isStarting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isStarting || pendingLeadsCount === 0}>
            {isStarting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Start Campaign
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
