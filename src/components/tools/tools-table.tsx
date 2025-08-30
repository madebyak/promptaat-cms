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
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>, toolId: string) => {
    setDraggedItemId(toolId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', toolId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLTableRowElement | HTMLDivElement>, dropIndex: number) => {
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
    <div className="bg-background border border-border rounded-lg">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
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
                        <span className="text-xs text-muted-foreground">No img</span>
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

      {/* Mobile Card View */}
      <div className="md:hidden p-2 space-y-2">
        {tools.map((tool, index) => (
          <div
            key={tool.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`bg-background border border-border rounded-lg p-4 transition-all touch-manipulation ${
              draggedItemId === tool.id ? 'opacity-50' : ''
            } ${
              draggedOverIndex === index && draggedItemId !== tool.id ? 'border-t-4 border-primary' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Drag Handle */}
              <div className="w-6 h-6 flex items-center justify-center cursor-grab hover:text-foreground touch-manipulation mt-1" title="Drag to reorder">
                <GripVertical className="h-5 w-5 text-muted-foreground transition-colors" />
              </div>

              {/* Tool Image */}
              <div className="shrink-0">
                {tool.image_url ? (
                  <img 
                    src={tool.image_url} 
                    alt={tool.name}
                    className="h-12 w-12 object-contain rounded-md bg-background border border-border"
                  />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground">No img</span>
                  </div>
                )}
              </div>

              {/* Tool Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground truncate">{tool.name}</h3>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">#{tool.sort_order}</span>
                </div>
                
                {tool.website_link && (
                  <div 
                    className="flex items-center gap-2 text-xs text-primary hover:underline cursor-pointer mb-2"
                    onClick={() => handleVisitWebsite(tool.website_link)}
                  >
                    <span className="truncate">{tool.website_link}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditClick(tool)}
                    className="p-2 text-muted-foreground hover:text-blue-600 transition-colors touch-manipulation"
                    title="Edit tool"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tool)}
                    className="p-2 text-muted-foreground hover:text-red-600 transition-colors touch-manipulation"
                    title="Delete tool"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
