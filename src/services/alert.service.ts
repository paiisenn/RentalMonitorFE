import api from '../lib/api';

export const alertService = {
  getAll: async (): Promise<any[]> => {
    const { data } = await api.get('/alerts');
    return data;
  },

  resolve: async (id: string): Promise<any> => {
    const { data } = await api.post(`/alerts/${id}/resolve`);
    return data;
  },
};
