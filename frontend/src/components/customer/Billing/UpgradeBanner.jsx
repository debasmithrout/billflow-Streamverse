// src/components/customer/Billing/UpgradeBanner.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getAvailablePlans } from "../../../services/customerService";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function UpgradeBanner({ currentPlanName }) {
  const navigate = useNavigate();
  const isAlreadyPremium = currentPlanName?.toUpperCase() === "PREMIUM";
  const [premiumPrice, setPremiumPrice] = useState(299);
  const [currencyCode, setCurrencyCode] = useState("INR");

  useEffect(() => {
    if (isAlreadyPremium) return;
    const fetchPremiumPrice = async () => {
      try {
        const userString = localStorage.getItem("current_user");
        const user = userString ? JSON.parse(userString) : null;
        const userCurrency = user?.currency_code || "INR";
        setCurrencyCode(userCurrency);

        const plans = await getAvailablePlans();
        const premiumPlan = plans.find(p => p.name?.toUpperCase() === "PREMIUM");
        if (premiumPlan) {
          let price = premiumPlan.price;
          if (premiumPlan.prices && premiumPlan.prices.length > 0) {
            const regPrice = premiumPlan.prices.find(p => p.currency_code === userCurrency && p.is_active !== false);
            if (regPrice) {
              price = regPrice.price;
            }
          }
          setPremiumPrice(price);
        }
      } catch (err) {
        console.error("Failed to load premium price in UpgradeBanner:", err);
      }
    };
    fetchPremiumPrice();
  }, [isAlreadyPremium]);

  if (isAlreadyPremium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.005 }}
      className="relative bg-gradient-to-r from-zinc-900/90 via-zinc-900/60 to-red-950/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/50 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 group"
    >
      {/* Background Amber/Red Ambient Glow */}
      <div className="absolute left-0 top-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all duration-500 pointer-events-none" />

      {/* Left Content */}
      <div className="flex items-start gap-4 z-10">
        {/* Glowing Crown/Star Badge Icon */}
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/10">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black text-white tracking-tight">
            Upgrade to Premium
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> Ultra HD Streaming
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> Watch on 4 devices
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> Ad-free experience
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-emerald-400 font-bold">✓</span> Download and watch offline
            </div>
          </div>
        </div>
      </div>

      {/* Right Pricing & CTA */}
      <div className="flex flex-col sm:flex-row md:flex-col items-center md:items-end gap-3 z-10 shrink-0 w-full sm:w-auto">
        <div className="text-center md:text-right">
          <span className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(premiumPrice, currencyCode)}
          </span>
          <span className="text-xs text-gray-400 font-medium ml-1">/ month</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => navigate("/customer/subscription")}
          className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-900/40 border border-red-500/30 transition-all cursor-pointer"
        >
          Upgrade Now
        </motion.button>
      </div>
    </motion.div>
  );
}
