import api from '../lib/api';
import { Notification } from '../types';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications');
    return data;
  },

  markAsRead: async (id: string): Promise<any> => {
    const { data } = await api.patch(`/notifications/${id}/read`, { isRead: true });
    return data;
  },

  create: async (notif: Partial<Notification>): Promise<Notification> => {
    const { data } = await api.post('/notifications', notif);
    return data;
  },
};
