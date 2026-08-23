import React from 'react';
import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import PwaEnhancements from '@/components/ui/PwaEnhancements';
import '../styles/tailwind.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7c3aed',
};

export const metadata: Metadata = {
  title: 'Zoox — Gaming Center Management System',
  description:
    'Zoox helps gaming centers manage rooms, sessions, reservations, and café sales from one fast operational dashboard.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Zoox',
  appleWebApp: {
    capable: true,
    title: 'Zoox',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="font-sans" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <PwaEnhancements />

        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('zoox-theme');if(t==='light'||(!t&&matchMedia('(prefers-color-scheme: light)').matches)){document.documentElement.classList.add('light')}}catch(e){}`,
          }}
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){window.addEventListener('load',function(){var isLocal=location.hostname==='localhost'||location.hostname==='127.0.0.1';if(isLocal){navigator.serviceWorker.getRegistrations().then(function(regs){regs.forEach(function(reg){reg.unregister()})});return}navigator.serviceWorker.register('/sw.js').catch(function(){})})}`,
          }}
        />
      </body>
    </html>
  );
}
