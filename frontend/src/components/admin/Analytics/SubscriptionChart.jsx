// src/components/admin/Analytics/SubscriptionChart.jsx
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/currencyFormatter";

const PLAN_COLORS = [
  { stroke: "#8B5CF6", bg: "bg-[#8B5CF6]", text: "text-[#8B5CF6]" },
  { stroke: "#10B981", bg: "bg-[#10B981]", text: "text-[#10B981]" },
  { stroke: "#F59E0B", bg: "bg-[#F59E0B]", text: "text-[#F59E0B]" },
  { stroke: "#3B82F6", bg: "bg-[#3B82F6]", text: "text-[#3B82F6]" },
  { stroke: "#EF4444", bg: "bg-[#EF4444]", text: "text-[#EF4444]" }
];

export default function SubscriptionChart({ data = [], revenueChart = [] }) {
  const totalCount = data.reduce((s, d) => s + (d.count || 0), 0) || 1;

  // Build SVG donut arcs
  const cx = 80, cy = 80, r = 58, strokeW = 18;
  const circ = 2 * Math.PI * r;
  let cumPct = 0;

  const arcs = data.map((item, i) => {
    const pct = item.count / totalCount;
    const arc = {
      color: PLAN_COLORS[i % PLAN_COLORS.length].stroke,
      dasharray: circ,
      dashoffset: circ - pct * circ,
      rotation: cumPct * 360 - 90,
      pct: (pct * 100).toFixed(1)
    };
    cumPct += pct;
    return { ...arc, name: item.name, count: item.count };
  });

  // Estimate revenue per plan if possible
  const totalRevenue = revenueChart.reduce((s, d) => s + (d.revenue || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl"
    >
      <div className="border-b border-white/5 pb-3.5 mb-4">
        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Plan Intelligence</span>
        <h4 className="text-sm font-bold text-white mt-0.5">Revenue by Plan</h4>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut SVG */}
        <div className="relative shrink-0">
          <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible">
            {/* Background ring */}
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1a1a2e" strokeWidth={strokeW} />
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeW}
                strokeDasharray={`${arc.dasharray}`}
                strokeDashoffset={arc.dashoffset}
                strokeLinecap="butt"
                transform={`rotate(${arc.rotation} ${cx} ${cy})`}
                className="transition-all duration-700"
              />
            ))}
            {/* Center label */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="700" fontFamily="monospace">
              {formatCurrency(totalRevenue)}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="sans-serif" fontWeight="600">
              Total Revenue
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5 w-full">
          <div className="grid grid-cols-3 text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1">
            <span>Plan</span>
            <span className="text-right">Count</span>
            <span className="text-right">Share</span>
          </div>
          {data.map((item, i) => {
            const color = PLAN_COLORS[i % PLAN_COLORS.length];
            const pct = ((item.count / totalCount) * 100).toFixed(1);
            return (
              <div key={i} className="space-y-1">
                <div className="grid grid-cols-3 text-xs items-center">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-sm ${color.bg} inline-block shrink-0`} />
                    <span className="text-zinc-300 font-semibold truncate">{item.name}</span>
                  </div>
                  <span className={`text-right font-black font-mono ${color.text}`}>{item.count}</span>
                  <span className="text-right text-zinc-400 font-mono">{pct}%</span>
                </div>
                <div className="h-1 bg-zinc-950 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color.stroke }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
