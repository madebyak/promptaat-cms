'use client'

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  posts: number;
  users: number;
  media: number;
}

export function OverviewChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading chart data
    const loadChartData = () => {
      const data: ChartData[] = [
        { name: 'Jan', posts: 12, users: 8, media: 15 },
        { name: 'Feb', posts: 19, users: 12, media: 22 },
        { name: 'Mar', posts: 15, users: 10, media: 18 },
        { name: 'Apr', posts: 25, users: 16, media: 28 },
        { name: 'May', posts: 22, users: 14, media: 25 },
        { name: 'Jun', posts: 30, users: 20, media: 35 },
      ];
      
      setChartData(data);
      setLoading(false);
    };

    const timer = setTimeout(loadChartData, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-background border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Content Overview</h2>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Content Overview</h2>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '6px',
                color: '#F9FAFB'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="posts" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Posts"
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Users"
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="media" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Media"
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-muted-foreground">Posts</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-muted-foreground">Users</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-muted-foreground">Media</span>
        </div>
      </div>
    </div>
  );
}