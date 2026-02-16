import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FolderPlus,
  Plus,
  Search,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  FileText,
  Phone,
  MessageSquare,
  Mail,
  Pencil,
  GitBranch,
  Zap,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { FlowSummary, FlowChannel, FlowType } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface FlowListViewProps {
  flowSummaries: FlowSummary[];
  categories: string[];
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: (name: string, description: string, category: string, channel: FlowChannel, flowType: FlowType) => void;
  onDeleteFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onCreateFolder: (name: string) => boolean;
  onRenameFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (name: string) => void;
}

const CHANNEL_CONFIG: Record<FlowChannel, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  voice: { label: 'Voice', icon: <Phone className="w-3.5 h-3.5" />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/20' },
  chat: { label: 'Chat', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/20' },
  email: { label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/20' },
};

type TypeFilter = 'all' | 'flow' | 'workflow';

export function FlowListView({
  flowSummaries,
  categories,
  onSelectFlow,
  onCreateFlow,
  onDeleteFlow,
  onDuplicateFlow,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FlowListViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    () => Object.fromEntries(categories.map(c => [c, true]))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const [createTypeModalOpen, setCreateTypeModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [flowType, setFlowType] = useState<FlowType>('flow');
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState(categories[0] || 'Base');
  const [newFlowChannel, setNewFlowChannel] = useState<FlowChannel>('chat');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderModal, setRenameFolderModal] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredFlows = flowSummaries.filter(f => {
    const matchesSearch = !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || f.category === selectedCategory;
    const matchesType = typeFilter === 'all' || f.flowType === typeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  const flowsByCategory = categories.reduce<Record<string, FlowSummary[]>>((acc, cat) => {
    acc[cat] = filteredFlows.filter(f => f.category === cat);
    return acc;
  }, {});

  const handleSelectFlowType = (type: FlowType) => {
    setFlowType(type);
    setCreateTypeModalOpen(false);
    setCreateModalOpen(true);
  };

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) return;
    const category = showNewCategory && newCategoryName.trim()
      ? newCategoryName.trim()
      : newFlowCategory;

    if (showNewCategory && newCategoryName.trim()) {
      onCreateFolder(newCategoryName.trim());
      setExpandedCategories(prev => ({ ...prev, [newCategoryName.trim()]: true }));
    }

    onCreateFlow(newFlowName.trim(), newFlowDescription.trim(), category, newFlowChannel, flowType);
    setNewFlowName('');
    setNewFlowDescription('');
    setNewFlowChannel('chat');
    setNewCategoryName('');
    setShowNewCategory(false);
    setCreateModalOpen(false);
    notify.created(flowType === 'workflow' ? 'Workflow created' : 'Flow created');
  };

  const handleDeleteFlow = (flowId: string) => {
    onDeleteFlow(flowId);
    setDeleteConfirmId(null);
    notify.deleted('Flow deleted');
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const success = onCreateFolder(newFolderName.trim());
    if (success) {
      setExpandedCategories(prev => ({ ...prev, [newFolderName.trim()]: true }));
      notify.created('Category created');
    } else {
      notify.error('A category with this name already exists');
    }
    setNewFolderName('');
    setFolderModalOpen(false);
  };

  const handleRenameFolder = () => {
    if (!renameValue.trim() || !renameFolderModal) return;
    onRenameFolder(renameFolderModal, renameValue.trim());
    setExpandedCategories(prev => {
      const newState = { ...prev };
      newState[renameValue.trim()] = newState[renameFolderModal] ?? true;
      delete newState[renameFolderModal];
      return newState;
    });
    notify.success('Category renamed');
    setRenameFolderModal(null);
    setRenameValue('');
  };

  const handleDeleteFolder = (name: string) => {
    onDeleteFolder(name);
    setDeleteFolderConfirm(null);
    notify.deleted('Category and its flows deleted');
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const totalFlows = flowSummaries.length;
  const publishedFlows = flowSummaries.filter(f => f.status === 'published').length;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Flows & Workflows</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Build conversational flows and backend automations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setFolderModalOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New Category
          </Button>
          <Button onClick={() => setCreateTypeModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Flow
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="w-56 flex-shrink-0">
          <div className="space-y-1">
            <button
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                !selectedCategory
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
              onClick={() => setSelectedCategory(null)}
            >
              <Layers className="w-4 h-4" />
              All Flows
              <span className="ml-auto text-xs bg-muted rounded-full px-2 py-0.5">{totalFlows}</span>
            </button>

            {categories.map(cat => {
              const count = flowSummaries.filter(f => f.category === cat).length;
              return (
                <div key={cat} className="group">
                  <button
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
                      selectedCategory === cat
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    )}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span className="truncate">{cat}</span>
                    <span className="ml-auto text-xs bg-muted rounded-full px-2 py-0.5">{count}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="px-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Total flows</span>
                <span className="font-medium text-foreground">{totalFlows}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Published</span>
                <span className="font-medium text-green-600">{publishedFlows}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Draft</span>
                <span className="font-medium text-amber-600">{totalFlows - publishedFlows}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search flows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center rounded-lg border bg-muted/30 p-0.5">
              {([
                { key: 'all' as TypeFilter, label: 'All' },
                { key: 'flow' as TypeFilter, label: 'Flows', icon: <GitBranch className="w-3.5 h-3.5" /> },
                { key: 'workflow' as TypeFilter, label: 'Workflows', icon: <Zap className="w-3.5 h-3.5" /> },
              ]).map(tab => (
                <button
                  key={tab.key}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    typeFilter === tab.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setTypeFilter(tab.key)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="grid grid-cols-[1fr_1fr_130px_90px_80px_80px_44px] gap-4 px-6 py-3 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>Flow Name</span>
              <span>Description</span>
              <span>Last Edited</span>
              <span>Channel</span>
              <span>Type</span>
              <span>Status</span>
              <span></span>
            </div>

            {categories.map(category => {
              const categoryFlows = flowsByCategory[category] || [];
              if (selectedCategory && selectedCategory !== category) return null;
              const isExpanded = expandedCategories[category];

              return (
                <div key={category}>
                  <div
                    className={cn(
                      'flex items-center justify-between px-6 py-2.5 border-b cursor-pointer hover:bg-muted/30 transition-colors group',
                      isExpanded && 'bg-muted/20'
                    )}
                  >
                    <div
                      className="flex items-center gap-2 font-medium text-sm text-foreground flex-1"
                      onClick={() => toggleCategory(category)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <FolderOpen className="w-4 h-4 text-amber-500" />
                      {category}
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-1">{categoryFlows.length}</Badge>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setRenameFolderModal(category); setRenameValue(category); }}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Rename Category
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteFolderConfirm(category)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Category
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {isExpanded && categoryFlows.map(flow => {
                    const channelCfg = CHANNEL_CONFIG[flow.channel];
                    return (
                      <div
                        key={flow.id}
                        className="grid grid-cols-[1fr_1fr_130px_90px_80px_80px_44px] gap-4 px-6 py-3 border-b hover:bg-primary/5 transition-colors group cursor-pointer"
                        onClick={() => onSelectFlow(flow.id)}
                      >
                        <div className="flex items-center gap-3 pl-8">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-primary hover:underline truncate">
                            {flow.name}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground truncate self-center">
                          {flow.description || '-'}
                        </span>
                        <span className="text-xs text-muted-foreground self-center">
                          {formatDate(flow.updatedAt)}
                        </span>
                        <div className="self-center">
                          <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', channelCfg.bg, channelCfg.color)}>
                            {channelCfg.icon}
                            {channelCfg.label}
                          </span>
                        </div>
                        <div className="self-center">
                          <Badge variant="outline" className="text-[10px] gap-1">
                            {flow.flowType === 'workflow' ? (
                              <Zap className="w-3 h-3" />
                            ) : (
                              <GitBranch className="w-3 h-3" />
                            )}
                            {flow.flowType === 'workflow' ? 'Workflow' : 'Flow'}
                          </Badge>
                        </div>
                        <div className="self-center">
                          <Badge
                            variant={flow.status === 'published' ? 'default' : 'secondary'}
                            className={cn(
                              'text-[10px]',
                              flow.status === 'published' && 'bg-success hover:bg-success/80'
                            )}
                          >
                            {flow.status}
                          </Badge>
                        </div>
                        <div className="self-center" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onSelectFlow(flow.id)}>
                                <Play className="w-4 h-4 mr-2" />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onDuplicateFlow(flow.id)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteConfirmId(flow.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    );
                  })}

                  {isExpanded && categoryFlows.length === 0 && (
                    <div className="px-6 py-4 pl-14 border-b text-sm text-muted-foreground italic">
                      No flows in this category
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFlows.length === 0 && searchQuery && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No flows matching "{searchQuery}"</p>
              </div>
            )}

            {categories.length === 0 && !searchQuery && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <FolderPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No categories yet</p>
                <p className="text-xs mt-1">Create a category to organize your flows</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={createTypeModalOpen} onOpenChange={setCreateTypeModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Flow</DialogTitle>
            <DialogDescription>Choose how you want to create your flow</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <button
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => handleSelectFlowType('flow')}
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GitBranch className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Flow</p>
                <p className="text-xs text-muted-foreground mt-1">Build a conversational flow for rule-based agents with prompts, messages, and logic</p>
              </div>
            </button>

            <button
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              onClick={() => handleSelectFlowType('workflow')}
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Workflow</p>
                <p className="text-xs text-muted-foreground mt-1">Automate backend processes like API calls, database operations, and integrations</p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {flowType === 'workflow' ? 'Create Workflow' : 'Create Flow'}
            </DialogTitle>
            <DialogDescription>
              {flowType === 'workflow'
                ? 'Create a background workflow to run alongside your flows'
                : 'Define your new conversational flow'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="flowName">
                {flowType === 'workflow' ? 'Workflow Name' : 'Flow Name'}
              </Label>
              <Input
                id="flowName"
                placeholder={flowType === 'workflow' ? 'e.g., Generate Booking ID' : 'e.g., Flight Booking'}
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flowDesc">
                {flowType === 'workflow' ? 'Workflow Description' : 'Flow Description'}
              </Label>
              <Textarea
                id="flowDesc"
                placeholder="Describe the purpose of this flow"
                value={newFlowDescription}
                onChange={(e) => setNewFlowDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label>Channel</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['voice', 'chat', 'email'] as FlowChannel[]).map(ch => {
                  const cfg = CHANNEL_CONFIG[ch];
                  return (
                    <button
                      key={ch}
                      type="button"
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all',
                        newFlowChannel === ch
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                      )}
                      onClick={() => setNewFlowChannel(ch)}
                    >
                      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center', cfg.bg, cfg.color)}>
                        {ch === 'voice' && <Phone className="w-4 h-4" />}
                        {ch === 'chat' && <MessageSquare className="w-4 h-4" />}
                        {ch === 'email' && <Mail className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-medium">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="flowCategory">Category</Label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowNewCategory(!showNewCategory)}
                >
                  {showNewCategory ? 'Select existing' : '+ Create category'}
                </button>
              </div>
              {showNewCategory ? (
                <Input
                  placeholder="Enter new category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              ) : (
                <Select value={newFlowCategory} onValueChange={setNewFlowCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFlow} disabled={!newFlowName.trim() || (!showNewCategory && !newFlowCategory) || (showNewCategory && !newCategoryName.trim())}>
              <Plus className="w-4 h-4 mr-2" />
              {flowType === 'workflow' ? 'Create Workflow' : 'Create Flow'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Category Name</Label>
              <Input
                id="folderName"
                placeholder="e.g., Customer Service, Sales, Marketing"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFolderModalOpen(false); setNewFolderName(''); }}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameFolderModal} onOpenChange={() => setRenameFolderModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="renameFolderInput">Category Name</Label>
              <Input
                id="renameFolderInput"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRenameFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameFolderModal(null)}>Cancel</Button>
            <Button onClick={handleRenameFolder} disabled={!renameValue.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flow</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Are you sure you want to delete this flow? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirmId && handleDeleteFlow(deleteConfirmId)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteFolderConfirm} onOpenChange={() => setDeleteFolderConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Are you sure you want to delete the category "{deleteFolderConfirm}" and all flows inside it? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFolderConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteFolderConfirm && handleDeleteFolder(deleteFolderConfirm)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
