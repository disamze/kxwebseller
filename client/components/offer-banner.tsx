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

  return <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-center text-sm font-semibold text-slate-900">🔥 {offer}</div>;
}
