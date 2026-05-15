import api from '../lib/api';
import { Device } from '../types';

export interface DeviceService {
  getAll: () => Promise<Device[]>;
  control: (id: string, state: any) => Promise<Device>;
  toggleLight: (id: string) => Promise<Device>;
  controlDoor: (id: string, action: 'open' | 'close') => Promise<Device>;
  triggerFire: (id: string) => Promise<any>;
  resetFire: (id: string) => Promise<any>;
}

export const deviceService: DeviceService = {
  getAll: async () => {
    const { data } = await api.get('/devices');
    return data;
  },

  control: async (id, state) => {
    const { data } = await api.post('/devices/control', { id, state });
    return data;
  },

  toggleLight: async (id) => {
    const { data } = await api.post('/devices/light/toggle', { id });
    return data;
  },

  controlDoor: async (id, action) => {
    const { data } = await api.post('/devices/door/control', { id, action });
    return data;
  },

  triggerFire: async (id) => {
    const { data } = await api.post(`/devices/${id}/trigger-fire`);
    return data;
  },

  resetFire: async (id) => {
    const { data } = await api.post(`/devices/${id}/reset-fire`);
    return data;
  }
};
