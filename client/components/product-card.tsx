'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export function ProductCard({ id, title, description, price, thumbnail }: any) {
  return (
    <motion.div whileHover={{ y: -6 }} className="rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-900">
      <img src={thumbnail} alt={title} className="h-44 w-full rounded-xl object-cover" />
      <h3 className="mt-3 font-heading text-lg">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      <p className="mt-3 text-primary font-semibold">₹{price}</p>
      <div className="mt-4 flex gap-3">
        <Link href={`/product/${id}`} className="rounded-xl border px-4 py-2 text-sm">Explore</Link>
        <Link href={`/checkout?product=${id}`} className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Buy Now</Link>
      </div>
    </motion.div>
  );
}
