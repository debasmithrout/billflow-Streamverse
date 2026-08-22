// src/pages/admin/Analytics.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getAnalytics, getDashboardStats, getPlans, getAuditLogs
} from "../../services/adminService";
import { formatCurrency } from "../../utils/currencyFormatter";
import AnalyticsSummaryCard from "../../components/admin/Analytics/AnalyticsSummaryCard";
import RevenueChartCard    from "../../components/admin/Analytics/RevenueChartCard";
import CustomerGrowthChart from "../../components/admin/Analytics/CustomerGrowthChart";
import SubscriptionChart   from "../../components/admin/Analytics/SubscriptionChart";
import PaymentSuccessChart from "../../components/admin/Analytics/PaymentSuccessChart";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast from "../../hooks/useToast";
import TaxAnalytics from "../../components/admin/Analytics/TaxAnalytics";
import {
  BarChart2, TrendingUp, Download, FileDown, RefreshCw,
  Award, Users, DollarSign, Activity, AlertTriangle,
  CheckCircle2, Clock, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Sparkles, Percent
} from "lucide-react";

// ─── Business Event Timeline ───────────────────────────────────────────────
function BusinessEventTimeline({ logs = [] }) {
  const getEventStyle = (action = "") => {
    const a = action.toLowerCase();
    if (a.includes("subscribe") || a.includes("signup"))   return { icon: Users,        color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" };
    if (a.includes("upgrade"))                              return { icon: ArrowUpRight,  color: "text-green-400", bg: "bg-green-500/10" };
    if (a.includes("downgrade"))                            return { icon: ArrowDownRight, color: "text-amber-400", bg: "bg-amber-500/10" };
    if (a.includes("pay") && !a.includes("fail"))           return { icon: CheckCircle2,  color: "text-green-400", bg: "bg-green-500/10" };
    if (a.includes("fail") || a.includes("error"))         return { icon: AlertTriangle, color: "text-red-400",   bg: "bg-red-500/10"   };
    if (a.includes("refund"))                               return { icon: RefreshCw,     color: "text-blue-400",  bg: "bg-blue-500/10"  };
    if (a.includes("invoice"))                              return { icon: FileDown,      color: "text-amber-400", bg: "bg-amber-500/10" };
    if (a.includes("trial"))                                return { icon: Clock,         color: "text-zinc-400",  bg: "bg-zinc-800/50"  };
    return { icon: Activity, color: "text-zinc-400", bg: "bg-zinc-800/50" };
  };

  if (logs.length === 0) return (
    <div className="text-center py-10 text-zinc-600 text-xs italic">No recent events recorded.</div>
  );

  return (
    <div className="space-y-0.5 pl-2">
      {logs.map((log, idx) => {
        const { icon: Icon, color, bg } = getEventStyle(log.action || log.event || "");
        return (
          <motion.div
            key={log.id || idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="adm-timeline-item"
          >
            <div className={`w-8 h-8 rounded-xl ${bg} border border-white/5 flex items-center justify-center shrink-0`}>
              <Icon size={14} className={color} />
            </div>
            <div className="pt-0.5 text-xs min-w-0">
              <span className="text-white font-bold block truncate">{log.action || log.event || "Platform Event"}</span>
              <span className="text-[10px] text-zinc-500 block mt-0.5 truncate">{log.message || log.description || "Admin activity recorded."}</span>
              <span className="text-[9px] text-zinc-600 font-mono mt-0.5 block">
                {log.timestamp ? new Date(log.timestamp).toLocaleString() : "Just now"}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Top Plans Leaderboard ─────────────────────────────────────────────────
function TopPlansLeaderboard({ planDist = [], plans = [] }) {
  const totalSubs = planDist.reduce((s, d) => s + (d.count || 0), 0) || 1;
  const COLORS = ["#8B5CF6", "#10B981", "#F59E0B", "#3B82F6", "#EF4444"];
  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-3">
      {planDist.map((item, i) => {
        const planInfo = plans.find(p => p.name === item.name);
        const pct = ((item.count / totalSubs) * 100).toFixed(1);
        const revenue = planInfo ? planInfo.price * item.count : 0;
        const color = COLORS[i % COLORS.length];

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4 }}
            className="group bg-zinc-900/30 hover:bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 transition-all cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{MEDALS[i] || `#${i + 1}`}</span>
                <div>
                  <span className="text-white font-bold text-xs block">{item.name}</span>
                  {planInfo && (
                    <span className="text-[10px] text-zinc-500 font-mono">{formatCurrency(planInfo.price)}/mo</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="text-white font-black font-mono text-xs block">{item.count} subs</span>
                <span className="text-[10px] text-zinc-400">{formatCurrency(revenue)}</span>
              </div>
            </div>
            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
                className="h-full rounded-full"
                style={{ background: color }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-1">
              <span>{pct}% of subscribers</span>
              <span className="text-green-400">{pct > "30" ? "↑ Trending" : "Stable"}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Business Insights Panel ───────────────────────────────────────────────
function BusinessInsightsPanel({ analytics, dashStats }) {
  const revenueChart  = analytics?.revenueChart  || [];
  const planDist      = analytics?.planDistribution || [];
  const stats         = analytics?.stats || {};

  const totalRevenue = revenueChart.reduce((s, d) => s + (d.revenue || 0), 0);
  const avgInvoice   = stats.customersCount > 0 ? totalRevenue / stats.customersCount : 0;
  const arpu         = stats.activeCount    > 0 ? totalRevenue / stats.activeCount    : 0;

  const bestMonth    = revenueChart.length > 0
    ? revenueChart.reduce((b, d) => d.revenue > b.revenue ? d : b, revenueChart[0])
    : { month: "N/A", revenue: 0 };
  const topPlan      = planDist.length > 0
    ? planDist.reduce((b, d) => d.count > b.count ? d : b, planDist[0])
    : { name: "N/A", count: 0 };

  const failedPayStat  = dashStats?.find ? dashStats.find(s => s.id === "stat_failed_payments") : null;
  const totalPayStat   = dashStats?.find ? dashStats.find(s => s.id === "stat_payments")        : null;
  const failed = parseInt((failedPayStat?.value || "0").replace(/,/g, ""), 10);
  const total  = parseInt((totalPayStat?.value  || "1").replace(/,/g, ""), 10);
  const successRate = total > 0 ? (((total - failed) / total) * 100).toFixed(1) : "100.0";

  const insights = [
    {
      label: "Highest Revenue Month",
      value: `${bestMonth.month} — ${formatCurrency(bestMonth.revenue)}`,
      icon: Award, color: "text-amber-400", bg: "bg-amber-500/10",
      desc: "Best performing billing cycle"
    },
    {
      label: "Most Popular Plan",
      value: `${topPlan.name} (${topPlan.count} subs)`,
      icon: Sparkles, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10",
      desc: "Highest subscriber volume plan"
    },
    {
      label: "ARPU",
      value: formatCurrency(arpu),
      icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10",
      desc: "Average Revenue Per Active User"
    },
    {
      label: "Avg Invoice Value",
      value: formatCurrency(avgInvoice),
      icon: FileDown, color: "text-cyan-400", bg: "bg-cyan-500/10",
      desc: "Mean revenue per customer"
    },
    {
      label: "Payment Success Rate",
      value: `${successRate}%`,
      icon: ShieldCheck, color: "text-green-400", bg: "bg-green-500/10",
      desc: "Gateway transaction success ratio"
    },
    {
      label: "Trial Users",
      value: String(stats.trialCount || 0),
      icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10",
      desc: "Accounts pending conversion"
    },
    {
      label: "Revenue vs. Churn",
      value: `${((stats.activeCount / (stats.customersCount || 1)) * 100).toFixed(0)}% retention`,
      icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10",
      desc: "Active subscriber retention rate"
    },
    {
      label: "Failed Payments",
      value: String(failed),
      icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10",
      desc: "Declined charges requiring review"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {insights.map((ins, i) => {
        const Icon = ins.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-start gap-3 p-3.5 bg-zinc-900/30 hover:bg-zinc-900/60 border border-white/5 rounded-xl transition-all"
          >
            <div className={`w-8 h-8 rounded-xl ${ins.bg} border border-white/5 flex items-center justify-center shrink-0 mt-0.5`}>
              <Icon size={14} className={ins.color} />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] uppercase text-zinc-500 tracking-wider font-bold block">{ins.label}</span>
              <span className="text-white font-bold text-xs block mt-0.5 truncate">{ins.value}</span>
              <span className="text-[10px] text-zinc-600 block leading-relaxed">{ins.desc}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Monthly Collections Bar Chart ────────────────────────────────────────
function MonthlyCollectionsChart({ data = [] }) {
  const maxVal = Math.max(...data.map(d => d.revenue || 0), 100);
  return (
    <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
      <div className="border-b border-white/5 pb-3 mb-4">
        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Collections</span>
        <h4 className="text-sm font-bold text-white mt-0.5">Monthly Collections (Bar)</h4>
      </div>

      <div className="flex items-end justify-between gap-2 h-36 pb-1">
        {data.map((d, i) => {
          const pct = maxVal > 0 ? (d.revenue / maxVal) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
              <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 border border-white/10 px-2 py-1 rounded text-[9px] font-bold text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                {formatCurrency(d.revenue)}
              </div>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.5 }}
                className="w-full rounded-t-lg bg-gradient-to-t from-[#8B5CF6]/40 to-[#8B5CF6] group-hover:from-[#8B5CF6] shadow transition-all"
              />
              <span className="text-[9px] text-zinc-500 mt-1.5 font-mono font-bold">{d.month}</span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-[9px] text-zinc-600 font-mono mt-2 border-t border-white/5 pt-2">
        <span>₹0</span>
        <span>₹{Math.round(maxVal / 2).toLocaleString()}</span>
        <span>₹{maxVal.toLocaleString()} max</span>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function Analytics() {
  const { showToast } = useToast();
  const [analytics,    setAnalytics]    = useState(null);
  const [dashStats,    setDashStats]    = useState([]);
  const [plans,        setPlans]        = useState([]);
  const [recentLogs,   setRecentLogs]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filters
  const [dateRange,    setDateRange]    = useState("All Time");
  const [planFilter,   setPlanFilter]   = useState("All");
  const [activeTab,    setActiveTab]    = useState("revenue");
  const [customDates,  setCustomDates]  = useState({ start: "", end: "" });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [analyticsData, statsData, plansData, logsData] = await Promise.all([
          getAnalytics(),
          getDashboardStats().catch(() => []),
          getPlans().catch(() => ({ plans: [] })),
          getAuditLogs({ limit: 8 }).catch(() => ({ logs: [] }))
        ]);
        setAnalytics(analyticsData);
        setDashStats(Array.isArray(statsData) ? statsData : []);
        setPlans(plansData?.plans || []);
        setRecentLogs(logsData?.logs || []);
      } catch (err) {
        console.error("Error loading analytics data dashboard metrics:", err);
        showToast("Error fetching analytics data.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(c => c + 1);
    showToast("Analytics dashboard refreshed.", "success");
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!analytics) return;
    const { stats, planDistribution, paymentsChart } = analytics;
    const rows = [
      ["BillFlow Analytics Report", ""],
      ["Export Date", new Date().toLocaleString()],
      [],
      ["Platform Stats Summary"],
      ["Metric", "Value"],
      ["Total Revenue", formatCurrency(stats.totalRevenue)],
      ["Total Customers", stats.customersCount],
      ["Active Subscriptions", stats.activeCount],
      ["Trial Users", stats.trialCount],
      [],
      ["Plan Distribution"],
      ["Plan", "Count"],
      ...planDistribution.map(p => [p.name, p.count]),
      [],
      ["Payments"],
      ["Success Rate (%)", `${paymentsChart.successRate}%`],
      ["Failed Payments", paymentsChart.failedCount]
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `billflow_analytics_${Date.now()}.csv`;
    link.click();
    showToast("Analytics report exported.", "success");
  };

  // Export JSON
  const handleExportJSON = () => {
    if (!analytics) return;
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), analytics }, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `billflow_analytics_${Date.now()}.json`;
    link.click();
    showToast("JSON report exported.", "success");
  };

  return (
    <div className="space-y-8 adm-fadein text-left max-w-7xl mx-auto w-full">

      {/* ── 1. HERO HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">BillFlow Admin</span>
            <span className="text-[#1E293B]">›</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B5CF6]">Analytics</span>
          </div>
          <h2 className="adm-page-title flex items-center gap-2">
            <BarChart2 size={22} className="text-[#8B5CF6]" />
            Analytics
          </h2>
          <p className="adm-page-sub">Monitor platform growth, recurring revenue, customer trends and business performance.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={loading || !analytics}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5 disabled:opacity-40"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={loading || !analytics}
            className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5 disabled:opacity-40"
            style={{ fontSize: "12px", padding: "7px 14px", border: "none" }}
          >
            <FileDown size={13} />
            Export JSON
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>
      {/* ── TABS STRIP ── */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {[
          { key: "revenue",      label: "Revenue Analytics",      icon: DollarSign },
          { key: "tax",          label: "Tax Analytics",          icon: Percent },
          { key: "subscription", label: "Subscription Analytics", icon: Activity },
          { key: "customer",     label: "Customer Analytics",     icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                isActive
                  ? "bg-[#8B5CF6]/15 border-[#8B5CF6]/25 text-[#8B5CF6]"
                  : "bg-transparent border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Icon size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── 2. FILTER BAR ── */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-lg backdrop-blur-md">
        <div className="flex flex-col space-y-1">
          <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Date Range</label>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
          >
            {["All Time", "Today", "Last 7 Days", "Last 30 Days", "This Month", "This Year", "Custom Range"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {dateRange === "Custom Range" && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Start Date</label>
              <input
                type="date"
                value={customDates.start}
                onChange={e => setCustomDates(prev => ({ ...prev, start: e.target.value }))}
                className="bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6]"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">End Date</label>
              <input
                type="date"
                value={customDates.end}
                onChange={e => setCustomDates(prev => ({ ...prev, end: e.target.value }))}
                className="bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6]"
              />
            </div>
          </div>
        )}

        {activeTab !== "tax" && (
          <>
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Plan</label>
              <select
                value={planFilter}
                onChange={e => setPlanFilter(e.target.value)}
                className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
              >
                <option value="All">All Plans</option>
                {plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Billing Cycle</label>
              <select className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer">
                {["All Cycles","Monthly","Annual"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="flex flex-col space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#475569] tracking-wider">Payment Status</label>
              <select className="bg-zinc-950/50 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer">
                {["All","Paid","Failed","Refunded"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </>
        )}

        <div className="flex items-end ml-auto gap-2">
          <button
            type="button"
            onClick={() => { setDateRange("All Time"); setPlanFilter("All"); }}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none"
            style={{ fontSize: "11px", padding: "6px 12px" }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── 3. LOADING / DATA ── */}
      {loading ? (
        <div className="space-y-8">
          <AdminStatsSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-zinc-900/40 border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : !analytics ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-center">
            <BarChart2 size={36} className="text-[#8B5CF6]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">No Analytics Available</h3>
            <p className="text-zinc-500 text-sm mt-2">Business insights will appear once transactions are generated.</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "13px", padding: "9px 20px", border: "none" }}
          >
            <RefreshCw size={14} />
            Refresh Data
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {activeTab === "revenue" && (
            <>
              {/* ── 4. KPI CARDS ── */}
              <AnalyticsSummaryCard stats={analytics.stats} dashboardStats={dashStats} />

              {/* ── 5. MAIN CHARTS GRID (row 1) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <RevenueChartCard data={analytics.revenueChart} />
                </div>
              </div>

              {/* ── 6. CHARTS ROW 2 ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MonthlyCollectionsChart data={analytics.revenueChart} />
                <PaymentSuccessChart chartData={analytics.paymentsChart} />
              </div>

              {/* ── 7. BOTTOM PANELS (Top Plans + Business Insights) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Plans Leaderboard */}
                <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
                  <div className="border-b border-white/5 pb-3.5 mb-4">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Revenue Leaders</span>
                    <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                      <Award size={15} className="text-amber-400" />
                      Top Performing Plans
                    </h4>
                  </div>
                  <TopPlansLeaderboard planDist={analytics.planDistribution} plans={plans} />
                </div>

                {/* Business Insights */}
                <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
                  <div className="border-b border-white/5 pb-3.5 mb-4">
                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Intelligence</span>
                    <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                      <Sparkles size={15} className="text-[#8B5CF6]" />
                      Business Insights
                    </h4>
                  </div>
                  <BusinessInsightsPanel analytics={analytics} dashStats={dashStats} />
                </div>
              </div>
            </>
          )}

          {activeTab === "tax" && (
            <TaxAnalytics dateRangeFilter={dateRange} customDates={customDates} />
          )}

          {activeTab === "subscription" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SubscriptionChart data={analytics.planDistribution} revenueChart={analytics.revenueChart} />
              <CustomerGrowthChart trends={analytics.trendsChart} />
            </div>
          )}

          {activeTab === "customer" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
              <div className="lg:col-span-2">
                <CustomerGrowthChart trends={analytics.trendsChart} />
              </div>
              {/* Recent Business Events Timeline */}
              <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col">
                <div className="border-b border-white/5 pb-3.5 mb-4">
                  <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Live Activity</span>
                  <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                    <Activity size={15} className="text-green-400" />
                    Recent Business Events
                  </h4>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[480px] scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent pr-1">
                  <BusinessEventTimeline logs={recentLogs} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
