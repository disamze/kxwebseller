'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearSessionUser, getSessionUser } from '@/lib/api';

const links = [
  { label: 'Explore', href: '/explore' },
  { label: 'Courses', href: '/explore?type=course' },
  { label: 'Ebooks', href: '/explore?type=ebook' },
  { label: 'Test Series', href: '/explore?type=test' }
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => {
      const session = getSessionUser();
      if (session) setUser({ name: session.name, role: session.role });
      else setUser(null);
    };

    const storedTheme = localStorage.getItem('kx_theme') || 'light';
    const isDark = storedTheme === 'dark';
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    sync();
    window.addEventListener('session-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('session-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('kx_theme', next ? 'dark' : 'light');
  }

  function logout() {
    clearSessionUser();
    setUser(null);
    setMobileOpen(false);

    if (pathname?.startsWith('/admin') || pathname?.startsWith('/dashboard')) {
      router.push('/');
    }
  }

  return (
    <header className="sticky top-2 z-40 mx-auto w-[95%] max-w-6xl rounded-2xl glass px-3 py-3 shadow-xl sm:px-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/" className="font-heading text-base font-bold text-primary sm:text-xl">KXMATERIALS</Link>

        <nav className="hidden items-center gap-5 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm font-medium hover:text-primary">
              {link.label}
            </Link>
          ))}
          <Link href="/admin-login" className="text-sm font-medium hover:text-primary">Admin Login</Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button onClick={toggleTheme} className="rounded-xl border p-2" aria-label="Toggle theme">{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          {user ? (
            <>
              <span className="text-xs">Hi, {user.name} ({user.role})</span>
              <button onClick={logout} className="rounded-xl border px-3 py-2 text-sm">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-xl border px-3 py-2 text-sm">Login</Link>
              <Link href="/signup" className="rounded-xl bg-primary px-3 py-2 text-sm text-white">Signup</Link>
            </>
          )}
        </div>

        <button className="inline-flex rounded-xl border p-2 md:hidden" onClick={() => setMobileOpen((s) => !s)} aria-label="Toggle menu">
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mt-3 space-y-2 rounded-xl border p-3 md:hidden">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/admin-login" className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>
            Admin Login
          </Link>

          <button onClick={toggleTheme} className="w-full rounded-lg border px-3 py-2 text-sm">{dark ? 'Light mode' : 'Dark mode'}</button>

          {user ? (
            <div className="space-y-2 border-t pt-2">
              <p className="text-xs">Logged in as {user.name} ({user.role})</p>
              <button onClick={logout} className="w-full rounded-lg border px-3 py-2 text-sm">Logout</button>
            </div>
          ) : (
            <div className="space-y-2 border-t pt-2">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full rounded-lg border px-3 py-2 text-center text-sm">Login</Link>
              <Link href="/signup" onClick={() => setMobileOpen(false)} className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-sm text-white">Signup</Link>
            </div>
          )}
        </div>
      ) : null}

    </header>
  );
}
