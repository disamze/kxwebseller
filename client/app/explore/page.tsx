import { ProductCard } from '@/components/product-card';
import { getProducts } from '@/lib/products';

export default async function ExplorePage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-heading text-3xl">Explore Materials</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {products.map((p) => <ProductCard key={p._id || p.id} {...p} />)}
      </div>
    </main>
  );
}
