'use client';

import { useTransactionStore } from '@/store/useTransactionStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteTransactionDialogProps {
  transactionId: string;
}

export function DeleteTransactionDialog({ transactionId }: DeleteTransactionDialogProps) {
  const deleteTransaction = useTransactionStore((state) => state.deleteTransaction);

  const handleDelete = () => {
    deleteTransaction(transactionId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-rose-50/60 dark:hover:bg-rose-950/30">
          <Trash2 className="h-4 w-4 text-rose-500" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className={cn('rounded-2xl border border-slate-200/60 dark:border-slate-700/60', 'bg-white/85 dark:bg-slate-900/75 backdrop-blur shadow-xl')}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Apakah Anda Yakin?</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 dark:text-slate-300">Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data transaksi Anda secara permanen.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-95 active:opacity-90">
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
