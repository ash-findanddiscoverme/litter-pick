import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ServiceWorkerRegistrar from '@/components/layout/ServiceWorkerRegistrar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Litter Pick — Care for your corner.',
  description: 'Report litter, find local hotspots, and join picks near you. A simpler way to look after where you live.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Litter Pick',
  },
  openGraph: {
    siteName: 'Litter Pick',
    type: 'website',
    title: 'Litter Pick — Care for your corner.',
    description: 'Report litter, find local hotspots, and join picks near you. A simpler way to look after where you live.',
    url: 'https://litter-pick.com',
  },
  twitter: {
    card: 'summary',
    title: 'Litter Pick — Care for your corner.',
    description: 'Report litter, find local hotspots, and join picks near you. A simpler way to look after where you live.',
  },
};

export const viewport: Viewport = {
  themeColor: '#4AA853',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
          <ServiceWorkerRegistrar />
          {children}
        </body>
    </html>
  );
}
