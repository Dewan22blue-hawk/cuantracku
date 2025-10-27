'use client';

import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur border-t border-slate-200/70 dark:border-slate-800/70 p-4 mt-auto">
      <div className="container mx-auto text-center text-sm text-slate-600 dark:text-slate-400">
        <p className="flex items-center justify-center gap-1">
          Dibuat dengan <Heart className="w-4 h-4 text-rose-500" /> oleh dwncode
        </p>
        <p className="mt-1">&copy; {new Date().getFullYear()} CuanTracku. All rights reserved.</p>
      </div>
    </footer>
  );
}
