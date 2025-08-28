'use client'

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, FolderOpen, Folder, MoreHorizontal, Pencil, Trash2, GripVertical } from 'lucide-react';
import { LegacyCategory } from '@/types/category';

interface CategoryItemProps {
  category: LegacyCategory;
  level?: number;
  onEdit?: (category: LegacyCategory) => void;
  onDelete?: (category: LegacyCategory) => void;
  isDraggable?: boolean;
  onReorderSubcategories?: (categoryId: string, reorderedSubcategories: LegacyCategory[]) => void;
}

export function CategoryItem({ category, level = 0, onEdit, onDelete, isDraggable = false, onReorderSubcategories }: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showSubcategoryActions, setShowSubcategoryActions] = useState<Record<string, boolean>>({});
  const [draggedSubcategoryId, setDraggedSubcategoryId] = useState<string | null>(null);
  const [draggedOverSubcategoryIndex, setDraggedOverSubcategoryIndex] = useState<number | null>(null);
  const [sortedSubcategories, setSortedSubcategories] = useState<LegacyCategory[]>([]);

  const hasChildren = category.children && category.children.length > 0;
  const isMainCategory = level === 0 && category.parentId === null;
  const indentLevel = level * 20;
  
  // Sort subcategories by sort_order initially
  useEffect(() => {
    if (category.children) {
      const sorted = [...category.children].sort((a, b) => a.sort_order - b.sort_order);
      setSortedSubcategories(sorted);
    }
  }, [category.children]);
  
  // Handle drag and drop for subcategories
  const handleSubcategoryDragStart = (e: React.DragEvent<HTMLDivElement>, subcategoryId: string) => {
    e.stopPropagation();
    setDraggedSubcategoryId(subcategoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', subcategoryId);
  };

  const handleSubcategoryDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSubcategoryIndex(index);
  };

  const handleSubcategoryDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDraggedOverSubcategoryIndex(null);
  };

  const handleSubcategoryDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setDraggedSubcategoryId(null);
    setDraggedOverSubcategoryIndex(null);
  };

  const handleSubcategoryDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedSubcategoryId === null || !sortedSubcategories.length) return;
    
    const draggedIndex = sortedSubcategories.findIndex(cat => cat.id === draggedSubcategoryId);
    
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedSubcategoryId(null);
      setDraggedOverSubcategoryIndex(null);
      return;
    }

    // Create a copy of the subcategories array
    const newSubcategories = [...sortedSubcategories];
    const [draggedSubcategory] = newSubcategories.splice(draggedIndex, 1);
    newSubcategories.splice(dropIndex, 0, draggedSubcategory);

    // Update sort_order for each subcategory
    const updatedSubcategories = newSubcategories.map((subcategory, index) => ({
      ...subcategory,
      sort_order: index + 1
    }));

    // Update local state
    setSortedSubcategories(updatedSubcategories);
    
    // Call the parent's onReorderSubcategories callback if provided
    if (onReorderSubcategories) {
      onReorderSubcategories(category.id, updatedSubcategories);
    }

    // Clean up drag state
    setDraggedSubcategoryId(null);
    setDraggedOverSubcategoryIndex(null);
  };

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(category);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(category);
  };

  return (
    <div>
      {/* Category Row */}
      <div 
        className="group flex items-center justify-between py-3 px-4 hover:bg-accent rounded-lg transition-colors cursor-pointer"
        style={{ paddingLeft: `${16 + indentLevel}px` }}
        onClick={handleToggle}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center gap-3 flex-1">
          {/* Drag Handle - show for main categories */}
          {isDraggable && isMainCategory && (
            <div className="w-4 h-4 flex items-center justify-center cursor-grab hover:text-foreground" title="Drag to reorder">
              <GripVertical className="h-4 w-4 text-muted-foreground transition-colors" />
            </div>
          )}

          {/* Expand/Collapse Icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {isMainCategory ? (
              hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50" />
              )
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>

          {/* Folder Icon */}
          <div className="flex items-center justify-center">
            {isMainCategory ? (
              hasChildren && isExpanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <div className="w-4 h-4 bg-muted rounded-sm flex items-center justify-center">
                <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              </div>
            )}
          </div>

          {/* Category Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{category.name}</span>
              {category.isActive === false && (
                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                  Inactive
                </span>
              )}
            </div>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>

          {/* Post Count */}
          <div className="text-sm text-muted-foreground">
            {category.postCount || 0} posts
          </div>

          {/* Actions */}
          <div className={`flex items-center gap-1 ${showActions ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <button
              onClick={handleEdit}
              className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
              title="Edit category"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
              title="Delete category"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Subcategories - Only show for main categories (level 0) */}
      {hasChildren && isExpanded && level === 0 && (
        <div className="ml-4 overflow-visible">
          {sortedSubcategories.map((subcategory, index) => (
            <div
              key={subcategory.id}
              draggable={isDraggable}
              onDragStart={(e) => handleSubcategoryDragStart(e, subcategory.id)}
              onDragOver={(e) => handleSubcategoryDragOver(e, index)}
              onDragLeave={handleSubcategoryDragLeave}
              onDrop={(e) => handleSubcategoryDrop(e, index)}
              onDragEnd={handleSubcategoryDragEnd}
              className={`
                ${draggedSubcategoryId === subcategory.id ? 'opacity-50' : ''}
                ${draggedOverSubcategoryIndex === index && draggedSubcategoryId !== subcategory.id ? 'border-t-2 border-primary' : ''}
              `}
            >
              {/* Render subcategory as a simple item without further nesting */}
              <div 
                className="group flex items-center justify-between py-3 px-4 hover:bg-accent rounded-lg transition-colors cursor-pointer"
                style={{ paddingLeft: `${16 + (level + 1) * 20}px` }}
                onMouseEnter={() => setShowSubcategoryActions(prev => ({ ...prev, [subcategory.id]: true }))}
                onMouseLeave={() => setShowSubcategoryActions(prev => ({ ...prev, [subcategory.id]: false }))}
              >
                <div className="flex items-center gap-3 flex-1">
                  {/* Drag Handle for subcategories */}
                  {isDraggable && (
                    <div className="w-4 h-4 flex items-center justify-center cursor-grab hover:text-foreground" title="Drag to reorder">
                      <GripVertical className="h-4 w-4 text-muted-foreground transition-colors" />
                    </div>
                  )}

                  {/* No expand/collapse icon for subcategories */}
                  <div className="w-4 h-4" />

                  {/* Subcategory Icon */}
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 bg-muted rounded-sm flex items-center justify-center">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                    </div>
                  </div>

                  {/* Subcategory Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{subcategory.name}</span>
                      {subcategory.isActive === false && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    {subcategory.description && (
                      <p className="text-sm text-muted-foreground mt-1">{subcategory.description}</p>
                    )}
                  </div>

                  {/* Post Count */}
                  <div className="text-sm text-muted-foreground">
                    {subcategory.postCount || 0} posts
                  </div>

                  {/* Actions */}
                  <div className={`flex items-center gap-1 ${showSubcategoryActions[subcategory.id] ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(subcategory);
                      }}
                      className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
                      title="Edit subcategory"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(subcategory);
                      }}
                      className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                      title="Delete subcategory"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}