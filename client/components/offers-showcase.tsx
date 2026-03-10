'use client';

import { useEffect, useMemo, useState } from 'react';
import { API_URL } from '@/lib/api';

type PublicSettings = {
  offerEnabled?: boolean;
  offerText?: string;
  offerEndsAt?: string;
  coupons?: { code: string; percent: number }[];
};

export function OffersShowcase() {
  const [settings, setSettings] = useState<PublicSettings>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    fetch(`${API_URL}/users/public-settings`)
      .then((r) => r.json())
      .then((d) => setSettings(d || {}))
      .catch(() => setSettings({}));

    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const countdown = useMemo(() => {
    if (!settings.offerEndsAt) return null;
    const diff = new Date(settings.offerEndsAt).getTime() - now;
    if (diff <= 0) return 'Offer ended';
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  }, [settings.offerEndsAt, now]);

  const coupons = settings.coupons || [];

  return (
    <section className="mx-auto max-w-6xl px-6 pb-12">
      <div className="rounded-3xl border bg-gradient-to-r from-amber-100 via-orange-100 to-pink-100 p-6 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-pink-900/30">
        <h3 className="font-heading text-3xl">Offers & Coupons</h3>
        {settings.offerEnabled ? <p className="mt-2 text-sm font-semibold">🔥 {settings.offerText || 'Limited time offer live now!'}</p> : <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">No active offer right now. Check coupons below.</p>}
        {countdown ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Offer countdown: <b>{countdown}</b></p> : null}

        {coupons.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {coupons.map((c) => (
              <span key={c.code} className="rounded-full border bg-white px-3 py-1 text-sm font-semibold dark:bg-slate-900">
                {c.code} • {c.percent}% OFF
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No active coupons right now.</p>
        )}
      </div>
    </section>
  );
}
