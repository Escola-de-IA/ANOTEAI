import { create } from 'zustand';
import { User, PlanType } from '@/types/board';
import { loadUser, saveUser } from '@/lib/storage';
import { generateId } from '@/lib/ids';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  setPlan: (plan: PlanType) => void;
  updatePreferences: (prefs: Partial<User['preferences']>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: loadUser(),
  isAuthenticated: !!loadUser(),

  login: (email) => {
    const existing = loadUser();
    if (existing && existing.email === email) {
      set({ user: existing, isAuthenticated: true });
      return true;
    }
    const user: User = {
      id: generateId(), name: email.split('@')[0], email, plan: 'free',
      preferences: { gridOn: true, snapOn: false, darkMode: false },
    };
    saveUser(user);
    set({ user, isAuthenticated: true });
    return true;
  },

  register: (name, email) => {
    const user: User = {
      id: generateId(), name, email, plan: 'free',
      preferences: { gridOn: true, snapOn: false, darkMode: false },
    };
    saveUser(user);
    set({ user, isAuthenticated: true });
    return true;
  },

  logout: () => set({ user: null, isAuthenticated: false }),

  updateUser: (updates) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUser(updated);
    set({ user: updated });
  },

  setPlan: (plan) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, plan };
    saveUser(updated);
    set({ user: updated });
  },

  updatePreferences: (prefs) => {
    const { user } = get();
    if (!user) return;
    const updated = { ...user, preferences: { ...user.preferences, ...prefs } };
    saveUser(updated);
    set({ user: updated });
  },
}));
