'use client'

import { useState, useEffect } from 'react';
import { Admin, AdminRole } from '@/types/admin';
import { Pencil, Trash2, ArrowUp, ArrowDown, Mail, ShieldCheck, Shield, ShieldAlert } from 'lucide-react';

// Define all columns based strictly on the schema
const adminColumns = [
  { id: 'name', label: 'Name', width: '250px' },
  { id: 'email', label: 'Email' },
  { id: 'role', label: 'Role', width: '150px' },
  { id: 'created_by', label: 'Created By' },
  { id: 'last_login', label: 'Last Login' },
  { id: 'created_at', label: 'Created At' },
  { id: 'actions', label: 'Actions', width: '100px' }
];

interface TableHeaderProps {
  children: React.ReactNode;
  sortKey?: string;
  currentSort?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  width?: string;
}

function TableHeader({ 
  children, 
  sortKey, 
  currentSort, 
  sortDirection, 
  onSort,
  width
}: TableHeaderProps) {
  const isSorted = sortKey && currentSort === sortKey;
  
  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider group ${sortKey ? 'cursor-pointer hover:bg-accent' : ''}`}
      style={width ? { width } : undefined}
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

function formatDate(dateString?: string) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function RoleBadge({ role }: { role: AdminRole }) {
  let Icon, bgColor, textColor;
  
  switch (role) {
    case 'super_admin':
      Icon = ShieldAlert;
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'content_admin':
      Icon = ShieldCheck;
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'moderator':
      Icon = Shield;
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    default:
      Icon = Shield;
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
  }
  
  const displayRole = role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <Icon className="w-3.5 h-3.5 mr-1.5" />
      {displayRole}
    </span>
  );
}

interface AdminRolesTableProps {
  admins: Admin[];
  onDelete: (admin: Admin) => void;
  currentUserRole?: AdminRole; // Optional: to determine edit permissions
}

export function AdminRolesTable({ 
  admins: initialAdmins, 
  onDelete,
  currentUserRole = 'super_admin' // Default to most permissive for demo
}: AdminRolesTableProps) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('last_login');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Update admins when initialAdmins change
  useEffect(() => {
    setAdmins(initialAdmins);
  }, [initialAdmins]);
  
  // Apply sorting when sortColumn or sortDirection change
  useEffect(() => {
    if (!sortColumn) {
      setAdmins([...initialAdmins]);
      return;
    }

    const sortedAdmins = [...initialAdmins].sort((a, b) => {
      let aValue, bValue;
      
      // Special handling for combined or nested fields
      if (sortColumn === 'name') {
        aValue = `${a.first_name} ${a.last_name}`;
        bValue = `${b.first_name} ${b.last_name}`;
      } else if (sortColumn === 'created_by') {
        aValue = a.created_by_name || '';
        bValue = b.created_by_name || '';
      } else {
        aValue = a[sortColumn as keyof Admin] as string;
        bValue = b[sortColumn as keyof Admin] as string;
      }
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // Fall back to string comparison
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    
    setAdmins(sortedAdmins);
  }, [initialAdmins, sortColumn, sortDirection]);

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

  const handleEdit = (admin: Admin) => {
    // In real app, check if current user has permission to edit this admin
    console.log('Edit admin:', admin);
    alert(`Edit functionality will be implemented for: ${admin.first_name} ${admin.last_name}`);
  };

  const handleDelete = (admin: Admin) => {
    // In real app, check if current user has permission to delete this admin
    // For example, only super_admin can delete another super_admin
    onDelete(admin);
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Determine if the current user can manage this admin based on roles
  const canManageAdmin = (adminRole: AdminRole): boolean => {
    if (currentUserRole === 'super_admin') return true;
    if (currentUserRole === 'content_admin' && adminRole === 'moderator') return true;
    return false;
  };

  if (admins.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No admins found.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {adminColumns.map(column => (
              <TableHeader 
                key={column.id}
                sortKey={column.id !== 'actions' ? column.id : undefined}
                currentSort={sortColumn}
                sortDirection={sortDirection}
                onSort={handleSort}
                width={column.width}
              >
                {column.label}
              </TableHeader>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {admins.map((admin) => (
            <tr key={admin.id} className="hover:bg-accent transition-colors">
              <TableCell>
                <div className="font-medium">{admin.first_name} {admin.last_name}</div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEmail(admin.email)}
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title={`Email ${admin.email}`}
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                  <div>{admin.email}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <RoleBadge role={admin.role} />
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {admin.created_by_name || 'System'}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(admin.last_login)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(admin.created_at)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  {canManageAdmin(admin.role) && (
                    <>
                      <button
                        onClick={() => handleEdit(admin)}
                        className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Edit admin"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(admin)}
                        className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete admin"
                        disabled={admin.role === 'super_admin' && admins.filter(a => a.role === 'super_admin').length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
