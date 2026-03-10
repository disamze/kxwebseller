'use client';

import { useEffect } from 'react';
import { API_URL } from '@/lib/api';

export function SiteKeepAlive() {
  useEffect(() => {
    const apiHealthUrl = `${API_URL}/health`;
    const clientHealthUrl = '/';

    const ping = () => {
      fetch(apiHealthUrl, { cache: 'no-store' }).catch(() => null);
      fetch(clientHealthUrl, { cache: 'no-store' }).catch(() => null);
    };

    ping();

    const timer = setInterval(ping, 60_000);

    return () => clearInterval(timer);
  }, []);

  return null;
}
