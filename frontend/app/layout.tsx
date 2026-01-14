import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'SmartDocs Auth',
  description: 'Auth demo with NestJS and Next.js',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-primary text-slate-50">
        <div className="relative min-h-screen overflow-hidden">
          {/* Fixed elegant nav with gold accent border */}
          <header className="fixed top-0 left-0 right-0 z-50 border-b border-accent/10 bg-primary/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-accent text-2xl font-bold text-primary">S</div>
                <div className="leading-tight">
                  <div className="font-display text-xl font-bold text-white">SmartDocs</div>
                  <div className="text-xs text-slate-400">Intelligence Suite</div>
                </div>
              </div>
              <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
                <Link className="transition hover:text-accent" href="/">Home</Link>
                <Link className="transition hover:text-accent" href="/login">Login</Link>
                <Link className="rounded bg-accent px-4 py-2 font-semibold uppercase tracking-wider text-primary transition hover:bg-accent-dark" href="/register">Get Started</Link>
              </nav>
            </div>
          </header>
          
          <main className="relative z-10 flex min-h-screen items-center justify-center px-4 pb-10 pt-20 sm:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
