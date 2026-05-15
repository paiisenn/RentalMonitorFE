import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Home, 
  Cpu, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../lib/api';
import { formatCurrency, cn } from '../../lib/utils';

const COLORS = ['#00daf3', '#8dcdff', '#00affe', '#ffb4ab', '#93000a'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [revenue, setRevenue] = useState<any[]>([]);
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [overviewRes, revenueRes, deviceRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/revenue'),
          api.get('/stats/devices')
        ]);
        setStats(overviewRes.data);
        setRevenue(revenueRes.data);
        setDeviceStats(deviceRes.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-primary animate-pulse w-12 h-12" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Đang tải dữ liệu tổng thể...</p>
      </div>
    </div>
  );

  const cards = [
    { 
      label: 'Tổng doanh thu', 
      value: formatCurrency(stats?.totalRevenue || 0), 
      icon: DollarSign, 
      color: 'text-primary', 
      bg: 'bg-primary/20',
      trend: '+12.5%',
      up: true
    },
    { 
      label: 'Phòng đang thuê', 
      value: stats?.activeRooms || 0, 
      icon: Home, 
      color: 'text-cyan-400', 
      bg: 'bg-cyan-500/20',
      trend: stats?.occupancyRate + '%',
      up: true
    },
    { 
      label: 'IoT Online', 
      value: stats?.onlineDevices || 0, 
      icon: Cpu, 
      color: 'text-green-400', 
      bg: 'bg-green-500/20',
      trend: 'Ổn định',
      up: true
    },
    { 
      label: 'Cảnh báo mới', 
      value: stats?.pendingAlerts || 0, 
      icon: ShieldAlert, 
      color: 'text-red-400', 
      bg: 'bg-red-500/20',
      trend: stats?.pendingAlerts > 0 ? 'Cần xử lý' : 'An toàn',
      up: stats?.pendingAlerts === 0
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold uppercase tracking-tighter text-slate-100">Bảng điều khiển hệ thống</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight">Real-time Admin Operations Hub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-card p-6 rounded relative overflow-hidden group"
          >
            <div className={cn("absolute top-0 right-0 w-24 h-24 blur-2xl opacity-10 rounded-full -mr-12 -mt-12", card.bg)} />
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded", card.bg)}>
                <card.icon size={20} className={card.color} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-bold uppercase",
                card.up ? "text-green-500" : "text-red-500"
              )}>
                {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {card.trend}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-100">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card p-8 rounded border border-cyan-900/10"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary" size={20} />
              <h3 className="font-bold uppercase tracking-widest text-sm text-slate-200">Biểu đồ doanh thu dự kiến</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00daf3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00daf3" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#4b5563" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `${val/1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #164e63', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#00daf3' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#00daf3" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Device Distribution */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded border border-cyan-900/10"
        >
          <div className="flex items-center gap-3 mb-8">
            <Cpu className="text-primary" size={20} />
            <h3 className="font-bold uppercase tracking-widest text-sm text-slate-200">Phân bổ thiết bị IoT</h3>
          </div>
          <div className="h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', color: '#fff', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-100">{stats?.onlineDevices || 0}</span>
              <span className="text-[9px] text-zinc-500 font-bold uppercase">IoT Active</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {deviceStats.map((stat, idx) => (
              <div key={stat.name} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] text-zinc-400 uppercase font-bold">{stat.name}: {stat.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded">
           <h3 className="font-bold uppercase tracking-widest text-sm text-slate-200 mb-6">Nhật ký hệ thống gần đây</h3>
           <div className="space-y-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-zinc-800/20 border border-zinc-800/50 rounded group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Activity size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-200">Owner "Phạm Hùng" vừa cập nhật trạng thái phòng</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Phòng 204 • Vừa xong</p>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-zinc-600" />
                </div>
              ))}
           </div>
        </div>
        
        <div className="glass-card p-8 rounded">
           <h3 className="font-bold uppercase tracking-widest text-sm text-slate-200 mb-6">Trực quan thiết bị IoT</h3>
           <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-green-500/5 border border-green-500/10 rounded group">
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Mạng khả dụng</p>
                  <h4 className="text-2xl font-bold text-slate-100">99.9%</h4>
              </div>
              <div className="p-6 bg-cyan-500/5 border border-cyan-500/10 rounded">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Độ trễ TB</p>
                  <h4 className="text-2xl font-bold text-slate-100">12ms</h4>
              </div>
              <div className="p-6 bg-primary/5 border border-primary/10 rounded">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Thiết bị lỗi</p>
                  <h4 className="text-2xl font-bold text-slate-100">02</h4>
              </div>
              <div className="p-6 bg-zinc-800/20 border border-zinc-800/50 rounded">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Firmware v2.4</p>
                  <h4 className="text-2xl font-bold text-slate-100 text-zinc-600 italic uppercase tracking-tighter">Updated</h4>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
