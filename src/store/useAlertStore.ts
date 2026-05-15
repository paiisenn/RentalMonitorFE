import { create } from 'zustand';
import { alertService } from '../services/alert.service';

interface AlertState {
  alerts: any[];
  loading: boolean;
  error: string | null;

  fetchAlerts: () => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  addAlert: (alert: any) => void;
  removeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await alertService.getAll();
      set({ alerts: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  resolveAlert: async (id) => {
    try {
      await alertService.resolve(id);
      set((state) => ({
        alerts: (state.alerts || []).filter((a) => (a.id || a._id) !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  removeAlert: (id) => set((state) => ({
    alerts: (state.alerts || []).filter((a) => (a.id || a._id) !== id)
  })),

  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...(state.alerts || [])]
  })),
}));
