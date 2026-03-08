'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_URL, getAuthHeaders, getSessionUser, setSessionUser } from '@/lib/api';

type Material = {
  id: string;
  title: string;
  thumbnail: string;
  type: string;
  telegramLink: string;
};

type Me = { name: string; email: string; role: string; createdAt?: string };
type Order = { _id: string; status: string; amount?: number; createdAt?: string; productId?: { title?: string; type?: string } };

type Tab = 'dashboard' | 'courses' | 'ebooks' | 'tests' | 'orders' | 'profile' | 'settings';

const menu: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'courses', label: 'My Courses' },
  { key: 'ebooks', label: 'My Ebooks' },
  { key: 'tests', label: 'My Test Series' },
  { key: 'orders', label: 'My Orders' },
  { key: 'profile', label: 'My Profile' },
  { key: 'settings', label: 'Settings' }
];

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allowed, setAllowed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [me, setMe] = useState<Me | null>(null);
  const [nameEdit, setNameEdit] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  function loadSessionData() {
    const session = getSessionUser();
    if (!session) {
      setAllowed(false);
      setMaterials([]);
      setMe(null);
      setOrders([]);
      return;
    }

    setAllowed(true);

    fetch(`${API_URL}/users/materials`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setMaterials(Array.isArray(d) ? d : []))
      .catch(() => setMaterials([]));

    fetch(`${API_URL}/orders/mine`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setOrders([]));

    fetch(`${API_URL}/users/me`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => {
        if (d?.email) {
          setMe(d);
          setNameEdit(d.name || '');
        }
      })
      .catch(() => setMe(null));
  }

  useEffect(() => {
    loadSessionData();
    window.addEventListener('session-changed', loadSessionData);
    window.addEventListener('storage', loadSessionData);
    return () => {
      window.removeEventListener('session-changed', loadSessionData);
      window.removeEventListener('storage', loadSessionData);
    };
  }, []);

  async function saveProfile() {
    setStatus('Saving profile...');
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: nameEdit })
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.message || 'Failed to update profile');
      return;
    }
    setMe(data);
    setSessionUser({ email: data.email, name: data.name, role: data.role });
    setStatus('Profile updated successfully.');
  }

  if (!allowed) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="font-heading text-3xl">Login Required</h1>
        <p className="mt-3 text-slate-500">Please login/signup from navbar to access your dashboard.</p>
        <button onClick={() => router.push('/')} className="mt-5 rounded-xl bg-primary px-5 py-3 text-white">Go to Home</button>
      </main>
    );
  }

  const courses = materials.filter((m) => m.type === 'course');
  const ebooks = materials.filter((m) => m.type === 'ebook');
  const tests = materials.filter((m) => m.type === 'test');

  const list = activeTab === 'courses' ? courses : activeTab === 'ebooks' ? ebooks : activeTab === 'tests' ? tests : materials;
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'Pending').length, [orders]);

  return (
    <main className="grid min-h-[80vh] grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="border-r p-6">
        <h2 className="font-heading text-xl">Student Dashboard</h2>
        <ul className="mt-6 space-y-2 text-sm">
          {menu.map((i) => (
            <li key={i.key}>
              <button onClick={() => setActiveTab(i.key)} className={`w-full rounded-lg px-3 py-2 text-left transition ${activeTab === i.key ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="space-y-6 p-8">
        {activeTab === 'dashboard' ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border p-5 shadow-sm">Purchased courses: {courses.length}</div>
            <div className="rounded-2xl border p-5 shadow-sm">Purchased ebooks: {ebooks.length}</div>
            <div className="rounded-2xl border p-5 shadow-sm">Purchased tests: {tests.length}</div>
            <div className="rounded-2xl border p-5 shadow-sm">Pending orders: {pendingOrders}</div>
          </div>
        ) : null}

        {activeTab === 'orders' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">My Orders</h3>
            <div className="mt-4 space-y-3">
              {orders.length ? orders.map((o) => (
                <article key={o._id} className="rounded-xl border p-4 text-sm">
                  <p><b>Order ID:</b> {o._id}</p>
                  <p><b>Product:</b> {o.productId?.title || 'N/A'}</p>
                  <p><b>Status:</b> {o.status}</p>
                  <p><b>Amount:</b> ₹{o.amount || 0}</p>
                </article>
              )) : <p className="text-sm text-slate-500">No orders yet.</p>}
            </div>
          </div>
        ) : null}

        {activeTab === 'profile' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">My Profile</h3>
            {me ? (
              <div className="mt-4 grid gap-3 md:max-w-xl">
                <label className="text-sm">Name</label>
                <input value={nameEdit} onChange={(e) => setNameEdit(e.target.value)} className="rounded-xl border p-3" />
                <label className="text-sm">Email</label>
                <input value={me.email} disabled className="rounded-xl border p-3 bg-slate-100 dark:bg-slate-800" />
                <label className="text-sm">Role</label>
                <input value={me.role} disabled className="rounded-xl border p-3 bg-slate-100 dark:bg-slate-800" />
                <button onClick={saveProfile} className="rounded-xl bg-primary px-5 py-3 text-white">Save Profile</button>
                {status ? <p className="text-sm text-slate-500">{status}</p> : null}
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">Unable to load profile.</p>}
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Settings</h3>
            <p className="mt-2 text-sm text-slate-500">Notification and privacy controls are ready for future integration.</p>
          </div>
        ) : null}

        {['courses', 'ebooks', 'tests'].includes(activeTab) ? (
          <div>
            <h3 className="font-heading text-2xl">{menu.find((m) => m.key === activeTab)?.label}</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {list.length ? list.map((item) => (
                <article key={item.id} className="rounded-2xl border p-4 shadow-sm">
                  <img src={item.thumbnail} alt={item.title} className="h-36 w-full rounded-xl object-cover" />
                  <p className="mt-3 font-semibold">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.type}</p>
                  <a href={item.telegramLink} target="_blank" className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-white" rel="noreferrer">
                    Join Telegram Channel
                  </a>
                </article>
              )) : <p className="text-sm text-slate-500">No materials for this section yet.</p>}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
