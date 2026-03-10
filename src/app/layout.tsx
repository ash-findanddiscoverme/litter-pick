import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import ServiceWorkerRegistrar from '@/components/layout/ServiceWorkerRegistrar';
import './globals.css';

const GTM_ID = 'GTM-P95RBR4N';
const GA_ID = 'G-MNP6MRQSXX';

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
      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      {/* Google Analytics (gtag.js) */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-config" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
      <body className="min-h-screen flex flex-col overflow-x-hidden">
          {/* Google Tag Manager (noscript) */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
          <ServiceWorkerRegistrar />
          {children}
        </body>
    </html>
  );
}
