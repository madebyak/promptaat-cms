'use client'

import { useState, useEffect } from 'react';
import { Tool } from '@/types/tool';
import { Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, GripVertical } from 'lucide-react';
import { updateTool } from '@/lib/data/tools';

interface ToolsTableProps {
  tools: Tool[];
  onReorder?: (tools: Tool[]) => void;
  onEdit?: (tool: Tool) => void;
  onDelete?: (tool: Tool) => void;
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

export function ToolsTable({ tools: initialTools, onReorder, onEdit, onDelete }: ToolsTableProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  
  // Update tools when initialTools change
  useEffect(() => {
    setTools(initialTools);
  }, [initialTools]);
  
  const [sortColumn, setSortColumn] = useState<string>('sort_order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  // Apply sorting when sortColumn or sortDirection change
  useEffect(() => {
    if (!sortColumn) {
      setTools([...initialTools]);
      return;
    }

    const sortedTools = [...initialTools].sort((a, b) => {
      const aValue = a[sortColumn as keyof Tool];
      const bValue = b[sortColumn as keyof Tool];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Fall back to string comparison
      const aStr = String(aValue || '');
      const bStr = String(bValue || '');
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
    
    setTools(sortedTools);
  }, [initialTools, sortColumn, sortDirection]);

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

  const handleEditClick = (tool: Tool) => {
    if (onEdit) {
      onEdit(tool);
    }
  };

  const handleDeleteClick = (tool: Tool) => {
    if (onDelete) {
      onDelete(tool);
    }
  };

  const handleVisitWebsite = (url?: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, toolId: string) => {
    setDraggedItemId(toolId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', toolId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItemId) return;
    
    const draggedIndex = tools.findIndex(tool => tool.id === draggedItemId);
    
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedItemId(null);
      setDraggedOverIndex(null);
      return;
    }

    // Create a copy of the tools array
    const newTools = [...tools];
    const [draggedTool] = newTools.splice(draggedIndex, 1);
    newTools.splice(dropIndex, 0, draggedTool);

    // Update sort_order for each tool
    const updatedTools = newTools.map((tool, index) => ({
      ...tool,
      sort_order: index + 1
    }));

    // Update local state
    setTools(updatedTools);
    
    // Reset sort state since we're manually ordering now
    setSortColumn('');
    
    // Call the parent's onReorder callback if provided
    if (onReorder) {
      onReorder(updatedTools);
    }

    // Clean up drag state
    setDraggedItemId(null);
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDraggedOverIndex(null);
  };

  if (tools.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No tools found. Create your first tool to get started.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {/* Drag handle column */}
            <th className="w-10 px-3"></th>
            <TableHeader 
              sortKey={!draggedItemId ? "name" : undefined}
              currentSort={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Tool
            </TableHeader>
            <TableHeader 
              sortKey={!draggedItemId ? "website_link" : undefined}
              currentSort={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Website Link
            </TableHeader>
            <TableHeader 
              sortKey={!draggedItemId ? "sort_order" : undefined}
              currentSort={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            >
              Sort Order
            </TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tools.map((tool, index) => (
            <tr
              key={tool.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tool.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`hover:bg-accent transition-colors cursor-move ${
                draggedItemId === tool.id ? 'opacity-50' : ''
              } ${
                draggedOverIndex === index && draggedItemId !== tool.id ? 'bg-accent border-t-2 border-primary' : ''
              }`}
            >
              {/* Drag handle */}
              <td className="w-10 px-3">
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              </td>
              <TableCell>
                <div className="flex items-center gap-3">
                  {tool.image_url ? (
                    <img 
                      src={tool.image_url} 
                      alt={tool.name}
                      className="h-10 w-10 object-contain rounded-md bg-background border border-border"
                    />
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center bg-muted rounded-md">
                      <span className="text-muted-foreground">No img</span>
                    </div>
                  )}
                  <div className="text-sm font-medium">{tool.name}</div>
                </div>
              </TableCell>
              <TableCell>
                {tool.website_link ? (
                  <div 
                    className="flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer"
                    onClick={() => handleVisitWebsite(tool.website_link)}
                  >
                    <span className="truncate max-w-[250px]">{tool.website_link}</span>
                    <ExternalLink className="h-4 w-4" />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm">{tool.sort_order}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(tool)}
                    className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                    title="Edit tool"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tool)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Delete tool"
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
