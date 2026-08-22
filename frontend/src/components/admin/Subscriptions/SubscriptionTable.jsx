// src/components/admin/Subscriptions/SubscriptionTable.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, RefreshCw, Pause, Play, Trash2, MoreVertical, 
  Copy, Check, Calendar, ArrowRight, ShieldCheck, 
  Activity, AlertTriangle, XCircle, Heart
} from "lucide-react";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function SubscriptionTable({ 
  subscriptions = [], 
  onView, 
  onChangePlan, 
  onPause, 
  onResume, 
  onCancel 
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const menuRef = useRef(null);

  // Close actions menu dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  const getInitials = (name) => {
    if (!name) return "CU";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // 1. Renewal Countdown Calculation helper
  const calculateDaysRemaining = (renewalDateStr, status) => {
    if (status === "CANCELLED" || status === "EXPIRED") {
      return { text: "Expired", colorClass: "adm-pill-gray" };
    }
    if (!renewalDateStr) {
      return { text: "No Renewal", colorClass: "adm-pill-gray" };
    }

    const today = new Date("2026-07-26"); // Mock current system date
    const renewalDate = new Date(renewalDateStr);
    
    today.setHours(0, 0, 0, 0);
    renewalDate.setHours(0, 0, 0, 0);

    const diffTime = renewalDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: "Renewed Today", colorClass: "adm-pill-green" };
    } else if (diffDays === 1) {
      return { text: "Expires Tomorrow", colorClass: "adm-pill-red animate-pulse" };
    } else if (diffDays < 0) {
      return { text: "Expired", colorClass: "adm-pill-red" };
    } else if (diffDays <= 5) {
      return { text: `Expires in ${diffDays} Days`, colorClass: "adm-pill-amber font-bold" };
    } else {
      return { text: `Renews in ${diffDays} Days`, colorClass: "adm-pill-blue" };
    }
  };

  // 2. Health Indicator helper
  const getHealthStatus = (status, renewalDateStr) => {
    const cleanStatus = status ? status.toUpperCase() : "";
    if (cleanStatus === "CANCELLED" || cleanStatus === "EXPIRED") {
      return { label: "Cancelled", color: "text-red-500", bg: "bg-red-500/10", icon: XCircle };
    }
    if (cleanStatus === "PAST_DUE") {
      return { label: "Past Due", color: "text-amber-500", bg: "bg-amber-500/10", icon: AlertTriangle };
    }
    if (cleanStatus === "PAUSED") {
      return { label: "Needs Attention", color: "text-blue-400", bg: "bg-blue-400/10", icon: Activity };
    }

    // Active or Trial: check if it expires in <= 3 days
    if (renewalDateStr) {
      const today = new Date("2026-07-26");
      const renewalDate = new Date(renewalDateStr);
      today.setHours(0, 0, 0, 0);
      renewalDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3 && diffDays >= 0) {
        return { label: "Needs Attention", color: "text-amber-400", bg: "bg-amber-400/10", icon: AlertTriangle };
      }
    }

    return { label: "Healthy", color: "text-green-400", bg: "bg-green-400/10", icon: Heart };
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md">
      <table className="w-full text-left border-collapse min-w-[1100px] adm-table">
        <thead>
          <tr className="border-b border-white/5 bg-zinc-950/60 text-[10px] text-gray-500 uppercase font-black tracking-wider select-none">
            <th className="py-4.5 px-6">Customer</th>
            <th className="py-4.5 px-6">Plan & Cycle</th>
            <th className="py-4.5 px-6">Price</th>
            <th className="py-4.5 px-6">Status</th>
            <th className="py-4.5 px-6">Retry Info</th>
            <th className="py-4.5 px-6">Health</th>
            <th className="py-4.5 px-6">Auto Renew</th>
            <th className="py-4.5 px-6">Renewal Countdown</th>
            <th className="py-4.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <motion.tbody 
          variants={tableVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-white/5 text-xs text-gray-300"
        >
          {subscriptions.map((s) => {
            const isInactive = s.status === "CANCELLED" || s.status === "EXPIRED";
            const autoRenew = s.status !== "CANCELLED" && s.status !== "EXPIRED";
            const countdown = calculateDaysRemaining(s.renewalDate, s.status);
            const health = getHealthStatus(s.status, s.renewalDate);
            const HealthIcon = health.icon;

            return (
              <motion.tr 
                variants={rowVariants}
                key={s.id} 
                className={`group hover:bg-white/2 transition-colors cursor-pointer ${
                  isInactive ? "text-zinc-500" : "text-gray-300"
                }`}
                onClick={() => onView(s)}
              >
                {/* 1. Customer Column */}
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 text-gray-300 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-inner group-hover:border-[#8B5CF6]/50 transition-colors">
                    {getInitials(s.customerName)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold block truncate text-gray-200 group-hover:text-white transition-colors">
                      {s.customerName}
                    </span>
                    <span className="text-[10px] text-gray-500 block truncate font-mono mt-0.5">{s.customerEmail}</span>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-zinc-600 font-mono">
                      <span>ID: {s.id}</span>
                      <button 
                        type="button"
                        onClick={(e) => handleCopyId(s.id, e)}
                        className="p-0.5 hover:text-white rounded transition-colors focus:outline-none"
                        title="Copy ID"
                      >
                        {copiedId === s.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                      </button>
                    </div>
                  </div>
                </td>

                {/* 2. Plan Column */}
                <td className="py-4 px-6">
                  <span className="font-bold text-gray-200 group-hover:text-white transition-colors block">
                    {s.planName}
                  </span>
                  <span className="text-[10px] text-zinc-555 block mt-0.5 capitalize flex items-center gap-1">
                    <Calendar size={11} className="text-zinc-600" />
                    {s.billingInterval ? `${s.billingInterval}ly` : "N/A"}
                  </span>
                </td>

                {/* 3. Price Column */}
                <td className="py-4 px-6 font-bold font-mono">
                  {s.planName !== "None" ? formatCurrency(s.planPrice) : "-"}
                </td>

                {/* 4. Status Column */}
                <td className="py-4 px-6">
                  <SubscriptionStatusBadge status={s.status} />
                </td>

                {/* 5. Retry Info Column */}
                <td className="py-4 px-6">
                  {s.status === "PAST_DUE" || s.status === "past_due" ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-amber-400 font-bold">
                        Attempt {s.retryAttempt || 1}/{s.maxAttempts || 3}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        Next: {s.nextRetryDate ? new Date(s.nextRetryDate).toLocaleDateString() : "Pending"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-600">—</span>
                  )}
                </td>

                {/* 5. Health Status */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${health.color} ${health.bg} border-current/10`}>
                    <HealthIcon size={12} className="shrink-0" />
                    {health.label}
                  </span>
                </td>

                {/* 6. Auto Renew */}
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                    autoRenew 
                      ? "text-green-500 bg-green-500/10 border-green-500/20" 
                      : "text-zinc-500 bg-zinc-900 border-zinc-800"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${autoRenew ? "bg-green-500" : "bg-zinc-600"}`} />
                    {autoRenew ? "Enabled" : "Disabled"}
                  </span>
                </td>

                {/* 7. Days Remaining / Countdown */}
                <td className="py-4 px-6">
                  <span className={`adm-pill ${countdown.colorClass} select-none`}>
                    {countdown.text}
                  </span>
                  {s.renewalDate && (
                    <span className="text-[9px] text-zinc-500 block font-mono mt-1">
                      {s.renewalDate}
                    </span>
                  )}
                </td>

                {/* 8. Actions Dropdown */}
                <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onView(s)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                      title="Quick View"
                    >
                      <Eye size={14} />
                    </button>
                    
                    <div className="relative" ref={activeMenuId === s.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(s.id, e)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {activeMenuId === s.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 mt-1 w-38 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-1.5 z-40 text-left origin-top-right"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onView(s);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-medium flex items-center gap-1.5"
                            >
                              <Eye size={12} />
                              View Details
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onChangePlan(s);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-medium flex items-center gap-1.5"
                            >
                              <RefreshCw size={12} />
                              Change Plan
                            </button>

                            {/* PAUSE / RESUME */}
                            {(s.status === "ACTIVE" || s.status === "TRIAL") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onPause(s.id);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold flex items-center gap-1.5"
                              >
                                <Pause size={12} />
                                Pause
                              </button>
                            )}

                            {s.status === "PAUSED" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onResume(s.id);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold flex items-center gap-1.5"
                              >
                                <Play size={12} />
                                Resume
                              </button>
                            )}

                            {/* CANCEL */}
                            {!isInactive && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onCancel(s);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold border-t border-white/5 mt-1 pt-1.5 flex items-center gap-1.5"
                              >
                                <Trash2 size={12} />
                                Cancel Sub
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}
