import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Zap,
  Activity,
  Lightbulb,
  Wind,
  Tv,
  Lock,
  Smartphone,
  Power,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Thermometer,
  Clock
} from 'lucide-react';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { cn } from '../../lib/utils';

export default function TenantDevices() {
  const { user } = useAuthStore();
  const { devices, fetchDevices, controlDevice, loading } = useDeviceStore();
  const { myRoom, fetchMyRoom } = useRoomStore();
  const [filter, setFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  useEffect(() => {
    fetchDevices();
    fetchMyRoom();
  }, [fetchDevices, fetchMyRoom]);

  const tenantRoom = user?.roomNumber;
  const tenantDevices = devices.filter(d => d.roomNumber === tenantRoom);

  const filteredDevices = tenantDevices.filter(dev => {
    const matchesFilter = filter === 'all' || dev.type === filter;
    const name = dev.name || '';
    const search = (searchTerm || '').toLowerCase();
    const matchesSearch = name.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'light': return <Lightbulb size={24} />;
      case 'ac': return <Wind size={24} />;
      case 'tv': return <Tv size={24} />;
      case 'lock': return <Lock size={24} />;
      case 'hub': return <Cpu size={24} />;
      case 'sensor': return <ShieldCheck size={24} />;
      default: return <Smartphone size={24} />;
    }
  };

  const handleToggle = async (deviceId: string, currentState: any) => {
    await controlDevice(deviceId, { on: !currentState?.on });
  };

  const stats = {
    total: tenantDevices.length,
    active: tenantDevices.filter(d => d.state?.on).length,
    offline: tenantDevices.filter(d => d.status === 'offline').length
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Điều khiển thiết bị</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 underline decoration-primary/30 underline-offset-4">
            Smart Control Center • {myRoom?.name || `Phòng ${tenantRoom}`}
          </p>
        </div>
        <button
          onClick={() => fetchDevices()}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-5 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} /> Làm mới thiết bị
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Tổng số thiết bị', value: stats.total, icon: Smartphone, color: 'text-zinc-400' },
          { label: 'Đang hoạt động', value: stats.active, icon: Zap, color: 'text-primary' },
          { label: 'Cảnh báo/Offline', value: stats.offline, icon: ShieldCheck, color: 'text-red-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-4 rounded-xl border border-zinc-900 bg-zinc-950/50 flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center", stat.color)}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-mono font-black text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/30 p-2 rounded-xl border border-zinc-800/50">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
          {['all', 'light', 'ac', 'switch', 'sensor'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={cn(
                "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === type
                  ? "bg-primary text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {type === 'all' ? 'Tất cả' : type}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64 px-1 pb-1 md:p-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
          <input
            type="text"
            placeholder="Tìm thiết bị..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-mono text-zinc-400 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDevices.map((dev, i) => {
            const isOn = dev.state?.on;
            const isSensor = dev.type === 'sensor';

            return (
              <motion.div
                layout
                key={dev.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className={cn(
                  "glass-card p-6 rounded-2xl border transition-all relative overflow-hidden group",
                  isOn ? "border-primary/40 bg-primary/[0.03] shadow-[0_0_30px_rgba(34,211,238,0.05)]" : "border-zinc-800 bg-zinc-950/20"
                )}
              >
                {isOn && (
                  <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/10 blur-[40px] rounded-full group-hover:bg-primary/20 transition-all"></div>
                )}

                <div className="flex justify-between items-start mb-8">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-500",
                    isOn
                      ? "bg-primary text-zinc-950 border-primary shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                      : "bg-zinc-900 text-zinc-600 border-zinc-800"
                  )}>
                    {getDeviceIcon(dev.type)}
                  </div>

                  {!isSensor && (
                    <button
                      onClick={() => handleToggle(dev.id, dev.state)}
                      className={cn(
                        "w-12 h-7 rounded-full relative transition-all duration-300 border",
                        isOn ? "bg-primary border-primary" : "bg-zinc-800 border-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full transition-all duration-300",
                        isOn ? "right-1.5 bg-white shadow-lg" : "left-1.5 bg-zinc-600"
                      )} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className={cn(
                      "text-sm font-black uppercase tracking-tight transition-colors truncate",
                      isOn ? "text-white" : "text-zinc-500"
                    )}>{dev.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        dev.status === 'online' ? "bg-green-500" : "bg-zinc-800"
                      )}></span>
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{dev.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-900">
                    {dev.type === 'ac' && isOn ? (
                      <>
                        <div>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Cài đặt</p>
                          <p className="text-xs font-mono font-bold text-slate-300 uppercase">{dev.state.temp}°C / {dev.state.mode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Fan</p>
                          <p className="text-xs font-mono font-bold text-slate-300 uppercase">Auto</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Lần cuối</p>
                          <p className="text-[10px] font-mono text-zinc-500 font-bold uppercase">{dev.lastUpdate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Công suất</p>
                          <p className="text-[10px] font-mono font-bold text-zinc-500">
                            {isOn ? (dev.type === 'light' ? '12W' : '1.2kW') : '0.1W'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {isOn && dev.type === 'light' && (
                  <div className="mt-6">
                    <div className="w-full h-1 bg-zinc-900 rounded-full relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-primary w-[80%] shadow-[0_0_10px_#22d3ee]"></div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[8px] font-black text-zinc-700 uppercase">Độ sáng</span>
                      <span className="text-[9px] font-mono font-bold text-primary">80%</span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}

          {filteredDevices.length === 0 && (
            <div className="col-span-full py-20 text-center glass-card rounded-2xl border border-dashed border-zinc-800">
              <Smartphone size={40} className="mx-auto text-zinc-900 mb-4" />
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Không tìm thấy thiết bị nào khớp với tìm kiếm</p>
            </div>
          )}
        </div>
      </AnimatePresence>
    </div>
  );
}
