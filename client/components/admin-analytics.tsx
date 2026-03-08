'use client';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function AdminAnalytics() {
  const data = {
    labels: ['Users', 'Orders', 'Revenue(k)', 'Top Sales'],
    datasets: [{ label: 'Platform Metrics', data: [2500, 980, 420, 86], backgroundColor: ['#6366F1', '#8B5CF6', '#06B6D4', '#22C55E'] }]
  };
  return <Bar data={data} />;
}
