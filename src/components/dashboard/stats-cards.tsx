'use client'

import { QuickStat } from '@/lib/data/dashboard';

interface StatsCardsProps {
  stats: QuickStat[];
  loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-background border border-border rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <div className={`flex items-center text-sm ${
              stat.trend === 'up' 
                ? 'text-green-600' 
                : stat.trend === 'down' 
                ? 'text-red-600' 
                : 'text-muted-foreground'
            }`}>
              <span className="mr-1">
                {stat.trend === 'up' ? '↗️' : stat.trend === 'down' ? '↘️' : '➡️'}
              </span>
              {stat.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}