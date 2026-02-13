import { useState } from 'react';
import { Bot, Plus, Search, Crown, Users, Sparkles, Zap, Shield } from 'lucide-react';
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
import { useAIAgentsData } from '@/hooks/useAIAgentsData';
import { usePermission } from '@/hooks/usePermission';
import { notify } from '@/hooks/useNotification';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { AgentCard } from '@/components/aiAgents/AgentCard';
import { AgentDetailPanel } from '@/components/aiAgents/AgentDetailPanel';
import { SuperAgentProfile } from '@/components/aiAgents/SuperAgentProfile';
import { AgentModal } from '@/components/aiAgents/AgentModal';
import { DeleteAgentModal } from '@/components/aiAgents/DeleteAgentModal';
import type { AIAgent } from '@/types/aiAgents';

export default function AIAgentsPage() {
  const {
    agents,
    superAgents,
    childAgents,
    isLoading,
    hasSuperAgent,
    getAgentsBySuper,
    addAgent,
    updateAgent,
    deleteAgent,
    toggleAgentStatus,
    duplicateAgent,
  } = useAIAgentsData();

  const { canCreate, canEdit, canDelete, withPermission } = usePermission('ai-agents');

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'super_agent' | 'agent'>('all');
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<AIAgent | null>(null);

  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [agentToEdit, setAgentToEdit] = useState<AIAgent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<AIAgent | null>(null);

  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || agent.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: agents.length,
    superAgents: superAgents.length,
    activeAgents: agents.filter(a => a.status === 'active').length,
    totalIntents: agents.reduce((sum, a) => sum + a.intents.filter(i => i.isActive).length, 0),
    totalGuardrails: agents.reduce((sum, a) => sum + a.guardrails.filter(g => g.isActive).length, 0),
  };

  const handleCreateAgent = () => {
    withPermission('create', () => {
      setAgentToEdit(null);
      setIsEditMode(false);
      setAgentModalOpen(true);
    });
  };

  const handleEditAgent = (agent: AIAgent) => {
    withPermission('edit', () => {
      setAgentToEdit(agent);
      setIsEditMode(true);
      setAgentModalOpen(true);
    });
  };

  const handleDeleteClick = (agent: AIAgent) => {
    withPermission('delete', () => {
      setAgentToDelete(agent);
      setDeleteModalOpen(true);
    });
  };

  const handleSaveAgent = async (agentData: Omit<AIAgent, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isEditMode && agentToEdit) {
        await updateAgent(agentToEdit.id, agentData);
        notify.saved(`Agent "${agentData.name}"`);
        if (viewingAgent?.id === agentToEdit.id) {
          setViewingAgent({ ...agentToEdit, ...agentData, updatedAt: new Date().toISOString().split('T')[0] });
        }
      } else {
        await addAgent(agentData);
        notify.created(`Agent "${agentData.name}"`);
      }
    } catch (error) {
      notify.error('Failed to save agent', 'Please try again.');
      throw error;
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    try {
      await deleteAgent(agentId);
      notify.deleted(`Agent "${agent?.name}"`);
      if (viewingAgent?.id === agentId) {
        setViewingAgent(null);
      }
    } catch (error) {
      notify.error('Failed to delete agent', 'Please try again.');
      throw error;
    }
  };

  const handleToggleStatus = (agentId: string) => {
    withPermission('edit', () => {
      const agent = agents.find(a => a.id === agentId);
      toggleAgentStatus(agentId);
      if (agent?.status === 'active') {
        notify.info(`Agent "${agent.name}" deactivated`);
      } else {
        notify.success(`Agent "${agent?.name}" activated`);
      }
    });
  };

  const handleDuplicate = (agent: AIAgent) => {
    withPermission('create', async () => {
      await duplicateAgent(agent.id);
      notify.created(`Agent "${agent.name}" duplicated`);
    });
  };

  const handleSelectAgent = (agent: AIAgent) => {
    setViewingAgent(agent);
  };

  if (viewingAgent) {
    const freshAgent = agents.find(a => a.id === viewingAgent.id) || viewingAgent;
    const children = freshAgent.type === 'super_agent' ? getAgentsBySuper(freshAgent.id) : undefined;

    if (freshAgent.type === 'super_agent') {
      return (
        <AppLayout>
          <SuperAgentProfile
            agent={freshAgent}
            onBack={() => setViewingAgent(null)}
            onEdit={handleEditAgent}
            canEdit={canEdit}
          />

          <AgentModal
            agent={agentToEdit}
            isEdit={isEditMode}
            open={agentModalOpen}
            onOpenChange={setAgentModalOpen}
            onSave={handleSaveAgent}
            superAgents={superAgents}
            hasSuperAgent={hasSuperAgent}
          />
        </AppLayout>
      );
    }

    return (
      <AppLayout>
        <AgentDetailPanel
          agent={freshAgent}
          childAgents={children}
          onBack={() => setViewingAgent(null)}
          onEdit={handleEditAgent}
          onTest={() => notify.info('Test mode', 'Agent testing will be available soon.')}
          onDuplicate={handleDuplicate}
          onDelete={handleDeleteClick}
          onSelectChild={handleSelectAgent}
          canEdit={canEdit}
          canDelete={canDelete}
        />

        <AgentModal
          agent={agentToEdit}
          isEdit={isEditMode}
          open={agentModalOpen}
          onOpenChange={setAgentModalOpen}
          onSave={handleSaveAgent}
          superAgents={superAgents}
          hasSuperAgent={hasSuperAgent}
        />

        <DeleteAgentModal
          agent={agentToDelete}
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onDelete={handleDeleteAgent}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Agents</h1>
            <p className="text-sm text-muted-foreground">
              Manage your Super Agent and specialized Agents
            </p>
          </div>
          <PermissionButton
            screenId="ai-agents"
            action="create"
            onClick={handleCreateAgent}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </PermissionButton>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.superAgents}</p>
                  <p className="text-xs text-muted-foreground">Super Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeAgents}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalIntents}</p>
                  <p className="text-xs text-muted-foreground">Active Intents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalGuardrails}</p>
                  <p className="text-xs text-muted-foreground">Guardrails</p>
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
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | 'super_agent' | 'agent')}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="super_agent">Super Agents</SelectItem>
                  <SelectItem value="agent">Agents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {superAgents.length > 0 && (typeFilter === 'all' || typeFilter === 'super_agent') && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Super Agents</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {superAgents
                .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    childCount={getAgentsBySuper(agent.id).length}
                    onSelect={handleSelectAgent}
                    onEdit={handleEditAgent}
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                    onToggleStatus={handleToggleStatus}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                ))}
            </div>
          </div>
        )}

        {childAgents.length > 0 && (typeFilter === 'all' || typeFilter === 'agent') && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Agents</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {childAgents
                .filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(agent => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={handleSelectAgent}
                    onEdit={handleEditAgent}
                    onDelete={handleDeleteClick}
                    onDuplicate={handleDuplicate}
                    onToggleStatus={handleToggleStatus}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                ))}
            </div>
          </div>
        )}

        {filteredAgents.length === 0 && (
          <Card className="gradient-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-1">No agents found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first AI agent to get started'}
              </p>
              {!searchQuery && typeFilter === 'all' && canCreate && (
                <PermissionButton screenId="ai-agents" action="create" onClick={handleCreateAgent}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Agent
                </PermissionButton>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AgentModal
        agent={agentToEdit}
        isEdit={isEditMode}
        open={agentModalOpen}
        onOpenChange={setAgentModalOpen}
        onSave={handleSaveAgent}
        superAgents={superAgents}
        hasSuperAgent={hasSuperAgent}
      />

      <DeleteAgentModal
        agent={agentToDelete}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDeleteAgent}
      />
    </AppLayout>
  );
}
