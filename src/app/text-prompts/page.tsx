'use client'

import { useState } from 'react';
import { PromptsTable, promptTableColumns, defaultVisibleColumns } from '@/components/prompts/prompts-table';
import { AddPromptModal } from '@/components/prompts/add-prompt-modal';
import { EditPromptModal } from '@/components/prompts/edit-prompt-modal';
import { SearchInput } from '@/components/ui/search-input';
import { FilterOption } from '@/components/ui/filter-dropdown';
import { ColumnVisibility } from '@/components/ui/column-visibility';
import { Button } from '@/components/ui/button';
import { usePrompts, useFilteredPrompts } from '@/hooks/usePrompts';
import { useCategories } from '@/hooks/useCategories';
import { useTools } from '@/hooks/useTools';
import { Plus, FileText, Heart, Copy, Eye } from 'lucide-react';
import { Prompt } from '@/types/prompt';

export default function TextPromptsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(defaultVisibleColumns);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [promptToEdit, setPromptToEdit] = useState<Prompt | null>(null);
  
  const { prompts, loading, stats, refreshPrompts } = usePrompts();
  const { categories } = useCategories();
  const { tools } = useTools();
  const filteredPrompts = useFilteredPrompts(prompts, searchQuery, tierFilter, visibilityFilter);

  const handleAddPrompt = () => {
    setIsAddModalOpen(true);
  };

  const handlePromptCreated = (newPrompt: Prompt) => {
    console.log('Prompt created:', newPrompt);
    refreshPrompts();
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setPromptToEdit(prompt);
    setIsEditModalOpen(true);
  };

  const handlePromptUpdated = (updatedPrompt: Prompt) => {
    console.log('Prompt updated:', updatedPrompt);
    refreshPrompts();
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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Text Prompts</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your AI text prompts ({stats.totalPrompts} prompts)
          </p>
        </div>
        <Button
          onClick={handleAddPrompt}
          className="text-white w-full sm:w-auto"
          style={{backgroundColor: '#A2AADB'}}
          size="sm"
        >
          <Plus className="h-4 w-4" />
          <span className="ml-2">Add Prompt</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Prompts</p>
              <p className="text-xl font-bold text-foreground">{stats.totalPrompts}</p>
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
              <Copy className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Copies</p>
              <p className="text-xl font-bold text-foreground">{stats.totalCopies.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
              <p className="text-xl font-bold text-foreground">{stats.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchQuery}
                  onSearch={setSearchQuery}
                  placeholder="Search prompts by name, description, or keywords..."
                />
              </div>
              <div className="w-full sm:w-40 md:w-48">
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                >
                  <option value="">All Tiers</option>
                  {tierFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-40 md:w-48">
                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
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
          <div className="w-full lg:w-64">
            <ColumnVisibility
              columns={promptTableColumns}
              visibleColumns={visibleColumns}
              onVisibilityChange={setVisibleColumns}
              maxVisible={5}
            />
          </div>
        </div>
      </div>

      {/* Prompts Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading prompts...
        </div>
      ) : (
        <PromptsTable 
          prompts={filteredPrompts} 
          visibleColumns={visibleColumns}
          onVisibilityChange={setVisibleColumns}
          onEdit={handleEditPrompt}
        />
      )}

      {/* Add Prompt Modal */}
      <AddPromptModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handlePromptCreated}
        categories={categories}
        tools={tools}
      />

      {/* Edit Prompt Modal */}
      <EditPromptModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setPromptToEdit(null);
        }}
        onSuccess={handlePromptUpdated}
        categories={categories}
        tools={tools}
        prompt={promptToEdit}
      />
    </div>
  );
}
