import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useBillStore } from '../../store/useBillStore';
import { useRoomStore } from '../../store/useRoomStore';
import {
  Receipt,
  Search,
  Filter,
  Download,
  Plus,
  Activity,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  ChevronRight,
  X,
  Zap,
  Droplets,
  DollarSign,
  Calendar,
  Home
} from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';
import { Bill } from '../../types';

export default function OwnerBills() {
  const { bills, fetchBills, loading, createBill, updateBillStatus } = useBillStore();
  const { rooms, fetchRooms } = useRoomStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Form State
  const [form, setForm] = useState({
    roomId: '',
    month: `Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
    electricity_index: '',
    water_index: '',
    other_services: 0,
    dueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchBills();
    fetchRooms();
  }, [fetchBills, fetchRooms]);

  const totalRevenue = bills.reduce((acc, curr) => acc + curr.amount, 0);
  const filteredBills = bills.filter(bill => {
    if (filter === 'all') return true;
    return bill.status === filter;
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find(r => r.id === form.roomId);
    if (!room) return;

    // Simplified calculation logic
    const prevElec = room.electricity_index || 0;
    const prevWater = room.water_index || 0;
    const elecUsage = Number(form.electricity_index) - prevElec;
    const waterUsage = Number(form.water_index) - prevWater;

    // Mock rates
    const elecPrice = 3500;
    const waterPrice = 15000;

    const elecCost = elecUsage * elecPrice;
    const waterCost = waterUsage * waterPrice;
    const total = (room.price || 0) + elecCost + waterCost + Number(form.other_services);

    await createBill({
      roomNumber: room.number,
      tenantName: room.tenantName || 'N/A',
      amount: total,
      total_amount: total,
      electricity_index: Number(form.electricity_index),
      water_index: Number(form.water_index),
      dueDate: form.dueDate,
      month: form.month,
      details: {
        room: room.price || 0,
        electricity: elecCost,
        water: waterCost,
        other: Number(form.other_services)
      }
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Quản lý hóa đơn</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Theo dõi doanh thu và công nợ trên toàn hệ thống
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-cyan-300 text-zinc-950 px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Tạo hóa đơn mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl bg-primary/5 border-primary/20">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
            <TrendingUp size={12} /> Tổng doanh thu dự kiến
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-mono font-bold text-white tracking-tighter">{formatCurrency(totalRevenue)}</h3>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <CheckCircle2 size={12} className="text-green-500" /> Tỷ lệ thanh toán
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-mono font-bold text-white tracking-tighter">94.2%</h3>
          </div>
        </div>
        <div className="glass-card p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-2">
            <Clock size={12} className="text-red-500" /> Nợ quá hạn
          </p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-mono font-bold text-white tracking-tighter">{formatCurrency(bills.filter(b => b.status === 'overdue').reduce((a, b) => a + b.amount, 0))}</h3>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/30 p-2 rounded border border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
          {['all', 'unpaid', 'paid', 'overdue'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filter === f ? "bg-white text-zinc-950" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {f === 'all' ? 'Tất cả' : f === 'paid' ? 'Đã thanh toán' : f === 'unpaid' ? 'Chưa thanh toán' : 'Quá hạn'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input
            type="text"
            placeholder="TÌM SỐ PHÒNG HOẶC TÊN..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded pl-10 pr-4 py-2.5 text-[10px] font-mono text-zinc-400 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Bills Table */}
      <div className="glass-card rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Phòng</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Khách thuê</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Kỳ hóa đơn</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tổng tiền</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Activity className="text-primary animate-spin mx-auto" size={24} />
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Receipt size={40} className="text-zinc-800 mx-auto mb-4" />
                    <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.2em]">HỆ THỐNG TRỐNG DỮ LIỆU</p>
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, i) => (
                  <motion.tr
                    key={bill.id || (bill as any)._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="group hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="text-xs font-mono font-bold text-slate-200">#{bill.roomNumber}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-300">{bill.tenantName}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{bill.month}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-mono font-bold text-white group-hover:text-primary transition-colors">{formatCurrency(bill.amount)}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                        bill.status === 'paid' ? "bg-green-500/10 text-green-500" :
                          bill.status === 'overdue' ? "bg-red-500/20 text-red-500" :
                            "bg-amber-500/10 text-amber-500"
                      )}>
                        <div className={cn("w-1 h-1 rounded-full",
                          bill.status === 'paid' ? "bg-green-500" :
                            bill.status === 'overdue' ? "bg-red-500" :
                              "bg-amber-500"
                        )} />
                        {bill.status === 'paid' ? 'Đã thu' : bill.status === 'overdue' ? 'Quá hạn' : 'Chờ thu'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button className="text-zinc-600 hover:text-primary transition-colors" title="Chi tiết">
                          <FileText size={16} />
                        </button>
                        <button className="text-zinc-600 hover:text-white transition-colors" title="Tải xuống">
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => updateBillStatus(bill.id, 'paid')}
                          className="bg-zinc-800 hover:bg-green-600 text-zinc-400 hover:text-white p-1.5 rounded transition-all"
                          title="Xác nhận đã thu"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl glass-card p-0 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Tính tiền & Xuất hóa đơn</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Hệ thống tính toán dựa trên chỉ số vận hành</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Selection & Period */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Home size={12} /> Chọn phòng thanh toán
                      </label>
                      <select
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                        value={form.roomId}
                        onChange={e => setForm({ ...form, roomId: e.target.value })}
                      >
                        <option value="">-- CHỌN PHÒNG --</option>
                        {rooms.filter(r => r.status === 'rented').map(r => (
                          <option key={r.id} value={r.id}>Phòng {r.number} - {r.tenantName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={12} /> Kỳ thanh toán
                        </label>
                        <input
                          type="text"
                          value={form.month}
                          onChange={e => setForm({ ...form, month: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Clock size={12} /> Hạn thanh toán
                        </label>
                        <input
                          type="date"
                          value={form.dueDate}
                          onChange={e => setForm({ ...form, dueDate: e.target.value })}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg">
                      <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest border-b border-zinc-900 pb-2 mb-3">Thông tin giá thuê</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500 uppercase">Tiền phòng cơ bản:</span>
                          <span className="text-white font-mono">{form.roomId ? formatCurrency(rooms.find(r => r.id === form.roomId)?.price || 0) : '0 ₫'}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-zinc-500 uppercase">Khách thuê:</span>
                          <span className="text-primary font-bold uppercase">{form.roomId ? rooms.find(r => r.id === form.roomId)?.tenantName : '--'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Index Entry */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Zap size={12} /> Chỉ số Điện mới (kWh)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          placeholder="Nhập số điện hiện tại"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                          value={form.electricity_index}
                          onChange={e => setForm({ ...form, electricity_index: e.target.value })}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-zinc-700 font-bold uppercase">
                          Cũ: {form.roomId ? rooms.find(r => r.id === form.roomId)?.electricity_index : 0}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Droplets size={12} /> Chỉ số Nước mới (m³)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required
                          placeholder="Nhập số nước hiện tại"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                          value={form.water_index}
                          onChange={e => setForm({ ...form, water_index: e.target.value })}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-zinc-700 font-bold uppercase">
                          Cũ: {form.roomId ? rooms.find(r => r.id === form.roomId)?.water_index : 0}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <DollarSign size={12} /> Dịch vụ khác / Phụ thu
                      </label>
                      <input
                        type="number"
                        placeholder="WiFi, rác, vệ sinh..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                        value={form.other_services}
                        onChange={e => setForm({ ...form, other_services: Number(e.target.value) })}
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-cyan-300 text-zinc-950 font-black py-4 rounded text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"
                      >
                        <Receipt size={16} /> Phê duyệt & Gửi hóa đơn
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
