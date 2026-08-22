import { useEffect, useState, useCallback, useRef } from "react";
import { useAdminTheme } from "../../context/AdminThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  getAdminRefunds,
  approveRefund,
  rejectRefund,
  getCustomers,
  getInvoices,
  getAuditLogs
} from "../../services/adminService";
import { formatCurrency } from "../../utils/currencyFormatter";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast  from "../../hooks/useToast";
import useModal  from "../../hooks/useModal";
import {
  RefreshCw, Download, Search, Filter, X, Copy, Check,
  ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle,
  Clock, MoreVertical, User, FileText, CreditCard, AlertTriangle,
  DollarSign, TrendingUp, TrendingDown, Activity, BarChart2,
  ShieldCheck, Sparkles, ArrowUpRight
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:    { cls: "text-amber-400 bg-amber-500/10 border-amber-500/25",   dot: "bg-amber-400"    },
  APPROVED:   { cls: "text-blue-400  bg-blue-500/10  border-blue-500/25",    dot: "bg-blue-400"     },
  PROCESSING: { cls: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",dot: "bg-indigo-400"   },
  COMPLETED:  { cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",dot: "bg-emerald-400"},
  REJECTED:   { cls: "text-red-400   bg-red-500/10   border-red-500/25",     dot: "bg-red-400"      },
  FAILED:     { cls: "text-zinc-400  bg-zinc-800/60  border-zinc-700/30",    dot: "bg-zinc-400"     }
};

function getStatusCfg(status) {
  return STATUS_CONFIG[(status || "").toUpperCase()] || STATUS_CONFIG.FAILED;
}

function StatusBadge({ status }) {
  const cfg = getStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
      {status || "Unknown"}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return "—"; }
}

function getInitials(name) {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0].substring(0, 2).toUpperCase() : (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function getAvatarColor(name) {
  const colors = [
    "bg-[#8B5CF6]/20 text-[#8B5CF6] border-[#8B5CF6]/30",
    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "bg-red-500/20 text-red-400 border-red-500/30"
  ];
  return colors[(name || "a").charCodeAt(0) % colors.length];
}

// ── Sparkline ─────────────────────────────────────────────────────────────
function Sparkline({ points, color }) {
  const w = 80, h = 22;
  const max = Math.max(...points, 1), min = Math.min(...points);
  const range = max - min || 1;
  const pts = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / range) * (h - 4) - 2
  }));
  const pathD = pts.reduce((a, p, i) => i === 0 ? `M${p.x} ${p.y}` : `${a} L${p.x} ${p.y}`, "");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible select-none pointer-events-none">
      <path d={`${pathD} L${w} ${h} L0 ${h} Z`} fill={color} fillOpacity="0.15" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ title, value, desc, icon: Icon, color, points, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 120 }}
      whileHover={{ y: -3 }}
      className="adm-stat-card-purple"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569]">{title}</span>
        <div className="adm-icon-box-lg" style={{ background: `${color}18`, border: `1px solid ${color}35`, boxShadow: `0 8px 24px ${color}10` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <span className="text-[26px] font-black text-white font-mono block mb-2">{value}</span>
      <div className="flex items-end justify-between pt-1">
        <p className="text-[10px] text-[#334155]">{desc}</p>
        <Sparkline points={points} color={color} />
      </div>
    </motion.div>
  );
}

