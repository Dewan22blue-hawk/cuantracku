'use client';

import { useEffect, useState, useMemo } from 'react';
import { useShoppingStore } from '../../store/useShoppingStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { calcTotals, exportToJson, importFromJson } from '../../lib/shopping-utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { History, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

// --- Price History (restyle only)
function PriceHistoryPopover({ itemName, itemUnit }: { itemName: string; itemUnit: string }) {
  const { priceHistory } = useShoppingStore();

  const relevantHistory = useMemo(() => {
    return priceHistory.filter((h) => h.itemName.toLowerCase() === itemName.toLowerCase() && h.unit === itemUnit).sort((a, b) => b.date - a.date);
  }, [priceHistory, itemName, itemUnit]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <History className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur border border-slate-200/60 dark:border-slate-700/60">
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-800 dark:text-slate-100">Riwayat Harga: {itemName}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">Harga terakhir untuk item ini.</p>
          {relevantHistory.length > 0 ? (
            <div className="grid gap-2 text-sm">
              {relevantHistory.map((h) => (
                <div key={h.id} className="grid grid-cols-3 items-center gap-2">
                  <span className="text-slate-600 dark:text-slate-300">{new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                  <span className="truncate text-slate-600 dark:text-slate-300">{h.store}</span>
                  <span className="font-semibold text-right text-slate-800 dark:text-slate-100">Rp{h.price.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada riwayat harga.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// --- Budget Info (restyle only)
function BudgetInfo({ category, listEstTotal }: { category: string; listEstTotal: number }) {
  const { budgets, transactions } = useTransactionStore();
  const budget = budgets.find((b) => b.category === category);

  const spent = useMemo(() => {
    if (!budget) return 0;
    return transactions.filter((t) => t.category === budget.category && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, budget]);

  if (!budget) return null;

  const remaining = budget.limit - spent;
  const remainingAfterShopping = remaining - listEstTotal;

  return (
    <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Info Budget: {category}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm grid grid-cols-3 gap-3">
        <div>
          <p className="text-slate-500 dark:text-slate-400">Sisa Budget</p>
          <p className="font-semibold text-slate-800 dark:text-slate-100">Rp{remaining.toLocaleString('id-ID')}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Estimasi Belanja</p>
          <p className="font-semibold text-rose-600 dark:text-rose-300">- Rp{listEstTotal.toLocaleString('id-ID')}</p>
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400">Sisa Akhir</p>
          <p className={`font-bold ${remainingAfterShopping < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}`}>Rp{remainingAfterShopping.toLocaleString('id-ID')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ShoppingView() {
  const [isClient, setIsClient] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [newItemCategory, setNewItemCategory] = useState("Lainnya");

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shoppingStore = useShoppingStore();
  const { lists, activeListId, setActiveList, createList, addItem, togglePurchased, removeItem, importData, exportData, linkListToBudget, completeAndRecordTransaction, clearShoppingList, removeSelectedItems } = shoppingStore;

  const { budgets } = useTransactionStore();

  const activeList = useMemo(() => lists.find((l) => l.id === activeListId), [lists, activeListId]);
  const totals = useMemo(() => calcTotals(activeList), [activeList]);
  const isCompleted = activeList?.status === 'completed';

  useEffect(() => setSelectedItems([]), [activeListId, selectionMode]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cuantrack:shopping:v1' || event.key === 'track-moneyku-storage') {
        useShoppingStore.persist.rehydrate();
        useTransactionStore.persist.rehydrate();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeListId || isCompleted) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const qty = parseFloat(formData.get("qty") as string);
    const estPrice = parseFloat(formData.get("estPrice") as string);
    const unit = formData.get("unit") as string || 'pcs';

    if (name && qty > 0 && estPrice >= 0) {
      addItem(activeListId, {
        name,
        qty,
        unit,
        estPrice,
        category: newItemCategory, // Use state instead of form data
        notes: "",
      });
      e.currentTarget.reset();
    }
  };

  if (!isClient) return null;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Card */}
      <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Daftar Belanja</CardTitle>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Button onClick={() => exportToJson(exportData(), 'cuantrack-shopping.json')} className="rounded-xl">
              Export
            </Button>

            {/* File input: tetap pakai input asli, hanya dirapikan */}
            <Input
              type="file"
              accept=".json"
              onChange={(e) => e.target.files?.[0] && importFromJson(e.target.files[0], (data) => importData(data))}
              className="h-10 w-full sm:w-48 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200/80"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() =>
              setActiveList(
                createList({
                  title: 'Daftar Belanja Baru',
                  period: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
                  store: 'Toko',
                }).id
              )
            }
            disabled={!isClient}
            className="rounded-xl bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white hover:opacity-95 active:opacity-90"
          >
            Buat Daftar Baru
          </Button>

          {lists.length > 0 && (
            <Select value={activeListId ?? ''} onValueChange={(value) => setActiveList(value)}>
              <SelectTrigger className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60">
                <SelectValue placeholder="Pilih daftar belanja..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200/60 dark:border-slate-700/60">
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.title} — {list.period}
                    {list.status === 'completed' ? ' (Selesai)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {activeList && (
        <>
          {isCompleted && (
            <div className="p-3 md:p-4 text-center rounded-2xl border border-emerald-300/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-200">Daftar belanja ini sudah selesai dan dicatat sebagai transaksi.</div>
          )}

          {/* Pengaturan & Aksi */}
          <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
            <CardHeader>
              <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Pengaturan & Aksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 dark:text-slate-200">Tautkan ke Budget</Label>
                <Select value={activeList.linkedBudgetCategory ?? ''} onValueChange={(value) => linkListToBudget(activeList.id, value)} disabled={isCompleted}>
                  <SelectTrigger className="h-11 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60">
                    <SelectValue placeholder="Pilih kategori budget..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl bg-white/95 dark:bg-slate-900/90 backdrop-blur border border-slate-200/60 dark:border-slate-700/60">
                    <SelectItem value="null">Jangan tautkan</SelectItem>
                    {budgets.map((b) => (
                      <SelectItem key={b.category} value={b.category}>
                        {b.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {activeList.linkedBudgetCategory && <BudgetInfo category={activeList.linkedBudgetCategory} listEstTotal={totals.estimated} />}

              <Button
                onClick={() => completeAndRecordTransaction(activeList.id)}
                disabled={isCompleted || !activeList.linkedBudgetCategory || totals.actual === 0}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:opacity-95 active:opacity-90"
              >
                Selesaikan & Catat Transaksi
              </Button>
            </CardContent>
          </Card>

          {/* Tambah Item */}
          <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
            <CardHeader><CardTitle>Tambah Item</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Input name="name" placeholder="Nama Item" required disabled={isCompleted} className="md:col-span-2" />
                <Input name="qty" type="number" placeholder="Jumlah" required min="0.1" step="0.1" disabled={isCompleted}/>
                <Input name="unit" placeholder="Unit (pcs)" disabled={isCompleted} />
                <Select value={newItemCategory} onValueChange={setNewItemCategory} disabled={isCompleted}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {shoppingStore.categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input name="estPrice" type="number" placeholder="Estimasi Harga" required min="0" disabled={isCompleted} />
                <Button type="submit" className="col-span-2 md:col-span-1" disabled={isCompleted}>Tambah</Button>
              </form>
            </CardContent>
          </Card>

          {/* Item Belanja */}
          <Card className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Item Belanja</CardTitle>

                {!isCompleted && activeList.items.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectionMode(!selectionMode)} className="rounded-xl">
                      {selectionMode ? 'Batal' : 'Pilih'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="rounded-xl">
                          <Trash2 className="h-4 w-4 mr-1" /> Hapus Semua
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur border border-slate-200/60 dark:border-slate-700/60">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-bold">Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>Tindakan ini akan menghapus semua item dari daftar belanja ini secara permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => clearShoppingList(activeList.id)} className="rounded-xl bg-rose-600 hover:bg-rose-700">
                            Ya, Hapus Semua
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                {activeList.items.map((item) => {
                  const handleCheckedChange = () => {
                    if (selectionMode) {
                      setSelectedItems((prev) => (prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]));
                    } else {
                      togglePurchased(activeList.id, item.id);
                    }
                  };

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <Checkbox id={`item-${item.id}`} checked={selectionMode ? selectedItems.includes(item.id) : item.purchased} onCheckedChange={handleCheckedChange} disabled={isCompleted} />

                      <div className="flex-1 flex items-center gap-2">
                        <Label htmlFor={`item-${item.id}`} className={`${item.purchased && !selectionMode ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                          {item.name} ({item.qty} {item.unit})<span className="block text-xs text-slate-500">Est: Rp{item.estPrice.toLocaleString('id-ID')}</span>
                        </Label>
                        <PriceHistoryPopover itemName={item.name} itemUnit={item.unit} />
                      </div>

                      {item.purchased && !selectionMode && <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">Rp{item.actualPrice?.toLocaleString('id-ID')}</span>}

                      <Button variant="destructive" size="sm" onClick={() => removeItem(activeList.id, item.id)} disabled={isCompleted} className="rounded-lg" aria-label={`Hapus ${item.name}`}>
                        Hapus
                      </Button>
                    </div>
                  );
                })}
              </div>

              {selectionMode && selectedItems.length > 0 && (
                <div className="sticky bottom-20 md:bottom-4 mt-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/70 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 shadow-lg z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{selectedItems.length} item terpilih</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="rounded-xl">
                          Hapus Terpilih
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-2xl bg-white/90 dark:bg-slate-900/85 backdrop-blur border border-slate-200/60 dark:border-slate-700/60">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>Tindakan ini akan menghapus {selectedItems.length} item yang dipilih secara permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSelectionMode(false)} className="rounded-xl">
                            Batal
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-xl bg-rose-600 hover:bg-rose-700"
                            onClick={() => {
                              removeSelectedItems(activeList.id, selectedItems);
                              setSelectionMode(false);
                            }}
                          >
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="sticky bottom-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur shadow-md">
            <CardHeader>
              <CardTitle className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300">Total</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Estimasi</p>
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">Rp{totals.estimated.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Aktual</p>
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-300">Rp{totals.actual.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Selisih</p>
                <p className={`font-bold text-lg ${totals.difference > 0 ? 'text-rose-600 dark:text-rose-300' : 'text-sky-600 dark:text-sky-300'}`}>Rp{totals.difference.toLocaleString('id-ID')}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
