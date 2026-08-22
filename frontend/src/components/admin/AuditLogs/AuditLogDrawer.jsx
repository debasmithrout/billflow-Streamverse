// src/components/admin/AuditLogs/AuditLogDrawer.jsx
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Copy, Check, Shield, Clock, User, Globe, Monitor,
  Activity, CheckCircle2, AlertTriangle, XCircle, Info,
  ShieldAlert, Lock, Settings, CreditCard, FileText, RefreshCw,
  BarChart2, Users
} from "lucide-react";
import AuditSeverityBadge from "./AuditSeverityBadge";

function getModuleIcon(module) {
  const m = (module || "").toLowerCase();
  if (m === "customers")     return Users;
  if (m === "payments")      return CreditCard;
  if (m === "subscriptions") return Activity;
  if (m === "invoices")      return FileText;
  if (m === "refunds")       return RefreshCw;
  if (m === "settings")      return Settings;
  if (m === "auth")          return Lock;
  if (m === "security")      return Shield;
  if (m === "analytics")     return BarChart2;
  return Activity;
}

function getActionTimeline(action = "", module = "") {
  const a = action.toLowerCase();
  const m = module.toLowerCase();
  const steps = [];

  // Build timeline from action context
  if (m === "auth" || a.includes("login") || a.includes("auth"))
    steps.push({ label: "Authentication Attempt", icon: Lock,        done: true });
  if (a.includes("creat") || a.includes("subscri"))
    steps.push({ label: "Record Created",         icon: CheckCircle2, done: true });
  if (a.includes("updat") || a.includes("modif"))
    steps.push({ label: "Record Modified",        icon: Settings,     done: true });
  if (a.includes("pay"))
    steps.push({ label: "Payment Processed",      icon: CreditCard,   done: true });
  if (a.includes("invoice"))
    steps.push({ label: "Invoice Generated",      icon: FileText,     done: true });
  if (a.includes("refund"))
    steps.push({ label: "Refund Requested",       icon: RefreshCw,    done: true });
  if (a.includes("delet") || a.includes("remov"))
    steps.push({ label: "Record Deleted",         icon: XCircle,      done: true });
  if (a.includes("fail") || a.includes("error"))
    steps.push({ label: "Action Failed",          icon: AlertTriangle, done: true, isError: true });

  // Always add event logged at end
  steps.push({ label: "Event Logged",             icon: Shield,       done: true });

  return steps.length > 1 ? steps : [
    { label: "Action Initiated", icon: Activity,    done: true },
    { label: "Event Logged",     icon: Shield,      done: true }
  ];
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(String(value || "")).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-900 hover:bg-[#8B5CF6]/10 border border-white/5 hover:border-[#8B5CF6]/30 text-zinc-400 hover:text-[#8B5CF6] rounded-lg cursor-pointer focus:outline-none transition-all text-[10px] font-bold"
    >
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
      {copied ? "Copied" : label}
    </button>
  );
}

export default function AuditLogDrawer({ isOpen, log, onClose }) {
  const drawerRef = useRef(null);

  useEffect(() => {
    function handleKey(e) { if (e.key === "Escape" && isOpen) onClose(); }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) onClose();
    }
    const handler = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 100);
    return () => { clearTimeout(handler); document.removeEventListener("mousedown", handleClickOutside); };
  }, [isOpen, onClose]);

  const timeline = log ? getActionTimeline(log.action, log.module) : [];
  const ModIcon  = log ? getModuleIcon(log.module) : Activity;

  const jsonPayload = log ? JSON.stringify({
    id: log.id, action: log.action, module: log.module,
    severity: log.severity, performedBy: log.performedBy,
    timestamp: log.timestamp, description: log.description
  }, null, 2) : "";

  return (
    <AnimatePresence>
      {isOpen && log && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Audit Log Details">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative w-full max-w-[460px] h-full bg-[#0a0a10] border-l border-white/8 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 bg-[#0d0d14] flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center shrink-0">
                  <ModIcon size={18} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{log.action}</h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Event #{log.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-all shrink-0"
                aria-label="Close drawer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">

              {/* Core Metadata */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Event Details</h4>
                {[
                  { label: "Module",       value: log.module,      icon: ModIcon },
                  { label: "Severity",     value: null,            badge: true   },
                  { label: "Performed By", value: log.performedBy, icon: User    },
                  { label: "IP Address",   value: log.ip_address || log.ipAddress || "192.168.1.1", icon: Globe },
                  { label: "Timestamp",    value: log.timestamp ? new Date(log.timestamp).toLocaleString() : "—", icon: Clock }
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                      {row.icon && <row.icon size={11} />}
                      {row.label}
                    </span>
                    {row.badge
                      ? <AuditSeverityBadge severity={log.severity} />
                      : <span className="text-white text-[11px] font-semibold text-right">{row.value || "—"}</span>
                    }
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-2">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Description</h4>
                <p className="text-[11px] text-zinc-300 leading-relaxed">{log.description || "No description recorded."}</p>
              </div>

              {/* Activity Timeline */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Activity Timeline</h4>
                <div className="space-y-0 pl-1">
                  {timeline.map((step, i) => {
                    const StepIcon = step.icon;
                    const isLast = i === timeline.length - 1;
                    return (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                            step.isError
                              ? "bg-red-500/10 border-red-500/20 text-red-400"
                              : isLast
                              ? "bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#8B5CF6]"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}>
                            <StepIcon size={11} />
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-white/5 my-1 min-h-[16px]" />}
                        </div>
                        <div className="pb-3 pt-0.5 min-w-0">
                          <span className="text-[11px] text-white font-semibold block">{step.label}</span>
                          {isLast && (
                            <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                              {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Info */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Session Information</h4>
                {[
                  { label: "Browser",   value: "Chrome / Chromium", icon: Monitor },
                  { label: "OS",        value: "Web Platform",       icon: Globe   },
                  { label: "Session",   value: `sess_${String(log.id).padStart(6, "0")}`, icon: Shield }
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                      <row.icon size={11} /> {row.label}
                    </span>
                    <span className="text-white text-[11px] font-mono">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Quick Actions */}
            <div className="p-5 border-t border-white/5 bg-[#0d0d14] flex flex-wrap gap-2 shrink-0">
              <CopyButton value={log.id}     label="Copy ID"   />
              <CopyButton value={jsonPayload} label="Copy JSON" />
              <button
                type="button"
                onClick={onClose}
                className="ml-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-zinc-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
