import { create } from 'zustand';
import { Notification } from '../types';
import { notificationService } from '../services/notification.service';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
  createNotification: (notif: Partial<Notification>) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const data = await notificationService.getAll();
      set({ notifications: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createNotification: async (notif) => {
    try {
      const newNotif = await notificationService.create(notif);
      set({ notifications: [newNotif, ...get().notifications] });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  markAsRead: async (id) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) => 
          n.id === id ? { ...n, isRead: true } : n
        ),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addNotification: (notification) => set((state) => ({ 
    notifications: [notification, ...state.notifications] 
  })),
}));
