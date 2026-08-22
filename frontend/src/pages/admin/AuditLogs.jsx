// src/pages/admin/AuditLogs.jsx
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { getAuditLogs, clearAuditLogs } from "../../services/adminService";
import AuditLogTable    from "../../components/admin/AuditLogs/AuditLogTable";
import AuditLogDrawer   from "../../components/admin/AuditLogs/AuditLogDrawer";
import EmptyState       from "../../components/admin/Shared/EmptyState";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast  from "../../hooks/useToast";
import useModal  from "../../hooks/useModal";
import {
  Shield, Activity, CheckCircle2, AlertTriangle, XCircle,
  Info, Users, RefreshCw, Download, Trash2, Search,
  ChevronLeft, ChevronRight, Filter
} from "lucide-react";

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ title, value, icon: Icon, color, bg, delay = 0 }) {
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
        <div className="adm-icon-box-lg" style={{ background: bg, border: `1px solid ${color}40`, boxShadow: `0 8px 24px ${color}12` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <span className="text-2xl font-black text-white font-mono block">{(value ?? 0).toLocaleString()}</span>
    </motion.div>
  );
}

// ── Severity Tab Strip ────────────────────────────────────────────────────────
const TABS = [
  { key: "All",     label: "All Logs",      color: "#8B5CF6" },
  { key: "Info",    label: "Info",          color: "#38BDF8" },
  { key: "Success", label: "Success",       color: "#10B981" },
  { key: "Warning", label: "Warnings",      color: "#F59E0B" },
  { key: "Error",   label: "Errors",        color: "#EF4444" }
];

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AuditLogs() {
  const { showToast }   = useToast();
  const { showConfirm } = useModal();
  const [logs,         setLogs]         = useState([]);
  const [totalCount,   setTotalCount]   = useState(0);
  const [stats,        setStats]        = useState({ total: 0, info: 0, success: 0, warning: 0, error: 0 });
  const [loading,      setLoading]      = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    search: "", module: "All", severity: "All", page: 1, limit: 10
  });
  const [searchInput, setSearchInput] = useState("");
  const [activeTab,   setActiveTab]   = useState("All");

  // Drawer
  const [selectedLog,  setSelectedLog]  = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isSilent = refreshCount > 0;
        if (!isSilent) setLoading(true);
        const result = await getAuditLogs(filters);
        setLogs(result.logs || []);
        setTotalCount(result.totalCount || 0);
        if (result.stats) setStats(result.stats);
      } catch (err) {
        console.error("Error loading system audit logs:", err);
        showToast("Failed to load audit logs.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, refreshCount]);

  const handleSearch = useCallback((q) => {
    setFilters(prev => ({ ...prev, search: q, page: 1 }));
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, severity: tab === "All" ? "All" : tab, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    setRefreshCount(c => c + 1);
    showToast("Audit logs refreshed.", "success");
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsDrawerOpen(true);
  };

  const handleClearHistory = () => {
    showConfirm({
      title: "Clear Audit Logs?",
      description: "Are you sure you want to clear all audit log history? This action is permanent.",
      variant: "clear-audit-logs",
      confirmText: "Clear History",
      cancelText: "Keep Logs",
      onConfirm: async () => {
        try {
          await clearAuditLogs();
          setRefreshCount(c => c + 1);
          showToast("Audit logs cleared.", "success");
        } catch {
          showToast("Error clearing audit logs.", "error");
        }
      }
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!logs.length) return;
    const headers = ["ID", "Timestamp", "Module", "Action", "Severity", "Description", "Performed By"];
    const rows = logs.map(l => [
      l.id, l.timestamp, l.module, l.action, l.severity, l.description, l.performedBy
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit_logs_${Date.now()}.csv`;
    link.click();
    showToast("Audit logs exported.", "success");
  };

  const totalPages  = Math.ceil(totalCount / filters.limit) || 1;
  const startRange  = (filters.page - 1) * filters.limit + 1;
  const endRange    = Math.min(filters.page * filters.limit, totalCount);
  const modulesList = ["All", "Customers", "Plans", "Subscriptions", "Payments", "Invoices", "Refunds", "Settings", "Auth", "Security", "System"];

  const kpiCards = [
    { title: "Total Events",    value: stats.total,   icon: Activity,      color: "#8B5CF6", bg: "rgba(139,92,246,0.1)"  },
    { title: "Info Events",     value: stats.info,    icon: Info,          color: "#38BDF8", bg: "rgba(56,189,248,0.1)"  },
    { title: "Successful",      value: stats.success, icon: CheckCircle2,  color: "#10B981", bg: "rgba(16,185,129,0.1)"  },
    { title: "Warnings",        value: stats.warning, icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.1)"  },
    { title: "Critical Errors", value: stats.error,   icon: XCircle,       color: "#EF4444", bg: "rgba(239,68,68,0.1)"   },
    { title: "Admin Actions",   value: stats.total - (stats.error || 0), icon: Shield, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" }
  ];

  return (
    <div className="space-y-7 adm-fadein max-w-7xl mx-auto w-full">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">BillFlow Admin</span>
            <span className="text-[#1E293B]">›</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B5CF6]">Audit Logs</span>
          </div>
          <h2 className="adm-page-title flex items-center gap-2">
            <Shield size={22} className="text-[#8B5CF6]" />
            Audit Logs
          </h2>
          <p className="adm-page-sub">Track administrator activity, billing events, security actions and system history across the platform.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={loading || !logs.length}
            className="adm-btn adm-btn-ghost cursor-pointer flex items-center gap-1.5 disabled:opacity-40 text-xs"
            style={{ padding: "7px 14px" }}
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="adm-btn adm-btn-ghost cursor-pointer flex items-center gap-1.5 text-xs"
            style={{ padding: "7px 14px" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button
            type="button"
            onClick={handleClearHistory}
            disabled={loading || !logs.length}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl cursor-pointer focus:outline-none transition-all disabled:opacity-40"
          >
            <Trash2 size={13} /> Clear History
          </button>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map((c, i) => (
          <KpiCard key={i} {...c} delay={i * 0.05} />
        ))}
      </div>

      {/* ── FILTER BAR ── */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-4">
        {/* Row 1: Search + module + sort */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Search Events</label>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch(searchInput)}
                placeholder="Action, description, user or module..."
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl pl-8 pr-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] transition-colors"
              />
            </div>
          </div>

          {/* Module */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Module</label>
            <select
              name="module"
              value={filters.module}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              {modulesList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Per page */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Per Page</label>
            <select
              value={filters.limit}
              onChange={e => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / page</option>)}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => handleSearch(searchInput)}
              className="adm-btn adm-btn-purple cursor-pointer flex items-center gap-1.5 text-xs"
              style={{ padding: "8px 16px", border: "none" }}
            >
              <Filter size={12} /> Apply
            </button>
            <button
              type="button"
              onClick={() => { setSearchInput(""); setFilters({ search: "", module: "All", severity: "All", page: 1, limit: 10 }); setActiveTab("All"); }}
              className="adm-btn adm-btn-ghost cursor-pointer text-xs"
              style={{ padding: "8px 14px" }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Row 2: Severity tabs */}
        <div className="flex flex-wrap items-center gap-1 border-t border-white/5 pt-3">
          {TABS.map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold cursor-pointer focus:outline-none transition-all ${
                activeTab === tab.key
                  ? "text-white"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              }`}
              style={activeTab === tab.key ? { background: `${tab.color}22`, color: tab.color, border: `1px solid ${tab.color}35` } : {}}
            >
              {tab.label}
              <span className="text-[9px] font-mono">{
                tab.key === "All"     ? stats.total
                : tab.key === "Info"    ? stats.info
                : tab.key === "Success" ? stats.success
                : tab.key === "Warning" ? stats.warning
                : stats.error
              }</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── TABLE / LOADING / EMPTY ── */}
      {loading ? (
        <div className="space-y-4">
          <AdminStatsSkeleton />
          <div className="h-64 bg-zinc-900/40 border border-white/5 rounded-2xl animate-pulse" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-center">
            <Shield size={36} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">No Audit Events</h3>
            <p className="text-zinc-500 text-sm mt-2">System activity will appear here as users interact with the platform.</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="adm-btn adm-btn-purple cursor-pointer flex items-center gap-1.5 text-xs"
            style={{ padding: "9px 20px", border: "none" }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AuditLogTable logs={logs} onView={handleViewDetails} />

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#121218]/40 border border-white/5 rounded-2xl p-4 text-xs backdrop-blur-md">
            <span className="text-zinc-500">
              Showing <span className="font-bold text-zinc-200">{startRange}</span> to{" "}
              <span className="font-bold text-zinc-200">{endRange}</span> of{" "}
              <span className="font-bold text-zinc-200">{totalCount}</span> logs
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-white/5 text-zinc-400 rounded-xl cursor-pointer focus:outline-none transition-colors"
              >
                <ChevronLeft size={14} />
              </button>

              {/* Page buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`w-8 h-8 rounded-lg text-[11px] font-bold cursor-pointer focus:outline-none transition-all ${
                        filters.page === page
                          ? "bg-[#8B5CF6] text-white"
                          : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-zinc-600">…</span>
                    <button
                      type="button"
                      onClick={() => handlePageChange(totalPages)}
                      className="w-8 h-8 rounded-lg text-[11px] font-bold cursor-pointer focus:outline-none bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-white/5 text-zinc-400 rounded-xl cursor-pointer focus:outline-none transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer */}
      <AuditLogDrawer
        key={selectedLog?.id || "drawer"}
        isOpen={isDrawerOpen}
        log={selectedLog}
        onClose={() => setIsDrawerOpen(false)}
      />

    </div>
  );
}
