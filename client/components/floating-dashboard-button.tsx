'use client';

import Link from 'next/link';
import { getSessionUser } from '@/lib/api';
import { useEffect, useState } from 'react';

export function FloatingDashboardButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(!!getSessionUser());
    sync();
    window.addEventListener('session-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('session-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!visible) return null;

  return (
    <Link
      href="/dashboard"
      className="fixed bottom-5 right-5 z-50 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:scale-105"
    >
      Go to Dashboard
    </Link>
  );
}
