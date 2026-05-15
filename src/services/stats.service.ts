import api from '../lib/api';

export interface DashboardStats {
  totalRevenue: number;
  occupancyRate: number;
  maintenanceCount: number;
  tenantCount: number;
  powerTrend: { day: string; value: number }[];
}

export const statsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/stats');
    return data;
  },
};
