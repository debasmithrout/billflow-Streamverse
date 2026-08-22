// src/components/admin/Customers/CustomerDetailsDrawer.jsx
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Globe, Shield, Calendar, CreditCard, Activity, ArrowUpRight, Ban, Edit2 } from "lucide-react";
import CustomerStatusBadge from "./CustomerStatusBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";

function getLifetimeSpend(plan) {
  const p = (plan || "").toLowerCase();
  if (p.includes("family")) return 1497;
  if (p.includes("premium")) return 897;
  if (p.includes("standard")) return 597;
  if (p.includes("basic")) return 297;
  return 0;
}

export default function CustomerDetailsDrawer({ isOpen, customer, onClose, onEditClick }) {
  const drawerRef = useRef(null);

  // Close drawer if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    }
    const handler = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 120);
    
    return () => {
      clearTimeout(handler);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!customer) return null;

  const spend = getLifetimeSpend(customer.currentPlan);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md h-full flex flex-col z-50 overflow-hidden"
            style={{
              background: "rgba(14, 14, 18, 0.96)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.6)"
            }}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-zinc-950/40">
              <div className="text-left">
                <h3 className="text-sm font-bold text-white tracking-wide">Customer Details</h3>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{customer.id}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 p-5 space-y-5 overflow-y-auto adm-scrollbar">
              
              {/* Profile Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
                    boxShadow: "0 8px 24px rgba(139,92,246,0.25)"
                  }}
                >
                  {customer.name ? customer.name.substring(0, 2).toUpperCase() : "CU"}
                </div>
                <div className="min-w-0 text-left">
                  <h4 className="text-base font-black text-white truncate leading-snug">{customer.name}</h4>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{customer.email}</p>
                </div>
              </div>

              {/* Profile Info Glass Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <User size={13} style={{ color: "#8B5CF6" }} />
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#A78BFA]">Profile Details</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-left">
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block flex items-center gap-1"><Phone size={10} /> Phone</span>
                    <span className="text-white font-medium block truncate">{customer.phone_number || "Not provided"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block flex items-center gap-1"><Globe size={10} /> Country</span>
                    <span className="text-white font-medium block truncate">{customer.country || "Not provided"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block flex items-center gap-1"><Shield size={10} /> Role</span>
                    <span className="text-white font-bold block truncate">{customer.role || "CUSTOMER"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block flex items-center gap-1"><Calendar size={10} /> Joined Date</span>
                    <span className="text-white font-medium block truncate">{customer.created_at || "Not provided"}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-left border-t border-white/5 pt-3">
                  <span className="text-gray-500 font-light block">Billing Address</span>
                  <span className="text-white font-medium block leading-relaxed">{customer.address || "Not provided"}</span>
                </div>
              </div>

              {/* Subscription Status Glass Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Activity size={13} style={{ color: "#EC4899" }} />
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#F9A8D4]">Subscription</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-left">
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block">Current Plan</span>
                    <span className="text-white font-black block truncate">{customer.currentPlan || "None"}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block">Subscription State</span>
                    <div className="block mt-0.5">
                      <CustomerStatusBadge status={customer.subscriptionStatus} />
                    </div>
                  </div>
                  {customer.subscriptionStatus === "TRIAL" && (
                    <div className="space-y-1">
                      <span className="text-gray-500 font-light block">Trial Remaining</span>
                      <span className="text-red-500 font-bold block">{customer.trialDaysRemaining} days</span>
                    </div>
                  )}
                  {customer.renewalDate && (
                    <div className="space-y-1">
                      <span className="text-gray-500 font-light block">Renewal Date</span>
                      <span className="text-white font-medium block truncate">{customer.renewalDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing / Revenue Glass Card */}
              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <CreditCard size={13} style={{ color: "#06B6D4" }} />
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#67E8F9]">Billing Ledger</h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs text-left">
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block">Lifetime Revenue</span>
                    <span className="text-white font-bold block text-sm" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCurrency(spend)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-gray-500 font-light block flex items-center gap-1">Invoices</span>
                    <span className="text-[#A78BFA] font-bold block flex items-center gap-0.5 hover:underline cursor-pointer">
                      {customer.currentPlan !== "None" && customer.currentPlan !== "No Plan" ? "3 Generated" : "0 Generated"}
                      <ArrowUpRight size={10} />
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Action buttons */}
            <div className="p-5 border-t border-white/5 bg-zinc-950/40 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors text-center"
              >
                Close Drawer
              </button>
              
              <button
                type="button"
                onClick={onEditClick}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6EF8] hover:to-[#8B5CF6] text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors text-center flex items-center justify-center gap-1.5 shadow-lg shadow-[#8B5CF6]/25 border-none"
              >
                <Edit2 size={12} />
                Edit Profile
              </button>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export { getLifetimeSpend };
