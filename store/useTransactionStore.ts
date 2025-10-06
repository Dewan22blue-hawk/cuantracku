import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Transaction = {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO 8601 format
  type: 'income' | 'expense';
};

export type Budget = {
  category: string;
  limit: number;
};

type State = {
  transactions: Transaction[];
  budgets: Budget[];
};

type Actions = {
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  setBudgets: (budgets: Budget[]) => void;
};

const initialState: State = {
  transactions: [],
  budgets: [],
};

export const useTransactionStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      addTransaction: (transaction) =>
        set((state) => ({ transactions: [...state.transactions, transaction] })),
      updateTransaction: (transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === transaction.id ? transaction : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      setBudgets: (budgets) => set({ budgets }),
    }),
    {
      name: 'track-moneyku-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
