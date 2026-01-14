import { create } from 'zustand';
import { getMe } from './api';

interface User {
  id: string;
  phone: string;
  isAdmin: boolean;
  telegramUsername?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
    set({ token });
  },

  login: async (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    set({ token });
    await useAuthStore.getState().checkAuth();
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('cart');
    }
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        set({ user: null, token: null, isLoading: false });
        return;
      }

      set({ token, isLoading: true });
      const response = await getMe();
      set({ user: response.user, isLoading: false });
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
