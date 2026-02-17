import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Upload, 
  Search, 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  Filter,
  ShieldCheck,
  Crown,
  Headset,
  Lock,
  UsersRound,
  Plus,
  Mail,
  Clock,
  ToggleRight,
  Eye,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useUsersData } from '@/hooks/useUsersData';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { AddUserModal } from '@/components/users/AddUserModal';
import { EditUserDrawer } from '@/components/users/EditUserDrawer';
import { DeleteUserModal } from '@/components/users/DeleteUserModal';
import { ImportUsersModal } from '@/components/users/ImportUsersModal';
import type { TeamUser, UserRole, AgentStatus, AgentGroup } from '@/types/users';
import { ROLE_LABELS, STATUS_LABELS } from '@/types/users';
import { cn } from '@/lib/utils';

type TabType = 'users' | 'groups';

export default function UsersPage() {
  const { 
    users, 
    groups,
    isLoading, 
    addUser, 
    updateUser, 
    deleteUser, 
    importUsers,
    addGroup,
    updateGroup,
    deleteGroup,
  } = useUsersData();

  const { canCreate, canEdit, canDelete, withPermission } = usePermission('users');
  const { notifyRoleChange, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);

  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupDetailOpen, setGroupDetailOpen] = useState(false);
  const [deleteGroupModalOpen, setDeleteGroupModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AgentGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<AgentGroup | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'client_admin').length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    agents: users.filter(u => u.role === 'agent').length,
    available: users.filter(u => u.status === 'available').length,
  };

  const groupStats = {
    total: groups.length,
    active: groups.filter(g => g.agentIds.some(id => users.find(u => u.id === id)?.status === 'available')).length,
    totalAgents: new Set(groups.flatMap(g => g.agentIds)).size,
  };

  const getUserById = (id: string) => users.find(u => u.id === id);
  const supervisors = users.filter(u => u.role === 'supervisor');
  const agentUsers = users.filter(u => u.role === 'agent');

  const handleAddUser = async (userData: Omit<TeamUser, 'id' | 'createdAt' | 'lastActive'>) => {
    try {
      const newUser = await addUser(userData);
      notify.created(`User "${newUser.name}"`);
      return newUser;
    } catch (error) {
      notify.error('Failed to create user', 'Please check the information and try again.');
      throw error;
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<TeamUser>) => {
    try {
      const existingUser = users.find(u => u.id === userId);
      await updateUser(userId, userData);
      
      if (userData.role && existingUser?.role !== userData.role) {
        notifyRoleChange(userId, userData.role);
        
        if (userId !== currentUser?.id) {
          notify.info(
            'Role Updated',
            `${existingUser?.name}'s session will be refreshed with new permissions.`
          );
        }
      }
      
      notify.saved('User information');
    } catch (error) {
      notify.error('Failed to update user', 'Please try again.');
      throw error;
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    try {
      await deleteUser(userId);
      notify.deleted(`User "${user?.name}"`);
    } catch (error) {
      notify.error('Failed to delete user', 'Please try again.');
      throw error;
    }
  };

  const handleImportUsers = async (file: File, onProgress: (progress: number) => void) => {
    try {
      const result = await importUsers(file, onProgress);
      if (result.failed > 0) {
        notify.warning(`Imported ${result.success} users`, `${result.failed} failed to import.`);
      } else {
        notify.uploaded(`${result.success} users imported`);
      }
      return result;
    } catch (error) {
      notify.error('Import failed', 'Could not import users from file.');
      throw error;
    }
  };

  const handleEditClick = (user: TeamUser) => {
    withPermission('edit', () => {
      setSelectedUser(user);
      setEditDrawerOpen(true);
    });
  };

  const handleDeleteClick = (user: TeamUser) => {
    withPermission('delete', () => {
      setSelectedUser(user);
      setDeleteModalOpen(true);
    });
  };

  const handleAddClick = () => {
    withPermission('create', () => {
      setAddModalOpen(true);
    });
  };

  const handleImportClick = () => {
    withPermission('create', () => {
      setImportModalOpen(true);
    });
  };

  const handleAddGroupClick = () => {
    withPermission('create', () => {
      setEditingGroup(null);
      setGroupModalOpen(true);
    });
  };

  const handleEditGroupClick = (group: AgentGroup) => {
    withPermission('edit', () => {
      setEditingGroup(group);
      setGroupModalOpen(true);
    });
  };

  const handleDeleteGroupClick = (group: AgentGroup) => {
    withPermission('delete', () => {
      setSelectedGroup(group);
      setDeleteGroupModalOpen(true);
    });
  };

  const handleGroupRowClick = (group: AgentGroup) => {
    setSelectedGroup(group);
    setGroupDetailOpen(true);
  };

  const handleConfirmDeleteGroup = async () => {
    if (!selectedGroup) return;
    try {
      await deleteGroup(selectedGroup.id);
      notify.deleted(`Group "${selectedGroup.name}"`);
      setDeleteGroupModalOpen(false);
      setSelectedGroup(null);
    } catch {
      notify.error('Failed to delete group', 'Please try again.');
    }
  };

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'away': return 'bg-orange-400';
      case 'offline': return 'bg-muted-foreground';
    }
  };

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success border-success/30';
      case 'busy': return 'bg-warning/10 text-warning border-warning/30';
      case 'away': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'offline': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'client_admin': return Crown;
      case 'supervisor': return ShieldCheck;
      case 'agent': return Headset;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'client_admin': return 'bg-primary/10 text-primary border-primary/30';
      case 'supervisor': return 'bg-accent/10 text-accent border-accent/30';
      case 'agent': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users & Team Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage team members, roles, and skill assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'users' ? (
              <>
                <PermissionButton 
                  screenId="users" 
                  action="create" 
                  variant="outline" 
                  onClick={handleImportClick}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </PermissionButton>
                <PermissionButton 
                  screenId="users" 
                  action="create" 
                  onClick={handleAddClick}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </PermissionButton>
              </>
            ) : (
              <PermissionButton
                screenId="users"
                action="create"
                onClick={handleAddGroupClick}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Group
              </PermissionButton>
            )}
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'users'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === 'groups'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <UsersRound className="w-4 h-4 inline mr-2" />
            Groups
          </button>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="gradient-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Users</p>
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
                      <p className="text-2xl font-bold">{stats.admins}</p>
                      <p className="text-xs text-muted-foreground">Admins</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gradient-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.supervisors}</p>
                      <p className="text-xs text-muted-foreground">Supervisors</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gradient-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Headset className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.agents}</p>
                      <p className="text-xs text-muted-foreground">Agents</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="gradient-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.available}</p>
                      <p className="text-xs text-muted-foreground">Available</p>
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
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                      <SelectTrigger className="w-[160px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as AgentStatus | 'all')}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              <div className={cn('w-2 h-2 rounded-full', getStatusColor(value as AgentStatus))} />
                              {label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Users className="w-10 h-10 mb-2 opacity-50" />
                          <p className="font-medium">No users found</p>
                          <p className="text-sm">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const RoleIcon = getRoleIcon(user.role);
                      return (
                        <TableRow 
                          key={user.id} 
                          className={cn(
                            "hover:bg-muted/50",
                            canEdit ? "cursor-pointer" : "cursor-default"
                          )}
                          onClick={() => canEdit && handleEditClick(user)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="gradient-primary text-primary-foreground text-sm">
                                    {getInitials(user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
                                  getStatusColor(user.status)
                                )} />
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('gap-1', getRoleBadge(user.role))}>
                              <RoleIcon className="w-3 h-3" />
                              {ROLE_LABELS[user.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusBadge(user.status)}>
                              {STATUS_LABELS[user.status]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.skills.length > 0 ? (
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {user.skills.slice(0, 2).map(skill => (
                                  <Badge key={skill.id} variant="secondary" className="text-xs">
                                    {skill.name}
                                  </Badge>
                                ))}
                                {user.skills.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{user.skills.length - 2}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.department || '—'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.lastActive}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(user);
                                  }}
                                  disabled={!canEdit}
                                  className={!canEdit ? 'opacity-50' : ''}
                                >
                                  {!canEdit && <Lock className="w-3 h-3 mr-1" />}
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className={cn(
                                    "text-destructive focus:text-destructive",
                                    !canDelete && 'opacity-50'
                                  )}
                                  disabled={!canDelete}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(user);
                                  }}
                                >
                                  {!canDelete && <Lock className="w-3 h-3 mr-1" />}
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>

            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="gradient-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <UsersRound className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{groupStats.total}</p>
                      <p className="text-xs text-muted-foreground">Total Groups</p>
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
                      <p className="text-2xl font-bold">{groupStats.active}</p>
                      <p className="text-xs text-muted-foreground">Active Groups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="gradient-card">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Headset className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{groupStats.totalAgents}</p>
                      <p className="text-xs text-muted-foreground">Total Agents in Groups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="gradient-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Group</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Agents</TableHead>
                    <TableHead>Auto-Assignment</TableHead>
                    <TableHead>Queue Size</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <UsersRound className="w-10 h-10 mb-2 opacity-50" />
                          <p className="font-medium">No groups found</p>
                          <p className="text-sm">Create a group to organize your agents</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group) => {
                      const supervisor = getUserById(group.supervisorId);
                      return (
                        <TableRow
                          key={group.id}
                          className="hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleGroupRowClick(group)}
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{group.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{group.description}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {supervisor ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="w-7 h-7">
                                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                                    {getInitials(supervisor.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{supervisor.name}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{group.agentIds.length} agent{group.agentIds.length !== 1 ? 's' : ''}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={group.autoAssignment ? 'bg-success/10 text-success border-success/30' : 'bg-muted text-muted-foreground border-border'}>
                              {group.autoAssignment ? 'Enabled' : 'Disabled'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{group.maxQueueSize}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleGroupRowClick(group); }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => { e.stopPropagation(); handleEditGroupClick(group); }}
                                  disabled={!canEdit}
                                  className={!canEdit ? 'opacity-50' : ''}
                                >
                                  {!canEdit && <Lock className="w-3 h-3 mr-1" />}
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit Group
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className={cn("text-destructive focus:text-destructive", !canDelete && 'opacity-50')}
                                  disabled={!canDelete}
                                  onClick={(e) => { e.stopPropagation(); handleDeleteGroupClick(group); }}
                                >
                                  {!canDelete && <Lock className="w-3 h-3 mr-1" />}
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Group
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>

            <p className="text-sm text-muted-foreground">
              Showing {groups.length} group{groups.length !== 1 ? 's' : ''}
            </p>
          </>
        )}
      </div>

      <AddUserModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAddUser={handleAddUser}
      />

      <EditUserDrawer
        user={selectedUser}
        open={editDrawerOpen}
        onOpenChange={setEditDrawerOpen}
        onUpdateUser={handleUpdateUser}
      />

      <DeleteUserModal
        user={selectedUser}
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onDeleteUser={handleDeleteUser}
      />

      <ImportUsersModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        onImport={handleImportUsers}
      />

      <GroupModal
        open={groupModalOpen}
        onOpenChange={setGroupModalOpen}
        group={editingGroup}
        supervisors={supervisors}
        agents={agentUsers}
        onSave={async (data) => {
          if (editingGroup) {
            await updateGroup(editingGroup.id, data);
            notify.saved('Group');
          } else {
            const newGroup = await addGroup(data as Omit<AgentGroup, 'id' | 'createdAt'>);
            notify.created(`Group "${newGroup.name}"`);
          }
          setGroupModalOpen(false);
        }}
      />

      <GroupDetailSheet
        open={groupDetailOpen}
        onOpenChange={setGroupDetailOpen}
        group={selectedGroup}
        getUserById={getUserById}
        getInitials={getInitials}
        getStatusColor={getStatusColor}
        onEdit={(g) => { setGroupDetailOpen(false); handleEditGroupClick(g); }}
        onDelete={(g) => { setGroupDetailOpen(false); handleDeleteGroupClick(g); }}
        canEdit={canEdit}
        canDelete={canDelete}
      />

      <Dialog open={deleteGroupModalOpen} onOpenChange={setDeleteGroupModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Delete Group
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedGroup?.name}</strong>? This action cannot be undone. Agents in this group will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteGroupModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDeleteGroup}>Delete Group</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function GroupModal({
  open,
  onOpenChange,
  group,
  supervisors,
  agents,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AgentGroup | null;
  supervisors: TeamUser[];
  agents: TeamUser[];
  onSave: (data: Partial<AgentGroup>) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [maxQueueSize, setMaxQueueSize] = useState(10);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (group) {
        setName(group.name);
        setDescription(group.description);
        setSupervisorId(group.supervisorId);
        setSelectedAgentIds([...group.agentIds]);
        setEmail(group.email || '');
        setAutoAssignment(group.autoAssignment);
        setMaxQueueSize(group.maxQueueSize);
      } else {
        setName('');
        setDescription('');
        setSupervisorId('');
        setSelectedAgentIds([]);
        setEmail('');
        setAutoAssignment(true);
        setMaxQueueSize(10);
      }
    }
  }, [open, group]);

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgentIds(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !supervisorId) return;
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        supervisorId,
        agentIds: selectedAgentIds,
        email: email.trim() || undefined,
        autoAssignment,
        maxQueueSize,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <UsersRound className="w-4 h-4 text-primary-foreground" />
            </div>
            {group ? 'Edit Group' : 'Add New Group'}
          </DialogTitle>
          <DialogDescription>
            {group ? 'Update group settings and membership.' : 'Create a new agent group with supervisor and agents.'}
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="pr-2">
          <div className="space-y-4 py-2">
            <div>
              <Label>Group Name *</Label>
              <Input className="mt-1.5" placeholder="e.g. Customer Support" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea className="mt-1.5" placeholder="What does this group handle?" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>

            <div>
              <Label>Supervisor *</Label>
              <Select value={supervisorId} onValueChange={setSupervisorId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        {s.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Agents</Label>
              <div className="mt-1.5 rounded-lg border p-3 max-h-[140px] overflow-y-auto space-y-2">
                {agents.map(agent => (
                  <div key={agent.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`grp-agent-${agent.id}`}
                      checked={selectedAgentIds.includes(agent.id)}
                      onCheckedChange={() => handleAgentToggle(agent.id)}
                    />
                    <label htmlFor={`grp-agent-${agent.id}`} className="text-sm cursor-pointer flex-1">
                      {agent.name}
                    </label>
                  </div>
                ))}
              </div>
              {selectedAgentIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{selectedAgentIds.length} agent{selectedAgentIds.length !== 1 ? 's' : ''} selected</p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="group@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Assignment</Label>
                <p className="text-xs text-muted-foreground">Automatically assign conversations to agents</p>
              </div>
              <Switch checked={autoAssignment} onCheckedChange={setAutoAssignment} />
            </div>

            <div>
              <Label>Max Queue Size</Label>
              <Input className="mt-1.5" type="number" min={1} max={100} value={maxQueueSize} onChange={(e) => setMaxQueueSize(Number(e.target.value))} />
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving || !name.trim() || !supervisorId}>
            {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {group ? 'Save Changes' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GroupDetailSheet({
  open,
  onOpenChange,
  group,
  getUserById,
  getInitials,
  getStatusColor,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AgentGroup | null;
  getUserById: (id: string) => TeamUser | undefined;
  getInitials: (name: string) => string;
  getStatusColor: (status: AgentStatus) => string;
  onEdit: (group: AgentGroup) => void;
  onDelete: (group: AgentGroup) => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  if (!group) return null;
  const supervisor = getUserById(group.supervisorId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-primary" />
            {group.name}
          </SheetTitle>
          <SheetDescription>{group.description}</SheetDescription>
        </SheetHeader>

        <SheetBody className="pr-2">
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Supervisor</h4>
              {supervisor ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="gradient-primary text-primary-foreground text-sm">
                        {getInitials(supervisor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background', getStatusColor(supervisor.status))} />
                  </div>
                  <div>
                    <p className="font-medium">{supervisor.name}</p>
                    <p className="text-sm text-muted-foreground">{supervisor.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No supervisor assigned</p>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Agents ({group.agentIds.length})</h4>
              {group.agentIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">No agents in this group</p>
              ) : (
                <div className="space-y-2">
                  {group.agentIds.map(id => {
                    const agent = getUserById(id);
                    if (!agent) return null;
                    return (
                      <div key={id} className="flex items-center gap-3 p-2 rounded-lg border bg-muted/20">
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="gradient-primary text-primary-foreground text-xs">
                              {getInitials(agent.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background', getStatusColor(agent.status))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{STATUS_LABELS[agent.status]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Settings</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Auto-Assignment</p>
                  <Badge variant="outline" className={group.autoAssignment ? 'bg-success/10 text-success border-success/30' : ''}>
                    {group.autoAssignment ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Max Queue Size</p>
                  <p className="font-medium">{group.maxQueueSize}</p>
                </div>
                {group.email && (
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{group.email}</p>
                  </div>
                )}
              </div>
            </div>

            {group.workingHours && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Working Hours</h4>
                  <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{group.workingHours.start} - {group.workingHours.end} ({group.workingHours.timezone})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {group.workingHours.days.map(day => (
                        <Badge key={day} variant="secondary" className="text-xs">{day}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetBody>

        <SheetFooter className="gap-2">
          {canDelete && (
            <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => onDelete(group)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
          {canEdit && (
            <Button onClick={() => onEdit(group)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Group
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}