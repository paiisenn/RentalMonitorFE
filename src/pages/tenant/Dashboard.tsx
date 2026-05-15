import React, { useEffect } from 'react';
import {
  Zap,
  Droplet,
  Thermometer,
  Lightbulb,
  Wind,
  Power,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Cpu,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuthStore } from '../../store/useAuthStore';
import { useRoomStore } from '../../store/useRoomStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import { useBillStore } from '../../store/useBillStore';
import { useToast } from '../../components/ui/Toast';
import { formatCurrency, cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

const usageData = [
  { day: 'Thứ 2', usage: 12 },
  { day: 'Thứ 3', usage: 15 },
  { day: 'Thứ 4', usage: 10 },
  { day: 'Thứ 5', usage: 18 },
  { day: 'Thứ 6', usage: 22 },
  { day: 'Thứ 7', usage: 25 },
  { day: 'Chủ nhật', usage: 20 },
];

export default function TenantDashboard() {
  const { user } = useAuthStore();
  const { myRoom, fetchMyRoom } = useRoomStore();
  const { devices, fetchDevices, toggleLight, controlDoor, triggerFireAlarm, resetFireAlarm } = useDeviceStore();
  const { bills, fetchMyBills } = useBillStore();

  const { showToast } = useToast();

  React.useEffect(() => {
    fetchMyRoom();
    fetchDevices();
    fetchMyBills();
  }, [fetchMyRoom, fetchDevices, fetchMyBills]);

  const safeBills = Array.isArray(bills) ? bills : [];
  const bill = safeBills.find(b => b.roomNumber === user?.roomNumber) || safeBills[0] || { amount: 0, total_amount: 0, status: 'paid', dueDate: 'N/A' };
  const tenantDevices = (Array.isArray(devices) ? devices : []).filter(d => {
    const userRoomNum = user?.roomNumber?.toString().toUpperCase().trim();
    const userRoomId = user?.room_id?.toString();
    const deviceRoomNum = d.roomNumber?.toString().toUpperCase().trim();
    const deviceRoomId = (d.roomId || (d as any).room_id)?.toString();

    // Match if room number exists and matches
    const matchRoomNumber = userRoomNum && deviceRoomNum &&
      (userRoomNum === deviceRoomNum || userRoomNum.includes(deviceRoomNum) || deviceRoomNum.includes(userRoomNum));

    // Match if room object ID exists and matches
    const matchRoomId = userRoomId && deviceRoomId && userRoomId === deviceRoomId;

    return matchRoomNumber || matchRoomId;
  });

  useEffect(() => {
    console.log('[TENANT_DASHBOARD] Debug Context:', {
      userRoomNumber: user?.roomNumber,
      userRoomId: user?.room_id,
      devicesInStore: devices.length,
      filteredCount: tenantDevices.length
    });
    if (devices.length > 0 && tenantDevices.length === 0) {
      console.warn('[TENANT_DASHBOARD] Filtering removed all devices. Sample device from store:', devices[0]);
    }
  }, [user, devices, tenantDevices.length]);

  const getIsOn = (dev: any) => {
    if (!dev || !dev.state) return false;
    const type = dev.type;
    if (type === 'light') return !!dev.state.on;
    if (type === 'lock') return !dev.state.locked;
    if (type === 'fire_alarm' || type === 'fire_sensor') return !!dev.state.alert;
    if (type === 'meter') return true;
    return !!dev.state.on;
  };

  const handleDeviceAction = async (device: any) => {
    const devId = device.id || (device as any)._id;
    if (!devId) {
      showToast('Không tìm thấy ID thiết bị', 'error');
      return;
    }

    const devIdStr = devId.toString();
    try {
      if (device.type === 'light') {
        await toggleLight(devIdStr);
        showToast(`${device.state?.on ? 'Tắt' : 'Bật'} đèn thành công`, 'success');
      } else if (device.type === 'lock') {
        const action = device.state?.locked ? 'open' : 'close';
        await controlDoor(devIdStr, action);
        showToast(`${device.state?.locked ? 'Mở' : 'Đóng'} khóa thành công`, 'success');
      } else if (device.type === 'fire_alarm' || device.type === 'fire_sensor') {
        if (device.state?.alert) {
          await resetFireAlarm(devIdStr);
          showToast('Đã tắt báo động thành công', 'success');
        } else {
          if (confirm('BẠN CÓ CHẮC CHẮN MUỐN KÍCH HOẠT QUY TRÌNH THOÁT HIỂM KHẨN CẤP? Cửa sẽ tự động mở và đèn sẽ được bật.')) {
            await triggerFireAlarm(devIdStr);
            showToast('Đã kích hoạt quy trình thoát hiểm khẩn cấp!', 'success');
          }
        }
      }
    } catch (err) {
      showToast('Lỗi khi điều khiển thiết bị', 'error');
    }
  };

  const meterDevice = tenantDevices.find(d => d.type === 'meter');
  const displayElectricity = meterDevice?.state?.electricity || myRoom?.electricity_index || 0;
  const displayWater = meterDevice?.state?.water || myRoom?.water_index || 0;

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Chào buổi tối, {user?.name.split(' ').pop()}!</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 underline decoration-primary/30 underline-offset-4">
            {myRoom?.name || `Phòng ${user?.roomNumber}`} System Status: Optimal
          </p>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded border border-cyan-900/40 pr-6 shadow-xl shadow-black/20">
          <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center text-primary">
            <Thermometer size={18} />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold leading-none mb-1">Ambient Temp</p>
            <p className="text-sm font-mono font-bold text-white">24.5<span className="text-zinc-500 text-[10px] ml-0.5">°C</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bill Summary */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-card p-6 rounded-xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-primary">
                  <Zap size={20} />
                </div>
                {bill.status === 'unpaid' && (
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1 uppercase tracking-tighter">
                    <AlertCircle size={10} /> CHƯA THANH TOÁN
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Hóa đơn tháng này</p>
              <h3 className="text-3xl font-mono font-bold text-white mt-1">{formatCurrency(bill.total_amount || bill.amount)}</h3>
              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">DUE: {bill.dueDate}</span>
                <Link to="/tenant/bills" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-1">
                  CHI TIẾT <ChevronRight size={12} />
                </Link>
              </div>
            </motion.div>

            {/* Utility Stats */}
            <motion.div
              whileHover={{ y: -4 }}
              className="glass-card p-6 rounded-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <TrendingUp size={20} />
                </div>
                <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded border border-cyan-500/20 uppercase tracking-tighter">
                  {myRoom?.name || `#${user?.roomNumber}`}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tiêu thụ điện (Tháng)</p>
              <h3 className="text-3xl font-mono font-bold text-white mt-1">{displayElectricity.toFixed(1)} <span className="text-lg font-medium text-zinc-600">kWh</span></h3>
              <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Droplet size={14} className="text-blue-500" />
                  <span className="text-[10px] font-mono font-bold text-slate-300">{displayWater.toFixed(2)} m³</span>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-[10px] font-mono font-bold uppercase">{tenantDevices.filter(d => getIsOn(d)).length} DEVICES ON</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Consumption Chart */}
          <div className="glass-card p-6 rounded-xl overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-primary"></span> TIÊU THỤ NĂNG LƯỢNG
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono">HISTORY: 7 DAYS</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: 'rgba(34,211,238,0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: '700'
                    }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Smart Controls */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl h-full flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-primary"></span> ĐIỀU KHIỂN
              </h4>
              <Link to="/tenant/devices" className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">Tất cả</Link>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {tenantDevices.map((device, i) => {
                const isLight = device.type === 'light';
                const isLock = device.type === 'lock';
                const isFire = device.type === 'fire_alarm' || device.type === 'fire_sensor';
                const isMeter = device.type === 'meter';
                const isOn = getIsOn(device);
                const isCritical = isFire && device.state?.alert;

                return (
                  <motion.div
                    key={device.id || (device as any)._id || i}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => (isLight || isLock || isFire) && handleDeviceAction(device)}
                    className={cn(
                      "p-3 rounded border transition-all duration-300 flex items-center gap-4 cursor-pointer",
                      isCritical ? "border-red-500/50 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                        isOn ? "bg-cyan-500/5 border-cyan-500/30" : "bg-zinc-950/50 border-zinc-800"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded flex items-center justify-center transition-colors shadow-sm",
                      isCritical ? "bg-red-500 text-white" :
                        isOn ? "bg-primary text-zinc-950" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {isLight && <Lightbulb size={20} />}
                      {isLock && <Lock size={20} />}
                      {isFire && <AlertCircle size={20} />}
                      {isMeter && <Zap size={20} />}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <p className={cn(
                        "font-bold text-xs uppercase tracking-wider truncate",
                        isCritical ? "text-red-500" :
                          isOn ? "text-primary" : "text-zinc-400"
                      )}>{device.name || (isFire ? 'Cảm biến cháy' : 'Thiết bị')}</p>
                      {isMeter && (
                        <div className="flex gap-2 mt-0.5">
                          <span className="text-[9px] text-cyan-400 font-mono font-bold">E: {device.state?.electricity?.toFixed(2) || '0.00'}<span className="text-[7px] ml-0.5 opacity-50">kWh</span></span>
                          <span className="text-[9px] text-blue-400 font-mono font-bold">W: {device.state?.water?.toFixed(2) || '0.00'}<span className="text-[7px] ml-0.5 opacity-50">m³</span></span>
                        </div>
                      )}
                      {isFire && (
                        <div className="flex gap-2 mt-0.5">
                          <span className={cn(
                            "text-[8px] font-bold uppercase",
                            isCritical ? "text-red-400" : "text-zinc-500"
                          )}>
                            Trạng thái: {isCritical ? "CẢNH BÁO" : "BÌNH THƯỜNG"}
                          </span>
                        </div>
                      )}
                      <p className="text-[9px] text-zinc-600 font-mono italic uppercase">{device.lastUpdate}</p>
                    </div>

                    {(isLight || isLock) && (
                      <div className={cn(
                        "w-8 h-4 rounded-full relative transition-colors border border-transparent",
                        isOn ? "bg-primary shadow-[0_0_8px_rgba(34,211,238,0.3)]" : "bg-zinc-800"
                      )}>
                        <div className={cn(
                          "absolute top-1 w-2 h-2 rounded-full transition-all",
                          isOn ? "right-1 bg-zinc-950" : "left-1 bg-zinc-600"
                        )} />
                      </div>
                    )}

                    {isFire && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeviceAction(device);
                        }}
                        className={cn(
                          "text-[8px] font-black uppercase px-2 py-1 rounded border transition-all",
                          isCritical ? "bg-red-500 text-white border-red-400 animate-pulse" : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                        )}
                      >
                        {isCritical ? "TẮT BÁO ĐỘNG" : "BÁO ĐỘNG"}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <button className="w-full py-4 rounded border border-dashed border-zinc-800 text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-white hover:border-zinc-700 transition-all">
                + THÊM THIẾT BỊ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
