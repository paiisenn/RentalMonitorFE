export type Role = 'admin' | 'owner' | 'tenant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  roomNumber?: string;
  roomName?: string;
  room_id?: string;
  building?: string;
}

export interface Device {
  id?: string;
  _id?: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  state: any;
  ownerId: string;
  roomId?: string;
  roomNumber: string;
  lastUpdate: string;
  last_seen?: string;
}

export interface Room {
  id: string;
  name?: string;
  number: string;
  floor: number;
  status: 'empty' | 'rented' | 'maintenance' | 'alert';
  tenantName?: string;
  current_tenant_id?: string;
  tenant_phone_snapshot?: string;
  electricity_index?: number;
  water_index?: number;
  utilities?: string;
  powerUsage?: number;
  price?: number;
  base_price?: number;
  issue?: string;
  expectedFixDate?: string;
  last_state?: string;
  last_seen?: string;
}

export interface Bill {
  id: string;
  room_id?: string;
  tenant_id?: string;
  tenant_name_snapshot?: string;
  month: number | string;
  year?: number;
  roomNumber: string; // fallback if needed
  roomName?: string;
  tenantName: string; // fallback if needed
  amount: number;
  total_amount?: number;
  due_date?: string;
  dueDate?: string; // fallback
  status: 'paid' | 'unpaid' | 'overdue';
  electricity_index?: number;
  water_index?: number;
  details: {
    room: number;
    electricity: number;
    water: number;
    other: number;
  };
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  time: string;
  date?: string;
  target?: string;
  type: 'info' | 'alert' | 'bill' | 'cleaning' | 'resolved_alert' | 'urgent' | 'maintenance' | 'broadcast';
  isRead: boolean;
  severity?: 'normal' | 'crucial';
  resolved?: boolean;
}
