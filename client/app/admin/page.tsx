'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AdminAnalytics } from '@/components/admin-analytics';
import { API_URL, getAuthHeaders, getSessionUser, setSessionUser, withApiBase } from '@/lib/api';

type AdminTab = 'overview' | 'add' | 'courses' | 'orders' | 'users' | 'analytics' | 'profile' | 'settings' | 'promotions';

const items: { key: AdminTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'add', label: 'Add Product' },
  { key: 'courses', label: 'Manage Products' },
  { key: 'orders', label: 'Orders' },
  { key: 'users', label: 'Users' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'profile', label: 'Admin Profile' },
  { key: 'settings', label: 'Settings' },
  { key: 'promotions', label: 'Offers / Coupons / Referral' }
];

type Order = {
  _id: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  transactionId?: string;
  paymentScreenshot: string;
  amount?: number;
  finalAmount?: number;
  couponCode?: string;
  couponDiscount?: number;
  referralDiscount?: number;
  userId?: { name?: string; email?: string };
  productId?: { title?: string };
};

type Me = { name: string; email: string; role: string };

type Coupon = { code: string; percent: number; active?: boolean };
type AdminSettings = {
  allowNewSignups: boolean;
  maintenanceMode: boolean;
  offerEnabled: boolean;
  offerText: string;
  offerEndsAt?: string | null;
  referralEnabled: boolean;
  referralDiscountAmount: number;
  referralMinPurchase: number;
  coupons: Coupon[];
  updatedAt?: string;
};

type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: 'course' | 'ebook' | 'test';
  classLevel?: string;
  subject?: string;
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
  referralCode?: string;
  referralBalance?: number;
};

const defaultSettings: AdminSettings = {
  allowNewSignups: true,
  maintenanceMode: false,
  offerEnabled: false,
  offerText: '',
  offerEndsAt: null,
  referralEnabled: true,
  referralDiscountAmount: 200,
  referralMinPurchase: 900,
  coupons: []
};

