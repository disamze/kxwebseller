'use client';

import { useEffect } from 'react';
import { API_URL } from '@/lib/api';

export function SiteKeepAlive() {
  useEffect(() => {
    const healthUrl = `${API_URL}/health`;

    fetch(healthUrl).catch(() => null);

    const timer = setInterval(() => {
      fetch(healthUrl).catch(() => null);
    }, 300000);

    return () => clearInterval(timer);
  }, []);

  return null;
}
