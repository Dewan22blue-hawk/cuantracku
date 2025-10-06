'use client';

import { Home, PlusCircle } from 'lucide-react';
import { BudgetDialog } from './budget-dialog';
import { TransactionDialog } from './add-transaction-dialog';
import { Button } from './ui/button';

export function BottomNavigation() {
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
      <div className="grid h-full max-w-lg grid-cols-3 mx-auto font-medium">
        {/* Transaction Dialog */}
        <div className="flex items-center justify-center">
          <TransactionDialog
            trigger={
              <Button
                variant="ghost"
                className="
                  inline-flex flex-col items-center justify-center px-5
                  hover:bg-accent hover:text-accent-foreground
                  active:scale-95 transition-all duration-150
                "
              >
                <PlusCircle className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                <span className="text-sm">Baru</span>
              </Button>
            }
          />
        </div>
        {/* Budget Dialog */}
        <div className="flex items-center justify-center">
          <BudgetDialog />
        </div>
        {/* Home Button */}
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            className="
              inline-flex flex-col items-center justify-center px-5
              hover:bg-accent hover:text-accent-foreground
              active:scale-95 transition-all duration-150
            "
            onClick={() => (window.location.href = '/')}
          >
            <Home className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
            <span className="text-sm">Beranda</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
