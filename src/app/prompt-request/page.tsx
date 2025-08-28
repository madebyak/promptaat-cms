'use client'

import { useState } from 'react';
import { PromptRequestsTable } from '@/components/prompt-requests/prompt-requests-table';
import { ViewPromptRequestModal } from '@/components/prompt-requests/view-prompt-request-modal';
import { FilterOption } from '@/components/ui/filter-dropdown';
import { SearchAndFilter } from '@/components/ui/search-and-filter';
import { PromptRequest } from '@/types/promptRequest';

import { Button } from '@/components/ui/button';
import { usePromptRequests, useFilteredPromptRequests } from '@/hooks/usePromptRequests';
import { Plus, MessageSquareText, Clock, CheckCircle, XCircle, FileCheck } from 'lucide-react';

export default function PromptRequestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PromptRequest | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const { promptRequests, loading, handleDelete, handleUpdateStatus, stats } = usePromptRequests();
  const filteredRequests = useFilteredPromptRequests(promptRequests, searchQuery, statusFilter);

  const handleAddRequest = () => {
    // TODO: Implement add prompt request functionality (open modal/form)
    console.log('Add new prompt request');
    alert('Add prompt request functionality will be implemented');
  };

  const handleViewRequest = (request: PromptRequest) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedRequest(null);
  };

  const statusFilterOptions: FilterOption[] = [
    { value: 'in_review', label: 'In Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' }
  ];

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Prompt Requests</h1>
          <p className="text-muted-foreground">
            Manage user prompt requests ({stats.totalRequests} requests)
          </p>
        </div>
        <Button
          onClick={handleAddRequest}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Review</p>
              <p className="text-xl font-bold text-foreground">{stats.inReviewCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-xl font-bold text-foreground">{stats.approvedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-xl font-bold text-foreground">{stats.completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-xl font-bold text-foreground">{stats.rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <SearchAndFilter
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          searchPlaceholder="Search requests by title or description..."
          
          filterValue={statusFilter}
          onFilter={setStatusFilter}
          filterOptions={statusFilterOptions}
          filterPlaceholder="Filter by status"
        />
      </div>

      {/* Prompt Requests Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading prompt requests...
        </div>
      ) : (
        <PromptRequestsTable 
          promptRequests={filteredRequests}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          onViewRequest={handleViewRequest}
        />
      )}

      {/* View Request Modal */}
      <ViewPromptRequestModal
        request={selectedRequest}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
