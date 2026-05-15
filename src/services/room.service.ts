import api from '../lib/api';
import { Room } from '../types';

export const roomService = {
  getAll: async (): Promise<Room[]> => {
    const { data } = await api.get('/rooms');
    return data;
  },

  getById: async (id: string): Promise<Room> => {
    const { data } = await api.get(`/rooms/${id}`);
    return data;
  },

  create: async (roomData: Partial<Room>): Promise<Room> => {
    const { data } = await api.post('/rooms', roomData);
    return data;
  },

  updateStatus: async (id: string, update: { status: string; issue?: string; expectedFixDate?: string }): Promise<Room> => {
    const { data } = await api.patch(`/rooms/${id}/status`, update);
    return data;
  },

  assign: async (id: string, tenantData: { tenantName: string; current_tenant_id: string; tenant_phone_snapshot: string }): Promise<Room> => {
    const { data } = await api.patch(`/rooms/${id}/assign`, tenantData);
    return data;
  },
  
  getMyRoom: async (): Promise<Room> => {
    const { data } = await api.get('/rooms/my-room');
    return data;
  },
};
