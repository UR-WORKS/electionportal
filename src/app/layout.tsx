import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Election Portal | Secure & Transparent',
  description: 'A modern, secure, and transparent platform for digital elections.',
  keywords: 'election, portal, digital voting, secure, transparent',
  icons: {
    icon: '/fav.png',
    apple: '/fav.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Election Portal',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#10B981',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
