// src/components/admin/Payments/PaymentStatusBadge.jsx

export default function PaymentStatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s ? s.toUpperCase() : "") {
      case "PAID":
      case "SUCCESSFUL":
      case "SUCCESS":
        return "adm-pill-green";
      case "PENDING":
        return "adm-pill-amber";
      case "FAILED":
        return "adm-pill-red";
      case "REFUNDED":
        return "adm-pill-purple";
      case "PROCESSING":
        return "adm-pill-blue";
      case "CANCELLED":
        return "adm-pill-gray";
      default:
        return "adm-pill-gray";
    }
  };

  const getStatusLabel = (s) => {
    switch (s ? s.toUpperCase() : "") {
      case "PAID":
      case "SUCCESSFUL":
      case "SUCCESS":
        return "🟢 Paid";
      case "PENDING":
        return "🟡 Pending";
      case "FAILED":
        return "🔴 Failed";
      case "REFUNDED":
        return "🟣 Refunded";
      case "PROCESSING":
        return "🔵 Processing";
      case "CANCELLED":
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
