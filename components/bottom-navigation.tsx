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

  return (
    <nav
      className="
        fixed bottom-0 left-0 z-[120] w-full h-16 
        border-t border-border 

        bg-white/90 text-foreground 
        dark:bg-gray-900
        shadow-[0_-2px_10px_rgba(0,0,0,0.08)] 
        md:hidden
      "
    >
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="flex items-center justify-center">
              <Link href={item.href} passHref>
                <Button
                  variant="ghost"
                  className="inline-flex flex-col items-center justify-center px-5 h-full"
                >
                  <item.icon className={cn("w-5 h-5 mb-1", isActive && "text-emerald-500")} />
                  <span className={cn("text-sm", isActive && "text-emerald-500")}>{item.label}</span>
                </Button>
              </Link>
            </div>
          );
        })}

        {/* Transaction Dialog (Center Button) */}
        <div className="flex items-center justify-center">
          <TransactionDialog
            trigger={
              <Button
                variant="ghost"
                className="inline-flex flex-col items-center justify-center px-5 h-full"
              >
                <PlusCircle className="w-6 h-6 mb-1 text-emerald-500" />
                <span className="text-sm">Baru</span>
              </Button>
            }
          />
        </div>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <div key={item.href} className="flex items-center justify-center">
              <Link href={item.href} passHref>
                <Button
                  variant="ghost"
                  className="inline-flex flex-col items-center justify-center px-5 h-full"
                >
                  <item.icon className={cn("w-5 h-5 mb-1", isActive && "text-emerald-500")} />
                  <span className={cn("text-sm", isActive && "text-emerald-500")}>{item.label}</span>
                </Button>
              </Link>
            </div>
          );
        })}

        {/* Budget Dialog */}
        <div className="flex items-center justify-center">
          <BudgetDialog
            trigger={
              <Button
                variant="ghost"
                className="inline-flex flex-col items-center justify-center px-5 h-full"
              >
                <Wallet className="w-5 h-5 mb-1" />
                <span className="text-sm">Anggaran</span>
              </Button>
            }
          />
        </div>
      </div>
    </nav>
  );
}
