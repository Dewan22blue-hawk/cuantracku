import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import LayoutClient from '@/components/layout-client';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CuanTrack — Personal Finance & Budgeting',
  description: 'Your personal AI-powered expense tracker and financial advisor.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          // base
          'min-h-screen font-sans antialiased relative',
          // new palette: light = slate/white, dark = slate-900
          'bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900',
          // text smoothing
          'text-slate-800 dark:text-slate-100',
          geistSans.variable,
          geistMono.variable
        )}
        suppressHydrationWarning
      >
        {/* Decorative gradients (pure CSS, no new deps) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.18),transparent)] blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgba(244,114,182,0.18),transparent)] blur-3xl" />
        </div>

        {/* Subtle grid to add depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06] dark:opacity-[0.08] [background-image:linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_1px)] [background-size:32px_32px]"
        />

        {/* Content */}
        <div className="relative z-10">
          <LayoutClient>{children}</LayoutClient>
        </div>
      </body>
    </html>
  );
}
