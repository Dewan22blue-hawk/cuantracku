

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { useTransactionStore } from "./useTransactionStore"; // Import transaction store
import { calcTotals } from "../lib/shopping-utils";

// --- TYPES ---
export interface ShoppingItem {
  id: string;
  name: string;
  qty: number;
  unit: string; // e.g., 'kg', 'liter', 'pcs'
  category: string;
  estPrice: number;
  actualPrice: number | null;
  purchased: boolean;
  notes: string;
  lastBoughtAt?: number;
}

export interface ShoppingList {
  id: string;
  title: string;
  period: string; // e.g., "Minggu ke-4 Oktober 2025"
  store: string;
  items: ShoppingItem[];
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'completed';
  linkedBudgetCategory: string | null;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  category: string;
  lastUpdatedAt: number;
}

export interface PriceHistoryEntry {
  id: string;
  itemName: string;
  unit: string;
  price: number;
  store: string;
  date: number;
}

export interface ShoppingState {
  version: number;
  lists: ShoppingList[];
  activeListId: string | null;
  inventory: InventoryItem[];
  priceHistory: PriceHistoryEntry[];
  templates: { id: string; name: string; items: Omit<ShoppingItem, "id" | "actualPrice" | "purchased">[] }[];
  categories: string[];
}

export interface ShoppingActions {
  setActiveList: (listId: string) => void;
  createList: (data: { title: string; period: string; store: string }) => ShoppingList;
  updateList: (listId: string, data: Partial<Pick<ShoppingList, "title" | "period" | "store">>) => void;
  deleteList: (listId: string) => void;

  addItem: (listId: string, itemData: Omit<ShoppingItem, "id" | "actualPrice" | "purchased">) => void;
  updateItem: (listId: string, itemId: string, data: Partial<ShoppingItem>) => void;
  removeItem: (listId: string, itemId: string) => void;
  togglePurchased: (listId: string, itemId: string, actualPrice?: number) => void;

  addInventoryItem: (itemData: Omit<InventoryItem, "id" | "lastUpdatedAt">) => void;
  updateInventoryItem: (itemId: string, data: Partial<InventoryItem>) => void;
  adjustInventoryStock: (itemId: string, amount: number) => void;

  linkListToBudget: (listId: string, category: string | null) => void;
  completeAndRecordTransaction: (listId: string) => void;

  clearShoppingList: (listId: string) => void;
  removeSelectedItems: (listId: string, itemIds: string[]) => void;

  addCategory: (name: string) => void;
  
  importData: (data: ShoppingState) => void;
  exportData: () => ShoppingState;
}

