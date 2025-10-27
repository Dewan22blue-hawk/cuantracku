'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useTransactionStore, Budget } from '../store/useTransactionStore';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

const expenseCategories = ['Makanan', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Lainnya'];

interface BudgetDialogProps {
  trigger?: ReactNode;
}

export function BudgetDialog({ trigger }: BudgetDialogProps) {
  const { budgets, setBudgets } = useTransactionStore();
  const [localBudgets, setLocalBudgets] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const initialBudgets = budgets.reduce((acc, budget) => {
      acc[budget.category] = budget.limit;
      return acc;
    }, {} as Record<string, number>);
    setLocalBudgets(initialBudgets);
  }, [budgets, open]);

  const handleBudgetChange = (category: string, value: string) => {
    const amount = Number(value);
    setLocalBudgets((prev) => ({
      ...prev,
      [category]: amount > 0 ? amount : 0,
    }));
  };

  const handleSave = () => {
    const newBudgets: Budget[] = Object.entries(localBudgets)
      .filter(([, limit]) => limit > 0)
      .map(([category, limit]) => ({ category, limit }));
    setBudgets(newBudgets);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button className="rounded-xl bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white hover:opacity-95 active:opacity-90">Atur Anggaran</Button>}</DialogTrigger>

      <DialogContent className={cn('sm:max-w-[480px] rounded-2xl', 'border border-slate-200/60 dark:border-slate-700/60', 'bg-white/80 dark:bg-slate-900/70 backdrop-blur', 'shadow-xl')}>
        <DialogHeader>
          <DialogTitle
            className="text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent
                       bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500
                       dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300"
          >
            Atur Anggaran Bulanan
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Tetapkan batas pengeluaran untuk setiap kategori. Biarkan 0 jika tidak ada batas.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
          {expenseCategories.map((category) => (
            <div key={category} className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor={category} className="text-right col-span-1 text-sm text-slate-600 dark:text-slate-300">
                {category}
              </Label>
              <div className="col-span-3 relative flex items-center">
                <span className="pointer-events-none absolute left-3 text-sm text-slate-400">Rp</span>
                <Input
                  id={category}
                  type="number"
                  placeholder="0"
                  value={localBudgets[category] ?? ''}
                  onChange={(e) => handleBudgetChange(category, e.target.value)}
                  className="h-11 pl-9 rounded-xl bg-white/70 dark:bg-slate-950/40
                             border-slate-200/70 dark:border-slate-700/60
                             focus-visible:ring-2 focus-visible:ring-sky-400"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white
                       hover:opacity-95 active:opacity-90 transition-opacity"
          >
            Simpan Anggaran
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
