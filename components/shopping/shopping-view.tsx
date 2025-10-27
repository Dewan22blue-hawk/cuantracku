
"use client";

import { useEffect, useState, useMemo } from "react";
import { useShoppingStore } from "../../store/useShoppingStore";
import { useTransactionStore } from "../../store/useTransactionStore";
import { calcTotals, exportToJson, importFromJson } from "../../lib/shopping-utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { History, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

// Helper component for Price History
function PriceHistoryPopover({ itemName, itemUnit }: { itemName: string, itemUnit: string }) {
  const { priceHistory } = useShoppingStore();

  const relevantHistory = useMemo(() => {
    return priceHistory
      .filter(h => h.itemName.toLowerCase() === itemName.toLowerCase() && h.unit === itemUnit)
      .sort((a, b) => b.date - a.date); // Newest first
  }, [priceHistory, itemName, itemUnit]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <History className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">Riwayat Harga: {itemName}</h4>
          <p className="text-sm text-muted-foreground">Harga terakhir untuk item ini.</p>
          {relevantHistory.length > 0 ? (
            <div className="grid gap-2 text-sm">
              {relevantHistory.map(h => (
                <div key={h.id} className="grid grid-cols-3 items-center gap-2">
                  <span>{new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}</span>
                  <span className="truncate">{h.store}</span>
                  <span className="font-semibold text-right">Rp{h.price.toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Belum ada riwayat harga.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Helper component to display budget info
function BudgetInfo({ category, listEstTotal }: { category: string; listEstTotal: number }) {
  const { budgets, transactions } = useTransactionStore();
  const budget = budgets.find(b => b.category === category);

  const spent = useMemo(() => {
    if (!budget) return 0;
    return transactions
      .filter(t => t.category === budget.category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, budget]);

  if (!budget) return null;

  const remaining = budget.limit - spent;
  const remainingAfterShopping = remaining - listEstTotal;

  return (
    <Card className="bg-secondary/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Info Budget: {category}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm grid grid-cols-3 gap-2">
        <div>
          <p className="text-muted-foreground">Sisa Budget</p>
          <p className="font-semibold">Rp{remaining.toLocaleString('id-ID')}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Estimasi Belanja</p>
          <p className="font-semibold">- Rp{listEstTotal.toLocaleString('id-ID')}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Sisa Akhir</p>
          <p className={`font-bold ${remainingAfterShopping < 0 ? 'text-red-500' : 'text-green-600'}`}>
            Rp{remainingAfterShopping.toLocaleString('id-ID')}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ShoppingView() {
  const [isClient, setIsClient] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const shoppingStore = useShoppingStore();
  const { lists, activeListId, setActiveList, createList, addItem, togglePurchased, removeItem, importData, exportData, linkListToBudget, completeAndRecordTransaction, clearShoppingList, removeSelectedItems } = shoppingStore;
  
  const transactionStore = useTransactionStore();
  const { budgets } = transactionStore;

  const activeList = useMemo(() => lists.find(l => l.id === activeListId), [lists, activeListId]);
  const totals = useMemo(() => calcTotals(activeList), [activeList]);
  const isCompleted = activeList?.status === 'completed';

  // Reset selection when list changes or mode is turned off
  useEffect(() => {
    setSelectedItems([]);
  }, [activeListId, selectionMode]);

  // Cross-tab sync
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "cuantrack:shopping:v1" || event.key === "track-moneyku-storage") {
        useShoppingStore.persist.rehydrate();
        useTransactionStore.persist.rehydrate();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeListId || isCompleted) return;
    // ... (rest of the function is the same)
  };
  
  if (!isClient) {
    return null; // Render nothing on the server
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Daftar Belanja</CardTitle>
          <div className="flex gap-2">
            <Button onClick={() => exportToJson(exportData(), 'cuantrack-shopping.json')}>Export</Button>
            <Input type="file" accept=".json" onChange={(e) => e.target.files?.[0] && importFromJson(e.target.files[0], (data) => importData(data))} className="w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setActiveList(createList({ title: "Daftar Belanja Baru", period: new Date().toLocaleDateString("id-ID", { month: 'long', year: 'numeric' }), store: "Toko" }).id)} disabled={!isClient}>Buat Daftar Baru</Button>
          {lists.length > 0 && (
            <Select value={activeListId ?? ''} onValueChange={(value) => setActiveList(value)}>
              <SelectTrigger><SelectValue placeholder="Pilih daftar belanja..." /></SelectTrigger>
              <SelectContent>
                {lists.map(list => (
                  <SelectItem key={list.id} value={list.id}>{list.title} - {list.period} {list.status === 'completed' && ' (Selesai)'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {activeList && (
        <>
          {isCompleted && (
            <div className="p-4 text-center bg-green-100 dark:bg-green-900/50 rounded-lg text-green-800 dark:text-green-200">
              Daftar belanja ini sudah selesai dan dicatat sebagai transaksi.
            </div>
          )}

          <Card>
            <CardHeader><CardTitle>Pengaturan & Aksi</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tautkan ke Budget</Label>
                <Select 
                  value={activeList.linkedBudgetCategory ?? ''} 
                  onValueChange={(value) => linkListToBudget(activeList.id, value)}
                  disabled={isCompleted}
                >
                  <SelectTrigger><SelectValue placeholder="Pilih kategori budget..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Jangan tautkan</SelectItem>
                    {budgets.map(b => (
                      <SelectItem key={b.category} value={b.category}>{b.category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {activeList.linkedBudgetCategory && <BudgetInfo category={activeList.linkedBudgetCategory} listEstTotal={totals.estimated} />}
              <Button 
                onClick={() => completeAndRecordTransaction(activeList.id)}
                disabled={isCompleted || !activeList.linkedBudgetCategory || totals.actual === 0}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Selesaikan & Catat Transaksi
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tambah Item</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Input name="name" placeholder="Nama Item" required disabled={isCompleted} />
                <Input name="qty" type="number" placeholder="Jumlah" required min="0.1" step="0.1" disabled={isCompleted}/>
                <Input name="unit" placeholder="Unit (pcs)" disabled={isCompleted} />
                <Input name="estPrice" type="number" placeholder="Estimasi Harga" required min="0" disabled={isCompleted} />
                <Button type="submit" className="col-span-2 md:col-span-1" disabled={isCompleted}>Tambah</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Item Belanja</CardTitle>
                {!isCompleted && activeList.items.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectionMode(!selectionMode)}>
                      {selectionMode ? 'Batal' : 'Pilih'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Hapus Semua</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus semua item dari daftar belanja ini secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => clearShoppingList(activeList.id)}>Ya, Hapus Semua</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeList.items.map(item => {
                  const handleCheckedChange = () => {
                    if (selectionMode) {
                      setSelectedItems(prev => 
                        prev.includes(item.id) 
                          ? prev.filter(id => id !== item.id)
                          : [...prev, item.id]
                      );
                    } else {
                      togglePurchased(activeList.id, item.id);
                    }
                  };

                  return (
                    <div key={item.id} className="flex items-center gap-4 p-2 border rounded-md">
                      <Checkbox 
                        id={`item-${item.id}`}
                        checked={selectionMode ? selectedItems.includes(item.id) : item.purchased}
                        onCheckedChange={handleCheckedChange}
                        disabled={isCompleted}
                      />
                      <div className="flex-1 flex items-center gap-2">
                        <Label htmlFor={`item-${item.id}`} className={`${item.purchased && !selectionMode ? 'line-through text-muted-foreground' : ''}`}>
                          {item.name} ({item.qty} {item.unit})
                          <span className="text-sm text-gray-500 block">Est: Rp{item.estPrice.toLocaleString('id-ID')}</span>
                        </Label>
                        <PriceHistoryPopover itemName={item.name} itemUnit={item.unit} />
                      </div>
                      {item.purchased && !selectionMode && (
                        <span className="text-sm font-semibold">Rp{item.actualPrice?.toLocaleString('id-ID')}</span>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => removeItem(activeList.id, item.id)} disabled={isCompleted}>X</Button>
                    </div>
                  );
                })}
              </div>
              {selectionMode && selectedItems.length > 0 && (
                <div className="sticky bottom-20 md:bottom-4 p-2 bg-background border rounded-lg shadow-lg z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{selectedItems.length} item terpilih</p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">Hapus Terpilih</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus {selectedItems.length} item yang dipilih secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setSelectionMode(false)}>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => {
                            removeSelectedItems(activeList.id, selectedItems);
                            setSelectionMode(false);
                          }}>Ya, Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="sticky bottom-4">
            <CardHeader><CardTitle>Total</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-muted-foreground">Estimasi</p>
                <p className="font-bold text-lg">Rp{totals.estimated.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Aktual</p>
                <p className="font-bold text-lg text-green-600">Rp{totals.actual.toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Selisih</p>
                <p className={`font-bold text-lg ${totals.difference > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                  Rp{totals.difference.toLocaleString('id-ID')}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
