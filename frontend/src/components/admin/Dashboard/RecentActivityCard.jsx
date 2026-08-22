// src/components/admin/Dashboard/RecentActivityCard.jsx
import { Activity, Clock } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "../Shared/EmptyState";

// Helper to determine colored badge & icon based on event activity
function getActivityMeta(event) {
  const e = (event || "").toLowerCase();
  if (e.includes("subscrib") || e.includes("plan")) {
    return { icon: "🔄", color: "#8B5CF6", bg: "rgba(139,92,246,0.12)", label: "Subscription" };
  }
  if (e.includes("pay") || e.includes("charge") || e.includes("paid")) {
    return { icon: "💳", color: "#22C55E", bg: "rgba(34,197,94,0.12)", label: "Payment" };
  }
  if (e.includes("invoice")) {
    return { icon: "🧾", color: "#06B6D4", bg: "rgba(6,182,212,0.12)", label: "Invoice" };
  }
  if (e.includes("refund")) {
    return { icon: "↩️", color: "#F97316", bg: "rgba(249,115,22,0.12)", label: "Refund" };
  }
  return { icon: "🔔", color: "#3B82F6", bg: "rgba(59,130,246,0.12)", label: "System" };
}

function getInitials(name) {
  if (!name) return "U";
  const p = name.trim().split(" ");
  if (p.length === 1) return p[0].substring(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function RecentActivityCard({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="adm-chart-card h-full">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
            <Activity size={15} style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <h3 className="adm-section-title">Recent Activity</h3>
            <p className="adm-section-sub">Live events feed</p>
          </div>
        </div>
        <hr className="adm-divider mb-4" />
        <EmptyState message="No Activities Yet" iconType="activity" />
      </div>
    );
  }

  return (
    <div className="adm-chart-card flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
              <Activity size={15} style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <h3 className="adm-section-title">Recent Activity</h3>
              <p className="adm-section-sub">Realtime events log</p>
            </div>
          </div>
          <span className="adm-status-chip adm-status-chip-purple">
            <span className="adm-dot-purple" />
            Live
          </span>
        </div>

        <hr className="adm-divider mb-4" />

        {/* Timeline container */}
        <div
          className="space-y-4 overflow-y-auto pr-1 adm-scrollbar"
          style={{ maxHeight: "312px" }}
        >
          {activities.map((act, idx) => {
            const meta = getActivityMeta(act.event);
            const initials = getInitials(act.customer);
            return (
              <motion.div
                key={act.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="adm-timeline-item group"
              >
                {/* Avatar with gradient background */}
                <div
                  className="adm-timeline-avatar"
                  style={{
                    background: `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`,
                    boxShadow: `0 4px 12px ${meta.color}20`
                  }}
                >
                  {initials}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {/* Event description */}
                      <p className="text-[13px] font-semibold" style={{ color: "#CBD5E1" }}>
                        {act.event}
                      </p>
                      {/* Customer info */}
                      <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                        by <span style={{ color: "#94A3B8" }}>{act.customer}</span>
                      </p>
                    </div>

                    {/* Timeline right badge + time */}
                    <div className="text-right flex-shrink-0">
                      <span
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: meta.bg,
                          color: meta.color,
                          border: `1px solid ${meta.color}20`
                        }}
                      >
                        {meta.label}
                      </span>
                      <div className="flex items-center justify-end gap-1 mt-1" style={{ color: "#334155" }}>
                        <Clock size={9} />
                        <span className="text-[9px] font-mono">{act.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
