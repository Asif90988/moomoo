import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Neural Core Alpha-7 | Premium AI Trading Dashboard',
  description: 'Institutional-grade AI-powered trading platform with real-time analytics, smart execution, and autonomous decision making.',
  keywords: ['AI trading', 'algorithmic trading', 'financial dashboard', 'neural networks', 'trading platform'],
  authors: [{ name: 'Neural Core Systems' }],
  robots: 'noindex, nofollow', // Private trading system
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Neural Core Alpha-7 | Premium AI Trading Dashboard',
    description: 'Institutional-grade AI-powered trading platform',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Neural Core Alpha-7',
    description: 'Institutional-grade AI-powered trading platform',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
      </head>
      <body className="font-sans bg-neural-dark text-white antialiased overflow-hidden">
        <div id="root" className="h-screen w-screen">
          {children}
        </div>
        
        {/* Background Effects */}
        <div className="fixed inset-0 bg-neural-grid opacity-30 pointer-events-none" 
             style={{ backgroundSize: '20px 20px' }} />
        <div className="fixed inset-0 bg-holographic opacity-20 pointer-events-none animate-pulse-slow" 
             style={{ backgroundSize: '400% 400%' }} />
        
        {/* Loading Indicator */}
        <div id="loading-indicator" className="hidden fixed inset-0 bg-neural-dark/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 border-4 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
            <div className="text-neon-blue font-medium">Neural Core Initializing...</div>
          </div>
        </div>
        
        {/* Toast Container */}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
      </body>
    </html>
  );
}