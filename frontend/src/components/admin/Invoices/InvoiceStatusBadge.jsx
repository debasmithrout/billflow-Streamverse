// src/components/admin/Invoices/InvoiceStatusBadge.jsx

export default function InvoiceStatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s ? s.toUpperCase() : "") {
      case "PAID":
        return "adm-pill-green";
      case "PENDING":
        return "adm-pill-amber";
      case "OVERDUE":
        return "adm-pill-red";
      case "REFUNDED":
        return "adm-pill-purple";
      case "CANCELLED":
      case "VOID":
        return "adm-pill-gray";
      default:
        return "adm-pill-gray";
    }
  };

  const getStatusLabel = (s) => {
    switch (s ? s.toUpperCase() : "") {
      case "PAID":
        return "🟢 Paid";
      case "PENDING":
        return "🟡 Pending";
      case "OVERDUE":
        return "🔴 Overdue";
      case "REFUNDED":
        return "🟣 Refunded";
      case "CANCELLED":
      case "VOID":
        return "⚫ Cancelled";
      default:
        return s || "UNKNOWN";
    }
  };

  return (
    <span className={`adm-pill font-bold uppercase tracking-wider text-[10px] select-none ${getBadgeClass(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}
