import { useState } from 'react';
import { Plus, Search, Shield, ShieldCheck, Filter } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleCard } from '@/components/roles/RoleCard';
import { RoleModal } from '@/components/roles/RoleModal';
import { DeleteRoleModal } from '@/components/roles/DeleteRoleModal';
import { useRolesData } from '@/hooks/useRolesData';
import { notify } from '@/hooks/useNotification';
import type { Role, ScreenPermission } from '@/types/roles';

export default function RolesPage() {
  const { roles, isLoading, createRole, updateRole, deleteRole } = useRolesData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'system' | 'custom'>('all');
  
  // Modal states
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Filter roles
  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          role.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'system') return matchesSearch && role.isSystem;
    if (activeTab === 'custom') return matchesSearch && !role.isSystem;
    return matchesSearch;
  });

  const systemRolesCount = roles.filter(r => r.isSystem).length;
  const customRolesCount = roles.filter(r => !r.isSystem).length;

  // Handlers
  const handleCreateRole = () => {
    setSelectedRole(null);
    setRoleModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setRoleModalOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setDeleteModalOpen(true);
  };

  const handleSaveRole = async (data: { 
    name: string; 
    description: string; 
    permissions: ScreenPermission[] 
  }) => {
    try {
      if (selectedRole) {
        await updateRole(selectedRole.id, data);
        notify.success('Role updated', `"${data.name}" has been updated successfully.`);
      } else {
        await createRole(data);
        notify.success('Role created', `"${data.name}" has been created successfully.`);
      }
      setRoleModalOpen(false);
      setSelectedRole(null);
    } catch (error) {
      notify.error('Failed to save role', 'An error occurred while saving the role.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!roleToDelete) return;
    
    try {
      const result = await deleteRole(roleToDelete.id);
      if (result.success) {
        notify.success('Role deleted', `"${roleToDelete.name}" has been removed.`);
        setDeleteModalOpen(false);
        setRoleToDelete(null);
      } else {
        notify.error('Cannot delete role', result.error || 'An error occurred.');
      }
    } catch (error) {
      notify.error('Failed to delete role', 'An unexpected error occurred.');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Roles & Permissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage access control with system and custom roles
            </p>
          </div>
          <Button onClick={handleCreateRole} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Role
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Filter className="w-4 h-4" />
                All ({roles.length})
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <ShieldCheck className="w-4 h-4" />
                System ({systemRolesCount})
              </TabsTrigger>
              <TabsTrigger value="custom" className="gap-2">
                <Shield className="w-4 h-4" />
                Custom ({customRolesCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Roles Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoles.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={handleEditRole}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No roles found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Try adjusting your search query' 
                : 'Create a custom role to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <RoleModal
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
        role={selectedRole}
        onSave={handleSaveRole}
        isLoading={isLoading}
      />

      <DeleteRoleModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        role={roleToDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />
    </AppLayout>
  );
}
