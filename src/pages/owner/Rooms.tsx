import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRoomStore } from '../../store/useRoomStore';
import { useUserStore } from '../../store/useUserStore';
import { useDeviceStore } from '../../store/useDeviceStore';
import {
  Home,
  Plus,
  Search,
  Filter,
  Users,
  Settings2,
  Trash2,
  AlertCircle,
  X,
  UserPlus,
  CheckCircle2,
  Phone,
  Droplets,
  Zap,
  DollarSign
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { Room } from '../../types';

export default function OwnerRooms() {
  const { rooms, fetchRooms, loading, assignRoom, updateRoomStatus } = useRoomStore();
  const { tenants, fetchTenants } = useUserStore();
  const { devices, fetchDevices } = useDeviceStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Assignment Form State
  const [assignForm, setAssignForm] = useState({
    tenantName: '',
    tenantPhone: '',
    current_tenant_id: ''
  });

  // Status Form State
  const [statusForm, setStatusForm] = useState({
    status: '',
    issue: '',
    expectedFixDate: ''
  });

  useEffect(() => {
    fetchRooms();
    fetchTenants();
    fetchDevices();
  }, [fetchRooms, fetchTenants, fetchDevices]);

  const getRoomIndices = (roomNum: string) => {
    const meter = (devices || []).find((d: any) => d.type === 'meter' && d.roomNumber === roomNum);
    const room = rooms.find(r => r.number === roomNum);
    return {
      electricity: meter?.state?.electricity || room?.electricity_index || 0,
      water: meter?.state?.water || room?.water_index || 0
    };
  };

  const filteredRooms = rooms.filter(room => {
    const matchesFilter = filter === 'all' || room.status === filter;
    const roomNumber = room.number || '';
    const tenantName = room.tenantName || '';
    const searchTerm = (search || '').toLowerCase();

    const matchesSearch = roomNumber.toLowerCase().includes(searchTerm) ||
      tenantName.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: rooms.length,
    rented: rooms.filter(r => r.status === 'rented').length,
    empty: rooms.filter(r => r.status === 'empty').length,
    maintenance: rooms.filter(r => r.status === 'maintenance' || r.status === 'alert').length,
  };

  const handleOpenAssign = (room: Room) => {
    setSelectedRoom(room);
    setAssignForm({ tenantName: '', tenantPhone: '', current_tenant_id: '' });
    setIsAssignModalOpen(true);
  };

  const handleOpenStatus = (room: Room) => {
    setSelectedRoom(room);
    setStatusForm({
      status: room.status,
      issue: room.issue || '',
      expectedFixDate: room.expectedFixDate || ''
    });
    setIsStatusModalOpen(true);
  };

  const onSubmitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    await assignRoom(selectedRoom.id, {
      tenantName: assignForm.tenantName,
      current_tenant_id: assignForm.current_tenant_id || `t_${Date.now()}`,
      tenant_phone_snapshot: assignForm.tenantPhone
    });

    setIsAssignModalOpen(false);
    setSelectedRoom(null);
  };

  const onSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    await updateRoomStatus(selectedRoom.id, {
      status: statusForm.status,
      issue: statusForm.status !== 'rented' && statusForm.status !== 'empty' ? statusForm.issue : undefined,
      expectedFixDate: statusForm.status !== 'rented' && statusForm.status !== 'empty' ? statusForm.expectedFixDate : undefined
    });

    setIsStatusModalOpen(false);
    setSelectedRoom(null);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Hệ thống quản lý phòng</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Giao diện vận hành thời gian thực • {rooms.length} Units
          </p>
        </div>
        <button className="bg-primary hover:bg-cyan-300 text-zinc-950 px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all active:scale-95">
          <Plus size={16} /> Thêm phòng mới
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng số phòng', value: stats.total, color: 'zinc', icon: Home },
          { label: 'Đang cho thuê', value: stats.rented, color: 'cyan', icon: UserPlus },
          { label: 'Phòng trống', value: stats.empty, color: 'zinc', icon: Home },
          { label: 'Cần xử lý', value: stats.maintenance, color: 'red', icon: AlertCircle },
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 rounded bg-zinc-900/50 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mb-1">{s.label}</p>
              <p className={cn("text-xl font-mono font-bold", s.color === 'cyan' ? "text-primary" : s.color === 'red' ? "text-red-500" : "text-slate-300")}>{s.value}</p>
            </div>
            <s.icon size={20} className="text-zinc-800" />
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/30 p-2 rounded border border-zinc-800 backdrop-blur-md">
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
          {['all', 'rented', 'empty', 'maintenance', 'alert'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                filter === f ? "bg-primary text-zinc-950" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {f === 'all' ? 'Tất cả' : f === 'rented' ? 'Đã thuê' : f === 'empty' ? 'Trống' : f === 'maintenance' ? 'Bảo trì' : 'Cảnh báo'}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input
            type="text"
            placeholder="TÌM THEO SỐ PHÒNG, TÊN NGƯỜI THUÊ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded pl-10 pr-4 py-2.5 text-[10px] font-mono text-zinc-400 focus:border-primary outline-none transition-all placeholder:text-zinc-800"
          />
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 glass-card rounded-xl border border-zinc-900 animate-pulse bg-zinc-900/50" />
          ))
        ) : filteredRooms.length === 0 ? (
          <div className="col-span-full py-20 text-center glass-card rounded-xl border border-dashed border-zinc-800">
            <Home size={40} className="text-zinc-800 mx-auto mb-4" />
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Không tìm thấy phòng nào phù hợp</h3>
          </div>
        ) : (
          filteredRooms.map((room, i) => (
            <motion.div
              key={room.id || (room as any)._id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group p-0 rounded-xl border border-zinc-800 hover:border-cyan-500/30 transition-all overflow-hidden relative flex flex-col"
            >
              <div className={cn(
                "absolute top-0 left-0 w-full h-1 z-10",
                room.status === 'rented' ? "bg-cyan-500" :
                  room.status === 'empty' ? "bg-zinc-700" :
                    room.status === 'alert' ? "bg-red-500" : "bg-amber-500"
              )}></div>

              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-mono font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                      {room.name || `#${room.number}`}
                      {room.status === 'alert' && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 font-mono">Layer 0{room.floor}</p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-500 group-hover:rotate-12",
                    room.status === 'rented' ? "bg-cyan-500/5 text-cyan-400 border-cyan-500/20" :
                      room.status === 'empty' ? "bg-zinc-800 text-zinc-500 border-zinc-700" : "bg-red-500/5 text-red-500 border-red-500/20"
                  )}>
                    <Home size={18} />
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {room.status === 'rented' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                          <Users size={14} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Cư dân</p>
                          <p className="text-xs font-bold text-slate-300 truncate">{room.tenantName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-800/50 flex items-center justify-center text-zinc-500">
                          <Phone size={14} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest leading-none mb-1">Liên hệ</p>
                          <p className="text-xs font-mono font-bold text-slate-400">{room.tenant_phone_snapshot || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ) : room.status === 'empty' ? (
                    <div className="py-6 px-3 bg-zinc-950/50 rounded border border-zinc-900 border-dashed flex flex-col items-center justify-center gap-2 group/empty cursor-pointer" onClick={() => handleOpenAssign(room)}>
                      <UserPlus size={16} className="text-zinc-700 group-hover/empty:text-primary transition-colors" />
                      <p className="text-[9px] text-zinc-700 font-black uppercase tracking-[0.2em] group-hover/empty:text-zinc-500 transition-colors">TRỐNG • CLICK ĐỂ GÁN</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-red-500/5 rounded border border-red-500/10">
                      <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest mb-1">PROBLEM DETECTED</p>
                        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">{room.issue}</p>
                        {room.expectedFixDate && <p className="text-[9px] text-zinc-500 mt-2 font-bold uppercase">Dự kiến: {room.expectedFixDate}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-5 py-4 bg-zinc-950/50 border-t border-zinc-900 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5" title="Electricity Index">
                      <Zap size={10} className="text-primary" />
                      <span className="text-[10px] font-mono font-bold text-zinc-400">{getRoomIndices(room.number!).electricity.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Water Index">
                      <Droplets size={10} className="text-blue-500" />
                      <span className="text-[10px] font-mono font-bold text-zinc-400">{getRoomIndices(room.number!).water.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-slate-200">{formatCurrency(room.price || 0)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenStatus(room)}
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white py-2 rounded text-[9px] font-bold uppercase tracking-widest transition-all border border-zinc-700/50"
                  >
                    Tùy chỉnh
                  </button>
                  {room.status === 'empty' && (
                    <button
                      onClick={() => handleOpenAssign(room)}
                      className="flex-1 bg-primary/10 hover:bg-primary text-primary hover:text-zinc-950 py-2 rounded text-[9px] font-bold uppercase tracking-widest transition-all border border-primary/20"
                    >
                      Cho thuê
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Assignment Modal */}
      <AnimatePresence>
        {isAssignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-0 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/30">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Bàn giao phòng #{selectedRoom?.number}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Cập nhật thông tin khách thuê mới</p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={onSubmitAssign} className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} /> Tên khách thuê
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="VD: Lê Văn A"
                    value={assignForm.tenantName}
                    onChange={e => setAssignForm({ ...assignForm, tenantName: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-medium text-white focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} /> Số điện thoại
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={assignForm.tenantPhone}
                    onChange={e => setAssignForm({ ...assignForm, tenantPhone: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-medium text-white focus:border-primary outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Settings2 size={12} /> Liên kết tài khoản (ID)
                  </label>
                  <input
                    type="text"
                    placeholder="Tùy chọn: Nhập ID người thuê nếu có"
                    value={assignForm.current_tenant_id}
                    onChange={e => setAssignForm({ ...assignForm, current_tenant_id: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-medium text-white focus:border-primary outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAssignModalOpen(false)}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold py-3 rounded text-[10px] uppercase tracking-widest transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-primary hover:bg-cyan-300 text-zinc-950 font-black py-3 rounded text-[10px] uppercase tracking-widest shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Hoàn tất bàn giao
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Status Modal */}
      <AnimatePresence>
        {isStatusModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStatusModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md glass-card p-0 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/30">
                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Trạng thái phòng #{selectedRoom?.number}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Cập nhật chế độ vận hành hoặc bảo trì</p>
                </div>
                <button onClick={() => setIsStatusModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={onSubmitStatus} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'rented', label: 'Đang thuê', color: 'cyan' },
                    { id: 'empty', label: 'Phòng trống', color: 'zinc' },
                    { id: 'maintenance', label: 'Bảo trì', color: 'amber' },
                    { id: 'alert', label: 'Cảnh báo', color: 'red' },
                  ].map(st => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStatusForm({ ...statusForm, status: st.id })}
                      className={cn(
                        "py-3 rounded text-[10px] font-bold uppercase tracking-widest border transition-all",
                        statusForm.status === st.id
                          ? `bg-${st.color === 'cyan' ? 'primary' : st.color === 'red' ? 'red-500' : 'zinc-700'} text-${st.color === 'cyan' ? 'zinc-950' : 'white'} border-transparent`
                          : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {(statusForm.status === 'maintenance' || statusForm.status === 'alert') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Mô tả sự cố/bảo trì</label>
                      <textarea
                        required
                        placeholder="Nhập chi tiết vấn đề..."
                        value={statusForm.issue}
                        onChange={e => setStatusForm({ ...statusForm, issue: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-medium text-white focus:border-primary outline-none min-h-[100px] resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Ngày dự kiến hoàn thành</label>
                      <input
                        type="text"
                        placeholder="VD: 20/05/2026"
                        value={statusForm.expectedFixDate}
                        onChange={e => setStatusForm({ ...statusForm, expectedFixDate: e.target.value })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-medium text-white focus:border-primary outline-none"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-black py-4 rounded text-[10px] uppercase tracking-widest transition-all shadow-xl"
                  >
                    Cập nhật trạng thái
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
