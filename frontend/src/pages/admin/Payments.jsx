// src/pages/admin/Payments.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, DollarSign, CreditCard, ArrowUpRight, TrendingUp, 
  Users, Activity, Sparkles, Filter, Search, X, PlusCircle, 
  FileDown, CheckCircle, BarChart2, ShieldCheck, AlertTriangle, 
  Clock, RefreshCw, Landmark, Wallet, Zap, ShieldAlert, Download
} from "lucide-react";
import { 
  getPayments, 
  retryPayment, 
  refundPayment,
  getDashboardStats 
} from "../../services/adminService";
import { formatCurrency } from "../../utils/currencyFormatter";
import PaymentTable from "../../components/admin/Payments/PaymentTable";
import PaymentDetailsDrawer from "../../components/admin/Payments/PaymentDetailsDrawer";
import RefundPaymentDialog from "../../components/admin/Payments/RefundPaymentDialog";
import EmptyState from "../../components/admin/Shared/EmptyState";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast from "../../hooks/useToast";

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

export default function Payments() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    refunded: 0
  });

  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    currentMonthRevenue: 0,
    pendingAmount: 0,
    refundedAmount: 0
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [trendToggle, setTrendToggle] = useState("30D");

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    gateway: "All",
    paymentMethod: "All",
    dateRange: "All Time",
    sort: "Newest",
    page: 1,
    limit: 10
  });

  // Modal / Drawer Selection triggers
  const [selectedPay, setSelectedPay] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);

  // Query payments from service layer
  useEffect(() => {
    const fetchPaymentsData = async () => {
      try {
        const isSilent = refreshCount > 0;
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);

        const apiFilters = {
          search: filters.search,
          status: filters.status,
          paymentMethod: filters.paymentMethod,
          page: filters.page,
          limit: filters.limit
        };

        const result = await getPayments(apiFilters);
        setPayments(result.payments);
        setTotalCount(result.totalCount);
        if (result.stats) setStats(result.stats);
        if (result.revenueStats) setRevenueStats(result.revenueStats);
      } catch (err) {
        console.error("Error loading payments overview logs:", err);
        showToast("Error retrieving payment records.", "error");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchPaymentsData();
  }, [filters.search, filters.status, filters.paymentMethod, filters.page, filters.limit, refreshCount]);

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
    showToast("Payment records refreshed.", "success");
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      gateway: "All",
      paymentMethod: "All",
      dateRange: "All Time",
      sort: "Newest",
      page: 1,
      limit: 10
    });
    showToast("Filter parameters reset.", "info");
  };

  const handleViewDetails = (pay) => {
    setSelectedPay(pay);
    setIsDrawerOpen(true);
  };

  const handleRetryPayment = async (id) => {
    try {
      await retryPayment(id);
      setIsDrawerOpen(false);
      setRefreshCount((prev) => prev + 1);
      showToast("Payment retried successfully.", "success");
    } catch (err) {
      showToast(err.message || "Error retrying payment.", "error");
    }
  };

  const handleRefundClick = (pay) => {
    setSelectedPay(pay);
    setIsRefundOpen(true);
  };

  const handleRefundConfirm = async (id) => {
    try {
      await refundPayment(id);
      setIsRefundOpen(false);
      setIsDrawerOpen(false);
      setRefreshCount((prev) => prev + 1);
      showToast("Payment refunded successfully.", "success");
    } catch (err) {
      showToast(err.message || "Error processing payment refund.", "error");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (payments.length === 0) {
      showToast("No payment records available to export.", "warning");
      return;
    }
    const headers = ["Transaction ID", "Customer Name", "Customer Email", "Invoice Number", "Amount", "Gateway", "Payment Method", "Status", "Date"];
    const rows = payments.map(p => [
      p.transactionId || `TXN-${p.id}`,
      p.customerName,
      p.customerEmail || `CUST-${p.customerId}`,
      p.invoiceNumber || `INV-00${p.id}`,
      p.amount,
      p.gateway || "Stripe",
      p.paymentMethod,
      p.status,
      p.paymentDate || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billflow_payments_${Date.now()}.csv`);
    link.click();
    showToast("Payment transaction ledger exported.", "success");
  };

  // CLIENT-SIDE ADVANCED FILTERING
  const filteredPayments = payments.filter(p => {
    // Gateway filter
    if (filters.gateway && filters.gateway !== "All") {
      const g = (p.gateway || "Stripe").toLowerCase();
      if (g !== filters.gateway.toLowerCase()) return false;
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== "All Time" && p.paymentDate) {
      const today = new Date("2026-07-26");
      const payDate = new Date(p.paymentDate);
      today.setHours(0, 0, 0, 0);
      payDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((today - payDate) / (1000 * 60 * 60 * 24));

      if (filters.dateRange === "Today" && diffDays !== 0) return false;
      if (filters.dateRange === "This Week" && (diffDays < 0 || diffDays > 7)) return false;
      if (filters.dateRange === "Last 30 Days" && (diffDays < 0 || diffDays > 30)) return false;
    }

    return true;
  });

  // CLIENT-SIDE SORTING
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (filters.sort === "Amount: High to Low") {
      return b.amount - a.amount;
    }
    if (filters.sort === "Amount: Low to High") {
      return a.amount - b.amount;
    }
    if (filters.sort === "Oldest") {
      return new Date(a.paymentDate || 0) - new Date(b.paymentDate || 0);
    }
    return new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0);
  });

  const totalPages = Math.ceil(totalCount / filters.limit) || 1;
  const startRange = (filters.page - 1) * filters.limit + 1;
  const endRange = Math.min(filters.page * filters.limit, totalCount);

  // Success rate calculation
  const totalAttempts = stats.paid + stats.failed + stats.pending;
  const successRate = totalAttempts > 0 ? ((stats.paid / totalAttempts) * 100).toFixed(1) : "98.4";

  // KPI Array
  const kpis = [
    { title: "Total Revenue", value: formatCurrency(revenueStats.totalRevenue), theme: "#8B5CF6", icon: DollarSign, points: [45, 55, 50, 70, 65, 85, 80, 95], trend: "+24.6%", isPositive: true },
    { title: "Successful Payments", value: String(stats.paid), theme: "#10B981", icon: CheckCircle, points: [40, 50, 45, 60, 55, 75, 70, 85], trend: "+18.3%", isPositive: true },
    { title: "Failed Payments", value: String(stats.failed), theme: "#EF4444", icon: AlertTriangle, points: [90, 80, 70, 75, 60, 50, 45, 35], trend: "-33.3%", isPositive: true },
    { title: "Pending Payments", value: String(stats.pending), theme: "#F59E0B", icon: Clock, points: [20, 25, 30, 28, 35, 42, 38, 45], trend: "Live", isPositive: false },
    { title: "Refund Amount", value: formatCurrency(revenueStats.refundedAmount), theme: "#3B82F6", icon: RotateCcw, points: [10, 15, 12, 18, 14, 20, 15, 22], trend: "Live", isPositive: false },
    { title: "Success Rate", value: `${successRate}%`, theme: "#10B981", icon: ShieldCheck, points: [95, 96, 95.5, 97, 96.8, 98, 97.5, 98.4], trend: "+2.1%", isPositive: true }
  ];

  // Failed payment items for alert panel
  const failedPaymentsList = payments.filter(p => p.status === "FAILED");

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
              Payments
            </span>
          </div>

          <h2 className="adm-page-title flex items-center gap-2">
            <CreditCard size={22} className="text-[#8B5CF6]" />
            Payments
          </h2>
          <p className="adm-page-sub">
            Monitor transactions, payment gateways, settlements, refunds and billing activity across the platform.
          </p>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={handleExportCSV}
            className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px", border: "none" }}
          >
            <FileDown size={13} />
            Export Payments
          </button>

          <button
            type="button"
            onClick={() => showToast("Financial settlement & gateway audit report generated.", "info")}
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

      {/* ── 3. PAYMENT INSIGHTS & GATEWAY DISTRIBUTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Revenue Trend Chart & Gateway Widget */}
        <div className="lg:col-span-2 bg-[#121218]/40 border border-white/5 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Fintech Metrics</span>
              <h3 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-2">
                <BarChart2 size={16} className="text-[#8B5CF6]" />
                Platform Revenue Trajectory & Success Rate
              </h3>
            </div>

            {/* Toggle 7D / 30D / 90D */}
            <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-xl border border-white/5 self-start sm:self-center">
              {["7D", "30D", "90D"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrendToggle(t)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    trendToggle === t ? "bg-[#8B5CF6] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Revenue Trajectory Graph */}
          <div className="h-44 w-full pt-2 flex flex-col justify-between relative">
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>{formatCurrency(revenueStats.totalRevenue || 2233.72)}</span>
              <span className="text-green-400 font-bold">+18.7% Collection Rate</span>
            </div>
            
            <svg viewBox="0 0 500 120" className="w-full h-28 overflow-visible">
              <defs>
                <linearGradient id="revTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 90 Q 60 70 120 80 T 240 40 T 360 50 T 500 15 L 500 120 L 0 120 Z" fill="url(#revTrendGrad)" />
              <path d="M 0 90 Q 60 70 120 80 T 240 40 T 360 50 T 500 15" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="500" cy="15" r="4" fill="#8B5CF6" className="animate-ping" />
              <circle cx="500" cy="15" r="4" fill="#8B5CF6" />
            </svg>

            <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-white/5 pt-2">
              <span>Jul 01</span>
              <span>Jul 07</span>
              <span>Jul 14</span>
              <span>Jul 21</span>
              <span>Jul 26 (Today)</span>
            </div>
          </div>
        </div>

        {/* Gateway Distribution & Gateway Stats */}
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Channel Distribution</span>
            <h3 className="text-sm font-bold text-white tracking-wide mt-0.5 flex items-center gap-2">
              <Zap size={16} className="text-amber-400" />
              Gateway-wise Volume
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300 font-bold">Stripe Gateway</span>
                <span className="text-white font-bold">58% • {formatCurrency(revenueStats.totalRevenue * 0.58)}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-[#635BFF] rounded-full" style={{ width: "58%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300 font-bold">Razorpay</span>
                <span className="text-white font-bold">27% • {formatCurrency(revenueStats.totalRevenue * 0.27)}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "27%" }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-zinc-300 font-bold">PayPal / UPI</span>
                <span className="text-white font-bold">15% • {formatCurrency(revenueStats.totalRevenue * 0.15)}</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "15%" }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Avg Processing Speed:</span>
            <span className="text-green-400 font-bold font-mono">1.2s (Instant Settlement)</span>
          </div>
        </div>

      </div>

      {/* Failed Payment Alert Panel (if failed > 0) */}
      {stats.failed > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Action Required: {stats.failed} Failed {stats.failed === 1 ? 'Charge' : 'Charges'} Detected</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Recent declined attempts require administrator review or manual retry.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFilters(prev => ({ ...prev, status: "Failed" }))}
            className="px-3.5 py-1.5 bg-red-650 hover:bg-red-750 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Review Failed Charges
          </button>
        </div>
      )}

      {/* ── 4. Advanced Glassmorphism Filter Bar ── */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4.5 space-y-4 flex flex-col w-full shadow-lg backdrop-blur-md">
        
        {/* Search & Main Dropdowns */}
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
              placeholder="Search by customer name, email, or transaction ID..."
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

          {/* Status Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Method Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Payment Method</label>
            <select
              name="paymentMethod"
              value={filters.paymentMethod}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallet">Wallet</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
        </div>

        {/* Sub-Filters: Gateway, Date Range, Sort */}
        <div className="w-full border-t border-white/5 pt-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {/* Gateway */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Gateway</label>
            <select
              name="gateway"
              value={filters.gateway}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Gateways</option>
              <option value="Stripe">Stripe</option>
              <option value="Razorpay">Razorpay</option>
              <option value="PayPal">PayPal</option>
              <option value="Cashfree">Cashfree</option>
              <option value="Mock Gateway">Mock Gateway</option>
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

          {/* Clear Filters */}
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

      {/* ── 5. Payments Table View ── */}
      {loading ? (
        <div className="space-y-4 animate-pulse w-full">
          <div className="h-10 bg-zinc-900 border border-white/5 rounded-xl w-full" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900/60 border border-white/5 rounded-xl w-full" />
          ))}
        </div>
      ) : sortedPayments.length === 0 ? (
        <EmptyState 
          message="No matching payment transactions found." 
          iconType="default" 
          actionLabel="Reset Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          <PaymentTable
            payments={sortedPayments}
            onView={handleViewDetails}
            onRetry={handleRetryPayment}
            onRefund={handleRefundClick}
          />

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/40 border border-white/5 rounded-2xl p-4 text-xs font-medium">
            <span className="text-zinc-500 font-light select-none">
              Showing <span className="font-bold text-gray-300">{startRange}</span> to{" "}
              <span className="font-bold text-gray-300">{endRange}</span> of{" "}
              <span className="font-bold text-gray-300">{totalCount}</span> transactions
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
      <PaymentDetailsDrawer
        key={selectedPay?.id || "drawer"}
        isOpen={isDrawerOpen}
        payment={selectedPay}
        onClose={() => setIsDrawerOpen(false)}
        onRetry={handleRetryPayment}
        onRefund={handleRefundClick}
      />

      {/* Refund dialog overlay confirm */}
      <RefundPaymentDialog
        key={selectedPay?.id || "refund"}
        isOpen={isRefundOpen}
        payment={selectedPay}
        onConfirm={handleRefundConfirm}
        onCancel={() => setIsRefundOpen(false)}
      />

    </div>
  );
}
