'use client'

import { useState } from 'react';
import { PromptKitsTable, promptKitTableColumns, defaultVisibleColumns } from '@/components/prompt-kits/prompt-kits-table';
import { AddPromptKitModal } from '@/components/prompt-kits/add-prompt-kit-modal';
import { EditPromptKitModal } from '@/components/prompt-kits/edit-prompt-kit-modal';
import { FilterOption } from '@/components/ui/filter-dropdown';
import { SearchInput } from '@/components/ui/search-input';
import { ColumnVisibility } from '@/components/ui/column-visibility';
import { Button } from '@/components/ui/button';
import { usePromptKits, useFilteredPromptKits } from '@/hooks/usePromptKits';
import { useCategories } from '@/hooks/useCategories';
import { useTools } from '@/hooks/useTools';
import { PromptKit } from '@/types/promptKit';
import { Plus, Package, Heart, Eye, Download } from 'lucide-react';

export default function PromptKitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [kitToEdit, setKitToEdit] = useState<PromptKit | null>(null);
  
  const { promptKits, loading, stats, refreshPromptKits } = usePromptKits();
  const { categories } = useCategories();
  const { tools } = useTools();
  const filteredKits = useFilteredPromptKits(promptKits, searchQuery, tierFilter, visibilityFilter);

  const handleAddPromptKit = () => {
    setIsAddModalOpen(true);
  };

  const handlePromptKitCreated = async (newPromptKit: PromptKit) => {
    // The modal already handles creation, just refresh the list
    await refreshPromptKits();
  };

  const handleEditClick = (kit: PromptKit) => {
    setKitToEdit(kit);
    setIsEditModalOpen(true);
  };

  const handlePromptKitUpdated = async (updatedKit: PromptKit) => {
    // The modal already handles updating, just refresh the list
    await refreshPromptKits();
  };

  const tierFilterOptions: FilterOption[] = [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' }
  ];
  
  const visibilityFilterOptions: FilterOption[] = [
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Prompt Kits</h1>
          <p className="text-muted-foreground">
            Manage your prompt collections ({stats.totalKits} kits)
          </p>
        </div>
        <Button
          onClick={handleAddPromptKit}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Prompt Kit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Kits</p>
              <p className="text-xl font-bold text-foreground">{stats.totalKits}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Likes</p>
              <p className="text-xl font-bold text-foreground">{stats.totalLikes.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Uses</p>
              <p className="text-xl font-bold text-foreground">{stats.totalUses.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-xl font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onSearch={setSearchQuery}
                  placeholder="Search kits by name, description, or keywords..."
                />
              </div>
              <div className="w-48">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Tiers</option>
                  {tierFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All Visibility</option>
                  {visibilityFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64">
            <ColumnVisibility
              columns={promptKitTableColumns}
              visibleColumns={visibleColumns}
              onVisibilityChange={setVisibleColumns}
              maxVisible={5}
            />
          </div>
        </div>
      </div>

      {/* Prompt Kits Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading prompt kits...
        </div>
      ) : (
        <PromptKitsTable 
          promptKits={filteredKits} 
          visibleColumns={visibleColumns}
          onVisibilityChange={setVisibleColumns}
          onEdit={handleEditClick}
        />
      )}

      {/* Add Prompt Kit Modal */}
      <AddPromptKitModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePromptKitCreated}
        categories={categories}
        tools={tools}
      />

      {/* Edit Prompt Kit Modal */}
      <EditPromptKitModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setKitToEdit(null);
        }}
        onSuccess={handlePromptKitUpdated}
        categories={categories}
        tools={tools}
        promptKit={kitToEdit}
      />
    </div>
  );
}
