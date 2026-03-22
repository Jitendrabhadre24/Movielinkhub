import type { Metadata } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase';
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopNav } from "@/components/layout/top-nav";
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';

export const metadata: Metadata = {
  title: {
    default: 'MOVIELINK HUB | Watch Free Movies & Latest TV Shows Online',
    template: '%s | MovieLink Hub'
  },
  description: 'Experience MovieLink Hub, the ultimate premium OTT platform. Watch the latest blockbusters, trending TV shows, and top-rated anime for free. Discover where to stream on Netflix, Prime Video, and more.',
  keywords: [
    'free movies', 
    'watch online', 
    'latest movies 2024', 
    'streaming OTT', 
    'TV shows online', 
    'anime streaming', 
    'movie discovery', 
    'premium cinema', 
    'watchlist', 
    'legal streaming options'
  ],
  authors: [{ name: 'MovieLink Hub Team' }],
  openGraph: {
    title: 'MOVIELINK HUB | Watch Latest Movies & TV Shows',
    description: 'The ultimate premium OTT experience. Discover and track the best cinematic content across all platforms.',
    url: 'https://movielink-hub.web.app',
    siteName: 'MovieLink Hub',
    images: [
      {
        url: 'https://picsum.photos/seed/seo/1200/630',
        width: 1200,
        height: 630,
        alt: 'MovieLink Hub Premium OTT',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOVIELINK HUB | Premium OTT Experience',
    description: 'Stream the latest movies and TV shows. Your cinematic journey starts here.',
    images: ['https://picsum.photos/seed/seo/1200/630'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Adsterra Popunder Script */}
        <Script 
          src="https://actionfurmap.com/09/49/9d/09499d1cbbb3fe2df210a04980c1be6b.js" 
          strategy="beforeInteractive" 
        />
      </head>
      <body className="antialiased bg-background min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground">
        <FirebaseClientProvider>
          <TopNav />
          <main className="pb-20 pt-0">
            {children}
          </main>
          <BottomNav />
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
