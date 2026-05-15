import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, HelpCircle, PhoneCall, FileText, Send, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function TenantSupport() {
  const faqs = [
    { q: "Quên mật khẩu IoT thì làm thế nào?", a: "Bạn có thể reset mật khẩu trong phần Cài đặt của ứng dụng hoặc liên hệ chủ nhà." },
    { q: "Làm sao để thanh toán qua chuyển khoản?", a: "Chi tiết tài khoản ngân hàng của chủ nhà có trong phần Hóa đơn > Phương thức thanh toán." },
    { q: "Báo cáo sự cố hư hỏng trong phòng?", a: "Vui lòng sử dụng tính năng 'Gửi yêu cầu hỗ trợ' bên dưới kèm theo ảnh chụp sự cố." }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Trung tâm hỗ trợ</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
            Chúng tôi luôn sẵn sàng giải đáp thắc mắc và xử lý sự cố của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-xl border border-zinc-800 relative overflow-hidden">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-8">
              <span className="w-2 h-2 bg-primary"></span> Gửi yêu cầu hỗ trợ mới
            </h4>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Loại sự cố</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-xs text-slate-300 focus:border-primary outline-none transition-colors">
                    <option>Hỏng hóc thiết bị (Điện/Nước)</option>
                    <option>Sự cố kết nối IoT / WiFi</option>
                    <option>Vấn đề về Hợp đồng / Hóa đơn</option>
                    <option>Thông báo vệ sinh / Tiếng ồn</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Mức độ ưu tiên</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-xs text-slate-300 focus:border-primary outline-none transition-colors">
                    <option>Bình thường</option>
                    <option>Cần xử lý trong ngày</option>
                    <option>KHẨN CẤP</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Chi tiết yêu cầu</label>
                <textarea 
                  rows={5}
                  placeholder="Mô tả chi tiết tình trạng sự cố của bạn..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-4 text-xs text-slate-300 focus:border-primary outline-none transition-colors resize-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end">
                <button className="bg-primary hover:bg-cyan-300 text-zinc-950 px-8 py-3 rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-cyan-500/10 transition-all group">
                  Gửi yêu cầu <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>

          <div className="glass-card p-6 rounded-xl border border-zinc-800">
             <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-6">
              <span className="w-2 h-2 bg-zinc-700"></span> Câu hỏi thường gặp (FAQ)
            </h4>
            <div className="space-y-4">
              {faqs.map((item, i) => (
                <div key={i} className="bg-zinc-950/50 rounded p-4 border border-zinc-900">
                  <p className="text-xs font-bold text-primary flex items-center gap-2 mb-2 uppercase tracking-tight">
                    <HelpCircle size={14} /> {item.q}
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed italic">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl border border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-6">Liên hệ trực tiếp</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-zinc-950 transition-all">
                  <PhoneCall size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Hotline 24/7</p>
                  <p className="text-sm font-mono font-bold text-slate-200">090 123 4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-zinc-950 transition-all">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Quản lý khu nhà</p>
                  <p className="text-sm font-bold text-slate-200">Nguyễn Văn Quản</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
               <button className="w-full py-4 rounded border border-zinc-800 bg-zinc-900/50 flex items-center gap-3 px-4 group hover:border-primary/30 transition-all">
                 <FileText size={18} className="text-zinc-600 group-hover:text-primary" />
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left">Hướng dẫn sử dụng thiết bị IoT</span>
               </button>
               <button className="w-full py-4 rounded border border-zinc-800 bg-zinc-900/50 flex items-center gap-3 px-4 group hover:border-primary/30 transition-all">
                 <MessageSquare size={18} className="text-zinc-600 group-hover:text-primary" />
                 <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left">Tham gia cộng đồng cư dân</span>
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
