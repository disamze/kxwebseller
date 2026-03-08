export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const ADMIN_EMAIL = 'kxsam@admin';
const ADMIN_PASSWORD = 'collab@kxsam';

export function getAuthToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('firebaseToken') || '';
}

export function getSessionUser() {
  if (typeof window === 'undefined') return null;
  const email = localStorage.getItem('kx_user_email');
  if (!email) return null;
  return {
    email,
    name: localStorage.getItem('kx_user_name') || 'KX User',
    role: localStorage.getItem('kx_user_role') || 'user'
  };
}

export function setSessionUser(user: { email: string; name: string; role?: 'user' | 'admin' }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('kx_user_email', user.email);
  localStorage.setItem('kx_user_name', user.name);
  localStorage.setItem('kx_user_role', user.role || 'user');
  window.dispatchEvent(new Event('session-changed'));
}

export function tryAdminLogin(email: string, password: string) {
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return false;
  setSessionUser({ email, name: 'KX Admin', role: 'admin' });
  localStorage.setItem('kx_admin_secret', ADMIN_PASSWORD);
  return true;
}

export function clearSessionUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('kx_user_email');
  localStorage.removeItem('kx_user_name');
  localStorage.removeItem('kx_user_role');
  localStorage.removeItem('kx_admin_secret');
  localStorage.removeItem('firebaseToken');
  window.dispatchEvent(new Event('session-changed'));
}

export function getAuthHeaders(extra: Record<string, string> = {}) {
  const token = getAuthToken();
  if (token) return { Authorization: `Bearer ${token}`, ...extra };

  const session = getSessionUser();
  if (!session) return extra;

  const headers: Record<string, string> = {
    'x-user-email': session.email,
    'x-user-name': session.name,
    'x-user-role': session.role,
    ...extra
  };

  if (session.role === 'admin' && typeof window !== 'undefined') {
    const adminSecret = localStorage.getItem('kx_admin_secret');
    if (adminSecret) headers['x-admin-secret'] = adminSecret;
  }

  return headers;
}

export function withApiBase(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL.replace('/api', '')}${url}`;
}
