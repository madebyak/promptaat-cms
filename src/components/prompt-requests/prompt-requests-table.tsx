'use client'

import { useState, useEffect } from 'react';
import { PromptRequest } from '@/types/promptRequest';
import { Pencil, Trash2, ArrowUp, ArrowDown, CheckCircle, XCircle, Clock, FileCheck, Eye } from 'lucide-react';
import Image from 'next/image';

// Define all columns
const promptRequestColumns = [
  { id: 'user', label: 'User' },
  { id: 'title', label: 'Title' },
  { id: 'description', label: 'Description' },
  { id: 'status', label: 'Status' },
  { id: 'createdAt', label: 'Submitted' },
  { id: 'updatedAt', label: 'Last Updated' },
  { id: 'actions', label: 'Actions' },
];

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

function TruncateText({ text, maxLength = 50 }: { text: string; maxLength?: number }) {
  if (!text) return null;
  if (text.length <= maxLength) return <>{text}</>;
  return <>{text.slice(0, maxLength)}...</>;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) {
    // Less than a day, show time
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    // Less than a week, show day of week
    return date.toLocaleDateString([], { weekday: 'short' }) + 
           ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    // More than a week, show date
    return date.toLocaleDateString();
  }
}

function UserAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  const fallbackColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-red-500'
  ];
  
  // Use name to deterministically select a color
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % fallbackColors.length;
  const fallbackColor = fallbackColors[colorIndex];
  
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
      {avatar ? (
        <div className="relative w-full h-full">
          <Image
            src={avatar}
            alt={name}
            className="object-cover"
            width={32}
            height={32}
            onError={(e) => {
              // If image fails to load, set src to empty string and fallback to initials
              e.currentTarget.src = '';
            }}
          />
        </div>
      ) : (
        <div className={`w-full h-full flex items-center justify-center text-white ${fallbackColor}`}>
          <span className="text-xs font-medium">{initials}</span>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PromptRequest['status'] }) {
  let bgColor, textColor, icon;
  
  switch (status) {
    case 'in_review':
      bgColor = 'bg-purple-100';
      textColor = 'text-purple-800';
      icon = <Clock className="h-3 w-3 mr-1" />;
      break;
    case 'approved':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <CheckCircle className="h-3 w-3 mr-1" />;
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <XCircle className="h-3 w-3 mr-1" />;
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <FileCheck className="h-3 w-3 mr-1" />;
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-800';
      icon = <Clock className="h-3 w-3 mr-1" />;
  }
  
  const displayText = status === 'in_review' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {icon}
      {displayText}
    </span>
  );
}

interface StatusDropdownProps {
  currentStatus: PromptRequest['status'];
  onChange: (status: PromptRequest['status']) => void;
}

function StatusDropdown({ currentStatus, onChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const statuses: PromptRequest['status'][] = ['in_review', 'approved', 'rejected', 'completed'];
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 p-1 text-muted-foreground hover:text-blue-600 transition-colors"
        title="Change status"
      >
        <Pencil className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-40 bg-background border border-border rounded-md shadow-lg overflow-hidden">
          <div className="py-1">
            {statuses.map(status => (
              <button
                key={status}
                className={`block w-full text-left px-4 py-2 text-sm ${currentStatus === status ? 'bg-accent' : 'hover:bg-accent'}`}
                onClick={() => {
                  onChange(status);
                  setIsOpen(false);
                }}
              >
                <StatusBadge status={status} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface PromptRequestsTableProps {
  promptRequests: PromptRequest[];
  onUpdateStatus: (requestId: string, status: PromptRequest['status']) => Promise<boolean>;
  onDelete: (requestId: string) => void;
  onViewRequest: (request: PromptRequest) => void;
}

export function PromptRequestsTable({ 
  promptRequests: initialRequests, 
  onUpdateStatus,
  onDelete,
  onViewRequest
}: PromptRequestsTableProps) {
  const [requests, setRequests] = useState<PromptRequest[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Update requests when initialRequests change
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);
  
  // Apply sorting when sortColumn or sortDirection change
  useEffect(() => {
    if (!sortColumn) {
      setRequests([...initialRequests]);
      return;
    }

    const sortedRequests = [...initialRequests].sort((a, b) => {
      let aValue, bValue;
      
      // Special handling for nested values and custom sort fields
      if (sortColumn === 'user') {
        aValue = a.userName;
        bValue = b.userName;
      } else {
        aValue = a[sortColumn as keyof PromptRequest];
        bValue = b[sortColumn as keyof PromptRequest];
      }
      
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
    
    setRequests(sortedRequests);
  }, [initialRequests, sortColumn, sortDirection]);

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

  const handleStatusChange = async (requestId: string, newStatus: PromptRequest['status']) => {
    const success = await onUpdateStatus(requestId, newStatus);
    if (!success) {
      // If update fails, revert to original requests
      setRequests(initialRequests);
    }
  };

  const handleViewRequest = (request: PromptRequest) => {
    onViewRequest(request);
  };

  const handleDelete = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!window.confirm(`Are you sure you want to delete the request "${request?.title}"?`)) {
      return;
    }
    onDelete(requestId);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No prompt requests found.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {promptRequestColumns.map(column => (
              <TableHeader 
                key={column.id}
                sortKey={column.id !== 'actions' ? column.id : undefined}
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
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-accent transition-colors">
              <TableCell>
                <div className="flex items-center gap-3">
                  <UserAvatar name={request.userName} avatar={request.userAvatar} />
                  <div className="font-medium text-sm">{request.userName}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="font-medium text-sm">{request.title}</div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  <TruncateText text={request.description} maxLength={60} />
                </div>
              </TableCell>
              
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(request.createdAt)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  {formatDate(request.updatedAt)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewRequest(request)}
                    className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                    title="View request details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  
                  <StatusDropdown 
                    currentStatus={request.status}
                    onChange={(status) => handleStatusChange(request.id, status)}
                  />
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Delete request"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
