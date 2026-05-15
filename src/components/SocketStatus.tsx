import React from 'react';
import { useSocketStore } from '../store/useSocketStore';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SocketStatus() {
  const { isConnected } = useSocketStore();

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-500",
      isConnected 
        ? "bg-green-500/10 text-green-500 border border-green-500/20" 
        : "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse"
    )}>
      {isConnected ? (
        <>
          <Wifi size={10} />
          <span>Hệ thống trực tuyến</span>
          <div className="w-1 h-1 rounded-full bg-green-500 animate-ping absolute" />
        </>
      ) : (
        <>
          <WifiOff size={10} />
          <span>Mất kết nối</span>
        </>
      )}
    </div>
  );
}
