'use client';

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { API_URL, getAuthHeaders } from '@/lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Analytics = {
  totalUsers: number;
  totalOrders: number;
  approvedOrders: number;
  revenue: number;
  topProducts: { title: string; purchases: number }[];
};

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/users/analytics`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setAnalytics(d))
      .catch(() => setAnalytics(null));
  }, []);

  if (!analytics) {
    return <p className="text-sm text-slate-500">Unable to load analytics right now.</p>;
  }

  const topLabels = analytics.topProducts.length ? analytics.topProducts.map((p) => p.title) : ['No data'];
  const topValues = analytics.topProducts.length ? analytics.topProducts.map((p) => p.purchases) : [0];

  const data = {
    labels: ['Users', 'Orders', 'Approved Orders', 'Revenue'] as string[],
    datasets: [{
      label: 'Platform Metrics',
      data: [analytics.totalUsers, analytics.totalOrders, analytics.approvedOrders, analytics.revenue],
      backgroundColor: ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E']
    }]
  };

  const topData = {
    labels: topLabels,
    datasets: [{ label: 'Top Selling Products', data: topValues, backgroundColor: '#6366F1' }]
  };

  return (
    <div className="space-y-6">
      <Bar data={data} />
      <Bar data={topData} />
    </div>
  );
}
