'use client'

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Post } from '@/types/post';

interface PostActionsProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
}

export function PostActions({ post, onEdit, onDelete }: PostActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    onEdit?.(post);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete?.(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleEdit}
        className="p-1 text-muted-foreground hover:text-blue-600 transition-colors"
        title="Edit post"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
        title="Delete post"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}