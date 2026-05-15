import { create } from 'zustand';
import { User } from '../types';
import api from '../lib/api';

interface UserState {
  tenants: User[];
  loading: boolean;
  error: string | null;

  fetchTenants: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  tenants: [],
  loading: false,
  error: null,

  fetchTenants: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/users/tenants');
      set({ tenants: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({ error: err.message, tenants: [], loading: false });
    }
  },
}));
