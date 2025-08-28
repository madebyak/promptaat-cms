'use client'

import { formatFileSize } from '@/lib/data/media';

interface MediaStatsProps {
  totalFiles: number;
  totalSize: number;
}

export function MediaStats({ totalFiles, totalSize }: MediaStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-background border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Total Files</h3>
        <p className="text-2xl font-bold text-foreground">{totalFiles}</p>
      </div>
      <div className="bg-background border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground">Storage Used</h3>
        <p className="text-2xl font-bold text-foreground">{formatFileSize(totalSize)}</p>
      </div>
    </div>
  );
}