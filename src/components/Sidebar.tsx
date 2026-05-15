import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Home, 
  Users, 
  Receipt, 
  Settings, 
  Cpu, 
  Bell, 
  LifeBuoy, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export default function Sidebar({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const role = user?.role;

  const menuItems = {
    admin: [
      { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
      { path: '/admin/owners', icon: Users, label: 'Chủ sở hữu' },
      { path: '/admin/rooms', icon: Home, label: 'Phòng trọ' },
      { path: '/admin/devices', icon: Cpu, label: 'Thiết bị IoT' },
      { path: '/admin/alerts', icon: ShieldAlert, label: 'Cảnh báo hệ thống' },
      { path: '/admin/bills', icon: Receipt, label: 'Thanh toán' },
      { path: '/admin/settings', icon: Settings, label: 'Cài đặt' },
    ],
    owner: [
      { path: '/owner', icon: LayoutDashboard, label: 'Thống kê' },
      { path: '/owner/rooms', icon: Home, label: 'DS Phòng' },
      { path: '/owner/tenants', icon: Users, label: 'Người thuê' },
      { path: '/owner/devices', icon: Cpu, label: 'Điều khiển IoT' },
      { path: '/owner/bills', icon: Receipt, label: 'Hoá đơn' },
      { path: '/owner/notifications', icon: Bell, label: 'Thông báo' },
      { path: '/owner/settings', icon: Settings, label: 'Cài đặt' },
    ],
    tenant: [
      { path: '/tenant', icon: LayoutDashboard, label: 'Trang chủ' },
      { path: '/tenant/room', icon: Home, label: 'Phòng của tôi' },
      { path: '/tenant/bills', icon: Receipt, label: 'Hóa đơn & Thanh toán' },
      { path: '/tenant/devices', icon: Cpu, label: 'Điều khiển thiết bị' },
      { path: '/tenant/notifications', icon: Bell, label: 'Thông báo' },
      { path: '/tenant/support', icon: LifeBuoy, label: 'Hỗ trợ' },
      { path: '/tenant/settings', icon: Settings, label: 'Cài đặt' },
    ]
  };

  const currentMenu = role ? menuItems[role as keyof typeof menuItems] : [];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 80 }}
      className="fixed left-0 top-0 h-screen bg-zinc-900 border-r border-cyan-900/30 flex flex-col h-full z-50 transition-all duration-300"
    >
      <div className="h-16 flex items-center gap-3 px-6 border-b border-cyan-900/30 shrink-0">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="logo-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-zinc-950">
                <Cpu size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold tracking-tight text-primary uppercase text-sm">Smart Stay</span>
            </motion.div>
          ) : (
            <motion.div
              key="logo-mini"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex justify-center"
            >
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-zinc-950">
                <Cpu size={20} strokeWidth={2.5} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-3 custom-scrollbar">
        {isOpen && (
          <div className="px-3 py-4 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Hệ thống</div>
        )}
        {currentMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "text-zinc-400 hover:bg-zinc-800"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cyan-900/30 shrink-0">
        <div className={cn(
          "flex items-center gap-3 bg-zinc-800/50 p-2 rounded-lg mb-4",
          !isOpen && "justify-center"
        )}>
          <div className="w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center text-[10px] border border-cyan-500/30 shrink-0 uppercase font-bold text-primary">
             {user?.name?.substring(0, 2) || 'U'}
          </div>
          {isOpen && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-slate-200">{user?.name}</p>
              <button onClick={logout} className="text-[10px] text-red-500 hover:underline cursor-pointer uppercase font-bold tracking-widest">Đăng xuất</button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={toggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-zinc-900 border border-cyan-900/20 rounded-full flex items-center justify-center text-zinc-500 hover:text-primary transition-colors z-50 shadow-lg"
      >
        {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>
    </motion.aside>
  );
}
