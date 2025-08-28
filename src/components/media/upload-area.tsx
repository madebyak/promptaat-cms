'use client'

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';

interface UploadAreaProps {
  onUpload: (files: FileList, metadata?: Record<string, unknown>, bucketName?: string) => Promise<unknown>;
  uploading: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // in MB
  bucketName?: string; // Which Supabase bucket to upload to
}

export function UploadArea({ 
  onUpload, 
  uploading, 
  accept = "image/*,video/*,audio/*,.pdf,.doc,.docx,.txt",
  maxFiles = 10,
  maxSize = 10,
  bucketName = 'tool-images'
}: UploadAreaProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (fileArray.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once.`);
      return;
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`Some files are larger than ${maxSize}MB. Please choose smaller files.`);
      return;
    }

    setSelectedFiles(fileArray);
  }, [maxFiles, maxSize]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const fileList = new DataTransfer();
    selectedFiles.forEach(file => fileList.items.add(file));

    try {
      await onUpload(fileList.files, {}, bucketName);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          multiple
          accept={accept}
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center">
          <Upload className={`h-12 w-12 mb-4 ${dragActive ? 'text-blue-500' : 'text-muted-foreground'}`} />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {dragActive ? 'Drop files here' : 'Upload media files'}
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supports images, videos, audio, and documents (max {maxSize}MB each, {maxFiles} files max)
          </p>
          
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            disabled={uploading}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-foreground mb-3">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">
                    {file.type.startsWith('image/') ? '🖼️' :
                     file.type.startsWith('video/') ? '🎥' :
                     file.type.startsWith('audio/') ? '🎵' : '📎'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="text-white"
              style={{backgroundColor: '#A2AADB'}}
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}