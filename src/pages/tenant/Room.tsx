import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  User, 
  Phone, 
  MapPin, 
  Activity, 
  Zap, 
  Droplet, 
  Wifi, 
  Calendar,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { useRoomStore } from '../../store/useRoomStore';
import { useAuthStore } from '../../store/useAuthStore';
import { formatCurrency, cn } from '../../lib/utils';

export default function TenantRoom() {
  const { user } = useAuthStore();
  const { myRoom, fetchMyRoom, loading } = useRoomStore();

  useEffect(() => {
    fetchMyRoom();
  }, [fetchMyRoom]);

  if (loading && !myRoom) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Activity className="text-primary animate-spin" size={32} />
      </div>
    );
  }

  if (!myRoom) {
    return (
      <div className="text-center py-20 bg-zinc-900/50 rounded-xl border border-dashed border-zinc-800">
        <Home size={48} className="mx-auto text-zinc-800 mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Không tìm thấy thông tin phòng</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Phòng của tôi</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Thông tin chi tiết và tình trạng thuê phòng</p>
        </div>
        <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded">
           <span className="text-primary font-black text-lg font-mono">PHÒNG {myRoom.number}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl border border-zinc-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>
            
            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
              <User size={14} /> Thông tin hợp đồng
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Người thuê</p>
                  <p className="text-sm font-bold text-slate-200">{myRoom.tenantName || user?.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Số điện thoại</p>
                  <p className="text-sm font-mono text-slate-200">{myRoom.tenant_phone_snapshot || 'Chưa cập nhật'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Ngày bắt đầu</p>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <Calendar size={14} className="text-zinc-600" />
                    <span>01/05/2026</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Giá thuê cơ bản</p>
                  <p className="text-xl font-mono font-black text-white">{formatCurrency(myRoom.base_price || myRoom.price || 0)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Dịch vụ bao gồm</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {myRoom.utilities?.split(',').map((u, i) => (
                      <span key={i} className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">{u.trim()}</span>
                    )) || (
                      <>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">Điện</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">Nước</span>
                        <span className="text-[9px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 font-bold uppercase">WiFi</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Indices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 group">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-zinc-950 transition-all">
                     <Zap size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">kWh</span>
               </div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Chỉ số điện hiện tại</p>
               <h4 className="text-2xl font-mono font-black text-white">{myRoom.electricity_index || 0}</h4>
               <p className="text-[9px] text-green-500 font-bold mt-2 uppercase tracking-tighter">● Cập nhật tự động từ IoT Gateway</p>
            </div>

            <div className="glass-card p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 group">
               <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-zinc-950 transition-all">
                     <Droplet size={20} />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">m³</span>
               </div>
               <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Chỉ số nước hiện tại</p>
               <h4 className="text-2xl font-mono font-black text-white">{myRoom.water_index || 0}</h4>
               <p className="text-[9px] text-zinc-600 font-bold mt-2 uppercase tracking-tighter italic">● Chốt chỉ số định kỳ hàng tháng</p>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
           <div className="glass-card p-6 rounded-xl border border-cyan-900/20 bg-zinc-950">
              <h4 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" /> Trạng thái phòng
              </h4>
              
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tình trạng</span>
                    <span className="bg-green-500/10 text-green-500 text-[9px] font-bold px-2 py-0.5 rounded border border-green-500/20 uppercase">Rented</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Tầng</span>
                    <span className="text-sm font-mono font-bold text-white">{myRoom.floor || '01'}</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Kết nốt IoT</span>
                    <span className="text-[9px] text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                       <Wifi size={12} /> SECURED
                    </span>
                 </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-900">
                 <button className="w-full py-4 rounded bg-primary text-zinc-950 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]">
                   KHAI BÁO TẠM TRÚ
                 </button>
              </div>
           </div>

           <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/10">
              <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Ghi chú từ quản lý</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                 Tòa nhà sẽ tiến hành phun thuốc khử khuẩn định kỳ vào sáng ngày 20/05. Vui lòng đóng kín cửa và thông báo nếu có thú cưng trong phòng.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
