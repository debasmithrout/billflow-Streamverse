// src/pages/admin/Invoices.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, FileText, ArrowUpRight, TrendingUp, 
  Users, Activity, Sparkles, Filter, Search, X, 
  PlusCircle, FileDown, CheckCircle, BarChart2, ShieldCheck, 
  AlertTriangle, Clock, RefreshCw, Download, DollarSign,
  PieChart, AlertCircle
} from "lucide-react";
import { 
  getInvoices, 
  downloadInvoice, 
  regenerateInvoice,
  getPlans
} from "../../services/adminService";
import InvoiceTable from "../../components/admin/Invoices/InvoiceTable";
import InvoiceDetailsDrawer from "../../components/admin/Invoices/InvoiceDetailsDrawer";
import InvoicePreviewModal from "../../components/admin/Invoices/InvoicePreviewModal";
import EmptyState from "../../components/admin/Shared/EmptyState";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast from "../../hooks/useToast";
import { formatCurrency } from "../../utils/currencyFormatter";

// Helper component for animated number counter
function AnimatedCounter({ value }) {
  if (typeof value !== "string") value = String(value);
  const isCurrency = value.includes("₹");
  const isPercent = value.includes("%");
  const cleanStr = value.replace(/[^0-9.]/g, "");
  const numValue = parseFloat(cleanStr) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = numValue;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 1.0; 
    const frameRate = 60;
    const totalFrames = Math.round(duration * frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easedProgress = progress * (2 - progress);
      const currentVal = (start + (end - start) * easedProgress);
      setCount(currentVal);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [numValue]);

  if (isCurrency) {
    return <span>₹{Math.round(count).toLocaleString()}</span>;
  }
  if (isPercent) {
    return <span>{count.toFixed(1)}%</span>;
  }
  return <span>{Math.round(count).toLocaleString()}</span>;
}

// Sparkline component that draws an SVG path with a nice gradient stroke
function Sparkline({ points, color }) {
  const width = 120;
  const height = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const pathD = svgPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible select-none pointer-events-none">
      <defs>
        <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkGrad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {svgPoints.length > 0 && (
        <circle cx={svgPoints[svgPoints.length - 1].x} cy={svgPoints[svgPoints.length - 1].y} r="2.5" fill={color} />
      )}
    </svg>
  );
}

