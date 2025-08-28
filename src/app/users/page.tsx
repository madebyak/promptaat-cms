'use client'

import { useState, useEffect } from 'react';
import { UsersTable, userTableColumns, defaultVisibleColumns } from '@/components/users/users-table';
import { SearchAndFilter } from '@/components/ui/search-and-filter';
import { FilterOption, FilterDropdown } from '@/components/ui/filter-dropdown';
import { SearchInput } from '@/components/ui/search-input';
import { ColumnVisibility } from '@/components/ui/column-visibility';
import { Button } from '@/components/ui/button';
import { useUsers, useFilteredUsers } from '@/hooks/useUsers';
import { Plus, Users as UsersIcon, UserCheck, CircleUserRound, FileText } from 'lucide-react';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  
  const { users, loading, stats } = useUsers();
  const filteredUsers = useFilteredUsers(users, searchQuery, '', statusFilter, accountTypeFilter);

  const handleAddUser = () => {
    // TODO: Implement add user functionality (open modal/form)
    console.log('Add new user');
    alert('Add user functionality will be implemented');
  };

  const statusFilterOptions: FilterOption[] = [
    { value: 'active', label: 'Active Users' },
    { value: 'inactive', label: 'Inactive Users' },
    { value: 'blocked', label: 'Blocked Users' }
  ];

  const accountTypeFilterOptions: FilterOption[] = [
    { value: 'pro', label: 'Pro Users' },
    { value: 'free', label: 'Free Users' }
  ];



  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions ({stats.totalUsers} users, {stats.activeUsers} active)
          </p>
        </div>
        <Button
          onClick={handleAddUser}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UsersIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-xl font-bold text-foreground">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xl font-bold text-foreground">{stats.activeUsers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive Users</p>
                <p className="text-xl font-bold text-foreground">{stats.totalUsers - stats.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CircleUserRound className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Pro Users</p>
                <p className="text-xl font-bold text-foreground">{stats.proUsers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Free Users</p>
                <p className="text-xl font-bold text-foreground">{stats.totalUsers - stats.proUsers}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Posts</p>
              <p className="text-xl font-bold text-foreground">{stats.totalPosts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-background border border-border rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          {/* Search Input - Larger */}
          <div className="flex-1 min-w-0">
            <SearchInput
              placeholder="Search users by name or email..."
              value={searchQuery}
              onSearch={setSearchQuery}
              className="w-full"
            />
          </div>
          
          {/* Status Filter */}
          <div className="w-full lg:w-auto">
            <FilterDropdown
              options={statusFilterOptions}
              value={statusFilter}
              onSelect={setStatusFilter}
              placeholder="Filter by status"
            />
          </div>
          
          {/* Account Type Filter */}
          <div className="w-full lg:w-auto">
            <FilterDropdown
              options={accountTypeFilterOptions}
              value={accountTypeFilter}
              onSelect={setAccountTypeFilter}
              placeholder="Filter by account type"
            />
          </div>
          
          {/* Column Visibility */}
          <div className="w-full lg:w-auto">
            <ColumnVisibility
              columns={userTableColumns}
              visibleColumns={visibleColumns}
              onVisibilityChange={setVisibleColumns}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading users...
        </div>
      ) : (
        <UsersTable 
          users={filteredUsers} 
          visibleColumns={visibleColumns}
          onVisibilityChange={setVisibleColumns}
        />
      )}
    </div>
  );
}