'use client'

import { PostsTable } from '@/components/posts/posts-table';
import { getPosts } from '@/lib/data/posts';
import { Button } from '@/components/ui/button';
import { SearchAndFilter } from '@/components/ui/search-and-filter';
import { FilterOption } from '@/components/ui/filter-dropdown';
import { Plus } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Post } from '@/types/post';

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handleAddPost = () => {
    // TODO: Implement add post functionality (open modal/form)
    console.log('Add new post');
    alert('Add post functionality will be implemented');
  };

  // Filter options for status dropdown
  const statusFilterOptions: FilterOption[] = [
    { value: 'Published', label: 'Published' },
    { value: 'Draft', label: 'Draft' }
  ];

  // Filtered posts based on search and filter
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === '' || post.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [posts, searchQuery, statusFilter]);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Posts
        </h1>
        <Button
          onClick={handleAddPost}
          className="text-white"
          style={{backgroundColor: '#A2AADB'}}
        >
          <Plus className="h-4 w-4" />
          Add Post
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <SearchAndFilter
          searchValue={searchQuery}
          onSearch={setSearchQuery}
          searchPlaceholder="Search posts by title or author..."
          
          filterValue={statusFilter}
          onFilter={setStatusFilter}
          filterOptions={statusFilterOptions}
          filterPlaceholder="Filter by status"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          Loading posts...
        </div>
      ) : (
        <PostsTable posts={filteredPosts} />
      )}
    </div>
  );
}