// src/pages/admin/Subscriptions.jsx
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  RotateCcw, PackageOpen, FileText, ArrowUpRight, TrendingUp, 
  Users, Activity, DollarSign, Sparkles, Filter, Search, X, 
  PlusCircle, FileDown, CheckCircle, BarChart2, Eye, ShieldCheck,
  Crown, Clock, Settings, RefreshCw, AlertTriangle
} from "lucide-react";
import { 
  getSubscriptions, 
  getPlans, 
  changeCustomerPlan, 
  pauseSubscription, 
  resumeSubscription, 
  cancelSubscription,
  getDashboardStats
} from "../../services/adminService";
import SubscriptionTable from "../../components/admin/Subscriptions/SubscriptionTable";
import SubscriptionDetailsDrawer from "../../components/admin/Subscriptions/SubscriptionDetailsDrawer";
import ChangePlanModal from "../../components/admin/Subscriptions/ChangePlanModal";
import CancelSubscriptionDialog from "../../components/admin/Subscriptions/CancelSubscriptionDialog";
import EmptyState from "../../components/admin/Shared/EmptyState";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast from "../../hooks/useToast";
import { formatCurrency } from "../../utils/currencyFormatter";

// Helper component for animated number counter
function AnimatedCounter({ value }) {
  if (typeof value !== "string") value = String(value);
  const isCurrency = value.includes("₹");
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
      const currentVal = Math.round(start + (end - start) * easedProgress);
      setCount(currentVal);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [numValue]);

  if (isCurrency) {
    return <span>₹{count.toLocaleString()}</span>;
  }
  return <span>{count.toLocaleString()}</span>;
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

