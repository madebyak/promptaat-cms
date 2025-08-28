'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface MultiSelectProps {
  options: SelectOption[];
  values: (string | number)[];
  onValuesChange: (values: (string | number)[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  maxHeight?: string;
  maxDisplayCount?: number;
}

export function MultiSelect({
  options,
  values,
  onValuesChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  className = '',
  disabled = false,
  allowClear = true,
  maxHeight = 'max-h-60',
  maxDisplayCount = 2
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter(option => values.includes(option.value));

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchQuery('');
    }
  };

  const handleOptionToggle = (optionValue: string | number) => {
    const isSelected = values.includes(optionValue);
    if (isSelected) {
      onValuesChange(values.filter(v => v !== optionValue));
    } else {
      onValuesChange([...values, optionValue]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValuesChange([]);
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    if (selectedOptions.length <= maxDisplayCount) {
      return selectedOptions.map(opt => opt.label).join(', ');
    }
    return `${selectedOptions.slice(0, maxDisplayCount).map(opt => opt.label).join(', ')} +${selectedOptions.length - maxDisplayCount}`;
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3 py-2 text-sm
          border border-input rounded-md bg-transparent
          transition-colors duration-200
          hover:bg-accent/5
          focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring
          disabled:cursor-not-allowed disabled:opacity-50
          ${isOpen ? 'ring-1 ring-ring border-ring' : ''}
        `}
      >
        <span className={selectedOptions.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>
          {getDisplayText()}
        </span>
        
        <div className="flex items-center gap-1">
          {allowClear && selectedOptions.length > 0 && (
            <X
              className="h-4 w-4 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={handleClear}
            />
          )}
          <ChevronDown 
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-950 border border-border rounded-md shadow-xl
                        animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="p-3 border-b border-border bg-white dark:bg-gray-950">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-3 py-2 text-sm border border-input rounded-md bg-transparent
                         transition-colors duration-200
                         focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              />
            </div>
          </div>

          {/* Options List */}
          <div className={`${maxHeight} overflow-y-auto p-1 bg-white dark:bg-gray-950`}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => !option.disabled && handleOptionToggle(option.value)}
                    className={`
                      flex items-center gap-3 px-3 py-2 text-sm rounded-sm cursor-pointer
                      hover:bg-accent hover:text-accent-foreground
                      ${option.disabled ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                  >
                    <div className={`
                      w-4 h-4 border border-input rounded flex items-center justify-center
                      ${isSelected ? 'bg-primary border-primary' : 'bg-background'}
                    `}>
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                    <span className="flex-1">{option.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
