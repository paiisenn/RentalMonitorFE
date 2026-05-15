import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary/20 rounded-full blur-md"></div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] font-glow-cyan animate-pulse">
          INITIALIZING SYSTEM
        </p>
        <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1 italic">
          SECURE CONNECTION ESTABLISHED
        </p>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 24, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
    </div>
  );
}
