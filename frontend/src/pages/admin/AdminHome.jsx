// src/pages/admin/AdminHome.jsx
import { useEffect, useState } from "react";
import { RotateCcw, ArrowUpRight, Zap, Play, CheckCircle2, TrendingUp, Users, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getDashboardStats,
  getRecentActivities,
  getSystemStatus,
  getPlatformOverview,
  getTodaySummary,
  getRetries,
  getRetryHistory
} from "../../services/adminService";
import RetryOverviewCard from "../../components/admin/Dashboard/RetryOverviewCard";
import DashboardStatCard from "../../components/admin/Dashboard/DashboardStatCard";
import OverviewChartCard from "../../components/admin/Dashboard/OverviewChartCard";
import RecentActivityCard from "../../components/admin/Dashboard/RecentActivityCard";
import QuickActionsCard from "../../components/admin/Dashboard/QuickActionsCard";
import SystemStatusCard from "../../components/admin/Dashboard/SystemStatusCard";
import PlatformOverviewCard from "../../components/admin/Dashboard/PlatformOverviewCard";
import TodaySummaryCard from "../../components/admin/Dashboard/TodaySummaryCard";
import ActionCenter from "../../components/admin/Dashboard/ActionCenter";

// Import the generated 3D illustration asset
import heroImage from "../../assets/hero.png";

function StatSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl animate-pulse"
          style={{
            height: "140px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        />
      ))}
    </div>
  );
}

function SmallSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl animate-pulse"
          style={{
            height: "280px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}
        />
      ))}
    </div>
  );
}

