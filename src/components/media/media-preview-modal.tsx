'use client'

import { Media } from '@/types/media';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/data/media';

interface MediaPreviewModalProps {
  media: Media | null;
  onClose: () => void;
}

export function MediaPreviewModal({ media, onClose }: MediaPreviewModalProps) {
  if (!media) return null;

  const renderPreview = () => {
    switch (media.type) {
      case 'image':
        return (
          <img
            src={media.url}
            alt={media.alt || media.filename}
            className="max-w-full max-h-[60vh] object-contain mx-auto"
          />
        );
      case 'video':
        return (
          <video
            src={media.url}
            controls
            className="max-w-full max-h-[60vh] mx-auto"
          />
        );
      case 'audio':
        return <audio src={media.url} controls className="w-full" />;
      default:
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-lg font-medium">{media.originalName}</p>
            <p className="text-muted-foreground">{media.mimeType}</p>
            <p className="text-muted-foreground">{formatFileSize(media.size)}</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{media.originalName}</h3>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="p-4">
          {renderPreview()}
          
          {media.caption && (
            <div className="mt-4 p-3 bg-muted rounded">
              <p className="text-sm">{media.caption}</p>
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>File Size:</strong> {formatFileSize(media.size)}
            </div>
            <div>
              <strong>Type:</strong> {media.mimeType}
            </div>
            <div>
              <strong>Uploaded:</strong> {media.uploadedAt}
            </div>
            <div>
              <strong>Visibility:</strong> {media.isPublic ? 'Public' : 'Private'}
            </div>
            {media.width && media.height && (
              <div>
                <strong>Dimensions:</strong> {media.width} × {media.height}
              </div>
            )}
            {media.duration && (
              <div>
                <strong>Duration:</strong> {Math.floor(media.duration / 60)}:{(media.duration % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
          
          {media.tags && media.tags.length > 0 && (
            <div className="mt-4">
              <strong className="text-sm">Tags:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {media.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}