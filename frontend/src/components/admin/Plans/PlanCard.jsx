// src/components/admin/Plans/PlanCard.jsx
import { formatCurrency } from "../../../utils/currencyFormatter";
import { Edit2, Copy, BarChart2, Archive, RefreshCw, Trash2, Crown, Star, Check, Award, Tv, Shield, Users } from "lucide-react";
import { motion } from "framer-motion";

// Helper to return specific premium icons per plan name
function getPlanIcon(planName) {
  const name = (planName || "").toLowerCase();
  if (name.includes("trial") || name.includes("free")) return { Icon: Tv, color: "#8B5CF6" };
  if (name.includes("basic")) return { Icon: Shield, color: "#06B6D4" };
  if (name.includes("standard")) return { Icon: Star, color: "#EC4899" };
  if (name.includes("premium")) return { Icon: Crown, color: "#F59E0B" };
  if (name.includes("family")) return { Icon: Award, color: "#10B981" };
  return { Icon: Star, color: "#8B5CF6" };
}

// Mock details for pricing card metrics
function getPlanMetrics(planName) {
  const name = (planName || "").toLowerCase();
  if (name.includes("trial")) {
    return { subs: 1234, rev: 0, renewRate: "82%", cancelRate: "18%", popular: false, profitable: false };
  }
  if (name.includes("basic")) {
    return { subs: 842, rev: 83358, renewRate: "89%", cancelRate: "11%", popular: false, profitable: false };
  }
  if (name.includes("standard")) {
    return { subs: 1156, rev: 230644, renewRate: "93%", cancelRate: "7%", popular: false, profitable: false };
  }
  if (name.includes("premium")) {
    return { subs: 612, rev: 182388, renewRate: "96%", cancelRate: "4%", popular: true, profitable: false };
  }
  if (name.includes("family")) {
    return { subs: 303, rev: 151247, renewRate: "97%", cancelRate: "3%", popular: false, profitable: true };
  }
  return { subs: 0, rev: 0, renewRate: "100%", cancelRate: "0%", popular: false, profitable: false };
}

export default function PlanCard({ plan, onEdit, onArchive, onRestore }) {
  const { id, name, description, price, billing_interval, features = [], trial_period_days, isArchived } = plan;

  const { Icon, color } = getPlanIcon(name);
  const metrics = getPlanMetrics(name);

  // Check if standard or premium is popular
  const isPopular = metrics.popular && !isArchived;
  const isProfitable = metrics.profitable && !isArchived;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative bg-zinc-950/70 border rounded-2xl p-6 flex flex-col justify-between h-full transition-all duration-300 ${
        isArchived 
          ? "border-zinc-800 opacity-55 text-zinc-500" 
          : isPopular
            ? "border-[#8B5CF6] shadow-xl shadow-[#8B5CF6]/5"
            : "border-white/5 hover:border-[#8B5CF6]/45"
      }`}
      style={{
        boxShadow: isPopular ? "0 20px 40px rgba(139,92,246,0.06)" : "none"
      }}
    >
      {/* ── Popular / Profitable Ribbon Badges ── */}
      {isPopular && (
        <span
          className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-wider shadow-lg shadow-[#8B5CF6]/20"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}
        >
          Popular Plan
        </span>
      )}
      {isProfitable && (
        <span
          className="absolute -top-3 right-6 px-3 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-wider shadow-lg shadow-[#10B981]/20"
          style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
        >
          Most Profitable
        </span>
      )}

      {/* Header section */}
      <div>
        <div className="flex justify-between items-start gap-4">
          <div className="text-left">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              isArchived ? "bg-zinc-900 text-zinc-600" : "bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/20"
            }`}>
              {isArchived ? "Archived" : "Active"}
            </span>
            <h3 className={`text-lg font-black mt-2.5 truncate leading-snug ${isArchived ? "text-gray-400 line-through" : "text-white"}`}>
              {name}
            </h3>
            <p className="text-[11px] text-gray-500 font-light mt-1.5 min-h-[30px] leading-relaxed">
              {description}
            </p>
          </div>

          {/* Plan level Icon Box */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isArchived ? "rgba(255,255,255,0.02)" : `${color}15`,
              border: `1px solid ${isArchived ? "rgba(255,255,255,0.05)" : `${color}25`}`
            }}
          >
            <Icon size={18} style={{ color: isArchived ? "#475569" : color }} />
          </div>
        </div>

        {/* Pricing block */}
        <div className="my-5 text-left">
          <span className={`text-3xl font-black tracking-tight ${isArchived ? "text-gray-400" : "text-white"}`}>
            {formatCurrency(price)}
          </span>
          <span className="text-xs text-gray-500 font-medium"> / {billing_interval}</span>
          {trial_period_days > 0 && (
            <p className="text-[10px] text-[#A78BFA] font-bold mt-1">
              {trial_period_days}-day free trial included
            </p>
          )}
        </div>

        {/* Features Checklist */}
        <div className="space-y-2 mb-6 border-t border-white/5 pt-4 text-left">
          {features.length === 0 ? (
            <p className="text-[11px] text-gray-500 font-light italic">No features defined.</p>
          ) : (
            features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <div
                  className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: isArchived ? "rgba(255,255,255,0.02)" : "rgba(139,92,246,0.12)" }}
                >
                  <Check size={9} style={{ color: isArchived ? "#475569" : "#A78BFA" }} strokeWidth={3} />
                </div>
                <span className={`font-light leading-normal ${isArchived ? "text-zinc-600" : "text-gray-300"}`}>{feature}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Plan stats bottom grid */}
      <div className="grid grid-cols-2 gap-2 border-t border-white/5 pt-4 mb-4 text-left">
        <div className="bg-white/2 rounded-xl p-2.5 border border-white/5">
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Subscribers</span>
          <span className="text-xs font-black text-white mt-1 block">
            {metrics.subs.toLocaleString()}
          </span>
        </div>
        <div className="bg-white/2 rounded-xl p-2.5 border border-white/5">
          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider block">Est. Revenue</span>
          <span className="text-xs font-black text-white mt-1 block">
            {formatCurrency(metrics.rev)}
          </span>
        </div>
      </div>

      {/* Action buttons (Row of icon buttons with hover tooltips) */}
      <div className="flex justify-between items-center pt-3 border-t border-white/5">
        {!isArchived ? (
          <>
            <div className="flex gap-1.5">
              {/* Edit */}
              <button
                type="button"
                onClick={() => onEdit(plan)}
                title="Edit Plan"
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white cursor-pointer focus:outline-none transition-all"
              >
                <Edit2 size={13} />
              </button>
              
              {/* Duplicate */}
              <button
                type="button"
                title="Duplicate Plan"
                onClick={() => alert(`Plan duplication is disabled for safety logic.`)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white cursor-pointer focus:outline-none transition-all"
              >
                <Copy size={13} />
              </button>
              
              {/* Analytics */}
              <button
                type="button"
                title="Pricing Analytics"
                onClick={() => alert(`Plan analytical report compiled.`)}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-400 hover:text-white cursor-pointer focus:outline-none transition-all"
              >
                <BarChart2 size={13} />
              </button>
            </div>

            {/* Archive */}
            <button
              type="button"
              onClick={() => onArchive(plan)}
              className="p-2 rounded-xl bg-red-650/10 hover:bg-red-650/20 text-red-500 cursor-pointer focus:outline-none transition-all"
              title="Archive Plan"
            >
              <Archive size={13} />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onRestore(plan)}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-bold text-green-500 cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={12} />
            Restore Subscription Plan
          </button>
        )}
      </div>

    </motion.div>
  );
}
