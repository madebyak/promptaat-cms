'use client'

import React, { useState, useEffect } from 'react';
import { LegacyCategory } from '@/types/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createCategory } from '@/lib/data/categories';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: LegacyCategory) => void;
  categories: LegacyCategory[];
}

interface FormData {
  name: string;
  description: string;
  parentId: string | null;
  sortOrder: number;
}

interface FormErrors {
  name?: string;
  description?: string;
  parentId?: string;
  sortOrder?: string;
}

export function AddCategoryModal({ isOpen, onClose, onSuccess, categories }: AddCategoryModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    parentId: null,
    sortOrder: 1
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create parent category options
  const parentCategoryOptions: SelectOption[] = React.useMemo(() => {
    const options: SelectOption[] = [
      { value: '', label: 'No Parent Category (Main Category)' }
    ];

    const addCategoryToOptions = (category: LegacyCategory, depth = 0) => {
      const prefix = '  '.repeat(depth);
      options.push({
        value: category.id,
        label: `${prefix}${category.name}`
      });

      if (category.children) {
        category.children
          .sort((a, b) => a.sort_order - b.sort_order)
          .forEach(child => addCategoryToOptions(child, depth + 1));
      }
    };

    categories
      .filter(cat => cat.parentId === null)
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach(category => addCategoryToOptions(category));

    return options;
  }, [categories]);

  // Calculate next sort order based on parent selection
  useEffect(() => {
    const calculateNextSortOrder = () => {
      if (formData.parentId === null) {
        // Main category - find highest sort_order among main categories
        const mainCategories = categories.filter(cat => cat.parentId === null);
        const maxSortOrder = mainCategories.length > 0 
          ? Math.max(...mainCategories.map(cat => cat.sort_order))
          : 0;
        return maxSortOrder + 1;
      } else {
        // Subcategory - find highest sort_order among siblings
        const parentCategory = findCategoryById(categories, formData.parentId);
        if (parentCategory && parentCategory.children) {
          const maxSortOrder = parentCategory.children.length > 0
            ? Math.max(...parentCategory.children.map(cat => cat.sort_order))
            : 0;
          return maxSortOrder + 1;
        }
        return 1;
      }
    };

    setFormData(prev => ({
      ...prev,
      sortOrder: calculateNextSortOrder()
    }));
  }, [formData.parentId, categories]);

  // Helper function to find category by ID
  const findCategoryById = (categories: LegacyCategory[], id: string): LegacyCategory | null => {
    for (const category of categories) {
      if (category.id === id) return category;
      if (category.children) {
        const found = findCategoryById(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Calculate initial sort order for main category
      const mainCategories = categories.filter(cat => cat.parentId === null);
      const initialSortOrder = mainCategories.length > 0 
        ? Math.max(...mainCategories.map(cat => cat.sort_order)) + 1
        : 1;
      
      setFormData({
        name: '',
        description: '',
        parentId: null,
        sortOrder: initialSortOrder
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, categories]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Category name must be less than 100 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Sort order validation
    if (formData.sortOrder < 1) {
      newErrors.sortOrder = 'Sort order must be at least 1';
    } else if (formData.sortOrder > 999) {
      newErrors.sortOrder = 'Sort order must be less than 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newCategory = await createCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId,
        sort_order: formData.sortOrder
      });

      onSuccess(newCategory);
      onClose();
    } catch (error) {
      console.error('Failed to create category:', error);
      // Handle error (could show toast notification)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category to organize your content. You can set it as a main category or as a subcategory.
              </DialogDescription>
            </div>
            <DialogCloseButton onClose={onClose} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-4 sm:px-6 py-4 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto scroll-smooth
                          scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground">
            {/* Parent Category Selection */}
            <div className="space-y-3">
              <label htmlFor="parentCategory" className="block text-sm font-medium text-foreground mb-1.5">
                Parent Category
              </label>
              <SearchableSelect
                options={parentCategoryOptions}
                value={formData.parentId || ''}
                onValueChange={(value) => handleInputChange('parentId', value === '' ? null : value)}
                placeholder="Choose parent category..."
                searchPlaceholder="Search categories..."
                allowClear={true}
                maxHeight="max-h-48"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to create a main category, or select a parent to create a subcategory.
              </p>
              {errors.parentId && (
                <p className="text-sm text-destructive">{errors.parentId}</p>
              )}
            </div>

            {/* Category Name */}
            <div className="space-y-3">
              <label htmlFor="categoryName" className="block text-sm font-medium text-foreground mb-1.5">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="categoryName"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter category name..."
                className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Category Description */}
            <div className="space-y-3">
              <label htmlFor="categoryDescription" className="block text-sm font-medium text-foreground mb-1.5">
                Description
              </label>
              <Textarea
                id="categoryDescription"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter category description (optional)..."
                rows={4}
                className="resize-none"
                error={errors.description}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Sort Order */}
            <div className="space-y-3">
              <label htmlFor="sortOrder" className="block text-sm font-medium text-foreground mb-1.5">
                Sort Order
              </label>
              <Input
                id="sortOrder"
                type="number"
                min={1}
                max={999}
                value={formData.sortOrder}
                onChange={(e) => handleInputChange('sortOrder', parseInt(e.target.value) || 1)}
                className={errors.sortOrder ? 'border-destructive focus-visible:ring-destructive' : ''}
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Determines the display order. Lower numbers appear first.
              </p>
              {errors.sortOrder && (
                <p className="text-sm text-destructive">{errors.sortOrder}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="text-white w-full sm:w-auto"
                style={{backgroundColor: '#A2AADB'}}
              >
                {isSubmitting ? 'Creating...' : 'Create Category'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
