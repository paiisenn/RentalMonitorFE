import { create } from 'zustand';
import api from '../lib/api';
import { User } from '../types';
import { useSocketStore } from './useSocketStore';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialLoading: boolean;
  error: string | null;

  login: (credentials: { email: string; password: string; role: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('smartstay_token'),
  isAuthenticated: false,
  isInitialLoading: true,
  error: null,

  login: async (credentials) => {
    set({ error: null });
    try {
      const { data } = await api.post('/auth/login', credentials);
      const { accessToken, user } = data;
      
      localStorage.setItem('smartstay_token', accessToken);
      set({ 
        token: accessToken, 
        user, 
        isAuthenticated: true,
        error: null
      });
      
      // Initialize socket after successful login
      useSocketStore.getState().initSocket(accessToken);
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Đã có lỗi xảy ra khi đăng nhập';
      set({ error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  logout: () => {
    localStorage.removeItem('smartstay_token');
    useSocketStore.getState().disconnect();
    set({ user: null, token: null, isAuthenticated: false });
    window.location.href = '/login';
  },

  checkAuth: async () => {
    const token = localStorage.getItem('smartstay_token');
    if (!token) {
      set({ isInitialLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const { data } = await api.get('/auth/profile');
      set({ user: data, isAuthenticated: true, isInitialLoading: false });
      
      // Initialize socket if token exists and profile fetch succeeded
      useSocketStore.getState().initSocket(token);
    } catch (err) {
      localStorage.removeItem('smartstay_token');
      set({ user: null, token: null, isAuthenticated: false, isInitialLoading: false });
    }
  }
}));
