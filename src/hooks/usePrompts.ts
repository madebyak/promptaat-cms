'use client'

import { useState, useEffect, useMemo } from 'react';
import { Prompt } from '@/types/prompt';
import { getPrompts, deletePrompt } from '@/lib/data/prompts';

// Hook for prompt filtering
export function useFilteredPrompts(prompts: Prompt[], searchQuery: string, tierFilter: string, visibilityFilter: string = '') {
  return useMemo(() => {
    return prompts.filter(prompt => {
      const matchesSearch = searchQuery === '' || 
        prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.categories?.some(cat => cat.category_id.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (cat.subcategory_id && cat.subcategory_id.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        prompt.tools?.some(tool => tool.tool_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prompt.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTier = tierFilter === '' || prompt.tier === tierFilter;
      const matchesVisibility = visibilityFilter === '' || prompt.visibility === visibilityFilter;
      
      return matchesSearch && matchesTier && matchesVisibility;
    });
  }, [prompts, searchQuery, tierFilter, visibilityFilter]);
}

export interface UsePromptsReturn {
  prompts: Prompt[];
  loading: boolean;
  handleDelete: (promptId: string) => Promise<void>;
  refreshPrompts: () => Promise<void>;
  stats: {
    totalPrompts: number;
    totalLikes: number;
    totalCopies: number;
    avgRating: number;
    tierCount: Record<string, number>;
  };
}

// Main prompts hook
export function usePrompts(): UsePromptsReturn {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPrompts = async () => {
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPrompts = async () => {
    setLoading(true);
    await loadPrompts();
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const handleDelete = async (promptId: string) => {
    try {
      const success = await deletePrompt(promptId);
      if (success) {
        const data = await getPrompts();
        setPrompts(data);
      } else {
        throw new Error('Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const totalLikes = prompts.reduce((sum, p) => sum + p.likesCount, 0);
    const totalCopies = prompts.reduce((sum, p) => sum + p.copiesCount, 0);
    const avgRating = prompts.length 
      ? prompts.reduce((sum, p) => sum + p.rating, 0) / prompts.length 
      : 0;
    
    const tierCount = prompts.reduce((acc, prompt) => {
      acc[prompt.tier] = (acc[prompt.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPrompts: prompts.length,
      totalLikes,
      totalCopies,
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      tierCount
    };
  }, [prompts]);

  return {
    prompts,
    loading,
    handleDelete,
    refreshPrompts,
    stats
  };
}
