import api from '../lib/api';
import { Bill } from '../types';

export const billService = {
  getAll: async (): Promise<Bill[]> => {
    const { data } = await api.get('/bills');
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<Bill> => {
    const { data } = await api.patch(`/bills/${id}/status`, { status });
    return data;
  },

  create: async (billData: Partial<Bill>): Promise<Bill> => {
    const { data } = await api.post('/bills', billData);
    return data;
  },

  getMyBill: async (): Promise<Bill[]> => {
    const { data } = await api.get('/bills/my-bill');
    return data;
  },
};
