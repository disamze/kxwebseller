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

function isAnalyticsPayload(data: any): data is Analytics {
  return (
    data &&
    typeof data.totalUsers === 'number' &&
    typeof data.totalOrders === 'number' &&
    typeof data.approvedOrders === 'number' &&
    typeof data.revenue === 'number' &&
    Array.isArray(data.topProducts)
  );
}

export function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/users/analytics`, { headers: getAuthHeaders() })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.message || 'Failed to fetch analytics');
        if (!isAnalyticsPayload(data)) throw new Error('Invalid analytics response');
        setAnalytics(data);
        setError('');
      })
      .catch((e) => {
        setAnalytics(null);
        setError(e?.message || 'Unable to load analytics right now.');
      });
  }, []);

  if (!analytics) {
    return <p className="text-sm text-slate-500">{error || 'Unable to load analytics right now.'}</p>;
  }

  const topLabels = analytics.topProducts.length ? analytics.topProducts.map((p) => p.title) : ['No data'];
  const topValues = analytics.topProducts.length ? analytics.topProducts.map((p) => p.purchases) : [0];

  const data = {
    labels: ['Users', 'Orders', 'Approved Orders', 'Revenue'],
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
