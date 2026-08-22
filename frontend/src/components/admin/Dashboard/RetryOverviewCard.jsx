// src/components/admin/Dashboard/RetryOverviewCard.jsx
import { Clock, CheckCircle2, AlertTriangle, Activity } from "lucide-react";

export default function RetryOverviewCard({ stats }) {
  if (!stats) return null;

  const METRIC_META = [
    { label: "Pending Retries", value: stats.pending, icon: Clock, color: "#F59E0B", box: "adm-icon-amber" },
    { label: "Recovered Payments", value: stats.recovered, icon: CheckCircle2, color: "#22C55E", box: "adm-icon-green" },
    { label: "Failed Retries", value: stats.failed, icon: AlertTriangle, color: "#EF4444", box: "adm-icon-rose" },
    { label: "Retry Success Rate", value: `${stats.successRate}%`, icon: Activity, color: "#A855F7", box: "adm-icon-purple", highlight: true },
  ];

  return (
    <div className="adm-chart-card flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="adm-section-title">Payment Retry Overview</h3>
        <p className="adm-section-sub">Automated payment recovery stats</p>
      </div>

      <hr className="adm-divider mb-4" />

      {/* Metrics list */}
      <div className="flex-1 space-y-1">
        {METRIC_META.map((m, idx) => {
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
                {m.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
