import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Cpu, User as UserIcon, ShieldCheck, Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  role: z.enum(['admin', 'owner', 'tenant']),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, error: authError } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'owner' | 'tenant'>('tenant');

  const {
    register,
    handleSubmit,
    setValue,
    formState,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: 'tenant',
      email: 'tenant@smartstay.io',
      password: 'password123',
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      const path = user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/tenant';
      navigate(path, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data: LoginForm) => {
    const result = await login(data);
    
    if (result.success) {
      const redirectPath = data.role === 'admin' ? '/admin' : data.role === 'owner' ? '/owner' : '/tenant';
      navigate(redirectPath);
    }
  };

  const handleRoleSelect = (role: 'admin' | 'owner' | 'tenant') => {
    setSelectedRole(role);
    setValue('role', role);
    
    // Set demo credentials based on role
    if (role === 'admin') {
      setValue('email', 'admin@smartstay.io');
    } else if (role === 'owner') {
      setValue('email', 'owner@smartstay.io');
    } else {
      setValue('email', 'tenant@smartstay.io');
    }
  };

  const roles = [
    { 
      id: 'tenant' as const, 
      label: 'Người thuê', 
      icon: UserIcon, 
      desc: 'Điều khiển thiết bị & thanh toán hoá đơn' 
    },
    { 
      id: 'owner' as const, 
      label: 'Chủ hộ', 
      icon: Building2, 
      desc: 'Quản lý phòng, người thuê & thống kê' 
    },
    { 
      id: 'admin' as const, 
      label: 'Quản trị viên', 
      icon: ShieldCheck, 
      desc: 'Quản lý hệ thống & hỗ trợ kỹ thuật' 
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 rounded bg-primary items-center justify-center mb-6 shadow-2xl shadow-cyan-500/20 text-zinc-950">
            <Cpu size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2 uppercase">Smart Stay IoT</h1>
          <div className="flex items-center justify-center gap-2">
             <span className="h-px w-8 bg-cyan-900/50"></span>
             <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Quản lý phòng trọ thông minh</p>
             <span className="h-px w-8 bg-cyan-900/50"></span>
          </div>
        </div>

        <div className="bg-zinc-900 border border-cyan-900/30 p-8 rounded-xl shadow-2xl shadow-black/50">
          {authError && (
            <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Phân quyền truy cập</label>
                <span className="text-[10px] font-mono text-cyan-400">v2.4.0</span>
              </div>
              
              <div className="space-y-3">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRole === role.id;
                  
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleRoleSelect(role.id)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded border transition-all duration-300 text-left group",
                        isSelected 
                          ? "bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                          : "bg-zinc-950/50 border-zinc-800 hover:border-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded flex items-center justify-center transition-colors shrink-0",
                        isSelected ? "bg-primary text-zinc-950 shadow-lg shadow-cyan-500/20" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
                      )}>
                        <Icon size={20} />
                      </div>
                      <div className="flex-1">
                        <p className={cn("font-bold text-xs uppercase tracking-wider", isSelected ? "text-primary" : "text-slate-300")}>
                          {role.label}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 leading-tight line-clamp-1">
                          {role.desc}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div layoutId="check" className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <ArrowRight size={12} className="text-zinc-950" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <Input
                {...register('email')}
                label="Email"
                placeholder="email@example.com"
                error={formState.errors.email?.message}
                leftIcon={<Mail size={16} />}
              />

              <Input
                {...register('password')}
                type="password"
                label="Mật khẩu"
                placeholder="••••••••"
                error={formState.errors.password?.message}
                leftIcon={<Lock size={16} />}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14"
              isLoading={formState.isSubmitting}
              rightIcon={<ArrowRight size={16} />}
            >
              Tiến vào hệ thống
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center flex flex-col gap-1">
            <p className="text-[10px] text-zinc-600 font-mono">
              [SYSTEM_LOAD] ... OK
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">
              [ENCRYPTION_LAYER] ... ACTIVE
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
