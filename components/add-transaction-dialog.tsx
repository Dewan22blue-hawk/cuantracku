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
          // optional: reset saat ditutup
          form.reset({ ...form.getValues(), category: '' });
        }
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="dialog-solid sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}</DialogTitle>
          <DialogDescription>{isEditMode ? 'Ubah detail transaksi Anda.' : 'Isi detail transaksi Anda. Klik simpan jika sudah selesai.'}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
                        <TabsTrigger value="income">Pemasukan</TabsTrigger>
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
                  <FormLabel>Nominal</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={Number.isFinite(field.value) ? field.value : 0}
                      onChange={(e) =>
                        field.onChange(
                          e.currentTarget.value === ''
                            ? '' // biarkan kosong di UI; akan dikoreksi zod saat submit
                            : e.currentTarget.valueAsNumber
                        )
                      }
                      onBlur={field.onBlur}
                    />
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
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Kopi susu" {...field} />
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
                  <FormLabel>Kategori</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white/90 dark:bg-zinc-900">
                      {(transactionType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                        <SelectItem key={cat} value={cat}>
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
                  <FormLabel>Tanggal Transaksi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className={cn('w-full pl-3 text-left font-normal ', !field.value && 'text-muted-foreground')}>
                          {field.value ? format(field.value, 'PPP') : <span>Pilih tanggal</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white/90 dark:bg-zinc-900/90" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={(d?: Date) => field.onChange(d ?? new Date())} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              {isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
