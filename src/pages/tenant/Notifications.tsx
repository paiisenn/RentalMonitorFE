import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Receipt,
  AlertCircle,
  ShieldCheck,
  Check,
  CheckCircle2,
  Info,
  Trash2,
  Filter,
  Search,
  MoreVertical,
  Clock,
  Sparkles
} from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { cn } from '../../lib/utils';

export default function TenantNotifications() {
  const { notifications, fetchNotifications, markAsRead, loading } = useNotificationStore();
  const [filter, setFilter] = React.useState<string>('all');
  const [searchTerm, setSearchTerm] = React.useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || n.type === filter;
    const title = n.title || '';
    const content = n.content || '';
    const search = (searchTerm || '').toLowerCase();

    const matchesSearch = title.toLowerCase().includes(search) ||
      content.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'bill': return <Receipt className="text-primary" size={18} />;
      case 'alert': return <AlertCircle className="text-red-500" size={18} />;
      case 'cleaning': return <Sparkles className="text-cyan-400" size={18} />;
      case 'resolved_alert': return <CheckCircle2 className="text-green-500" size={18} />;
      default: return <Info className="text-zinc-500" size={18} />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'bill': return 'bg-primary/10 text-primary border-primary/20';
      case 'alert': return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'cleaning': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-zinc-800 text-zinc-500 border-zinc-700';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Thông báo</h2>
            {unreadCount > 0 && (
              <span className="bg-primary text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                {unreadCount} MỚI
              </span>
            )}
          </div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Cập nhật tin tức, bảo trì và hóa đơn từ quản lý</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => notifications.forEach(n => !n.isRead && markAsRead(n.id))}
            className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-white px-5 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
          >
            <Check size={14} /> Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/40 p-2 rounded-xl border border-zinc-800/50">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar w-full md:w-auto p-1">
          {['all', 'bill', 'alert', 'cleaning', 'info'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === t
                  ? "bg-primary text-zinc-950 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {t === 'all' ? 'Tất cả' : t}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64 px-1 pb-1 md:p-1">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" />
          <input
            type="text"
            placeholder="Tiềm kiếm thông báo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-[10px] font-mono text-zinc-400 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.map((notif, i) => (
            <motion.div
              layout
              key={notif.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={cn(
                "p-5 rounded-xl border transition-all cursor-pointer group relative overflow-hidden",
                notif.isRead
                  ? "bg-zinc-950/20 border-zinc-900 opacity-60"
                  : "bg-zinc-900/40 border-zinc-800 hover:border-primary/30 shadow-[0_0_20px_rgba(34,211,238,0.02)]"
              )}
            >
              {!notif.isRead && (
                <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_10px_#22d3ee]"></div>
              )}

              <div className="flex items-start gap-5">
                <div className={cn(
                  "w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-500",
                  getBadgeColor(notif.type)
                )}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-4">
                    <h4 className={cn(
                      "text-sm font-bold uppercase tracking-tight truncate",
                      notif.isRead ? "text-zinc-500" : "text-slate-200"
                    )}>{notif.title}</h4>
                    <div className="flex items-center gap-2 shrink-0">
                      <Clock size={10} className="text-zinc-700" />
                      <span className="text-[10px] font-mono text-zinc-600 font-bold uppercase">{notif.time}</span>
                    </div>
                  </div>
                  <p className={cn(
                    "text-[12px] leading-relaxed",
                    notif.isRead ? "text-zinc-600" : "text-zinc-400"
                  )}>{notif.content}</p>

                  {!notif.isRead && (
                    <button className="mt-4 text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-1">
                      ĐÁNH DẤU ĐÃ ĐỌC <Check size={10} />
                    </button>
                  )}
                </div>

                <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <div className="p-20 text-center glass-card rounded-2xl border border-dashed border-zinc-800">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
              <Bell size={24} className="text-zinc-800" />
            </div>
            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Hộp thư thông báo trống</p>
          </div>
        )}
      </div>
    </div>
  );
}
