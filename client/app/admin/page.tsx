'use client';

import { useEffect, useState } from 'react';
import { AdminAnalytics } from '@/components/admin-analytics';
import Link from 'next/link';
import { API_URL, getAuthHeaders, getSessionUser, withApiBase } from '@/lib/api';

const items = ['Overview', 'Add Course', 'Add Ebook', 'Add Test Series', 'Manage Products', 'Orders', 'Users', 'Analytics', 'Settings'];

type Order = {
  _id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  transactionId?: string;
  paymentScreenshot: string;
  userId?: { name?: string; email?: string };
  productId?: { title?: string };
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    const session = getSessionUser();
    if (!session || session.role !== 'admin') return;
    setIsAdmin(true);
    loadOrders();
  }, []);


  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-heading text-3xl">Admin Access Required</h1>
        <p className="mt-3 text-slate-500">Please login from the dedicated admin login page.</p>
        <Link href="/admin-login" className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-white">Go to Admin Login</Link>
      </main>
    );
  }

  return (
    <main className="grid min-h-[80vh] grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="border-r p-6">
        <h2 className="font-heading text-xl">Admin Dashboard</h2>
        <ul className="mt-6 space-y-3 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul>
      </aside>
      <section className="space-y-8 p-8">
        <div className="rounded-2xl border p-5">
          <h3 className="font-heading text-xl">Add Product</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input className="rounded-xl border p-3" placeholder="Title" />
            <input className="rounded-xl border p-3" placeholder="Price" />
            <input className="rounded-xl border p-3" placeholder="Thumbnail URL" />
            <select className="rounded-xl border p-3"><option>course</option><option>ebook</option><option>test</option></select>
            <input className="rounded-xl border p-3 md:col-span-2" placeholder="Telegram invite link" />
            <textarea className="rounded-xl border p-3 md:col-span-2" placeholder="Description" />
            <button className="rounded-xl bg-primary px-5 py-3 text-white md:col-span-2">Create Product</button>
          </div>
        </div>

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
                <a href={withApiBase(o.paymentScreenshot)} target="_blank" className="text-sm text-primary underline" rel="noreferrer">
                  View payment screenshot
                </a>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => reviewOrder(o._id, 'Approved')} className="rounded-lg bg-green-600 px-3 py-2 text-white">Approve</button>
                  <button onClick={() => reviewOrder(o._id, 'Rejected')} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reject</button>
                </div>
              </div>
            ))}
            {!orders.length ? <p className="text-sm text-slate-500">No orders found.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border p-5">
          <h3 className="font-heading text-xl">Analytics</h3>
          <div className="mt-4"><AdminAnalytics /></div>
        </div>
      </section>
    </main>
  );
}
