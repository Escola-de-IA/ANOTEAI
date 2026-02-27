import { Board, FinanceEntry, User } from '@/types/board';

const BOARDS_KEY = 'boardverse_boards';
const USER_KEY = 'boardverse_user';
const FINANCE_KEY = 'boardverse_finance_entries';

export const loadBoards = (): Board[] => {
  try {
    const d = localStorage.getItem(BOARDS_KEY);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
};

export const saveBoards = (boards: Board[]) => {
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
};

export const loadUser = (): User | null => {
  try {
    const d = localStorage.getItem(USER_KEY);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
};

export const saveUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const loadFinanceEntries = (): FinanceEntry[] => {
  try {
    const d = localStorage.getItem(FINANCE_KEY);
    return d ? JSON.parse(d) : [];
  } catch {
    return [];
  }
};

export const saveFinanceEntries = (entries: FinanceEntry[]) => {
  localStorage.setItem(FINANCE_KEY, JSON.stringify(entries));
};
