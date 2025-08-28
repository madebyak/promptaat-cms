'use client'

import { useState, useEffect, useMemo } from 'react';
import { PromptRequest } from '@/types/promptRequest';
import { getPromptRequests, deletePromptRequest, updatePromptRequest } from '@/lib/data/promptRequests';

// Hook for prompt request filtering
export function useFilteredPromptRequests(requests: PromptRequest[], searchQuery: string, statusFilter: string) {
  return useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = searchQuery === '' || 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.userName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === '' || request.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);
}

// Main prompt requests hook
export function usePromptRequests() {
  const [promptRequests, setPromptRequests] = useState<PromptRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPromptRequests = async () => {
      try {
        const data = await getPromptRequests();
        setPromptRequests(data);
      } catch (error) {
        console.error('Failed to load prompt requests:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPromptRequests();
  }, []);

  const handleDelete = async (requestId: string) => {
    try {
      const success = await deletePromptRequest(requestId);
      if (success) {
        setPromptRequests(promptRequests.filter(request => request.id !== requestId));
      } else {
        throw new Error('Failed to delete prompt request');
      }
    } catch (error) {
      console.error('Error deleting prompt request:', error);
      alert('Failed to delete prompt request. Please try again.');
    }
  };

  const handleUpdateStatus = async (requestId: string, status: PromptRequest['status']) => {
    try {
      const updatedRequest = await updatePromptRequest(requestId, { status });
      if (updatedRequest) {
        setPromptRequests(promptRequests.map(request => 
          request.id === requestId ? updatedRequest : request
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating prompt request status:', error);
      alert('Failed to update request status. Please try again.');
      return false;
    }
  };

  const stats = useMemo(() => {
    const inReviewCount = promptRequests.filter(r => r.status === 'in_review').length;
    const approvedCount = promptRequests.filter(r => r.status === 'approved').length;
    const completedCount = promptRequests.filter(r => r.status === 'completed').length;
    const rejectedCount = promptRequests.filter(r => r.status === 'rejected').length;
    
    return {
      totalRequests: promptRequests.length,
      inReviewCount,
      approvedCount,
      completedCount,
      rejectedCount
    };
  }, [promptRequests]);

  return {
    promptRequests,
    loading,
    handleDelete,
    handleUpdateStatus,
    stats
  };
}
