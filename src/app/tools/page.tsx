'use client'

import { useState } from 'react';
import { ToolsTable } from '@/components/tools/tools-table';
import { AddToolModal } from '@/components/tools/add-tool-modal';
import { EditToolModal } from '@/components/tools/edit-tool-modal';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { useTools, useFilteredTools } from '@/hooks/useTools';
import { Tool } from '@/types/tool';
import { fixDuplicateToolSortOrders } from '@/lib/data/tools';
import { Plus, Wrench, Link, Image, GripVertical, RefreshCw } from 'lucide-react';

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFixingSortOrders, setIsFixingSortOrders] = useState(false);
  const [toolToEdit, setToolToEdit] = useState<Tool | null>(null);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { tools, loading, stats, refreshTools, handleReorder, handleDelete } = useTools();
  const filteredTools = useFilteredTools(tools, searchQuery, statusFilter);

  const handleAddTool = () => {
    setIsAddModalOpen(true);
  };

  const handleToolCreated = (newTool: Tool) => {
    // Refresh tools list
    refreshTools();
    setIsAddModalOpen(false);
  };

  const handleEdit = (tool: Tool) => {
    setToolToEdit(tool);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedTool: Tool) => {
    refreshTools();
    setIsEditModalOpen(false);
    setToolToEdit(null);
  };

  const handleDeleteClick = (tool: Tool) => {
    setToolToDelete(tool);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!toolToDelete) return;
    
    setIsDeleting(true);
    try {
      await handleDelete(toolToDelete.id);
      setIsDeleteDialogOpen(false);
      setToolToDelete(null);
    } catch (error) {
      console.error('Failed to delete tool:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFixSortOrders = async () => {
    setIsFixingSortOrders(true);
    try {
      const success = await fixDuplicateToolSortOrders();
      if (success) {
        await refreshTools();
        alert('Tool sort orders have been fixed successfully!');
      } else {
        alert('Failed to fix tool sort orders. Please try again.');
      }
    } catch (error) {
      console.error('Error fixing tool sort orders:', error);
      alert('Failed to fix tool sort orders. Please try again.');
    } finally {
      setIsFixingSortOrders(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Tools</h1>
          <p className="text-muted-foreground">
            Manage AI tools and their display order ({stats.totalTools} tools)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleFixSortOrders}
            variant="outline"
            disabled={isFixingSortOrders}
            className="text-orange-600 border-orange-600 hover:bg-orange-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFixingSortOrders ? 'animate-spin' : ''}`} />
            {isFixingSortOrders ? 'Fixing...' : 'Fix Sort Orders'}
          </Button>
          <Button
            onClick={handleAddTool}
            className="text-white"
            style={{backgroundColor: '#A2AADB'}}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Tool
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Tools</p>
              <p className="text-xl font-bold text-foreground">{stats.totalTools}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Link className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">With Website</p>
              <p className="text-xl font-bold text-foreground">{stats.withWebsite}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Image className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">With Images</p>
              <p className="text-xl font-bold text-foreground">{stats.withImage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          placeholder="Search tools by name or website..."
          value={searchQuery}
          onSearch={setSearchQuery}
        />
      </div>

      {/* Tools Table */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading tools...
        </div>
      ) : (
        <div>
          <div className="mb-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <GripVertical className="h-4 w-4" />
              Drag and drop items to reorder them
            </span>
          </div>
          <ToolsTable 
            tools={filteredTools} 
            onReorder={handleReorder}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        </div>
      )}

      {/* Add Tool Modal */}
      <AddToolModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleToolCreated}
        tools={tools}
      />

      {/* Edit Tool Modal */}
      <EditToolModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setToolToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        toolToEdit={toolToEdit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setToolToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={toolToDelete?.name || ''}
        itemType="Tool"
        isLoading={isDeleting}
      />
    </div>
  );
}
