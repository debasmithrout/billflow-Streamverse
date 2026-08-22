// src/components/landing/PricingPreview.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import PlanCard from "../shared/PlanCard";
import { mapDbPlanToCustomerPlan } from "../../utils/planMapper";
import { useLanguage } from "../../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SkeletonCard = () => (
  <div className="rounded-2xl p-6 border border-white/5 bg-zinc-900/40 space-y-6 h-full animate-pulse">
    <div className="space-y-4">
      <div className="h-4 bg-zinc-800 rounded w-1/3" />
      <div className="h-3 bg-zinc-800 rounded w-2/3" />
      <div className="h-8 bg-zinc-800 rounded w-1/2 pt-4" />
      <div className="space-y-2 pt-4">
        <div className="h-3 bg-zinc-800 rounded w-full" />
        <div className="h-3 bg-zinc-800 rounded w-5/6" />
        <div className="h-3 bg-zinc-800 rounded w-4/5" />
      </div>
    </div>
    <div className="h-10 bg-zinc-800 rounded-xl w-full" />
  </div>
);

const ErrorState = ({ onRetry }) => {
  const { t } = useLanguage();
  return (
    <div className="col-span-full py-16 text-center space-y-6 max-w-sm mx-auto animate-fade-in">
      <div className="w-16 h-16 bg-violet-600/10 rounded-full flex items-center justify-center mx-auto text-violet-400 border border-violet-500/20">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-black text-white">{t("pricingError.unavailable")}</h3>
        <p className="text-xs text-gray-500 font-light leading-relaxed">
          {t("pricingError.message")}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-violet-600/15 focus:outline-none"
      >
        {t("pricingError.retry")}
      </button>
    </div>
  );
};

export default function PricingPreview() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useLanguage();

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await axios.get(`${API_URL}/plans/`);
      const activePlans = response.data.filter(p => !p.is_archived);
      setPlans(activePlans.map(mapDbPlanToCustomerPlan));
    } catch (err) {
      console.error("Failed to load plans from database API:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch w-full">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      );
    }

    if (error) {
      return <ErrorState onRetry={fetchPlans} />;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 items-stretch w-full">
        {plans.map((p) => {
          const ctaLink = (
            <Link
              to="/register"
              className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold transition-all duration-200 cursor-pointer block bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-lg shadow-violet-600/10 active:scale-98"
            >
              {t("pricing.choose")}
            </Link>
          );

          return (
            <PlanCard
              key={p.id}
              plan={p}
              isActive={false}
              isTrial={p.name.toLowerCase().includes("trial") || p.name.toLowerCase().includes("free")}
              cta={ctaLink}
            />
          );
        })}
      </div>
    );
  };

  return (
    <section id="pricing" className="py-24 bg-[#060816] relative overflow-hidden">
      {/* Background radial gradient — purple to match site theme */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] pointer-events-none" style={{background:'linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)'}} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase" style={{background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',color:'#a78bfa'}}>
            {t("pricing.badge")}
          </div>
          <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            {t("pricing.title_part1")}
          </p>
          <p className="text-lg text-gray-400 font-light">
            {t("pricing.subtitle")}
          </p>
        </div>

        {renderContent()}
      </div>
    </section>
  );
}
