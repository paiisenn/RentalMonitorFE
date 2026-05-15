import { create } from 'zustand';
import { Device } from '../types';
import { deviceService } from '../services/device.service';

interface DeviceState {
  devices: Device[];
  loading: boolean;
  error: string | null;

  fetchDevices: () => Promise<void>;
  controlDevice: (id: string, state: any) => Promise<void>;
  toggleLight: (id: string) => Promise<void>;
  controlDoor: (id: string, action: 'open' | 'close') => Promise<void>;
  triggerFireAlarm: (id: string) => Promise<void>;
  resetFireAlarm: (id: string) => Promise<void>;
  updateDevice: (device: Device) => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  loading: false,
  error: null,

  fetchDevices: async () => {
    set({ loading: true, error: null });
    try {
      const data = await deviceService.getAll();
      set({ devices: Array.isArray(data) ? data : [], loading: false });
    } catch (err: any) {
      set({ error: err.message, devices: [], loading: false });
    }
  },

  controlDevice: async (id, deviceState) => {
    if (!id) {
      console.error('[STORE] Cannot control device: ID is null');
      return;
    }
    const previousDevices = get().devices;
    set((state) => ({
      devices: state.devices.map((d) =>
        (d.id === id || d._id === id) ? { ...d, state: { ...d.state, ...deviceState } } : d
      ),
    }));

    try {
      await deviceService.control(id, deviceState);
    } catch (err: any) {
      set({ devices: previousDevices, error: err.message });
    }
  },

  triggerFireAlarm: async (id: string) => {
    if (!id) return;
    const previousDevices = get().devices;
    console.log(`[STORE] Triggering fire alarm for ID: ${id}`);

    set((state) => ({
      devices: state.devices.map((d) => {
        const devId = (d.id || d._id)?.toString();
        if (devId === id.toString()) {
          console.log(`[STORE] Optimistically triggering alert for ${d.name}`);
          return { ...d, state: { ...d.state, alert: true }, last_state: 'FIRE_DETECTED' };
        }
        return d;
      }),
    }));

    try {
      await deviceService.triggerFire(id);
    } catch (err: any) {
      console.error(`[STORE] Failed to trigger fire alarm:`, err);
      set({ devices: previousDevices, error: err.message });
    }
  },

  resetFireAlarm: async (id: string) => {
    if (!id) return;
    const previousDevices = get().devices;
    console.log(`[STORE] Resetting fire alarm for ID: ${id}`);

    set((state) => ({
      devices: state.devices.map((d) => {
        const devId = (d.id || d._id)?.toString();
        if (devId === id.toString()) {
          console.log(`[STORE] Optimistically resetting alert for ${d.name}`);
          return { ...d, state: { ...d.state, alert: false }, last_state: 'NORMAL' };
        }
        return d;
      }),
    }));

    try {
      await deviceService.resetFire(id);
      console.log(`[STORE] Fire alarm reset request sent for ${id}`);
    } catch (err: any) {
      console.error(`[STORE] Failed to reset fire alarm:`, err);
      set({ devices: previousDevices, error: err.message });
    }
  },

  toggleLight: async (id) => {
    if (!id) {
      console.error('[STORE] Cannot toggle light: ID is null');
      return;
    }
    const previousDevices = get().devices;
    console.log(`[STORE] Toggling light for ID: ${id}`);

    let found = false;
    set((state) => ({
      devices: state.devices.map((d) => {
        const devId = (d.id || d._id)?.toString();
        if (devId === id.toString()) {
          found = true;
          console.log(`[STORE] Found matching device: ${d.name} (${devId})`);
          return { ...d, state: { ...d.state, on: !d.state?.on } };
        }
        return d;
      }),
    }));

    if (!found) {
      console.warn(`[STORE] Device with ID ${id} not found in state. Available IDs:`, get().devices.map(d => d.id || d._id));
    }

    try {
      await deviceService.toggleLight(id);
    } catch (err: any) {
      console.error(`[STORE] Failed to toggle light:`, err);
      set({ devices: previousDevices, error: err.message });
    }
  },

  controlDoor: async (id, action) => {
    if (!id) {
      console.error('[STORE] Cannot control door: ID is null');
      return;
    }
    const previousDevices = get().devices;
    console.log(`[STORE] Controlling door for ID: ${id}, action: ${action}`);

    let found = false;
    set((state) => ({
      devices: state.devices.map((d) => {
        const devId = (d.id || d._id)?.toString();
        if (devId === id.toString()) {
          found = true;
          console.log(`[STORE] Found matching device: ${d.name} (${devId})`);
          return { ...d, state: { ...d.state, locked: action === 'close' } };
        }
        return d;
      }),
    }));

    if (!found) {
      console.warn(`[STORE] Door with ID ${id} not found in state. Available IDs:`, get().devices.map(d => d.id || d._id));
    }

    try {
      await deviceService.controlDoor(id, action);
    } catch (err: any) {
      console.error(`[STORE] Failed to control door:`, err);
      set({ devices: previousDevices, error: err.message });
    }
  },

  updateDevice: (device) => set((state) => {
    const devId = (device.id || device._id)?.toString();
    return {
      devices: state.devices.map((d) => {
        const existingId = (d.id || d._id)?.toString();
        return existingId === devId ? { ...d, ...device } : d;
      }),
    };
  }),
}));
