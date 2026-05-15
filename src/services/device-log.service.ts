import api from '../lib/api';

export interface DeviceLog {
  id: string;
  deviceId: string;
  action: string;
  time: string;
  user: string;
}

export const deviceLogService = {
  getAll: async (): Promise<DeviceLog[]> => {
    const { data } = await api.get('/device-logs');
    return data;
  },

  getByDeviceId: async (deviceId: string): Promise<DeviceLog[]> => {
    const { data } = await api.get(`/device-logs/${deviceId}`);
    return data;
  },
};
