'use client'

import { useState, useEffect } from 'react';
import { LegacyCategory } from '@/types/category';
import { CategoryItem } from './category-item';

interface CategoryTreeProps {
  categories: LegacyCategory[];
  onEdit?: (category: LegacyCategory) => void;
  onDelete?: (category: LegacyCategory) => void;
  onReorder?: (categories: LegacyCategory[]) => void;
}

export function CategoryTree({ categories, onEdit, onDelete, onReorder }: CategoryTreeProps) {
  // Handler for subcategory reordering
  const handleReorderSubcategories = (parentId: string, reorderedSubcategories: LegacyCategory[]) => {
    // Find the parent category
    const findAndUpdateSubcategories = (cats: LegacyCategory[]): LegacyCategory[] => {
      return cats.map(category => {
        if (category.id === parentId) {
          // Update this category's children with the reordered subcategories
          return {
            ...category,
            children: reorderedSubcategories
          };
        } else if (category.children) {
          // Look for the parent in this category's children
          return {
            ...category,
            children: findAndUpdateSubcategories(category.children)
          };
        }
        return category;
      });
    };

    const updatedCategories = findAndUpdateSubcategories([...categories]);
    
    // Call the parent's onReorder callback if provided
    if (onReorder) {
      onReorder(updatedCategories);
    }
  };
  const [draggedCategoryId, setDraggedCategoryId] = useState<string | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);
  const [sortedCategories, setSortedCategories] = useState<LegacyCategory[]>([]);

  // Sort categories by sort_order initially and when categories change
  useEffect(() => {
    const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);
    setSortedCategories(sorted);
  }, [categories]);

  // HTML5 Drag and Drop handlers for top-level categories
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, categoryId: string) => {
    setDraggedCategoryId(categoryId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', categoryId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverIndex(index);
  };

  const handleDragLeave = () => {
    setDraggedOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedCategoryId(null);
    setDraggedOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedCategoryId === null) return;
    
    const draggedIndex = sortedCategories.findIndex(cat => cat.id === draggedCategoryId);
    
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedCategoryId(null);
      setDraggedOverIndex(null);
      return;
    }

    // Create a copy of the categories array
    const newCategories = [...sortedCategories];
    const [draggedCategory] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(dropIndex, 0, draggedCategory);

    // Update sort_order for each category
    const updatedCategories = newCategories.map((category, index) => ({
      ...category,
      sort_order: index + 1
    }));

    // Update local state
    setSortedCategories(updatedCategories);
    
    // Call the parent's onReorder callback if provided
    if (onReorder) {
      onReorder(updatedCategories);
    }

    // Clean up drag state
    setDraggedCategoryId(null);
    setDraggedOverIndex(null);
  };

  if (sortedCategories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories found. Create your first category to get started.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg">
      <div className="p-2 sm:p-4 overflow-visible">
        <div className="space-y-1 overflow-visible">
          {sortedCategories
            // Only show main categories and subcategories (with children or parentId not null)
            .filter(category => category.parentId === null)
            .map((category, index) => (
            <div
              key={category.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, category.id)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                ${draggedCategoryId === category.id ? 'opacity-50' : ''}
                ${draggedOverIndex === index && draggedCategoryId !== category.id ? 'border-t-2 border-primary' : ''}
              `}
            >
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                isDraggable={true}
                onReorderSubcategories={handleReorderSubcategories}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}