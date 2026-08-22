// src/components/admin/Analytics/TaxAnalytics.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Percent, Loader2, DollarSign, Calendar, RefreshCw, 
  MapPin, Shield, Layers, CreditCard, HelpCircle
} from "lucide-react";
import { getTaxAnalytics } from "../../../services/adminService";
import useToast from "../../../hooks/useToast";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function TaxAnalytics({ dateRangeFilter, customDates }) {
  const { showToast } = useToast();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchTaxAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Calculate start/end dates based on selection
      let startDate = null;
      let endDate = null;
      const now = new Date();
      
      if (dateRangeFilter === "Today") {
        startDate = now.toISOString().split("T")[0];
        endDate = startDate;
      } else if (dateRangeFilter === "Last 7 Days") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRangeFilter === "Last 30 Days") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRangeFilter === "This Month") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRangeFilter === "This Year") {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
      } else if (dateRangeFilter === "Custom Range" && customDates) {
        startDate = customDates.start;
        endDate = customDates.end;
      }
      
      const response = await getTaxAnalytics(startDate, endDate);
      setData(response);
    } catch (err) {
      console.error(err);
      setError("Failed to load tax analytics data.");
      showToast("Error loading tax analytics dashboard.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxAnalytics();
  }, [dateRangeFilter, customDates, refreshCount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-[#8B5CF6] mb-3" size={32} />
        <span className="text-sm text-zinc-400">Computing Tax Analytics queries...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <XCircle size={20} />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">Failed to Load Tax Analytics</h4>
          <p className="text-zinc-500 text-xs mt-1">{error || "No data returned from backend."}</p>
        </div>
        <button
          type="button"
          onClick={() => setRefreshCount(c => c + 1)}
          className="adm-btn adm-btn-purple cursor-pointer mx-auto flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl"
        >
          <RefreshCw size={12} /> Retry Loading
        </button>
      </div>
    );
  }

  const { kpis, trend, country_breakdown, plan_breakdown, payment_method_breakdown } = data;

  // SVG Trend Chart Variables
  const maxValue = trend.length > 0 ? Math.max(...trend.map(t => t.tax)) : 1000;
  const chartW = 500, chartH = 140;
  const trendPoints = trend.map((t, i) => ({
    x: trend.length > 1 ? (i / (trend.length - 1)) * chartW : chartW / 2,
    y: maxValue > 0 ? chartH - ((t.tax / maxValue) * (chartH - 20)) - 10 : chartH / 2,
    label: t.date,
    value: t.tax
  }));
  const pathD = trendPoints.reduce((acc, p, i) => i === 0 ? `M${p.x} ${p.y}` : `${acc} L${p.x} ${p.y}`, "");
  const areaD = trendPoints.length > 1 ? `${pathD} L${chartW} ${chartH} L0 ${chartH} Z` : "";

  // Payment Method Donut Calculations
  const totalPmTax = payment_method_breakdown.reduce((sum, item) => sum + item.tax, 0) || 1;
  const cx = 70, cy = 70, r = 50, strokeW = 14;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;
  
  const COLORS = ["#8B5CF6", "#10B981", "#F59E0B", "#3B82F6", "#EF4444", "#EC4899", "#8E9AA6"];
  
  const arcs = payment_method_breakdown.map((item, i) => {
    const pct = item.tax / totalPmTax;
    const arc = {
      color: COLORS[i % COLORS.length],
      dasharray: circ,
      dashoffset: circ - pct * circ,
      rotation: cumPct * 360 - 90,
      pct: (pct * 100).toFixed(1)
    };
    cumPct += pct;
    return { ...arc, name: item.payment_method, tax: item.tax };
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 1. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Tax Collected", value: kpis.total_tax, color: "text-purple-400" },
          { label: "Today's Tax Collected", value: kpis.today_tax, color: "text-emerald-400" },
          { label: "This Month's Tax", value: kpis.monthly_tax, color: "text-cyan-400" },
          { label: "This Year's Tax", value: kpis.yearly_tax, color: "text-amber-400" }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4.5 shadow-xl space-y-1.5 text-left">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500 block">{kpi.label}</span>
            <span className={`text-xl font-black font-mono block ${kpi.color}`}>
              {formatCurrency(kpi.value)}
            </span>
          </div>
        ))}
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tax Trend Line Chart */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl md:col-span-2">
          <div className="border-b border-white/5 pb-3 mb-4 text-left">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Timeline Distribution</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Tax Collections Trend</h4>
          </div>

          <div className="w-full h-40 relative overflow-visible">
            {trend.length > 0 ? (
              <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="taxAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {areaD && <path d={areaD} fill="url(#taxAreaGrad)" />}
                <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {trendPoints.map((p, i) => (
                  <g key={i} className="group">
                    <circle cx={p.x} cy={p.y} r="3.5" fill="#8B5CF6" className="opacity-80 hover:opacity-100 transition-opacity" />
                    <text x={Math.min(p.x, chartW - 70)} y={Math.max(p.y - 8, 12)} className="opacity-0 group-hover:opacity-100" fontSize="9" fill="#fff" fontFamily="monospace">
                      {p.label}: {formatCurrency(p.value)}
                    </text>
                  </g>
                ))}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-xs">No trend data available for current range</div>
            )}
          </div>
          
          {trend.length > 0 && (
            <div className="flex justify-between text-[8px] text-zinc-600 font-mono mt-1 border-t border-white/5 pt-2">
              <span>{trend[0].date}</span>
              <span>{trend[trend.length - 1].date}</span>
            </div>
          )}
        </div>

        {/* Country Wise Tax Bar Chart */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl text-left">
          <div className="border-b border-white/5 pb-3 mb-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Regional overview</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Tax by Country</h4>
          </div>

          <div className="space-y-4">
            {country_breakdown.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-xs">No regional tax recorded.</div>
            ) : (
              country_breakdown.map((item, idx) => {
                const maxCountryTax = Math.max(...country_breakdown.map(c => c.tax), 1);
                const pct = (item.tax / maxCountryTax) * 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#8B5CF6]" />
                        {item.country}
                      </span>
                      <span>{formatCurrency(item.tax)} <span className="text-[10px] text-zinc-500 font-normal font-mono">({item.percentage}%)</span></span>
                    </div>
                    <div className="h-2 bg-zinc-950 border border-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#8B5CF6]/50 to-[#8B5CF6] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tax by Payment Method Donut */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl text-left">
          <div className="border-b border-white/5 pb-3 mb-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Gateway share</span>
            <h4 className="text-sm font-bold text-white mt-0.5">Tax by Payment Method</h4>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0 flex items-center justify-center mx-auto">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#121218" strokeWidth={strokeW} />
                {arcs.map((arc, i) => (
                  <circle
                    key={i}
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={strokeW}
                    strokeDasharray={`${arc.dasharray}`}
                    strokeDashoffset={arc.dashoffset}
                    transform={`rotate(${arc.rotation} ${cx} ${cy})`}
                    className="transition-all duration-500"
                  />
                ))}
              </svg>
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="grid grid-cols-2 text-[9px] uppercase font-bold text-zinc-500 border-b border-white/5 pb-1">
                <span>Method</span>
                <span className="text-right">Tax</span>
              </div>
              {arcs.map((arc, i) => (
                <div key={i} className="flex justify-between text-xs items-center">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: arc.color }} />
                    <span className="text-zinc-300 font-semibold truncate capitalize">{arc.name}</span>
                  </div>
                  <span className="font-bold text-white font-mono shrink-0 ml-2">
                    {formatCurrency(arc.tax)} <span className="text-[9px] text-zinc-500 font-normal font-mono">({arc.pct}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 3. Breakdown Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Regional Breakdown Table */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl text-left flex flex-col">
          <div className="border-b border-white/5 pb-3 mb-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Regional breakdown</span>
            <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
              <MapPin size={15} className="text-[#8B5CF6]" />
              Country breakdown
            </h4>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5 flex-1 max-h-60 overflow-y-auto adm-scrollbar">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/70 text-zinc-500 uppercase font-black tracking-wider">
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] text-zinc-300 font-mono">
                {country_breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="py-2 px-3 font-sans text-white font-bold">{item.country}</td>
                    <td className="py-2 px-3 text-right text-purple-400 font-bold">{formatCurrency(item.tax)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(item.revenue)}</td>
                    <td className="py-2 px-3 text-right text-zinc-400">{item.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscription Plan Breakdown Table */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl text-left flex flex-col">
          <div className="border-b border-white/5 pb-3 mb-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Plan Performance</span>
            <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
              <Layers size={15} className="text-emerald-400" />
              Plan Breakdown
            </h4>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5 flex-1 max-h-60 overflow-y-auto adm-scrollbar">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/70 text-zinc-500 uppercase font-black tracking-wider">
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3 text-right">Customers</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] text-zinc-300 font-mono">
                {plan_breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="py-2 px-3 font-sans text-white font-bold">{item.plan_name}</td>
                    <td className="py-2 px-3 text-right font-sans text-zinc-400">{item.customers}</td>
                    <td className="py-2 px-3 text-right text-purple-400 font-bold">{formatCurrency(item.tax)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Method Breakdown Table */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl text-left flex flex-col">
          <div className="border-b border-white/5 pb-3 mb-4">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Source Breakdown</span>
            <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
              <CreditCard size={15} className="text-amber-400" />
              Method Breakdown
            </h4>
          </div>
          <div className="overflow-x-auto rounded-xl border border-white/5 flex-1 max-h-60 overflow-y-auto adm-scrollbar">
            <table className="w-full text-left border-collapse text-[10px]">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/70 text-zinc-500 uppercase font-black tracking-wider">
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] text-zinc-300 font-mono">
                {payment_method_breakdown.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01]">
                    <td className="py-2 px-3 font-sans text-white font-bold capitalize">{item.payment_method}</td>
                    <td className="py-2 px-3 text-right text-purple-400 font-bold">{formatCurrency(item.tax)}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(item.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </motion.div>
  );
}