const defaultForm = {
  title: '',
  description: '',
  price: '',
  thumbnail: '',
  type: 'course',
  classLevel: '',
  subject: '',
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
  const [couponDraft, setCouponDraft] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
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
    if (!res.ok) return setSettingsStatus(data.message || 'Failed to load settings');
    setSettings({ ...defaultSettings, ...data, coupons: Array.isArray(data.coupons) ? data.coupons : [] });
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
    if (!res.ok) return setStatus(data.message || `Failed to ${decision.toLowerCase()} order`);
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
    if (!form.title || !form.description || form.price === '' || !form.telegramLink) return setStatus('Please fill title, description, price and telegram link.');
    setStatus(editingProductId ? 'Updating product...' : 'Creating product...');

    const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`;
    const method = editingProductId ? 'PATCH' : 'POST';
    const payload = buildProductPayload();
    const formData = new FormData();
    Object.entries(payload).forEach(([k, v]) => formData.append(k, String(v ?? '')));
    if (thumbnailFile) formData.set('thumbnail', thumbnailFile);

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.message || 'Failed to save product');

    setStatus(editingProductId ? 'Product updated successfully.' : 'Product created successfully.');
    setForm(defaultForm);
    setEditingProductId(null);
    setThumbnailFile(null);
    await loadProducts();
    setActiveTab('courses');
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`${API_URL}/products/${productId}`, { method: 'DELETE', headers: getAuthHeaders() });
    const data = await res.json();
    if (!res.ok) return setStatus(data.message || 'Delete failed');
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
      classLevel: product.classLevel || '',
      subject: product.subject || '',
      telegramLink: product.telegramLink,
      previewVideoUrl: product.previewVideoUrl || '',
      studentsCount: String(product.studentsCount || 0),
      rating: String(product.rating || 4.8)
    });
    setThumbnailFile(null);
    setActiveTab('add');
  }

  async function saveAdminProfile() {
    if (!me?.name.trim()) return setStatus('Name is required');
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: me.name })
    });
    const data = await res.json();
    if (!res.ok) return setStatus(data.message || 'Failed to save profile');
    setSessionUser({ email: data.email, name: data.name, role: 'admin' });
    setMe(data);
    setStatus('Profile updated successfully.');
  }

  function parseCouponDraft(): Coupon[] {
    const parsed: Coupon[] = [];
    for (const part of couponDraft.split(',').map((s) => s.trim()).filter(Boolean)) {
      const [codeRaw, percentRaw] = part.split(':');
      const code = String(codeRaw || '').trim().toUpperCase();
      const percent = Number(percentRaw || 0);
      if (code && percent > 0 && percent <= 90) parsed.push({ code, percent, active: true });
    }
    return parsed;
  }

  async function saveSettings() {
    setSettingsStatus('Saving settings...');
    const mergedCoupons = [...settings.coupons, ...parseCouponDraft()].filter((v, i, arr) => arr.findIndex((x) => x.code === v.code) === i);

    const res = await fetch(`${API_URL}/users/admin-settings`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...settings, coupons: mergedCoupons })
    });
    const data = await res.json();
    if (!res.ok) return setSettingsStatus(data.message || 'Failed to save settings');

    setSettings({ ...defaultSettings, ...data, coupons: Array.isArray(data.coupons) ? data.coupons : [] });
    setCouponDraft('');
    setSettingsStatus('Settings saved successfully.');
  }

  useEffect(() => {
    const session = getSessionUser();
    if (!session || session.role !== 'admin') {
      setIsAdmin(false);
      return;
    }
    setIsAdmin(true);
    loadOrders();
    loadProducts();
    loadUsers();
    loadProfile();
    loadSettings();
  }, []);

  const overview = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'Pending').length;
    const approved = orders.filter((o) => o.status === 'Approved').length;
    const rejected = orders.filter((o) => o.status === 'Rejected').length;
    const revenue = orders.filter((o) => o.status === 'Approved').reduce((acc, curr) => acc + Number(curr.finalAmount || curr.amount || 0), 0);
    return { pending, approved, rejected, revenue };
  }, [orders]);

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

      <section className="space-y-6 p-8 pb-24">
        {activeTab === 'overview' ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Pending</p><p className="mt-1 text-2xl font-bold">{overview.pending}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Approved</p><p className="mt-1 text-2xl font-bold">{overview.approved}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Rejected</p><p className="mt-1 text-2xl font-bold">{overview.rejected}</p></div>
            <div className="rounded-2xl border p-5 shadow-sm"><p className="text-xs text-slate-500">Revenue</p><p className="mt-1 text-2xl font-bold">₹{overview.revenue}</p></div>
          </div>
        ) : null}

        {activeTab === 'add' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">{editingProductId ? 'Update Product' : 'Add Product / Material'}</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} className="rounded-xl border p-3" placeholder="Title" />
              <input value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: e.target.value }))} className="rounded-xl border p-3" placeholder="Price" />
              <input value={form.classLevel} onChange={(e) => setForm((s) => ({ ...s, classLevel: e.target.value }))} className="rounded-xl border p-3" placeholder="Class (e.g., Class 10)" />
              <input value={form.subject} onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))} className="rounded-xl border p-3" placeholder="Subject (e.g., Physics)" />
              <select value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))} className="rounded-xl border p-3">
                <option value="course">Course</option><option value="ebook">Ebook</option><option value="test">Test</option>
              </select>
              <div className="rounded-xl border p-3">
                <p className="mb-2 text-xs text-slate-500">Upload thumbnail image</p>
                <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} className="w-full text-sm" />
                {form.thumbnail ? <img src={withApiBase(form.thumbnail)} alt="Current thumbnail" className="mt-2 h-14 w-24 rounded object-cover" /> : null}
              </div>
              <input value={form.telegramLink} onChange={(e) => setForm((s) => ({ ...s, telegramLink: e.target.value }))} className="rounded-xl border p-3 md:col-span-2" placeholder="Telegram Link" />
              <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} className="min-h-[120px] rounded-xl border p-3 md:col-span-2" placeholder="Description" />
              <button onClick={saveProduct} className="rounded-xl bg-primary px-5 py-3 text-white md:col-span-2">{editingProductId ? 'Update Product' : 'Create Product'}</button>
              {editingProductId ? <button onClick={() => { setEditingProductId(null); setForm(defaultForm); setThumbnailFile(null); }} className="rounded-xl border px-5 py-3 md:col-span-2">Cancel edit</button> : null}
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
                  <p className="text-sm text-slate-500">Type: {product.type} | Price: ₹{product.price} | {product.classLevel || '-'} | {product.subject || '-'}</p>
                  <p className="text-sm text-slate-500">Telegram: {product.telegramLink}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => startEditProduct(product)} className="rounded-lg border px-3 py-2 text-sm">Edit</button>
                    <button onClick={() => deleteProduct(product._id)} className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white">Delete</button>
                  </div>
                </div>
              ))}
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
                  <p className="text-sm"><b>Status:</b> {o.status}</p>
                  <p className="text-sm"><b>Base/Final:</b> ₹{o.amount || 0} / ₹{o.finalAmount || o.amount || 0}</p>
                  <p className="text-sm"><b>Coupon:</b> {o.couponCode || '-'} (-₹{o.couponDiscount || 0})</p>
                  <p className="text-sm"><b>Referral Discount:</b> -₹{o.referralDiscount || 0}</p>
                  <a href={withApiBase(o.paymentScreenshot)} target="_blank" className="text-sm text-primary underline" rel="noreferrer">View payment screenshot</a>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => reviewOrder(o._id, 'Approved')} className="rounded-lg bg-green-600 px-3 py-2 text-white">Approve</button>
                    <button onClick={() => reviewOrder(o._id, 'Rejected')} className="rounded-lg bg-red-600 px-3 py-2 text-white">Reject</button>
                  </div>
                </div>
              ))}
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
                  <p><b>Referral Code:</b> {user.referralCode || '-'}</p>
                  <p><b>Referral Wallet:</b> ₹{user.referralBalance || 0}</p>
                  <p><b>Joined:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}


        {activeTab === 'promotions' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Offers / Coupons / Referral Controls</h3>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Enable offer banner</span><input type="checkbox" checked={settings.offerEnabled} onChange={(e) => setSettings((s) => ({ ...s, offerEnabled: e.target.checked }))} /></label>
              <input value={settings.offerText} onChange={(e) => setSettings((s) => ({ ...s, offerText: e.target.value }))} placeholder="Offer text (example: FESTIVE SALE 25% OFF)" className="w-full rounded-xl border p-3 text-sm" />
              <input type="datetime-local" value={settings.offerEndsAt ? new Date(settings.offerEndsAt).toISOString().slice(0,16) : ''} onChange={(e) => setSettings((s) => ({ ...s, offerEndsAt: e.target.value ? new Date(e.target.value).toISOString() : null }))} className="w-full rounded-xl border p-3 text-sm" />

              <label className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Enable referral discount system</span><input type="checkbox" checked={settings.referralEnabled} onChange={(e) => setSettings((s) => ({ ...s, referralEnabled: e.target.checked }))} /></label>
              <div className="grid grid-cols-2 gap-2">
                <input value={settings.referralDiscountAmount} onChange={(e) => setSettings((s) => ({ ...s, referralDiscountAmount: Number(e.target.value || 0) }))} className="rounded-xl border p-3 text-sm" placeholder="Referral reward/discount amount" />
                <input value={settings.referralMinPurchase} onChange={(e) => setSettings((s) => ({ ...s, referralMinPurchase: Number(e.target.value || 0) }))} className="rounded-xl border p-3 text-sm" placeholder="Minimum purchase amount" />
              </div>

              <input value={couponDraft} onChange={(e) => setCouponDraft(e.target.value)} placeholder="Add coupon list: WELCOME10:10, TEST20:20" className="w-full rounded-xl border p-3 text-sm" />
              <div className="rounded-xl border p-3 text-sm">
                <p className="font-semibold">Active coupons from admin settings:</p>
                <div className="mt-2 flex flex-wrap gap-2">{(settings.coupons || []).map((c) => <span key={c.code} className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-900">{c.code} ({c.percent}%)</span>)}</div>
              </div>

              <button onClick={saveSettings} className="rounded-xl bg-primary px-5 py-3 text-white">Save Promotions Settings</button>
              {settingsStatus ? <p className="text-sm text-slate-500">{settingsStatus}</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'analytics' ? <div className="rounded-2xl border p-5"><h3 className="font-heading text-xl">Analytics</h3><div className="mt-4"><AdminAnalytics /></div></div> : null}

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
            ) : null}
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Platform Settings</h3>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Allow new user signups</span><input type="checkbox" checked={settings.allowNewSignups} onChange={(e) => setSettings((s) => ({ ...s, allowNewSignups: e.target.checked }))} /></label>
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Maintenance mode</span><input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings((s) => ({ ...s, maintenanceMode: e.target.checked }))} /></label>
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Show Offer Banner</span><input type="checkbox" checked={settings.offerEnabled} onChange={(e) => setSettings((s) => ({ ...s, offerEnabled: e.target.checked }))} /></label>
              <input value={settings.offerText} onChange={(e) => setSettings((s) => ({ ...s, offerText: e.target.value }))} placeholder="Offer text (e.g., Diwali Sale 30% OFF)" className="w-full rounded-xl border p-3 text-sm" />
              <label className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>Enable referral discounts</span><input type="checkbox" checked={settings.referralEnabled} onChange={(e) => setSettings((s) => ({ ...s, referralEnabled: e.target.checked }))} /></label>
              <div className="grid grid-cols-2 gap-2">
                <input value={settings.referralDiscountAmount} onChange={(e) => setSettings((s) => ({ ...s, referralDiscountAmount: Number(e.target.value || 0) }))} className="rounded-xl border p-3 text-sm" placeholder="Referral discount amount" />
                <input value={settings.referralMinPurchase} onChange={(e) => setSettings((s) => ({ ...s, referralMinPurchase: Number(e.target.value || 0) }))} className="rounded-xl border p-3 text-sm" placeholder="Min purchase" />
              </div>
              <input value={couponDraft} onChange={(e) => setCouponDraft(e.target.value)} placeholder="Add coupons: WELCOME10:10, NEW20:20" className="w-full rounded-xl border p-3 text-sm" />
              <div className="rounded-xl border p-3 text-sm">
                <p className="font-semibold">Active coupons:</p>
                <div className="mt-2 flex flex-wrap gap-2">{(settings.coupons || []).map((c) => <span key={c.code} className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-900">{c.code} ({c.percent}%)</span>)}</div>
              </div>
              <button onClick={saveSettings} className="rounded-xl bg-primary px-5 py-3 text-white">Save Settings</button>
              {settingsStatus ? <p className="text-sm text-slate-500">{settingsStatus}</p> : null}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
