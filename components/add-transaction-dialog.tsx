'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { cn } from '@/lib/utils';
import { useTransactionStore, Transaction } from '@/store/useTransactionStore';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const formSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive({ message: 'Amount must be positive.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  category: z.string().min(1, { message: 'Category is required.' }),
  date: z.date(),
});

type FormValues = z.infer<typeof formSchema>;
type TxType = FormValues['type'];

const expenseCategories = ['Makanan', 'Transportasi', 'Tagihan', 'Hiburan', 'Belanja', 'Kesehatan', 'Pendidikan', 'Lainnya'] as const;
const incomeCategories = ['Gaji', 'Bonus', 'Hadiah', 'Investasi', 'Lainnya'] as const;

interface TransactionDialogProps {
  trigger: React.ReactNode;
  transactionToEdit?: Transaction;
}

export function TransactionDialog({ trigger, transactionToEdit }: TransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TxType>(transactionToEdit?.type ?? 'expense');
  const { addTransaction, updateTransaction } = useTransactionStore();

  const isEditMode = Boolean(transactionToEdit);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isEditMode && transactionToEdit) {
      form.reset({
        type: transactionToEdit.type as TxType,
        amount: Number(transactionToEdit.amount),
        description: transactionToEdit.description ?? '',
        category: transactionToEdit.category ?? '',
        date: new Date(transactionToEdit.date),
      });
      setTransactionType(transactionToEdit.type as TxType);
    } else {
      form.reset({
        type: 'expense',
        amount: 0,
        description: '',
        category: '',
        date: new Date(),
      });
      setTransactionType('expense');
    }
  }, [isEditMode, transactionToEdit, form, open]);

  function onSubmit(values: FormValues) {
    if (isEditMode && transactionToEdit) {
      updateTransaction({
        ...transactionToEdit,
        ...values,
        date: values.date.toISOString(),
      });
    } else {
      addTransaction({
        id: uuidv4(),
        ...values,
        date: values.date.toISOString(),
      });
    }
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          form.reset({ ...form.getValues(), category: '' });
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className={cn('sm:max-w-[440px] rounded-2xl', 'border border-slate-200/60 dark:border-slate-700/60', 'bg-white/80 dark:bg-slate-900/70 backdrop-blur', 'shadow-xl')}>
        <DialogHeader>
          <DialogTitle className="text-lg md:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">
            {isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{isEditMode ? 'Ubah detail transaksi Anda.' : 'Isi detail transaksi Anda. Klik simpan jika sudah selesai.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* TYPE */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={(value: string) => {
                        const typedValue = value as TxType;
                        field.onChange(typedValue);
                        setTransactionType(typedValue);
                        form.setValue('category', '');
                      }}
                      className="w-full"
                    >
                      <TabsList className={cn('grid w-full grid-cols-2 rounded-xl', 'bg-slate-100/70 dark:bg-slate-800/60', 'p-1')}>
                        <TabsTrigger
                          value="expense"
                          className={cn(
                            'rounded-lg data-[state=active]:text-white',
                            'data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-sky-500 data-[state=active]:to-rose-500',
                            'transition-colors'
                          )}
                        >
                          Pengeluaran
                        </TabsTrigger>
                        <TabsTrigger
                          value="income"
                          className={cn(
                            'rounded-lg data-[state=active]:text-white',
                            'data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:via-sky-500 data-[state=active]:to-rose-500',
                            'transition-colors'
                          )}
                        >
                          Pemasukan
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AMOUNT */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-300">Nominal</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rp</span>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        className="pl-9 pr-3 h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60 focus-visible:ring-2 focus-visible:ring-sky-400"
                        value={Number.isFinite(field.value) ? field.value : 0}
                        onChange={(e) => field.onChange(e.currentTarget.value === '' ? '' : e.currentTarget.valueAsNumber)}
                        onBlur={field.onBlur}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DESCRIPTION */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-300">Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kopi susu" className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60 focus-visible:ring-2 focus-visible:ring-sky-400" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CATEGORY */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-300">Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60 focus:ring-sky-400">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      {(transactionType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                        <SelectItem key={cat} value={cat} className="cursor-pointer">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DATE */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-sm font-medium text-slate-600 dark:text-slate-300">Tanggal Transaksi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn('w-full pl-3 pr-3 h-11 justify-between rounded-xl', 'bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60', 'hover:bg-white/90 dark:hover:bg-slate-900/60')}
                        >
                          <span className="text-left font-normal">{field.value ? format(field.value, 'PPP') : <span className="text-muted-foreground">Pilih tanggal</span>}</span>
                          <CalendarIcon className="ml-3 h-4 w-4 opacity-60" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur rounded-xl border border-slate-200/60 dark:border-slate-700/60" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={(d?: Date) => field.onChange(d ?? new Date())} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className={cn('w-full h-11 rounded-xl', 'bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white', 'hover:opacity-95 active:opacity-90', 'transition-opacity')}>
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
