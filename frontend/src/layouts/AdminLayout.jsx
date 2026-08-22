// src/layouts/AdminLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Package, RefreshCw, CreditCard,
  FileText, BarChart2, Clock, RotateCcw, Settings as SettingsIcon,
  LogOut, Bell, Search, ChevronDown, X, Menu, Zap,
  Activity, Wifi, HardDrive, ArrowUpRight, Film, Tv, Image,
  Sun, Moon
} from "lucide-react";
import AdminHome from "../pages/admin/AdminHome";
import Customers from "../pages/admin/Customers";
import Plans from "../pages/admin/Plans";
import Subscriptions from "../pages/admin/Subscriptions";
import Payments from "../pages/admin/Payments";
import Invoices from "../pages/admin/Invoices";
import Analytics from "../pages/admin/Analytics";
import AuditLogs from "../pages/admin/AuditLogs";
import SettingsPage from "../pages/admin/Settings";
import Refunds from "../pages/admin/Refunds";
import RetryQueue from "../pages/admin/RetryQueue";
import MoviesCMS from "../pages/admin/MoviesCMS";
import SeriesCMS from "../pages/admin/SeriesCMS";
import MediaLibrary from "../pages/admin/MediaLibrary";
import { getAdminRefunds } from "../services/adminService";
import NotificationDropdown from "../components/admin/Shared/NotificationDropdown";
import { AdminThemeProvider, useAdminTheme } from "../context/AdminThemeContext";

const menuItems = [
  { label: "Dashboard",     path: "/admin",               icon: LayoutDashboard, exact: true },
  { label: "Customers",     path: "/admin/customers",     icon: Users },
  { label: "Plans",         path: "/admin/plans",         icon: Package },
  { label: "Subscriptions", path: "/admin/subscriptions", icon: RefreshCw },
  { label: "Payments",      path: "/admin/payments",      icon: CreditCard },
  { label: "Retry Queue",   path: "/admin/retries",       icon: Clock },
  { label: "Invoices",      path: "/admin/invoices",      icon: FileText },
  { label: "Analytics",     path: "/admin/analytics",     icon: BarChart2 },
  { label: "Audit Logs",    path: "/admin/audit-logs",    icon: Clock },
  { label: "Refunds",       path: "/admin/refunds",       icon: RotateCcw },
  { label: "Movies CMS",    path: "/admin/movies",        icon: Film },
  { label: "TV Series CMS", path: "/admin/series",        icon: Tv },
  { label: "Media Library", path: "/admin/media",         icon: Image },
  { label: "Settings",      path: "/admin/settings",      icon: SettingsIcon },
];

