'use client'

import { SearchInput } from './search-input';
import { FilterDropdown, FilterOption } from './filter-dropdown';

interface SearchAndFilterProps {
  searchValue?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  
  filterValue?: string;
  onFilter: (value: string) => void;
  filterOptions?: FilterOption[];
  filterPlaceholder?: string;
  
  showFilter?: boolean;
  hideSearch?: boolean;
  className?: string;
}

export function SearchAndFilter({
  searchValue = '',
  onSearch,
  searchPlaceholder = 'Search...',
  
  filterValue = '',
  onFilter,
  filterOptions = [],
  filterPlaceholder = 'Filter by...',
  
  showFilter = true,
  hideSearch = false,
  className = ''
}: SearchAndFilterProps) {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      {/* Search Input */}
      {!hideSearch && onSearch && (
        <div className="flex-1">
          <SearchInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onSearch={onSearch}
          />
        </div>
      )}

      {/* Filter Dropdown */}
      {showFilter && filterOptions.length > 0 && (
        <div className={`w-full ${!hideSearch ? 'sm:w-48' : ''}`}>
          <FilterDropdown
            options={filterOptions}
            value={filterValue}
            onSelect={onFilter}
            placeholder={filterPlaceholder}
          />
        </div>
      )}
    </div>
  );
}