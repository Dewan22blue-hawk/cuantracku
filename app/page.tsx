'use client';

import { Header } from '@/components/header';
import { SummaryCards } from '@/components/summary-cards';
import { TransactionsView } from '@/components/transactions-view';
import { DashboardCharts } from '@/components/dashboard-charts';
import { BudgetTracker } from '@/components/budget-tracker';
import { ClientOnly } from '@/components/client-only';
import { motion } from 'framer-motion';

import { AIAdvisorCard } from '@/components/ai-advisor-card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <motion.h2 className="text-3xl font-bold mb-4 dark:text-white/90 " initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          Dashboard
        </motion.h2>
        <ClientOnly>
          <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <SummaryCards />
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 gap-6">
              <motion.div className="xl:col-span-2" variants={itemVariants}>
                <TransactionsView />
              </motion.div>
              <motion.div className="space-y-6" variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
                  <AIAdvisorCard />
                  <DashboardCharts />
                </div>
                <BudgetTracker />
              </motion.div>
            </div>
          </motion.div>
        </ClientOnly>
      </main>
    </div>
  );
}
