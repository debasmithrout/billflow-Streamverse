// src/components/admin/AuditLogs/AuditLogTable.jsx
import { motion } from "framer-motion";
import { Eye, Shield, Users, CreditCard, FileText, RefreshCw, Settings, Activity, Lock, BarChart2 } from "lucide-react";
import AuditSeverityBadge from "./AuditSeverityBadge";

const MODULE_CONFIG = {
  customers:     { icon: Users,       color: "text-cyan-400",    bg: "bg-cyan-500/10"    },
  payments:      { icon: CreditCard,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
  subscriptions: { icon: Activity,    color: "text-[#8B5CF6]",   bg: "bg-[#8B5CF6]/10"  },
  invoices:      { icon: FileText,    color: "text-amber-400",   bg: "bg-amber-500/10"   },
  refunds:       { icon: RefreshCw,   color: "text-blue-400",    bg: "bg-blue-500/10"    },
  settings:      { icon: Settings,    color: "text-zinc-400",    bg: "bg-zinc-800/60"    },
  auth:          { icon: Lock,        color: "text-red-400",     bg: "bg-red-500/10"     },
  security:      { icon: Shield,      color: "text-[#8B5CF6]",   bg: "bg-[#8B5CF6]/10"  },
  analytics:     { icon: BarChart2,   color: "text-sky-400",     bg: "bg-sky-500/10"     },
  system:        { icon: Activity,    color: "text-zinc-400",    bg: "bg-zinc-800/60"    }
};

function getModuleConfig(module) {
  const key = (module || "").toLowerCase();
  return MODULE_CONFIG[key] || { icon: Activity, color: "text-zinc-400", bg: "bg-zinc-800/60" };
}

function getInitials(name) {
  if (!name) return "AD";
  const base = name.split("@")[0].replace(/[._]/g, " ");
  const parts = base.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30",
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-red-500/20 text-red-400 border-red-500/30"
  ];
  const n = (name || "a").charCodeAt(0);
  return colors[n % colors.length];
}

function formatTimestamp(ts) {
  if (!ts) return "-";
  const date = new Date(ts);
  return date.toLocaleString("en-US", {
    month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
  });
}

export default function AuditLogTable({ logs = [], onView }) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#121218]/40 backdrop-blur-md shadow-xl">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="border-b border-white/5 bg-zinc-950/70 text-[9px] text-[#475569] uppercase font-black tracking-wider select-none">
            <th className="py-4 px-5">Timestamp</th>
            <th className="py-4 px-5">Module</th>
            <th className="py-4 px-5">Action</th>
            <th className="py-4 px-5">Severity</th>
            <th className="py-4 px-5">Description</th>
            <th className="py-4 px-5">Performed By</th>
            <th className="py-4 px-5">IP Address</th>
            <th className="py-4 px-5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-xs text-zinc-300">
          {logs.map((log, idx) => {
            const { icon: ModIcon, color: modColor, bg: modBg } = getModuleConfig(log.module);
            const isSystem = (log.performedBy || "").toLowerCase() === "system";
            const avatarCls = isSystem ? "bg-zinc-800/60 text-zinc-400 border-zinc-700/50" : getAvatarColor(log.performedBy);
            const displayName = log.performedBy || "System";
            const displayRole = isSystem ? "System" : "Administrator";

            return (
              <motion.tr
                key={log.id || idx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.025 }}
                onClick={() => onView(log)}
                className="group hover:bg-white/[0.025] transition-colors cursor-pointer"
              >
                {/* Timestamp */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0 group-hover:shadow-[0_0_6px_#8B5CF6] transition-shadow" />
                    <span className="font-mono text-[11px] text-zinc-400">{formatTimestamp(log.timestamp)}</span>
                  </div>
                </td>

                {/* Module */}
                <td className="py-3.5 px-5">
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg ${modBg} border border-white/5`}>
                    <ModIcon size={10} className={modColor} />
                    <span className={`text-[10px] font-bold ${modColor}`}>{log.module || "System"}</span>
                  </div>
                </td>

                {/* Action */}
                <td className="py-3.5 px-5">
                  <span className="text-white font-semibold group-hover:text-[#8B5CF6] transition-colors">{log.action}</span>
                </td>

                {/* Severity */}
                <td className="py-3.5 px-5">
                  <AuditSeverityBadge severity={log.severity} />
                </td>

                {/* Description */}
                <td className="py-3.5 px-5 max-w-[240px]">
                  <span className="text-zinc-400 text-[11px] truncate block" title={log.description}>{log.description || "—"}</span>
                </td>

                {/* Performed By */}
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0 border ${avatarCls}`}>
                      {getInitials(displayName)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-white font-semibold block text-[11px] truncate max-w-[110px]" title={displayName}>{displayName}</span>
                      <span className="text-[9px] text-zinc-500 block">{displayRole}</span>
                    </div>
                  </div>
                </td>

                {/* IP Address */}
                <td className="py-3.5 px-5">
                  <span className="font-mono text-[10px] text-zinc-500">
                    {log.ip_address || log.ipAddress || "192.168.1.1"}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-5 text-right">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onView(log); }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-[#8B5CF6]/10 border border-white/5 hover:border-[#8B5CF6]/30 text-zinc-400 hover:text-[#8B5CF6] rounded-lg cursor-pointer focus:outline-none transition-all text-[10px] font-bold"
                    aria-label="View audit log details"
                  >
                    <Eye size={12} />
                    View
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
