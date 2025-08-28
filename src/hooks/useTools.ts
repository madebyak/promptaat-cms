'use client'

import { useState, useEffect, useMemo } from 'react';
import { Tool } from '@/types/tool';
import { getTools, deleteTool, updateTool } from '@/lib/data/tools';

// Hook for tool filtering
export function useFilteredTools(tools: Tool[], searchQuery: string, statusFilter: string) {
  return useMemo(() => {
    const filterTools = (toolsList: Tool[]): Tool[] => {
      return toolsList.filter(tool => {
        const matchesSearch = searchQuery === '' || 
          tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (tool.website_link && tool.website_link.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // For tools, we don't have an isActive field, so we can filter by other criteria
        // For now, we'll just use the search filter
        const matchesStatus = statusFilter === '' || statusFilter === 'all';
        
        return matchesSearch && matchesStatus;
      });
    };

    return filterTools(tools);
  }, [tools, searchQuery, statusFilter]);
}

// Main tools hook
export function useTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTools = async () => {
    try {
      const data = await getTools();
      setTools(data);
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshTools = async () => {
    setLoading(true);
    await loadTools();
  };

  useEffect(() => {
    loadTools();
  }, []);

  const handleDelete = async (toolId: string) => {
    try {
      const success = await deleteTool(toolId);
      if (success) {
        const data = await getTools();
        setTools(data);
      } else {
        throw new Error('Failed to delete tool');
      }
    } catch (error) {
      console.error('Error deleting tool:', error);
      throw error; // Re-throw to let the component handle the error
    }
  };

  const stats = useMemo(() => {
    return {
      totalTools: tools.length,
      withWebsite: tools.filter(t => t.website_link).length,
      withImage: tools.filter(t => t.image_url).length
    };
  }, [tools]);

  const handleReorder = async (reorderedTools: Tool[]) => {
    try {
      // Optimistically update the UI first
      setTools(reorderedTools);
      
      // Update the sort_order in the database sequentially to prevent race conditions
      for (let i = 0; i < reorderedTools.length; i++) {
        const tool = reorderedTools[i];
        await updateTool(tool.id, { sort_order: i + 1 });
      }
      
      return true;
    } catch (error) {
      console.error('Error reordering tools:', error);
      // Revert the optimistic update on error
      await loadTools();
      alert('Failed to reorder tools. Please try again.');
      return false;
    }
  };

  return {
    tools,
    loading,
    handleDelete,
    handleReorder,
    refreshTools,
    stats
  };
}
