'use client'

import { useState } from 'react';
import { Media } from '@/types/media';
import { useMedia, useFilteredMedia } from '@/hooks/useMedia';
import { Button } from '@/components/ui/button';
import { MediaGrid } from '@/components/media/media-grid';
import { UploadArea } from '@/components/media/upload-area';
import { MediaPreviewModal } from '@/components/media/media-preview-modal';
import { MediaStats } from '@/components/media/media-stats';
import { MediaFilters } from '@/components/media/media-filters';
import { formatFileSize } from '@/lib/data/media';
import { Upload } from 'lucide-react';

export default function MediaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState('tool-images');
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);

  const { media, loading, uploading, handleDelete, handleUpdate, handleUpload, stats } = useMedia();
  const filteredMedia = useFilteredMedia(media, searchQuery, typeFilter, visibilityFilter);

  const handleEdit = (mediaItem: Media) => {
    // TODO: Implement edit functionality (open modal/form)
    console.log('Edit media:', mediaItem);
    alert(`Edit functionality will be implemented for: ${mediaItem.originalName}`);
  };

  const handlePreview = (mediaItem: Media) => {
    setPreviewMedia(mediaItem);
  };

  const closePreview = () => {
    setPreviewMedia(null);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your media files and uploads ({stats.totalFiles} files, {formatFileSize(stats.totalSize)})
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(!showUpload)}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          <Upload className="h-4 w-4 mr-2" />
          {showUpload ? 'Hide Upload' : 'Upload Files'}
        </Button>
      </div>

      <MediaStats totalFiles={stats.totalFiles} totalSize={stats.totalSize} />

      {/* Upload Area */}
      {showUpload && (
        <div className="mb-8">
          <div className="bg-background border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Upload New Files</h2>
            
            {/* Bucket Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Storage Bucket:
              </label>
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="tool-images">Tool Images (Admin only)</option>
                <option value="changelog-images">Changelog Images (Admin only)</option>
                <option value="prompt-kit-images">Prompt Kit Images (Admin only)</option>
                <option value="profile-pictures">Profile Pictures (Users + Admin)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedBucket === 'profile-pictures' 
                  ? 'Profile pictures are organized by user ID folders'
                  : 'Admin-only bucket for CMS content'
                }
              </p>
            </div>

            <UploadArea
              onUpload={(files, metadata) => handleUpload(files, metadata, selectedBucket)}
              uploading={uploading}
              bucketName={selectedBucket}
              accept={selectedBucket === 'profile-pictures' ? 'image/*' : undefined}
            />
          </div>
        </div>
      )}

      <MediaFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        visibilityFilter={visibilityFilter}
        onVisibilityFilterChange={setVisibilityFilter}
      />

      {/* Media Grid */}
      <MediaGrid
        media={filteredMedia}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPreview={handlePreview}
      />

      <MediaPreviewModal media={previewMedia} onClose={closePreview} />
    </div>
  );
}