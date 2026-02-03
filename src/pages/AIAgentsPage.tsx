import { useState } from 'react';
import { Bot, Plus, Search, Filter, Sparkles, GitBranch, Volume2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PersonaCard } from '@/components/aiAgents/PersonaCard';
import { PersonaModal } from '@/components/aiAgents/PersonaModal';
import { TestPersonaModal } from '@/components/aiAgents/TestPersonaModal';
import { DeletePersonaModal } from '@/components/aiAgents/DeletePersonaModal';
import { TaskSequenceVisualizer } from '@/components/aiAgents/TaskSequenceVisualizer';
import { ToneAdaptationWidget } from '@/components/aiAgents/ToneAdaptationWidget';
import type { Persona, PersonaType } from '@/types/aiAgents';
import { PERSONA_TYPE_LABELS } from '@/types/aiAgents';

export default function AIAgentsPage() {
  const {
    personas,
    sequences,
    isLoading,
    addPersona,
    updatePersona,
    deletePersona,
    togglePersonaActive,
  } = useAIAgentsData();

  const { canCreate, canEdit, canDelete, withPermission } = usePermission('ai-agents');

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PersonaType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('personas');

  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Filter personas
  const filteredPersonas = personas.filter(persona => {
    const matchesSearch =
      persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      persona.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || persona.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Stats
  const stats = {
    total: personas.length,
    active: personas.filter(p => p.isActive).length,
    sales: personas.filter(p => p.type === 'sales').length,
    support: personas.filter(p => p.type === 'support').length,
    custom: personas.filter(p => p.type === 'custom').length,
  };

  const handleCreatePersona = () => {
    withPermission('create', () => {
      setSelectedPersona(null);
      setIsEditMode(false);
      setPersonaModalOpen(true);
    });
  };

  const handleEditPersona = (persona: Persona) => {
    withPermission('edit', () => {
      setSelectedPersona(persona);
      setIsEditMode(true);
      setPersonaModalOpen(true);
    });
  };

  const handleTestPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setTestModalOpen(true);
  };

  const handleDeleteClick = (persona: Persona) => {
    withPermission('delete', () => {
      setSelectedPersona(persona);
      setDeleteModalOpen(true);
    });
  };

  const handleSavePersona = async (personaData: Omit<Persona, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (isEditMode && selectedPersona) {
        await updatePersona(selectedPersona.id, personaData);
        notify.saved(`Persona "${personaData.name}"`);
      } else {
        await addPersona(personaData);
        notify.created(`Persona "${personaData.name}"`);
      }
    } catch (error) {
      notify.error('Failed to save persona', 'Please try again.');
      throw error;
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    const persona = personas.find(p => p.id === personaId);
    try {
      await deletePersona(personaId);
      notify.deleted(`Persona "${persona?.name}"`);
    } catch (error) {
      notify.error('Failed to delete persona', 'Please try again.');
      throw error;
    }
  };

  const handleToggleActive = (personaId: string) => {
    withPermission('edit', () => {
      const persona = personas.find(p => p.id === personaId);
      togglePersonaActive(personaId);
      if (persona?.isActive) {
        notify.info(`Persona "${persona.name}" deactivated`);
      } else {
        notify.success(`Persona "${persona?.name}" activated`);
      }
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Agents & Personas</h1>
            <p className="text-sm text-muted-foreground">
              Configure AI personas with custom behaviors, prompts, and voice settings
            </p>
          </div>
          <PermissionButton 
            screenId="ai-agents" 
            action="create" 
            onClick={handleCreatePersona}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Persona
          </PermissionButton>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Personas</p>
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
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <span className="text-lg">💼</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.sales}</p>
                  <p className="text-xs text-muted-foreground">Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg">🎧</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.support}</p>
                  <p className="text-xs text-muted-foreground">Support</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.custom}</p>
                  <p className="text-xs text-muted-foreground">Custom</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="personas" className="gap-2">
              <Bot className="w-4 h-4" />
              Personas
            </TabsTrigger>
            <TabsTrigger value="sequences" className="gap-2">
              <GitBranch className="w-4 h-4" />
              Task Sequences
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-2">
              <Volume2 className="w-4 h-4" />
              Voice Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personas" className="space-y-4 mt-4">
            {/* Filters */}
            <Card className="gradient-card">
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search personas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as PersonaType | 'all')}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(PERSONA_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Persona Grid */}
            {filteredPersonas.length === 0 ? (
              <Card className="gradient-card">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Bot className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No personas found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery || typeFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Create your first AI persona to get started'}
                  </p>
                  {!searchQuery && typeFilter === 'all' && canCreate && (
                    <PermissionButton screenId="ai-agents" action="create" onClick={handleCreatePersona}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Persona
                    </PermissionButton>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPersonas.map(persona => (
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    onEdit={handleEditPersona}
                    onTest={handleTestPersona}
                    onDelete={handleDeleteClick}
                    onToggleActive={handleToggleActive}
                    canEdit={canEdit}
                    canDelete={canDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sequences" className="space-y-4 mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              {sequences.map(sequence => (
                <TaskSequenceVisualizer
                  key={sequence.id}
                  sequence={sequence}
                  personas={personas}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4 mt-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <ToneAdaptationWidget personas={personas} />
              
              {/* Voice Preview Card */}
              <Card className="gradient-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Voice AI Integration</h3>
                      <p className="text-sm text-muted-foreground">Real-time voice synthesis</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Text-to-Speech Engine</span>
                        <Badge>Active</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Neural voice synthesis with emotion detection
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Speech Recognition</span>
                        <Badge>Active</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Real-time transcription with speaker diarization
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Sentiment Analysis</span>
                        <Badge variant="secondary">Beta</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Live emotion detection for adaptive responses
                      </p>
                    </div>
                  </div>

                  <PermissionButton 
                    screenId="ai-agents" 
                    action="edit" 
                    className="w-full" 
                    variant="outline"
                  >
                    Configure Voice Settings
                  </PermissionButton>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <PersonaModal
        persona={selectedPersona}
        open={personaModalOpen}
        onOpenChange={setPersonaModalOpen}
        onSave={handleSavePersona}
        isEdit={isEditMode}
      />

      <TestPersonaModal
        persona={selectedPersona}
        open={testModalOpen}
        onOpenChange={setTestModalOpen}
      />

      <DeletePersonaModal
        persona={selectedPersona}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDelete={handleDeletePersona}
      />
    </AppLayout>
  );
}
