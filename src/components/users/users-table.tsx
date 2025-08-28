'use client'

import { useState, useEffect } from 'react';
import { User } from '@/types/user';
import { RoleBadge } from '@/components/ui/role-badge';
import { Pencil, Trash2, Mail, ArrowUp, ArrowDown } from 'lucide-react';
import { deleteUser } from '@/lib/data/users';

interface UsersTableProps {
  users: User[];
}

interface TableHeaderProps {
  children: React.ReactNode;
  sortKey?: string;
  currentSort?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

function TableHeader({ 
  children, 
  sortKey, 
  currentSort, 
  sortDirection, 
  onSort 
}: TableHeaderProps) {
  const isSorted = sortKey && currentSort === sortKey;
  
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group ${sortKey ? 'cursor-pointer hover:bg-accent' : ''}`}
      onClick={() => sortKey && onSort && onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {children}
        {isSorted && (
          <span className="inline-block ml-1">
            {sortDirection === 'asc' 
              ? <ArrowUp className="h-3 w-3 text-primary" /> 
              : <ArrowDown className="h-3 w-3 text-primary" />}
          </span>
        )}
        {sortKey && !isSorted && (
          <span className="inline-block ml-1 opacity-0 group-hover:opacity-30">
            <ArrowUp className="h-3 w-3" />
          </span>
        )}
      </div>
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

function UserAvatar({ user }: { user: User }) {
  if (user.avatar) {
    return (
      <img 
        src={user.avatar} 
        alt={user.name}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  
  return (
    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">
        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
      </span>
    </div>
  );
}

function formatLastLogin(lastLogin?: string) {
  if (!lastLogin) return 'Never';
  
  const date = new Date(lastLogin);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
  
  return date.toLocaleDateString();
}

// Define all possible columns
export const userTableColumns = [
  { id: 'user', label: 'User', canHide: false },
  { id: 'email', label: 'Email', canHide: true },
  { id: 'company', label: 'Company', canHide: true },
  { id: 'professionalRole', label: 'Professional Role', canHide: true },
  { id: 'usagePurpose', label: 'Usage Purpose', canHide: true },
  { id: 'status', label: 'Status', canHide: true },
  { id: 'lastLogin', label: 'Last Login', canHide: true },
  { id: 'lastActivity', label: 'Last Activity', canHide: true },
  { id: 'createdAt', label: 'Created At', canHide: true },
  { id: 'accountAge', label: 'Account Age', canHide: true },
  { id: 'likedPrompts', label: 'Liked Prompts', canHide: true },
  { id: 'likedKits', label: 'Liked Kits', canHide: true },
  { id: 'promptReviews', label: 'Prompt Reviews', canHide: true },
  { id: 'kitReviews', label: 'Kit Reviews', canHide: true },
  { id: 'collections', label: 'Collections', canHide: true },
  { id: 'averageRating', label: 'Avg. Rating', canHide: true },
  { id: 'actions', label: 'Actions', canHide: false },
];

// Default visible columns (max 5 hideable columns)
// Note: 'user' and 'actions' are always visible and don't count towards the limit
export const defaultVisibleColumns = [
  'user',    // Required
  'email',   // 1
  'status',  // 2
  'lastLogin', // 3
  'likedPrompts', // 4
  'accountAge', // 5
  'actions'  // Required
];

interface UsersTableProps {
  users: User[];
  visibleColumns?: string[];
  onVisibilityChange?: (columns: string[]) => void;
}

export function UsersTable({ 
  users: initialUsers, 
  visibleColumns = defaultVisibleColumns,
  onVisibilityChange
}: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [sortColumn, setSortColumn] = useState<string>('status');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Apply sorting when sortColumn or sortDirection change
  useEffect(() => {
    if (!sortColumn) {
      // If no sort column, use the original data
      setUsers([...initialUsers]);
      return;
    }

    const sortedUsers = [...initialUsers].sort((a, b) => {
      // Handle nested properties like "user.name"
      const aValue = getNestedValue(a, sortColumn);
      const bValue = getNestedValue(b, sortColumn);
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      // Fall back to string comparison
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    
    setUsers(sortedUsers);
  }, [initialUsers, sortColumn, sortDirection]);

  // Helper to get nested object values by key path (e.g., "user.name")
  const getNestedValue = (obj: User, path: string): unknown => {
    if (!path) return null;
    
    // For direct properties
    if (path in obj) {
      // Use indexed access with string key
      return obj[path as keyof User];
    }
    
    // For nested properties
    const parts = path.split('.');
    let result: unknown = obj;
    
    for (const key of parts) {
      if (result && typeof result === 'object' && key in (result as Record<string, unknown>)) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return null;
      }
    }
    
    return result;
  };

  // Handle sorting when a column header is clicked
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column with asc direction
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleEdit = (user: User) => {
    // TODO: Implement edit functionality (open modal/form)
    console.log('Edit user:', user);
    alert(`Edit functionality will be implemented for: ${user.name}`);
  };

  const handleDelete = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!window.confirm(`Are you sure you want to delete "${user?.name}"?`)) {
      return;
    }

    try {
      const success = await deleteUser(userId);
      if (success) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  const handleEmail = (user: User) => {
    window.open(`mailto:${user.email}`, '_blank');
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No users found. Create your first user to get started.
      </div>
    );
  }

  const formatUsagePurpose = (purpose?: string) => {
    if (!purpose) return '—';
    return purpose.charAt(0).toUpperCase() + purpose.slice(1);
  };

  const formatValue = (value: unknown): string => {
    if (value === undefined || value === null) return '—';
    return String(value);
  };

  return (
    <div className="bg-background border border-border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {userTableColumns
              .filter(col => visibleColumns.includes(col.id))
              .map(column => (
                <TableHeader 
                  key={column.id}
                  sortKey={column.id !== 'actions' ? column.id : undefined} // Actions column is not sortable
                  currentSort={sortColumn}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                >
                  {column.label}
                </TableHeader>
              ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-accent transition-colors">
              {visibleColumns.includes('user') && (
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div>
                      <div className="text-sm font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {user.id}</div>
                    </div>
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('email') && (
                <TableCell>
                  <div className="text-sm text-foreground">{user.email}</div>
                </TableCell>
              )}

              {visibleColumns.includes('company') && (
                <TableCell>
                  <div className="text-sm text-foreground">{formatValue(user.company)}</div>
                </TableCell>
              )}
              


              {visibleColumns.includes('professionalRole') && (
                <TableCell>
                  <div className="text-sm text-foreground">{formatValue(user.professionalRole)}</div>
                </TableCell>
              )}

              {visibleColumns.includes('usagePurpose') && (
                <TableCell>
                  <div className="text-sm text-foreground">{formatUsagePurpose(user.usagePurpose)}</div>
                </TableCell>
              )}
              
              {visibleColumns.includes('status') && (
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : user.status === 'blocked'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.status === 'active' 
                      ? 'Active' 
                      : user.status === 'blocked' 
                      ? 'Blocked' 
                      : 'Inactive'}
                  </span>
                </TableCell>
              )}
              
              {visibleColumns.includes('lastLogin') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatLastLogin(user.lastLogin)}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('lastActivity') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatLastLogin(user.lastActivity)}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('createdAt') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('accountAge') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.accountAge || '—'}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('likedPrompts') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.likedPrompts || 0}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('likedKits') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.likedKits || 0}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('promptReviews') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.promptReviews || 0}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('kitReviews') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.kitReviews || 0}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('collections') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.collections || 0}
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('averageRating') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {user.averageRating ? user.averageRating.toFixed(1) : '—'}
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('actions') && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEmail(user)}
                      className="p-1 text-muted-foreground hover:text-green-600 transition-colors"
                      title="Send email"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                      title="Edit user"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}