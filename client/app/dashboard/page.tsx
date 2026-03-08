'use client';

import { useEffect, useState } from 'react';
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

type Tab = 'dashboard' | 'courses' | 'ebooks' | 'tests' | 'profile' | 'settings';

const menu: { key: Tab; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'courses', label: 'My Courses' },
  { key: 'ebooks', label: 'My Ebooks' },
  { key: 'tests', label: 'My Test Series' },
  { key: 'profile', label: 'My Profile' },
  { key: 'settings', label: 'Settings' }
];

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
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
      return;
    }

    setAllowed(true);
    fetch(`${API_URL}/users/materials`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setMaterials(Array.isArray(d) ? d : []))
      .catch(() => setMaterials([]));

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

  return (
    <main className="grid min-h-[80vh] grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="border-r p-6">
        <h2 className="font-heading text-xl">Material Organiser Neo</h2>
        <ul className="mt-6 space-y-2 text-sm">
          {menu.map((i) => (
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

      <section className="p-8 space-y-6">
        {activeTab === 'dashboard' ? (
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border p-5 shadow-sm">Purchased courses: {courses.length}</div>
            <div className="rounded-2xl border p-5 shadow-sm">Purchased ebooks: {ebooks.length}</div>
            <div className="rounded-2xl border p-5 shadow-sm">Purchased test series: {tests.length}</div>
            <div className="rounded-2xl border p-5 shadow-sm">Recent activity: {materials.length} unlock(s)</div>
          </div>
        ) : null}

        {activeTab === 'profile' ? (
          <div className="rounded-2xl border p-5 max-w-xl">
            <h3 className="font-heading text-xl">Logged-in User Details</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p><b>Email:</b> {me?.email || '-'}</p>
              <p><b>Role:</b> {me?.role || '-'}</p>
              <p><b>Joined:</b> {me?.createdAt ? new Date(me.createdAt).toLocaleString() : '-'}</p>
            </div>
            <div className="mt-4 space-y-2">
              <input value={nameEdit} onChange={(e) => setNameEdit(e.target.value)} className="w-full rounded-xl border p-3" placeholder="Update your name" />
              <button onClick={saveProfile} className="rounded-xl bg-primary px-4 py-2 text-white">Save Profile</button>
              {status ? <p className="text-xs text-slate-500">{status}</p> : null}
            </div>
          </div>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Settings</h3>
            <p className="mt-3 text-sm text-slate-500">More settings will be added soon.</p>
          </div>
        ) : null}

        {activeTab !== 'profile' && activeTab !== 'settings' ? (
          <div className="rounded-2xl border p-5">
            <h3 className="font-heading text-xl">Unlocked Materials</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {list.length ? list.map((item) => (
                <article key={item.id} className="rounded-xl border p-4">
                  <p className="font-medium">{item.title}</p>
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
