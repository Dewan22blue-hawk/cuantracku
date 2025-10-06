import { TransactionDialog } from "./add-transaction-dialog";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { PlusCircle } from "lucide-react";
import { BudgetDialog } from "./budget-dialog";

export function Header() {
  return (
    <header className="p-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Track Moneyku</h1>
        <div className="flex items-center gap-2 md:gap-4">
          <ModeToggle />
          <BudgetDialog />
          <TransactionDialog
            trigger={
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Tambah Transaksi</span>
                <span className="inline md:hidden">Baru</span>
              </Button>
            }
          />
        </div>
      </div>
    </header>
  );
}
