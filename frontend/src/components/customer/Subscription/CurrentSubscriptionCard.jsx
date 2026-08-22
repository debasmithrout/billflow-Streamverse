// src/components/customer/Subscription/CurrentSubscriptionCard.jsx
import React from 'react';

export default function CurrentSubscriptionCard({ subscription }) {
  if (!subscription) return null;

  const { planName, billingCycle, renewalDate, status, trialDaysRemaining, trialEndDate, cancelledAt } = subscription;

  const isAutoRenewalActive = status === "ACTIVE" || status === "TRIAL" || status === "PENDING_ACTIVATION";

  const getBadgeStyles = (subStatus) => {
    switch (subStatus) {
      case "ACTIVE":
        return "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
      case "CANCELLED":
        return "text-rose-500 bg-rose-500/10 border border-rose-500/20";
      case "CANCEL_AT_PERIOD_END":
        return "text-amber-500 bg-amber-500/10 border border-amber-500/20";
      case "PAST_DUE":
        return "text-orange-500 bg-orange-500/10 border border-orange-500/20";
      case "PAUSED":
        return "text-gray-400 bg-white/5 border border-white/10";
      default:
        return "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20";
    }
  };

  const renderStatusDetails = () => {
    if (status === "TRIAL") {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-4">
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Trial Status</span>
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded uppercase">
              Free Trial
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Remaining Days</span>
            <span className="text-sm font-bold text-white">{trialDaysRemaining} Days</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Trial Ends</span>
            <span className="text-sm font-mono text-white">{trialEndDate}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Auto Renewal</span>
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 rounded uppercase">
              Disabled
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-4">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Renewal Cycle</span>
          <span className="text-sm font-medium text-white">{billingCycle || 'Monthly'}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Status Code</span>
          <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded uppercase ${getBadgeStyles(status)}`}>
            {status}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Auto Renewal</span>
          {isAutoRenewalActive ? (
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded uppercase">
              Enabled
            </span>
          ) : (
            <span className="inline-flex px-2 py-0.5 text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded uppercase">
              Disabled
            </span>
          )}
        </div>
        {status === "CANCELLED" && cancelledAt ? (
          <div>
            <span className="text-[10px] text-rose-500 uppercase font-black tracking-wider block mb-1">Cancelled On</span>
            <span className="text-sm font-mono text-white">{cancelledAt}</span>
          </div>
        ) : (
          renewalDate && (
            <div>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Next Billing Date</span>
              <span className="text-sm font-mono text-white">{renewalDate}</span>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-start border-b border-white/5 pb-3">
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-0.5">
            {status === "CANCELLED" ? "Cancelled Subscription" : "Active Subscription"}
          </span>
          <h3 className="text-lg font-black text-white">
            {status === "CANCELLED" ? `Last Plan: ${planName}` : (planName === "None" ? "No Paid Subscription" : planName)}
          </h3>
        </div>
        {status !== "TRIAL" && status !== "EXPIRED" && (
          <span className="text-xs text-gray-400 font-light">
            Plan Code: {planName.replace(/\s+/g, "_").toUpperCase()}
          </span>
        )}
      </div>

      {renderStatusDetails()}
    </div>
  );
}
