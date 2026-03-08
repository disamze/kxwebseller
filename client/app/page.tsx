import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/products';
import { UserHandlingSection } from '@/components/user-handling-section';

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20" />
        <h1 className="font-heading text-5xl font-bold">Upgrade Your Learning With Premium Courses</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-300">Courses • Ebooks • Test Series</p>
        <div className="mt-8 flex justify-center gap-4">
          <a href="/explore" className="rounded-xl bg-primary px-6 py-3 text-white">Explore Courses</a>
          <a href="/explore" className="rounded-xl border px-6 py-3">Start Learning</a>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 md:grid-cols-3">
        {products.map((p) => <ProductCard key={p._id || p.id} {...p} />)}
      </section>
      <UserHandlingSection />
    </main>
  );
}
