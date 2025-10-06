'use client'

import { useTransactionStore } from "@/store/useTransactionStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)

export function BudgetTracker() {
  const { budgets, transactions } = useTransactionStore()

  if (budgets.length === 0) {
    return (
      <Card className="glass-card neumorphic-shadow-soft">
        <CardHeader>
          <CardTitle>Pelacak Anggaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>Anda belum mengatur anggaran. Atur sekarang untuk melacak pengeluaran!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const expensesThisMonth = transactions.filter(
    (t) => t.type === 'expense' && new Date(t.date) >= firstDayOfMonth
  )

  return (
    <Card className="glass-card neumorphic-shadow-soft">
      <CardHeader>
        <CardTitle>Pelacak Anggaran Bulan Ini</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.map((budget) => {
          const spent = expensesThisMonth
            .filter((t) => t.category === budget.category)
            .reduce((acc, t) => acc + t.amount, 0)
          
          const remaining = budget.limit - spent
          const percentage = (spent / budget.limit) * 100
          const progressBarColor = percentage > 100 ? "bg-red-500" : percentage > 75 ? "bg-yellow-500" : "bg-primary"

          return (
            <div key={budget.category}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{budget.category}</span>
                <span className="font-semibold">{percentage.toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(percentage, 100)} className={`h-2 ${progressBarColor}`} />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Terpakai: {formatCurrency(spent)}</span>
                <span>Sisa: {formatCurrency(remaining)}</span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
