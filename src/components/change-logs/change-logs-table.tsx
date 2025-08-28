'use client'

import { useState, useEffect } from 'react';
import { ChangeLog } from '@/types/changeLog';
import { Pencil, Trash2, ArrowUp, ArrowDown, CalendarIcon } from 'lucide-react';
import Image from 'next/image';

// Define all columns
const changeLogColumns = [
  { id: 'image_name', label: 'Change', width: '350px' },  // Combined image and name
  { id: 'description', label: 'Description' },
  { id: 'createdAt', label: 'Date' },
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
    <td className={`px-6 py-4 ${className}`}>
      {children}
    </td>
  );
}

function TruncateText({ text, maxLength = 150 }: { text: string; maxLength?: number }) {
  if (!text) return null;
  if (text.length <= maxLength) return <>{text}</>;
  return <>{text.slice(0, maxLength)}...</>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function ChangeLogImage({ imageUrl, name }: { imageUrl: string; name: string }) {
  // Fallback image if the provided URL is missing or invalid
  const imageSrc = imageUrl || '/images/placeholder-changelog.png';
  
  return (
    <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
      <div className="relative w-full h-full">
        <Image 
          src={imageSrc}
          alt={`${name} thumbnail`}
          className="object-cover"
          width={64}
          height={64}
          onError={(e) => {
            // Fallback to placeholder on error
            e.currentTarget.src = '/images/placeholder-changelog.png';
          }}
        />
      </div>
    </div>
  );
}

interface ChangeLogsTableProps {
  changeLogs: ChangeLog[];
  onEdit: (log: ChangeLog) => void;
  onDelete: (log: ChangeLog) => void;
}

export function ChangeLogsTable({ 
  changeLogs: initialLogs, 
  onEdit,
  onDelete
}: ChangeLogsTableProps) {
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Update logs when initialLogs change
  useEffect(() => {
    setLogs(initialLogs);
  }, [initialLogs]);
  
  // Apply sorting when sortColumn or sortDirection change
  useEffect(() => {
    if (!sortColumn) {
      setLogs([...initialLogs]);
      return;
    }

    const sortedLogs = [...initialLogs].sort((a, b) => {
      let aValue, bValue;
      
      // Special handling for combined columns
      if (sortColumn === 'image_name') {
        aValue = a.name;
        bValue = b.name;
      } else {
        aValue = a[sortColumn as keyof ChangeLog];
        bValue = b[sortColumn as keyof ChangeLog];
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
    
    setLogs(sortedLogs);
  }, [initialLogs, sortColumn, sortDirection]);

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

  const handleEdit = (log: ChangeLog) => {
    onEdit(log);
  };

  const handleDelete = (log: ChangeLog) => {
    onDelete(log);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No change logs found.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {changeLogColumns.map(column => (
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
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-accent transition-colors">
              <TableCell>
                <div className="flex items-center gap-4">
                  <ChangeLogImage imageUrl={log.image_url} name={log.name} />
                  <div className="font-medium">{log.name}</div>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground">
                  <TruncateText text={log.description} maxLength={150} />
                </div>
              </TableCell>
              
              <TableCell>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {formatDate(log.createdAt)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(log)}
                    className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                    title="Edit change log"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(log)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Delete change log"
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
