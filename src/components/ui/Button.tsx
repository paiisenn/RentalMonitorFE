import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import { HTMLMotionProps, motion } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-zinc-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)] active:shadow-none hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]',
      secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700',
      outline: 'bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/50',
      ghost: 'bg-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50',
      danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white',
      success: 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[9px]',
      md: 'px-5 py-2.5 text-[10px]',
      lg: 'px-8 py-3.5 text-xs',
      icon: 'p-2',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center rounded font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-1 focus:ring-primary/50',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 12 : 16} />
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
