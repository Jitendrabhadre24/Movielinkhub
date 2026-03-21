
import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from "@/components/auth/auth-provider";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: 'MOVIELINK HUB | Premium OTT Experience',
    template: '%s | MovieLink Hub'
  },
  description: 'Experience the ultimate OTT platform for premium movies, TV shows, and anime. Stream high-quality content on MovieLink Hub.',
  openGraph: {
    title: 'MOVIELINK HUB | Premium OTT',
    description: 'Premium OTT platform for blockbusters and trending shows.',
    url: 'https://movielink-hub.firebaseapp.com',
    siteName: 'MovieLink Hub',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MOVIELINK HUB',
    description: 'Premium OTT experience.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background min-h-screen text-foreground selection:bg-primary selection:text-primary-foreground">
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
