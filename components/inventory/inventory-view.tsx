
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useShoppingStore } from '../../store/useShoppingStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Plus, Minus, TriangleAlert } from 'lucide-react';

export function InventoryView() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { inventory, categories, addInventoryItem, adjustInventoryStock } = useShoppingStore();

  const outOfStockItems = useMemo(() => {
    return inventory.filter(item => item.currentStock === 0);
  }, [inventory]);

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const currentStock = parseFloat(formData.get('currentStock') as string);
    const minStock = parseFloat(formData.get('minStock') as string);
    const unit = formData.get('unit') as string || 'pcs';
    const category = formData.get('category') as string || 'Lainnya';

    if (name && !isNaN(currentStock) && !isNaN(minStock)) {
      addInventoryItem({ name, currentStock, minStock, unit, category });
      e.currentTarget.reset();
    }
  };

  if (!isClient) {
    return null; // Avoid hydration mismatch
  }

  return (
    <div className="space-y-4 p-4 md:p-6">
      {outOfStockItems.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-start gap-4 pb-2">
            <TriangleAlert className="h-5 w-5 text-destructive mt-1" />
            <div>
              <CardTitle className="text-destructive">Stok Habis!</CardTitle>
              <p className="text-sm text-destructive/80">Segera tambahkan item berikut ke daftar belanja Anda.</p>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm font-medium text-destructive">
              {outOfStockItems.map(item => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tambah Item ke Stok</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddItem} className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Input name="name" placeholder="Nama Item" required />
            <Input name="currentStock" type="number" placeholder="Stok Saat Ini" required />
            <Input name="minStock" type="number" placeholder="Stok Minimum" required />
            <Input name="unit" placeholder="Unit (cth: kg, pcs)" />
            <Button type="submit" className="col-span-2 md:col-span-1">Tambah Stok</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stok Barang di Rumah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inventory.length === 0 ? (
              <p className="text-muted-foreground text-center">Belum ada barang di stok.</p>
            ) : (
              inventory.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className={`text-sm ${item.currentStock < item.minStock ? 'text-red-500' : 'text-muted-foreground'}`}>
                      Stok: {item.currentStock} / {item.minStock} {item.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" onClick={() => adjustInventoryStock(item.id, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" onClick={() => adjustInventoryStock(item.id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
