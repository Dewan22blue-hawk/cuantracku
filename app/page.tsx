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
    transition: { staggerChildren: 0.08 },
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

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 max-w-7xl">
        {/* Title */}
        <motion.div initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 }} className="mb-6 md:mb-8">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight
                       bg-clip-text text-transparent
                       bg-gradient-to-r from-indigo-600 via-sky-500 to-rose-500
                       dark:from-indigo-400 dark:via-sky-300 dark:to-rose-300"
          >
            Dashboard
          </h2>
          <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">Ringkasan arus kas, transaksi, dan saran finansial pintar.</p>
        </motion.div>

        <ClientOnly>
          <motion.div className="space-y-6 md:space-y-8" variants={containerVariants} initial="hidden" animate="visible">
            {/* Summary cards */}
            <motion.section
              variants={itemVariants}
              className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60
                         bg-white/70 dark:bg-slate-900/60 backdrop-blur
                         shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-4 sm:p-6">
                <SummaryCards />
              </div>
            </motion.section>

            {/* Main grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
              {/* Transactions */}
              <motion.section
                variants={itemVariants}
                className="xl:col-span-2 rounded-2xl border border-slate-200/60 dark:border-slate-700/60
                           bg-white/70 dark:bg-slate-900/60 backdrop-blur
                           shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <TransactionsView />
                </div>
              </motion.section>

              {/* Right rail */}
              <motion.aside variants={itemVariants} className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6 md:gap-8">
                  {/* AI Advisor */}
                  <section
                    className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60
                               bg-white/70 dark:bg-slate-900/60 backdrop-blur
                               shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 sm:p-6">
                      <AIAdvisorCard />
                    </div>
                  </section>

                  {/* Charts */}
                  <section
                    className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60
                               bg-white/70 dark:bg-slate-900/60 backdrop-blur
                               shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-4 sm:p-6">
                      <DashboardCharts />
                    </div>
                  </section>
                </div>

                {/* Budget */}
                <section
                  className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60
                             bg-white/70 dark:bg-slate-900/60 backdrop-blur
                             shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4 sm:p-6">
                    <BudgetTracker />
                  </div>
                </section>
              </motion.aside>
            </div>
          </motion.div>
        </ClientOnly>
      </main>
    </div>
  );
}
