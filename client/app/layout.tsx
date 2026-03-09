import type { ReactNode } from 'react';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SiteKeepAlive } from '@/components/site-keepalive';
import { FloatingDashboardButton } from '@/components/floating-dashboard-button';
import { GlobalLoader } from '@/components/global-loader';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';

export const metadata = { title: 'KXMATERIALS' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalLoader />
        <SiteKeepAlive />
        <Navbar />
        {children}
        <Footer />
        <FloatingDashboardButton />
        <MobileBottomNav />
      </body>
    </html>
  );
}
