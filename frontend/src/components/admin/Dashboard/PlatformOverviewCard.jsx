// src/components/admin/Dashboard/PlatformOverviewCard.jsx
import { Users, Package, Activity, Clock, DollarSign } from "lucide-react";

const METRIC_META = [
  { key: "totalCustomers",      label: "Total Customers",     icon: Users,       color: "#3B82F6", box: "adm-icon-blue"   },
  { key: "activePlans",         label: "Active Plans",        icon: Package,     color: "#8B5CF6", box: "adm-icon-purple" },
  { key: "activeSubscriptions", label: "Active Subs",         icon: Activity,    color: "#22C55E", box: "adm-icon-green"  },
  { key: "trialUsers",          label: "Trial Users",         icon: Clock,       color: "#F59E0B", box: "adm-icon-amber"  },
  { key: "monthlyRevenue",      label: "Monthly Revenue",     icon: DollarSign,  color: "#A855F7", box: "adm-icon-purple", highlight: true },
];

export default function PlatformOverviewCard({ overview }) {
  if (!overview) return null;

  return (
    <div className="adm-chart-card flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="adm-section-title">Platform Overview</h3>
        <p className="adm-section-sub">Key platform metrics</p>
      </div>

      <hr className="adm-divider mb-4" />

      {/* Metrics list */}
      <div className="flex-1 space-y-1">
        {METRIC_META.map((m, idx) => {
          const value = overview[m.key];
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 py-2.5 px-2 rounded-xl transition-colors"
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div className="flex items-center gap-2.5">
                <div className={`adm-icon-box ${m.box}`} style={{ width: "30px", height: "30px", borderRadius: "8px" }}>
                  <Icon size={13} style={{ color: m.color }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "#94A3B8" }}>{m.label}</span>
              </div>
              <span
                className={`font-bold ${m.highlight ? "text-base" : "text-sm"}`}
                style={{ color: m.highlight ? m.color : "#F8FAFC", fontVariantNumeric: "tabular-nums" }}
              >
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
