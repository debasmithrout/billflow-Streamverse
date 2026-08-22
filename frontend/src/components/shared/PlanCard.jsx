// src/components/shared/PlanCard.jsx
import React from 'react';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useLanguage } from '../../context/LanguageContext';

export default function PlanCard({ plan, isActive, isTrial, cta, accentColor = "purple" }) {
  const { name, price, billingCycle, resolution, screens, features, description, badge } = plan;
  const { t } = useLanguage();

  // Resolve regional pricing
  const user = JSON.parse(localStorage.getItem("current_user") || "{}");
  const currencyCode = user?.currency_code || "INR";

  let displayPrice = price;
  let displayCurrency = currencyCode;

  if (plan.prices && plan.prices.length > 0) {
    const regionalPrice = plan.prices.find(
      (p) => p.currency_code === currencyCode && p.is_active !== false
    );
    if (regionalPrice) {
      displayPrice = regionalPrice.price;
    } else {
      const defaultPrice = plan.prices.find((p) => p.is_default && p.is_active !== false);
      if (defaultPrice) {
        displayPrice = defaultPrice.price;
        displayCurrency = defaultPrice.currency_code;
      }
    }
  }

  // Map accentColor string to classes
  const badgeColors = {
    purple: "bg-purple-600 shadow-purple-600/20",
    red: "bg-red-600 shadow-red-600/20",
    green: "bg-green-600 shadow-green-600/20",
  }[accentColor] || "bg-purple-600 shadow-purple-600/20";

  const textColors = {
    purple: "text-purple-400",
    red: "text-red-500",
    green: "text-green-500",
  }[accentColor] || "text-purple-400";

  return (
    <div 
      className={`relative rounded-2xl p-6 border transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between h-full space-y-6 ${
        isActive 
          ? "bg-gradient-to-b from-purple-900/10 to-zinc-950 border-purple-500/30 shadow-xl shadow-purple-500/5" 
          : "bg-zinc-900/40 border-white/5 hover:border-white/10"
      }`}
    >
      {/* Badge Centered on Top Border */}
      {isActive ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black text-white bg-purple-600 uppercase tracking-wider shadow shadow-purple-600/20">
          {isTrial ? t("pricing.currentTrial") : t("pricing.currentPlan")}
        </span>
      ) : badge ? (
        <span className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] font-black text-white uppercase tracking-wider shadow ${badgeColors}`}>
          {badge}
        </span>
      ) : null}

      <div className="space-y-5">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-3">
          <div>
            <h4 className="text-base font-black text-white">{name}</h4>
            <span className="text-[10px] text-gray-500 font-light mt-0.5 block">
              {resolution} • {screens} {screens === 1 ? t("pricing.screen") : t("pricing.screens")}
            </span>
          </div>
        </div>

        {/* Short Description */}
        {description && (
          <p className="text-gray-400 text-xs font-light leading-relaxed min-h-[32px]">
            {description}
          </p>
        )}

        {/* Pricing */}
        <div>
          <span className="text-3xl font-black text-white">
            {formatCurrency(displayPrice, displayCurrency)}
          </span>
          <span className="text-xs text-gray-500 font-light ml-1">
            / {billingCycle.toLowerCase().includes("trial") || displayPrice === 0 ? t("pricing.7days") : t("pricing.month")}
          </span>
        </div>

        {/* Features Checklist */}
        <ul className="space-y-2.5 text-xs text-gray-300 font-light pt-2">
          {features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <svg className={`w-4 h-4 shrink-0 mt-0.5 ${textColors}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Action Section */}
      <div className="w-full">
        {cta}
      </div>
    </div>
  );
}
