import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAlertStore } from '../store/useAlertStore';
import { AlertCircle, X, ShieldAlert } from 'lucide-react';

export default function AlertOverlay() {
  const { alerts, resolveAlert, removeAlert } = useAlertStore();
  const [currentAlert, setCurrentAlert] = useState<any>(null);

  useEffect(() => {
    if (alerts.length > 0 && !currentAlert) {
      setCurrentAlert(alerts[0]);
    } else if (alerts.length === 0 && currentAlert) {
      setCurrentAlert(null);
    }
  }, [alerts, currentAlert]);

  const handleResolve = async () => {
    if (!currentAlert) return;
    const id = currentAlert.id || currentAlert._id;
    if (!id) {
      setCurrentAlert(null);
      return;
    }

    try {
      // Clear locally first for instant UI response
      const targetId = id;
      setCurrentAlert(null);
      await resolveAlert(targetId);
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    }
  };

  const handleDismissOnly = () => {
    if (!currentAlert) return;
    const id = currentAlert.id || currentAlert._id;
    if (id) {
      removeAlert(id);
    }
    setCurrentAlert(null);
  };

  return (
    <AnimatePresence>
      {currentAlert && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismissOnly}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm cursor-pointer"
        >
          <motion.div
            initial={{ y: -50, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 border-2 border-red-500 rounded-lg shadow-2xl shadow-red-500/20 max-w-md w-full overflow-hidden cursor-default"
          >
            <div className="bg-red-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-zinc-950 animate-bounce" />
                <h3 className="font-bold text-zinc-950 uppercase tracking-widest text-sm">Cảnh báo hệ thống</h3>
              </div>
              <button onClick={handleDismissOnly} className="text-zinc-950 hover:bg-zinc-950/20 rounded p-1 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/20">
                <AlertCircle size={40} className="text-red-500 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-100">{currentAlert.title}</h4>
                <p className="text-sm text-zinc-400 leading-relaxed font-medium">
                  {currentAlert.content}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResolve}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-zinc-950 font-bold py-3.5 rounded-md uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={14} />
                  Xác nhận & Xử lý
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
