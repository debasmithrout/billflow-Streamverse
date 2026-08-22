// src/components/admin/AuditLogs/AuditSeverityBadge.jsx
import { CheckCircle2, Info, AlertTriangle, XCircle, ShieldAlert } from "lucide-react";

export default function AuditSeverityBadge({ severity }) {
  const getSeverityConfig = (s) => {
    switch (s ? s.toUpperCase() : "") {
      case "SUCCESS":
        return { label: "Success", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", icon: CheckCircle2 };
      case "WARNING":
        return { label: "Warning", cls: "text-amber-400 bg-amber-500/10 border-amber-500/25", icon: AlertTriangle };
      case "ERROR":
        return { label: "Error", cls: "text-red-400 bg-red-500/10 border-red-500/25", icon: XCircle };
      case "SECURITY":
        return { label: "Security", cls: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/25", icon: ShieldAlert };
      case "INFO":
      default:
        return { label: "Info", cls: "text-sky-400 bg-sky-500/10 border-sky-500/25", icon: Info };
    }
  };

  const { label, cls, icon: Icon } = getSeverityConfig(severity);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${cls}`}>
      <Icon size={9} />
      {label}
    </span>
  );
}
