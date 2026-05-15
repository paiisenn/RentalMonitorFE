import api from '../lib/api';
import { User } from '../types';

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  getProfile: async (): Promise<User> => {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  inviteOwner: async (ownerData: { email: string; name: string }): Promise<any> => {
    const { data } = await api.post('/auth/invite-owner', ownerData);
    return data;
  },

  registerTenant: async (tenantData: { email: string; name: string; roomNumber: string }): Promise<any> => {
    const { data } = await api.post('/auth/register-tenant', tenantData);
    return data;
  },
};
