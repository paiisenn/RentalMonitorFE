import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useUserStore } from '../../store/useUserStore';
import { User, Search, Filter, Phone, Mail, Home, MoreHorizontal, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function OwnerTenants() {
  const { tenants, fetchTenants, loading } = useUserStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const filteredTenants = tenants.filter(t => {
    const name = t.name || '';
    const roomNumber = t.roomNumber || '';
    const search = (searchTerm || '').toLowerCase();

    return name.toLowerCase().includes(search) ||
      roomNumber.toLowerCase().includes(search);
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Quản lý khách thuê</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Danh sách cư dân đang sinh sống tại tòa nhà
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/30 p-2 rounded border border-zinc-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input
            type="text"
            placeholder="TÌM THEO TÊN HOẶC PHÒNG..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded pl-10 pr-4 py-2.5 text-[10px] font-mono text-zinc-400 focus:border-primary outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
            <Filter size={14} /> Lọc trạng thái
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-700 transition-all">
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="glass-card rounded-xl border border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-zinc-800">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Khách thuê</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Phòng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Liên hệ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hợp đồng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {filteredTenants.map((tenant, i) => (
                <motion.tr
                  key={tenant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="group hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 border border-zinc-700 overflow-hidden">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">{tenant.name}</p>
                        <p className="text-[10px] text-zinc-600 font-mono uppercase">UID: {tenant.id ? tenant.id.split('_').pop() : 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center text-zinc-600">
                        <Home size={12} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-slate-300">#{tenant.roomNumber}</span>
                        {tenant.roomName && (
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">{tenant.roomName}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <button className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-primary hover:border-primary/30 transition-all">
                        <Phone size={14} />
                      </button>
                      <button className="w-8 h-8 rounded bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-600 hover:text-primary hover:border-primary/30 transition-all">
                        <Mail size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-green-500/10 text-green-500 text-[9px] font-bold px-2 py-0.5 rounded border border-green-500/20 uppercase tracking-widest">Active</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded hover:bg-zinc-800 text-zinc-600 hover:text-white transition-all">
                        <ExternalLink size={16} />
                      </button>
                      <button className="p-2 rounded hover:bg-zinc-800 text-zinc-600 hover:text-white transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTenants.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center border-t border-zinc-900">
            <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-800 mb-4">
              <User size={32} />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Không tìm thấy khách thuê</p>
          </div>
        )}
      </div>
    </div>
  );
}
