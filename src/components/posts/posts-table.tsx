'use client'

import { useState } from 'react';
import { Post } from '@/types/post';
import { StatusBadge } from '@/components/ui/status-badge';
import { PostActions } from './post-actions';
import { deletePost } from '@/lib/data/posts';

interface PostsTableProps {
  posts: Post[];
}

interface TableHeaderProps {
  children: React.ReactNode;
}

function TableHeader({ children }: TableHeaderProps) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
      {children}
    </th>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
}

function TableCell({ children, className = '' }: TableCellProps) {
  return (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`}>
      {children}
    </td>
  );
}

export function PostsTable({ posts: initialPosts }: PostsTableProps) {
  const [posts, setPosts] = useState(initialPosts);

  const handleEdit = (post: Post) => {
    // TODO: Implement edit functionality (open modal/form)
    console.log('Edit post:', post);
    alert(`Edit functionality will be implemented for: ${post.title}`);
  };

  const handleDelete = async (postId: number) => {
    try {
      const success = await deletePost(postId);
      if (success) {
        setPosts(posts.filter(post => post.id !== postId));
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts found. Create your first post to get started.
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            <TableHeader>Title</TableHeader>
            <TableHeader>Author</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Actions</TableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-accent transition-colors">
              <TableCell>
                <div className="text-sm font-medium text-foreground">{post.title}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">{post.author}</div>
              </TableCell>
              <TableCell>
                <div className="text-sm text-muted-foreground">{post.date}</div>
              </TableCell>
              <TableCell>
                <StatusBadge status={post.status} />
              </TableCell>
              <TableCell>
                <PostActions 
                  post={post} 
                  onEdit={handleEdit} 
                  onDelete={handleDelete} 
                />
              </TableCell>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}