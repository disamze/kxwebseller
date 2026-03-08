'use client';

import { useEffect, useState } from 'react';
import { API_URL, getAuthHeaders, getSessionUser } from '@/lib/api';

type Material = {
  id: string;
  title: string;
  thumbnail: string;
  type: string;
  telegramLink: string;
};

const menu = ['Dashboard', 'My Courses', 'My Ebooks', 'My Test Series', 'Bookmarks', 'Settings', 'Logout'];

export default function DashboardPage() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    const session = getSessionUser();
    if (!session) return;

    fetch(`${API_URL}/users/materials`, { headers: getAuthHeaders() })
      .then((r) => r.json())
      .then((d) => setMaterials(Array.isArray(d) ? d : []))
      .catch(() => setMaterials([]));
  }, []);

  return (
    <main className="grid min-h-[80vh] grid-cols-1 md:grid-cols-[260px_1fr]">
      <aside className="border-r p-6">
        <h2 className="font-heading text-xl">Material Organiser Neo</h2>
        <ul className="mt-6 space-y-3 text-sm">
          {menu.map((i) => <li key={i} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">{i}</li>)}
        </ul>
      </aside>
      <section className="p-8">
        <div className="grid gap-4 md:grid-cols-4">
          {['Purchased courses', 'Purchased ebooks', 'Purchased test series', 'Recent activity'].map((k) => (
            <div key={k} className="rounded-2xl border p-5 shadow-sm">{k}</div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border p-5">
          <h3 className="font-heading text-xl">Unlocked Materials</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {materials.length ? materials.map((item) => (
              <article key={item.id} className="rounded-xl border p-4">
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-slate-500">{item.type}</p>
                <a href={item.telegramLink} target="_blank" className="mt-3 inline-block rounded-lg bg-accent px-4 py-2 text-white" rel="noreferrer">
                  Join Telegram Channel
                </a>
              </article>
            )) : <p className="text-sm text-slate-500">No unlocked materials yet. Once admin approves your order, it will appear here.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
