import { create } from 'zustand';
import { Bill } from '../types';
import { billService } from '../services/bill.service';

interface BillState {
  bills: Bill[];
  loading: boolean;
  error: string | null;

  fetchBills: () => Promise<void>;
  fetchMyBills: () => Promise<void>;
  updateBillStatus: (id: string, status: string) => Promise<void>;
  createBill: (billData: any) => Promise<void>;
  addBill: (bill: Bill) => void;
  updateBill: (bill: Bill) => void;
}

export const useBillStore = create<BillState>((set) => ({
  bills: [],
  loading: false,
  error: null,

  fetchBills: async () => {
    set({ loading: true, error: null });
    try {
      const data = await billService.getAll();
      set({ bills: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyBills: async () => {
    set({ loading: true, error: null });
    try {
      const data = await billService.getMyBill();
      set({ bills: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateBillStatus: async (id, status) => {
    try {
      const updatedBill = await billService.updateStatus(id, status);
      set((state) => ({
        bills: state.bills.map((b) => (b.id === id ? updatedBill : b)),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  createBill: async (billData) => {
    try {
      const newBill = await billService.create(billData);
      set((state) => ({ bills: [newBill, ...state.bills] }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addBill: (bill) => set((state) => ({ bills: [bill, ...state.bills] })),
  
  updateBill: (bill) => set((state) => ({
    bills: state.bills.map((b) => (b.id === bill.id ? bill : b)),
  })),
}));
