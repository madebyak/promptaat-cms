import { getUsers } from './users';
import { getCategories } from './categories';
import { getMedia } from './media';
import { getPosts } from './posts';

// Dashboard overview data
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalCategories: number;
  totalMedia: number;
  recentUsers: number;
  recentPosts: number;
  publishedPosts: number;
  draftPosts: number;
  mediaStorage: number;
}

export interface RecentActivity {
  id: string;
  type: 'user' | 'post' | 'media' | 'category';
  action: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface QuickStat {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: string;
}

// Get dashboard statistics
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [users, posts, categories, media] = await Promise.all([
      getUsers(),
      getPosts(),
      getCategories(),
      getMedia()
    ]);

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const recentUsers = users.filter(user => user.lastLogin && user.lastLogin >= sevenDaysAgoStr).length;
    const recentPosts = posts.filter(post => post.date && post.date >= sevenDaysAgoStr).length;

    const publishedPosts = posts.filter(post => post.status === 'Published').length;
    const draftPosts = posts.filter(post => post.status === 'Draft').length;

    const mediaStorage = media.reduce((total, item) => total + item.size, 0);

    // Count nested categories
    const countCategories = (cats: unknown[]): number => {
      return cats.reduce((count: number, cat) => {
        const category = cat as { children?: unknown[] };
        return count + 1 + (category.children ? countCategories(category.children) : 0);
      }, 0);
    };

    return {
      totalUsers: users.length,
      totalPosts: posts.length,
      totalCategories: countCategories(categories),
      totalMedia: media.length,
      recentUsers,
      recentPosts,
      publishedPosts,
      draftPosts,
      mediaStorage
    };
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return {
      totalUsers: 0,
      totalPosts: 0,
      totalCategories: 0,
      totalMedia: 0,
      recentUsers: 0,
      recentPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      mediaStorage: 0
    };
  }
}

// Get recent activity
export async function getRecentActivity(): Promise<RecentActivity[]> {
  // TODO: In a real app, this would come from an activity log table
  // For now, we'll generate mock recent activity based on existing data
  
  const activities: RecentActivity[] = [
    {
      id: '1',
      type: 'post',
      action: 'published',
      description: 'New blog post "Getting Started with React" was published',
      timestamp: '2024-01-15T10:30:00Z',
      user: 'John Doe'
    },
    {
      id: '2',
      type: 'user',
      action: 'registered',
      description: 'New user "jane.smith@example.com" registered',
      timestamp: '2024-01-15T09:15:00Z',
      user: 'System'
    },
    {
      id: '3',
      type: 'media',
      action: 'uploaded',
      description: 'Image "hero-banner.jpg" was uploaded',
      timestamp: '2024-01-15T08:45:00Z',
      user: 'Sarah Wilson'
    },
    {
      id: '4',
      type: 'category',
      action: 'created',
      description: 'New category "Tutorials" was created',
      timestamp: '2024-01-14T16:20:00Z',
      user: 'John Doe'
    },
    {
      id: '5',
      type: 'post',
      action: 'updated',
      description: 'Blog post "Advanced CSS Techniques" was updated',
      timestamp: '2024-01-14T14:10:00Z',
      user: 'Sarah Wilson'
    },
    {
      id: '6',
      type: 'user',
      action: 'login',
      description: 'User "mike.johnson@example.com" logged in',
      timestamp: '2024-01-14T12:30:00Z',
      user: 'Mike Johnson'
    },
    {
      id: '7',
      type: 'media',
      action: 'deleted',
      description: 'Image "old-banner.jpg" was deleted',
      timestamp: '2024-01-14T11:15:00Z',
      user: 'Admin'
    },
    {
      id: '8',
      type: 'post',
      action: 'drafted',
      description: 'New draft "JavaScript Best Practices" was created',
      timestamp: '2024-01-13T15:45:00Z',
      user: 'John Doe'
    }
  ];

  return activities;
}

// Get quick stats for cards
export async function getQuickStats(): Promise<QuickStat[]> {
  const stats = await getDashboardStats();
  
  return [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      trend: 'up',
      icon: '👥'
    },
    {
      title: 'Published Posts',
      value: stats.publishedPosts,
      change: '+8%',
      trend: 'up',
      icon: '📝'
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      change: '+2%',
      trend: 'up',
      icon: '📂'
    },
    {
      title: 'Media Files',
      value: stats.totalMedia,
      change: '+15%',
      trend: 'up',
      icon: '🖼️'
    },
    {
      title: 'Draft Posts',
      value: stats.draftPosts,
      change: '-5%',
      trend: 'down',
      icon: '📄'
    },
    {
      title: 'Active This Week',
      value: stats.recentUsers,
      change: '+18%',
      trend: 'up',
      icon: '⚡'
    }
  ];
}

// Format file size for media storage
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format relative time
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return time.toLocaleDateString();
}