import Link from 'next/link';
import { TransactionDialog } from './add-transaction-dialog';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { BudgetDialog } from './budget-dialog';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const nav = [
    { href: '/', label: 'Beranda' },
    { href: '/shopping', label: 'Catatan Belanja' },
    { href: '/inventory', label: 'Stok Barang' },
  ];

  return (
    <header
      className="p-3 md:p-4 border-b sticky top-0 z-10
                       bg-white/70 dark:bg-slate-900/70 backdrop-blur
                       border-slate-200/70 dark:border-slate-800/70"
    >
      <div className="container mx-auto flex justify-between items-center gap-3">
        <div className="flex items-center gap-5 md:gap-6">
          <Link href="/" passHref>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-transparent bg-clip-text cursor-pointer">CuanTracku</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
            {nav.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    'px-3 py-2 rounded-xl transition-colors',
                    active ? 'text-indigo-600 dark:text-indigo-300 bg-slate-100 dark:bg-slate-800' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <ModeToggle />
          <div className="hidden md:flex items-center gap-2">
            <BudgetDialog />
            <TransactionDialog
              trigger={
                <Button
                  className="flex items-center gap-2 rounded-xl
                                   bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white
                                   hover:opacity-95 active:opacity-90"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Tambah Transaksi</span>
                  <span className="inline sm:hidden">Baru</span>
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </header>
  );
}
