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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FlowSummary, FlowChannel } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface FlowListViewProps {
  flowSummaries: FlowSummary[];
  categories: string[];
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: (name: string, description: string, category: string, channel: FlowChannel) => void;
  onDeleteFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
  onCreateFolder: (name: string) => boolean;
  onRenameFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (name: string) => void;
}

const CHANNEL_CONFIG: Record<FlowChannel, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  voice: { label: 'Voice', icon: <Phone className="w-3 h-3" />, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/20' },
  chat: { label: 'Chat', icon: <MessageSquare className="w-3 h-3" />, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' },
  email: { label: 'Email', icon: <Mail className="w-3 h-3" />, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-500/20' },
};

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
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState(categories[0] || 'Base');
  const [newFlowChannel, setNewFlowChannel] = useState<FlowChannel>('chat');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderModal, setRenameFolderModal] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteFolderConfirm, setDeleteFolderConfirm] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const filteredFlows = searchQuery
    ? flowSummaries.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : flowSummaries;

  const flowsByCategory = categories.reduce<Record<string, FlowSummary[]>>((acc, cat) => {
    acc[cat] = filteredFlows.filter(f => f.category === cat);
    return acc;
  }, {});

  const handleCreateFlow = () => {
    if (!newFlowName.trim()) return;
    onCreateFlow(newFlowName.trim(), newFlowDescription.trim(), newFlowCategory, newFlowChannel);
    setNewFlowName('');
    setNewFlowDescription('');
    setNewFlowChannel('chat');
    setCreateModalOpen(false);
    notify.created('Flow created');
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
      notify.created('Folder created');
    } else {
      notify.error('A folder with this name already exists');
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
    notify.success('Folder renamed');
    setRenameFolderModal(null);
    setRenameValue('');
  };

  const handleDeleteFolder = (name: string) => {
    onDeleteFolder(name);
    setDeleteFolderConfirm(null);
    notify.deleted('Folder and its flows deleted');
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Flows</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your conversation flows and automations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search flows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[220px]"
            />
          </div>
          <Button variant="outline" onClick={() => setFolderModalOpen(true)}>
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Flow
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="grid grid-cols-[1fr_1fr_140px_100px_80px_48px] gap-4 px-6 py-3 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Flow Name</span>
          <span>Description</span>
          <span>Last Edited</span>
          <span>Channel</span>
          <span>Status</span>
          <span></span>
        </div>

        {categories.map(category => {
          const categoryFlows = flowsByCategory[category] || [];
          const isExpanded = expandedCategories[category];

          return (
            <div key={category}>
              <div
                className={cn(
                  'grid grid-cols-[1fr_1fr_140px_100px_80px_48px] gap-4 px-6 py-3 border-b cursor-pointer hover:bg-muted/30 transition-colors group',
                  isExpanded && 'bg-muted/20'
                )}
              >
                <div
                  className="flex items-center gap-2 font-medium text-foreground col-span-5"
                  onClick={() => toggleCategory(category)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  {category}
                  <span className="text-xs text-muted-foreground ml-1">({categoryFlows.length})</span>
                </div>
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setRenameFolderModal(category); setRenameValue(category); }}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename Folder
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteFolderConfirm(category)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Folder
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
                    className="grid grid-cols-[1fr_1fr_140px_100px_80px_48px] gap-4 px-6 py-3 border-b hover:bg-primary/5 transition-colors group cursor-pointer"
                    onClick={() => onSelectFlow(flow.id)}
                  >
                    <div className="flex items-center gap-3 pl-8">
                      <FileText className="w-4 h-4 text-primary/60 flex-shrink-0" />
                      <span className="text-sm font-medium text-primary hover:underline truncate">
                        {flow.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground truncate self-center">
                      {flow.description || '-'}
                    </span>
                    <span className="text-sm text-muted-foreground self-center">
                      {formatDate(flow.updatedAt)}
                    </span>
                    <div className="self-center">
                      <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', channelCfg.bg, channelCfg.color)}>
                        {channelCfg.icon}
                        {channelCfg.label}
                      </span>
                    </div>
                    <div className="self-center">
                      <Badge
                        variant={flow.status === 'published' ? 'default' : 'secondary'}
                        className={cn(
                          'text-xs',
                          flow.status === 'published' && 'bg-success hover:bg-success/80'
                        )}
                      >
                        {flow.status}
                      </Badge>
                    </div>
                    <div className="self-center" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
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
                  No flows in this folder
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
            <p className="text-sm font-medium">No folders yet</p>
            <p className="text-xs mt-1">Create a folder to organize your flows</p>
          </div>
        )}
      </div>

      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Flow</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="flowName">Flow Name</Label>
              <Input
                id="flowName"
                placeholder="e.g., Customer Onboarding"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flowDesc">Description</Label>
              <Input
                id="flowDesc"
                placeholder="Brief description of this flow"
                value={newFlowDescription}
                onChange={(e) => setNewFlowDescription(e.target.value)}
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
                        'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                        newFlowChannel === ch
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                      )}
                      onClick={() => setNewFlowChannel(ch)}
                    >
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', cfg.bg, cfg.color)}>
                        {ch === 'voice' && <Phone className="w-5 h-5" />}
                        {ch === 'chat' && <MessageSquare className="w-5 h-5" />}
                        {ch === 'email' && <Mail className="w-5 h-5" />}
                      </div>
                      <span className="text-sm font-medium">{cfg.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="flowCategory">Folder</Label>
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFlow} disabled={!newFlowName.trim() || !newFlowCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Create Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={folderModalOpen} onOpenChange={setFolderModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
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
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameFolderModal} onOpenChange={() => setRenameFolderModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="renameFolderInput">Folder Name</Label>
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
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-4">
            Are you sure you want to delete the folder "{deleteFolderConfirm}" and all flows inside it? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteFolderConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteFolderConfirm && handleDeleteFolder(deleteFolderConfirm)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