const getInitials = (name) => {
  if (!name) return "AD";
  const p = name.trim().split(" ");
  if (p.length === 1) return p[0].substring(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

// Platform Health widget shown at sidebar bottom
function PlatformHealthWidget() {
  return (
    <div className="adm-health-widget mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Activity size={12} style={{ color: "#8B5CF6" }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#8B5CF6" }}>Platform Health</span>
        </div>
        <span className="adm-dot-green" style={{ width: "6px", height: "6px" }} />
      </div>

      <div className="space-y-2.5">
        {/* API uptime */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: "#94A3B8" }}>API Uptime</span>
            <span className="text-[10px] font-bold" style={{ color: "#4ADE80" }}>99.98%</span>
          </div>
          <div className="adm-progress">
            <div className="adm-progress-fill" style={{ width: "99.98%", background: "linear-gradient(90deg, #22C55E, #4ADE80)" }} />
          </div>
        </div>

        {/* Storage */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: "#94A3B8" }}>Storage</span>
            <span className="text-[10px] font-bold" style={{ color: "#FCD34D" }}>68 / 100 GB</span>
          </div>
          <div className="adm-progress">
            <div className="adm-progress-fill" style={{ width: "68%", background: "linear-gradient(90deg, #F59E0B, #FCD34D)" }} />
          </div>
        </div>

        {/* Response time */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Wifi size={10} style={{ color: "#475569" }} />
            <span className="text-[10px]" style={{ color: "#475569" }}>Response</span>
          </div>
          <span className="text-[10px] font-mono font-bold" style={{ color: "#A78BFA" }}>120ms</span>
        </div>
      </div>
    </div>
  );
}

function SidebarContent({ location, onClose, pendingRefundsCount, handleLogout }) {
  const isActive = (path, exact) => {
    if (exact || path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="adm-sidebar flex flex-col h-full" style={{ width: "230px" }}>
      {/* Brand */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <Link to="/admin" onClick={onClose} className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)", boxShadow: "0 4px 16px rgba(139,92,246,0.35)" }}
          >
            <Zap size={15} fill="white" color="white" />
          </div>
          <div>
            <span className="text-[14px] font-black tracking-tight" style={{ color: "var(--adm-text)" }}>
              Bill<span style={{ color: "#A78BFA" }}>Flow</span>
            </span>
            <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--adm-muted)", marginTop: "-1px" }}>
              Admin Console
            </div>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <hr className="adm-divider mx-5 mb-3" />

      {/* Nav label */}
      <div className="px-5 mb-2">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--adm-muted)" }}>Menu</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto adm-scrollbar pb-4">
        {menuItems.map((item) => {
          const active = isActive(item.path, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className={`adm-nav-item ${active ? "active" : ""}`}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span className="flex-1 text-[13px]">{item.label}</span>
              {item.label === "Refunds" && pendingRefundsCount > 0 && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(245,158,11,0.15)", color: "#FCD34D", border: "1px solid rgba(245,158,11,0.25)" }}
                >
                  {pendingRefundsCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Platform Health Widget */}
      <PlatformHealthWidget />

      {/* Divider + Logout */}
      <hr className="adm-divider mx-4 mb-3" />
      <div className="px-3 pb-5 flex-shrink-0">
        <button
          type="button"
          onClick={handleLogout}
          className="adm-nav-item w-full text-left cursor-pointer focus:outline-none"
          style={{ color: "#64748B" }}
        >
          <LogOut size={15} style={{ flexShrink: 0 }} />
          <span className="text-[13px]">Log out</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent />
    </AdminThemeProvider>
  );
}

function AdminLayoutContent() {
  const { theme, toggleTheme } = useAdminTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pendingRefundsCount, setPendingRefundsCount] = useState(0);

  const profileMenuRef = useRef(null);

  const fetchPendingRefundsCount = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;
      const res = await getAdminRefunds();
      if (res) {
        const count = res.filter(r => r.status.toUpperCase() === "PENDING").length;
        setPendingRefundsCount(count);
      }
    } catch (err) {
      console.error("Failed to load pending refunds count:", err);
    }
  };

  useEffect(() => {
    fetchPendingRefundsCount();
    window.addEventListener("refund_state_updated", fetchPendingRefundsCount);
    window.addEventListener("billing_state_updated", fetchPendingRefundsCount);
    return () => {
      window.removeEventListener("refund_state_updated", fetchPendingRefundsCount);
      window.removeEventListener("billing_state_updated", fetchPendingRefundsCount);
    };
  }, []);

  const userString = localStorage.getItem("current_user");
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem("access_token");
  const userRole = user?.role?.toUpperCase();

  useEffect(() => {
    if (!token || !user || userRole !== "ADMIN") navigate("/login");
  }, [token, user, userRole, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!token || !user || userRole !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#09090B" }}>
        <div className="text-center space-y-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent mx-auto"
            style={{ borderColor: "#8B5CF6", borderTopColor: "transparent", animation: "adm-spin 0.8s linear infinite" }}
          />
          <p className="text-sm" style={{ color: "#475569" }}>Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");
    navigate("/login");
  };

  // Get current page label for breadcrumb
  const currentPage = menuItems.find(m =>
    m.exact
      ? (location.pathname === "/admin" || location.pathname === "/admin/")
      : location.pathname.startsWith(m.path)
  );

  return (
    <div className={`adm-root theme-${theme} flex overflow-hidden`} style={{ minHeight: "100vh" }}>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 flex-shrink-0">
        <SidebarContent
          location={location}
          onClose={() => {}}
          pendingRefundsCount={pendingRefundsCount}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
            />
            <motion.div
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative h-full z-10"
              style={{ background: "var(--adm-bg)" }}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer focus:outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "#94A3B8" }}
              >
                <X size={14} />
              </button>
              <SidebarContent
                location={location}
                onClose={() => setIsOpen(false)}
                pendingRefundsCount={pendingRefundsCount}
                handleLogout={handleLogout}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* Header */}
        <header
          className="adm-header sticky top-0 z-40 flex-shrink-0"
          style={{ padding: "0 40px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="lg:hidden p-2 rounded-lg cursor-pointer focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", color: "#94A3B8" }}
            >
              <Menu size={16} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px]">
              <span style={{ color: "var(--adm-muted)" }}>BillFlow</span>
              <span style={{ color: "var(--adm-muted)" }}>›</span>
              <span style={{ color: "#8B5CF6" }} className="font-semibold">
                {currentPage?.label || "Dashboard"}
              </span>
            </div>

            {/* Search */}
            <div className="adm-search hidden md:flex items-center gap-2 px-3" style={{ width: "260px", height: "34px" }}>
              <Search size={13} style={{ color: "var(--adm-muted)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent outline-none border-none w-full text-xs"
                style={{ color: "var(--adm-text)" }}
                readOnly
              />
              <span
                className="text-[9px] font-mono px-1.5 py-0.5 rounded hidden lg:block"
                style={{ background: "rgba(255,255,255,0.05)", color: "#334155", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                ⌘K
              </span>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2.5">
            <NotificationDropdown />

            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.05)" }} className="adm-divider" />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-xl cursor-pointer focus:outline-none transition-all flex items-center justify-center hover:scale-105"
              style={{ color: "var(--adm-muted)", background: "transparent" }}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.05)" }} className="adm-divider" />

            {/* Profile */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 cursor-pointer focus:outline-none rounded-xl px-2 py-1.5 transition-colors"
                style={{ color: "var(--adm-muted)" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }}
                >
                  {getInitials(user.name)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold" style={{ color: "var(--adm-text)", lineHeight: 1.2 }}>
                    {user.name?.split(" ")[0] || "Admin"}
                  </div>
                  <div className="text-[9px]" style={{ color: "var(--adm-muted)" }}>Administrator</div>
                </div>
                <ChevronDown size={11} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 rounded-xl border shadow-2xl p-2 z-50"
                    style={{
                      width: "196px",
                      background: "rgba(14,14,18,0.97)",
                      backdropFilter: "blur(24px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      transformOrigin: "top right"
                    }}
                  >
                    <div className="px-3 py-2 mb-1" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-xs font-bold truncate" style={{ color: "#F8FAFC" }}>{user.name}</p>
                      <p className="text-[10px] truncate mt-0.5" style={{ color: "#475569" }}>{user.email}</p>
                    </div>
                    {[
                      { to: "/admin", label: "Dashboard" },
                      { to: "/admin/settings", label: "Settings" }
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-3 py-2 text-xs rounded-lg transition-colors"
                        style={{ color: "#94A3B8" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "6px 0" }} />
                    <button
                      type="button"
                      onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors cursor-pointer focus:outline-none"
                      style={{ color: "#F87171" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.07)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ padding: "40px 40px 64px" }}>
          <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
            <Routes>
              <Route index element={<AdminHome />} />
              <Route path="home" element={<AdminHome />} />
              <Route path="customers" element={<Customers />} />
              <Route path="plans" element={<Plans />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="payments" element={<Payments />} />
              <Route path="retries" element={<RetryQueue />} />
              <Route path="invoices" element={<Invoices />} />
              <Route path="refunds" element={<Refunds />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="movies" element={<MoviesCMS />} />
              <Route path="series" element={<SeriesCMS />} />
              <Route path="media" element={<MediaLibrary />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
