'use client';

import { useState, useEffect } from 'react';
import { useTransactionStore, Budget } from '@/store/useTransactionStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const expenseCategories = ['Makanan', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Lainnya'];

export function BudgetDialog() {
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
      <DialogTrigger asChild>
        <Button variant="destructive">Atur Anggaran</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Atur Anggaran Bulanan</DialogTitle>
          <DialogDescription>Tetapkan batas pengeluaran untuk setiap kategori. Biarkan 0 jika tidak ada batas.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          {expenseCategories.map((category) => (
            <div key={category} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={category} className="text-right col-span-1">
                {category}
              </Label>
              <div className="col-span-3 relative flex items-center">
                <span className="text-sm text-muted-foreground pl-3">Rp</span>
                <Input id={category} type="number" placeholder="0" value={localBudgets[category] || ''} onChange={(e) => handleBudgetChange(category, e.target.value)} className="pl-9" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Simpan Anggaran</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
