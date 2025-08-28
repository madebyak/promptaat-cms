export interface Media {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'document' | 'audio';
  mimeType: string;
  size: number; // in bytes
  alt?: string;
  caption?: string;
  uploadedBy: number; // user ID
  uploadedAt: string;
  isPublic: boolean;
  tags?: string[];
  width?: number; // for images/videos
  height?: number; // for images/videos
  duration?: number; // for videos/audio in seconds
}

export interface MediaUpload {
  file: File;
  alt?: string;
  caption?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface MediaFilters {
  type?: 'image' | 'video' | 'document' | 'audio' | '';
  isPublic?: boolean | '';
  uploadedBy?: number | '';
  dateRange?: {
    start: string;
    end: string;
  };
}