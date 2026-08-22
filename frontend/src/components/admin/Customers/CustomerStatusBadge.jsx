// src/components/admin/Customers/CustomerStatusBadge.jsx

export default function CustomerStatusBadge({ status }) {
  const getBadgeMeta = (s) => {
    const raw = s ? s.toUpperCase() : "";
    switch (raw) {
      case "ACTIVE":
        return {
          label: "Active",
          cls: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20",
          dotColor: "#22C55E"
        };
      case "TRIAL":
        return {
          label: "Trial",
          cls: "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/20",
          dotColor: "#8B5CF6"
        };
      case "PAST_DUE":
      case "PENDING":
        return {
          label: raw === "PAST_DUE" ? "Past Due" : "Pending",
          cls: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20",
          dotColor: "#F59E0B"
        };
      case "SUSPENDED":
        return {
          label: "Suspended",
          cls: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20",
          dotColor: "#EF4444"
        };
      case "CANCELLED":
      case "EXPIRED":
      case "DELETED":
        return {
          label: raw === "CANCELLED" ? "Cancelled" : raw === "EXPIRED" ? "Expired" : "Deleted",
          cls: "text-[#94A3B8] bg-zinc-800 border-zinc-700",
          dotColor: "#64748B"
        };
      default:
        return {
          label: status || "Unknown",
          cls: "text-zinc-400 bg-zinc-900 border-zinc-800",
          dotColor: "#475569"
        };
    }
  };

  const meta = getBadgeMeta(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${meta.cls}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.dotColor }} />
      {meta.label}
    </span>
  );
}
