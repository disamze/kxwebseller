'use client';

import * as Dialog from '@radix-ui/react-dialog';

export function LoginModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <Dialog.Title className="font-heading text-2xl">Welcome back</Dialog.Title>
          <p className="mt-2 text-sm text-slate-500">Login with email or Google to continue checkout.</p>
          <div className="mt-6 space-y-3">
            <input placeholder="Email" className="w-full rounded-xl border p-3" />
            <input type="password" placeholder="Password" className="w-full rounded-xl border p-3" />
            <button className="w-full rounded-xl bg-primary py-3 text-white">Login with Email</button>
            <button className="w-full rounded-xl border py-3">Continue with Google</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
