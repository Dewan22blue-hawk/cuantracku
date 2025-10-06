"use client";

import { useState } from "react";
import { useTransactionStore } from "@/store/useTransactionStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Wand2 } from "lucide-react";

export function AIAdvisorCard() {
  const transactions = useTransactionStore((state) => state.transactions);

  const generateAISummary = () => {
    const expenses = transactions.filter((t) => t.type === "expense");
    if (expenses.length === 0) {
      return "Anda belum memiliki data pengeluaran. Mulai catat transaksi untuk mendapatkan analisis dari AI.";
    }

    const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
    const categorySpending = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const topCategory = Object.entries(categorySpending).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const advice = `Pengeluaran terbesar Anda ada di kategori "${topCategory[0]}". Mungkin Anda bisa mencari alternatif yang lebih hemat di area ini. Misalnya, jika ini adalah 'Makanan', cobalah memasak di rumah beberapa kali seminggu. Mengurangi pengeluaran di kategori ini bahkan sebesar 15% dapat menghemat budget Anda secara signifikan!`;

    return (
      <div>
        <p className="mb-2">
          Halo! Saya adalah konsultan keuangan virtual Anda. Setelah
          menganalisis data keuangan Anda bulan ini, berikut adalah
          ringkasannya:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li>
            Total pengeluaran Anda adalah{" "}
            <strong className="text-primary">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(totalExpense)}
            </strong>
            .
          </li>
          <li>
            Kategori pengeluaran terbesar Anda adalah{" "}
            <strong className="text-primary">{topCategory[0]}</strong>,
            menghabiskan sekitar{" "}
            <strong className="text-primary">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(topCategory[1])}
            </strong>
            .
          </li>
        </ul>
        <h4 className="font-semibold mb-2">Saran Keuangan untuk Anda:</h4>
        <p className="text-muted-foreground">{advice}</p>
      </div>
    );
  };

  return (
    <Card className="glass-card neumorphic-shadow-soft bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="text-primary" />
          Saran Keuangan dari AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Dapatkan ringkasan dan tips untuk mengoptimalkan keuangan Anda sebagai
          anak kos.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Dapatkan Analisis Keuangan</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-white/90">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 ">
                <Wand2 /> Analisis Keuangan Virtual
              </DialogTitle>
              <DialogDescription>
                Berikut adalah hasil analisis dari data keuangan Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-sm">{generateAISummary()}</div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
