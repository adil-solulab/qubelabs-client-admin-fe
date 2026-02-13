import { useState } from 'react';
import { Activity, Plus, Search, CheckCircle2, Zap, BarChart3, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkflowsData } from '@/hooks/useWorkflowsData';
import { usePermission } from '@/hooks/usePermission';
import { notify } from '@/hooks/useNotification';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { WorkflowCard } from '@/components/workflows/WorkflowCard';
import { WorkflowDetailPanel } from '@/components/workflows/WorkflowDetailPanel';
import { WorkflowModal } from '@/components/workflows/WorkflowModal';
import { DeleteWorkflowModal } from '@/components/workflows/DeleteWorkflowModal';
import type { Workflow, WorkflowCategory } from '@/types/workflows';
import { CATEGORY_LABELS } from '@/types/workflows';

export default function WorkflowsPage() {
  const {
    workflows,
    activeWorkflows,
    totalExecutions,
    avgSuccessRate,
    isLoading,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    toggleWorkflowStatus,
    duplicateWorkflow,
    executeWorkflow,
  } = useWorkflowsData();

  const { canCreate, canEdit, canDelete, withPermission } = usePermission('workflows');

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | WorkflowCategory>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'draft'>('all');
  const [viewingWorkflow, setViewingWorkflow] = useState<Workflow | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [workflowToEdit, setWorkflowToEdit] = useState<Workflow | null>(null);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);

  const filteredWorkflows = workflows.filter(wf => {
    const matchesSearch =
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || wf.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || wf.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreate = () => {
    withPermission('create', () => {
      setWorkflowToEdit(null);
      setIsEditMode(false);
      setModalOpen(true);
    });
  };

  const handleEdit = (workflow: Workflow) => {
    withPermission('edit', () => {
      setWorkflowToEdit(workflow);
      setIsEditMode(true);
      setModalOpen(true);
    });
  };

  const handleDeleteClick = (workflow: Workflow) => {
    withPermission('delete', () => {
      setWorkflowToDelete(workflow);
      setDeleteModalOpen(true);
    });
  };

  const handleSave = async (data: { name: string; description: string; category: WorkflowCategory }) => {
    try {
      if (isEditMode && workflowToEdit) {
        await updateWorkflow(workflowToEdit.id, data);
        notify.saved(`Workflow "${data.name}"`);
        if (viewingWorkflow?.id === workflowToEdit.id) {
          setViewingWorkflow({ ...workflowToEdit, ...data, updatedAt: new Date().toISOString().split('T')[0] });
        }
      } else {
        await addWorkflow({
          ...data,
          status: 'draft',
          steps: [],
          variables: [],
          triggers: [],
          linkedAgentIds: [],
          createdBy: 'Current User',
        });
        notify.created(`Workflow "${data.name}"`);
      }
    } catch (error) {
      notify.error('Failed to save workflow', 'Please try again.');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    const workflow = workflows.find(w => w.id === id);
    try {
      await deleteWorkflow(id);
      notify.deleted(`Workflow "${workflow?.name}"`);
      if (viewingWorkflow?.id === id) setViewingWorkflow(null);
    } catch (error) {
      notify.error('Failed to delete workflow', 'Please try again.');
      throw error;
    }
  };

  const handleToggleStatus = (id: string) => {
    withPermission('edit', () => {
      const wf = workflows.find(w => w.id === id);
      toggleWorkflowStatus(id);
      notify.info(`Workflow "${wf?.name}" ${wf?.status === 'active' ? 'deactivated' : 'activated'}`);
    });
  };

  const handleDuplicate = (workflow: Workflow) => {
    withPermission('create', async () => {
      await duplicateWorkflow(workflow.id);
      notify.created(`Workflow "${workflow.name}" duplicated`);
    });
  };

  const handleExecute = (id: string) => {
    const wf = workflows.find(w => w.id === id);
    executeWorkflow(id);
    notify.success(`Running "${wf?.name}"...`);
  };

  if (viewingWorkflow) {
    const freshWorkflow = workflows.find(w => w.id === viewingWorkflow.id) || viewingWorkflow;
    return (
      <AppLayout>
        <WorkflowDetailPanel
          workflow={freshWorkflow}
          onBack={() => setViewingWorkflow(null)}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteClick}
          onExecute={handleExecute}
          canEdit={canEdit}
          canDelete={canDelete}
        />
        <WorkflowModal
          workflow={workflowToEdit}
          isEdit={isEditMode}
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={handleSave}
        />
        <DeleteWorkflowModal
          workflow={workflowToDelete}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onDelete={handleDelete}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Build and manage execution workflows for API calls, database queries, CRM updates, and more
            </p>
          </div>
          <PermissionButton
            screenId="workflows"
            action="create"
            onClick={handleCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Workflow
          </PermissionButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{workflows.length}</p>
                  <p className="text-xs text-muted-foreground">Total Workflows</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeWorkflows.length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalExecutions.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Executions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">Avg Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="gradient-card">
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as 'all' | WorkflowCategory)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive' | 'draft')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {filteredWorkflows.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkflows.map(workflow => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onSelect={setViewingWorkflow}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onDuplicate={handleDuplicate}
                onToggleStatus={handleToggleStatus}
                onExecute={handleExecute}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </div>
        ) : (
          <Card className="gradient-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-1">No workflows found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first workflow to automate business logic'}
              </p>
              {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && canCreate && (
                <PermissionButton screenId="workflows" action="create" onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workflow
                </PermissionButton>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <WorkflowModal
        workflow={workflowToEdit}
        isEdit={isEditMode}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
      />

      <DeleteWorkflowModal
        workflow={workflowToDelete}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDelete}
      />
    </AppLayout>
  );
}
