'use client'

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface ColumnOption {
  id: string;
  label: string;
  canHide: boolean;
}

interface ColumnVisibilityProps {
  columns: ColumnOption[];
  visibleColumns: string[];
  onVisibilityChange: (columnIds: string[]) => void;
  maxVisible?: number;
}

export function ColumnVisibility({
  columns,
  visibleColumns,
  onVisibilityChange,
  maxVisible = 5
}: ColumnVisibilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Keep track of the selection order to remove oldest when exceeding max
  const [selectionOrder, setSelectionOrder] = useState<string[]>(() => {
    // Initialize with currently visible columns
    // Only include columns that can be hidden (exclude required ones)
    return visibleColumns.filter(col => {
      const column = columns.find(c => c.id === col);
      return column?.canHide;
    });
  });

  // Initialize selection order when visible columns change externally
  useEffect(() => {
    setSelectionOrder(prev => {
      // Keep selection order for existing items
      const existing = prev.filter(id => visibleColumns.includes(id));
      // Add any new items that are in visibleColumns but not in previous selection order
      const newItems = visibleColumns.filter(id => {
        const column = columns.find(c => c.id === id);
        return column?.canHide && !prev.includes(id);
      });
      return [...existing, ...newItems];
    });
  }, [visibleColumns, columns]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleColumn = (columnId: string, canHide: boolean) => {
    if (!canHide) return; // Can't toggle required columns
    
    const isVisible = visibleColumns.includes(columnId);
    let newVisibleColumns: string[];
    let newSelectionOrder: string[];
    
    if (isVisible) {
      // If removing, just filter it out
      newVisibleColumns = visibleColumns.filter(id => id !== columnId);
      newSelectionOrder = selectionOrder.filter(id => id !== columnId);
    } else {
      // Count hideable columns that are currently visible
      const hideableVisibleCount = visibleColumns.filter(id => {
        const column = columns.find(c => c.id === id);
        return column?.canHide;
      }).length;
      
      // If adding and already at max visible, remove the oldest one
      if (hideableVisibleCount >= maxVisible) {
        // Get the oldest column that can be hidden
        const oldestColumnId = selectionOrder[0];
        
        // Remove oldest from visible columns
        newVisibleColumns = visibleColumns
          .filter(id => id !== oldestColumnId)
          .concat(columnId);
          
        // Update selection order (remove oldest, add new at end)
        newSelectionOrder = selectionOrder
          .filter(id => id !== oldestColumnId)
          .concat(columnId);
      } else {
        // Just add the new column
        newVisibleColumns = [...visibleColumns, columnId];
        newSelectionOrder = [...selectionOrder, columnId];
      }
    }
    
    setSelectionOrder(newSelectionOrder);
    onVisibilityChange(newVisibleColumns);
  };

  // Count hideable columns that are currently visible
  const hideableVisibleCount = visibleColumns.filter(id => {
    const column = columns.find(c => c.id === id);
    return column?.canHide;
  }).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium bg-background border border-border rounded-md shadow-sm hover:bg-accent focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>Show/Hide Columns ({hideableVisibleCount}/{maxVisible})</span>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 w-56 p-2 bg-background border border-border rounded-md shadow-lg">
          <div className="py-1 text-sm text-foreground max-h-60 overflow-auto">
            <div className="px-3 py-2 text-xs text-muted-foreground border-b border-border mb-2">
              Maximum {maxVisible} columns can be visible
            </div>
            {columns.map(column => {
              const isDisabled = !visibleColumns.includes(column.id) && 
                                hideableVisibleCount >= maxVisible && 
                                column.canHide;
                                
              return (
                <div
                  key={column.id}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-accent rounded-md ${
                    (!column.canHide || isDisabled) ? 'opacity-70' : ''
                  }`}
                  onClick={() => toggleColumn(column.id, column.canHide)}
                >
                  <div className={`w-5 h-5 border border-border rounded mr-2 flex items-center justify-center ${
                    visibleColumns.includes(column.id) ? 'bg-primary' : 'bg-background'
                  }`}>
                    {visibleColumns.includes(column.id) && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                  <span>{column.label}</span>
                  {!column.canHide && (
                    <span className="ml-auto text-xs text-muted-foreground">(Required)</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
