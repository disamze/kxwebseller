'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

type ProductCardProps = {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  studentsCount?: number;
  rating?: number;
  previewVideoUrl?: string;
};

export function ProductCard({ id, _id, title, description, price, thumbnail, studentsCount = 0, rating = 4.8, previewVideoUrl }: ProductCardProps) {
  const productId = _id || id;

  return (
    <motion.div whileHover={{ y: -6 }} className="rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-900">
      <img src={thumbnail} alt={title} className="h-44 w-full rounded-xl object-cover" />
      <h3 className="mt-3 font-heading text-lg">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{description}</p>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{studentsCount.toLocaleString()}+ students</span>
        <span>⭐ {rating.toFixed(1)}</span>
      </div>
      <p className="mt-2 font-semibold text-primary">₹{price}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/product/${productId}`} className="rounded-xl border px-4 py-2 text-sm">Explore</Link>
        <Link href={`/checkout?product=${productId}`} className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Buy Now</Link>
        {previewVideoUrl ? (
          <a href={previewVideoUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-primary px-4 py-2 text-sm text-primary">
            Preview
          </a>
        ) : null}
      </div>
    </motion.div>
  );
}
