import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/products';
import { UserHandlingSection } from '@/components/user-handling-section';
import { CustomerPurchasesSection } from '@/components/customer-purchases-section';

const faqs = [
  { q: 'How do I access my course after payment?', a: 'After admin approval, your dashboard unlocks Telegram access links instantly.' },
  { q: 'How long is validity?', a: 'Most products include long-term validity; course-specific validity is shown on product cards.' },
  { q: 'Do you offer refund?', a: 'Because content is digital, refunds are handled only for duplicate/failed transactions after verification.' }
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/20" />
        <h1 className="font-heading text-4xl font-bold sm:text-5xl">Master Boards & Competitive Exams With KXMATERIALS</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-300">Top PYQ strategy, complete batches, ebooks and test series with mentor-backed learning paths.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/explore" className="rounded-xl bg-primary px-6 py-3 text-white">Buy Course</a>
          <a href="#preview" className="rounded-xl border px-6 py-3">Watch Free Preview</a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 pb-10 text-center md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">12,000+</p><p className="text-xs text-slate-500">Students</p></div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">500+</p><p className="text-xs text-slate-500">Video Lectures</p></div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">95%</p><p className="text-xs text-slate-500">Success Rate</p></div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-slate-900"><p className="text-2xl font-bold">4.8★</p><p className="text-xs text-slate-500">Average Rating</p></div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-4">
        <h2 className="font-heading text-3xl">Top Courses</h2>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-12 md:grid-cols-3">
        {products.map((p) => <ProductCard key={p._id || p.id} {...p} />)}
      </section>

      <section id="preview" className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-slate-900">
          <h3 className="font-heading text-2xl">Free Course Preview</h3>
          <p className="mt-2 text-sm text-slate-500">Watch a free demo lecture before purchasing. Preview links are available directly on course cards.</p>
        </div>
      </section>

      <UserHandlingSection />
      <CustomerPurchasesSection />

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h3 className="font-heading text-2xl">Testimonials</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {['This helped me score 95 in boards.', 'Best test series for revision.', 'Telegram delivery was instant after approval.'].map((t) => (
            <article key={t} className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-slate-900">
              <p className="text-sm">“{t}”</p>
              <p className="mt-3 text-xs text-slate-500">- KXMATERIALS Student</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h3 className="font-heading text-2xl">Frequently Asked Questions</h3>
        <div className="mt-4 space-y-3">
          {faqs.map((item) => (
            <details key={item.q} className="rounded-xl border bg-white p-4 dark:bg-slate-900">
              <summary className="cursor-pointer font-medium">{item.q}</summary>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
