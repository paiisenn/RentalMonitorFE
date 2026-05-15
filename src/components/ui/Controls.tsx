import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <label className={cn(
      "flex items-center gap-3 cursor-pointer",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "w-10 h-6 rounded-full relative transition-all duration-300 border",
          checked ? "bg-primary border-primary shadow-[0_0_10px_rgba(34,211,238,0.3)]" : "bg-zinc-800 border-zinc-700"
        )}
      >
        <motion.div
          animate={{ x: checked ? 18 : 2 }}
          className={cn(
            "w-4 h-4 rounded-full bg-white absolute top-0.5 shadow-sm",
            !checked && "bg-zinc-500"
          )}
        />
      </button>
      {label && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>}
    </label>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label className={cn(
      "flex items-center gap-3 cursor-pointer group",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          "w-5 h-5 rounded border flex items-center justify-center transition-all",
          checked 
            ? "bg-primary border-primary shadow-[0_0_10px_rgba(34,211,238,0.2)]" 
            : "bg-zinc-950 border-zinc-800 group-hover:border-zinc-700"
        )}
      >
        {checked && <Check size={12} className="text-zinc-950 stroke-[4]" />}
      </div>
      {label && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>}
    </label>
  );
}
