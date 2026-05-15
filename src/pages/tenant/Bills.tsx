import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Receipt,
  CreditCard,
  Zap,
  Droplet,
  Home,
  Plus,
  ChevronRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  Info
} from 'lucide-react';
import { useBillStore } from '../../store/useBillStore';
import { formatCurrency, cn } from '../../lib/utils';

export default function TenantBills() {
  const { bills, fetchMyBills, loading } = useBillStore();
  const [selectedBillId, setSelectedBillId] = React.useState<string | null>(null);

  useEffect(() => {
    fetchMyBills();
  }, [fetchMyBills]);

  const selectedBill = bills.find(b => b.id === selectedBillId) || bills[0];

  useEffect(() => {
    if (bills.length > 0 && !selectedBillId) {
      setSelectedBillId(bills[0].id);
    }
  }, [bills, selectedBillId]);

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <AlertCircle className="text-primary animate-pulse" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter text-glow-cyan">Hóa đơn & Thanh toán</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Lịch sử thanh toán và hóa đơn điện nước</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Bill List */}
        <div className="lg:col-span-4 space-y-4">
          <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-4 ml-2">Danh sách hóa đơn</p>
          <div className="space-y-3">
            {bills.map((bill) => (
              <motion.div
                key={bill.id}
                onClick={() => setSelectedBillId(bill.id)}
                className={cn(
                  "p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group",
                  selectedBillId === bill.id
                    ? "bg-zinc-800 border-primary/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                )}
              >
                {bill.status === 'unpaid' && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 blur-xl rounded-full -mr-6 -mt-6"></div>
                )}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-black text-slate-200 uppercase">
                      {typeof bill.month === 'number' ? `Tháng ${bill.month}/${bill.year}` : bill.month}
                    </p>
                    <p className="text-[9px] text-zinc-500 font-mono mt-0.5">#{(bill.id || '').toString().substring(0, 8)}</p>
                  </div>
                  <span className={cn(
                    "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase tracking-tighter",
                    bill.status === 'paid'
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {bill.status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-lg font-mono font-black text-white">{formatCurrency(bill.total_amount || bill.amount)}</p>
                  <ChevronRight size={14} className={cn(
                    "transition-transform",
                    selectedBillId === bill.id ? "text-primary translate-x-1" : "text-zinc-800"
                  )} />
                </div>
              </motion.div>
            ))}

            {bills.length === 0 && (
              <div className="p-10 text-center glass-card rounded-xl border border-dashed border-zinc-800">
                <Receipt size={32} className="mx-auto text-zinc-800 mb-2" />
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Không có hóa đơn nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Bill Detail */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {selectedBill ? (
              <motion.div
                key={selectedBill.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl border border-zinc-800 overflow-hidden"
              >
                <div className="p-8 border-b border-zinc-800/50 bg-gradient-to-br from-zinc-900 to-zinc-950">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Receipt className="text-primary" size={20} />
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">Chi tiết hóa đơn {typeof selectedBill.month === 'number' ? `Tháng ${selectedBill.month}/${selectedBill.year}` : selectedBill.month}</h3>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Hạn thanh toán: <span className="text-zinc-300">{selectedBill.due_date || selectedBill.dueDate}</span></p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Tổng cộng</p>
                      <p className="text-4xl font-mono font-black text-primary text-glow-cyan">{formatCurrency(selectedBill.total_amount || selectedBill.amount)}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Items Table */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-4">Các khoản phí chi tiết</p>

                    <div className="space-y-1">
                      {[
                        { label: 'Tiền thuê phòng', amount: selectedBill.details?.room, icon: Home },
                        { label: 'Tiền điện', amount: selectedBill.details?.electricity, icon: Zap, meta: `Số điện: ${selectedBill.electricity_index || 0} kWh` },
                        { label: 'Tiền nước', amount: selectedBill.details?.water, icon: Droplet, meta: `Số nước: ${selectedBill.water_index || 0} m³` },
                        { label: 'Dịch vụ khác', amount: selectedBill.details?.other, icon: Info },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/20 rounded-lg border border-zinc-900/50">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded bg-zinc-950 flex items-center justify-center text-zinc-600">
                              <item.icon size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-zinc-400">{item.label}</p>
                              {item.meta && <p className="text-[9px] font-mono text-zinc-600 uppercase mt-0.5">{item.meta}</p>}
                            </div>
                          </div>
                          <p className="font-mono font-bold text-white text-sm">{formatCurrency(item.amount || 0)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950">
                      <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Trạng thái</h4>
                      <div className="flex items-center gap-3">
                        {selectedBill.status === 'paid' ? (
                          <>
                            <CheckCircle2 className="text-green-500" size={24} />
                            <div>
                              <p className="text-xs font-bold text-green-500 uppercase">Đã quyết toán</p>
                              <p className="text-[9px] text-zinc-600 uppercase font-bold mt-0.5">Cảm ơn bạn đã thanh toán đúng hạn</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="text-red-500" size={24} />
                            <div>
                              <p className="text-xs font-bold text-red-500 uppercase">Đang chờ thanh toán</p>
                              <p className="text-[9px] text-zinc-600 uppercase font-bold mt-0.5 text-glow-red">Vui lòng thanh toán trước ngày {selectedBill.due_date || selectedBill.dueDate}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 items-end">
                      <button className="flex-1 h-14 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Download size={14} /> Tải hóa đơn (PDF)
                      </button>
                      {selectedBill.status === 'unpaid' && (
                        <button className="flex-[1.5] h-14 rounded-xl bg-primary text-zinc-950 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                          THANH TOÁN NGAY
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 glass-card rounded-2xl border border-dashed border-zinc-800 text-center">
                <CreditCard size={48} className="text-zinc-900 mb-4" />
                <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Chọn một hóa đơn để xem chi tiết</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
