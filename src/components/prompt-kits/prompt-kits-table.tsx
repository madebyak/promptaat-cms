'use client'

import { useState, useEffect } from 'react';
import { PromptKit } from '@/types/promptKit';
import { Pencil, Trash2, ArrowUp, ArrowDown, ExternalLink, Star } from 'lucide-react';
import { deletePromptKit } from '@/lib/data/promptKits';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import Image from 'next/image';

// Define all possible columns
export const promptKitTableColumns = [
  // image_url is not included here as it will be displayed with name and not configurable
  { id: 'name', label: 'Name', canHide: false },
  { id: 'description', label: 'Description', canHide: true },
  { id: 'instructions', label: 'Instructions', canHide: true },
  { id: 'tags', label: 'Keywords', canHide: true },
  { id: 'tier', label: 'Tier', canHide: true },
  { id: 'visibility', label: 'Visibility', canHide: true },
  { id: 'rating', label: 'Rating', canHide: true },
  { id: 'likes_count', label: 'Likes', canHide: true },
  { id: 'views_count', label: 'Views', canHide: true },
  { id: 'uses_count', label: 'Uses', canHide: true },
  { id: 'categories', label: 'Categories', canHide: true },
  { id: 'subcategories', label: 'Subcategories', canHide: true },
  { id: 'actions', label: 'Actions', canHide: false },
];

// Default visible columns
export const defaultVisibleColumns = [
  'name', // Always includes the image
  'description',
  'tier',
  'visibility',
  'rating',
  'likes_count',
  'views_count',
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
  if (!text) return null;
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

interface PromptKitImageProps {
  imageUrl: string;
  name: string;
}

function PromptKitImage({ imageUrl, name }: PromptKitImageProps) {
  // Fallback image if the provided URL is missing or invalid
  const imageSrc = imageUrl || '/images/placeholder-kit.png';
  
  return (
    <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
      <div className="relative w-full h-full">
        <Image 
          src={imageSrc}
          alt={`${name} thumbnail`}
          className="object-cover"
          width={40}
          height={40}
          onError={(e) => {
            // Fallback to placeholder on error
            e.currentTarget.src = '/images/placeholder-kit.png';
          }}
        />
      </div>
    </div>
  );
}

interface PromptKitsTableProps {
  promptKits: PromptKit[];
  visibleColumns?: string[];
  onVisibilityChange?: (columns: string[]) => void;
  onEdit?: (kit: PromptKit) => void;
}

export function PromptKitsTable({ 
  promptKits: initialPromptKits, 
  visibleColumns = defaultVisibleColumns,
  onVisibilityChange,
  onEdit
}: PromptKitsTableProps) {
  const [promptKits, setPromptKits] = useState<PromptKit[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kitToDelete, setKitToDelete] = useState<PromptKit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Update promptKits when initialPromptKits change
  useEffect(() => {
    setPromptKits(initialPromptKits);
  }, [initialPromptKits]);
  
  // Apply sorting when sortColumn or sortDirection change
  useEffect(() => {
    if (!sortColumn) {
      setPromptKits([...initialPromptKits]);
      return;
    }

    const sortedPromptKits = [...initialPromptKits].sort((a, b) => {
      const aValue = a[sortColumn as keyof PromptKit];
      const bValue = b[sortColumn as keyof PromptKit];
      
      if (Array.isArray(aValue) && Array.isArray(bValue)) {
        // Handle array comparison (like tags, categories)
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
    
    setPromptKits(sortedPromptKits);
  }, [initialPromptKits, sortColumn, sortDirection]);

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

  const handleEdit = (kit: PromptKit) => {
    if (onEdit) {
      onEdit(kit);
    } else {
      console.log('Edit prompt kit:', kit);
      alert(`No edit handler provided for: ${kit.name}`);
    }
  };

  const handleDeleteClick = (kit: PromptKit) => {
    setKitToDelete(kit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!kitToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deletePromptKit(kitToDelete.id);
      if (success) {
        setPromptKits(promptKits.filter(kit => kit.id !== kitToDelete.id));
        setDeleteDialogOpen(false);
        setKitToDelete(null);
      } else {
        throw new Error('Failed to delete prompt kit');
      }
    } catch (error) {
      console.error('Error deleting prompt kit:', error);
      alert('Failed to delete prompt kit. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (promptKits.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No prompt kits found. Create your first prompt kit to get started.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-x-auto">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {promptKitTableColumns
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
          {promptKits.map((kit) => (
            <tr key={kit.id} className="hover:bg-accent transition-colors">
              {visibleColumns.includes('name') && (
                <TableCell>
                  <div className="flex items-center gap-3">
                    <PromptKitImage imageUrl={kit.image_url} name={kit.name} />
                    <div className="font-medium text-sm">{kit.name}</div>
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('description') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    <TruncateText text={kit.description} maxLength={60} />
                  </div>
                </TableCell>
              )}

              {visibleColumns.includes('instructions') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    <TruncateText text={kit.instructions} maxLength={60} />
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('tags') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    <TruncateText text={kit.tags.join(', ')} maxLength={60} />
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('tier') && (
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    kit.tier === 'pro' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {kit.tier === 'pro' ? 'Pro' : 'Free'}
                  </span>
                </TableCell>
              )}
              
              {visibleColumns.includes('visibility') && (
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    kit.visibility === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {kit.visibility.charAt(0).toUpperCase() + kit.visibility.slice(1)}
                  </span>
                </TableCell>
              )}
              
              {visibleColumns.includes('rating') && (
                <TableCell>
                  <RatingStars rating={kit.rating} />
                </TableCell>
              )}
              
              {visibleColumns.includes('likes_count') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {kit.likes_count.toLocaleString()}
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('views_count') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {kit.views_count.toLocaleString()}
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('uses_count') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {kit.uses_count.toLocaleString()}
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('categories') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {kit.categories.join(', ')}
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('subcategories') && (
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {kit.subcategories.join(', ')}
                  </div>
                </TableCell>
              )}
              
              {visibleColumns.includes('actions') && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(kit)}
                      className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                      title="Edit prompt kit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(kit)}
                      className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                      title="Delete prompt kit"
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

             {/* Delete Confirmation Dialog */}
       <DeleteConfirmDialog
         isOpen={deleteDialogOpen}
         onClose={() => {
           setDeleteDialogOpen(false);
           setKitToDelete(null);
         }}
         onConfirm={handleDeleteConfirm}
         itemName={kitToDelete?.name || ''}
         itemType="Prompt Kit"
         isLoading={isDeleting}
       />
    </div>
  );
}