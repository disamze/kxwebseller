'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LoginModal } from './login-modal';

const links = ['Explore', 'Courses', 'Ebooks', 'Test Series'];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-4 z-40 mx-auto w-[95%] max-w-6xl rounded-2xl glass px-4 py-3 shadow-xl">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-heading text-xl font-bold text-primary">EduMarket Neo</Link>
        <nav className="hidden gap-6 md:flex">
          {links.map((link) => (
            <Link key={link} href="/explore" className="text-sm font-medium hover:text-primary">{link}</Link>
          ))}
        </nav>
        <div className="flex gap-3">
          <button onClick={() => setOpen(true)} className="rounded-xl border px-4 py-2 text-sm">Login</button>
          <button onClick={() => setOpen(true)} className="rounded-xl bg-primary px-4 py-2 text-sm text-white">Signup</button>
        </div>
      </div>
      <LoginModal open={open} onOpenChange={setOpen} />
    </header>
  );
}
