'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export function BudgetTracker() {
  const { budgets, transactions } = useTransactionStore();

  if (budgets.length === 0) {
    return (
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Pelacak Anggaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400 py-10">
            <p>Anda belum mengatur anggaran. Atur sekarang untuk melacak pengeluaran!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const expensesThisMonth = transactions.filter((t) => t.type === 'expense' && new Date(t.date) >= firstDayOfMonth);

  return (
    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
      <CardHeader>
        <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Pelacak Anggaran Bulan Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {budgets.map((budget) => {
          const spent = expensesThisMonth.filter((t) => t.category === budget.category).reduce((acc, t) => acc + t.amount, 0);

          const limit = budget.limit > 0 ? budget.limit : 1; // guard agar tidak NaN/Infinity
          const percentage = (spent / limit) * 100;
          const clamped = Math.min(percentage, 100);

          // Warna indikator progress via child selector agar kompatibel dengan shadcn Progress
          const progressColorClass = percentage > 100 ? '[&>div]:bg-rose-500' : percentage > 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-sky-500';

          return (
            <div key={budget.category}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-200">{budget.category}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{percentage.toFixed(0)}%</span>
              </div>

              <Progress value={clamped} className={`h-2 rounded-full ${progressColorClass}`} />

              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span>Terpakai: {formatCurrency(spent)}</span>
                <span>Sisa: {formatCurrency(budget.limit - spent)}</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
