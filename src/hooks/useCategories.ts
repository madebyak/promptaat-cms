'use client'

import { useState, useEffect, useMemo } from 'react';
import { LegacyCategory } from '@/types/category';
import { getCategories, deleteCategory, updateCategory } from '@/lib/data/categories';

// Hook for category filtering
export function useFilteredCategories(categories: LegacyCategory[], searchQuery: string, statusFilter: string) {
  return useMemo(() => {
    const filterCategories = (cats: LegacyCategory[]): LegacyCategory[] => {
      return cats.filter(category => {
        const matchesSearch = searchQuery === '' || 
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = statusFilter === '' || 
          (category.isActive !== undefined ? category.isActive.toString() === statusFilter : 'true' === statusFilter);
        
        return matchesSearch && matchesStatus;
      }).map(category => ({
        ...category,
        children: category.children ? filterCategories(category.children) : undefined
      }));
    };

    return filterCategories(categories);
  }, [categories, searchQuery, statusFilter]);
}

// Main categories hook
export function useCategories() {
  const [categories, setCategories] = useState<LegacyCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCategories = async () => {
    setLoading(true);
    await loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (categoryId: string) => {
    try {
      const success = await deleteCategory(categoryId);
      if (success) {
        const data = await getCategories();
        setCategories(data);
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const stats = useMemo(() => {
    const countCategories = (cats: LegacyCategory[]): number => {
      return cats.reduce((count, cat) => {
        return count + 1 + (cat.children ? countCategories(cat.children) : 0);
      }, 0);
    };

    const countPosts = (cats: LegacyCategory[]): number => {
      return cats.reduce((total, cat) => {
        return total + (cat.postCount || 0) + (cat.children ? countPosts(cat.children) : 0);
      }, 0);
    };

    return {
      totalCategories: countCategories(categories),
      totalPosts: countPosts(categories)
    };
  }, [categories]);

  const handleReorder = async (reorderedCategories: LegacyCategory[]) => {
    try {
      // Optimistically update the UI first
      setCategories(reorderedCategories);
      
      // Collect all categories that have changed, including subcategories
      const collectUpdatedCategories = (cats: LegacyCategory[]): { id: string, sort_order: number, isSubcategory: boolean }[] => {
        let updated: { id: string, sort_order: number, isSubcategory: boolean }[] = [];
        
        cats.forEach(cat => {
          // Always include the category itself for potential top-level changes
          updated.push({ id: cat.id, sort_order: cat.sort_order, isSubcategory: !!cat.parentId });
          
          // Recursively collect children if any
          if (cat.children && cat.children.length > 0) {
            updated = [...updated, ...collectUpdatedCategories(cat.children)];
          }
        });
        
        return updated;
      };
      
      const categoriesToUpdate = collectUpdatedCategories(reorderedCategories);
      
      // Update the sort_order in the database sequentially to prevent race conditions
      for (const { id, sort_order } of categoriesToUpdate) {
        await updateCategory(id, { sort_order });
      }
      
      return true;
    } catch (error) {
      console.error('Error reordering categories:', error);
      // Revert the optimistic update on error
      await loadCategories();
      alert('Failed to reorder categories. Please try again.');
      return false;
    }
  };

  return {
    categories,
    loading,
    handleDelete,
    handleReorder,
    refreshCategories,
    stats
  };
}