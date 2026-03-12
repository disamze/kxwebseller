'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tryAdminLogin } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    const ok = tryAdminLogin(email, password);
    if (!ok) {
      setStatus('Invalid admin credentials.');
      return;
    }
    setStatus('Admin login success. Redirecting...');
    setTimeout(() => router.push('/admin'), 500);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-heading text-3xl">Admin Login</h1>
      <p className="mt-2 text-sm text-slate-500">Use your admin email and password to access admin dashboard.</p>
      <form onSubmit={submit} className="mt-6 space-y-3 rounded-2xl border p-5">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="w-full rounded-xl border p-3" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="w-full rounded-xl border p-3" />
        <button className="w-full rounded-xl bg-primary py-3 text-white">Login as Admin</button>
        {status ? <p className="text-xs text-slate-500">{status}</p> : null}
      </form>
    </main>
  );
}
