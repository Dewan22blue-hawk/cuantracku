'use client'

import { useTransactionStore } from "@/store/useTransactionStore"
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#FA8072",
  "#AF19FF",
  "#FFC0CB",
]

export function DashboardCharts() {
  const transactions = useTransactionStore((state) => state.transactions)

  const expenseData = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      const existing = acc.find((item) => item.name === t.category)
      if (existing) {
        existing.value += t.amount
      } else {
        acc.push({ name: t.category, value: t.amount })
      }
      return acc
    }, [] as { name: string; value: number }[])

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d
  }).reverse()

  const dailyExpenseData = last7Days.map(day => {
    const dayString = day.toLocaleDateString('en-CA') // YYYY-MM-DD
    const total = transactions
      .filter(t => t.type === 'expense' && new Date(t.date).toLocaleDateString('en-CA') === dayString)
      .reduce((acc, t) => acc + t.amount, 0)
    return {
      name: day.toLocaleDateString('id-ID', { weekday: 'short' }),
      total,
    }
  })

  if (transactions.filter(t => t.type === 'expense').length === 0) {
    return (
      <Card className="glass-card neumorphic-shadow-soft">
        <CardHeader>
          <CardTitle>Grafik Pengeluaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>Belum ada data pengeluaran untuk ditampilkan di grafik.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card neumorphic-shadow-soft">
      <CardHeader>
        <CardTitle>Analisis Grafik</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-md font-medium mb-2 text-center">Pengeluaran per Kategori</h3>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {expenseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(value)
                  }
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <h3 className="text-md font-medium mb-4 text-center">Pengeluaran 7 Hari Terakhir</h3>
           <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={dailyExpenseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--foreground))" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  cursor={{ fill: "hsla(var(--card-hsl), 0.5)" }}
                  formatter={(value: number) =>
                    new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(value)
                  }
                />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
