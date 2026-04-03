import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://election.ontrends.in'),

  title: {
    default: 'Election Precounting Portal',
    template: '%s | Election Portal',
  },

  description:
    'A modern, secure platform for real-time election precounting, analytics, and result trends.',

  keywords: [
    'election',
    'precounting',
    'digital voting',
    'secure election',
    'real-time counting',
    'election trends',
  ],

  authors: [{ name: 'OnTrends' }],

  icons: {
    icon: '/fav.png',
    shortcut: '/fav.png',
    apple: '/fav.png',
  },

  openGraph: {
    title: 'Election Precounting Portal',
    description:
      'Secure and modern platform for digital elections and real-time counting.',
    url: 'https://election.ontrends.in',
    siteName: 'Election Portal',
    images: [
      {
        url: '/og-image.png', // add this image in public/
        width: 1200,
        height: 630,
        alt: 'Election Portal',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Election Precounting Portal',
    description:
      'Secure and modern platform for digital elections and real-time counting.',
    images: ['/og-image.png'],
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Election Portal',
  },

  formatDetection: {
    telephone: false,
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
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}