'use client'

import { useState, useEffect, useMemo } from 'react';
import { PromptKit } from '@/types/promptKit';
import { getPromptKits, deletePromptKit } from '@/lib/data/promptKits';

// Hook for prompt kit filtering
export function useFilteredPromptKits(kits: PromptKit[], searchQuery: string, tierFilter: string, visibilityFilter: string = '') {
  return useMemo(() => {
    return kits.filter(kit => {
      const matchesSearch = searchQuery === '' || 
        kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kit.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kit.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        kit.subcategories.some(subcat => subcat.toLowerCase().includes(searchQuery.toLowerCase())) ||
        kit.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesTier = tierFilter === '' || kit.tier === tierFilter;
      const matchesVisibility = visibilityFilter === '' || kit.visibility === visibilityFilter;
      
      return matchesSearch && matchesTier && matchesVisibility;
    });
  }, [kits, searchQuery, tierFilter, visibilityFilter]);
}

export interface UsePromptKitsReturn {
  promptKits: PromptKit[];
  loading: boolean;
  handleDelete: (kitId: string) => Promise<void>;
  refreshPromptKits: () => Promise<void>;
  stats: {
    totalKits: number;
    totalLikes: number;
    totalViews: number;
    totalUses: number;
    avgRating: number;
    tierCount: Record<string, number>;
  };
}

// Main prompt kits hook
export function usePromptKits(): UsePromptKitsReturn {
  const [promptKits, setPromptKits] = useState<PromptKit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPromptKits = async () => {
    try {
      console.log('usePromptKits: Starting to load prompt kits...');
      const data = await getPromptKits();
      console.log('usePromptKits: Received data:', data.length, 'kits');
      setPromptKits(data);
    } catch (error) {
      console.error('usePromptKits: Failed to load prompt kits:', error);
      // Set empty array on error so UI shows "no kits found" instead of loading forever
      setPromptKits([]);
    } finally {
      console.log('usePromptKits: Setting loading to false');
      setLoading(false);
    }
  };

  const refreshPromptKits = async () => {
    setLoading(true);
    await loadPromptKits();
  };

  useEffect(() => {
    loadPromptKits();
  }, []);

  const handleDelete = async (kitId: string) => {
    try {
      const success = await deletePromptKit(kitId);
      if (success) {
        const data = await getPromptKits();
        setPromptKits(data);
      } else {
        throw new Error('Failed to delete prompt kit');
      }
    } catch (error) {
      console.error('Error deleting prompt kit:', error);
      alert('Failed to delete prompt kit. Please try again.');
    }
  };

  const stats = useMemo(() => {
    const totalLikes = promptKits.reduce((sum, p) => sum + p.likes_count, 0);
    const totalViews = promptKits.reduce((sum, p) => sum + p.views_count, 0);
    const totalUses = promptKits.reduce((sum, p) => sum + p.uses_count, 0);
    const avgRating = promptKits.length 
      ? promptKits.reduce((sum, p) => sum + p.rating, 0) / promptKits.length 
      : 0;
    
    const tierCount = promptKits.reduce((acc, kit) => {
      acc[kit.tier] = (acc[kit.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalKits: promptKits.length,
      totalLikes,
      totalViews,
      totalUses,
      avgRating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
      tierCount
    };
  }, [promptKits]);

  return {
    promptKits,
    loading,
    handleDelete,
    refreshPromptKits,
    stats
  };
}
