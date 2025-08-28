'use client'

import { useEffect, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  getVisitorData, 
  getDeviceData, 
  getTopPages, 
  getTrafficSources 
} from '@/lib/data/analytics';

interface VisitorData {
  name: string;
  visitors: number;
  pageViews: number;
}

interface DeviceData {
  name: string;
  value: number;
  fill: string;
}

interface PageData {
  page: string;
  views: string;
  percentage: number;
}

interface TrafficData {
  source: string;
  visitors: number;
}

export default function Analytics() {
  const [visitorData, setVisitorData] = useState<VisitorData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [topPages, setTopPages] = useState<PageData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [visitors, devices, pages, traffic] = await Promise.all([
          getVisitorData(),
          getDeviceData(),
          getTopPages(),
          getTrafficSources()
        ]);
        
        setVisitorData(visitors);
        setDeviceData(devices);
        setTopPages(pages);
        setTrafficSources(traffic);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center py-8 text-muted-foreground">
          Loading analytics...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Analytics</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Visitors</h3>
          <p className="text-2xl font-bold text-foreground">12,543</p>
          <p className="text-xs text-green-600">+12% from last month</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Page Views</h3>
          <p className="text-2xl font-bold text-foreground">34,256</p>
          <p className="text-xs text-green-600">+18% from last month</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Bounce Rate</h3>
          <p className="text-2xl font-bold text-foreground">42.3%</p>
          <p className="text-xs text-red-600">-5% from last month</p>
        </div>
        <div className="bg-background border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Avg. Session</h3>
          <p className="text-2xl font-bold text-foreground">2:34</p>
          <p className="text-xs text-green-600">+8% from last month</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Visitor Trends */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Visitor Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitorData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="#A2AADB" 
                strokeWidth={2} 
                name="Visitors"
              />
              <Line 
                type="monotone" 
                dataKey="pageViews" 
                stroke="#8B94C7" 
                strokeWidth={2} 
                name="Page Views"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Device Usage */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Device Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}%`}
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Traffic Sources */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Traffic Sources</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trafficSources}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visitors" fill="#A2AADB" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Pages */}
        <div className="bg-background border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Top Pages</h2>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{page.page}</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="h-2 rounded-full" 
                      style={{
                        width: `${page.percentage}%`,
                        backgroundColor: '#A2AADB'
                      }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-foreground">{page.views}</p>
                  <p className="text-xs text-muted-foreground">{page.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}