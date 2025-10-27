'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatDialog } from './chat-dialog';
import { cn } from '@/lib/utils';

export function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ scale: 0, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          delay: 0.4,
          type: 'spring',
          stiffness: 120,
          damping: 12,
        }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          aria-label="Buka chatbot"
          onClick={() => setOpen(true)}
          className={cn('rounded-full h-14 w-14 p-0', 'bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500 text-white', 'shadow-lg shadow-rose-500/20 hover:shadow-xl active:scale-95 transition-all')}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      </motion.div>

      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
