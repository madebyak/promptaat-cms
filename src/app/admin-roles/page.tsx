'use client'

import { useState } from 'react';
import { AdminRolesTable } from '@/components/admin-roles/admin-roles-table';
import { AdminForm } from '@/components/admin-roles/admin-form';
import { AdminSetup } from '@/components/admin-roles/admin-setup';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchInput } from '@/components/ui/search-input';
import { FilterOption } from '@/components/ui/filter-dropdown';
import { Button } from '@/components/ui/button';
import { useAdmins, useFilteredAdmins } from '@/hooks/useAdmins';
import { Admin, AdminRole } from '@/types/admin';
import { createAdmin, updateAdmin } from '@/lib/data/admins';
import { Plus, Users, UserCheck, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function AdminRolesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Partial<Admin> | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<Admin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // In a real app, this would come from an authentication context
  const currentUserRole: AdminRole = 'super_admin';
  const currentUserId = null; // Let Supabase handle this - will be null for initial setup
  const currentUserName = 'System';
  
  const { admins, loading, handleDelete, refreshAdmins, stats } = useAdmins();
  const filteredAdmins = useFilteredAdmins(admins, searchQuery, roleFilter);

  const handleAddAdmin = () => {
    setEditingAdmin(null);
    setShowForm(true);
  };

  const handleFormSubmit = async (adminData: Partial<Admin>) => {
    try {
      if (editingAdmin?.id) {
        // Update existing admin
        await updateAdmin(editingAdmin.id, adminData);
      } else {
        // Create new admin
        await createAdmin(adminData as Omit<Admin, 'id' | 'created_at' | 'updated_at'>);
      }
      
      // Close form and refresh data
      setShowForm(false);
      refreshAdmins();
      
    } catch (error) {
      console.error('Error saving admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save admin. Please try again.';
      alert(errorMessage);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const handleDeleteClick = (admin: Admin) => {
    setAdminToDelete(admin);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;
    
    setIsDeleting(true);
    try {
      await handleDelete(adminToDelete.id);
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error('Failed to delete admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete admin. Please try again.';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const roleFilterOptions: FilterOption[] = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'content_admin', label: 'Content Admin' },
    { value: 'moderator', label: 'Moderator' }
  ];

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Roles</h1>
          <p className="text-muted-foreground">
            Manage admin accounts and permissions ({stats.totalAdmins} admins)
          </p>
        </div>
        <Button
          onClick={handleAddAdmin}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {/* Admin Setup Tools */}
      <AdminSetup onDataChanged={refreshAdmins} />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Super Admins</p>
              <p className="text-xl font-bold text-foreground">{stats.superAdminCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Content Admins</p>
              <p className="text-xl font-bold text-foreground">{stats.contentAdminCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moderators</p>
              <p className="text-xl font-bold text-foreground">{stats.moderatorCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form (shown when adding/editing) */}
      {showForm && (
        <div className="mb-6">
          <AdminForm
            initialAdmin={editingAdmin || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            currentUserRole={currentUserRole}
            createdById={currentUserId}
            createdByName={currentUserName}
          />
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onSearch={setSearchQuery}
                  placeholder="Search admins by name or email..."
                />
              </div>
              <div className="w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Roles</option>
                  {roleFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Roles Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading admins...
        </div>
      ) : (
        <AdminRolesTable 
          admins={filteredAdmins}
          onDelete={handleDeleteClick}
          currentUserRole={currentUserRole}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setAdminToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={adminToDelete ? `${adminToDelete.first_name} ${adminToDelete.last_name}` : ''}
        itemType="Admin"
        isLoading={isDeleting}
        warningMessage={
          adminToDelete?.role === 'super_admin' 
            ? `This will delete the Super Admin "${adminToDelete.first_name} ${adminToDelete.last_name}". Make sure there are other super admins before proceeding.`
            : undefined
        }
      />
    </div>
  );
}


