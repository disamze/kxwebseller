import { products } from '@/lib/mock-data';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products.find((p) => p.id === params.id);
  if (!product) return <div className="p-10">Not found</div>;

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <img src={product.thumbnail} alt={product.title} className="h-72 w-full rounded-2xl object-cover" />
      <h1 className="mt-6 font-heading text-4xl">{product.title}</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{product.description}</p>
      <p className="mt-5 text-2xl font-semibold text-primary">₹{product.price}</p>
      <a href={`/checkout?product=${product.id}`} className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-white">Buy Now</a>
    </main>
  );
}
