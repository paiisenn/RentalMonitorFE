import React from 'react';
import { motion } from 'motion/react';
import { User, Bell, Lock, Shield, CreditCard, ChevronRight, Save, LogOut, Cpu } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

export default function Settings() {
  const { user, logout } = useAuthStore();

  const sections = [
    {
      id: 'profile',
      title: 'Thông tin cá nhân',
      description: 'Quản lý tên hiển thị, email và ảnh đại diện của bạn',
      icon: User,
      fields: [
        { label: 'Họ và tên', value: user?.name, type: 'text' },
        { label: 'Địa chỉ Email', value: user?.email, type: 'email' },
        { label: 'Số điện thoại', value: '090 **** 567', type: 'text' },
      ]
    },
    {
      id: 'notifications',
      title: 'Cài đặt thông báo',
      description: 'Điều chỉnh cách bạn nhận tin nhắn và cảnh báo từ hệ thống',
      icon: Bell,
      toggles: [
        { label: 'Thông báo hóa đơn', enabled: true },
        { label: 'Cảnh báo IoT / Sự cố', enabled: true },
        { label: 'Bản tin cư dân', enabled: false },
      ]
    },
    {
      id: 'security',
      title: 'Bảo mật & Đăng nhập',
      description: 'Thay đổi mật khẩu và quản lý các phiên đăng nhập',
      icon: Lock,
      actions: [
        { label: 'Đổi mật khẩu', highlight: false },
        { label: 'Xác thực 2 lớp (2FA)', highlight: true },
      ]
    },
    {
      id: 'realtime',
      title: 'Hệ thống Real-time',
      description: 'Giám sát trạng thái kết nối WebSocket và độ trễ hệ thống',
      icon: Cpu,
      actions: [
        { label: 'Tình trạng: CONNECTED', highlight: true },
        { label: 'Độ trễ trung bình: 15ms', highlight: false },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Cấu hình tài khoản</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Thiết lập tùy chỉnh và bảo mật cho phiên truy cập của bạn
          </p>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={14} /> Đăng xuất
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-0 rounded-xl border border-zinc-800 bg-zinc-950/30 overflow-hidden"
          >
            <div className="p-6 flex items-start gap-5 border-b border-zinc-900 bg-zinc-900/10">
              <div className="w-10 h-10 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                <section.icon size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">{section.title}</h4>
                <p className="text-[10px] text-zinc-600 mt-1">{section.description}</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {section.fields?.map((field, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 items-center gap-2 md:gap-8">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{field.label}</label>
                  <div className="md:col-span-2">
                    <input 
                      type={field.type} 
                      defaultValue={field.value}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-2.5 text-xs text-slate-300 focus:border-primary outline-none transition-colors"
                    />
                  </div>
                </div>
              ))}

              {section.toggles?.map((toggle, idx) => (
                <div key={idx} className="flex items-center justify-between py-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{toggle.label}</span>
                  <button className={cn(
                    "w-10 h-5 rounded-full relative transition-colors duration-300",
                    toggle.enabled ? "bg-primary" : "bg-zinc-800"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 rounded-full transition-all duration-300",
                      toggle.enabled ? "right-1 bg-zinc-950" : "left-1 bg-zinc-600"
                    )} />
                  </button>
                </div>
              ))}

              {section.actions?.map((action, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 rounded bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group">
                   <span className={cn("text-xs font-bold uppercase tracking-widest", action.highlight ? "text-primary" : "text-slate-400 group-hover:text-white")}>{action.label}</span>
                   <ChevronRight size={14} className="text-zinc-700" />
                </button>
              ))}
            </div>
            
            {(section.fields || section.toggles) && (
              <div className="px-6 py-4 bg-zinc-950/50 border-t border-zinc-900 flex justify-end">
                <button className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                  <Save size={12} /> Lưu thay đổi
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="pt-10 flex flex-col items-center gap-4">
         <p className="text-[10px] text-zinc-700 font-mono italic">SmartStay IoT Management v2.4.0 • Build 2026.05.15</p>
         <div className="flex items-center gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-primary transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-primary transition-colors">Hỗ trợ</a>
         </div>
      </div>
    </div>
  );
}
