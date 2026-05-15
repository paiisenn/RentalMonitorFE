import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useToast } from '../../components/ui/Toast';
import {
  Power,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Zap,
  Wifi,
  Layers,
  Settings,
  Search,
  Activity,
  Lightbulb,
  Wind,
  Tv,
  Lock,
  Smartphone,
  ChevronRight,
  Filter,
  Flame,
  Droplets,
  Unlock,
  ShieldAlert
} from 'lucide-react';
import { cn } from '../../lib/utils';

export default function OwnerDevices() {
  const { devices, fetchDevices, toggleLight, controlDoor, triggerFireAlarm, resetFireAlarm, loading } = useDeviceStore();
  const { rooms, fetchRooms } = useRoomStore();
  const { showToast } = useToast();
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDevices();
    fetchRooms();
  }, [fetchDevices, fetchRooms]);

  const filteredDevices = devices.filter(dev => {
    // Robust room matching: check roomId or roomNumber
    const currentRoom = rooms.find(r => r.id === selectedRoom || (r as any)._id === selectedRoom);
    const matchesRoom = selectedRoom === 'all' ||
      dev.roomId === selectedRoom ||
      (dev as any).room_id === selectedRoom ||
      ((dev as any).room_id?.toString() === selectedRoom) ||
      (currentRoom && dev.roomNumber === currentRoom.number) ||
      (selectedRoom && dev.roomNumber === selectedRoom);

    const deviceName = dev.name || '';
    const deviceRoomNumber = dev.roomNumber || '';
    const searchStr = (searchTerm || '').toLowerCase();

    const matchesSearch = deviceName.toLowerCase().includes(searchStr) ||
      deviceRoomNumber.toLowerCase().includes(searchStr);
    return matchesRoom && matchesSearch;
  });

  const infrastructureDevices = [
    { id: 'gw-1', name: 'Gateway Tầng 1', type: 'hub', status: 'online', load: '12%', uptime: '14d 5h' },
    { id: 'gw-2', name: 'Gateway Tầng 2', type: 'hub', status: 'online', load: '8%', uptime: '14d 5h' },
    { id: 'cam-sanh', name: 'Camera Sảnh chính', type: 'security', status: 'online', load: 'REC', uptime: '30d 2h' },
  ];

  const getDeviceIcon = (dev: any) => {
    const type = dev.type;
    const state = dev.state;

    switch (type) {
      case 'light': return <Lightbulb size={20} />;
      case 'lock': return state?.locked ? <Lock size={20} /> : <Unlock size={20} />;
      case 'fire_alarm': return state?.alert ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />;
      case 'meter': return <Activity size={20} />;
      case 'hub': return <Cpu size={20} />;
      case 'security': return <ShieldCheck size={20} />;
      default: return <Smartphone size={20} />;
    }
  };

  const handleToggle = async (dev: any) => {
    const devId = dev.id || dev._id;
    console.log('[OWNER_DEVICES] Attempting to toggle device:', dev.name, 'ID:', devId);

    if (!devId) {
      console.error("[OWNER_DEVICES] Device ID is missing for device object:", dev);
      return;
    }

    const devIdStr = devId.toString();

    try {
      if (dev.type === 'light') {
        console.log('[OWNER_DEVICES] Toggling light:', devIdStr);
        await toggleLight(devIdStr);
        showToast(`${dev.state?.on ? 'Tắt' : 'Bật'} đèn thành công`, 'success');
      } else if (dev.type === 'lock') {
        const currentAction = dev.state?.locked ? 'open' : 'close';
        console.log('[OWNER_DEVICES] Controlling door:', devIdStr, 'Action:', currentAction);
        await controlDoor(devIdStr, currentAction);
        showToast(`${dev.state?.locked ? 'Mở' : 'Đóng'} khóa thành công`, 'success');
      } else if (dev.type === 'fire_alarm' || dev.type === 'fire_sensor') {
        if (dev.state?.alert) {
          await resetFireAlarm(devIdStr);
          showToast('Đã tắt báo động thành công', 'success');
        } else {
          if (confirm('BẠN CÓ CHẮC CHẮN MUỐN KÍCH HOẠT QUY TRÌNH THOÁT HIỂM KHẨN CẤP CHO PHÒNG NÀY?')) {
            await triggerFireAlarm(devIdStr);
            showToast('Đã kích hoạt quy trình thoát hiểm khẩn cấp!', 'success');
          }
        }
      }
    } catch (error) {
      console.error('[OWNER_DEVICES] Error toggling device:', error);
      showToast('Lỗi khi điều khiển thiết bị', 'error');
    }
  };

  const formatMeterValue = (val: any) => {
    if (typeof val === 'number') return val.toFixed(2);
    if (typeof val === 'string' && val.includes('_')) return val.split('_')[1];
    return val || '0.00';
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Quản trị thiết bị IoT</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Giám sát trạng thái hạ tầng và thiết bị trong từng phòng thuê
          </p>
        </div>
        <button
          onClick={() => fetchDevices()}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-5 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} /> Làm mới hệ thống
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
            <input
              type="text"
              placeholder="TÌM THEO TÊN/SỐ PHÒNG..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded pl-10 pr-4 py-2.5 text-[10px] font-mono text-zinc-400 focus:border-primary outline-none"
            />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-4 ml-2">Lọc theo phòng</p>
            <button
              onClick={() => setSelectedRoom('all')}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                selectedRoom === 'all' ? "bg-zinc-800 text-primary border border-zinc-700" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              )}
            >
              <span>TẤT CẢ THIẾT BỊ</span>
              {selectedRoom === 'all' && <Activity size={12} className="animate-pulse" />}
            </button>
            {rooms.map(room => {
              const roomId = room.id || (room as any)._id;
              return (
                <button
                  key={roomId}
                  onClick={() => setSelectedRoom(roomId)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                    selectedRoom === roomId ? "bg-zinc-800 text-primary border border-zinc-700" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                  )}
                >
                  <span>{room.name || `PHÒNG ${room.number}`}</span>
                  <span className="text-[8px] opacity-60">ID: {(roomId || '').toString().substring(0, 4)}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800">
            <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-4">Hạ tầng trung tâm</h4>
            <div className="space-y-4">
              {infrastructureDevices.map(inf => (
                <div key={inf.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-600">
                      {getDeviceIcon(inf)}
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-zinc-400 uppercase">{inf.name}</p>
                      <p className="text-[8px] font-mono text-green-500 uppercase tracking-tighter">● Online</p>
                    </div>
                  </div>
                  <ChevronRight size={12} className="text-zinc-800" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Grid */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="p-20 text-center">
              <Activity className="text-primary animate-spin mx-auto" size={24} />
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="p-20 text-center glass-card rounded-xl border border-dotted border-zinc-800">
              <Smartphone size={40} className="text-zinc-800 mx-auto mb-4" />
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Không có thiết bị nào được tìm thấy</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredDevices.map((dev, i) => {
                const devId = dev.id || (dev as any)._id;
                const devIdStr = devId?.toString();
                const isOn = dev.type === 'light' ? dev.state?.on :
                  dev.type === 'lock' ? !dev.state?.locked :
                    dev.type === 'fire_alarm' ? !dev.state?.alert :
                      dev.type === 'meter' ? true : false;

                const isCritical = dev.type === 'fire_alarm' && dev.state?.alert;

                return (
                  <motion.div
                    key={devId || i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "glass-card p-5 rounded-xl border transition-all group relative overflow-hidden",
                      isCritical ? "border-red-500/50 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]" :
                        isOn ? "border-primary/30 bg-primary/5" : "border-zinc-800 bg-zinc-900/10"
                    )}
                  >
                    {(isOn || isCritical) && (
                      <div className={cn(
                        "absolute -right-4 -top-4 w-12 h-12 blur-2xl rounded-full",
                        isCritical ? "bg-red-500/20" : "bg-primary/20"
                      )}></div>
                    )}

                    <div className="flex justify-between items-start mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all border",
                        isCritical ? "bg-red-500 text-white border-red-500" :
                          isOn ? "bg-primary text-zinc-950 border-primary" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                      )}>
                        {getDeviceIcon(dev)}
                      </div>

                      {(dev.type === 'light' || dev.type === 'lock') && (
                        <button
                          onClick={() => handleToggle(dev)}
                          className={cn(
                            "w-10 h-6 rounded-full relative transition-all duration-300",
                            isOn ? "bg-primary shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "bg-zinc-800"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                            isOn ? "left-5" : "left-1"
                          )} />
                        </button>
                      )}

                      {dev.type === 'fire_alarm' && (
                        <div className={cn(
                          "px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter",
                          isCritical ? "bg-red-500 text-white animate-pulse" : "bg-zinc-800 text-zinc-500"
                        )}>
                          {isCritical ? "Cảnh báo" : "An toàn"}
                        </div>
                      )}

                      {(dev.type === 'fire_alarm' || dev.type === 'fire_sensor') && (
                        <button
                          onClick={() => handleToggle(dev)}
                          className={cn(
                            "text-[8px] font-black uppercase px-2 py-1 rounded border transition-all",
                            isCritical ? "bg-red-500 text-white border-red-400 animate-pulse" : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white hover:border-zinc-600"
                          )}
                        >
                          {isCritical ? "TẮT BÁO ĐỘNG" : "BÁO ĐỘNG"}
                        </button>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn(
                          "text-xs font-black uppercase tracking-wide transition-colors truncate max-w-[120px]",
                          isCritical ? "text-red-500" : "text-slate-200 group-hover:text-primary"
                        )}>{dev.name}</h4>
                        <span className="text-[8px] text-zinc-700 font-mono">#{(devId || '').toString().substring(0, 4)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] text-zinc-500 font-bold uppercase bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                          {rooms.find(r => r.number === dev.roomNumber)?.name || `PHÒNG ${dev.roomNumber}`}
                        </span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-tighter",
                          isCritical ? "text-red-500" :
                            dev.status === 'online' ? "text-green-500" : "text-zinc-700"
                        )}>
                          {isCritical ? "🔥 Emergency" : dev.status}
                        </span>
                      </div>
                    </div>

                    {dev.type === 'meter' && (
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap size={10} className="text-yellow-500" />
                            <span className="text-[8px] text-zinc-600 font-black uppercase">Điện</span>
                          </div>
                          <p className="text-xs font-mono font-bold text-white tracking-widest">{formatMeterValue(dev.state?.electricity)}<span className="text-[8px] text-zinc-600 ml-1">kWh</span></p>
                        </div>
                        <div className="bg-zinc-950 p-2 rounded border border-zinc-900">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Droplets size={10} className="text-blue-500" />
                            <span className="text-[8px] text-zinc-600 font-black uppercase">Nước</span>
                          </div>
                          <p className="text-xs font-mono font-bold text-white tracking-widest">{formatMeterValue(dev.state?.water)}<span className="text-[8px] text-zinc-600 ml-1">m³</span></p>
                        </div>
                      </div>
                    )}

                    <div className="mt-5 pt-4 border-t border-zinc-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wifi size={10} className={cn(dev.status === 'online' ? "text-primary" : "text-zinc-800")} />
                        <span className="text-[9px] font-mono text-zinc-600">
                          {dev.lastUpdate}
                        </span>
                      </div>
                      <button className="text-[9px] font-black text-zinc-700 uppercase hover:text-primary transition-colors">Log & CMD</button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
