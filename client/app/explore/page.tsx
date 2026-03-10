import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/products';

export default async function ExplorePage({
  searchParams
}: {
  searchParams: { q?: string; classLevel?: string; subject?: string; priceType?: string; priceMin?: string; priceMax?: string; type?: string };
}) {
  const params = new URLSearchParams();
  for (const key of ['q', 'classLevel', 'subject', 'priceType', 'priceMin', 'priceMax', 'type'] as const) {
    const val = searchParams[key];
    if (val) params.set(key, val);
  }

  const products = await getProducts(params.toString());
  const allProducts = await getProducts();
  const classes = Array.from(new Set(allProducts.map((p) => p.classLevel).filter(Boolean))).sort();
  const subjects = Array.from(new Set(allProducts.map((p) => p.subject).filter(Boolean))).sort();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <h2 className="font-heading text-3xl">Explore Materials</h2>

      <form className="mt-6 grid gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-6 dark:bg-slate-900">
        <input name="q" defaultValue={searchParams.q || ''} placeholder="Search materials..." className="rounded-xl border px-3 py-3 text-sm md:col-span-2" />
        <select name="classLevel" defaultValue={searchParams.classLevel || ''} className="rounded-xl border px-3 py-3 text-sm">
          <option value="">Class</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="subject" defaultValue={searchParams.subject || ''} className="rounded-xl border px-3 py-3 text-sm">
          <option value="">Subject</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="priceType" defaultValue={searchParams.priceType || ''} className="rounded-xl border px-3 py-3 text-sm">
          <option value="">Free / Paid</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <div className="grid grid-cols-2 gap-2 md:col-span-2">
          <input name="priceMin" defaultValue={searchParams.priceMin || ''} placeholder="Min price" className="rounded-xl border px-3 py-3 text-sm" />
          <input name="priceMax" defaultValue={searchParams.priceMax || ''} placeholder="Max price" className="rounded-xl border px-3 py-3 text-sm" />
        </div>
        <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white md:col-span-1">Apply Filters</button>
      </form>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {products.map((p) => <ProductCard key={p._id || p.id} {...p} />)}
      </div>
      {!products.length ? <p className="mt-6 text-sm text-slate-500">No materials found for selected filters.</p> : null}
    </main>
  );
}