// --- STORE ---
export const useShoppingStore = create<ShoppingState & ShoppingActions>()(
  persist(
    (set, get) => ({
      version: 1,
      lists: [],
      activeListId: null,
      inventory: [],
      priceHistory: [],
      templates: [],
      categories: ["Bahan Makanan", "Kebutuhan Pokok", "Pembersih", "Snack", "Lainnya"],

      // --- LIST ACTIONS ---
      setActiveList: (listId) => set({ activeListId: listId }),

      createList: (data) => {
        const newList: ShoppingList = {
          ...data,
          id: uuidv4(),
          items: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'active',
          linkedBudgetCategory: null,
        };
        set((state) => ({ lists: [...state.lists, newList] }));
        return newList;
      },

      updateList: (listId, data) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId ? { ...list, ...data, updatedAt: Date.now() } : list
          ),
        }));
      },

      deleteList: (listId) => {
        set((state) => ({
          lists: state.lists.filter((list) => list.id !== listId),
          activeListId: state.activeListId === listId ? null : state.activeListId,
        }));
      },

      // --- SHOPPING ITEM ACTIONS ---
      addItem: (listId, itemData) => {
        const newItem: ShoppingItem = {
          ...itemData,
          id: uuidv4(),
          actualPrice: null,
          purchased: false,
        };
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? { ...list, items: [...list.items, newItem], updatedAt: Date.now() }
              : list
          ),
        }));
      },

      updateItem: (listId, itemId, data) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map((item) =>
                    item.id === itemId ? { ...item, ...data } : item
                  ),
                  updatedAt: Date.now(),
                }
              : list
          ),
        }));
      },

      removeItem: (listId, itemId) => {
        set((state) => ({
          lists: state.lists.map((list) =>
            list.id === listId
              ? { ...list, items: list.items.filter((item) => item.id !== itemId), updatedAt: Date.now() }
              : list
          ),
        }));
      },

      togglePurchased: (listId, itemId, actualPrice) => {
        const lists = get().lists;
        const list = lists.find(l => l.id === listId);
        if (!list) return;

        let toggledItem: ShoppingItem | undefined;

        const updatedLists = lists.map(l => {
          if (l.id === listId) {
            return {
              ...l,
              items: l.items.map(item => {
                if (item.id === itemId) {
                  const isPurchased = !item.purchased;
                  const finalActualPrice = isPurchased ? (actualPrice ?? item.estPrice) : null;
                  toggledItem = { ...item, purchased: isPurchased, actualPrice: finalActualPrice };
                  return toggledItem;
                }
                return item;
              }),
              updatedAt: Date.now(),
            };
          }
          return l;
        });

        set({ lists: updatedLists });

        // --- Add to Price History --- 
        if (toggledItem && toggledItem.purchased && toggledItem.actualPrice !== null) {
          const newHistoryEntry: PriceHistoryEntry = {
            id: uuidv4(),
            itemName: toggledItem.name,
            unit: toggledItem.unit,
            price: toggledItem.actualPrice,
            store: list.store,
            date: Date.now(),
          };
          set(state => ({ priceHistory: [...state.priceHistory, newHistoryEntry] }));
        }
      },

      // --- INVENTORY ACTIONS ---
      addInventoryItem: (itemData) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: uuidv4(),
          lastUpdatedAt: Date.now(),
        };
        set(state => ({ inventory: [...state.inventory, newItem]}));
      },

      updateInventoryItem: (itemId, data) => {
        set(state => ({
          inventory: state.inventory.map(item => 
            item.id === itemId ? { ...item, ...data, lastUpdatedAt: Date.now() } : item
          )
        }));
      },

      adjustInventoryStock: (itemId, amount) => {
        let inventoryItem: InventoryItem | undefined;
        set(state => ({
          inventory: state.inventory.map(item => {
            if (item.id === itemId) {
              const updatedItem = { ...item, currentStock: Math.max(0, item.currentStock + amount), lastUpdatedAt: Date.now() };
              inventoryItem = updatedItem;
              return updatedItem;
            }
            return item;
          })
        }));

        if (inventoryItem && inventoryItem.currentStock < inventoryItem.minStock) {
          const { activeListId, lists } = get();
          if (!activeListId) return;

          const activeList = lists.find(l => l.id === activeListId);
          if (!activeList) return;

          const itemAlreadyInList = activeList.items.some(item => item.name.toLowerCase() === inventoryItem!.name.toLowerCase());

          if (!itemAlreadyInList) {
            get().addItem(activeListId, {
              name: inventoryItem.name,
              qty: 1, // Default qty, user can adjust later
              unit: inventoryItem.unit,
              category: inventoryItem.category,
              estPrice: 0, // User needs to estimate the price
              notes: "Ditambahkan otomatis dari stok",
            });
          }
        }
      },

      // --- BUDGET & TRANSACTION ACTIONS ---
      linkListToBudget: (listId, category) => {
        set(state => ({
          lists: state.lists.map(list => 
            list.id === listId ? { ...list, linkedBudgetCategory: category } : list
          )
        }));
      },

      completeAndRecordTransaction: (listId) => {
        const list = get().lists.find(l => l.id === listId);
        if (!list || !list.linkedBudgetCategory) {
          alert("Silakan tautkan daftar ini ke sebuah kategori budget terlebih dahulu.");
          return;
        }

        const totals = calcTotals(list);
        if (totals.actual === 0) {
          alert("Tidak ada transaksi untuk dicatat (total aktual Rp 0).");
          return;
        }

        const purchasedItems = list.items.filter(item => item.purchased);
        const description = `Belanja di ${list.store}: ${purchasedItems.map(i => i.name).join(', ')}`;

        useTransactionStore.getState().addTransaction({
          id: uuidv4(),
          amount: totals.actual,
          description: description,
          category: list.linkedBudgetCategory,
          date: new Date().toISOString(),
          type: 'expense',
        });

        set(state => ({
          lists: state.lists.map(l => 
            l.id === listId ? { ...l, status: 'completed', updatedAt: Date.now() } : l
          )
        }));
      },

      // --- BULK ACTIONS ---
      clearShoppingList: (listId) => {
        set(state => ({
          lists: state.lists.map(l =>
            l.id === listId ? { ...l, items: [], updatedAt: Date.now() } : l
          )
        }));
      },

      removeSelectedItems: (listId, itemIds) => {
        set(state => ({
          lists: state.lists.map(l =>
            l.id === listId
              ? { ...l, items: l.items.filter(item => !itemIds.includes(item.id)), updatedAt: Date.now() }
              : l
          )
        }));
      },

      // --- GENERAL ACTIONS ---
      addCategory: (name) => {
        if (get().categories.includes(name)) return;
        set((state) => ({ categories: [...state.categories, name] }));
      },
      
      importData: (data) => {
        // Basic validation
        if (data && typeof data.version === 'number') {
          set(data);
        } else {
          alert("File impor tidak valid.");
        }
      },

      exportData: () => get(),
    }),
    {
      name: "cuantrack:shopping:v1", // LocalStorage key
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // migrate: (persistedState, version) => { ... } // Placeholder for future migrations
    }
  )
);
