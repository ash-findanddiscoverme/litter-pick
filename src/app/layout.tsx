import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ServiceWorkerRegistrar from '@/components/layout/ServiceWorkerRegistrar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Litter Pick — Care for your corner.',
  description: 'Report litter, find local hotspots, and join clean-ups near you. A simpler way to look after where you live.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Litter Pick',
  },
};

export const viewport: Viewport = {
  themeColor: '#3A6B1E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col">
          <ServiceWorkerRegistrar />
          {children}
        </body>
    </html>
  );
}
