// src/components/admin/Analytics/RevenueChartCard.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function RevenueChartCard({ data = [] }) {
  const [toggle, setToggle] = useState("This Year");

  const maxValue = data.length > 0 ? Math.max(...data.map(d => d.revenue)) : 2500;
  const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0);
  const avgMonthly = data.length > 0 ? totalRevenue / data.length : 0;
  const bestMonth = data.length > 0 ? data.reduce((best, d) => d.revenue > best.revenue ? d : best, data[0]) : null;
  const ytdGrowth = data.length > 1
    ? (((data[data.length - 1]?.revenue || 0) - (data[0]?.revenue || 1)) / (data[0]?.revenue || 1) * 100).toFixed(1)
    : "0.0";

  // SVG line chart
  const chartW = 500, chartH = 160;
  const points = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2,
    y: maxValue > 0 ? chartH - ((d.revenue / maxValue) * (chartH - 20)) - 10 : chartH / 2,
    label: d.month,
    value: d.revenue
  }));
  const pathD = points.reduce((acc, p, i) => i === 0 ? `M${p.x} ${p.y}` : `${acc} L${p.x} ${p.y}`, "");
  const areaD = points.length > 1 ? `${pathD} L${chartW} ${chartH} L0 ${chartH} Z` : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col gap-4 md:col-span-2"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Accounts Receivable</span>
          <h4 className="text-sm font-bold text-white mt-0.5">Monthly Revenue (INR)</h4>
        </div>
        <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-white/5 self-start sm:self-auto">
          {["This Year", "6M", "3M"].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setToggle(t)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                toggle === t ? "bg-[#8B5CF6] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full h-44 relative overflow-visible">
        {data.length > 0 ? (
          <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {areaD && <path d={areaD} fill="url(#revAreaGrad)" />}
            <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
              <g key={i} className="group">
                <circle cx={p.x} cy={p.y} r="4" fill="#8B5CF6" className="opacity-80 hover:opacity-100 transition-opacity" />
                {/* Tooltip */}
                <text x={Math.min(p.x, chartW - 80)} y={Math.max(p.y - 10, 14)} className="opacity-0 group-hover:opacity-100" fontSize="10" fill="#fff" fontFamily="monospace">
                  {p.label}: {formatCurrency(p.value)}
                </text>
              </g>
            ))}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-xs">No data available</div>
        )}
      </div>

      {/* X-axis labels */}
      {data.length > 0 && (
        <div className="flex justify-between text-[9px] text-zinc-600 font-mono -mt-2">
          {data.map((d, i) => <span key={i}>{d.month}</span>)}
        </div>
      )}

      {/* KPI Footer Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/5 pt-3.5">
        {[
          { label: "YTD Revenue", value: formatCurrency(totalRevenue), color: "text-white" },
          { label: "YTD Growth", value: `▲ ${ytdGrowth}%`, color: "text-green-400" },
          { label: "Best Month", value: bestMonth ? `${bestMonth.month} ${formatCurrency(bestMonth.revenue)}` : "N/A", color: "text-[#8B5CF6]" },
          { label: "Avg Monthly", value: formatCurrency(avgMonthly), color: "text-zinc-300" }
        ].map((item, i) => (
          <div key={i} className="space-y-0.5">
            <span className="text-[9px] uppercase text-zinc-500 tracking-wider font-bold block">{item.label}</span>
            <span className={`text-xs font-black font-mono block ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
