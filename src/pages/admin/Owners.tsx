import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Mail,
  Phone,
  Home,
  Activity,
  ShieldCheck,
  MoreHorizontal,
  ExternalLink,
  ChevronRight,
  Shield,
  Building
} from 'lucide-react';
import api from '../../lib/api';
import { cn } from '../../lib/utils';

export default function AdminOwners() {
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const { data } = await api.get('/admin/owners');
        setOwners(data);
      } catch (error) {
        console.error("Failed to fetch owners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOwners();
  }, []);

  const filteredOwners = owners.filter(owner => {
    const name = owner.name || '';
    const email = owner.email || '';
    const search = (searchTerm || '').toLowerCase();

    return name.toLowerCase().includes(search) ||
      email.toLowerCase().includes(search);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold uppercase tracking-tighter text-slate-100">Quản lý chủ sở hữu</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight">Danh sách các đối tác vận hành hệ thống</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-zinc-950 font-bold px-6 py-2.5 rounded shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
          <Plus size={16} />
          Thêm đối tác mới
        </button>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email đối tác..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-10 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="bg-zinc-900 border border-zinc-800 rounded px-4 py-2 flex items-center gap-2 text-zinc-400 hover:text-slate-100 transition-colors whitespace-nowrap">
            <Filter size={18} />
            <span className="text-sm font-medium">Lọc trạng thái</span>
          </button>
          <button className="bg-zinc-900 border border-zinc-800 rounded px-4 py-2 flex items-center gap-2 text-zinc-400 hover:text-slate-100 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Owner Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Activity className="text-primary animate-spin" size={32} />
        </div>
      ) : filteredOwners.length === 0 ? (
        <div className="glass-card p-20 text-center rounded flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-2">
            <Users size={40} className="text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest">Không tìm thấy chủ sở hữu</h3>
          <p className="text-zinc-500 text-sm">Hãy kiểm tra lại từ khoá tìm kiếm hoặc thêm mới đối tác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOwners.map((owner, idx) => (
            <motion.div
              key={owner.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card overflow-hidden border border-zinc-800 hover:border-primary/30 transition-all group"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 relative overflow-hidden shrink-0">
                    {owner.avatar ? (
                      <img src={owner.avatar} alt={owner.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-primary uppercase">{(owner.name || '').toString().substring(0, 2)}</span>
                    )}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="font-bold text-slate-100 truncate flex items-center gap-2">
                      {owner.name}
                      <ShieldCheck size={14} className="text-primary" />
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-tight truncate">{owner.building || 'N/A'}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-primary/10 text-primary border border-primary/20 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                        Verify
                      </span>
                      <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest">
                        Plan: Pro
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Mail size={14} />
                    <span className="text-xs font-medium truncate">{owner.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Phone size={14} />
                    <span className="text-xs font-medium">098-765-4321</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Building size={14} />
                    <span className="text-xs font-medium">05 Toà nhà đang quản lý</span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/50 p-4 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active now</span>
                </div>
                <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">
                  Chi tiết <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
