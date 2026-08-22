// src/components/customer/Billing/PaymentSummary.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getPaymentSummary, getInvoices } from "../../../services/customerService";
import { AlertTriangle, Clock, CheckCircle2, Activity } from "lucide-react";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function PaymentSummary({ data }) {
  const [summaryData, setSummaryData] = useState(data || {
    total_spent: 0,
    total_payments_count: 0,
    attributed_amount: 0,
    unattributed_amount: 0,
    category_breakdown: { card: 0, upi: 0, netbanking: 0, wallet: 0 }
  });
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    if (data) {
      setSummaryData(data);
    } else {
      const fetchSummary = async () => {
        const resData = await getPaymentSummary();
        if (resData) setSummaryData(resData);
      };
      fetchSummary();
    }
  }, [data]);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const invData = await getInvoices();
        setInvoices(invData || []);
      } catch (err) {
        console.error("Failed to load invoices in PaymentSummary:", err);
      }
    };
    fetchInvoices();
  }, []);

  const { total_spent, total_payments_count, category_breakdown } = summaryData || {};
  const cardAmt = category_breakdown?.card || 0;
  const upiAmt = category_breakdown?.upi || 0;
  const netAmt = category_breakdown?.netbanking || 0;

  const userString = localStorage.getItem("current_user");
  const user = userString ? JSON.parse(userString) : null;
  const currencyCode = user?.currency_code || "INR";

  // Retry Stats Calculations
  const failedCount = invoices.filter(i => i.retryStatus && i.retryStatus !== null).length;
  const pendingCount = invoices.filter(i => i.retryStatus === "SCHEDULED" || i.retryStatus === "PENDING" || i.retryStatus === "WAITING").length;
  const recoveredCount = invoices.filter(i => i.retryStatus === "RECOVERED").length;
  const totalCompleted = invoices.filter(i => i.retryStatus === "RECOVERED" || i.retryStatus === "EXHAUSTED").length;
  const successRate = totalCompleted > 0 ? Math.round((recoveredCount / totalCompleted) * 100) : 100;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-xl shadow-black/40"
      >
        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">
          Payment Summary
        </span>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="45 100" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="21 100" strokeDashoffset="-45" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="21 100" strokeDashoffset="-66" />
              </svg>
            </div>

            <div className="space-y-2 text-xs w-full">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-gray-300 font-medium">Card Payments</span>
                </div>
                <span className="font-mono text-gray-200 font-bold">
                  {formatCurrency(cardAmt, currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-300 font-medium">UPI Payments</span>
                </div>
                <span className="font-mono text-gray-200 font-bold">
                  {formatCurrency(upiAmt, currencyCode)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-300 font-medium">Net Banking</span>
                </div>
                <span className="font-mono text-gray-200 font-bold">
                  {formatCurrency(netAmt, currencyCode)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left md:text-right pt-3 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto">
            <span className="text-[10px] text-gray-400 uppercase font-black block tracking-wider">
              Total Spent ({total_payments_count} payments)
            </span>
            <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight block mt-0.5">
              {formatCurrency(total_spent, currencyCode)}
            </span>
            <span className="text-[10px] text-gray-500 font-medium block">
              Across all methods
            </span>
          </div>
        </div>
      </motion.div>

      {/* Four Compact Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { title: "Failed Payments", value: failedCount + pendingCount, icon: AlertTriangle, color: "text-red-400 bg-red-500/5 border-red-500/10" },
          { title: "Pending Retries", value: pendingCount, icon: Clock, color: "text-amber-400 bg-amber-500/5 border-amber-500/10" },
          { title: "Recovered Payments", value: recoveredCount, icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" },
          { title: "Retry Success Rate", value: `${successRate}%`, icon: Activity, color: "text-purple-400 bg-purple-500/5 border-purple-500/10" }
        ].map((card, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${card.color} flex items-center justify-between`}>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{card.title}</span>
              <h4 className="text-base font-bold text-white mt-1">{card.value}</h4>
            </div>
            <div className="p-2 rounded-full bg-white/5">
              <card.icon className="h-4 w-4" />
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
