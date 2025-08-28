'use client'

import { useState } from 'react';
import { Media } from '@/types/media';
import { formatFileSize, getFileTypeIcon } from '@/lib/data/media';
import { Button } from '@/components/ui/button';
import { Eye, Download, Edit, Trash2, ExternalLink } from 'lucide-react';

interface MediaCardProps {
  media: Media;
  onEdit: (media: Media) => void;
  onDelete: (mediaId: number) => void;
  onPreview: (media: Media) => void;
}

export function MediaCard({ media, onEdit, onDelete, onPreview }: MediaCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleDownload = () => {
    // In a real app, this would trigger a proper download
    const link = document.createElement('a');
    link.href = media.url;
    link.download = media.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (media.type === 'image' && !imageError) {
      return (
        <img
          src={media.thumbnailUrl || media.url}
          alt={media.alt || media.filename}
          className="w-full h-48 object-cover"
          onError={() => setImageError(true)}
        />
      );
    } else if (media.type === 'video') {
      return (
        <div className="w-full h-48 bg-muted flex items-center justify-center relative">
          {media.thumbnailUrl ? (
            <img
              src={media.thumbnailUrl}
              alt={media.alt || media.filename}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">🎥</div>
          )}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
            {media.duration ? `${Math.floor(media.duration / 60)}:${(media.duration % 60).toString().padStart(2, '0')}` : 'Video'}
          </div>
        </div>
      );
    } else {
      return (
        <div className="w-full h-48 bg-muted flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">{getFileTypeIcon(media.mimeType)}</div>
          <p className="text-sm text-muted-foreground text-center px-2">
            {media.mimeType}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden group hover:shadow-lg transition-shadow">
      {/* Preview Area */}
      <div className="relative cursor-pointer" onClick={() => onPreview(media)}>
        {renderPreview()}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="secondary" className="bg-white text-black hover:bg-gray-100">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>

        {/* Status badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {!media.isPublic && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
              Private
            </span>
          )}
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded capitalize">
            {media.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-medium text-foreground truncate" title={media.originalName}>
            {media.originalName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(media.size)}
          </p>
        </div>

        {media.caption && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {media.caption}
          </p>
        )}

        {media.tags && media.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {media.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded"
                >
                  {tag}
                </span>
              ))}
              {media.tags.length > 3 && (
                <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded">
                  +{media.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground mb-3">
          Uploaded: {media.uploadedAt}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPreview(media)}
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            {media.type === 'image' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => window.open(media.url, '_blank')}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(media)}
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(media.id)}
              title="Delete"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}