// ── Refund Details Drawer ─────────────────────────────────────────────────
function RefundDrawer({ isOpen, refund, customer, invoice, auditLogs, loadingAudit, onClose, onApprove, onReject, processingId }) {
  const drawerRef = useRef(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape" && isOpen) onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    function onOutside(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target) && isOpen) onClose();
    }
    const t = setTimeout(() => document.addEventListener("mousedown", onOutside), 100);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", onOutside); };
  }, [isOpen, onClose]);

  if (!isOpen || !refund) return null;

  const isPending   = (refund.status || "").toUpperCase() === "PENDING";
  const isProcessing = processingId === refund.id;
  const amount = parseFloat(refund.amount || 0).toFixed(2);

  const TIMELINE_STEPS = [
    { label: "Refund Requested",   done: true,  icon: Clock         },
    { label: "Under Review",       done: true,  icon: Activity      },
    { label: "Approved",           done: ["APPROVED","COMPLETED","PROCESSING"].includes((refund.status||"").toUpperCase()), icon: CheckCircle2 },
    { label: "Rejected",           done: (refund.status||"").toUpperCase() === "REJECTED", isError: true, icon: XCircle },
    { label: "Refund Processed",   done: (refund.status||"").toUpperCase() === "COMPLETED", icon: ShieldCheck },
    { label: "Notification Sent",  done: (refund.status||"").toUpperCase() === "COMPLETED", icon: Sparkles   }
  ].filter(s => !(s.label === "Rejected" && !s.done));

  const copyId = () => {
    navigator.clipboard.writeText(String(refund.id)).catch(() => {});
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm"
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
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 flex items-center justify-center">
              <RefreshCw size={18} className="text-[#8B5CF6]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Refund Request</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-zinc-500 font-mono">#{refund.id}</span>
                <button type="button" onClick={copyId} className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer">
                  {copiedId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close drawer"
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">

          {/* Amount + Status Hero */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Refund Amount</span>
              <span className="text-2xl font-black text-white font-mono">₹{amount}</span>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-2">
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Status</span>
              <StatusBadge status={refund.status} />
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Customer</h4>
            {customer ? (
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[11px] border shrink-0 ${getAvatarColor(customer.name)}`}>
                  {getInitials(customer.name)}
                </div>
                <div>
                  <span className="text-white font-bold text-sm block">{customer.name}</span>
                  <span className="text-zinc-500 text-[11px] block">{customer.email}</span>
                  <span className="text-zinc-600 text-[10px] font-mono block">ID #{refund.customer_id}</span>
                </div>
              </div>
            ) : (
              <span className="text-zinc-500 text-xs">Customer #{refund.customer_id}</span>
            )}
          </div>

          {/* Request Info */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Request Information</h4>
            </div>
            {[
              { label: "Invoice",     value: invoice?.invoiceNumber || "—", icon: FileText    },
              { label: "Payment ID",  value: refund.payment_id || "—",      icon: CreditCard  },
              { label: "Requested",   value: formatDate(refund.created_at), icon: Clock       },
              { label: "Processed",   value: refund.processed_at ? formatDate(refund.processed_at) : "—", icon: CheckCircle2 }
            ].map((r, i) => (
              <div key={i} className="px-4 py-3 flex items-center justify-between border-b border-white/5 last:border-0">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <r.icon size={11} /> {r.label}
                </span>
                <span className="text-white text-[11px] font-mono font-semibold">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Reason + Admin Notes */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Notes</h4>
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Customer Reason</span>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/50 border border-white/5 rounded-lg p-3">
                {refund.reason || "No reason provided."}
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Admin Notes</span>
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/50 border border-white/5 rounded-lg p-3">
                {refund.admin_notes || "No admin notes recorded."}
              </p>
            </div>
          </div>

          {/* Processing Timeline */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Processing Timeline</h4>
            <div className="space-y-0 pl-1">
              {TIMELINE_STEPS.map((step, i) => {
                const StepIcon = step.icon;
                const isLast = i === TIMELINE_STEPS.length - 1;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        step.done
                          ? step.isError
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-[#8B5CF6]/15 border-[#8B5CF6]/30 text-[#8B5CF6]"
                          : "bg-zinc-800/60 border-zinc-700/30 text-zinc-600"
                      }`}>
                        <StepIcon size={11} />
                      </div>
                      {!isLast && <div className="w-px flex-1 bg-white/5 my-1 min-h-[14px]" />}
                    </div>
                    <div className="pb-3 pt-0.5">
                      <span className={`text-[11px] font-semibold block ${step.done ? "text-white" : "text-zinc-600"}`}>
                        {step.label}
                      </span>
                      {step.done && isLast && (
                        <span className="text-[9px] text-zinc-500 font-mono">
                          {refund.processed_at ? new Date(refund.processed_at).toLocaleString() : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Audit Logs Timeline */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#8B5CF6]">Audit Log History</h4>
            {loadingAudit ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-zinc-800/40 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No audit entries found for this refund.</p>
            ) : (
              <div className="space-y-2">
                {auditLogs.map((log, i) => (
                  <div key={log.id || i} className="p-3 bg-zinc-950/50 border border-white/5 rounded-lg space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-white">{log.action}</span>
                      <span className="text-[9px] text-zinc-600 font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ""}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed">{log.description || log.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/5 bg-[#0d0d14] space-y-3 shrink-0">
          {isPending && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={(e) => { e.stopPropagation(); onApprove(refund, e); }}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-black text-white rounded-xl cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={13} /> Approve
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={(e) => { e.stopPropagation(); onReject(refund, e); }}
                className="py-2.5 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 text-xs font-black text-white rounded-xl cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle size={13} /> Reject
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-zinc-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Refund Insights Widget ─────────────────────────────────────────────────
function RefundInsightsPanel({ refunds }) {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";
  const total     = refunds.length || 1;
  const approved  = refunds.filter(r => ["APPROVED","COMPLETED"].includes((r.status||"").toUpperCase())).length;
  const rejected  = refunds.filter(r => (r.status||"").toUpperCase() === "REJECTED").length;
  const totalAmt  = refunds.filter(r => ["APPROVED","COMPLETED"].includes((r.status||"").toUpperCase()))
    .reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const approvalRate  = ((approved / total) * 100).toFixed(0);
  const rejectionRate = ((rejected / total) * 100).toFixed(0);

  // Reason distribution
  const reasonMap = {};
  refunds.forEach(r => {
    const k = (r.reason || "Other").substring(0, 40);
    reasonMap[k] = (reasonMap[k] || 0) + 1;
  });
  const topReasons = Object.entries(reasonMap)
    .sort((a, b) => b[1] - a[1]).slice(0, 4);

  const COLORS = ["#8B5CF6","#10B981","#F59E0B","#EF4444"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Approval Rate Gauge */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block">Approval Intelligence</span>
        <h4 className="text-sm font-bold text-white mt-0.5 mb-4">Approval vs Rejection Rate</h4>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 140 140" className="w-full h-full">
              <circle cx="70" cy="70" r="52" fill="none" stroke="#1e1e2e" strokeWidth="14" />
              <circle cx="70" cy="70" r="52" fill="none" stroke="#8B5CF6" strokeWidth="14"
                strokeDasharray={`${2*Math.PI*52}`}
                strokeDashoffset={`${2*Math.PI*52 * (1 - approvalRate/100)}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
                className="transition-all duration-700"
              />
              <text x="70" y="64" textAnchor="middle" fontSize="20" fontWeight="900" fill="#111827" fontFamily="monospace">{approvalRate}%</text>
              <text x="70" y="82" textAnchor="middle" fontSize="9" fill="#374151" fontFamily="sans-serif">APPROVED</text>
            </svg>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
          <div className="text-center">
            <span className="text-[#8B5CF6] font-black font-mono text-lg block">{approvalRate}%</span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Approval Rate</span>
          </div>
          <div className="text-center">
            <span className="text-red-400 font-black font-mono text-lg block">{rejectionRate}%</span>
            <span className="text-[9px] text-zinc-500 uppercase tracking-wider">Rejection Rate</span>
          </div>
        </div>
      </div>

      {/* Top Refund Reasons */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block">Reason Analytics</span>
        <h4 className="text-sm font-bold text-white mt-0.5 mb-4">Top Refund Reasons</h4>
        {topReasons.length === 0 ? (
          <p className="text-xs text-zinc-500 italic text-center py-6">No reasons recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {topReasons.map(([reason, count], i) => {
              const pct = ((count / total) * 100).toFixed(0);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-zinc-300 font-medium truncate max-w-[160px]">{reason}</span>
                    <span className="font-black font-mono" style={{ color: COLORS[i] }}>{count}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: COLORS[i] }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
        <span className="text-[10px] uppercase font-black tracking-wider text-zinc-500 block">Financial Impact</span>
        <h4 className="text-sm font-bold text-white">Refund Economics</h4>
        {[
          { label: "Total Refunded",   value: formatCurrency(totalAmt), color: "text-emerald-400", icon: DollarSign  },
          { label: "Total Requests",   value: String(total),             color: "text-white",       icon: Activity    },
          { label: "Avg Refund Value", value: formatCurrency(totalAmt / Math.max(approved, 1)), color: "text-[#8B5CF6]", icon: BarChart2 },
          { label: "Pending Review",   value: String(refunds.filter(r => (r.status||"").toUpperCase() === "PENDING").length), color: "text-amber-400", icon: Clock }
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/30 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden"
                  style={{
                    backgroundColor: isLight ? "#F3F4F6" : "rgba(39, 39, 42, 0.6)",
                    borderColor: isLight ? "#E2E8F0" : "rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={2.2}
                    className="w-5 h-5 text-gray-700 dark:text-gray-300 overflow-visible"
                    style={{
                      color: isLight ? "#374151" : "#6B7280"
                    }}
                  />
                </div>
                <span className="text-[11px] text-zinc-400">{item.label}</span>
              </div>
              <span className={`text-sm font-black font-mono ${item.color}`}>{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────
export default function Refunds() {
  const { showToast }   = useToast();
  const { showConfirm } = useModal();

  const [refunds,       setRefunds]       = useState([]);
  const [customersMap,  setCustomersMap]  = useState({});
  const [invoicesMap,   setInvoicesMap]   = useState({});
  const [loading,       setLoading]       = useState(true);
  const [isRefreshing,  setIsRefreshing]  = useState(false);
  const [refreshCount,  setRefreshCount]  = useState(0);
  const [processingId,  setProcessingId]  = useState(null);

  // Filters
  const [searchQuery,   setSearchQuery]   = useState("");
  const [statusFilter,  setStatusFilter]  = useState("All");
  const [sortField,     setSortField]     = useState("newest");

  // Drawer
  const [selectedRefund,    setSelectedRefund]    = useState(null);
  const [isDrawerOpen,      setIsDrawerOpen]      = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionNotes,    setRejectionNotes]    = useState("");
  const [rejectionError,    setRejectionError]    = useState("");
  const [drawerAuditLogs,   setDrawerAuditLogs]   = useState([]);
  const [loadingAudit,      setLoadingAudit]      = useState(false);

  // Pagination
  const [currentPage,  setCurrentPage]  = useState(1);
  const PAGE_SIZE = 10;

  // ── Fetch core data ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isSilent = refreshCount > 0;
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);

        const [refundsData, customersData, invoicesData] = await Promise.all([
          getAdminRefunds(),
          getCustomers({ limit: 1000 }).catch(() => ({ customers: [] })),
          getInvoices({ limit: 1000 }).catch(() => ({ invoices: [] }))
        ]);

        const cMap = {};
        (customersData?.customers || []).forEach(c => { cMap[c.id] = c; });
        setCustomersMap(cMap);

        const iMap = {};
        (invoicesData?.invoices || []).forEach(inv => { iMap[inv.id] = inv; });
        setInvoicesMap(iMap);

        setRefunds(refundsData || []);
      } catch (err) {
        console.error("Failed to load admin refunds registry:", err);
        showToast("Error loading refunds.", "error");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };
    fetchData();
  }, [refreshCount]);

  // ── Load audit logs for selected drawer ─────────────────────────────────
  useEffect(() => {
    const loadAuditLogs = async () => {
      if (!selectedRefund || !isDrawerOpen) return;
      try {
        setLoadingAudit(true);
        const logsRes = await getAuditLogs({ search: `Refund #${selectedRefund.id}` });
        setDrawerAuditLogs(logsRes.logs || []);
      } catch (err) {
        console.error("Failed to load audit logs for drawer:", err);
      } finally {
        setLoadingAudit(false);
      }
    };
    loadAuditLogs();
  }, [selectedRefund, isDrawerOpen]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setRefreshCount(p => p + 1);
    window.dispatchEvent(new Event("refund_state_updated"));
    showToast("Refund data refreshed.", "success");
  };

  // ── Approve / Reject (backend unchanged) ─────────────────────────────────
  const handleApproveClick = (refund, e) => {
    e?.stopPropagation();
    showConfirm({
      title: "Approve Refund?",
      description: `Approve the refund of ₹${parseFloat(refund.amount).toFixed(2)} for this customer? This will settle with the payment gateway.`,
      confirmText: "Approve Refund",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          setProcessingId(refund.id);
          await approveRefund(refund.id, "Approved via Admin Refunds Dashboard");
          showToast("Refund approved successfully.", "success");
          handleRefresh();
        } catch (err) {
          showToast(err?.response?.data?.detail || "Error approving refund.", "error");
        } finally {
          setProcessingId(null);
        }
      }
    });
  };

  const handleRejectClick = (refund, e) => {
    e?.stopPropagation();
    setSelectedRefund(refund);
    setRejectionNotes("");
    setRejectionError("");
    setIsRejectModalOpen(true);
  };

  const submitRejection = async () => {
    if (!rejectionNotes.trim()) { setRejectionError("Administrative notes are mandatory for rejections."); return; }
    if (rejectionNotes.trim().length < 5) { setRejectionError("Rejection notes must be at least 5 characters."); return; }
    try {
      setProcessingId(selectedRefund.id);
      setIsRejectModalOpen(false);
      await rejectRefund(selectedRefund.id, rejectionNotes);
      showToast("Refund request rejected.", "success");
      handleRefresh();
    } catch (err) {
      showToast(err?.response?.data?.detail || "Error rejecting refund.", "error");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Filter + Sort ─────────────────────────────────────────────────────────
  const filtered = refunds.filter(ref => {
    const cust   = customersMap[ref.customer_id];
    const inv    = invoicesMap[ref.invoice_id];
    const q      = searchQuery.toLowerCase();
    const matchQ = !q ||
      String(ref.id).includes(q) ||
      (cust?.name || "").toLowerCase().includes(q) ||
      (cust?.email || "").toLowerCase().includes(q) ||
      (inv?.invoiceNumber || "").toLowerCase().includes(q) ||
      String(ref.payment_id || "").includes(q) ||
      (ref.reason || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "All" || (ref.status || "").toUpperCase() === statusFilter;
    return matchQ && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "newest") return new Date(b.created_at) - new Date(a.created_at);
    if (sortField === "oldest") return new Date(a.created_at) - new Date(b.created_at);
    if (sortField === "amount_high") return parseFloat(b.amount || 0) - parseFloat(a.amount || 0);
    if (sortField === "amount_low")  return parseFloat(a.amount || 0) - parseFloat(b.amount || 0);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE) || 1;
  const paginated  = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── KPI stats ─────────────────────────────────────────────────────────────
  const totalCount    = refunds.length;
  const pendingCount  = refunds.filter(r => (r.status||"").toUpperCase() === "PENDING").length;
  const approvedCount = refunds.filter(r => ["APPROVED","COMPLETED"].includes((r.status||"").toUpperCase())).length;
  const rejectedCount = refunds.filter(r => (r.status||"").toUpperCase() === "REJECTED").length;
  const totalAmt      = refunds.filter(r => ["APPROVED","COMPLETED"].includes((r.status||"").toUpperCase())).reduce((s,r) => s + parseFloat(r.amount||0), 0);
  const successRate   = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(0) : "0";

  const KPIS = [
    { title: "Total Requests",    value: totalCount,            desc: "All refund requests",       icon: Activity,      color: "#8B5CF6", points: [3,5,4,7,6,8,7,totalCount||9]  },
    { title: "Pending Approval",  value: pendingCount,          desc: "Awaiting admin review",     icon: Clock,         color: "#F59E0B", points: [1,2,1,3,2,4,3,pendingCount||4] },
    { title: "Approved",          value: approvedCount,         desc: "Successfully processed",    icon: CheckCircle2,  color: "#10B981", points: [2,3,2,4,3,5,4,approvedCount||5] },
    { title: "Rejected",          value: rejectedCount,         desc: "Declined requests",         icon: XCircle,       color: "#EF4444", points: [0,1,0,1,0,1,0,rejectedCount||1] },
    { title: "Total Refunded",    value: formatCurrency(totalAmt), desc: "Amount returned to customers", icon: DollarSign, color: "#06B6D4", points: [10,15,12,18,16,22,20,30] },
    { title: "Approval Rate",     value: `${successRate}%`,    desc: "Refund success ratio",       icon: TrendingUp,    color: "#8B5CF6", points: [60,65,70,68,72,75,78,parseInt(successRate)||80] }
  ];

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!refunds.length) return;
    const headers = ["ID","Customer","Email","Invoice","Payment ID","Amount","Status","Reason","Requested","Processed"];
    const rows = refunds.map(r => {
      const c = customersMap[r.customer_id];
      const inv = invoicesMap[r.invoice_id];
      return [r.id, c?.name||"", c?.email||"", inv?.invoiceNumber||"", r.payment_id||"", parseFloat(r.amount||0).toFixed(2), r.status, r.reason||"", formatDate(r.created_at), formatDate(r.processed_at)];
    });
    const csv = [headers,...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `refunds_${Date.now()}.csv`;
    link.click();
    showToast("Refunds exported.", "success");
  };

  if (loading) return <AdminStatsSkeleton />;

  return (
    <div className="space-y-7 adm-fadein max-w-7xl mx-auto w-full">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">BillFlow Admin</span>
            <span className="text-[#1E293B]">›</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B5CF6]">Refunds</span>
          </div>
          <h2 className="adm-page-title flex items-center gap-2">
            <RefreshCw size={22} className="text-[#8B5CF6]" />
            Refunds
          </h2>
          <p className="adm-page-sub">Manage customer refund requests, approvals, rejections and refund history across the platform.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center flex-wrap">
          <button type="button" onClick={handleExportCSV} disabled={!refunds.length}
            className="adm-btn adm-btn-ghost cursor-pointer flex items-center gap-1.5 text-xs disabled:opacity-40" style={{ padding: "7px 14px" }}>
            <Download size={13} /> Export Refunds
          </button>
          <button type="button" onClick={handleRefresh} disabled={isRefreshing}
            className="adm-btn adm-btn-ghost cursor-pointer flex items-center gap-1.5 text-xs disabled:opacity-60" style={{ padding: "7px 14px" }}>
            <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI STRIP ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {KPIS.map((k, i) => <KpiCard key={i} {...k} delay={i * 0.05} />)}
      </div>

      {/* ── INSIGHTS ── */}
      <RefundInsightsPanel refunds={refunds} />

      {/* ── FILTER BAR ── */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px] space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Search</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Refund ID, customer, invoice, or reason..."
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Status</label>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer">
              {["All","PENDING","APPROVED","PROCESSING","COMPLETED","REJECTED","FAILED"].map(s => (
                <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Sort</label>
            <select value={sortField} onChange={e => setSortField(e.target.value)}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount ↑</option>
              <option value="amount_low">Amount ↓</option>
            </select>
          </div>

          <button type="button" onClick={() => { setSearchQuery(""); setStatusFilter("All"); setSortField("newest"); setCurrentPage(1); }}
            className="adm-btn adm-btn-ghost cursor-pointer text-xs" style={{ padding: "8px 14px" }}>
            Reset
          </button>
        </div>
      </div>

      {/* ── TABLE ── */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-center">
            <RefreshCw size={36} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">No Refund Requests</h3>
            <p className="text-zinc-500 text-sm mt-2">Customer refund requests will appear here when submitted.</p>
          </div>
          <button type="button" onClick={handleRefresh}
            className="adm-btn adm-btn-purple cursor-pointer flex items-center gap-1.5 text-xs" style={{ padding: "9px 20px", border: "none" }}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-[#121218]/40 backdrop-blur-md shadow-xl">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/70 text-[9px] text-[#475569] uppercase font-black tracking-wider select-none">
                  {["Refund ID","Customer","Invoice","Payment ID","Amount","Reason","Status","Requested","Actions"].map(h => (
                    <th key={h} className={`py-4 px-5 ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs text-zinc-300">
                {paginated.map((ref, idx) => {
                  const cust     = customersMap[ref.customer_id];
                  const inv      = invoicesMap[ref.invoice_id];
                  const isPending    = (ref.status||"").toUpperCase() === "PENDING";
                  const isProcessing = processingId === ref.id;
                  const custName = cust?.name || `Customer #${ref.customer_id}`;

                  return (
                    <motion.tr
                      key={ref.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => { setSelectedRefund(ref); setIsDrawerOpen(true); }}
                      className="group hover:bg-white/[0.025] transition-colors cursor-pointer"
                    >
                      {/* ID */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] shrink-0" />
                          <span className="font-black font-mono text-white">#{ref.id}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px] border shrink-0 ${getAvatarColor(custName)}`}>
                            {getInitials(custName)}
                          </div>
                          <div className="min-w-0">
                            <span className="text-white font-semibold block text-[11px] truncate max-w-[120px]">{custName}</span>
                            <span className="text-zinc-500 text-[10px] block truncate max-w-[120px]">{cust?.email || "—"}</span>
                          </div>
                        </div>
                      </td>

                      {/* Invoice */}
                      <td className="py-3.5 px-5 font-mono text-zinc-400 text-[11px]">
                        {inv?.invoiceNumber || "—"}
                      </td>

                      {/* Payment ID */}
                      <td className="py-3.5 px-5 font-mono text-zinc-500 text-[10px]">
                        {ref.payment_id || "—"}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-5">
                        <span className="text-white font-black font-mono">₹{parseFloat(ref.amount||0).toFixed(2)}</span>
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-5 max-w-[160px]">
                        <span className="text-zinc-400 text-[11px] truncate block" title={ref.reason}>{ref.reason || "—"}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={ref.status} />
                      </td>

                      {/* Requested Date */}
                      <td className="py-3.5 px-5 text-zinc-400 text-[11px]">{formatDate(ref.created_at)}</td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending ? (
                            <>
                              <button type="button" disabled={isProcessing} onClick={(e) => handleApproveClick(ref, e)}
                                className="px-2.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-40 text-[10px] font-black text-white rounded-lg cursor-pointer focus:outline-none transition-colors">
                                Approve
                              </button>
                              <button type="button" disabled={isProcessing} onClick={(e) => handleRejectClick(ref, e)}
                                className="px-2.5 py-1.5 bg-red-600/70 hover:bg-red-600 disabled:opacity-40 text-[10px] font-black text-white rounded-lg cursor-pointer focus:outline-none transition-colors">
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-zinc-600">Processed</span>
                          )}
                          <button type="button" onClick={() => { setSelectedRefund(ref); setIsDrawerOpen(true); }}
                            className="p-1.5 bg-zinc-900 hover:bg-[#8B5CF6]/10 border border-white/5 hover:border-[#8B5CF6]/30 text-zinc-400 hover:text-[#8B5CF6] rounded-lg cursor-pointer focus:outline-none transition-all">
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#121218]/40 border border-white/5 rounded-2xl p-4 text-xs backdrop-blur-md">
            <span className="text-zinc-500">
              Showing <span className="font-bold text-zinc-200">{Math.min((currentPage - 1) * PAGE_SIZE + 1, sorted.length)}</span> to{" "}
              <span className="font-bold text-zinc-200">{Math.min(currentPage * PAGE_SIZE, sorted.length)}</span> of{" "}
              <span className="font-bold text-zinc-200">{sorted.length}</span> refunds
            </span>
            <div className="flex items-center gap-2">
              <button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-white/5 text-zinc-400 rounded-xl cursor-pointer focus:outline-none transition-colors">
                <ChevronLeft size={14} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button key={page} type="button" onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-[11px] font-bold cursor-pointer focus:outline-none transition-all ${
                        currentPage === page ? "bg-[#8B5CF6] text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5"
                      }`}>
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-zinc-600">…</span>
                    <button type="button" onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 rounded-lg text-[11px] font-bold cursor-pointer focus:outline-none bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5">
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              <button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-white/5 text-zinc-400 rounded-xl cursor-pointer focus:outline-none transition-colors">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL (existing logic preserved) ── */}
      <AnimatePresence>
        {isRejectModalOpen && selectedRefund && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0d0d14] border border-white/8 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <XCircle size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Reject Refund Request</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Refund #{selectedRefund.id} · ₹{parseFloat(selectedRefund.amount||0).toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-[#475569] tracking-wider block">Admin Notes (Required)</label>
                <textarea
                  placeholder="Mandatory notes (minimum 5 characters)..."
                  value={rejectionNotes}
                  onChange={e => { setRejectionNotes(e.target.value); if (rejectionError) setRejectionError(""); }}
                  rows={4}
                  className="w-full p-3.5 bg-zinc-900/60 border border-white/8 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
                />
                {rejectionError && <p className="text-[10px] text-red-400 font-bold">{rejectionError}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-zinc-400 hover:text-white rounded-xl cursor-pointer focus:outline-none transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={submitRejection}
                  className="px-4 py-2.5 bg-red-600/80 hover:bg-red-600 text-xs font-black text-white rounded-xl cursor-pointer focus:outline-none transition-colors">
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DETAILS DRAWER ── */}
      <AnimatePresence>
        {isDrawerOpen && selectedRefund && (
          <RefundDrawer
            isOpen={isDrawerOpen}
            refund={selectedRefund}
            customer={customersMap[selectedRefund.customer_id]}
            invoice={invoicesMap[selectedRefund.invoice_id]}
            auditLogs={drawerAuditLogs}
            loadingAudit={loadingAudit}
            onClose={() => setIsDrawerOpen(false)}
            onApprove={handleApproveClick}
            onReject={handleRejectClick}
            processingId={processingId}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
