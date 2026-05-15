import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAlertStore } from '../store/useAlertStore';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AlertOverlay from './AlertOverlay';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Layout() {
  const { isInitialLoading } = useAuthStore();
  const { fetchAlerts } = useAlertStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isInitialLoading) {
      fetchAlerts();
    }
  }, [isInitialLoading, fetchAlerts]);

  if (isInitialLoading) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-200">
      <AlertOverlay />
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div
        className={cn(
          "transition-all duration-300 min-h-screen flex flex-col",
          isSidebarOpen ? "pl-[260px]" : "pl-20"
        )}
      >
        <Topbar isSidebarOpen={isSidebarOpen} />

        <main className="pt-16 flex-1">
          <div className="p-8 max-w-[1600px] mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
