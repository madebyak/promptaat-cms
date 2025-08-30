'use client'

import { useState, useEffect } from 'react';
import { Prompt } from '@/types/prompt';
import { Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Star } from 'lucide-react';
import { deletePrompt } from '@/lib/data/prompts';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';

// Define all possible columns
export const promptTableColumns = [
  { id: 'name', label: 'Name', canHide: false },
  { id: 'description', label: 'Description', canHide: true },
  { id: 'prompt_content', label: 'Prompt Content', canHide: true },
  { id: 'tier', label: 'Tier', canHide: true },
  { id: 'visibility', label: 'Visibility', canHide: true },
  { id: 'created_at', label: 'Created At', canHide: true },
  { id: 'updated_at', label: 'Updated At', canHide: true },
  { id: 'rating', label: 'Rating', canHide: true },
  { id: 'likes_count', label: 'Likes', canHide: true },
  { id: 'copies_count', label: 'Copies', canHide: true },
  { id: 'categories', label: 'Categories', canHide: true },
  { id: 'tools', label: 'Tools', canHide: true },
  { id: 'actions', label: 'Actions', canHide: false },
];

// Default visible columns
export const defaultVisibleColumns = [
  'name',
  'description',
  'tier',
  'visibility',
  'rating',
  'likes_count',
  'copies_count',
  'actions'
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
  if (text.length <= maxLength) return <>{text}</>;
  return <>{text.slice(0, maxLength)}...</>;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

function RatingStars({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      <div className="flex">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <Star className="w-4 h-4 text-yellow-400" />
        )}
      </div>
      <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
    </div>
  );
}

interface PromptsTableProps {
  prompts: Prompt[];
  visibleColumns?: string[];
  onVisibilityChange?: (columns: string[]) => void;
  onEdit?: (prompt: Prompt) => void;
}