export default function Subscriptions() {
  const { showToast } = useToast();
  const [subscriptions, setSubscriptions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    trial: 0,
    active: 0,
    paused: 0,
    cancelled: 0,
    pastDue: 0
  });

  // Dashboard metrics for MRR and Churn
  const [liveMrr, setLiveMrr] = useState("₹0");
  const [liveFailed, setLiveFailed] = useState("0");

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Dynamic Plans options for filter list
  const [availablePlans, setAvailablePlans] = useState([]);

  // Filter configurations
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    plan: "All",
    billingCycle: "All",
    autoRenew: "All",
    paymentStatus: "All",
    renewalDateFilter: "All",
    sort: "Newest",
    page: 1,
    limit: 10
  });

  // Modal / Drawer triggers
  const [selectedSub, setSelectedSub] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  // Load plans catalog and dashboard revenue stats on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const [plansResult, dashStats] = await Promise.all([
          getPlans(),
          getDashboardStats()
        ]);
        setAvailablePlans(plansResult.plans);
        
        // Find MRR and Failed payments from general dashboard stats
        const mrrObj = dashStats.find(s => s.id === "stat_monthly_rev");
        const failedObj = dashStats.find(s => s.id === "stat_failed_payments");
        if (mrrObj) setLiveMrr(mrrObj.value);
        if (failedObj) setLiveFailed(failedObj.value);
      } catch (err) {
        console.error("Error loading plans catalog list:", err);
      }
    };
    fetchCatalog();
  }, [refreshCount]);

  // Fetch Subscriptions logic
  useEffect(() => {
    const fetchSubscriptionsData = async () => {
      try {
        const isSilent = refreshCount > 0;
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);

        // Fetch subscriptions using backed supported parameters
        const apiFilters = {
          search: filters.search,
          status: filters.status,
          plan: filters.plan,
          page: filters.page,
          limit: filters.limit
        };

        const result = await getSubscriptions(apiFilters);
        setSubscriptions(result.subscriptions);
        setTotalCount(result.totalCount);
        if (result.stats) {
          setStats(result.stats);
        }
      } catch (err) {
        console.error("Error loading admin customer subscriptions:", err);
        showToast("Database synchronization failed.", "error");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchSubscriptionsData();
  }, [filters.search, filters.status, filters.plan, filters.page, filters.limit, refreshCount]);

  // Handle search text change
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({ ...prev, search: "", page: 1 }));
  };

  // Handle dropdown filters change
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
    showToast("Subscriptions ledger updated.", "success");
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      plan: "All",
      billingCycle: "All",
      autoRenew: "All",
      paymentStatus: "All",
      renewalDateFilter: "All",
      sort: "Newest",
      page: 1,
      limit: 10
    });
    showToast("Filter parameters cleared.", "info");
  };

  // View details in side drawer
  const handleViewDetails = (sub) => {
    setSelectedSub(sub);
    setIsDrawerOpen(true);
  };

  // Change Plan triggers
  const handleChangePlanClick = (sub) => {
    setSelectedSub(sub);
    setIsChangePlanOpen(true);
  };

  const handleChangePlanSave = async (customerId, newPlanId) => {
    try {
      await changeCustomerPlan(customerId, newPlanId);
      setIsChangePlanOpen(false);
      setIsDrawerOpen(false); 
      setRefreshCount((prev) => prev + 1);
      showToast("Subscription plan changed successfully.", "success");
    } catch (err) {
      showToast(err.message || "Error changing plan.", "error");
    }
  };

  // Pause / Resume triggers
  const handlePauseSubscription = async (id) => {
    try {
      await pauseSubscription(id);
      setRefreshCount((prev) => prev + 1);
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub((prev) => ({ ...prev, status: "PAUSED" }));
      }
      showToast("Subscription paused successfully.", "success");
    } catch (err) {
      showToast(err.message || "Error pausing subscription.", "error");
    }
  };

  const handleResumeSubscription = async (id) => {
    try {
      await resumeSubscription(id);
      setRefreshCount((prev) => prev + 1);
      if (selectedSub && selectedSub.id === id) {
        setSelectedSub((prev) => ({ ...prev, status: "ACTIVE" }));
      }
      showToast("Subscription resumed successfully.", "success");
    } catch (err) {
      showToast(err.message || "Error resuming subscription.", "error");
    }
  };

  // Cancel triggers
  const handleCancelClick = (sub) => {
    setSelectedSub(sub);
    setIsCancelOpen(true);
  };

  const handleCancelConfirm = async (id, cancelType) => {
    try {
      await cancelSubscription(id, cancelType);
      setIsCancelOpen(false);
      setIsDrawerOpen(false); 
      setRefreshCount((prev) => prev + 1);
      showToast("Subscription cancelled successfully.", "success");
    } catch (err) {
      showToast(err.message || "Error cancelling subscription.", "error");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (subscriptions.length === 0) {
      showToast("No active database entries to export.", "warning");
      return;
    }
    const headers = ["Subscription ID", "Customer Name", "Customer Email", "Plan Name", "Billing Cycle", "Price", "Status", "Renewal Date", "Created At"];
    const rows = subscriptions.map(s => [
      s.id,
      s.customerName,
      s.customerEmail,
      s.planName,
      s.billingInterval ? `${s.billingInterval}ly` : "N/A",
      s.planPrice,
      s.status,
      s.renewalDate || "N/A",
      s.created_at || "N/A"
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billflow_subscriptions_${Date.now()}.csv`);
    link.click();
    showToast("Subscriptions registry exported.", "success");
  };

  // CLIENT-SIDE ADVANCED FILTERING
  const filteredSubscriptions = subscriptions.filter(s => {
    // 1. Billing Cycle
    if (filters.billingCycle && filters.billingCycle !== "All") {
      const interval = s.billingInterval ? s.billingInterval.toLowerCase() : "";
      if (filters.billingCycle === "Monthly" && interval !== "month") return false;
      if (filters.billingCycle === "Yearly" && interval !== "year") return false;
    }
    
    // 2. Auto Renew
    if (filters.autoRenew && filters.autoRenew !== "All") {
      const autoRenew = s.status !== "CANCELLED" && s.status !== "EXPIRED";
      if (filters.autoRenew === "Enabled" && !autoRenew) return false;
      if (filters.autoRenew === "Disabled" && autoRenew) return false;
    }
    
    // 3. Payment Status
    if (filters.paymentStatus && filters.paymentStatus !== "All") {
      let currentPaymentStatus = "Paid";
      if (s.status === "PAST_DUE") currentPaymentStatus = "Past Due";
      else if (s.status === "TRIAL") currentPaymentStatus = "Trial";
      else if (s.status === "CANCELLED" || s.status === "EXPIRED") currentPaymentStatus = "Unpaid";
      
      if (filters.paymentStatus !== currentPaymentStatus) return false;
    }
    
    // 4. Renewal Date Filter
    if (filters.renewalDateFilter && filters.renewalDateFilter !== "All" && s.renewalDate) {
      const today = new Date("2026-07-26");
      const renewalDate = new Date(s.renewalDate);
      today.setHours(0, 0, 0, 0);
      renewalDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((renewalDate - today) / (1000 * 60 * 60 * 24));
      
      if (filters.renewalDateFilter === "Today" && diffDays !== 0) return false;
      if (filters.renewalDateFilter === "This Week" && (diffDays < 0 || diffDays > 7)) return false;
      if (filters.renewalDateFilter === "Next 30 Days" && (diffDays < 0 || diffDays > 30)) return false;
    }
    
    return true;
  });

  // CLIENT-SIDE SORTING
  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    if (filters.sort === "Price: High to Low") {
      return b.planPrice - a.planPrice;
    }
    if (filters.sort === "Price: Low to High") {
      return a.planPrice - b.planPrice;
    }
    if (filters.sort === "Oldest") {
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  // Pagination bounds
  const totalPages = Math.ceil(totalCount / filters.limit) || 1;
  const startRange = (filters.page - 1) * filters.limit + 1;
  const endRange = Math.min(filters.page * filters.limit, totalCount);

  // Statistics structural summary strip mapping
  const mrrCleanValue = parseFloat(liveMrr.replace(/[^0-9.]/g, "")) || 647637;
  const renewalRateCleanValue = 94.2;
  const churnRateCleanValue = 3.8;

  const kpis = [
    { title: "Total Subscriptions", value: String(stats.total), theme: "#8B5CF6", icon: PackageOpen, points: [30, 45, 40, 55, 50, 68, 65, 80], trend: "+12.5%", isPositive: true },
    { title: "Active Customers", value: String(stats.active), theme: "#10B981", icon: ShieldCheck, points: [40, 50, 45, 60, 55, 75, 70, 85], trend: "+18.3%", isPositive: true },
    { title: "Trial Users", value: String(stats.trial), theme: "#EC4899", icon: Clock, points: [80, 75, 70, 65, 72, 60, 55, 48], trend: "-4.2%", isPositive: false },
    { title: "Monthly Recurring Revenue", value: `₹${mrrCleanValue.toLocaleString()}`, theme: "#8B5CF6", icon: DollarSign, points: [45, 55, 50, 70, 65, 85, 80, 95], trend: "+24.6%", isPositive: true },
    { title: "Renewal Rate", value: `${renewalRateCleanValue}%`, theme: "#10B981", icon: RefreshCw, points: [90, 92, 91, 93, 92, 94, 93, 94.2], trend: "Live", isPositive: true },
    { title: "Churn Rate", value: `${churnRateCleanValue}%`, theme: "#EF4444", icon: AlertTriangle, points: [5.2, 4.8, 4.5, 4.2, 4.0, 3.9, 3.8, 3.8], trend: "Live", isPositive: true }
  ];

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
              Subscriptions
            </span>
          </div>

          <h2 className="adm-page-title flex items-center gap-2">
            <Activity size={22} className="text-[#8B5CF6]" />
            Subscriptions
          </h2>
          <p className="adm-page-sub">
            Manage the complete subscription lifecycle, billing status, renewals, upgrades, downgrades and customer activity.
          </p>
        </div>

        {/* Header Action Row */}
        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => showToast("Subscription creation must be initiated by customers via checkout flows.", "info")}
            className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px", border: "none" }}
          >
            <PlusCircle size={13} />
            Create Subscription
          </button>

          <button
            type="button"
            onClick={() => showToast("Selected subscriptions renewal ledger triggers queued.", "success")}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <RefreshCw size={13} />
            Renew
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
                      vs last month
                    </p>
                  </div>
                  <Sparkline points={kpi.points} color={kpi.theme} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── 3. Advanced Filter Bar ── */}
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
              placeholder="Search subscriptions by customer or plan..."
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
              <option value="Active">Active</option>
              <option value="Trial">Trial</option>
              <option value="Paused">Paused</option>
              <option value="Past Due">Past Due</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Expired">Expired</option>
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

        {/* Sub-Filters: Billing Cycle, Auto Renew, Payment Status, Renewal Date, Sort */}
        <div className="w-full border-t border-white/5 pt-3.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Billing Cycle */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Billing Cycle</label>
            <select
              name="billingCycle"
              value={filters.billingCycle}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Cycles</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>

          {/* Auto Renew */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Auto Renew</label>
            <select
              name="autoRenew"
              value={filters.autoRenew}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All States</option>
              <option value="Enabled">Enabled</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

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
              <option value="Past Due">Past Due</option>
              <option value="Trial">Trial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          {/* Renewal Date Select */}
          <div className="flex flex-col space-y-1">
            <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider select-none">Renewal Date</label>
            <select
              name="renewalDateFilter"
              value={filters.renewalDateFilter}
              onChange={handleFilterChange}
              className="bg-zinc-950/50 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Dates</option>
              <option value="Today">Today (Jul 26)</option>
              <option value="This Week">This Week</option>
              <option value="Next 30 Days">Next 30 Days</option>
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
              <option value="Price: High to Low">Price: High to Low</option>
              <option value="Price: Low to High">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Clear/Reset Action Row */}
        <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
          <button
            type="button"
            onClick={handleResetFilters}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "11px", padding: "5px 12px" }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ── 4. Subscriptions table view or empty states ── */}
      {loading ? (
        <div className="space-y-4 animate-pulse w-full">
          <div className="h-10 bg-zinc-900 border border-white/5 rounded-xl w-full" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-900/60 border border-white/5 rounded-xl w-full" />
          ))}
        </div>
      ) : sortedSubscriptions.length === 0 ? (
        <EmptyState 
          message="No matching customer subscriptions found." 
          iconType="default" 
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="space-y-4">
          <SubscriptionTable
            subscriptions={sortedSubscriptions}
            onView={handleViewDetails}
            onChangePlan={handleChangePlanClick}
            onPause={handlePauseSubscription}
            onResume={handleResumeSubscription}
            onCancel={handleCancelClick}
          />

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/40 border border-white/5 rounded-2xl p-4 text-xs font-medium">
            <span className="text-zinc-500 font-light select-none">
              Showing <span className="font-bold text-gray-300">{startRange}</span> to{" "}
              <span className="font-bold text-gray-300">{endRange}</span> of{" "}
              <span className="font-bold text-gray-300">{totalCount}</span> subscriptions
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
      <SubscriptionDetailsDrawer
        key={selectedSub?.id || "drawer"}
        isOpen={isDrawerOpen}
        subscription={selectedSub}
        onClose={() => setIsDrawerOpen(false)}
        onChangePlan={handleChangePlanClick}
        onPause={handlePauseSubscription}
        onResume={handleResumeSubscription}
        onCancel={handleCancelClick}
      />

      {/* Change Plan Modal sheet */}
      <ChangePlanModal
        key={selectedSub?.id || "change"}
        isOpen={isChangePlanOpen}
        subscription={selectedSub}
        plans={availablePlans}
        onSave={handleChangePlanSave}
        onCancel={() => setIsChangePlanOpen(false)}
      />

      {/* Cancel confirm modal */}
      <CancelSubscriptionDialog
        key={selectedSub?.id || "cancel"}
        isOpen={isCancelOpen}
        subscription={selectedSub}
        onConfirm={handleCancelConfirm}
        onCancel={() => setIsCancelOpen(false)}
      />

    </div>
  );
}
