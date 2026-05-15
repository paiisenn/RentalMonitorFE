import React from 'react';
import { cn } from '../../lib/utils';

interface StatusOption {
  value: string;
  label: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: StatusOption[];
  label?: string;
}

export function StatusSelector({ value, onChange, options, label }: StatusSelectorProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "p-2.5 rounded border text-[10px] font-black uppercase tracking-widest transition-all text-center",
              value === opt.value 
                ? `${opt.bgColor || 'bg-primary/20'} ${opt.color || 'text-primary'} ${opt.borderColor || 'border-primary'}` 
                : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
