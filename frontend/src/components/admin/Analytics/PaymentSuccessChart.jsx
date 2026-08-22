// src/components/admin/Analytics/PaymentSuccessChart.jsx
import { motion } from "framer-motion";

export default function PaymentSuccessChart({ chartData }) {
  const successRate = chartData?.successRate ?? 100;
  const failedCount = chartData?.failedCount ?? 0;
  const successCount = chartData?.successCount ?? 0;
  const totalPayments = successCount + failedCount || 1;

  // Gauge SVG
  const R = 52, CX = 70, CY = 70;
  const circ = 2 * Math.PI * R;
  const successOffset = circ - (successRate / 100) * circ;
  const failedPct = failedCount > 0 ? ((failedCount / totalPayments) * 100).toFixed(1) : "0.0";

  // Distribution bars for the three statuses
  const statuses = [
    { label: "Successful", value: successCount, color: "#10B981", pct: ((successCount / totalPayments) * 100).toFixed(0) },
    { label: "Failed", value: failedCount, color: "#EF4444", pct: ((failedCount / totalPayments) * 100).toFixed(0) }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      className="adm-payment-health-card bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl"
    >
      <div className="border-b border-white/5 pb-3.5 mb-4">
        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Payment Health</span>
        <h4 className="text-sm font-bold text-white mt-0.5">Payment Success vs Failed</h4>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Gauge SVG */}
        <div className="relative shrink-0 flex items-center justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            {/* Background ring */}
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#1e1e2e" strokeWidth="14" />
            {/* Failed arc (red, shown first, full circle) */}
            <circle
              cx={CX} cy={CY} r={R} fill="none"
              stroke="#EF4444"
              strokeWidth="14"
              strokeDasharray={circ}
              strokeDashoffset={0}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
            />
            {/* Success arc (green, overlaid) */}
            <circle
              cx={CX} cy={CY} r={R} fill="none"
              stroke="#10B981"
              strokeWidth="14"
              strokeDasharray={circ}
              strokeDashoffset={successOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${CX} ${CY})`}
              className="transition-all duration-700"
            />
            {/* Center text */}
            <text x={CX} y={CY - 8} textAnchor="middle" fontSize="20" fontWeight="900" fill="#F8FAFC" fontFamily="monospace">
              {successRate}%
            </text>
            <text x={CX} y={CY + 10} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="sans-serif" fontWeight="700" textTransform="uppercase">
              SUCCESS
            </text>
          </svg>
        </div>

        {/* Distribution bars */}
        <div className="flex-1 w-full space-y-3">
          {statuses.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{ background: s.color }} />
                  <span className="text-zinc-300 font-semibold">{s.label}</span>
                </div>
                <span className="font-black font-mono text-white">{s.value} <span className="text-zinc-500 font-normal">({s.pct}%)</span></span>
              </div>
              <div className="h-2 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s.pct}%`, background: s.color }}
                />
              </div>
            </div>
          ))}

          <div className="border-t border-white/5 pt-3 flex justify-between text-xs text-zinc-400">
            <span>Total Processed:</span>
            <span className="font-black text-white font-mono">{totalPayments} Transactions</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
