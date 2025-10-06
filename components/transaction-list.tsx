'use client'

import { useTransactionStore, Transaction } from "@/store/useTransactionStore"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { TransactionDialog } from "./add-transaction-dialog"
import { DeleteTransactionDialog } from "./delete-transaction-dialog"

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

interface TransactionListProps {
  transactions?: Transaction[];
}

export function TransactionList({ transactions: transactionsProp }: TransactionListProps) {
  const storeTransactions = useTransactionStore((state) => state.transactions)
  const transactions = transactionsProp || storeTransactions;

  if (transactions.length === 0) {
    return (
      <Card className="glass-card neumorphic-shadow-soft">
        <CardHeader>
          <CardTitle>Belum Ada Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-sm">
              Tidak ada transaksi yang cocok dengan filter Anda, atau Anda belum menambahkan transaksi apapun.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const groupedTransactions = transactions.reduce((acc, t) => {
    const date = t.date.split('T')[0] // Group by YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(t)
    return acc
  }, {} as Record<string, Transaction[]>)

  const sortedDates = Object.keys(groupedTransactions).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="glass-card neumorphic-shadow-soft p-4 md:p-6">
      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date}>
            <h3 className="text-lg font-semibold mb-2 border-b pb-2 border-white/10">
              {formatDate(date)}
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedTransactions[date].map((t) => (
                  <TableRow key={t.id} className="border-white/10">
                    <TableCell>
                      <div className="font-medium">{t.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {t.category}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        t.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                    </TableCell>
                    <TableCell className="text-right flex justify-end items-center">
                      <TransactionDialog
                        transactionToEdit={t}
                        trigger={
                          <Button variant="ghost" size="icon" className="mr-2">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DeleteTransactionDialog transactionId={t.id} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  )
}
