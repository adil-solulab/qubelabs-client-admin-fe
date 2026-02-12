import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Plus,
  Search,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  Rocket,
  FileText,
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
import type { FlowSummary } from '@/types/flowBuilder';
import { cn } from '@/lib/utils';
import { notify } from '@/hooks/useNotification';

interface FlowListViewProps {
  flowSummaries: FlowSummary[];
  categories: string[];
  onSelectFlow: (flowId: string) => void;
  onCreateFlow: (name: string, description: string, category: string) => void;
  onDeleteFlow: (flowId: string) => void;
  onDuplicateFlow: (flowId: string) => void;
}

export function FlowListView({
  flowSummaries,
  categories,
  onSelectFlow,
  onCreateFlow,
  onDeleteFlow,
  onDuplicateFlow,
}: FlowListViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    () => Object.fromEntries(categories.map(c => [c, true]))
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  const [newFlowCategory, setNewFlowCategory] = useState(categories[0] || 'Base');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

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
    onCreateFlow(newFlowName.trim(), newFlowDescription.trim(), newFlowCategory);
    setNewFlowName('');
    setNewFlowDescription('');
    setCreateModalOpen(false);
    notify.created('Flow created');
  };

  const handleDeleteFlow = (flowId: string) => {
    onDeleteFlow(flowId);
    setDeleteConfirmId(null);
    notify.deleted('Flow deleted');
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
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create flow
          </Button>
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <div className="grid grid-cols-[1fr_1fr_180px_100px_48px] gap-4 px-6 py-3 bg-muted/40 border-b text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <span>Flow Name</span>
          <span>Flow Description</span>
          <span>Last Edited On</span>
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
                  'grid grid-cols-[1fr_1fr_180px_100px_48px] gap-4 px-6 py-3 border-b cursor-pointer hover:bg-muted/30 transition-colors group',
                  isExpanded && 'bg-muted/20'
                )}
                onClick={() => toggleCategory(category)}
              >
                <div className="flex items-center gap-2 font-medium text-foreground">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <FolderOpen className="w-4 h-4 text-muted-foreground" />
                  {category}
                  <span className="text-xs text-muted-foreground ml-1">({categoryFlows.length})</span>
                </div>
                <span className="text-sm text-muted-foreground">-</span>
                <span className="text-sm text-muted-foreground">-</span>
                <span></span>
                <span></span>
              </div>

              {isExpanded && categoryFlows.map(flow => (
                <div
                  key={flow.id}
                  className="grid grid-cols-[1fr_1fr_180px_100px_48px] gap-4 px-6 py-3 border-b hover:bg-primary/5 transition-colors group cursor-pointer"
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
              ))}

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
              <Label htmlFor="flowCategory">Category</Label>
              <Select value={newFlowCategory} onValueChange={setNewFlowCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFlow} disabled={!newFlowName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Flow
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
    </div>
  );
}
