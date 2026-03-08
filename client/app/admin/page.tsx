'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminAnalytics } from '@/components/admin-analytics';
import { API_URL, getAuthHeaders, getSessionUser, withApiBase } from '@/lib/api';

type AdminTab = 'overview' | 'add' | 'orders' | 'analytics' | 'settings';

const items: { key: AdminTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'add', label: 'Add Product' },
  { key: 'orders', label: 'Orders' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'settings', label: 'Settings' }
];

type Order = {
  _id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  transactionId?: string;
  paymentScreenshot: string;
  amount?: number;
  userId?: { name?: string; email?: string };
  productId?: { title?: string };
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    thumbnail: '',
    type: 'course',
    telegramLink: ''
  });
  const [status, setStatus] = useState('');
  const router = useRouter();

  async function loadOrders() {
    const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  }

  async function reviewOrder(id: string, status: 'Approved' | 'Rejected') {
    await fetch(`${API_URL}/orders/${id}/review`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    await loadOrders();
  }

  async function createProduct() {
    if (!form.title || !form.description || !form.price || !form.telegramLink) {
      setStatus('Please fill title, description, price and telegram link.');
      return;
    }

    setStatus('Creating product...');
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        ...form,
        price: Number(form.price)
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.message || 'Failed to create product');
      return;
    }

    setStatus('Product created successfully.');
    setForm({ title: '', description: '', price: '', thumbnail: '', type: 'course', telegramLink: '' });
    setActiveTab('overview');
  }

  useEffect(() => {
    const sync = () => {
      const session = getSessionUser();
      const ok = !!session && session.role === 'admin';
      setIsAdmin(ok);
      if (ok) loadOrders();
      else setOrders([]);
    };

    sync();
    window.addEventListener('session-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('session-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const summary = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const approved = orders.filter((o) => o.status === 'Approved').length;
    const rejected = orders.filter((o) => o.status === 'Rejected').length;
    const revenue = orders
      .filter((o) => o.status === 'Approved')
      .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    return { pending, approved, rejected, revenue };
  }, [orders]);

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-heading text-3xl">Admin Access Required</h1>
        <p className="mt-3 text-slate-500">Please login from the dedicated admin login page.</p>
        <Link href="/admin-login" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-white">Go to Admin Login</Link>
        <button onClick={() => router.push('/')} className="mt-3 block rounded-xl border px-5 py-3 text-sm">Back to Home</button>
      </main>
    );
  }

  return (
    <main className="grid min-h-[80vh] grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="border-r p-6">
        <h2 className="font-heading text-xl">Admin Dashboard</h2>
        <ul className="mt-6 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.key}>
              <button
                onClick={() => setActiveTab(i.key)}
                className={`w-full rounded-lg px-3 py-2 text-left transition ${activeTab === i.key ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="space-y-8 p-8">
        {activeTab === 'overview' ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Total Orders</p><p className="mt-1 text-2xl font-bold">{orders.length}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Pending</p><p className="mt-1 text-2xl font-bold text-amber-600">{summary.pending}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Approved</p><p className="mt-1 text-2xl font-bold text-green-600">{summary.approved}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Revenue</p><p className="mt-1 text-2xl font-bold">₹{summary.revenue}</p></div>
          </div>
        ) : null}

        {activeTab === 'add' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Add Product</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} className="rounded-xl border p-3" placeholder="Title" />
              <input value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} className="rounded-xl border p-3" placeholder="Price" />
              <input value={form.thumbnail} onChange={(e) => setForm((s) => ({ ...s, thumbnail: e.target.value }))} className="rounded-xl border p-3" placeholder="Thumbnail URL" />
              <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))} className="rounded-xl border p-3"><option>course</option><option>ebook</option><option>test</option></select>
              <input value={form.telegramLink} onChange={(e) => setForm((s) => ({ ...s, telegramLink: e.target.value }))} className="rounded-xl border p-3 md:col-span-2" placeholder="Telegram invite link" />
              <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} className="rounded-xl border p-3 md:col-span-2" placeholder="Description" />
              <button onClick={createProduct} className="rounded-xl bg-primary px-5 py-3 text-white md:col-span-2">Create Product</button>
              {status ? <p className="text-sm text-slate-500 md:col-span-2">{status}</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'orders' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Orders Management</h3>
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <div key={o._id} className="rounded-xl border p-4">
                  <p className="text-sm"><b>Order:</b> {o._id}</p>
                  <p className="text-sm"><b>User:</b> {o.userId?.name || 'Unknown'} ({o.userId?.email || 'N/A'})</p>
                  <p className="text-sm"><b>Product:</b> {o.productId?.title || 'N/A'}</p>
                  <p className="text-sm"><b>Txn:</b> {o.transactionId || 'N/A'}</p>
                  <p className="text-sm"><b>Status:</b> {o.status}</p>
                  <a href={withApiBase(o.paymentScreenshot)} target="_blank" className="text-sm text-primary underline" rel="noreferrer">View payment screenshot</a>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => reviewOrder(o._id, 'Approved')} className="rounded-lg bg-green-600 px-3 py-2 text-white">Approve</button>
                    <button onClick={() => reviewOrder(o._id, 'Rejected')} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reject</button>
                  </div>
                </div>
              ))}
              {!orders.length ? <p className="text-sm text-slate-500">No orders found.</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'analytics' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Analytics</h3>
            <div className="mt-4"><AdminAnalytics /></div>
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Settings</h3>
            <p className="mt-3 text-sm text-slate-500">Admin settings panel is ready for future configuration options.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
