import { create } from 'zustand';
import { Room } from '../types';
import { roomService } from '../services/room.service';

interface RoomState {
  rooms: Room[];
  myRoom: Room | null;
  loading: boolean;
  error: string | null;

  fetchRooms: () => Promise<void>;
  fetchMyRoom: () => Promise<void>;
  updateRoomStatus: (id: string, statusData: any) => Promise<void>;
  assignRoom: (id: string, tenantData: any) => Promise<void>;
  addRoom: (room: Room) => void;
  updateRoom: (room: Room) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  rooms: [],
  myRoom: null,
  loading: false,
  error: null,

  fetchRooms: async () => {
    set({ loading: true, error: null });
    try {
      const data = await roomService.getAll();
      set({ rooms: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({ error: err.message, rooms: [], loading: false });
    }
  },

  fetchMyRoom: async () => {
    set({ loading: true, error: null });
    try {
      const data = await roomService.getMyRoom();
      set({ myRoom: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateRoomStatus: async (id, statusData) => {
    try {
      const updatedRoom = await roomService.updateStatus(id, statusData);
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === id ? updatedRoom : r)),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  assignRoom: async (id, tenantData) => {
    try {
      const updatedRoom = await roomService.assign(id, tenantData);
      set((state) => ({
        rooms: state.rooms.map((r) => (r.id === id ? updatedRoom : r)),
      }));
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),

  updateRoom: (room) => set((state) => ({
    rooms: state.rooms.map((r) => (r.id === room.id ? room : r)),
  })),
}));
