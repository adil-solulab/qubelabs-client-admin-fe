import { useState } from 'react';
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
import { useUsersData } from '@/hooks/useUsersData';
import { usePermission } from '@/hooks/usePermission';
import { useAuth } from '@/hooks/useAuth';
import { notify } from '@/hooks/useNotification';
import { PermissionButton } from '@/components/auth/PermissionButton';
import { AddUserModal } from '@/components/users/AddUserModal';
import { EditUserDrawer } from '@/components/users/EditUserDrawer';
import { DeleteUserModal } from '@/components/users/DeleteUserModal';
import { ImportUsersModal } from '@/components/users/ImportUsersModal';
import type { TeamUser, UserRole, AgentStatus } from '@/types/users';
import { ROLE_LABELS, STATUS_LABELS } from '@/types/users';
import { cn } from '@/lib/utils';

export default function UsersPage() {
  const { 
    users, 
    isLoading, 
    addUser, 
    updateUser, 
    deleteUser, 
    importUsers 
  } = useUsersData();

  const { canCreate, canEdit, canDelete, withPermission } = usePermission('users');
  const { notifyRoleChange, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TeamUser | null>(null);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'client_admin').length,
    supervisors: users.filter(u => u.role === 'supervisor').length,
    agents: users.filter(u => u.role === 'agent').length,
    available: users.filter(u => u.status === 'available').length,
  };

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
      
      // If role was changed, notify the session system
      if (userData.role && existingUser?.role !== userData.role) {
        // Trigger session refresh for affected user
        notifyRoleChange(userId, userData.role);
        
        // If changing another user's role (not current user), show admin notification
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

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case 'available': return 'bg-success';
      case 'busy': return 'bg-warning';
      case 'offline': return 'bg-muted-foreground';
    }
  };

  const getStatusBadge = (status: AgentStatus) => {
    switch (status) {
      case 'available': return 'bg-success/10 text-success border-success/30';
      case 'busy': return 'bg-warning/10 text-warning border-warning/30';
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Users & Team Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage team members, roles, and skill assignments
            </p>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Stats Cards */}
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

        {/* Filters & Search */}
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

        {/* Users Table */}
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Modals */}
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
    </AppLayout>
  );
}