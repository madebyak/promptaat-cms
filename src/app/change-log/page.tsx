'use client'

import { useState } from 'react';
import { ChangeLogsTable } from '@/components/change-logs/change-logs-table';
import { AddChangeLogModal } from '@/components/change-logs/add-changelog-modal';
import { EditChangeLogModal } from '@/components/change-logs/edit-changelog-modal';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import { SearchAndFilter } from '@/components/ui/search-and-filter';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useChangeLogs, useFilteredChangeLogs } from '@/hooks/useChangeLogs';
import { ChangeLog } from '@/types/changeLog';
import { Plus, History, Clock } from 'lucide-react';

export default function ChangeLogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [changeLogToEdit, setChangeLogToEdit] = useState<ChangeLog | null>(null);
  const [changeLogToDelete, setChangeLogToDelete] = useState<ChangeLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { changeLogs, loading, handleDelete, refreshChangeLogs, stats } = useChangeLogs();
  const filteredLogs = useFilteredChangeLogs(changeLogs, searchQuery);

  const handleAddChangeLog = () => {
    setIsAddModalOpen(true);
  };

  const handleChangeLogCreated = (newChangeLog: ChangeLog) => {
    console.log('Change log created:', newChangeLog);
    refreshChangeLogs();
  };

  const handleEdit = (changeLog: ChangeLog) => {
    setChangeLogToEdit(changeLog);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedChangeLog: ChangeLog) => {
    console.log('Change log updated:', updatedChangeLog);
    refreshChangeLogs();
    setIsEditModalOpen(false);
    setChangeLogToEdit(null);
  };

  const handleDeleteClick = (changeLog: ChangeLog) => {
    setChangeLogToDelete(changeLog);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!changeLogToDelete) return;
    
    setIsDeleting(true);
    try {
      await handleDelete(changeLogToDelete.id);
      setIsDeleteDialogOpen(false);
      setChangeLogToDelete(null);
    } catch (error) {
      console.error('Failed to delete change log:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Change Log</h1>
          <p className="text-muted-foreground">
            Track platform updates and new features ({stats.totalLogs} changes)
          </p>
        </div>
        <Button
          onClick={handleAddChangeLog}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Change Log
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <History className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Updates</p>
              <p className="text-xl font-bold text-foreground">{stats.totalLogs}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Update</p>
              <p className="text-xl font-bold text-foreground">
                {changeLogs.length > 0 
                  ? new Date(changeLogs[0].createdAt).toLocaleDateString() 
                  : 'No updates yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="w-full md:w-1/2">
          <SearchAndFilter
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search change logs..."
            
            filterValue=""
            onFilter={() => {}}
            filterOptions={[]}
            filterPlaceholder=""
            showFilter={false}
          />
        </div>
      </div>

      {/* Change Logs Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading change logs...
        </div>
      ) : (
        <ChangeLogsTable 
          changeLogs={filteredLogs}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Add Change Log Modal */}
      <AddChangeLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleChangeLogCreated}
      />

      {/* Edit Change Log Modal */}
      <EditChangeLogModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setChangeLogToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        changeLogToEdit={changeLogToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setChangeLogToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={changeLogToDelete?.name || ''}
        itemType="Change Log"
        isLoading={isDeleting}
      />
      </div>
    </ProtectedRoute>
  );
}


