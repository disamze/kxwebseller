'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { setSessionUser } from '@/lib/api';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const router = useRouter();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('Please enter your email.');
      return;
    }

    const resolvedName = name.trim() || email.split('@')[0] || 'KX User';
    setSessionUser({ email: email.trim(), name: resolvedName, role: 'user' });
    setStatus(mode === 'signup' ? 'Account created. Redirecting to dashboard...' : 'Login successful. Redirecting to dashboard...');
    setTimeout(() => router.push('/dashboard'), 400);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border bg-white p-8 shadow-sm dark:bg-slate-900">
        <h1 className="font-heading text-3xl">{mode === 'signup' ? 'Create your account' : 'Login to KXMATERIALS'}</h1>
        <p className="mt-2 text-sm text-slate-500">{mode === 'signup' ? 'Sign up to buy and unlock your materials.' : 'Login to continue your learning journey.'}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border p-3" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-xl border p-3" />
          <button className="w-full rounded-xl bg-primary py-3 text-white" type="submit">
            {mode === 'signup' ? 'Sign up' : 'Login'}
          </button>
          {status ? <p className="text-xs text-slate-500">{status}</p> : null}
        </form>

        <p className="mt-4 text-sm text-slate-500">
          {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link href={mode === 'signup' ? '/login' : '/signup'} className="text-primary underline">
            {mode === 'signup' ? 'Login' : 'Sign up'}
          </Link>
        </p>
      </div>
    </main>
  );
}
