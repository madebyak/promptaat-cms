// Mock analytics data - replace with actual analytics service calls

// Visitor data for line chart
export async function getVisitorData() {
  // TODO: Replace with actual analytics API call
  return [
    { name: 'Jan', visitors: 4000, pageViews: 7200 },
    { name: 'Feb', visitors: 3000, pageViews: 5400 },
    { name: 'Mar', visitors: 5000, pageViews: 9000 },
    { name: 'Apr', visitors: 4500, pageViews: 8100 },
    { name: 'May', visitors: 6000, pageViews: 10800 },
    { name: 'Jun', visitors: 5500, pageViews: 9900 },
    { name: 'Jul', visitors: 7000, pageViews: 12600 },
    { name: 'Aug', visitors: 6500, pageViews: 11700 },
    { name: 'Sep', visitors: 8000, pageViews: 14400 },
    { name: 'Oct', visitors: 7500, pageViews: 13500 },
    { name: 'Nov', visitors: 9000, pageViews: 16200 },
    { name: 'Dec', visitors: 8500, pageViews: 15300 }
  ];
}

// Device usage data for pie chart
export async function getDeviceData() {
  // TODO: Replace with actual analytics API call
  return [
    { name: 'Desktop', value: 45, fill: '#A2AADB' },
    { name: 'Mobile', value: 35, fill: '#8B94C7' },
    { name: 'Tablet', value: 20, fill: '#7B84B3' }
  ];
}

// Top pages data
export async function getTopPages() {
  // TODO: Replace with actual analytics API call
  return [
    { page: '/home', views: '12,543', percentage: 85 },
    { page: '/blog', views: '8,234', percentage: 65 },
    { page: '/about', views: '6,789', percentage: 50 },
    { page: '/contact', views: '4,567', percentage: 35 },
    { page: '/services', views: '3,456', percentage: 25 },
    { page: '/portfolio', views: '2,345', percentage: 20 }
  ];
}

// Traffic sources data for bar chart
export async function getTrafficSources() {
  // TODO: Replace with actual analytics API call
  return [
    { source: 'Organic', visitors: 4500 },
    { source: 'Direct', visitors: 3200 },
    { source: 'Social', visitors: 2800 },
    { source: 'Referral', visitors: 1800 },
    { source: 'Email', visitors: 1200 },
    { source: 'Paid', visitors: 800 }
  ];
}