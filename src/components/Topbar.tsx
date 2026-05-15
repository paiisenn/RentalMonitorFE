import React, { useState } from 'react';
import {
  Bell,
  Search,
  User as UserIcon,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import SocketStatus from './SocketStatus';
import NotificationDrawer from './NotificationDrawer';

import { cn } from '../lib/utils';

export default function Topbar({ isSidebarOpen }: { isSidebarOpen: boolean }) {
  const { user } = useAuthStore();
  const { notifications } = useNotificationStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className={cn(
      "h-16 fixed top-0 right-0 border-b border-cyan-900/20 bg-zinc-900/80 backdrop-blur-md z-40 px-8 flex items-center justify-between transition-all duration-300",
      isSidebarOpen ? "left-[260px]" : "left-20"
    )}>
      <div className="flex-1 flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-200 uppercase tracking-tighter">SmartStay Hub</h2>
        <SocketStatus />
      </div>

      <div className="flex items-center gap-6">
        <div className="relative max-w-xs w-full hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full bg-zinc-950 border border-cyan-900/30 rounded py-1.5 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        <button
          onClick={() => setIsNotifOpen(true)}
          className="relative p-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          )}
        </button>

        <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

        <div className="h-8 w-px bg-zinc-800" />

        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-200 truncate max-w-[120px] leading-tight">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
              {user?.role}
            </p>
          </div>
          <div className="w-8 h-8 rounded border border-cyan-900/30 bg-zinc-800 flex items-center justify-center overflow-hidden">
            <UserIcon size={18} className="text-zinc-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
