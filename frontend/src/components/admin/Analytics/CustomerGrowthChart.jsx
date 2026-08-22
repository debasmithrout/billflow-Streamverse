// src/components/admin/Analytics/CustomerGrowthChart.jsx
import { useState } from "react";
import { motion } from "framer-motion";

export default function CustomerGrowthChart({ trends }) {
  const [toggle, setToggle] = useState("This Year");
  const signups  = trends?.signups        || [2, 5, 8, 3, 11, 4, 7];
  const cancels  = trends?.cancellations  || [0, 1, 2, 0, 1, 1, 0];
  const months   = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].slice(0, signups.length);

  const maxVal = Math.max(...signups, ...cancels, 1);

  // SVG line chart points
  const W = 500, H = 100;
  const signupPts = signups.map((v, i) => ({
    x: signups.length > 1 ? (i / (signups.length - 1)) * W : W / 2,
    y: H - (v / maxVal) * (H - 10) - 5
  }));
  const cancelPts = cancels.map((v, i) => ({
    x: cancels.length > 1 ? (i / (cancels.length - 1)) * W : W / 2,
    y: H - (v / maxVal) * (H - 10) - 5
  }));

  const lineD = (pts) => pts.reduce((a, p, i) => i === 0 ? `M${p.x} ${p.y}` : `${a} L${p.x} ${p.y}`, "");

  const totalSignups = signups.reduce((a, b) => a + b, 0);
  const totalCancels = cancels.reduce((a, b) => a + b, 0);
  const netGrowth    = totalSignups - totalCancels;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, type: "spring", stiffness: 100 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5 mb-4">
        <div>
          <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Acquisition</span>
          <h4 className="text-sm font-bold text-white mt-0.5">Subscriber Growth</h4>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span className="w-2.5 h-1.5 rounded-full bg-[#8B5CF6] inline-block" />New
            <span className="w-2.5 h-1.5 rounded-full bg-[#EF4444] inline-block ml-1.5" />Churn
          </div>
          <div className="flex items-center gap-1 bg-zinc-950/60 p-0.5 rounded-lg border border-white/5">
            {["This Year", "6M"].map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setToggle(t)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                  toggle === t ? "bg-[#8B5CF6] text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG dual-line chart */}
      <div className="w-full h-28 mb-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Signup area fill */}
          <path d={`${lineD(signupPts)} L${W} ${H} L0 ${H} Z`} fill="url(#sigGrad)" />
          {/* Signup line */}
          <path d={lineD(signupPts)} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Churn line */}
          <path d={lineD(cancelPts)} fill="none" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 4" />
          {/* Signup dots */}
          {signupPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#8B5CF6" />
          ))}
          {cancelPts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#EF4444" />
          ))}
        </svg>
      </div>

      {/* X-axis */}
      <div className="flex justify-between text-[9px] text-zinc-600 font-mono mb-3">
        {months.map((m, i) => <span key={i}>{m}</span>)}
      </div>

      {/* Footer metrics */}
      <div className="grid grid-cols-3 gap-3 border-t border-white/5 pt-3">
        {[
          { label: "New Signups", value: `+${totalSignups}`, color: "text-[#8B5CF6]" },
          { label: "Churned", value: `-${totalCancels}`, color: "text-[#EF4444]" },
          { label: "Net Growth", value: `${netGrowth >= 0 ? "+" : ""}${netGrowth}`, color: netGrowth >= 0 ? "text-green-400" : "text-red-400" }
        ].map((item, i) => (
          <div key={i} className="text-center space-y-0.5">
            <span className={`text-sm font-black font-mono block ${item.color}`}>{item.value}</span>
            <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider block">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
