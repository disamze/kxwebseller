'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { clearSessionUser, getSessionUser } from '@/lib/api';
import { LoginModal } from './login-modal';

const links = [
  { label: 'Explore', href: '/explore' },
  { label: 'Courses', href: '/explore?type=course' },
  { label: 'Ebooks', href: '/explore?type=ebook' },
  { label: 'Test Series', href: '/explore?type=test' }
];

export function Navbar() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const session = getSessionUser();
    if (session) setUser({ name: session.name, role: session.role });
    else setUser(null);
  }, [openLogin, openSignup]);

  function logout() {
    clearSessionUser();
    setUser(null);
    setMobileOpen(false);
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
          {user ? (
            <>
              <span className="text-xs">Hi, {user.name} ({user.role})</span>
              <button onClick={logout} className="rounded-xl border px-3 py-2 text-sm">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setOpenLogin(true)} className="rounded-xl border px-3 py-2 text-sm">Login</button>
              <button onClick={() => setOpenSignup(true)} className="rounded-xl bg-primary px-3 py-2 text-sm text-white">Signup</button>
            </>
          )}
        </div>

        <button
          className="inline-flex rounded-xl border p-2 md:hidden"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mt-3 space-y-2 rounded-xl border p-3 md:hidden">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <Link href="/admin-login" className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-100" onClick={() => setMobileOpen(false)}>
            Admin Login
          </Link>

          {user ? (
            <div className="space-y-2 border-t pt-2">
              <p className="text-xs">Logged in as {user.name} ({user.role})</p>
              <button onClick={logout} className="w-full rounded-lg border px-3 py-2 text-sm">Logout</button>
            </div>
          ) : (
            <div className="space-y-2 border-t pt-2">
              <button onClick={() => { setOpenLogin(true); setMobileOpen(false); }} className="w-full rounded-lg border px-3 py-2 text-sm">Login</button>
              <button onClick={() => { setOpenSignup(true); setMobileOpen(false); }} className="w-full rounded-lg bg-primary px-3 py-2 text-sm text-white">Signup</button>
            </div>
          )}
        </div>
      ) : null}

      <LoginModal open={openLogin} onOpenChange={setOpenLogin} mode="login" />
      <LoginModal open={openSignup} onOpenChange={setOpenSignup} mode="signup" />
    </header>
  );
}
