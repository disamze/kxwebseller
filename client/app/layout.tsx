import type { ReactNode } from 'react';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { SiteKeepAlive } from '@/components/site-keepalive';
import { FloatingDashboardButton } from '@/components/floating-dashboard-button';
import { GlobalLoader } from '@/components/global-loader';

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
      </body>
    </html>
  );
}
