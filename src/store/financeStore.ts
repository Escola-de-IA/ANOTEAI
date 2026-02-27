import { create } from 'zustand';
import { generateId } from '@/lib/ids';
import { loadFinanceEntries, saveFinanceEntries } from '@/lib/storage';
import { FinanceEntry, FinanceEntryType } from '@/types/board';

interface CreateFinanceEntryInput {
  userId: string;
  title: string;
  category: string;
  type: FinanceEntryType;
  amount: number;
  date: string;
  notes?: string;
}

interface FinanceState {
  entries: FinanceEntry[];
  addEntry: (entry: CreateFinanceEntryInput) => void;
  removeEntry: (entryId: string) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  entries: loadFinanceEntries(),

  addEntry: (entry) => {
    const newEntry: FinanceEntry = {
      ...entry,
      id: generateId(),
      createdAt: Date.now(),
    };

    const entries = [newEntry, ...get().entries];
    saveFinanceEntries(entries);
    set({ entries });
  },

  removeEntry: (entryId) => {
    const entries = get().entries.filter((entry) => entry.id !== entryId);
    saveFinanceEntries(entries);
    set({ entries });
  },
}));
