'use client'

import { RecentActivity, formatRelativeTime } from '@/lib/data/dashboard';

interface RecentActivityProps {
  activities: RecentActivity[];
  loading?: boolean;
}

export function RecentActivityComponent({ activities, loading = false }: RecentActivityProps) {
  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'post':
        return action === 'published' ? '📢' : action === 'updated' ? '✏️' : '📝';
      case 'user':
        return action === 'registered' ? '👋' : '🔑';
      case 'media':
        return action === 'uploaded' ? '📤' : '🗑️';
      case 'category':
        return '📂';
      default:
        return '📋';
    }
  };

  const getActivityColor = (type: string, action: string) => {
    switch (type) {
      case 'post':
        return 'text-blue-600';
      case 'user':
        return 'text-green-600';
      case 'media':
        return action === 'uploaded' ? 'text-purple-600' : 'text-red-600';
      case 'category':
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start space-x-3 animate-pulse">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Recent Activity</h2>
      
      {activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-muted-foreground">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
              <div className={`text-2xl ${getActivityColor(activity.type, activity.action)}`}>
                {getActivityIcon(activity.type, activity.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground mb-1">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span>{formatRelativeTime(activity.timestamp)}</span>
                  {activity.user && (
                    <>
                      <span>•</span>
                      <span>by {activity.user}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-border">
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          View all activity →
        </button>
      </div>
    </div>
  );
}