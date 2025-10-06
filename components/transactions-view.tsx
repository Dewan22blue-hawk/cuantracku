'use client'

import { useState } from "react"
import { DateRange } from "react-day-picker"
import { useTransactionStore } from "@/store/useTransactionStore"
import { TransactionFilters } from "./transaction-filters"
import { TransactionList } from "./transaction-list"

export function TransactionsView() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined
  )

  const allTransactions = useTransactionStore((state) => state.transactions)

  const filteredTransactions = allTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    const categoryMatch = selectedCategory
      ? transaction.category === selectedCategory
      : true
    const dateMatch = dateRange
      ? (dateRange.from ? transactionDate >= dateRange.from : true) &&
        (dateRange.to ? transactionDate <= dateRange.to : true)
      : true
    return categoryMatch && dateMatch
  })

  return (
    <div>
      <TransactionFilters 
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      <TransactionList transactions={filteredTransactions} />
    </div>
  )
}
