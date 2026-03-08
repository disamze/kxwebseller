'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { clearSessionUser, getSessionUser } from '@/lib/api';
import { LoginModal } from './login-modal';

const links = ['Explore', 'Courses', 'Ebooks', 'Test Series'];

export function Navbar() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const session = getSessionUser();
    if (session) setUser({ name: session.name, role: session.role });
  }, [openLogin, openSignup]);

  function logout() {
    clearSessionUser();
    setUser(null);
  }

  return (
    <header className="sticky top-4 z-40 mx-auto w-[95%] max-w-6xl rounded-2xl glass px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-heading text-xl font-bold text-primary">KXMATERIALS</Link>
        <nav className="hidden gap-6 md:flex">
          {links.map((link) => (
            <Link key={link} href="/explore" className="text-sm font-medium hover:text-primary">{link}</Link>
          ))}
          <Link href="/admin-login" className="text-sm font-medium hover:text-primary">Admin Login</Link>
        </nav>
        <div className="flex gap-3 items-center">
          <Link href="/admin-login" className="rounded-xl border px-3 py-2 text-xs">Admin</Link>
          {user ? (
            <>
              <span className="text-xs">Hi, {user.name} ({user.role})</span>
              <button onClick={logout} className="rounded-xl border px-4 py-2 text-sm">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setOpenLogin(true)} className="rounded-xl border px-4 py-2 text-sm">Login</button>
              <button onClick={() => setOpenSignup(true)} className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Signup</button>
            </>
          )}
        </div>
      </div>
      <LoginModal open={openLogin} onOpenChange={setOpenLogin} mode="login" />
      <LoginModal open={openSignup} onOpenChange={setOpenSignup} mode="signup" />
    </header>
  );
}
