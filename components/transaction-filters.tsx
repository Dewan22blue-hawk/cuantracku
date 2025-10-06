"use client";

import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactionStore } from "@/store/useTransactionStore";

interface TransactionFiltersProps {
  dateRange: DateRange | undefined;
  setDateRange: (date: DateRange | undefined) => void;
  selectedCategory: string | undefined;
  setSelectedCategory: (category: string | undefined) => void;
}

export function TransactionFilters({
  dateRange,
  setDateRange,
  selectedCategory,
  setSelectedCategory,
}: TransactionFiltersProps) {
  const transactions = useTransactionStore((state) => state.transactions);
  const allCategories = [...new Set(transactions.map((t) => t.category))];

  const handleReset = () => {
    setDateRange(undefined);
    setSelectedCategory(undefined);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
      <div className={cn("grid gap-2")}>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 bg-white/90" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y", { locale: id })} -{" "}
                    {format(dateRange.to, "LLL dd, y", { locale: id })}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y", { locale: id })
                )
              ) : (
                <span>Pilih rentang tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white/90" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className="w-full md:w-[200px] bg-white/90">
          <SelectValue placeholder="Filter per kategori" />
        </SelectTrigger>
        <SelectContent className="bg-white/90">
          {allCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleReset} variant="ghost">
        Reset
      </Button>
    </div>
  );
}
