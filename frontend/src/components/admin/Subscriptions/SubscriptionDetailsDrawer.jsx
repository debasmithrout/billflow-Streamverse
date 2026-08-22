// src/components/admin/Subscriptions/SubscriptionDetailsDrawer.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Globe, Phone, Calendar, ArrowRight, CheckCircle2,
  Heart, AlertTriangle, XCircle, Activity, ShieldCheck, DollarSign,
  Clock, CreditCard, RefreshCw, Pause, Play, Trash2
} from "lucide-react";
import { getCustomerById } from "../../../services/adminService";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function SubscriptionDetailsDrawer({ 
  isOpen, 
  subscription, 
  onClose, 
  onChangePlan, 
  onPause, 
  onResume, 
  onCancel 
}) {
  const drawerRef = useRef(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loadingCust, setLoadingCust] = useState(false);

  // Close drawer if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    }
    const handler = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(handler);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Load customer metadata dynamically based on customerId
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!subscription) return;
      try {
        setLoadingCust(true);
        const data = await getCustomerById(subscription.customerId);
        setCustomerInfo(data);
      } catch (err) {
        console.error("Error fetching customer for subscription drawer:", err);
      } finally {
        setLoadingCust(false);
      }
    };
    if (isOpen) {
      fetchCustomerDetails();
    }
  }, [subscription, isOpen]);

  if (!subscription) return null;

  const isInactive = subscription.status === "CANCELLED" || subscription.status === "EXPIRED";
  const autoRenew = subscription.status !== "CANCELLED" && subscription.status !== "EXPIRED";

  // Health Status Score helper
  const getHealthStatus = (status, renewalDateStr) => {
    const cleanStatus = status ? status.toUpperCase() : "";
    if (cleanStatus === "CANCELLED" || cleanStatus === "EXPIRED") {
      return { label: "Cancelled", score: "0/100", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", desc: "Access revoked, no upcoming billing." };
    }
    if (cleanStatus === "PAST_DUE") {
      return { label: "Past Due", score: "20/100", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", desc: "Payment failed. Attempting retries." };
    }
    if (cleanStatus === "PAUSED") {
      return { label: "Paused", score: "60/100", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", desc: "Billing paused by administrator." };
    }

    if (renewalDateStr) {
      const today = new Date("2026-07-26");
      const renewalDate = new Date(renewalDateStr);
      today.setHours(0, 0, 0, 0);
      renewalDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3 && diffDays >= 0) {
        return { label: "At Risk", score: "50/100", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", desc: "Upcoming renewal with risk of failure." };
      }
    }

    return { label: "Healthy", score: "98/100", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", desc: "Subscription active with regular renewals." };
  };

  const health = getHealthStatus(subscription.status, subscription.renewalDate);

  // Format dates nicely
  const formatDate = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return isoString;
    }
  };

  // Generate mock timeline events based on real dates
  const timelineEvents = [
    {
      title: "Subscription Created",
      desc: `Registered on ${formatDate(subscription.created_at || "2026-06-26")}`,
      date: formatDate(subscription.created_at || "2026-06-26"),
      icon: Clock,
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    }
  ];

  if (subscription.status === "TRIAL") {
    timelineEvents.push({
      title: "Trial Period Started",
      desc: `Trial ends on ${formatDate(subscription.trialEndDate)}`,
      date: formatDate(subscription.created_at || "2026-06-26"),
      icon: ShieldCheck,
      color: "text-red-400",
      bg: "bg-red-500/10"
    });
  } else {
    timelineEvents.push({
      title: "Payment Received",
      desc: `Paid amount of ${formatCurrency(subscription.planPrice)}`,
      date: formatDate(subscription.created_at || "2026-06-26"),
      icon: DollarSign,
      color: "text-green-400",
      bg: "bg-green-500/10"
    });
    timelineEvents.push({
      title: "Subscription Activated",
      desc: `Status set to Active on ${formatDate(subscription.created_at || "2026-06-26")}`,
      date: formatDate(subscription.created_at || "2026-06-26"),
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10"
    });
  }

  if (subscription.status === "PAUSED") {
    timelineEvents.push({
      title: "Billing Paused",
      desc: "Administratively paused subscription billing.",
      date: "Just Now",
      icon: Pause,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    });
  } else if (subscription.status === "CANCELLED") {
    timelineEvents.push({
      title: "Subscription Cancelled",
      desc: "Auto-renew disabled and plan cancelled.",
      date: "Just Now",
      icon: Trash2,
      color: "text-red-500",
      bg: "bg-red-500/10"
    });
  } else if (subscription.renewalDate) {
    timelineEvents.push({
      title: "Upcoming Renewal",
      desc: `Renewal scheduled at ${formatDate(subscription.renewalDate)}`,
      date: formatDate(subscription.renewalDate),
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    });
  }

  // Generate some dummy invoice entries matching customer and price
  const invoiceHistory = [
    { id: `inv_0${subscription.id}3`, date: "26 Jun, 2026", status: "PAID", amount: subscription.planPrice },
    { id: `inv_0${subscription.id}2`, date: "26 May, 2026", status: "PAID", amount: subscription.planPrice },
    { id: `inv_0${subscription.id}1`, date: "26 Apr, 2026", status: "PAID", amount: subscription.planPrice }
  ].filter(() => subscription.planName !== "None" && subscription.status !== "TRIAL");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-xs"
          />

          {/* Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            ref={drawerRef}
            className="relative w-full max-w-md h-full bg-[#050507] border-l border-white/10 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#08080a]">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Subscription Workspace</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">SUB_ID: {subscription.id}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable details container */}
            <div className="flex-1 p-6 space-y-7 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              
              {/* Subscriber Information */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Subscriber Details
                </h4>
                
                {loadingCust ? (
                  <div className="space-y-2 animate-pulse py-2 bg-zinc-900/10 p-4 rounded-2xl border border-white/5">
                    <div className="h-4 bg-zinc-800 rounded-lg w-2/3" />
                    <div className="h-3 bg-zinc-900 rounded-lg w-1/2" />
                    <div className="h-3 bg-zinc-900 rounded-lg w-1/3" />
                  </div>
                ) : customerInfo ? (
                  <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
                        {customerInfo.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-white font-bold block">{customerInfo.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{customerInfo.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-1 font-medium text-zinc-300">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light flex items-center gap-1.5"><Globe size={13} /> Country</span>
                        <span>{customerInfo.country}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light flex items-center gap-1.5"><Phone size={13} /> Phone</span>
                        <span>{customerInfo.phone_number || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-red-400 bg-red-500/5 p-3.5 border border-red-500/10 rounded-2xl">Could not retrieve customer metadata from administrative endpoints.</p>
                )}
              </div>

              {/* Health Score Widget */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Subscription Health
                </h4>
                <div className={`p-4 rounded-2xl bg-[#121218]/45 border ${health.border} flex items-center justify-between`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-black uppercase ${health.color}`}>{health.label}</span>
                      <span className="text-[10px] text-zinc-500">({health.score} Score)</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-light block leading-relaxed">{health.desc}</span>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${health.bg} border border-white/5`}>
                    <Heart size={18} className={health.color} />
                  </div>
                </div>
              </div>

              {/* Plan Information & Meta */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Plan Details
                </h4>

                <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Current Plan</span>
                    <span className="text-white font-black text-sm">{subscription.planName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Status</span>
                    <SubscriptionStatusBadge status={subscription.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Billing Interval</span>
                    <span className="text-white font-medium capitalize">{subscription.billingInterval ? `${subscription.billingInterval}ly` : "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Auto Renew</span>
                    <span className={`font-bold ${autoRenew ? "text-green-400" : "text-zinc-500"}`}>
                      {autoRenew ? "Active (Yes)" : "Disabled (No)"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Price / Cost</span>
                    <span className="text-white font-bold font-mono">{formatCurrency(subscription.planPrice)}</span>
                  </div>
                  {subscription.trialEndDate && subscription.status === "TRIAL" && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-light">Trial Ends</span>
                      <span className="text-red-400 font-bold font-mono">{formatDate(subscription.trialEndDate)}</span>
                    </div>
                  )}
                  {subscription.renewalDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-light">Renewal Date</span>
                      <span className="text-white font-semibold font-mono">{formatDate(subscription.renewalDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chronological Lifecycle Timeline */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Lifecycle Timeline
                </h4>
                <div className="space-y-0.5 pl-2">
                  {timelineEvents.map((ev, index) => {
                    const EvIcon = ev.icon;
                    return (
                      <div key={index} className="adm-timeline-item">
                        <div className={`w-8 h-8 rounded-xl ${ev.bg} border border-white/5 flex items-center justify-center shrink-0 z-10`}>
                          <EvIcon size={14} className={ev.color} />
                        </div>
                        <div className="pt-0.5 text-xs">
                          <span className="text-white font-bold block">{ev.title}</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5 leading-relaxed">{ev.desc}</span>
                          <span className="text-[9px] text-zinc-600 font-mono mt-1 block">{ev.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment & Invoicing History */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Billing Ledger
                </h4>
                {invoiceHistory.length > 0 ? (
                  <div className="space-y-2.5">
                    {invoiceHistory.map((inv) => (
                      <div key={inv.id} className="flex justify-between items-center p-3 rounded-xl bg-zinc-900/30 border border-white/5 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <CreditCard size={13} className="text-zinc-500" />
                          <div className="text-[11px]">
                            <span className="text-white font-bold block">{inv.id}</span>
                            <span className="text-zinc-500 font-light mt-0.5 block">{inv.date}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold block">{formatCurrency(inv.amount)}</span>
                          <span className="text-green-500 text-[10px] font-black uppercase block tracking-wider mt-0.5">Paid</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic p-4 bg-zinc-900/10 border border-white/5 rounded-2xl text-center">No invoices issued for this subscription yet.</p>
                )}
              </div>

            </div>

            {/* Drawer Action Controls Panel */}
            <div className="p-6 border-t border-white/5 bg-[#08080a] flex flex-col gap-3 shrink-0">
              <div className="grid grid-cols-2 gap-3.5">
                {/* PAUSE / RESUME ACTION */}
                {(subscription.status === "ACTIVE" || subscription.status === "TRIAL") && (
                  <button
                    type="button"
                    onClick={() => onPause(subscription.id)}
                    className="py-2.5 bg-blue-650/15 hover:bg-blue-650/20 text-blue-500 border border-blue-500/10 rounded-xl text-xs font-bold cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Pause size={12} />
                    Pause Billing
                  </button>
                )}

                {subscription.status === "PAUSED" && (
                  <button
                    type="button"
                    onClick={() => onResume(subscription.id)}
                    className="py-2.5 bg-green-600/10 hover:bg-green-600/20 text-green-500 border border-green-500/10 rounded-xl text-xs font-bold cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play size={12} />
                    Resume Billing
                  </button>
                )}

                {/* CHANGE PLAN ACTION */}
                <button
                  type="button"
                  onClick={() => onChangePlan(subscription)}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Change Plan
                </button>
              </div>

              <div className="flex gap-3 w-full">
                {/* CANCEL ACTION */}
                {!isInactive ? (
                  <button
                    type="button"
                    onClick={() => onCancel(subscription)}
                    className="w-full py-2.5 bg-red-650/10 hover:bg-red-650/20 text-red-500 border border-red-500/10 rounded-xl text-xs font-bold cursor-pointer focus:outline-none transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    Cancel Subscription
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors text-center"
                  >
                    Close Drawer
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
