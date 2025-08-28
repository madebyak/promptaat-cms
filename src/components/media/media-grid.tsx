'use client'

import { Media } from '@/types/media';
import { MediaCard } from './media-card';

interface MediaGridProps {
  media: Media[];
  loading: boolean;
  onEdit: (media: Media) => void;
  onDelete: (mediaId: number) => void;
  onPreview: (media: Media) => void;
}

export function MediaGrid({ media, loading, onEdit, onDelete, onPreview }: MediaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-background border border-border rounded-lg overflow-hidden">
            <div className="w-full h-48 bg-muted animate-pulse"></div>
            <div className="p-4">
              <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-1/2 mb-3"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📁</div>
        <h3 className="text-lg font-medium text-foreground mb-2">No media files found</h3>
        <p className="text-muted-foreground">
          Upload some files to get started, or adjust your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {media.map((item) => (
        <MediaCard
          key={item.id}
          media={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
}