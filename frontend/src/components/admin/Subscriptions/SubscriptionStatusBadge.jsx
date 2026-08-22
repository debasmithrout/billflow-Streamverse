// src/components/admin/Subscriptions/SubscriptionStatusBadge.jsx

export default function SubscriptionStatusBadge({ status }) {
  const getBadgeClass = (s) => {
    switch (s ? s.toUpperCase() : "") {
      case "ACTIVE":
        return "adm-pill-green";
      case "TRIAL":
        return "adm-pill-purple";
      case "PAUSED":
        return "adm-pill-blue";
      case "PAST_DUE":
        return "adm-pill-amber";
      case "CANCELLED":
        return "adm-pill-red";
      case "EXPIRED":
        return "adm-pill-gray";
      default:
        return "adm-pill-gray";
    }
  };

  const getStatusLabel = (s) => {
    switch (s ? s.toUpperCase() : "") {
      case "ACTIVE":
        return "🟢 Active";
      case "TRIAL":
        return "🟣 Trial";
      case "PAUSED":
        return "🔵 Paused";
      case "PAST_DUE":
        return "🟡 Past Due";
      case "CANCELLED":
        return "🔴 Cancelled";
      case "EXPIRED":
        return "⚫ Expired";
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
