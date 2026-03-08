import { AdminAnalytics } from '@/components/admin-analytics';

const items = ['Overview', 'Add Course', 'Add Ebook', 'Add Test Series', 'Manage Products', 'Orders', 'Users', 'Analytics', 'Settings'];

export default function AdminPage() {
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
          <h3 className="font-heading text-xl">Analytics</h3>
          <div className="mt-4"><AdminAnalytics /></div>
        </div>
      </section>
    </main>
  );
}
