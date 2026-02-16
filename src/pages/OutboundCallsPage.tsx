import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useOutboundCallingData } from '@/hooks/useOutboundCallingData';
import { notify } from '@/hooks/useNotification';
import { CampaignListView } from '@/components/outboundCalling/CampaignListView';
import { CreateCampaignWizard } from '@/components/outboundCalling/CreateCampaignWizard';
import { CampaignDetailView } from '@/components/outboundCalling/CampaignDetailView';
import type { CreateCampaignData, CampaignStatus } from '@/types/outboundCalling';

type ViewMode = 'list' | 'create' | 'detail';

export default function OutboundCallsPage() {
  const {
    campaigns,
    templates,
    segments,
    selectedCampaign,
    leads,
    outcomeStats,
    sentimentStats,
    uploadProgress,
    isUploading,
    selectCampaign,
    deselectCampaign,
    createCampaign,
    saveDraft,
    deleteCampaign,
    updateCampaignStatus,
    uploadLeads,
    escalateLead,
    clearUploadProgress,
  } = useOutboundCallingData();

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const handleCreateCampaign = () => {
    setViewMode('create');
  };

  const handleViewCampaign = (campaignId: string) => {
    selectCampaign(campaignId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    deselectCampaign();
    setViewMode('list');
  };

  const handleSubmitCampaign = async (data: CreateCampaignData) => {
    const campaign = await createCampaign(data);
    notify.success('Campaign launched', `"${campaign.name}" has been created and ${data.schedule.type === 'now' ? 'started' : 'scheduled'}.`);
    setViewMode('list');
  };

  const handleSaveDraft = async (data: Partial<CreateCampaignData>) => {
    await saveDraft(data);
    notify.success('Draft saved', 'Campaign draft has been saved. You can resume editing anytime.');
    setViewMode('list');
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    await deleteCampaign(campaignId);
    notify.success('Campaign deleted', 'Campaign has been removed.');
  };

  const handleUpdateStatus = async (campaignId: string, status: CampaignStatus) => {
    await updateCampaignStatus(campaignId, status);
    const labels: Record<CampaignStatus, string> = {
      running: 'launched',
      paused: 'paused',
      completed: 'completed',
      draft: 'moved to draft',
      scheduled: 'scheduled',
    };
    notify.success('Status updated', `Campaign has been ${labels[status]}.`);
  };

  const handleUploadLeads = async (file: File) => {
    const result = await uploadLeads(file);
    if (result.success) {
      notify.uploaded(`${result.leadsAdded} leads added to campaign`);
    } else {
      notify.error('Upload failed', 'Failed to upload leads. Please try again.');
    }
    return result;
  };

  const handleEscalateLead = async (leadId: string, agentName: string) => {
    return await escalateLead(leadId, agentName);
  };

  return (
    <AppLayout>
      {viewMode === 'list' && (
        <CampaignListView
          campaigns={campaigns}
          onCreateCampaign={handleCreateCampaign}
          onViewCampaign={handleViewCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {viewMode === 'create' && (
        <CreateCampaignWizard
          templates={templates}
          segments={segments}
          onSubmit={handleSubmitCampaign}
          onSaveDraft={handleSaveDraft}
          onCancel={handleBackToList}
        />
      )}

      {viewMode === 'detail' && selectedCampaign && (
        <CampaignDetailView
          campaign={selectedCampaign}
          leads={leads}
          outcomeStats={outcomeStats}
          sentimentStats={sentimentStats}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          onBack={handleBackToList}
          onUploadLeads={handleUploadLeads}
          onEscalateLead={handleEscalateLead}
          onClearUploadProgress={clearUploadProgress}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </AppLayout>
  );
}
