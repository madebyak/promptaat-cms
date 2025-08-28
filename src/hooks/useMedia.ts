'use client'

import { useState, useEffect, useMemo } from 'react';
import { Media, MediaFilters } from '@/types/media';
import { getMedia, deleteMedia, updateMedia, uploadMedia } from '@/lib/data/media';

// Hook for media filtering and searching
export function useFilteredMedia(
  media: Media[], 
  searchQuery: string, 
  typeFilter: string, 
  visibilityFilter: string
) {
  return useMemo(() => {
    return media.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.alt && item.alt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesType = typeFilter === '' || item.type === typeFilter;
      const matchesVisibility = visibilityFilter === '' || item.isPublic.toString() === visibilityFilter;
      
      return matchesSearch && matchesType && matchesVisibility;
    });
  }, [media, searchQuery, typeFilter, visibilityFilter]);
}

// Main media hook
export function useMedia(initialFilters?: MediaFilters) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadMedia = async (filters?: MediaFilters) => {
    try {
      setLoading(true);
      const data = await getMedia(filters);
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(initialFilters);
  }, []);

  const handleDelete = async (mediaId: number) => {
    try {
      const success = await deleteMedia(mediaId);
      if (success) {
        setMedia(prev => prev.filter(item => item.id !== mediaId));
      } else {
        throw new Error('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media. Please try again.');
    }
  };

  const handleUpdate = async (mediaId: number, updates: Partial<Media>) => {
    try {
      const updatedMedia = await updateMedia(mediaId, updates);
      if (updatedMedia) {
        setMedia(prev => prev.map(item => 
          item.id === mediaId ? updatedMedia : item
        ));
        return updatedMedia;
      } else {
        throw new Error('Failed to update media');
      }
    } catch (error) {
      console.error('Error updating media:', error);
      alert('Failed to update media. Please try again.');
      return null;
    }
  };

  const handleUpload = async (files: FileList, metadata?: Partial<Media>, bucketName: string = 'tool-images') => {
    console.log('📤 useMedia: Starting upload process for', files.length, 'files');
    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(async (file, index) => {
        console.log(`📤 useMedia: Processing file ${index + 1}/${files.length}:`, file.name);
        try {
          const result = await uploadMedia(file, metadata || {}, bucketName);
          console.log(`✅ useMedia: File ${index + 1} uploaded successfully`);
          return result;
        } catch (fileError) {
          console.error(`❌ useMedia: File ${index + 1} failed:`, fileError);
          throw fileError;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setMedia(prev => [...uploadedFiles, ...prev]);
      console.log('✅ useMedia: All uploads completed successfully');
      
      // Show success message
      alert(`Successfully uploaded ${uploadedFiles.length} file(s) to ${bucketName}`);
      return uploadedFiles;
    } catch (error) {
      console.error('💥 useMedia: Upload process failed:', error);
      
      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Upload failed: ${errorMessage}\n\nPlease check the console for more details.`);
      return [];
    } finally {
      setUploading(false);
      console.log('📤 useMedia: Upload process finished');
    }
  };

  const stats = useMemo(() => {
    const totalSize = media.reduce((sum, item) => sum + item.size, 0);
    const typeCount = media.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const publicCount = media.filter(item => item.isPublic).length;
    const privateCount = media.length - publicCount;

    return {
      totalFiles: media.length,
      totalSize,
      publicCount,
      privateCount,
      typeCount
    };
  }, [media]);

  return {
    media,
    loading,
    uploading,
    handleDelete,
    handleUpdate,
    handleUpload,
    loadMedia,
    stats
  };
}