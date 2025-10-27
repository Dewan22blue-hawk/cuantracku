'use client';

import { useState, useRef, useEffect } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Message {
  sender: 'user' | 'bot';
  text: string | React.ReactNode;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const { transactions } = useTransactionStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Halo! Saya konsultan keuangan virtual Anda. Apa yang ingin Anda ketahui tentang keuangan Anda?",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const fullPrompt = `
        Berdasarkan data transaksi berikut:
        ${JSON.stringify(transactions, null, 2)}

        Jawab pertanyaan ini: ${inputValue}
      `;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: fullPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const botResponse: Message = { sender: 'bot', text: data.text };
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error(error);
      const errorResponse: Message = { sender: 'bot', text: 'Maaf, terjadi kesalahan. Coba lagi nanti.' };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-md flex flex-col h-[70vh] rounded-2xl', 'bg-white/80 dark:bg-slate-900/70 backdrop-blur', 'border border-slate-200/60 dark:border-slate-700/60', 'shadow-xl')}>
        <DialogHeader>
          <DialogTitle
            className="font-bold tracking-tight bg-clip-text text-transparent
                       bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500
                       dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300"
          >
            Konsultan Keuangan Virtual
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Tanyakan apapun tentang data keuangan Anda.</DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {messages.map((msg, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn('flex items-end gap-2', msg.sender === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3 py-2 text-sm',
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white rounded-br-none shadow'
                    : 'bg-white/70 dark:bg-slate-800/70 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-200/60 dark:border-slate-700/60 backdrop-blur'
                )}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2 justify-start">
              <div className="max-w-xs rounded-2xl p-3 text-sm bg-secondary text-secondary-foreground rounded-bl-none">...</div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ketik pertanyaan Anda..."
            className="h-10 rounded-xl bg-white/70 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-700/60 focus-visible:ring-2 focus-visible:ring-sky-400"
          />
          <Button onClick={handleSendMessage} className="h-10 rounded-xl bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white hover:opacity-95 active:opacity-90">
            Kirim
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
