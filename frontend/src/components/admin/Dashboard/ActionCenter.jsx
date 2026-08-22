// src/components/admin/Dashboard/ActionCenter.jsx
import { useState, useEffect } from "react";
import { AlertCircle, RefreshCw, AlertTriangle, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getActionCenterStats } from "../../../services/adminService";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function ActionCenter() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const data = await getActionCenterStats();
        if (active) {
          setStats(data);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch Action Center stats:", err);
      }
    };
    fetchStats();
    return () => { active = false; };
  }, []);

  const overdueCount = stats?.overdue_invoices?.count ?? 0;
  const overdueAmount = stats?.overdue_invoices?.amount ?? 0;
  const renewalsCount = stats?.renewals_today?.count ?? 0;
  const renewalsRevenue = stats?.renewals_today?.amount ?? 0;
  const failedCount = stats?.failed_payments?.count ?? 0;
  const failedAmount = stats?.failed_payments?.amount ?? 0;
  const refundsCount = stats?.refund_approvals?.count ?? 0;
  const refundsAmount = stats?.refund_approvals?.amount ?? 0;
  const trialsCount = stats?.trial_users_ending?.count ?? 0;
  const currencyCode = stats?.reporting_currency ?? "INR";

  const actions = [
    {
      id: "overdue_inv",
      title: overdueCount === 1 ? "1 Invoice is overdue" : `${overdueCount} Invoices are overdue`,
      detail: `Total amount: ${formatCurrency(overdueAmount, currencyCode)}`,
      icon: AlertCircle,
      color: "#EF4444", // Red (Danger)
      bg: "rgba(239,68,68,0.07)",
      border: "rgba(239,68,68,0.15)",
      path: "/admin/invoices",
      btnText: "Resolve"
    },
    {
      id: "renewals_today",
      title: renewalsCount === 1 ? "1 Subscription renews today" : `${renewalsCount} Subscriptions renew today`,
      detail: `Expected revenue: ${formatCurrency(renewalsRevenue, currencyCode)}`,
      icon: RefreshCw,
      color: "#F59E0B", // Amber (Warning)
      bg: "rgba(245,158,11,0.07)",
      border: "rgba(245,158,11,0.15)",
      path: "/admin/subscriptions",
      btnText: "View"
    },
    {
      id: "failed_pay",
      title: failedCount === 1 ? "1 Failed payment needs attention" : `${failedCount} Failed payments need attention`,
      detail: `Total amount: ${formatCurrency(failedAmount, currencyCode)}`,
      icon: AlertTriangle,
      color: "#EF4444", // Red
      bg: "rgba(239,68,68,0.07)",
      border: "rgba(239,68,68,0.15)",
      path: "/admin/payments",
      btnText: "Retry"
    },
    {
      id: "pending_refunds",
      title: refundsCount === 1 ? "1 Refund pending approval" : `${refundsCount} Refunds pending approval`,
      detail: `Total amount: ${formatCurrency(refundsAmount, currencyCode)}`,
      icon: ShieldCheck,
      color: "#8B5CF6", // Purple
      bg: "rgba(139,92,246,0.07)",
      border: "rgba(139,92,246,0.15)",
      path: "/admin/refunds",
      btnText: "Approve"
    },
    {
      id: "trials_ending",
      title: trialsCount === 1 ? "1 Trial user ending soon" : `${trialsCount} Trial users ending soon`,
      detail: "Target conversion path active",
      icon: Clock,
      color: "#F59E0B", // Amber
      bg: "rgba(245,158,11,0.07)",
      border: "rgba(245,158,11,0.15)",
      path: "/admin/subscriptions",
      btnText: "Nudge"
    }
  ];

  if (loading) {
    return (
      <div className="adm-chart-card flex flex-col h-full justify-center items-center py-10 min-h-[300px]">
        <RefreshCw className="animate-spin h-5 w-5 text-[#8B5CF6] mb-2" />
        <span className="text-zinc-500 text-xs">Loading required tasks...</span>
      </div>
    );
  }

  return (
    <div className="adm-chart-card flex flex-col h-full justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
            <AlertCircle size={15} style={{ color: "#8B5CF6" }} />
          </div>
          <div>
            <h3 className="adm-section-title">Action Center</h3>
            <p className="adm-section-sub">Required business steps</p>
          </div>
        </div>

        <hr className="adm-divider mb-4" />

        {/* Action items list */}
        <div className="space-y-2.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                className="adm-action-item"
                style={{
                  background: act.bg,
                  borderColor: act.border
                }}
                onClick={() => navigate(act.path)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${act.color}15`, border: `1px solid ${act.color}25` }}
                >
                  <Icon size={14} style={{ color: act.color }} />
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-[12.5px] font-semibold truncate" style={{ color: "#F8FAFC" }}>
                    {act.title}
                  </h4>
                  <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                    {act.detail}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(act.path);
                  }}
                  className="adm-btn adm-btn-ghost flex items-center gap-1 cursor-pointer focus:outline-none"
                  style={{
                    fontSize: "10px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    background: "rgba(255,255,255,0.04)"
                  }}
                >
                  {act.btnText}
                  <ArrowRight size={10} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
