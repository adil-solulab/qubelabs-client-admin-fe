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
import type { FlowSummary, FlowType } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface FlowListViewProps {
  flowSummaries: FlowSummary[];
  categories: string[];
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: (name: string, description: string, category: string, flowType: FlowType) => void;
  onDeleteFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onCreateFolder: (name: string) => boolean;
  onRenameFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (name: string) => void;
}

const CHANNEL_CONFIG = {
  voice: { label: 'Voice', icon: <Phone className="w-3.5 h-3.5" />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/20' },
  chat: { label: 'Chat', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/20' },
  email: { label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/20' },
} as const;

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
  const [activeBuilder, setActiveBuilder] = useState<FlowType>('flow');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState(categories[0] || 'Base');
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
    const matchesType = f.flowType === activeBuilder;
    return matchesSearch && matchesCategory && matchesType;
  });

  const flowsByCategory = categories.reduce<Record<string, FlowSummary[]>>((acc, cat) => {
    acc[cat] = filteredFlows.filter(f => f.category === cat);
    return acc;
  }, {});

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) return;
    const category = showNewCategory && newCategoryName.trim()
      ? newCategoryName.trim()
      : newFlowCategory;

    if (showNewCategory && newCategoryName.trim()) {
      onCreateFolder(newCategoryName.trim());
      setExpandedCategories(prev => ({ ...prev, [newCategoryName.trim()]: true }));
    }

    onCreateFlow(newFlowName.trim(), newFlowDescription.trim(), category, activeBuilder);
    setNewFlowName('');
    setNewFlowDescription('');
    setNewCategoryName('');
    setShowNewCategory(false);
    setCreateModalOpen(false);
    notify.created(activeBuilder === 'workflow' ? 'Workflow created' : 'Flow created');
  };

  const handleDeleteFlow = (flowId: string) => {
    onDeleteFlow(flowId);
    setDeleteConfirmId(null);
    notify.deleted(activeBuilder === 'workflow' ? 'Workflow deleted' : 'Flow deleted');
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

  const isFlow = activeBuilder === 'flow';
  const builderLabel = isFlow ? 'Flow' : 'Workflow';
  const allOfType = flowSummaries.filter(f => f.flowType === activeBuilder);
  const totalItems = allOfType.length;
  const publishedItems = allOfType.filter(f => f.status === 'published').length;

  const sidebarCategories = categories.filter(cat =>
    flowSummaries.some(f => f.category === cat)
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">Builders</h1>
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
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {isFlow ? 'Create Flow' : 'Create Workflow'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          className={cn(
            'relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group',
            activeBuilder === 'flow'
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 shadow-sm'
              : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
          )}
          onClick={() => { setActiveBuilder('flow'); setSelectedCategory(null); setSearchQuery(''); }}
        >
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            activeBuilder === 'flow'
              ? 'bg-blue-100 dark:bg-blue-500/20'
              : 'bg-muted'
          )}>
            <GitBranch className={cn('w-6 h-6', activeBuilder === 'flow' ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground')} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-base font-semibold', activeBuilder === 'flow' ? 'text-blue-700 dark:text-blue-300' : 'text-foreground')}>
                Flow Builder
              </p>
              <Badge variant="secondary" className="text-[10px] h-5">
                {flowSummaries.filter(f => f.flowType === 'flow').length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Conversational flows with prompts, messages, and logic
            </p>
          </div>
          {activeBuilder === 'flow' && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>

        <button
          className={cn(
            'relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group',
            activeBuilder === 'workflow'
              ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10 shadow-sm'
              : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
          )}
          onClick={() => { setActiveBuilder('workflow'); setSelectedCategory(null); setSearchQuery(''); }}
        >
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
            activeBuilder === 'workflow'
              ? 'bg-purple-100 dark:bg-purple-500/20'
              : 'bg-muted'
          )}>
            <Zap className={cn('w-6 h-6', activeBuilder === 'workflow' ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground')} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={cn('text-base font-semibold', activeBuilder === 'workflow' ? 'text-purple-700 dark:text-purple-300' : 'text-foreground')}>
                Workflow Builder
              </p>
              <Badge variant="secondary" className="text-[10px] h-5">
                {flowSummaries.filter(f => f.flowType === 'workflow').length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Backend automations with API calls, database ops, and integrations
            </p>
          </div>
          {activeBuilder === 'workflow' && (
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500" />
          )}
        </button>
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
              All {isFlow ? 'Flows' : 'Workflows'}
              <span className="ml-auto text-xs bg-muted rounded-full px-2 py-0.5">{totalItems}</span>
            </button>

            {sidebarCategories.map(cat => {
              const count = allOfType.filter(f => f.category === cat).length;
              if (count === 0) return null;
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
                <span>Total {isFlow ? 'flows' : 'workflows'}</span>
                <span className="font-medium text-foreground">{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Published</span>
                <span className="font-medium text-green-600">{publishedItems}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Draft</span>
                <span className="font-medium text-amber-600">{totalItems - publishedItems}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${isFlow ? 'flows' : 'workflows'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden bg-card">
            <div className="grid grid-cols-[1fr_1fr_130px_120px_80px_44px] gap-4 px-6 py-3 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <span>{builderLabel} Name</span>
              <span>Description</span>
              <span>Last Edited</span>
              <span>Channels</span>
              <span>Status</span>
              <span></span>
            </div>

            {categories.map(category => {
              const categoryFlows = flowsByCategory[category] || [];
              if (selectedCategory && selectedCategory !== category) return null;
              if (categoryFlows.length === 0 && !selectedCategory) return null;
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
                    return (
                      <div
                        key={flow.id}
                        className="grid grid-cols-[1fr_1fr_130px_120px_80px_44px] gap-4 px-6 py-3 border-b hover:bg-primary/5 transition-colors group cursor-pointer"
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
                        <div className="self-center flex items-center gap-1 flex-wrap">
                          {flow.channels.map(ch => {
                            const cfg = CHANNEL_CONFIG[ch];
                            return (
                              <span key={ch} className={cn('inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full', cfg.bg, cfg.color)}>
                                {cfg.icon}
                              </span>
                            );
                          })}
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
                      No {isFlow ? 'flows' : 'workflows'} in this category
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFlows.length === 0 && searchQuery && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No {isFlow ? 'flows' : 'workflows'} matching "{searchQuery}"</p>
              </div>
            )}

            {filteredFlows.length === 0 && !searchQuery && (
              <div className="px-6 py-12 text-center text-muted-foreground">
                {isFlow ? <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" /> : <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />}
                <p className="text-sm font-medium">No {isFlow ? 'flows' : 'workflows'} yet</p>
                <p className="text-xs mt-1">Create your first {isFlow ? 'conversational flow' : 'backend workflow'} to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeBuilder === 'workflow' ? 'Create Workflow' : 'Create Flow'}
            </DialogTitle>
            <DialogDescription>
              {activeBuilder === 'workflow'
                ? 'Create a background workflow to run alongside your flows'
                : 'Define your new conversational flow'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="flowName">
                {activeBuilder === 'workflow' ? 'Workflow Name' : 'Flow Name'}
              </Label>
              <Input
                id="flowName"
                placeholder={activeBuilder === 'workflow' ? 'e.g., Generate Booking ID' : 'e.g., Flight Booking'}
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flowDesc">
                {activeBuilder === 'workflow' ? 'Workflow Description' : 'Flow Description'}
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
              {activeBuilder === 'workflow' ? 'Create Workflow' : 'Create Flow'}
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