function greetingTime() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function AdminHome() {
  const [stats, setStats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [platformOverview, setPlatformOverview] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [retryStats, setRetryStats] = useState({ pending: 0, recovered: 0, failed: 0, successRate: 0 });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [error, setError] = useState(null);

  const userString = localStorage.getItem("current_user");
  const user = userString ? JSON.parse(userString) : { name: "Admin" };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError(null);
        const isSilent = refreshCount > 0;
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);

        const [statsData, actData, sysData, platData, todayData, queueData, historyData] = await Promise.all([
          getDashboardStats(),
          getRecentActivities(),
          getSystemStatus(),
          getPlatformOverview(),
          getTodaySummary(),
          getRetries(),
          getRetryHistory()
        ]);

        // Filter metrics to show only the 6 core KPI cards required:
        // Total Customers, Active Subscriptions, Trial Users, Monthly Revenue, Total Invoices, Failed Payments
        const coreStats = statsData.filter(s =>
          [
            "total customers",
            "active subscriptions",
            "trial users",
            "monthly revenue",
            "total invoices",
            "failed payments"
          ].includes(s.title.toLowerCase())
        );

        setStats(coreStats.length > 0 ? coreStats : statsData.slice(0, 6));
        setActivities(actData);
        setSystemStatus(sysData);
        setPlatformOverview(platData);
        setTodaySummary(todayData);

        const pending = (queueData || []).filter(r => r.status === "PENDING").length;
        const recovered = (historyData || []).filter(r => r.status === "SUCCESS").length;
        const failed = (historyData || []).filter(r => r.status === "FAILED" || r.status === "EXHAUSTED").length;
        const total = recovered + failed;
        const successRate = total > 0 ? Math.round((recovered / total) * 100) : 0;
        setRetryStats({ pending, recovered, failed, successRate });
      } catch (err) {
        console.error("Error fetching administrative metrics:", err);
        setError("Failed to load platform statistics. Please check database connectivity.");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchDashboardData();
  }, [refreshCount]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    setRefreshCount(prev => prev + 1);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Today stats mapping for Hero and Quick Status Chips
  const todayRevenue = todaySummary?.revenue || "₹0";
  const todayNewCustomers = todaySummary?.newCustomers || "0";
  const todayNewSubscriptions = todaySummary?.newSubscriptions || "0";
  const todayFailedPayments = stats.find(s => s.title.toLowerCase() === "failed payments")?.value || "0";

  return (
    <div className="space-y-8 text-left">
      
      {/* ── Page Top Action Row ── */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-black uppercase tracking-widest text-[#8B5CF6]">
          Admin Console
        </h1>
        
        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            type="button"
            disabled={loading || isRefreshing}
            onClick={handleRefresh}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none"
            style={{ fontSize: "11px", padding: "6px 12px" }}
          >
            <RotateCcw
              size={12}
              style={{ animation: isRefreshing ? "adm-spin 0.8s linear infinite" : "none" }}
            />
            {isRefreshing ? "Refreshing..." : "Sync Live"}
          </button>
          
          <Link
            to="/admin/analytics"
            className="adm-btn adm-btn-primary cursor-pointer focus:outline-none text-[11px]"
            style={{
              padding: "6px 12px",
              background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
              border: "none",
              textDecoration: "none"
            }}
          >
            <ArrowUpRight size={12} />
            Analytics Report
          </Link>
        </div>
      </div>

      {/* ── 1. Hero Section ── */}
      <div className="adm-hero p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-3 max-w-xl text-left">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "#F8FAFC" }}>
            {greetingTime()},{" "}
            <span style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {user.name?.split(" ")[0] || "Admin"}
            </span> 👋
          </h2>
          <p className="text-sm font-light leading-relaxed" style={{ color: "#94A3B8" }}>
            Welcome to your BillFlow platform control center. Track your metrics, manage subscriptions, resolve billing anomalies, and manage streaming package revenue in real-time.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px]" style={{ color: "#475569" }}>
            <span>Console Sync:</span>
            <span className="font-mono">{dateStr}</span>
          </div>
        </div>

        {/* Abstract 3D Image on the right side */}
        <div className="relative w-44 h-28 sm:w-56 sm:h-36 overflow-hidden rounded-xl border border-white/5 bg-zinc-950 flex items-center justify-center">
          <img
            src={heroImage}
            alt="Platform overview visual"
            className="w-full h-full object-cover opacity-85 hover:scale-105 transition-all duration-300"
          />
          {/* Neon overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ── 2. Quick Status Chips ── */}
      <div className="flex flex-wrap gap-3 py-1">
        {/* System Health */}
        <div className="adm-status-chip adm-status-chip-green">
          <CheckCircle2 size={13} />
          <span>System Status: Healthy</span>
        </div>

        {/* Revenue today */}
        <div className="adm-status-chip adm-status-chip-purple">
          <TrendingUp size={13} />
          <span>Today's Revenue: {todayRevenue}</span>
        </div>

        {/* New customers */}
        <div className="adm-status-chip adm-status-chip-purple">
          <Users size={13} />
          <span>New Customers: {todayNewCustomers}</span>
        </div>

        {/* Renewals today */}
        <div className="adm-status-chip adm-status-chip-amber">
          <RefreshCw size={13} />
          <span>Renewals Today: {todayNewSubscriptions}</span>
        </div>

        {/* Failed payments */}
        <div className="adm-status-chip adm-status-chip-red">
          <AlertTriangle size={13} />
          <span>Failed Payments: {todayFailedPayments}</span>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div
          className="rounded-2xl p-5 flex items-start gap-4 adm-fadein"
          style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <div className="adm-icon-box adm-icon-rose flex-shrink-0">
            <AlertTriangle size={15} style={{ color: "#EF4444" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: "#F87171" }}>Sync Exception</p>
            <p className="text-xs mt-0.5" style={{ color: "#EF4444" }}>{error}</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            className="adm-btn flex-shrink-0 cursor-pointer focus:outline-none"
            style={{ background: "rgba(239,68,68,0.15)", color: "#FCA5A5", border: "1px solid rgba(239,68,68,0.25)", fontSize: "11px", padding: "6px 12px" }}
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* ── 3. KPI Stats Grid ── */}
      {loading ? (
        <StatSkeleton />
      ) : !error ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stats.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <DashboardStatCard
                title={item.title}
                value={item.value}
                trend={item.trend}
                isPositive={item.isPositive}
                path={item.path}
              />
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* ── 4. Action Center + Revenue Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-1">
          <ActionCenter />
        </div>
        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-2xl" style={{ height: "340px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
          ) : (
            <OverviewChartCard />
          )}
        </div>
      </div>

      {/* ── 5. System Health + Platform Overview + Today's Summary + Retry Overview ── */}
      {loading ? (
        <SmallSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SystemStatusCard systemStatus={systemStatus} />
          <PlatformOverviewCard overview={platformOverview} />
          <TodaySummaryCard summary={todaySummary} />
          <RetryOverviewCard stats={retryStats} />
        </div>
      )}

      {/* ── 6. Recent Activity + Quick Actions Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        {loading ? (
          <div className="rounded-2xl" style={{ height: "340px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
        ) : (
          <RecentActivityCard activities={activities} />
        )}
        <QuickActionsCard />
      </div>

    </div>
  );
}
