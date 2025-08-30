'use client'

import React, { useState, useEffect } from 'react';
import { LegacyCategory } from '@/types/category';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { SearchableSelect, SelectOption } from '@/components/ui/searchable-select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateCategory } from '@/lib/data/categories';

interface EditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (category: LegacyCategory) => void;
  categories: LegacyCategory[];
  categoryToEdit: LegacyCategory | null;
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

export function EditCategoryModal({ isOpen, onClose, onSuccess, categories, categoryToEdit }: EditCategoryModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    parentId: null,
    sortOrder: 1
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create parent category options (exclude current category and its children)
  const parentCategoryOptions: SelectOption[] = React.useMemo(() => {
    if (!categoryToEdit) return [];

    const options: SelectOption[] = [
      { value: '', label: 'No Parent Category (Main Category)' }
    ];

    const addCategoryToOptions = (category: LegacyCategory, depth = 0) => {
      // Skip the category being edited and its children
      if (category.id === categoryToEdit.id) return;
      if (categoryToEdit.children?.some(child => child.id === category.id)) return;

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
  }, [categories, categoryToEdit]);

  // Calculate next sort order based on parent selection
  useEffect(() => {
    if (!categoryToEdit) return;

    const calculateNextSortOrder = () => {
      if (formData.parentId === null) {
        // Main category - find highest sort_order among main categories (excluding current)
        const mainCategories = categories.filter(cat => 
          cat.parentId === null && cat.id !== categoryToEdit.id
        );
        const maxSortOrder = mainCategories.length > 0 
          ? Math.max(...mainCategories.map(cat => cat.sort_order))
          : 0;
        return Math.max(maxSortOrder + 1, categoryToEdit.sort_order);
      } else {
        // Subcategory - find highest sort_order among siblings (excluding current)
        const parentCategory = findCategoryById(categories, formData.parentId);
        if (parentCategory && parentCategory.children) {
          const siblings = parentCategory.children.filter(child => child.id !== categoryToEdit.id);
          const maxSortOrder = siblings.length > 0
            ? Math.max(...siblings.map(cat => cat.sort_order))
            : 0;
          return Math.max(maxSortOrder + 1, categoryToEdit.sort_order);
        }
        return categoryToEdit.sort_order;
      }
    };

    setFormData(prev => ({
      ...prev,
      sortOrder: calculateNextSortOrder()
    }));
  }, [formData.parentId, categories, categoryToEdit]);

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

  // Populate form when modal opens with category data
  useEffect(() => {
    if (isOpen && categoryToEdit) {
      setFormData({
        name: categoryToEdit.name,
        description: categoryToEdit.description || '',
        parentId: categoryToEdit.parentId || null,
        sortOrder: categoryToEdit.sort_order
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, categoryToEdit]);

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

    // Check for duplicate names (excluding current category)
    const isDuplicate = categories.some(cat => {
      if (cat.id === categoryToEdit?.id) return false;
      if (cat.name.toLowerCase() === formData.name.trim().toLowerCase()) return true;
      return cat.children?.some(child => 
        child.id !== categoryToEdit?.id && 
        child.name.toLowerCase() === formData.name.trim().toLowerCase()
      );
    });

    if (isDuplicate) {
      newErrors.name = 'A category with this name already exists';
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
    
    if (!categoryToEdit || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedCategory = await updateCategory(categoryToEdit.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sort_order: formData.sortOrder
      });

      if (updatedCategory) {
        onSuccess(updatedCategory);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update category:', error);
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

  if (!categoryToEdit) return null;

  const isMainCategory = !categoryToEdit.parentId;
  const isSubcategory = !!categoryToEdit.parentId;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <DialogTitle>Edit {isMainCategory ? 'Category' : 'Subcategory'}</DialogTitle>
              <DialogDescription>
                Update the {isMainCategory ? 'category' : 'subcategory'} information. 
                {isSubcategory && ' Note: You cannot change the parent category when editing.'}
              </DialogDescription>
            </div>
            <DialogCloseButton onClose={onClose} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-0">
          <div className="px-4 sm:px-6 py-4 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto scroll-smooth
                          scrollbar-thin scrollbar-track-muted scrollbar-thumb-muted-foreground">
            
            {/* Show parent info for subcategories (read-only) */}
            {isSubcategory && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Parent Category
                </label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="text-sm text-muted-foreground">
                    {categories.find(cat => cat.id === categoryToEdit.parentId)?.name || 'Unknown'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1">
                    Parent category cannot be changed when editing. Delete and recreate to change parent.
                  </p>
                </div>
              </div>
            )}

            {/* Category Name */}
            <div className="space-y-3">
              <label htmlFor="categoryName" className="block text-sm font-medium text-foreground mb-1.5">
                {isMainCategory ? 'Category' : 'Subcategory'} Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="categoryName"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`Enter ${isMainCategory ? 'category' : 'subcategory'} name...`}
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
                placeholder={`Enter ${isMainCategory ? 'category' : 'subcategory'} description (optional)...`}
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
                {isSubmitting ? 'Updating...' : `Update ${isMainCategory ? 'Category' : 'Subcategory'}`}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
