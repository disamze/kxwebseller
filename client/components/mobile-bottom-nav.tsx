'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/login', label: 'Login' }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 p-2 backdrop-blur md:hidden dark:bg-slate-950/95">
      <div className="grid grid-cols-4 gap-2">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-2 py-3 text-center text-xs font-semibold ${pathname === item.href ? 'bg-primary text-white' : 'border text-slate-700 dark:text-slate-200'}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
