'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { BottomNavigation } from '@/components/bottom-navigation';
import { Footer } from '@/components/footer';
import { Chatbot } from '@/components/chatbot';

export default function LayoutClient({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col min-h-screen">
        <div className="flex-grow">{children}</div>
        <Footer />
      </motion.div>

      <BottomNavigation />
      <Chatbot />
    </ThemeProvider>
  );
}
