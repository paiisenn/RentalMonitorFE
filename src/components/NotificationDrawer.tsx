import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNotificationStore } from '../store/useNotificationStore';
import { Bell, Info, AlertTriangle, Receipt, X, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, markAsRead, fetchNotifications } = useNotificationStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle className="text-red-500" size={16} />;
      case 'bill': return <Receipt className="text-cyan-500" size={16} />;
      default: return <Info className="text-primary" size={16} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60]"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-sm bg-zinc-900 border-l border-cyan-900/30 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-cyan-900/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="text-primary" size={20} />
                <div>
                  <h3 className="font-bold text-slate-100 uppercase tracking-widest text-sm">Thông báo</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                    Bạn có {unreadCount} thông báo mới
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded border border-zinc-800 flex items-center justify-center hover:bg-zinc-800 transition-colors"
              >
                <X size={16} className="text-zinc-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                    <Bell className="text-zinc-600" size={32} />
                  </div>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Không có thông báo nào</p>
                </div>
              ) : (
                notifications.map((notif, idx) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => !notif.isRead && markAsRead(notif.id)}
                    className={cn(
                      "p-5 border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-all cursor-pointer group relative",
                      !notif.isRead && "bg-primary/[0.02]"
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className="flex gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded flex items-center justify-center shrink-0 border",
                        notif.type === 'alert' ? "bg-red-500/10 border-red-500/20" : 
                        notif.type === 'bill' ? "bg-cyan-500/10 border-cyan-500/20" : 
                        "bg-zinc-800 border-zinc-700"
                      )}>
                        {getIcon(notif.type)}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={cn(
                            "text-xs font-bold truncate",
                            !notif.isRead ? "text-slate-100" : "text-zinc-500"
                          )}>
                            {notif.title}
                          </h4>
                          <span className="text-[9px] text-zinc-600 font-bold whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                          {notif.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-cyan-900/20">
              <Link 
                to="/tenant/notifications" 
                onClick={onClose}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-slate-300 py-3 rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all transition-all"
              >
                Xem tất cả
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
