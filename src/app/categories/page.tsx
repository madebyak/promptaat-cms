'use client'

import { useState } from 'react';
import { CategoryTree } from '../../components/categories/category-tree';
import { AddCategoryModal } from '../../components/categories/add-category-modal';
import { EditCategoryModal } from '../../components/categories/edit-category-modal';
import { DeleteConfirmDialog } from '../../components/ui/confirm-dialog';
import { SearchAndFilter } from '@/components/ui/search-and-filter';
import { FilterOption } from '@/components/ui/filter-dropdown';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useCategories, useFilteredCategories } from '@/hooks/useCategories';
import { LegacyCategory } from '@/types/category';
import { fixDuplicateSortOrders } from '@/lib/data/categories';
import { Plus, GripVertical, RefreshCw } from 'lucide-react';

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<LegacyCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<LegacyCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFixingSortOrders, setIsFixingSortOrders] = useState(false);
  
  const { categories, loading, handleDelete, handleReorder, stats, refreshCategories } = useCategories();
  const filteredCategories = useFilteredCategories(categories, searchQuery, statusFilter);

  const handleEdit = (category: LegacyCategory) => {
    setCategoryToEdit(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (category: LegacyCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    
    setIsDeleting(true);
    try {
      await handleDelete(categoryToDelete.id);
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSuccess = (newCategory: LegacyCategory) => {
    refreshCategories();
    setIsAddModalOpen(false);
  };

  const handleEditSuccess = (updatedCategory: LegacyCategory) => {
    refreshCategories();
    setIsEditModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleFixSortOrders = async () => {
    setIsFixingSortOrders(true);
    try {
      const success = await fixDuplicateSortOrders();
      if (success) {
        await refreshCategories();
        alert('Sort orders have been fixed successfully!');
      } else {
        alert('Failed to fix sort orders. Please try again.');
      }
    } catch (error) {
      console.error('Error fixing sort orders:', error);
      alert('Failed to fix sort orders. Please try again.');
    } finally {
      setIsFixingSortOrders(false);
    }
  };

  const statusFilterOptions: FilterOption[] = [
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Categories</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your content categories ({stats.totalCategories} categories, {stats.totalPosts} posts)
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <Button
            onClick={handleFixSortOrders}
            variant="outline"
            disabled={isFixingSortOrders}
            className="text-orange-600 border-orange-600 hover:bg-orange-50 w-full sm:w-auto"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${isFixingSortOrders ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isFixingSortOrders ? 'Fixing...' : 'Fix Sort Orders'}</span>
            <span className="sm:hidden">{isFixingSortOrders ? 'Fixing...' : 'Fix Orders'}</span>
          </Button>
          <Button
            onClick={handleAddCategory}
            className="text-white w-full sm:w-auto"
            style={{backgroundColor: '#A2AADB'}}
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <SearchAndFilter
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          searchPlaceholder="Search categories by name or description..."
          
          filterValue={statusFilter}
          onFilter={setStatusFilter}
          filterOptions={statusFilterOptions}
          filterPlaceholder="Filter by status"
        />
      </div>

      {/* Categories Tree */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading categories...
        </div>
      ) : (
        <div>
          <div className="mb-2 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <GripVertical className="h-4 w-4" />
              <span className="hidden sm:inline">Drag and drop categories to reorder them</span>
              <span className="sm:hidden">Tap and drag to reorder</span>
            </span>
          </div>
          <CategoryTree 
            categories={filteredCategories} 
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onReorder={handleReorder}
          />
        </div>
      )}

      {/* Add Category Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        categories={categories}
      />

      {/* Edit Category Modal */}
      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        categories={categories}
        categoryToEdit={categoryToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={categoryToDelete?.name || ''}
        itemType={categoryToDelete?.parentId ? 'Subcategory' : 'Category'}
        isLoading={isDeleting}
        warningMessage={
          categoryToDelete?.children && categoryToDelete.children.length > 0
            ? `This category contains ${categoryToDelete.children.length} subcategories that will also be deleted.`
            : undefined
        }
      />
      </div>
    </ProtectedRoute>
  );
}