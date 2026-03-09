'use client';

import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/api';

export function OfferBanner() {
  const [offer, setOffer] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/users/public-settings`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.offerEnabled && d?.offerText) setOffer(d.offerText);
      })
      .catch(() => null);
  }, []);

  if (!offer) return null;

  return (
    <div className="relative z-30 mx-auto mt-5 w-[95%] max-w-6xl rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 px-5 py-4 text-center text-base font-extrabold text-slate-900 shadow-xl sm:text-lg">
      🔥 LIMITED SALE LIVE: {offer}
    </div>
  );
}