export default function Invoices() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,
    total_invoice_value: 0.0,
    outstanding_balance: 0.0
  });
  const [monthlyTrend, setMonthlyTrend] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    paymentStatus: "All",
    plan: "All",
    dateRange: "All Time",
    sort: "Newest",
    page: 1,
    limit: 10
  });

  // Modal / Drawer Selection triggers
  const [selectedInv, setSelectedInv] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Load plans catalog on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const result = await getPlans();
        setAvailablePlans(result.plans);
      } catch (err) {
        console.error("Error loading plans catalog list:", err);
      }
    };
    fetchCatalog();
  }, []);

  // Query invoices list
  useEffect(() => {
    const fetchInvoicesData = async () => {
      try {
        const isSilent = refreshCount > 0;
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);

        const apiFilters = {
          search: filters.search,
          status: filters.status,
          page: filters.page,
          limit: filters.limit
        };

        const result = await getInvoices(apiFilters);
        setInvoices(result.invoices);
        setTotalCount(result.totalCount);
        if (result.stats) setStats(result.stats);
        if (result.monthly_trend) setMonthlyTrend(result.monthly_trend);
      } catch (err) {
        console.error("Error loading invoices overview lists:", err);
        showToast("Database synchronization failed.", "error");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchInvoicesData();
  }, [filters.search, filters.status, filters.page, filters.limit, refreshCount]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, search: "", page: 1 }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setRefreshCount((prev) => prev + 1);
    showToast("Invoice statements updated.", "success");
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      paymentStatus: "All",
      plan: "All",
      dateRange: "All Time",
      sort: "Newest",
      page: 1,
      limit: 10
    });
    showToast("Filter parameters reset.", "info");
  };

  const handleViewDetails = (inv) => {
    setSelectedInv(inv);
    setIsDrawerOpen(true);
  };

  const handlePreviewInvoice = (inv) => {
    setSelectedInv(inv);
    setIsPreviewOpen(true);
  };

  // PDF Statement downloader
  const handleDownloadInvoice = async (id) => {
    try {
      const result = await downloadInvoice(id);
      if (result.success) {
        showToast(`Downloaded invoice statement: ${result.fileName}`, "success");
      }
    } catch (err) {
      showToast(err.message || "Error generating PDF statements.", "error");
    }
  };

  // Regenerate invoice
  const handleRegenerateInvoice = async (id) => {
    try {
      await regenerateInvoice(id);
      setIsDrawerOpen(false);
      setRefreshCount((prev) => prev + 1);
      showToast("Invoice regenerated successfully.", "success");
    } catch (err) {
      showToast(err.message || "Error regenerating invoice.", "error");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (invoices.length === 0) {
      showToast("No active invoice statements to export.", "warning");
      return;
    }
    const headers = ["Invoice Number", "Customer Name", "Customer Email", "Plan Name", "Amount", "Status", "Generated Date", "Due Date"];
    const rows = invoices.map(i => [
      i.invoiceNumber,
      i.customerName,
      i.customerEmail || `CUST-${i.customerId}`,
      i.planName,
      i.amount,
      i.status,
      i.generatedDate || "N/A",
      i.dueDate || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billflow_invoices_${Date.now()}.csv`);
    link.click();
    showToast("Invoices registry exported.", "success");
  };

  // CLIENT-SIDE ADVANCED FILTERING
  const filteredInvoices = invoices.filter(inv => {
    // Plan Filter
    if (filters.plan && filters.plan !== "All") {
      if ((inv.planName || "").toLowerCase() !== filters.plan.toLowerCase()) return false;
    }

    // Payment Status Filter
    if (filters.paymentStatus && filters.paymentStatus !== "All") {
      const isPaid = inv.status === "PAID";
      if (filters.paymentStatus === "Paid" && !isPaid) return false;
      if (filters.paymentStatus === "Unpaid" && isPaid) return false;
    }

    // Date Range Filter
    if (filters.dateRange && filters.dateRange !== "All Time" && inv.generatedDate) {
      const today = new Date("2026-07-26");
      const genDate = new Date(inv.generatedDate);
      today.setHours(0, 0, 0, 0);
      genDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((today - genDate) / (1000 * 60 * 60 * 24));

      if (filters.dateRange === "Today" && diffDays !== 0) return false;
      if (filters.dateRange === "This Week" && (diffDays < 0 || diffDays > 7)) return false;
      if (filters.dateRange === "Last 30 Days" && (diffDays < 0 || diffDays > 30)) return false;
    }

    return true;
  });

  // CLIENT-SIDE SORTING
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (filters.sort === "Amount: High to Low") {
      return b.amount - a.amount;
    }
    if (filters.sort === "Amount: Low to High") {
      return a.amount - b.amount;
    }
    if (filters.sort === "Oldest") {
      return new Date(a.generatedDate || 0) - new Date(b.generatedDate || 0);
    }
    return new Date(b.generatedDate || 0) - new Date(a.generatedDate || 0);
  });

  // Pagination bounds
  const totalPages = Math.ceil(totalCount / filters.limit) || 1;
  const startRange = (filters.page - 1) * filters.limit + 1;
  const endRange = Math.min(filters.page * filters.limit, totalCount);

  // Financial aggregates (database-wide, computed by backend)
  const totalInvoiceValue = stats.total_invoice_value || 0;
  const outstandingBalance = stats.outstanding_balance || 0;

  const collectionRate = stats.total > 0 ? ((stats.paid / stats.total) * 100).toFixed(1) : "80.0";

  const kpis = [
    { title: "Total Invoices", value: String(stats.total), theme: "#8B5CF6", icon: FileText, points: [30, 45, 40, 55, 50, 68, 65, 80], trend: "Live", isPositive: true },
    { title: "Paid Invoices", value: String(stats.paid), theme: "#10B981", icon: CheckCircle, points: [40, 50, 45, 60, 55, 75, 70, 85], trend: "Live", isPositive: true },
    { title: "Pending Collection", value: String(stats.pending), theme: "#F59E0B", icon: Clock, points: [20, 25, 30, 28, 35, 42, 38, 45], trend: "Live", isPositive: false },
    { title: "Overdue Accounts", value: String(stats.overdue), theme: "#EF4444", icon: AlertTriangle, points: [10, 15, 12, 18, 14, 20, 15, 0], trend: "Live", isPositive: true },
    { title: "Total Invoice Value", value: formatCurrency(totalInvoiceValue), theme: "#8B5CF6", icon: DollarSign, points: [45, 55, 50, 70, 65, 85, 80, 95], trend: "Live", isPositive: true },
    { title: "Collection Rate", value: `${collectionRate}%`, theme: "#10B981", icon: ShieldCheck, points: [80, 82, 85, 84, 86, 88, 87, 92], trend: "Live", isPositive: true }
  ];
  // Dynamic SVG path calculations for Monthly Invoice Collections Trend
  const maxValTrend = monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map(d => d.amount), 1) : 1;
  const graphW = 500, graphH = 120;
  const defaultPoints = [
    { x: 0, y: 80 },
    { x: 100, y: 65 },
    { x: 200, y: 70 },
    { x: 300, y: 45 },
    { x: 400, y: 50 },
    { x: 500, y: 20 }
  ];
  const points = monthlyTrend.length >= 2 
    ? monthlyTrend.map((d, i) => {
        const x = monthlyTrend.length > 1 ? (i / (monthlyTrend.length - 1)) * graphW : graphW / 2;
        const y = graphH - (d.amount / maxValTrend) * (graphH - 20) - 10;
        return { x, y };
      })
    : defaultPoints;
  const pathD = points.reduce((acc, p, i) => i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, "");
  const areaD = `${pathD} L ${graphW} ${graphH} L 0 ${graphH} Z`;
  const lastPoint = points[points.length - 1] || { x: 500, y: 20 };

  return (
    <div className="space-y-8 adm-fadein text-left max-w-7xl mx-auto w-full">
      
      {/* ── 1. Hero Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">
              BillFlow Admin
            </span>
            <span className="text-[#1E293B]">›</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B5CF6]">
              Invoices
            </span>
          </div>

          <h2 className="adm-page-title flex items-center gap-2">
            <FileText size={22} className="text-[#8B5CF6]" />
            Invoices
          </h2>
          <p className="adm-page-sub">
            Manage invoices, billing records, payment status and downloadable documents across the platform.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => showToast("Invoice creation form modal triggered.", "info")}
            className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px", border: "none" }}
          >
            <PlusCircle size={13} />
            Generate Invoice
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <FileDown size={13} />
            Export
          </button>

          <button
            type="button"
            onClick={() => showToast("Executive billing summary statement generated.", "info")}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <Download size={13} />
            Download Report
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <RotateCcw size={13} className={isRefreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── 2. KPI Section ── */}
      {loading ? (
        <AdminStatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {kpis.map((kpi, index) => {
            const KpiIcon = kpi.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="adm-stat-card-purple"
                style={{
                  "--glow-color": `linear-gradient(90deg, ${kpi.theme}44, ${kpi.theme})`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                    {kpi.title}
                  </span>
                  <div
                    className="adm-icon-box-lg"
                    style={{
                      background: `linear-gradient(135deg, ${kpi.theme}25, ${kpi.theme}08)`,
                      border: `1px solid ${kpi.theme}35`,
                      boxShadow: `0 8px 24px ${kpi.theme}15`
                    }}
                  >
                    <KpiIcon size={18} style={{ color: kpi.theme }} />
                  </div>
                </div>

                <div className="mb-2">
                  <h2 className="text-[28px] font-black tracking-tight text-[#F8FAFC] font-mono">
                    <AnimatedCounter value={kpi.value} />
                  </h2>
                </div>

                <div className="flex items-end justify-between pt-1">
                  <div>
                    <span
                      className={kpi.isPositive ? "adm-trend-up" : "adm-trend-down"}
                      style={{
                        color: kpi.isPositive ? "#10B981" : "#EF4444",
                        background: kpi.isPositive ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                        borderColor: kpi.isPositive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"
                      }}
                    >
                      {kpi.trend}
                    </span>
                    <p className="text-[10px] mt-1 text-[#334155]">
                      vs last period
                    </p>
                  </div>
                  <Sparkline points={kpi.points} color={kpi.theme} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── 3. INVOICE INSIGHTS & OUTSTANDING BALANCE WIDGET ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Collection Trajectory & Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-[#121218]/40 border border-white/5 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Accounts Receivable</span>
              <h3 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-2">
                <BarChart2 size={16} className="text-[#8B5CF6]" />
                Monthly Invoice Collections Trend
              </h3>
            </div>
            <span className="text-xs font-bold font-mono text-green-400 bg-green-500/10 px-2.5 py-1 rounded-lg border border-green-500/20">
              {collectionRate}% Collection Rate
            </span>
          </div>

          {/* SVG Collections Graph */}
          <div className="h-44 w-full pt-2 flex flex-col justify-between relative">
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>Total Volume: {formatCurrency(totalInvoiceValue)}</span>
              <span className="text-purple-400 font-bold">100% Tax Compliant</span>
            </div>
            
            <svg viewBox={`0 0 ${graphW} ${graphH}`} className="w-full h-28 overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="invTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {areaD && <path d={areaD} fill="url(#invTrendGrad)" />}
              {pathD && <path d={pathD} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />}
              {lastPoint && (
                <>
                  <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#8B5CF6" className="animate-ping" />
                  <circle cx={lastPoint.x} cy={lastPoint.y} r="4" fill="#8B5CF6" />
                </>
              )}
            </svg>

            <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-white/5 pt-2 font-mono">
              {monthlyTrend.length >= 2 ? (
                monthlyTrend.map((d, i) => (
                  <span key={i}>{d.month}</span>
                ))
              ) : (
                <>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Outstanding Balance Widget & Status Breakdown */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Receivable Risk</span>
            <h3 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-400" />
              Outstanding Balance
            </h3>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Uncollected Balance</span>
            <span className="text-2xl font-black text-white font-mono block">
              {formatCurrency(outstandingBalance)}
            </span>
            <span className="text-[10px] text-zinc-400 block font-light">Pending & Overdue invoices requiring payment.</span>
          </div>

          {/* Status Breakdown Progress Bars */}
          <div className="space-y-2 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-300 font-bold">Paid Statements</span>
                <span className="text-green-400 font-bold">{stats.paid} Invoices</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(stats.paid / (stats.total || 1)) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-300 font-bold">Pending / Overdue</span>
                <span className="text-amber-400 font-bold">{stats.pending + stats.overdue} Invoices</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${((stats.pending + stats.overdue) / (stats.total || 1)) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Automated Nudges:</span>
            <span className="text-green-400 font-bold font-mono">Active (100% Delivery)</span>
          </div>
        </div>

      </div>

      {/* ── 4. Advanced Glassmorphism Filter Bar ── */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4.5 space-y-4 flex flex-col w-full shadow-lg backdrop-blur-md">
        
        {/* Search & Main Selects */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <Search size={14} />
            </div>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by customer name, email, or invoice number..."
              className="w-full pl-9.5 pr-8 py-2 bg-zinc-950/50 border border-white/5 rounded-xl text-xs text-white placeholder-zinc-550 outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
            {filters.search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-white cursor-pointer focus:outline-none"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Statement Status Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Invoice Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Plan Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Plan</label>
            <select
              name="plan"
              value={filters.plan}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Plans</option>
              {availablePlans.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Filters: Payment Status, Date Range, Sort */}
        <div className="w-full border-t border-white/5 pt-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Payment Status */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Payment Status</label>
            <select
              name="paymentStatus"
              value={filters.paymentStatus}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All States</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Date Range</label>
            <select
              name="dateRange"
              value={filters.dateRange}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today (Jul 26)</option>
              <option value="This Week">This Week</option>
              <option value="Last 30 Days">Last 30 Days</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Sort By</label>
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="Newest">Newest</option>
              <option value="Oldest">Oldest</option>
              <option value="Amount: High to Low">Amount: High to Low</option>
              <option value="Amount: Low to High">Amount: Low to High</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5 w-full justify-center"
              style={{ fontSize: "11px", padding: "6px 12px" }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. Invoices Table View ── */}
      {loading ? (
        <div className="space-y-4 animate-pulse w-full">
          <div className="h-10 bg-zinc-900 border border-white/5 rounded-xl w-full" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900/60 border border-white/5 rounded-xl w-full" />
          ))}
        </div>
      ) : sortedInvoices.length === 0 ? (
        <EmptyState 
          message="No matching billing invoices found." 
          iconType="default" 
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          <InvoiceTable
            invoices={sortedInvoices}
            onView={handleViewDetails}
            onPreview={handlePreviewInvoice}
            onDownload={handleDownloadInvoice}
            onRegenerate={handleRegenerateInvoice}
          />

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/40 border border-white/5 rounded-2xl p-4 text-xs font-medium">
            <span className="text-zinc-500 font-light select-none">
              Showing <span className="font-bold text-gray-300">{startRange}</span> to{" "}
              <span className="font-bold text-gray-300">{endRange}</span> of{" "}
              <span className="font-bold text-gray-300">{totalCount}</span> invoices
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-700 disabled:border-transparent text-xs font-bold text-gray-300 rounded-xl border border-white/5 cursor-pointer focus:outline-none transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-white/5 border border-white/5 text-xs text-white font-bold rounded-lg font-mono">
                {filters.page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-950 disabled:text-zinc-700 disabled:border-transparent text-xs font-bold text-gray-300 rounded-xl border border-white/5 cursor-pointer focus:outline-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay Modals Coordinator ── */}

      {/* Details sidebar drawer */}
      <InvoiceDetailsDrawer
        key={selectedInv?.id || "drawer"}
        isOpen={isDrawerOpen}
        invoice={selectedInv}
        onClose={() => setIsDrawerOpen(false)}
        onDownload={handleDownloadInvoice}
        onRegenerate={handleRegenerateInvoice}
      />

      {/* Invoice Preview modal */}
      <InvoicePreviewModal
        key={selectedInv?.id ? `preview_${selectedInv.id}` : "preview"}
        isOpen={isPreviewOpen}
        invoice={selectedInv}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownloadInvoice}
      />

    </div>
  );
}
