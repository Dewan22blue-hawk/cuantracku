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
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2 justify-start">
              <div className="max-w-xs rounded-2xl p-3 text-sm bg-secondary text-secondary-foreground rounded-bl-none">...</div>
            </motion.div>
          )}
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
