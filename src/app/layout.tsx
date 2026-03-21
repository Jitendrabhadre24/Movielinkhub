import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from "@/components/auth/auth-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: 'MOVIELINK HUB | Premium OTT Experience',
    template: '%s | MovieLink Hub'
  },
  description: 'Experience MovieLink Hub, the ultimate premium OTT platform for the latest movies, TV shows, and anime. Discover details, cast, and legal streaming options on Netflix, Prime Video, and more.',
  keywords: ['movies', 'streaming', 'OTT', 'TV shows', 'watchlist', 'premium content', 'legal streaming', 'watch online'],
  openGraph: {
    title: 'MOVIELINK HUB | Premium OTT',
    description: 'Premium OTT platform for blockbusters and trending shows.',
    url: 'https://movielink-hub.web.app',
    siteName: 'MovieLink Hub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOVIELINK HUB',
    description: 'Premium OTT experience with high-quality content discovery.',
  },
  robots: {
    index: true,
    follow: true,
  }
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
      </head>
      <body className="antialiased bg-background min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground">
        <AuthProvider>
          <main className="pb-20">
            {children}
          </main>
          <BottomNav />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
