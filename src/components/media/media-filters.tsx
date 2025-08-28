'use client'

import { SearchInput } from '@/components/ui/search-input';
import { FilterDropdown, FilterOption } from '@/components/ui/filter-dropdown';

interface MediaFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  visibilityFilter: string;
  onVisibilityFilterChange: (visibility: string) => void;
}

export function MediaFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  visibilityFilter,
  onVisibilityFilterChange
}: MediaFiltersProps) {
  const typeFilterOptions: FilterOption[] = [
    { value: 'image', label: 'Images' },
    { value: 'video', label: 'Videos' },
    { value: 'audio', label: 'Audio' },
    { value: 'document', label: 'Documents' }
  ];

  const visibilityFilterOptions: FilterOption[] = [
    { value: 'true', label: 'Public' },
    { value: 'false', label: 'Private' }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <SearchInput
            placeholder="Search files by name, caption, or tags..."
            value={searchQuery}
            onSearch={onSearchChange}
          />
        </div>
        
        {/* Type Filter */}
        <div className="w-full sm:w-48">
          <FilterDropdown
            options={typeFilterOptions}
            value={typeFilter}
            onSelect={onTypeFilterChange}
            placeholder="Filter by type"
          />
        </div>
        
        {/* Visibility Filter */}
        <div className="w-full sm:w-48">
          <FilterDropdown
            options={visibilityFilterOptions}
            value={visibilityFilter}
            onSelect={onVisibilityFilterChange}
            placeholder="Filter by visibility"
          />
        </div>
      </div>
    </div>
  );
}