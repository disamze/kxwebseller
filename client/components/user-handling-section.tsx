'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSessionUser } from '@/lib/api';

export function UserHandlingSection() {
  const [userLabel, setUserLabel] = useState('Currently not logged in');

  useEffect(() => {
    const user = getSessionUser();
    if (user) setUserLabel(`Logged in as: ${user.email} (${user.role})`);
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="rounded-2xl border bg-white/80 p-6 shadow-sm dark:bg-slate-900/80">
        <h2 className="font-heading text-2xl">User Handling & Access Flow</h2>
        <p className="mt-2 text-sm text-slate-500">Everything from login to Telegram access is managed here.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-slate-500">Step 1</p>
            <p className="font-medium">User Login / Signup</p>
            <p className="mt-1 text-xs text-slate-500">Use navbar login/signup for user access.</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-slate-500">Step 2</p>
            <p className="font-medium">UPI Payment + Proof</p>
            <p className="mt-1 text-xs text-slate-500">Submit screenshot on checkout.</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-slate-500">Step 3</p>
            <p className="font-medium">Admin Verification</p>
            <p className="mt-1 text-xs text-slate-500">Admin reviews and approves/rejects orders.</p>
          </div>
          <div className="rounded-xl border p-4">
            <p className="text-xs text-slate-500">Step 4</p>
            <p className="font-medium">Telegram Access</p>
            <p className="mt-1 text-xs text-slate-500">Approved orders unlock materials in dashboard.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-lg border px-4 py-2 text-sm">Go to Dashboard</Link>
          <Link href="/admin-login" className="rounded-lg bg-primary px-4 py-2 text-sm text-white">Admin Login</Link>
          <span className="rounded-lg bg-slate-100 px-4 py-2 text-xs dark:bg-slate-800">{userLabel}</span>
        </div>
      </div>
    </section>
  );
}
