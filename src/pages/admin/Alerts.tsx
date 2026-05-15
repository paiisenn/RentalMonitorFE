import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ChevronRight,
  MoreVertical,
  History,
  Eye
} from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await api.get('/alerts');
        setAlerts(data);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-slate-100">Báo cáo an ninh & Cảnh báo</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight">Giám sát các sự cố quan trọng trên toàn hệ thống</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-zinc-800 hover:bg-zinc-700 text-slate-200 font-bold px-5 py-2 rounded transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
            <History size={16} />
            Lịch sử sự cố
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Activity className="text-primary animate-spin" size={32} />
            </div>
          ) : alerts.length === 0 ? (
            <div className="glass-card p-20 text-center rounded">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-100 uppercase tracking-widest">Hệ thống an toàn</h3>
              <p className="text-zinc-500 text-xs font-bold uppercase mt-1">Không có cảnh báo chưa xử lý</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, idx) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded flex items-center justify-between group border border-zinc-900 hover:border-red-500/20 transition-all hover:bg-red-500/[0.01]"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-red-500/10 rounded flex items-center justify-center border border-red-500/20 group-hover:scale-110 transition-transform duration-500">
                      <AlertTriangle className="text-red-500" size={24} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-200">{alert.title}</h4>
                        <span className="bg-red-500 text-zinc-950 text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-tighter">Crucial</span>
                      </div>
                      <p className="text-xs text-zinc-400 max-w-md line-clamp-1">{alert.content}</p>
                      <div className="flex items-center gap-4 pt-1">
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{alert.time}</span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">ID: {(alert.id || '').toString().substring(0, 8)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="p-2 text-zinc-600 hover:text-primary transition-colors">
                      <Eye size={18} />
                    </button>
                    <button className="bg-zinc-800 hover:bg-red-500 hover:text-zinc-950 text-slate-300 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all">
                      Giải quyết
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded">
            <h3 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-6 flex items-center gap-2">
              <Activity size={14} className="text-primary" />
              Live Timeline
            </h3>
            <div className="space-y-6 relative">
              <div className="absolute left-2.5 top-0 bottom-0 w-px bg-zinc-800" />
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-4 relative pl-8">
                  <div className="absolute left-1 w-3 h-3 rounded-full bg-zinc-800 border-2 border-zinc-950 z-10" />
                  <div>
                    <p className="text-[11px] text-slate-300 leading-tight">Cập nhật trạng thái an ninh toà nhà C1</p>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">10:4{i} AM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded bg-primary/5 border-primary/20">
            <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary mb-4">Mẹo bảo mật</h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed italic">
              “Tất cả các khoá cửa thông minh phiên bản v2.0 nên được cập nhật firmware để tránh lỗ hổng bảo mật mới nhất.”
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
