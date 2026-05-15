import { User, Room, Bill, Device, Notification } from '../types';

export const MOCK_OWNER: User = {
  id: 'owner_1',
  name: 'Nguyễn Văn A',
  email: 'owner@example.com',
  role: 'owner',
  building: 'Tòa nhà SmartStay A'
};

export const MOCK_TENANT: User = {
  id: 'tenant_1',
  name: 'Trần Thị B',
  email: 'tenant@example.com',
  role: 'tenant',
  roomNumber: 'A101',
  building: 'Tòa nhà SmartStay A'
};

export const MOCK_ADMIN: User = {
  id: 'admin_1',
  name: 'Quản trị viên Hệ thống',
  email: 'admin@smartstay.com',
  role: 'admin'
};

export const MOCK_ROOMS: Room[] = [
  { id: '1', number: 'A101', floor: 1, status: 'rented', tenantName: 'Trần Thị B', powerUsage: 125.4, price: 3500000, utilities: 'Điện, Nước, WiFi' },
  { id: '2', number: 'A102', floor: 1, status: 'rented', tenantName: 'Lê Văn C', powerUsage: 98.2, price: 3500000, utilities: 'Điện, Nước, WiFi' },
  { id: '3', number: 'A104', floor: 1, status: 'empty', price: 3500000, utilities: 'Điện, Nước, WiFi' },
  { id: '4', number: 'A105', floor: 1, status: 'alert', issue: 'Rò rỉ nước', expectedFixDate: '15/05/2026', price: 3500000 },
  { id: '5', number: 'A201', floor: 2, status: 'rented', tenantName: 'Hoàng Minh D', powerUsage: 145.0, price: 3800000 },
  { id: '6', number: 'A202', floor: 2, status: 'maintenance', issue: 'Sơn lại tường', expectedFixDate: '20/05/2026', price: 3800000 },
];

export const MOCK_BILLS: Bill[] = [
  { 
    id: 'b1', 
    month: 'Tháng 5/2026', 
    roomNumber: 'A101', 
    tenantName: 'Trần Thị B', 
    amount: 4250000, 
    dueDate: '2026-05-15', 
    status: 'unpaid',
    details: { room: 3500000, electricity: 450000, water: 150000, other: 150000 }
  },
  { 
    id: 'b2', 
    month: 'Tháng 5/2026', 
    roomNumber: 'A102', 
    tenantName: 'Lê Văn C', 
    amount: 3980000, 
    dueDate: '2026-05-15', 
    status: 'paid',
    details: { room: 3500000, electricity: 280000, water: 100000, other: 100000 }
  }
];

export const MOCK_DEVICES: Device[] = [
  { id: 'd1', name: 'Đèn trần', type: 'light', status: 'online', state: { on: true, brightness: 80 }, ownerId: 'tenant_1', roomNumber: 'A101', lastUpdate: '10 phút trước' },
  { id: 'd2', name: 'Điều hòa', type: 'ac', status: 'online', state: { on: false, temp: 24, mode: 'cool' }, ownerId: 'tenant_1', roomNumber: 'A101', lastUpdate: '5 phút trước' },
  { id: 'd3', name: 'Công tắc bình nóng lạnh', type: 'switch', status: 'online', state: { on: false }, ownerId: 'tenant_1', roomNumber: 'A101', lastUpdate: '1 giờ trước' },
  { id: 'd4', name: 'Cảm biến cửa', type: 'sensor', status: 'online', state: { open: false }, ownerId: 'tenant_1', roomNumber: 'A101', lastUpdate: 'Vừa xong' },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Hoá đơn mới', content: 'Hoá đơn tháng 5 của bạn đã sẵn sàng.', time: '1 giờ trước', type: 'bill', isRead: false },
  { id: 'n2', title: 'Thông báo sửa chữa', content: 'Bảo trì hệ thống nước khu vực tầng 1 vào 14:00 ngày mai.', time: '3 giờ trước', type: 'alert', isRead: true },
  { id: 'n3', title: 'Vệ sinh định kỳ', content: 'Nhân viên sẽ dọn dẹp hành lang vào sáng thứ 7.', time: '1 ngày trước', type: 'cleaning', isRead: true },
];
