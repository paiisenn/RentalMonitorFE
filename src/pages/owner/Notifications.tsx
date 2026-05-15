import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { 
  Bell, 
  Plus, 
  Search, 
  Megaphone, 
  Users, 
  Clock, 
  Trash2, 
  Edit2, 
  Send,
  X,
  Activity,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Notification } from '../../types';

export default function OwnerNotifications() {
  const { notifications, fetchNotifications, loading, createNotification, markAsRead } = useNotificationStore();
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'broadcast' as 'broadcast' | 'urgent' | 'maintenance',
    target: 'Tất cả cư dân'
  });

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'urgent') return notif.type === 'urgent';
    if (filter === 'broadcast') return notif.type === 'broadcast';
    return true;
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createNotification({
      ...form,
      date: new Date().toLocaleDateString('vi-VN'),
      isRead: false
    });
    setIsModalOpen(false);
    setForm({ title: '', content: '', type: 'broadcast', target: 'Tất cả cư dân' });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Thông báo cư dân</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Gửi tin tức, cảnh báo bảo trì và thông báo khẩn cấp
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-cyan-300 text-zinc-950 px-6 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 transition-all active:scale-95"
        >
          <Plus size={16} /> Soạn thông báo mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
             <input 
               type="text" 
               placeholder="TÌM KIẾM TIN TIN..."
               className="w-full bg-zinc-950 border border-zinc-800 rounded pl-10 pr-4 py-2.5 text-[10px] font-mono text-zinc-400 focus:border-primary outline-none"
             />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-4 ml-2">Phân loại tin</p>
            {[
              { id: 'all', label: 'Tất cả thông báo', icon: Bell },
              { id: 'urgent', label: 'Khẩn cấp / Cảnh báo', icon: Megaphone },
              { id: 'broadcast', label: 'Thông báo chung', icon: Users },
              { id: 'maintenance', label: 'Lịch bảo trì', icon: Clock },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded text-[10px] font-bold uppercase tracking-widest transition-all",
                  filter === item.id ? "bg-zinc-800 text-primary border border-zinc-700" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                )}
              >
                <item.icon size={14} />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800">
             <h4 className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-3">Thống kê gửi tin</h4>
             <div className="space-y-3">
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase">Đã gửi tháng này:</span>
                   <span className="text-sm font-mono font-bold text-white">12</span>
                </div>
                <div className="flex justify-between items-end">
                   <span className="text-[10px] font-bold text-zinc-400 uppercase">Tỷ lệ xem:</span>
                   <span className="text-sm font-mono font-bold text-primary">89%</span>
                </div>
             </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="p-20 text-center">
              <Activity className="text-primary animate-spin mx-auto" size={24} />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-20 text-center glass-card rounded-xl border border-dotted border-zinc-800">
               <Bell size={40} className="text-zinc-800 mx-auto mb-4" />
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Không tìm thấy thông báo phù hợp</p>
            </div>
          ) : (
            filteredNotifications.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "glass-card p-6 rounded-xl border group transition-all",
                  notif.type === 'urgent' ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_-10px_rgba(239,68,68,0.2)]" : "border-zinc-800 bg-zinc-900/20"
                )}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-5">
                     <div className={cn(
                       "w-12 h-12 rounded-lg border flex items-center justify-center shrink-0 transition-all",
                       notif.type === 'urgent' ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-glow-red" : 
                       notif.type === 'maintenance' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                       "bg-primary/10 text-primary border-primary/20"
                     )}>
                        {notif.type === 'urgent' ? <Megaphone size={20} /> : 
                         notif.type === 'maintenance' ? <Clock size={20} /> : <Bell size={20} />}
                     </div>
                     <div>
                       <div className="flex items-center gap-3">
                          <h4 className={cn(
                            "text-sm font-bold uppercase tracking-wide group-hover:text-primary transition-colors",
                            notif.type === 'urgent' ? "text-red-400" : "text-slate-200"
                          )}>
                             {notif.title}
                          </h4>
                          {notif.type === 'urgent' && (
                            <span className="px-2 py-0.5 rounded bg-red-500 text-[8px] font-black uppercase text-white animate-pulse">Khẩn cấp</span>
                          )}
                       </div>
                       <div className="flex items-center gap-4 mt-2">
                          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1">
                             <Users size={10} /> ĐỐI TƯỢNG: {notif.target}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono italic flex items-center gap-1">
                             <Clock size={10} /> {notif.date}
                          </span>
                       </div>
                       <p className="text-xs text-zinc-500 leading-relaxed mt-4 max-w-2xl">{notif.content}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                     <button className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-white hover:border-zinc-700 transition-all">
                        <Edit2 size={14} />
                     </button>
                     <button className="p-2.5 rounded bg-zinc-950 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-500/30 transition-all">
                        <Trash2 size={14} />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Compose Notification Modal */}
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
              className="relative w-full max-w-xl glass-card p-0 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/40">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <Megaphone size={20} />
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tighter font-mono">Soạn thảo bản tin</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Gửi thông tin tới cư dân IoT của bạn</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Loại thông báo</label>
                      <select 
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                        value={form.type}
                        onChange={e => setForm({...form, type: e.target.value as any})}
                      >
                         <option value="broadcast">THÔNG BÁO CHUNG</option>
                         <option value="urgent">KHẨN CẤP (ĐỎ)</option>
                         <option value="maintenance">LỊCH BẢO TRÌ</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Đối tượng nhận</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                        value={form.target}
                        onChange={e => setForm({...form, target: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tiêu đề bản tin</label>
                   <input 
                     type="text" 
                     required
                     placeholder="Ví dụ: Thông báo bảo trì điện định kỳ..."
                     className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none"
                     value={form.title}
                     onChange={e => setForm({...form, title: e.target.value})}
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Nội dung chi tiết</label>
                   <textarea
                     required
                     rows={5}
                     placeholder="Mô tả chi tiết nội dung thông báo tới cư dân..."
                     className="w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-3 text-xs font-mono text-white focus:border-primary outline-none resize-none"
                     value={form.content}
                     onChange={e => setForm({...form, content: e.target.value})}
                   />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    className={cn(
                      "w-full font-black py-4 rounded text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2",
                      form.type === 'urgent' ? "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20" : "bg-primary hover:bg-cyan-300 text-zinc-950 shadow-cyan-500/20"
                    )}
                  >
                    <Send size={16} /> Gửi thông báo ngay lập tức
                  </button>
                  <p className="text-[9px] text-zinc-600 text-center mt-4 font-bold uppercase">Lưu ý: Thông báo sẽ được đẩy Realtime tới App Resident</p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
