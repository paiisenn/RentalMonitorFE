import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-[10px] font-mono text-zinc-300 outline-none transition-all",
              "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
              "placeholder:text-zinc-700",
              error ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20" : "",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter ml-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-[10px] font-mono text-zinc-300 outline-none transition-all min-h-[100px] resize-none",
            "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
            "placeholder:text-zinc-700",
            error ? "border-red-500/50 focus:border-red-500" : "",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter ml-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full bg-zinc-950 border border-zinc-800 rounded px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-400 outline-none transition-all appearance-none cursor-pointer",
            "focus:border-primary/50 focus:ring-1 focus:ring-primary/20",
            error ? "border-red-500/50 focus:border-red-500" : "",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-950 text-zinc-300">
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter ml-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export const DatePicker = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="date"
        label={label}
        error={error}
        className={cn(
          "uppercase tracking-widest cursor-pointer",
          "[&::-webkit-calendar-picker-indicator]:invert-[0.8] [&::-webkit-calendar-picker-indicator]:cursor-pointer",
          className
        )}
        {...props}
      />
    );
  }
);

DatePicker.displayName = 'DatePicker';
