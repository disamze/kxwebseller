'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminAnalytics } from '@/components/admin-analytics';
import { API_URL, getAuthHeaders, getSessionUser, setSessionUser, withApiBase } from '@/lib/api';

type AdminTab = 'overview' | 'add' | 'courses' | 'orders' | 'users' | 'analytics' | 'profile' | 'settings';

const items: { key: AdminTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'add', label: 'Add Product' },
  { key: 'courses', label: 'Manage Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'users', label: 'Users' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'profile', label: 'Admin Profile' },
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

type Me = { name: string; email: string; role: string };

type AdminSettings = {
  allowNewSignups: boolean;
  maintenanceMode: boolean;
  updatedAt?: string;
};

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: 'course' | 'ebook' | 'test';
  thumbnail?: string;
  telegramLink: string;
  previewVideoUrl?: string;
  studentsCount?: number;
  rating?: number;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  purchasedCount: number;
};

const defaultSettings: AdminSettings = { allowNewSignups: true, maintenanceMode: false };
const defaultForm = {
  title: '',
  description: '',
  price: '',
  thumbnail: '',
  type: 'course',
  telegramLink: '',
  previewVideoUrl: '',
  studentsCount: '',
  rating: '4.8'
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [me, setMe] = useState<Me | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [settingsStatus, setSettingsStatus] = useState('');
  const router = useRouter();

  async function loadOrders() {
    const res = await fetch(`${API_URL}/orders`, { headers: getAuthHeaders() });
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
  }

  async function loadProducts() {
    const res = await fetch(`${API_URL}/products`, { headers: getAuthHeaders() });
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  }

  async function loadUsers() {
    const res = await fetch(`${API_URL}/users/admin-users`, { headers: getAuthHeaders() });
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  async function loadProfile() {
    const res = await fetch(`${API_URL}/users/me`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (res.ok && data?.email) setMe(data);
  }

  async function loadSettings() {
    const res = await fetch(`${API_URL}/users/admin-settings`, { headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) {
      setSettingsStatus(data.message || 'Failed to load settings');
      return;
    }
    setSettings(data);
    setSettingsStatus('');
  }

  async function reviewOrder(id: string, decision: 'Approved' | 'Rejected') {
    setStatus(`Updating order as ${decision}...`);
    const res = await fetch(`${API_URL}/orders/${id}/review`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status: decision })
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus(data.message || `Failed to ${decision.toLowerCase()} order`);
      return;
    }

    setStatus(`Order ${decision.toLowerCase()} successfully.`);
    await loadOrders();
    await loadUsers();
  }

  function buildProductPayload() {
    return {
      ...form,
      price: Number(form.price),
      studentsCount: Number(form.studentsCount || 0),
      rating: Number(form.rating || 4.8)
    };
  }

  async function saveProduct() {
    if (!form.title || !form.description || !form.price || !form.telegramLink) {
      setStatus('Please fill title, description, price and telegram link.');
      return;
    }

    setStatus(editingProductId ? 'Updating product...' : 'Creating product...');
    const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`;
    const method = editingProductId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(buildProductPayload())
    });

    const data = await res.json();
    if (!res.ok) {
      setStatus(data.message || 'Failed to save product');
      return;
    }

    setStatus(editingProductId ? 'Product updated successfully.' : 'Product created successfully.');
    setForm(defaultForm);
    setEditingProductId(null);
    await loadProducts();
    setActiveTab('courses');
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Delete this product? This cannot be undone.')) return;

    setStatus('Deleting product...');
    const res = await fetch(`${API_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.message || 'Failed to delete product');
      return;
    }

    setStatus('Product deleted successfully.');
    await loadProducts();
  }

  function startEditProduct(product: Product) {
    setEditingProductId(product._id);
    setForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      thumbnail: product.thumbnail || '',
      type: product.type,
      telegramLink: product.telegramLink,
      previewVideoUrl: product.previewVideoUrl || '',
      studentsCount: String(product.studentsCount || 0),
      rating: String(product.rating || 4.8)
    });
    setActiveTab('add');
  }

  async function saveAdminProfile() {
    if (!me?.name) return;
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: me.name })
    });
    const data = await res.json();
    if (res.ok) {
      setSessionUser({ email: data.email, name: data.name, role: 'admin' });
      setStatus('Admin profile updated.');
    } else {
      setStatus(data.message || 'Unable to update profile');
    }
  }

  async function saveSettings() {
    setSettingsStatus('Saving settings...');
    const res = await fetch(`${API_URL}/users/admin-settings`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    if (!res.ok) {
      setSettingsStatus(data.message || 'Failed to save settings');
      return;
    }
    setSettings(data);
    setSettingsStatus('Settings saved successfully.');
  }

  useEffect(() => {
    const sync = () => {
      const session = getSessionUser();
      const ok = !!session && session.role === 'admin';
      setIsAdmin(ok);
      if (ok) {
        loadOrders();
        loadProfile();
        loadSettings();
        loadProducts();
        loadUsers();
      } else {
        setOrders([]);
      }
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
    const revenue = orders.filter((o) => o.status === 'Approved').reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
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
    <main className="grid min-h-[80vh] grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside className="border-r p-6">
        <h2 className="font-heading text-xl">Admin Dashboard</h2>
        {me ? <p className="mt-2 text-xs text-slate-500">Logged in: {me.name} ({me.email})</p> : null}
        <ul className="mt-6 space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.key}>
              <button onClick={() => setActiveTab(i.key)} className={`w-full rounded-lg px-3 py-2 text-left transition ${activeTab === i.key ? 'bg-primary text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                {i.label}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="space-y-6 p-8">
        {activeTab === 'overview' ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Pending</p><p className="mt-1 text-2xl font-bold text-amber-600">{summary.pending}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Approved</p><p className="mt-1 text-2xl font-bold text-green-600">{summary.approved}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Products</p><p className="mt-1 text-2xl font-bold">{products.length}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Users</p><p className="mt-1 text-2xl font-bold">{users.length}</p></div>
          </div>
        ) : null}

        {activeTab === 'add' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">{editingProductId ? 'Update Product' : 'Add Product / Material'}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} className="rounded-xl border p-3" placeholder="Title" />
              <input value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} className="rounded-xl border p-3" placeholder="Price" />
              <input value={form.thumbnail} onChange={(e) => setForm((s) => ({ ...s, thumbnail: e.target.value }))} className="rounded-xl border p-3" placeholder="Thumbnail URL" />
              <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as 'course' | 'ebook' | 'test' }))} className="rounded-xl border p-3"><option>course</option><option>ebook</option><option>test</option></select>
              <input value={form.studentsCount} onChange={(e) => setForm((s) => ({ ...s, studentsCount: e.target.value }))} className="rounded-xl border p-3" placeholder="Students count" />
              <input value={form.rating} onChange={(e) => setForm((s) => ({ ...s, rating: e.target.value }))} className="rounded-xl border p-3" placeholder="Rating (0-5)" />
              <input value={form.previewVideoUrl} onChange={(e) => setForm((s) => ({ ...s, previewVideoUrl: e.target.value }))} className="rounded-xl border p-3 md:col-span-2" placeholder="Preview video URL (optional)" />
              <input value={form.telegramLink} onChange={(e) => setForm((s) => ({ ...s, telegramLink: e.target.value }))} className="rounded-xl border p-3 md:col-span-2" placeholder="Telegram invite link" />
              <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} className="rounded-xl border p-3 md:col-span-2" placeholder="Description" />
              <button onClick={saveProduct} className="rounded-xl bg-primary px-5 py-3 text-white md:col-span-2">{editingProductId ? 'Update Product' : 'Create Product'}</button>
              {editingProductId ? <button onClick={() => { setEditingProductId(null); setForm(defaultForm); }} className="rounded-xl border px-5 py-3 md:col-span-2">Cancel edit</button> : null}
              {status ? <p className="text-sm text-slate-500 md:col-span-2">{status}</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'courses' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Manage Existing Products</h3>
            <div className="mt-4 space-y-3">
              {products.map((product) => (
                <div key={product._id} className="rounded-xl border p-4">
                  <p className="font-semibold">{product.title}</p>
                  <p className="text-sm text-slate-500">Type: {product.type} | Price: ₹{product.price}</p>
                  <p className="text-sm text-slate-500">Telegram: {product.telegramLink}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => startEditProduct(product)} className="rounded-lg border px-3 py-2 text-sm">Edit</button>
                    <button onClick={() => deleteProduct(product._id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white">Delete</button>
                  </div>
                </div>
              ))}
              {!products.length ? <p className="text-sm text-slate-500">No products found.</p> : null}
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
              {status ? <p className="text-sm text-slate-500">{status}</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'users' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Logged Users & Details</h3>
            <div className="mt-4 space-y-3">
              {users.map((user) => (
                <article key={user._id} className="rounded-xl border p-4 text-sm">
                  <p><b>Name:</b> {user.name}</p>
                  <p><b>Email:</b> {user.email}</p>
                  <p><b>Role:</b> {user.role}</p>
                  <p><b>Purchased Materials:</b> {user.purchasedCount}</p>
                  <p><b>Joined:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
                </article>
              ))}
              {!users.length ? <p className="text-sm text-slate-500">No users found.</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'analytics' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Analytics</h3>
            <div className="mt-4"><AdminAnalytics /></div>
          </div>
        ) : null}

        {activeTab === 'profile' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Admin Profile</h3>
            {me ? (
              <div className="mt-3 grid max-w-xl gap-3">
                <input value={me.name} onChange={(e) => setMe((s) => (s ? { ...s, name: e.target.value } : s))} className="rounded-xl border p-3" />
                <input value={me.email} disabled className="rounded-xl border bg-slate-100 p-3 dark:bg-slate-800" />
                <button onClick={saveAdminProfile} className="rounded-xl bg-primary px-5 py-3 text-white">Save Profile</button>
                {status ? <p className="text-sm text-slate-500">{status}</p> : null}
              </div>
            ) : <p className="mt-3 text-sm text-slate-500">Unable to load profile.</p>}
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Platform Settings</h3>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span>Allow new user signups</span>
                <input type="checkbox" checked={settings.allowNewSignups} onChange={(e) => setSettings((s) => ({ ...s, allowNewSignups: e.target.checked }))} />
              </label>
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm">
                <span>Maintenance mode</span>
                <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))} />
              </label>
              <button onClick={saveSettings} className="rounded-xl bg-primary px-5 py-3 text-white">Save Settings</button>
              {settings.updatedAt ? <p className="text-xs text-slate-500">Last updated: {new Date(settings.updatedAt).toLocaleString()}</p> : null}
              {settingsStatus ? <p className="text-sm text-slate-500">{settingsStatus}</p> : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
