// src/components/customer/Subscription/PlanComparisonCard.jsx
import React from 'react';
import PlanCard from '../../shared/PlanCard';

export default function PlanComparisonCard({ plan, activePlanId, currentPlanName, subscription, onSelectPlan, isUpdating }) {
  const { id, name } = plan;

  const isActive = activePlanId != null && Number(id) === Number(activePlanId);
  const isTrial  = name.toLowerCase().includes("trial") || name.toLowerCase().includes("free");

  // Determine pricing relationship
  let planRelation = "choose"; // "choose", "current", "upgrade", "downgrade"

  if (isActive) {
    planRelation = "current";
  } else if (activePlanId != null && subscription) {
    const currentPrice = subscription.price || 0;
    const targetPrice = plan.price;
    if (targetPrice > currentPrice) {
      planRelation = "upgrade";
    } else if (targetPrice < currentPrice) {
      planRelation = "downgrade";
    }
  }

  let ctaText = "Choose Plan";
  let buttonClass = "";
  let buttonStyle = {};

  if (planRelation === "current") {
    ctaText = isTrial ? "Current Trial" : "Current Plan";
    buttonClass = "bg-white/5 border border-white/8 text-white/30 cursor-not-allowed pointer-events-auto";
  } else if (planRelation === "upgrade") {
    ctaText = "Upgrade Plan";
    buttonClass = "text-white shadow-lg active:scale-95 hover:scale-[1.02] transition-transform";
    buttonStyle = {
      background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
      boxShadow: "0 4px 20px rgba(139,92,246,0.3)"
    };
  } else if (planRelation === "downgrade") {
    ctaText = "Downgrade Plan";
    buttonClass = "text-white/80 bg-white/4 border border-white/10 hover:border-purple-500/45 hover:bg-purple-600/10 hover:text-purple-300 transition-all active:scale-95";
  } else {
    ctaText = "Choose Plan";
    buttonClass = "text-white shadow-lg active:scale-95 hover:scale-[1.02] transition-transform";
    buttonStyle = {
      background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
      boxShadow: "0 4px 20px rgba(139,92,246,0.3)"
    };
  }

  const ctaButton = (
    <button
      type="button"
      disabled={isActive || isUpdating}
      onClick={() => onSelectPlan(id)}
      className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer focus:outline-none ${buttonClass}`}
      style={buttonStyle}
    >
      {isUpdating && !isActive ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </span>
      ) : ctaText}
    </button>
  );

  return (
    <PlanCard
      plan={plan}
      isActive={isActive}
      isTrial={isTrial}
      cta={ctaButton}
    />
  );
}

