// src/pages/admin/RetryQueue.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getRetries,
  getRetryStats,
  retryPayment
} from "../../services/adminService";
import { formatCurrency } from "../../utils/currencyFormatter";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast from "../../hooks/useToast";
import {
  Clock, RefreshCw, Play, Search, Filter, X,
  ChevronLeft, ChevronRight, Eye, CheckCircle2, XCircle,
  AlertTriangle, Activity, FileText, User, Calendar
} from "lucide-react";
import EmptyState from "../../components/admin/Shared/EmptyState";

const STATUS_CONFIG = {
  PENDING: { label: "Scheduled", cls: "text-amber-400 bg-amber-500/10 border-amber-500/25", dot: "bg-amber-400" },
  SUCCESS: { label: "Recovered", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", dot: "bg-emerald-400" },
  FAILED: { label: "Failed", cls: "text-red-400 bg-red-500/10 border-red-500/25", dot: "bg-red-400" },
  EXHAUSTED: { label: "Exhausted", cls: "text-rose-400 bg-rose-500/10 border-rose-500/25", dot: "bg-rose-400" },
  PROCESSING: { label: "Processing", cls: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", dot: "bg-indigo-400" }
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[(status || "").toUpperCase()] || { label: status, cls: "text-zinc-400 bg-zinc-855 border-zinc-700", dot: "bg-zinc-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} inline-block`} />
      {cfg.label}
    </span>
  );
}

function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

export default function RetryQueue() {
  const { showToast } = useToast();
  const [retries, setRetries] = useState([]);
  // stats come from the backend /stats endpoint — same RetryQueue table as the table list
  const [stats, setStats] = useState({
    failed_payments: 0,
    pending_retries: 0,
    recovered_payments: 0,
    retry_success_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    page: 1,
    limit: 10
  });

  const [selectedRetry, setSelectedRetry] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Load retry queue (single source: RetryQueue table) and backend-computed stats
  useEffect(() => {
    const loadData = async () => {
      try {
        if (refreshCount === 0) setLoading(true);
        // Both calls query the same RetryQueue table via RetryService
        const [queueRes, statsRes] = await Promise.all([
          getRetries(),
          getRetryStats()
        ]);
        setRetries(queueRes || []);
        setStats(statsRes || { failed_payments: 0, pending_retries: 0, recovered_payments: 0, retry_success_rate: 0 });
      } catch (err) {
        console.error("Failed to load retries data:", err);
        showToast("Error retrieving payment retries.", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    showToast("Retry Queue refreshed.", "success");
  };

  const handleRetryNow = async (retryId) => {
    setActionLoading(retryId);
    try {
      const res = await retryPayment(retryId, "SUCCESS");
      showToast(res.message || "Payment retry completed successfully!", "success");
      setRefreshCount(prev => prev + 1);
      if (selectedRetry && selectedRetry.id === retryId) {
        setIsDrawerOpen(false);
      }
    } catch (err) {
      console.error("Manual retry error:", err);
      showToast(err.response?.data?.detail || "Manual payment retry failed.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter retries
  const filteredRetries = retries.filter(item => {
    const query = filters.search.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      String(item.id).toLowerCase().includes(query) ||
      String(item.customer_id).toLowerCase().includes(query) ||
      String(item.invoice_id).toLowerCase().includes(query) ||
      (item.error_message && item.error_message.toLowerCase().includes(query));

    const matchesStatus =
      filters.status === "All" ||
      item.status.toUpperCase() === filters.status.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalCount = filteredRetries.length;
  const totalPages = Math.ceil(totalCount / filters.limit) || 1;
  const paginatedRetries = filteredRetries.slice(
    (filters.page - 1) * filters.limit,
    filters.page * filters.limit
  );

  // Metrics — sourced exclusively from backend stats (same RetryQueue table as the table data)
  const activeCount = stats.pending_retries;
  const recoveredCount = stats.recovered_payments;
  const failedCount = stats.failed_payments;
  const successRate = stats.retry_success_rate;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <RefreshCw className="h-6 w-6 text-purple-500 animate-spin-slow" />
            Payment Retry Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor and manage automated recovery attempts for failed customer payments
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* KPI Section */}
      {loading ? (
        <AdminStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Failed Payments", value: failedCount, desc: "Total failure events log", icon: AlertTriangle, color: "text-red-400 bg-red-500/10 border-red-500/20" },
            { title: "Pending Retries", value: activeCount, desc: "Currently queued for retry", icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
            { title: "Recovered Payments", value: recoveredCount, desc: "Rescued subscriptions", icon: CheckCircle2, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
            { title: "Retry Success Rate", value: `${successRate}%`, desc: "Percent of retries recovered", icon: Activity, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" }
          ].map((card, idx) => (
            <div key={idx} className={`p-4 rounded-2xl border ${card.color} flex items-center justify-between`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{card.title}</span>
                <h3 className="text-xl font-bold text-white mt-1">{card.value}</h3>
                <span className="text-[10px] opacity-75 mt-0.5 block">{card.desc}</span>
              </div>
              <div className="p-3 rounded-full bg-white/5">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table Section */}
      <div className="rounded-2xl border border-white/5 bg-zinc-950/40 p-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, Invoice ID..."
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Filter className="h-3.5 w-3.5" />
              Status:
            </span>
            <select
              value={filters.status}
              onChange={e => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
            >
              <option value="All">All Queue</option>
              <option value="PENDING">Scheduled</option>
              <option value="SUCCESS">Recovered</option>
              <option value="FAILED">Failed</option>
              <option value="EXHAUSTED">Exhausted</option>
            </select>
          </div>
        </div>

        {/* Live List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-500">Loading retry records...</div>
        ) : paginatedRetries.length === 0 ? (
          <EmptyState message="No payment retries match the search filters." iconType="activity" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pl-3">Retry ID</th>
                  <th className="pb-3">Customer ID</th>
                  <th className="pb-3">Invoice ID</th>
                  <th className="pb-3">Attempts</th>
                  <th className="pb-3">Next Attempt</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Failure Reason</th>
                  <th className="pb-3 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                {paginatedRetries.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 pl-3 font-mono font-bold text-white">#{item.id}</td>
                    <td className="py-3.5 font-mono">#{item.customer_id}</td>
                    <td className="py-3.5 font-mono">#{item.invoice_id}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-white">{item.retry_attempt}</span>
                      <span className="text-slate-500"> / {item.max_attempts}</span>
                    </td>
                    <td className="py-3.5 font-mono">{formatDate(item.next_retry_date)}</td>
                    <td className="py-3.5">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-3.5 text-slate-400 max-w-[200px] truncate">
                      {item.error_message || "—"}
                    </td>
                    <td className="py-3.5 pr-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => { setSelectedRetry(item); setIsDrawerOpen(true); }}
                          className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {item.status === "PENDING" && (
                          <button
                            onClick={() => handleRetryNow(item.id)}
                            disabled={actionLoading === item.id}
                            className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 disabled:opacity-50 cursor-pointer"
                            title="Retry Now"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-4 text-xs">
            <span className="text-slate-400">
              Showing page {filters.page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilters(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={filters.page === 1}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setFilters(p => ({ ...p, page: Math.min(totalPages, p.page + 1) }))}
                disabled={filters.page === totalPages}
                className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedRetry && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black z-40"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md bg-zinc-950 border-l border-white/10 p-6 overflow-y-auto z-50 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    Retry Details #{selectedRetry.id}
                  </h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Status</span>
                    <div className="mt-1">
                      <StatusBadge status={selectedRetry.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Customer ID</span>
                      <span className="text-xs font-mono font-bold text-white mt-1 block">#{selectedRetry.customer_id}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Invoice ID</span>
                      <span className="text-xs font-mono font-bold text-white mt-1 block">#{selectedRetry.invoice_id}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Attempt Count</span>
                      <span className="text-xs font-bold text-white mt-1 block">{selectedRetry.retry_attempt} / {selectedRetry.max_attempts}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Payment ID</span>
                      <span className="text-xs font-mono font-bold text-white mt-1 block">#{selectedRetry.payment_id || "—"}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Next Retry Date</span>
                      <span className="text-xs text-white mt-0.5 block">{formatDate(selectedRetry.next_retry_date)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Created Date</span>
                      <span className="text-xs text-white mt-0.5 block">{formatDate(selectedRetry.created_at)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Updated Date</span>
                      <span className="text-xs text-white mt-0.5 block">{formatDate(selectedRetry.updated_at)}</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Failure Reason</span>
                    <p className="text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-3 mt-1.5 font-mono">
                      {selectedRetry.error_message || "No error logs registered."}
                    </p>
                  </div>
                </div>
              </div>

              {selectedRetry.status === "PENDING" && (
                <div className="border-t border-white/5 pt-4 mt-6">
                  <button
                    onClick={() => handleRetryNow(selectedRetry.id)}
                    disabled={actionLoading === selectedRetry.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-black transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="h-4 w-4" />
                    {actionLoading === selectedRetry.id ? "Processing Retry..." : "Trigger Manual Retry Now"}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
