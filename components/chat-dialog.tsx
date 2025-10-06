'use client';

import { useState, useRef, useEffect } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

interface Message {
  sender: 'user' | 'bot';
  text: string | React.ReactNode;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const { transactions } = useTransactionStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Halo! Saya konsultan keuangan virtual Anda. Apa yang ingin Anda ketahui tentang keuangan Anda? Coba tanya: 'total pengeluaran' atau 'top kategori'.",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string) => {
    const lowerCaseMessage = userMessage.toLowerCase();

    if (lowerCaseMessage.includes('total pengeluaran')) {
      const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
      return `Total pengeluaran Anda sejauh ini adalah ${formatCurrency(totalExpense)}.`;
    }

    if (lowerCaseMessage.includes('top kategori')) {
      const categorySpending = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + t.amount;
          return acc;
        }, {} as Record<string, number>);

      const topCategories = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      if (topCategories.length === 0) {
        return 'Anda belum punya data pengeluaran untuk dianalisis.';
      }

      return (
        <div>
          <p>Tentu, berikut adalah 3 kategori pengeluaran terbesar Anda:</p>
          <ul className="list-decimal pl-5 mt-2">
            {topCategories.map(([category, amount]) => (
              <li key={category}>
                {category}: {formatCurrency(amount)}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    return "Maaf, saya belum mengerti pertanyaan itu. Anda bisa coba tanya 'total pengeluaran' atau 'top kategori'.";
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    const botResponse: Message = {
      sender: 'bot',
      text: generateBotResponse(inputValue),
    };

    setMessages((prev) => [...prev, userMessage, botResponse]);
    setInputValue('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col h-[70vh] bg-white/90 dark:bg-zinc-900/90">
        <DialogHeader>
          <DialogTitle>Konsultan Keuangan Virtual</DialogTitle>
          <DialogDescription>Tanyakan apapun tentang data keuangan Anda.</DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 space-y-4">
          {messages.map((msg, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl p-3 text-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>{msg.text}</div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2 pt-4 border-t border-white/10">
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Ketik pertanyaan Anda..." />
          <Button onClick={handleSendMessage}>Kirim</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
