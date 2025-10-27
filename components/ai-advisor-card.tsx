'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Wand2 } from 'lucide-react';

export function AIAdvisorCard() {
  const transactions = useTransactionStore((state) => state.transactions);

  const generateAISummary = () => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    if (expenses.length === 0) {
      return 'Anda belum memiliki data pengeluaran. Mulai catat transaksi untuk mendapatkan analisis dari AI.';
    }

    const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
    const categorySpending = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];

    const advice = `Pengeluaran terbesar Anda ada di kategori "${topCategory[0]}". Mungkin Anda bisa mencari alternatif yang lebih hemat di area ini. Misalnya, jika ini adalah 'Makanan', cobalah memasak di rumah beberapa kali seminggu. Mengurangi pengeluaran di kategori ini bahkan sebesar 15% dapat menghemat budget Anda secara signifikan!`;

    return (
      <div>
        <p className="mb-2 text-sm md:text-base">Halo! Saya adalah konsultan keuangan virtual Anda. Setelah menganalisis data keuangan Anda bulan ini, berikut adalah ringkasannya:</p>
        <ul className="list-disc pl-5 space-y-2 mb-4 text-sm md:text-base">
          <li>
            Total pengeluaran Anda adalah{' '}
            <strong className="text-sky-600 dark:text-sky-300">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(totalExpense)}
            </strong>
            .
          </li>
          <li>
            Kategori pengeluaran terbesar Anda adalah <strong className="text-indigo-600 dark:text-indigo-300">{topCategory[0]}</strong>, sekitar{' '}
            <strong className="text-rose-600 dark:text-rose-300">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(topCategory[1])}
            </strong>
            .
          </li>
        </ul>
        <h4 className="font-semibold mb-2 text-base md:text-lg">Saran Keuangan untuk Anda:</h4>
        <p className="text-muted-foreground text-sm md:text-base">{advice}</p>
      </div>
    );
  };

  return (
    <Card
      className="w-full rounded-2xl border border-slate-200/60 dark:border-slate-700/60
                 bg-white/70 dark:bg-slate-900/60 backdrop-blur
                 shadow-sm hover:shadow-md transition-shadow"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-lg font-bold tracking-tight">
          <Wand2 className="h-5 w-5 md:h-6 md:w-6 text-indigo-600 dark:text-indigo-300" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Saran Keuangan dari AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">Dapatkan ringkasan dan tips untuk mengoptimalkan keuangan Anda sebagai anak kos.</p>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="w-full h-10 rounded-xl
                         bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white
                         hover:opacity-95 active:opacity-90 transition-opacity"
            >
              Dapatkan Analisis Keuangan
            </Button>
          </DialogTrigger>
          <DialogContent
            className="w-[95vw] max-w-lg rounded-2xl bg-white/85 dark:bg-slate-900/80
                       border border-slate-200/60 dark:border-slate-700/60 backdrop-blur
                       max-h-[85vh] overflow-y-auto"
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base md:text-lg font-bold tracking-tight">
                <Wand2 className="h-5 w-5 md:h-6 md:w-6 text-sky-600 dark:text-sky-300" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Analisis Keuangan Virtual</span>
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm">Berikut adalah hasil analisis dari data keuangan Anda.</DialogDescription>
            </DialogHeader>
            <div className="py-2">{generateAISummary()}</div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
