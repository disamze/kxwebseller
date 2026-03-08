'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { setSessionUser } from '@/lib/api';

type Mode = 'login' | 'signup';

export function LoginModal({
  open,
  onOpenChange,
  mode = 'login'
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode?: Mode;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');

  function completeUserLogin(source: 'email' | 'google') {
    if (!email) {
      setStatus('Please enter your email.');
      return;
    }

    setSessionUser({
      email,
      name: name || email.split('@')[0],
      role: 'user'
    });

    setStatus(`Logged in successfully with ${source}. Redirecting...`);
    setTimeout(() => onOpenChange(false), 500);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <Dialog.Title className="font-heading text-2xl">
            {mode === 'signup' ? 'Create your account' : 'Login to KXMATERIALS'}
          </Dialog.Title>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'signup' ? 'Sign up to buy and unlock your materials.' : 'Login to continue your purchase.'}
          </p>
          <div className="mt-6 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border p-3" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border p-3" />
            <button onClick={() => completeUserLogin('email')} className="w-full rounded-xl bg-primary py-3 text-white">
              {mode === 'signup' ? 'Sign up with Email' : 'Login with Email'}
            </button>
            <button onClick={() => completeUserLogin('google')} className="w-full rounded-xl border py-3">Continue with Google</button>
            {status ? <p className="text-xs text-slate-500">{status}</p> : null}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
