
import Link from 'next/link';
import { TransactionDialog } from './add-transaction-dialog';
import { ModeToggle } from './mode-toggle';
import { Button } from './ui/button';
import { PlusCircle } from 'lucide-react';
import { BudgetDialog } from './budget-dialog';

export function Header() {
  return (
    <header className="p-4 border-b backdrop-blur-sm bg-background/80 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" passHref>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 text-transparent bg-clip-text cursor-pointer">
              CuanTracku
            </h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Beranda
            </Link>
            <Link href="/shopping" className="text-muted-foreground hover:text-foreground transition-colors">
              Catatan Belanja
            </Link>
            <Link href="/inventory" className="text-muted-foreground hover:text-foreground transition-colors">
              Stok Barang
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <ModeToggle />
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            <BudgetDialog />
            <TransactionDialog
              trigger={
                <Button className="flex items-center gap-2">
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

