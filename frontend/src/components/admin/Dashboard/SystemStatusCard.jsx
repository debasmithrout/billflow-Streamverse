// src/components/admin/Dashboard/SystemStatusCard.jsx
import { CheckCircle2, AlertCircle, Wifi, Database, Shield, CreditCard, FileText } from "lucide-react";

const STATUS_META = {
  online:       { pill: "adm-pill-green",  dot: "adm-dot-green",  label: "Online"       },
  connected:    { pill: "adm-pill-green",  dot: "adm-dot-green",  label: "Connected"    },
  active:       { pill: "adm-pill-green",  dot: "adm-dot-green",  label: "Active"       },
  healthy:      { pill: "adm-pill-green",  dot: "adm-dot-green",  label: "Healthy"      },
  operational:  { pill: "adm-pill-green",  dot: "adm-dot-green",  label: "Operational"  },
  degraded:     { pill: "adm-pill-amber",  dot: "adm-dot-amber",  label: "Degraded"     },
  offline:      { pill: "adm-pill-red",    dot: "adm-dot-red",    label: "Offline"      },
  error:        { pill: "adm-pill-red",    dot: "adm-dot-red",    label: "Error"        },
};

const SERVICE_ICONS = {
  "Backend API":     { icon: Wifi,      color: "#3B82F6", box: "adm-icon-blue"   },
  "Database":        { icon: Database,  color: "#8B5CF6", box: "adm-icon-purple" },
  "Authentication":  { icon: Shield,    color: "#22C55E", box: "adm-icon-green"  },
  "Payments":        { icon: CreditCard,color: "#F59E0B", box: "adm-icon-amber"  },
  "Invoices":        { icon: FileText,  color: "#06B6D4", box: "adm-icon-cyan"   },
};

function ServiceRow({ label, value }) {
  const s = (value || "").toLowerCase();
  const meta = STATUS_META[s] || { pill: "adm-pill-gray", dot: "adm-dot-gray", label: value };
  const svcMeta = SERVICE_ICONS[label] || { icon: CheckCircle2, color: "#64748B", box: "adm-icon-blue" };
  const Icon = svcMeta.icon;

  return (
    <div
      className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl transition-colors"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div className="flex items-center gap-2.5">
        <div className={`adm-icon-box ${svcMeta.box}`} style={{ width: "30px", height: "30px", borderRadius: "8px" }}>
          <Icon size={13} style={{ color: svcMeta.color }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>{label}</span>
      </div>
      <span className={`adm-pill ${meta.pill}`}>
        <span className={meta.dot} />
        {meta.label}
      </span>
    </div>
  );
}

export default function SystemStatusCard({ systemStatus }) {
  if (!systemStatus) return null;

  const { api, database, auth, payments, invoices, lastSync } = systemStatus;

  const allOperational = [api, database, auth, payments, invoices].every(v => {
    const s = (v || "").toLowerCase();
    return ["online", "connected", "active", "healthy", "operational"].includes(s);
  });

  return (
    <div className="adm-chart-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="adm-section-title">System Status</h3>
          <p className="adm-section-sub">Service health monitor</p>
        </div>
        <span className={`adm-pill ${allOperational ? "adm-pill-green" : "adm-pill-amber"}`}>
          <span className={allOperational ? "adm-dot-green" : "adm-dot-amber"} />
          {allOperational ? "All Systems Go" : "Partial Outage"}
        </span>
      </div>

      <hr className="adm-divider mb-3" />

      {/* Service rows */}
      <div className="flex-1 space-y-0.5">
        <ServiceRow label="Backend API"    value={api}      />
        <ServiceRow label="Database"       value={database} />
        <ServiceRow label="Authentication" value={auth}     />
        <ServiceRow label="Payments"       value={payments} />
        <ServiceRow label="Invoices"       value={invoices} />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3 mt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#334155" }}>Last Sync</span>
        <span className="text-[11px] font-mono" style={{ color: "#475569" }}>{lastSync}</span>
      </div>
    </div>
  );
}
