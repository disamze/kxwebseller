export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('firebaseToken') || '';
}

export function withApiBase(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL.replace('/api', '')}${url}`;
}
