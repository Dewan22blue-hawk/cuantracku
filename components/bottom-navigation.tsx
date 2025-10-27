'use client';

import { Home, PlusCircle, ShoppingCart, Archive, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';
import { BudgetDialog } from './budget-dialog';
import { TransactionDialog } from './add-transaction-dialog';
import { Button } from './ui/button';

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Beranda' },
    { href: '/shopping', icon: ShoppingCart, label: 'Belanja' },
    { href: '/inventory', icon: Archive, label: 'Stok' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      aria-label="Bottom navigation"
      className={cn('fixed bottom-0 left-0 z-[120] w-full h-16 md:hidden', 'border-t border-slate-200/70 dark:border-slate-800/70', 'bg-white/70 dark:bg-slate-900/70 backdrop-blur', 'shadow-[0_-8px_24px_rgba(2,6,23,0.06)]')}
    >
      <div className="grid h-full max-w-xl grid-cols-5 mx-auto font-medium">
        {navItems.slice(0, 2).map((item) => (
          <div key={item.href} className="flex items-center justify-center">
            <Link href={item.href} aria-label={item.label}>
              <Button variant="ghost" className="inline-flex flex-col items-center justify-center px-5 h-full">
                <item.icon className={cn('w-5 h-5 mb-1', isActive(item.href) ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400')} />
                <span className={cn('text-[13px]', isActive(item.href) ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400')}>{item.label}</span>
              </Button>
            </Link>
          </div>
        ))}

        {/* Center FAB: Transaction Dialog */}
        <div className="flex items-center justify-center">
          <TransactionDialog
            trigger={
              <button
                aria-label="Tambah transaksi"
                className={cn(
                  'inline-flex items-center justify-center -mt-6',
                  'h-14 w-14 rounded-full',
                  'bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white',
                  'shadow-lg shadow-rose-500/20 hover:shadow-xl active:scale-95 transition-all'
                )}
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            }
          />
        </div>

        {navItems.slice(2).map((item) => (
          <div key={item.href} className="flex items-center justify-center">
            <Link href={item.href} aria-label={item.label}>
              <Button variant="ghost" className="inline-flex flex-col items-center justify-center px-5 h-full">
                <item.icon className={cn('w-5 h-5 mb-1', isActive(item.href) ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400')} />
                <span className={cn('text-[13px]', isActive(item.href) ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400')}>{item.label}</span>
              </Button>
            </Link>
          </div>
        ))}

        {/* Budget Dialog */}
        <div className="flex items-center justify-center">
          <BudgetDialog
            trigger={
              <Button variant="ghost" aria-label="Atur anggaran" className="inline-flex flex-col items-center justify-center px-5 h-full">
                <Wallet className="w-5 h-5 mb-1 text-slate-500 dark:text-slate-400" />
                <span className="text-[13px] text-slate-600 dark:text-slate-400">Anggaran</span>
              </Button>
            }
          />
        </div>
      </div>
    </nav>
  );
}
