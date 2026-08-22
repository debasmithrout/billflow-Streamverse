// src/components/admin/Dashboard/QuickActionsCard.jsx
import { useNavigate } from "react-router-dom";
import { PlusCircle, UserPlus, FilePlus, RotateCcw, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

const ACTIONS = [
  {
    label: "Add Customer",
    desc: "Register new customer account",
    path: "/admin/customers",
    icon: UserPlus,
    color: "#8B5CF6", // Purple
    bgGrad: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(139,92,246,0.02) 100%)",
    border: "rgba(139,92,246,0.15)",
    glow: "rgba(139,92,246,0.2)"
  },
  {
    label: "Create Plan",
    desc: "Add new subscription package",
    path: "/admin/plans",
    icon: PlusCircle,
    color: "#EC4899", // Pink
    bgGrad: "linear-gradient(135deg, rgba(236,72,153,0.12) 0%, rgba(236,72,153,0.02) 100%)",
    border: "rgba(236,72,153,0.15)",
    glow: "rgba(236,72,153,0.2)"
  },
  {
    label: "Generate Invoice",
    desc: "Create and dispatch billing document",
    path: "/admin/invoices",
    icon: FilePlus,
    color: "#F97316", // Orange
    bgGrad: "linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(249,115,22,0.02) 100%)",
    border: "rgba(249,115,22,0.15)",
    glow: "rgba(249,115,22,0.2)"
  },
  {
    label: "Process Refund",
    desc: "Resolve customer refund request",
    path: "/admin/refunds",
    icon: RotateCcw,
    color: "#06B6D4", // Cyan
    bgGrad: "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(6,182,212,0.02) 100%)",
    border: "rgba(6,182,212,0.15)",
    glow: "rgba(6,182,212,0.2)"
  }
];

export default function QuickActionsCard() {
  const navigate = useNavigate();

  return (
    <div className="adm-chart-card flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
            <Zap size={15} style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <h3 className="adm-section-title">Quick Actions</h3>
            <p className="adm-section-sub">Immediate shortcuts</p>
          </div>
        </div>

        <hr className="adm-divider mb-4" />

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {ACTIONS.map((act) => {
            const Icon = act.icon;
            return (
              <motion.button
                key={act.label}
                whileHover={{ y: -3 }}
                onClick={() => navigate(act.path)}
                className="adm-action-tile group focus:outline-none"
                style={{
                  background: act.bgGrad,
                  borderColor: act.border,
                  boxShadow: `0 4px 12px ${act.glow}05`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = `0 12px 24px ${act.glow}`;
                  e.currentTarget.style.borderColor = act.color;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = `0 4px 12px ${act.glow}05`;
                  e.currentTarget.style.borderColor = act.border;
                }}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${act.color}15`,
                      border: `1px solid ${act.color}30`
                    }}
                  >
                    <Icon size={16} style={{ color: act.color }} />
                  </div>
                  <ArrowRight
                    size={13}
                    style={{ color: "#334155" }}
                    className="group-hover:translate-x-1 group-hover:text-white transition-all"
                  />
                </div>
                <div className="text-left">
                  <h4 className="text-[13px] font-bold" style={{ color: "#F8FAFC" }}>
                    {act.label}
                  </h4>
                  <p className="text-[11px] mt-0.5 leading-tight" style={{ color: "#475569" }}>
                    {act.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
