import { useEffect } from 'react';
import { useSocketStore } from './useSocketStore';
import { useRoomStore } from './useRoomStore';
import { useDeviceStore } from './useDeviceStore';
import { useBillStore } from './useBillStore';
import { useNotificationStore } from './useNotificationStore';
import { useAlertStore } from './useAlertStore';

export const useRealtimeSync = () => {
  const { socket } = useSocketStore();
  const { updateRoom, addRoom } = useRoomStore();
  const { updateDevice } = useDeviceStore();
  const { updateBill, addBill } = useBillStore();
  const { addNotification } = useNotificationStore();
  const { addAlert } = useAlertStore();

  useEffect(() => {
    if (!socket) return;

    socket.on('device-update', (data) => {
      updateDevice(data);
    });

    socket.on('meter-update', (data) => {
      // Assuming data is { deviceId: string, values: { water: number, electricity: number } }
      // Or similar. We update the device state.
      const device = useDeviceStore.getState().devices.find(d => d.id === data.deviceId);
      if (device) {
        updateDevice({
          ...device,
          state: { ...device.state, ...data.values }
        });
      }
    });

    socket.on('alert', (data) => {
      addNotification({
        ...data,
        type: 'alert',
        time: 'Bây giờ',
        isRead: false
      });
      addAlert(data);
    });

    socket.on('roomUpdate', (data) => {
      updateRoom(data);
    });

    socket.on('newRoom', (data) => {
      addRoom(data);
    });

    socket.on('billUpdate', (data) => {
      updateBill(data);
    });

    socket.on('newBill', (data) => {
      addBill(data);
    });

    socket.on('newNotification', (data) => {
      addNotification(data);
      if (data.type === 'alert') {
        addAlert(data);
      }
    });

    return () => {
      socket.off('device-update');
      socket.off('meter-update');
      socket.off('alert');
      socket.off('roomUpdate');
      socket.off('newRoom');
      socket.off('billUpdate');
      socket.off('newBill');
      socket.off('newNotification');
    };
  }, [socket, updateDevice, updateRoom, addRoom, updateBill, addBill, addNotification, addAlert]);
};
