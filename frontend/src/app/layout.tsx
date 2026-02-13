import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Remote Job Finder - Find Your Perfect Remote Job',
  description: 'Search 500+ remote jobs from RemoteOK, WeWorkRemotely, Reddit and more. Filter by no-phone jobs, salary, and categories. Updated every 6 hours.',
  keywords: 'remote jobs, work from home, no phone jobs, customer support, data entry, virtual assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
