'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { withApiBase } from '@/lib/api';

type ProductCardProps = {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  classLevel?: string;
  subject?: string;
  studentsCount?: number;
  rating?: number;
  previewVideoUrl?: string;
};

export function ProductCard({ id, _id, title, description, price, thumbnail, classLevel, subject, studentsCount = 0, rating = 4.8, previewVideoUrl }: ProductCardProps) {
  const productId = _id || id;

  return (
    <motion.div whileHover={{ y: -6 }} className="rounded-2xl bg-white p-4 shadow-lg dark:bg-slate-900">
      <img src={withApiBase(thumbnail)} alt={title} className="h-44 w-full rounded-xl object-cover" />
      <h3 className="mt-3 font-heading text-lg">{title}</h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate-500">{description}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        {classLevel ? <span className="rounded-full bg-cyan-100 px-2 py-1 text-cyan-900">{classLevel}</span> : null}
        {subject ? <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-900">{subject}</span> : null}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{studentsCount.toLocaleString()}+ students</span>
        <span>⭐ {rating.toFixed(1)}</span>
      </div>
      <p className="mt-2 font-semibold text-primary">₹{price}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/product/${productId}`} className="rounded-xl border px-4 py-3 text-center text-sm font-semibold">Explore</Link>
        <Link href={`/checkout?product=${productId}`} className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">Buy Now</Link>
        {previewVideoUrl ? (
          <a href={previewVideoUrl} target="_blank" rel="noreferrer" className="col-span-2 rounded-xl border border-primary px-4 py-3 text-center text-sm font-semibold text-primary">
            Preview
          </a>
        ) : null}
      </div>
    </motion.div>
  );
}
