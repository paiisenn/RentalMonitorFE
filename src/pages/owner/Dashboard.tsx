import React from 'react';
import {
  Building2,
  Users,
  Receipt,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  CheckCircle2,
  Clock,
  TrendingUp,
  Zap,
  Droplet
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { formatCurrency, cn } from '../../lib/utils';
import { useRoomStore } from '../../store/useRoomStore';
import { useBillStore } from '../../store/useBillStore';
import { useUserStore } from '../../store/useUserStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import { Link } from 'react-router-dom';

const revenueData = [
  { month: 'T1', amount: 45000000 },
  { month: 'T2', amount: 48000000 },
  { month: 'T3', amount: 42000000 },
  { month: 'T4', amount: 52000000 },
  { month: 'T5', amount: 55000000 },
];

const COLORS = ['#00daf3', '#8dcdff', '#00affe', '#ffb4ab', '#93000a'];

export default function OwnerDashboard() {
  const { rooms, fetchRooms } = useRoomStore();
  const { tenants, fetchTenants } = useUserStore();
  const { bills, fetchBills } = useBillStore();
  const { devices, fetchDevices } = useDeviceStore();

  React.useEffect(() => {
    fetchRooms();
    fetchTenants();
    fetchBills();
    fetchDevices();
  }, [fetchRooms, fetchTenants, fetchBills, fetchDevices]);

  const getRoomIndices = (roomNum: string) => {
    const meter = devices.find(d => d.type === 'meter' && d.roomNumber === roomNum);
    const room = rooms.find(r => r.number === roomNum);
    return {
      electricity: meter?.state?.electricity || room?.electricity_index || 0,
      water: meter?.state?.water || room?.water_index || 0
    };
  };

  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeTenants = Array.isArray(tenants) ? tenants : [];
  const safeBills = Array.isArray(bills) ? bills : [];

  const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.amount, 0);
  const occupiedRooms = safeRooms.filter(r => r.status === 'rented').length;
  const maintenanceRooms = safeRooms.filter(r => r.status === 'maintenance' || r.status === 'alert').length;

  const stats = [
    { label: 'Doanh thu tháng 5', value: formatCurrency(55000000), change: '+12.5%', isUp: true, icon: Receipt, color: 'primary' },
    { label: 'Tỷ lệ lấp đầy', value: `${safeRooms.length > 0 ? Math.round((occupiedRooms / safeRooms.length) * 100) : 0}%`, change: '+2.1%', isUp: true, icon: Building2, color: 'secondary' },
    { label: 'Đang bảo trì', value: maintenanceRooms.toString(), change: '-1', isUp: false, icon: AlertTriangle, color: 'error' },
    { label: 'Tổng số người thuê', value: safeTenants.length.toString(), change: '+2', isUp: true, icon: Users, color: 'primary' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Quản lý nhà của bạn</h2>
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 underline decoration-primary/30 underline-offset-4">Tòa nhà SmartStay A • {rooms.length} phòng • 2 tầng</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5 rounded-xl relative overflow-hidden group hover:border-cyan-500/40 transition-colors"
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity",
                stat.color === 'primary' ? "bg-primary" :
                  stat.color === 'secondary' ? "bg-cyan-600" : "bg-error"
              )}></div>
              <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">{stat.label}</p>
                <div className={cn(
                  "flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter",
                  stat.isUp ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                )}>
                  {stat.isUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {stat.change}
                </div>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-mono font-bold text-white transition-colors group-hover:text-primary">{stat.value}</h3>
                <Icon size={20} className="text-zinc-700" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-xl relative">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-primary"></span> TIÊU THỤ NĂNG LƯỢNG TB
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Điện</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full"></div>
                <span className="text-[8px] text-zinc-500 font-bold uppercase">Nước</span>
              </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: '700' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 10, fontWeight: '700' }}
                  tickFormatter={(value) => `${value / 1000000}M`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: 'rgba(34,211,238,0.2)',
                    borderRadius: '4px',
                    color: '#fff',
                    fontSize: '10px'
                  }}
                  cursor={{ fill: 'rgba(34,211,238,0.05)' }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === revenueData.length - 1 ? '#22d3ee' : 'rgba(34, 211, 238, 0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Status Summary (New) */}
        <div className="glass-card p-6 rounded-xl relative overflow-hidden bg-zinc-950/20">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500"></span> HỆ THỐNG IOT
            </h4>
            <Link to="/owner/devices" className="text-[9px] text-primary font-black uppercase tracking-widest hover:underline">QUẢN LÝ</Link>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-green-500/10 flex items-center justify-center text-green-500">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Kết nối</p>
                  <p className="text-lg font-mono font-black text-white">99.9<span className="text-[10px] text-zinc-500">%</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[8px] text-zinc-700 font-bold uppercase mb-1 underline decoration-green-500/30">Latency</p>
                <p className="text-[10px] font-mono text-green-500">12ms</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-[8px] text-zinc-600 font-bold uppercase mb-2">Đang bật</p>
                <p className="text-xl font-mono font-black text-primary">08</p>
              </div>
              <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <p className="text-[8px] text-zinc-600 font-bold uppercase mb-2">Offline</p>
                <p className="text-xl font-mono font-black text-zinc-400">00</p>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-900">
              <h5 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-4">Hoạt động gần đây</h5>
              <div className="space-y-3">
                {[
                  { room: '101', action: 'OFF', time: '2m ago' },
                  { room: '202', action: 'ON', time: '15m ago' }
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-400">PHÒNG {log.room}</span>
                    <span className="text-[9px] font-mono text-zinc-600">{log.action} • {log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Room Status List */}
        <div className="lg:col-span-3 glass-card p-6 rounded-xl flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-primary"></span> TRẠNG THÁI PHÒNG
            </h4>
            <button className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">DS CHI TIẾT</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {rooms.map((room, i) => (
              <div key={room.id || (room as any)._id || i} className="flex items-center gap-4 group cursor-pointer">
                <div className={cn(
                  "w-8 h-8 rounded flex items-center justify-center transition-colors border shrink-0",
                  room.status === 'rented' ? "bg-cyan-500/5 text-cyan-400 border-cyan-500/20" :
                    room.status === 'empty' ? "bg-zinc-800 text-zinc-500 border-zinc-700" :
                      room.status === 'alert' ? "bg-red-500/5 text-red-500 border-red-500/20" : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                )}>
                  <Home size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs uppercase tracking-wider text-slate-200">{room.name || `#${room.number}`}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1" title="Điện">
                        <Zap size={10} className="text-primary" />
                        <span className="text-[9px] font-mono font-bold text-zinc-500">{getRoomIndices(room.number!).electricity.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Nước">
                        <Droplet size={10} className="text-blue-500" />
                        <span className="text-[9px] font-mono font-bold text-zinc-500">{getRoomIndices(room.number!).water.toFixed(2)}</span>
                      </div>
                      {room.status === 'rented' && <p className="text-[10px] font-mono font-bold text-cyan-400 ml-2">{formatCurrency(room.price!)}</p>}
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate uppercase">
                    {room.status === 'rented' ? `${room.tenantName}` :
                      room.status === 'empty' ? 'Vacant' :
                        room.status === 'alert' ? `ISSUE: ${room.issue}` : `MAINT: ${room.issue}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded border border-zinc-800">
              <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Đã thu
              </span>
              <span className="font-mono text-xs font-bold text-slate-300">{bills.filter(b => b.status === 'paid').length}/{bills.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded border border-zinc-800">
              <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></div> Đang chờ
              </span>
              <span className="font-mono text-xs font-bold text-primary">{bills.filter(b => b.status === 'unpaid').length}/{bills.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
