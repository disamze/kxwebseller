'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function GlobalLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 700);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="loader-radial-bg" />

      <div className="relative flex flex-col items-center gap-6 text-center">
        <div className="relative h-32 w-32">
          <span className="loader-ring loader-ring-1" />
          <span className="loader-ring loader-ring-2" />
          <span className="loader-ring loader-ring-3" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-heading text-xl font-bold tracking-widest text-white">KX</span>
          </div>
        </div>

        <div>
          <h2 className="font-heading text-2xl font-bold text-white">KXMATERIALS</h2>
          <p className="mt-1 text-sm text-cyan-200">Loading your premium learning experience...</p>
        </div>

        <div className="h-1.5 w-64 overflow-hidden rounded-full bg-white/15">
          <div className="loader-progress h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500" />
        </div>
      </div>
    </div>
  );
}
