'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = [
  '#4F46E5', // indigo-600
  '#0EA5E9', // sky-500
  '#14B8A6', // teal-500
  '#F43F5E', // rose-500
  '#818CF8', // indigo-400
  '#38BDF8', // sky-400
  '#2DD4BF', // teal-400
  '#FB7185', // rose-400
];

export function DashboardCharts() {
  const transactions = useTransactionStore((state) => state.transactions);

  const expenseData = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category);
      if (existing) existing.value += t.amount;
      else acc.push({ name: t.category, value: t.amount });
      return acc;
    }, [] as { name: string; value: number }[]);

  const last7Days = [...Array(7)]
    .map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    })
    .reverse();

  const dailyExpenseData = last7Days.map((day) => {
    const dayString = day.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const total = transactions.filter((t) => t.type === 'expense' && new Date(t.date).toLocaleDateString('en-CA') === dayString).reduce((acc, t) => acc + t.amount, 0);
    return {
      name: day.toLocaleDateString('id-ID', { weekday: 'short' }),
      total,
    };
  });

  const hasExpense = transactions.some((t) => t.type === 'expense');

  if (!hasExpense) {
    return (
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
        <CardHeader>
          <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Grafik Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400 py-12">
            <p>Belum ada data pengeluaran untuk ditampilkan di grafik.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
      <CardHeader>
        <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Analisis Grafik</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-sm md:text-md font-medium mb-2 text-center text-slate-700 dark:text-slate-200">Pengeluaran per Kategori</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={expenseData} cx="50%" cy="50%" labelLine={false} outerRadius={84} dataKey="value" nameKey="name">
                  {expenseData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(148,163,184,0.4)',
                    borderRadius: 12,
                    backdropFilter: 'blur(6px)',
                    color: 'rgb(15,23,42)',
                  }}
                  formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h3 className="text-sm md:text-md font-medium mb-4 text-center text-slate-700 dark:text-slate-200">Pengeluaran 7 Hari Terakhir</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={dailyExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.3)" />
                <XAxis dataKey="name" stroke="currentColor" fontSize={12} tickMargin={8} />
                <YAxis stroke="currentColor" fontSize={12} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(148,163,184,0.4)',
                    borderRadius: 12,
                    backdropFilter: 'blur(6px)',
                    color: 'rgb(15,23,42)',
                  }}
                  cursor={{ fill: 'rgba(2,6,23,0.06)' }}
                  formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]} fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
