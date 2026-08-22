// src/components/admin/Dashboard/TodaySummaryCard.jsx
import { UserPlus, RefreshCw, TrendingUp, FileText } from "lucide-react";

const SUMMARY_META = [
  { key: "newCustomers",      label: "New Customers",     icon: UserPlus,    color: "#3B82F6", box: "adm-icon-blue"   },
  { key: "newSubscriptions",  label: "New Subscriptions", icon: RefreshCw,   color: "#22C55E", box: "adm-icon-green"  },
  { key: "revenue",           label: "Revenue Collected", icon: TrendingUp,  color: "#A855F7", box: "adm-icon-purple", highlight: true },
  { key: "invoicesGenerated", label: "Invoices Issued",   icon: FileText,    color: "#F59E0B", box: "adm-icon-amber"  },
];

export default function TodaySummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="adm-chart-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="adm-section-title">Today's Summary</h3>
          <p className="adm-section-sub">24-hour platform activity</p>
        </div>
        {/* Live pulse indicator */}
        <div className="flex items-center gap-1.5">
          <span className="adm-dot-green" />
          <span className="text-[10px] font-semibold" style={{ color: "#4ADE80" }}>Live</span>
        </div>
      </div>

      <hr className="adm-divider mb-4" />

      {/* Metrics */}
      <div className="flex-1 space-y-1">
        {SUMMARY_META.map((m, idx) => {
          const value = summary[m.key];
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
                className="font-bold"
                style={{
                  color: m.highlight ? "#A855F7" : "#F8FAFC",
                  fontSize: m.highlight ? "15px" : "13px",
                  fontVariantNumeric: "tabular-nums"
                }}
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
