import { getProductById } from '@/lib/products';
import { withApiBase } from '@/lib/api';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) return <div className="p-10">Not found</div>;

  const productId = product._id || product.id;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 pb-28 sm:px-6 sm:py-16">
      <img src={withApiBase(product.thumbnail)} alt={product.title} className="h-72 w-full rounded-2xl object-cover" />
      <h1 className="mt-6 font-heading text-4xl">{product.title}</h1>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {product.classLevel ? <span className="rounded-full bg-cyan-100 px-2 py-1 text-cyan-900">{product.classLevel}</span> : null}
        {product.subject ? <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-900">{product.subject}</span> : null}
      </div>
      <p className="mt-4 text-slate-600 dark:text-slate-300">{product.description}</p>
      <p className="mt-5 text-2xl font-semibold text-primary">₹{product.price}</p>
      <a href={`/checkout?product=${productId}`} className="mt-6 hidden rounded-xl bg-primary px-6 py-3 text-white sm:inline-block">Buy Now</a>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 p-3 backdrop-blur md:hidden dark:bg-slate-950/95">
        <a href={`/checkout?product=${productId}`} className="block rounded-xl bg-primary px-6 py-4 text-center text-base font-semibold text-white">Buy Now • ₹{product.price}</a>
      </div>
    </main>
  );
}
