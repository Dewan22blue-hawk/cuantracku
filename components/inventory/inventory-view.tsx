'use client';

import { useState, useEffect, useMemo } from 'react';
import { useShoppingStore } from '../../store/useShoppingStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Minus, TriangleAlert, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';

export function InventoryView() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);

  const { inventory, categories, addInventoryItem, adjustInventoryStock } = useShoppingStore();

  const outOfStockItems = useMemo(() => {
    return inventory.filter((item) => item.currentStock === 0);
  }, [inventory]);

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const currentStock = parseFloat(formData.get('currentStock') as string);
    const minStock = parseFloat(formData.get('minStock') as string);
    const unit = (formData.get('unit') as string) || 'pcs';
    const category = (formData.get('category') as string) || 'Lainnya';

    if (name && !isNaN(currentStock) && !isNaN(minStock)) {
      addInventoryItem({ name, currentStock, minStock, unit, category });
      e.currentTarget.reset();
    }
  };

  if (!isClient) return null; // hindari hydration mismatch

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Banner Stok Habis */}
      {outOfStockItems.length > 0 && (
        <Card className={cn('rounded-2xl border bg-white/75 dark:bg-slate-900/70 backdrop-blur', 'border-rose-200/60 dark:border-rose-700/60 shadow-sm')}>
          <CardHeader className="flex flex-row items-start gap-3 pb-2">
            <div className="mt-1">
              <TriangleAlert className="h-5 w-5 text-rose-500" />
            </div>
            <div>
              <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-rose-400 dark:from-rose-400 dark:to-rose-300">Stok Habis!</CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-300">Segera tambahkan item berikut ke daftar belanja Anda.</p>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="list-disc list-inside text-sm font-medium text-rose-600 dark:text-rose-400">
              {outOfStockItems.map((item) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Form Tambah Item */}
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Tambah Item ke Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
            <Input name="name" placeholder="Nama Item" required className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60" />
            <Input name="currentStock" type="number" placeholder="Stok Saat Ini" required className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60" />
            <Input name="minStock" type="number" placeholder="Stok Minimum" required className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60" />
            {/* Select Kategori (UI saja; logika tetap) */}
            <Select name="category">
              <SelectTrigger className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200/60 dark:border-slate-700/60">
                {(categories?.length ? categories : ['Lainnya']).map((c: string) => (
                  <SelectItem key={c} value={c} className="cursor-pointer">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input name="unit" placeholder="Unit (cth: kg, pcs)" className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60" />
            <Button type="submit" className="h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white hover:opacity-95 active:opacity-90 transition-opacity col-span-1 sm:col-span-2 lg:col-span-1">
              Tambah Stok
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Daftar Stok */}
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Stok Barang di Rumah</CardTitle>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-10">Belum ada barang di stok.</p>
          ) : (
            <div className="space-y-3">
              {inventory.map((item) => {
                const cap = Math.max(item.minStock || 1, 1); // guard
                const pct = Math.min(100, Math.round((item.currentStock / cap) * 100));
                const status: 'empty' | 'low' | 'ok' = item.currentStock === 0 ? 'empty' : item.currentStock < item.minStock ? 'low' : 'ok';

                const progressColor = status === 'empty' ? '[&>div]:bg-rose-500' : status === 'low' ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500';

                return (
                  <div key={item.id} className="flex items-center gap-4 p-3 md:p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/50 hover:shadow-md transition-shadow">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                            status === 'empty' && 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/30',
                            status === 'low' && 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30',
                            status === 'ok' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                          )}
                        >
                          <Tag className="h-3.5 w-3.5 opacity-70" />
                          {status === 'empty' ? 'Habis' : status === 'low' ? 'Rendah' : 'Aman'}
                        </span>
                      </div>

                      <p className={cn('text-sm mt-0.5', status === 'empty' ? 'text-rose-600 dark:text-rose-300' : status === 'low' ? 'text-amber-600 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400')}>
                        Stok: {item.currentStock} / {item.minStock} {item.unit}
                      </p>

                      <div className="mt-2">
                        <Progress value={pct} className={cn('h-2 rounded-full', progressColor)} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="icon" variant="outline" onClick={() => adjustInventoryStock(item.id, -1)} className="rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60" aria-label={`Kurangi stok ${item.name}`}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="outline" onClick={() => adjustInventoryStock(item.id, 1)} className="rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60" aria-label={`Tambah stok ${item.name}`}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
