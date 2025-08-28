'use client'

import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivityComponent } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { TestConnection } from '@/components/test-connection';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { 
  getQuickStats, 
  getRecentActivity, 
  getDashboardStats,
  QuickStat,
  RecentActivity,
  DashboardStats,
  formatBytes
} from '@/lib/data/dashboard';

export default function Dashboard() {
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [stats, activity, overview] = await Promise.all([
          getQuickStats(),
          getRecentActivity(),
          getDashboardStats()
        ]);
        
        setQuickStats(stats);
        setRecentActivity(activity);
        setDashboardStats(overview);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your CMS.
        </p>
      </div>

      {/* Supabase Connection Test */}
      <div className="mb-8">
        <TestConnection />
      </div>

      {/* Quick Stats Cards */}
      <StatsCards stats={quickStats} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <OverviewChart />
        </div>

        {/* Quick Actions - Takes 1 column */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <RecentActivityComponent activities={recentActivity} loading={loading} />

        {/* System Overview */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">System Overview</h2>
          
          {loading || !dashboardStats ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Content</span>
                <span className="text-lg font-semibold text-foreground">
                  {dashboardStats.totalPosts + dashboardStats.totalMedia + dashboardStats.totalCategories}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Published Posts</span>
                <span className="text-lg font-semibold text-green-600">
                  {dashboardStats.publishedPosts}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Draft Posts</span>
                <span className="text-lg font-semibold text-orange-600">
                  {dashboardStats.draftPosts}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Storage Used</span>
                <span className="text-lg font-semibold text-blue-600">
                  {formatBytes(dashboardStats.mediaStorage)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Users (7d)</span>
                <span className="text-lg font-semibold text-purple-600">
                  {dashboardStats.recentUsers}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          CMS Dashboard v1.0
        </p>
      </div>
      </div>
    </ProtectedRoute>
  );
}
