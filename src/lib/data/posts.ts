import { Post } from '@/types/post';

// Mock data - replace with actual database calls
export const mockPosts: Post[] = [
  { id: 1, title: "Getting Started with Next.js", author: "John Doe", date: "2024-01-15", status: "Published" },
  { id: 2, title: "Building Modern Web Apps", author: "Jane Smith", date: "2024-01-12", status: "Draft" },
  { id: 3, title: "TypeScript Best Practices", author: "Mike Johnson", date: "2024-01-10", status: "Published" },
  { id: 4, title: "Tailwind CSS Tips & Tricks", author: "Sarah Wilson", date: "2024-01-08", status: "Published" },
  { id: 5, title: "React Performance Optimization", author: "David Brown", date: "2024-01-05", status: "Draft" },
];

// Database-ready functions
export async function getPosts(): Promise<Post[]> {
  // TODO: Replace with actual database call
  // Example: return await db.posts.findMany();
  return mockPosts;
}

export async function getPostById(id: number): Promise<Post | null> {
  // TODO: Replace with actual database call
  // Example: return await db.posts.findUnique({ where: { id } });
  return mockPosts.find(post => post.id === id) || null;
}

export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  // TODO: Replace with actual database call
  // Example: return await db.posts.create({ data: post });
  const newPost = { ...post, id: Math.max(...mockPosts.map(p => p.id)) + 1 };
  mockPosts.push(newPost);
  return newPost;
}

export async function updatePost(id: number, updates: Partial<Omit<Post, 'id'>>): Promise<Post | null> {
  // TODO: Replace with actual database call
  // Example: return await db.posts.update({ where: { id }, data: updates });
  const index = mockPosts.findIndex(post => post.id === id);
  if (index === -1) return null;
  
  mockPosts[index] = { ...mockPosts[index], ...updates };
  return mockPosts[index];
}

export async function deletePost(id: number): Promise<boolean> {
  // TODO: Replace with actual database call
  // Example: await db.posts.delete({ where: { id } }); return true;
  const index = mockPosts.findIndex(post => post.id === id);
  if (index === -1) return false;
  
  mockPosts.splice(index, 1);
  return true;
}