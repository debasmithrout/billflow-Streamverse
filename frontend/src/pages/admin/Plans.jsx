// src/pages/admin/Plans.jsx
import { useEffect, useState } from "react";
import { 
  getPlans, 
  createPlan, 
  updatePlan, 
  archivePlan, 
  restorePlan, 
  getSubscriptions 
} from "../../services/adminService";
import PlanCard from "../../components/admin/Plans/PlanCard";
import CreatePlanModal from "../../components/admin/Plans/CreatePlanModal";
import ArchivePlanDialog from "../../components/admin/Plans/ArchivePlanDialog";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast from "../../hooks/useToast";
import { formatCurrency } from "../../utils/currencyFormatter";
import { 
  RotateCcw, PackageOpen, FileText, ArrowUpRight, TrendingUp, 
  Users, Activity, DollarSign, Sparkles, Filter, Search, X, 
  PlusCircle, FileDown, CheckCircle, BarChart2, Eye, ShieldCheck,
  Sliders, Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper components for Sparkline
function Sparkline({ points, color }) {
  const width = 110;
  const height = 28;
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible animate-fade-in">
      <defs>
        <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkGrad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Table loading skeleton helper
function TableSkeleton() {
  return (
    <div className="space-y-3.5 w-full">
      <div className="h-10 bg-zinc-900/40 border border-white/5 rounded-xl w-full animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-14 bg-zinc-900/20 border border-white/5 rounded-xl w-full flex items-center justify-between px-6 animate-pulse"
        >
          <div className="h-3 bg-zinc-800 rounded w-24" />
          <div className="h-3 bg-zinc-800 rounded w-16" />
          <div className="h-3 bg-zinc-800 rounded w-12" />
          <div className="h-3 bg-zinc-800 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

export default function Plans() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({
    totalPlans: 0,
    activePlans: 0,
    archivedPlans: 0
  });

  const [loading, setLoading] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Active customer count reference map to block archiving
  const [planSubscriptionCounts, setPlanSubscriptionCounts] = useState({});

  // Selection states
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveActionType, setArchiveActionType] = useState("archive");

  // Filters State
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    billingCycle: "All",
    sort: "Newest"
  });

  useEffect(() => {
    const fetchPlansData = async () => {
      try {
        setLoading(true);
        // Load plans
        const result = await getPlans();
        setPlans(result.plans);
        setStats(result.stats);

        // Load subscriptions to map references
        const subResult = await getSubscriptions({ limit: 1000 });
        const counts = {};
        subResult.subscriptions.forEach(s => {
          if (s.status === "ACTIVE" || s.status === "TRIAL" || s.status === "PAUSED" || s.status === "PAST_DUE") {
            const planKey = s.planName.toLowerCase();
            counts[planKey] = (counts[planKey] || 0) + 1;
          }
        });
        setPlanSubscriptionCounts(counts);
      } catch (err) {
        console.error("Error loading plans catalog:", err);
        showToast("Error synchronizing plans database.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchPlansData();
  }, [refreshCount]);

  const handleCreateClick = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleSavePlan = async (id, formData) => {
    try {
      if (id) {
        await updatePlan(id, formData);
        showToast("Subscription plan updated successfully.", "success");
      } else {
        await createPlan(formData);
        showToast("Subscription plan created successfully.", "success");
      }
      setIsModalOpen(false);
      setRefreshCount(prev => prev + 1);
    } catch (err) {
      showToast(err.message || "Error saving subscription plan.", "error");
    }
  };

  const handleArchiveClick = (plan) => {
    setSelectedPlan(plan);
    setArchiveActionType("archive");
    setIsArchiveOpen(true);
  };

  const handleRestoreClick = (plan) => {
    setSelectedPlan(plan);
    setArchiveActionType("restore");
    setIsArchiveOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!selectedPlan) return;
    try {
      if (archiveActionType === "archive") {
        await archivePlan(selectedPlan.id);
        showToast("Subscription plan archived.", "success");
      } else {
        await restorePlan(selectedPlan.id);
        showToast("Subscription plan restored to active list.", "success");
      }
      setIsArchiveOpen(false);
      setRefreshCount(prev => prev + 1);
    } catch (err) {
      showToast(err.message || "Error updating plan status.", "error");
    }
  };

  const activeCount = selectedPlan ? (planSubscriptionCounts[selectedPlan.name.toLowerCase()] || 0) : 0;

  // Filter handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      billingCycle: "All",
      sort: "Newest"
    });
    showToast("Filters reset to default view.", "info");
  };

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
    showToast("Pricing tables refreshed.", "success");
  };

  // Export CSV
  const handleExportCSV = () => {
    if (plans.length === 0) {
      showToast("No pricing plans available to export.", "warning");
      return;
    }
    const headers = ["Plan ID", "Name", "Price", "Billing Cycle", "Trial Days", "Features", "Status"];
    const rows = plans.map(p => [
      p.id,
      p.name,
      p.price,
      p.billing_interval,
      p.trial_period_days,
      p.features.join(" | "),
      p.isArchived ? "Archived" : "Active"
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billflow_plans_export_${Date.now()}.csv`);
    link.click();
    showToast("Pricing plans catalog exported.", "success");
  };

  // Filter pricing cards dynamically
  const filteredPlans = plans.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                        p.description.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchStatus = filters.status === "All" || 
                       (filters.status === "Active" && !p.isArchived) || 
                       (filters.status === "Archived" && p.isArchived);

    const matchCycle = filters.billingCycle === "All" || 
                      (filters.billingCycle === "Monthly" && p.billing_interval.toLowerCase() === "month") || 
                      (filters.billingCycle === "Yearly" && p.billing_interval.toLowerCase() === "year");

    return matchSearch && matchStatus && matchCycle;
  });

  // Calculate pricing cards details
  const activeSubsPoints = [40, 50, 45, 60, 55, 75, 70, 85];
  const mrrPoints = [50, 55, 65, 60, 75, 80, 85, 92];
  const arpuPoints = [30, 32, 28, 35, 34, 38, 36, 40];

  return (
    <div className="space-y-8 adm-fadein text-left">
      
      {/* ── 1. Hero Header ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#334155" }}>
              BillFlow Admin
            </span>
            <span style={{ color: "#1E293B" }}>›</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8B5CF6" }}>
              Pricing Plans
            </span>
          </div>

          <h2 className="adm-page-title flex items-center gap-2">
            <PackageOpen size={22} className="text-[#8B5CF6]" />
            Plans
          </h2>
          <p className="adm-page-sub">
            Design, manage and optimize subscription plans that power your recurring revenue.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={handleCreateClick}
            className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px", border: "none" }}
          >
            <PlusCircle size={13} />
            Create Plan
          </button>

          <button
            type="button"
            onClick={() => showToast("Pricing analytics report generated.", "info")}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <BarChart2 size={13} />
            Pricing Analytics
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <FileDown size={13} />
            Export Plans
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <RotateCcw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── 2. Revenue Overview KPI Strip ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Active Plans */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #8B5CF644, #8B5CF6)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Plans</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
              <PackageOpen size={15} style={{ color: "#8B5CF6" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              {stats.totalPlans}
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +1 active
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>available tiers</p>
            </div>
            <Sparkline points={activeSubsPoints} color="#8B5CF6" />
          </div>
        </motion.div>

        {/* KPI 2: Active Subscribers */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #EC489944, #EC4899)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active Subscribers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#EC4899]/10 border border-[#EC4899]/20">
              <Users size={15} style={{ color: "#EC4899" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              2,847
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +18.3%
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>subscribed members</p>
            </div>
            <Sparkline points={activeSubsPoints} color="#EC4899" />
          </div>
        </motion.div>

        {/* KPI 3: Monthly Recurring Revenue */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #22C55E44, #22C55E)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Monthly Recurring Revenue</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#22C55E]/10 border border-[#22C55E]/20">
              <DollarSign size={15} style={{ color: "#22C55E" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              ₹647,637
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +24.6%
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>monthly sales collections</p>
            </div>
            <Sparkline points={mrrPoints} color="#22C55E" />
          </div>
        </motion.div>

        {/* KPI 4: ARPU */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #06B6D444, #06B6D4)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">ARPU</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#06B6D4]/10 border border-[#06B6D4]/20">
              <Activity size={15} style={{ color: "#06B6D4" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              ₹227.48
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +12.2%
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>avg revenue per user</p>
            </div>
            <Sparkline points={arpuPoints} color="#06B6D4" />
          </div>
        </motion.div>
      </div>

      {/* ── 3. Search & Filter Toolbar ── */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 w-full">
        {/* Search */}
        <div className="flex-1 min-w-[280px] relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={14} />
          </div>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search plans by name or feature..."
            className="w-full pl-9 pr-8 py-2 bg-zinc-950/40 border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => setFilters(p => ({ ...p, search: "" }))}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-white cursor-pointer focus:outline-none"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Status</span>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-zinc-950/40 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Tiers</option>
              <option value="Archived">Archived Tiers</option>
            </select>
          </div>

          {/* Cycle */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Cycle</span>
            <select
              name="billingCycle"
              value={filters.billingCycle}
              onChange={handleFilterChange}
              className="bg-zinc-950/40 border border-white/5 rounded-xl px-2.5 py-1.5 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="All">All Cycles</option>
              <option value="Monthly">Monthly Only</option>
              <option value="Yearly">Yearly Only</option>
            </select>
          </div>

          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={handleResetFilters}
              className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
              style={{ fontSize: "11px", padding: "5px 12px" }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
              style={{ fontSize: "11px", padding: "5px 12px" }}
            >
              <FileDown size={12} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Pricing Cards Section ── */}
      {loading ? (
        <AdminStatsSkeleton />
      ) : filteredPlans.length === 0 ? (
        <div className="bg-[#121218]/20 border border-white/5 rounded-2xl p-10 text-center text-gray-500 italic text-xs">
          No subscription plans match your filter parameters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              onEdit={handleEditClick}
              onArchive={handleArchiveClick}
              onRestore={handleRestoreClick}
            />
          ))}
        </div>
      )}

      {/* ── 5. Plans Management Table ── */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center gap-2">
          <Sliders size={16} />
          Plans Management Ledger
        </h3>

        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md">
            <table className="w-full text-left border-collapse min-w-[800px] adm-table">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/40 text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                  <th className="py-4 px-5">Subscription Plan</th>
                  <th className="py-4 px-5">Price</th>
                  <th className="py-4 px-5">Billing Cycle</th>
                  <th className="py-4 px-5 text-center">Trial Period</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {filteredPlans.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white text-left">{p.name}</td>
                    <td className="py-3.5 px-5 font-mono text-left">{formatCurrency(p.price)}</td>
                    <td className="py-3.5 px-5 capitalize text-left">{p.billing_interval}</td>
                    <td className="py-3.5 px-5 text-center font-mono">{p.trial_period_days} Days</td>
                    <td className="py-3.5 px-5 text-left">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                        p.isArchived 
                          ? "text-zinc-500 bg-zinc-900 border-zinc-800" 
                          : "text-green-500 bg-green-500/10 border-green-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isArchived ? "bg-zinc-600" : "bg-green-500"}`} />
                        {p.isArchived ? "Archived" : "Active"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleEditClick(p)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-bold rounded-lg border border-white/5 text-gray-300"
                        >
                          Edit
                        </button>
                        {!p.isArchived ? (
                          <button
                            type="button"
                            onClick={() => handleArchiveClick(p)}
                            className="px-2 py-1 bg-red-650/10 hover:bg-red-650/20 text-[10px] font-bold rounded-lg border border-red-500/10 text-red-500"
                          >
                            Archive
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRestoreClick(p)}
                            className="px-2 py-1 bg-green-600/10 hover:bg-green-650/20 text-[10px] font-bold rounded-lg border border-green-500/10 text-green-500"
                          >
                            Restore
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
      </div>

      {/* ── 6. Revenue Analytics Section ── */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#8B5CF6] flex items-center gap-2">
          <Activity size={16} />
          Pricing Analytics & Insights
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Widget 1 */}
          <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 text-left adm-pricing-analytics-card">
            <span className="text-[9px] text-gray-500 uppercase font-black block">Top Selling Plan</span>
            <span className="text-base font-black text-white mt-2 block flex items-center gap-1.5">
              <Crown size={15} style={{ color: "#F59E0B" }} />
              Premium Tier
            </span>
            <p className="text-[11px] text-gray-500 font-light mt-1.5 leading-relaxed">
              Calculates 42% of total conversions and 36% monthly revenue collection.
            </p>
          </div>

          {/* Widget 2 */}
          <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 text-left adm-pricing-analytics-card">
            <span className="text-[9px] text-gray-500 uppercase font-black block">Average Renewal Rate</span>
            <span className="text-base font-black text-white mt-2 block flex items-center gap-1.5">
              <Sliders size={15} style={{ color: "#22C55E" }} />
              94.2% Renewal
            </span>
            <p className="text-[11px] text-gray-500 font-light mt-1.5 leading-relaxed">
              Standard renewal ratios remained positive for 3 consecutive months.
            </p>
          </div>

          {/* Widget 3 */}
          <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 text-left adm-pricing-analytics-card">
            <span className="text-[9px] text-gray-500 uppercase font-black block">Estimated Monthly Churn</span>
            <span className="text-base font-black text-white mt-2 block flex items-center gap-1.5">
              <TrendingUp size={15} style={{ color: "#EF4444" }} />
              3.8% Cancellation
            </span>
            <p className="text-[11px] text-gray-500 font-light mt-1.5 leading-relaxed">
              Calculates below 5.0% target limits, reflecting stable subscriptions.
            </p>
          </div>

          {/* Widget 4 */}
          <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 text-left adm-pricing-analytics-card">
            <span className="text-[9px] text-gray-500 uppercase font-black block">Est. Average Trial Conversion</span>
            <span className="text-base font-black text-white mt-2 block flex items-center gap-1.5">
              <ShieldCheck size={15} style={{ color: "#8B5CF6" }} />
              32.4% Conversion
            </span>
            <p className="text-[11px] text-gray-500 font-light mt-1.5 leading-relaxed">
              Trial conversion nudge flows resulted in +3.2% upgrades since upgrade.
            </p>
          </div>
        </div>
      </div>

      {/* ── Overlay Modals Coordinator ── */}
      
      {/* Create / Edit Plan Modal */}
      <CreatePlanModal
        key={selectedPlan?.id || "create"}
        isOpen={isModalOpen}
        plan={selectedPlan}
        existingPlans={plans}
        onSave={handleSavePlan}
        onCancel={() => setIsModalOpen(false)}
      />

      {/* Archive Warning & Protection Dialog */}
      <ArchivePlanDialog
        isOpen={isArchiveOpen}
        plan={selectedPlan}
        activeCount={activeCount}
        actionType={archiveActionType}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setIsArchiveOpen(false)}
      />

    </div>
  );
}