export function PromptsTable({ 
  prompts: initialPrompts, 
  visibleColumns = defaultVisibleColumns,
  onVisibilityChange,
  onEdit
}: PromptsTableProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Update prompts when initialPrompts change
  useEffect(() => {
    setPrompts(initialPrompts);
  }, [initialPrompts]);
  
  // Apply sorting when sortColumn or sortDirection change
  useEffect(() => {
    if (!sortColumn) {
      setPrompts([...initialPrompts]);
      return;
    }

    const sortedPrompts = [...initialPrompts].sort((a, b) => {
      const aValue = a[sortColumn as keyof Prompt];
      const bValue = b[sortColumn as keyof Prompt];
      
      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        // Handle array comparison (like categories, subcategories)
        const aString = aValue.join(', ');
        const bString = bValue.join(', ');
        return sortDirection === 'asc' 
          ? aString.localeCompare(bString) 
          : bString.localeCompare(aString);
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
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
    
    setPrompts(sortedPrompts);
  }, [initialPrompts, sortColumn, sortDirection]);

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

  const handleEdit = (prompt: Prompt) => {
    if (onEdit) {
      onEdit(prompt);
    } else {
      console.log('Edit prompt:', prompt);
      alert(`No edit handler provided for: ${prompt.name}`);
    }
  };

  const handleDeleteClick = (prompt: Prompt) => {
    setPromptToDelete(prompt);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!promptToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deletePrompt(promptToDelete.id);
      if (success) {
        setPrompts(prompts.filter(prompt => prompt.id !== promptToDelete.id));
        setDeleteDialogOpen(false);
        setPromptToDelete(null);
      } else {
        throw new Error('Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (prompts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No prompts found. Create your first prompt to get started.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              {promptTableColumns
                .filter(col => visibleColumns.includes(col.id))
                .map(column => (
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
            {prompts.map((prompt) => (
              <tr key={prompt.id} className="hover:bg-accent transition-colors">
                {visibleColumns.includes('name') && (
                  <TableCell>
                    <div className="font-medium text-sm">{prompt.name}</div>
                  </TableCell>
                )}
                
                {visibleColumns.includes('description') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <TruncateText text={prompt.description} maxLength={60} />
                    </div>
                  </TableCell>
                )}

                {visibleColumns.includes('prompt_content') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <TruncateText text={prompt.prompt_content || prompt.promptContent || ''} maxLength={60} />
                    </div>
                  </TableCell>
                )}
                
                {visibleColumns.includes('tier') && (
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      prompt.tier === 'pro' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {prompt.tier === 'pro' ? 'Pro' : 'Free'}
                    </span>
                  </TableCell>
                )}
                
                {visibleColumns.includes('visibility') && (
                  <TableCell>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      prompt.visibility === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {prompt.visibility.charAt(0).toUpperCase() + prompt.visibility.slice(1)}
                    </span>
                  </TableCell>
                )}
                
                {visibleColumns.includes('created_at') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(prompt.createdAt)}
                    </div>
                  </TableCell>
                )}

                {visibleColumns.includes('updated_at') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(prompt.updatedAt)}
                    </div>
                  </TableCell>
                )}
                
                {visibleColumns.includes('rating') && (
                  <TableCell>
                    <RatingStars rating={prompt.rating} />
                  </TableCell>
                )}
                
                {visibleColumns.includes('likes_count') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {prompt.likesCount.toLocaleString()}
                    </div>
                  </TableCell>
                )}
                
                {visibleColumns.includes('copies_count') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {prompt.copiesCount.toLocaleString()}
                    </div>
                  </TableCell>
                )}
                
                {visibleColumns.includes('categories') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {prompt.categories?.map((cat, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {cat.category_id}
                            {cat.subcategory_id && (
                              <span className="ml-1 text-blue-600">→ {cat.subcategory_id}</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                )}
                
                {visibleColumns.includes('tools') && (
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex flex-wrap gap-1">
                        {prompt.tools?.map((tool, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                            {tool.tool_id}
                          </span>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                )}
                
                {visibleColumns.includes('actions') && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(prompt)}
                        className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Edit prompt"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(prompt)}
                        className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete prompt"
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

      {/* Mobile Card View */}
      <div className="lg:hidden p-2 space-y-3">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-background border border-border rounded-lg p-4 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground truncate mb-1">{prompt.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    prompt.tier === 'pro' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {prompt.tier === 'pro' ? 'Pro' : 'Free'}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    prompt.visibility === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {prompt.visibility.charAt(0).toUpperCase() + prompt.visibility.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => handleEdit(prompt)}
                  className="p-2 text-muted-foreground hover:text-blue-600 transition-colors touch-manipulation"
                  title="Edit prompt"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(prompt)}
                  className="p-2 text-muted-foreground hover:text-red-600 transition-colors touch-manipulation"
                  title="Delete prompt"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            {prompt.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {prompt.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <RatingStars rating={prompt.rating} />
                </div>
                <span>❤️ {prompt.likesCount.toLocaleString()}</span>
                <span>📋 {prompt.copiesCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Categories and Tools */}
            {((prompt.categories?.length ?? 0) > 0 || (prompt.tools?.length ?? 0) > 0) && (
              <div className="mt-3 pt-3 border-t border-border">
                {prompt.categories?.length > 0 && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {prompt.categories.slice(0, 3).map((cat, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {cat.category_id}
                        </span>
                      ))}
                      {prompt.categories.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{prompt.categories.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                {(prompt.tools?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {prompt.tools?.slice(0, 2).map((tool, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                        {tool.tool_id}
                      </span>
                    ))}
                    {(prompt.tools?.length ?? 0) > 2 && (
                      <span className="text-xs text-muted-foreground">+{(prompt.tools?.length ?? 0) - 2} more</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setPromptToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={promptToDelete?.name || ''}
        itemType="Prompt"
        isLoading={isDeleting}
      />
    </div>
  );
}
