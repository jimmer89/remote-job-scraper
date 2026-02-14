import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'ChillJobs - Remote Jobs. No Calls Required.',
  description: 'Find remote jobs that don\'t require phone calls. Browse 600+ positions from RemoteOK, WeWorkRemotely, Reddit, and more. Filter by no-phone jobs, salary, and category. Updated every 6 hours.',
  keywords: 'remote jobs, no phone jobs, work from home, lazy girl jobs, customer support, data entry, virtual assistant, introvert jobs, chat support, email support',
  authors: [{ name: 'PepLlu & Jaume' }],
  openGraph: {
    title: 'ChillJobs - Remote Jobs. No Calls Required.',
    description: 'Find remote jobs that don\'t require phone calls. The only job board with a no-phone filter.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ChillJobs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChillJobs - Remote Jobs. No Calls Required.',
    description: 'Find remote jobs that don\'t require phone calls. The only job board with a no-phone filter.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
