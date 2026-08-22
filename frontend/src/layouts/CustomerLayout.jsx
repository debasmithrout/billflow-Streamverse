// src/layouts/CustomerLayout.jsx
import { useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

// ── Page Imports ──────────────────────────────────────────────
import CustomerHome     from "../pages/customer/CustomerHome";
import Profile          from "../pages/customer/Profile";
import Billing          from "../pages/customer/Billing";
import Subscription     from "../pages/customer/Subscription";
import Movies           from "../pages/customer/Movies";
import TVShows          from "../pages/customer/TVShows";
import MyList           from "../pages/customer/MyList";
import Settings         from "../pages/customer/Settings";
import Watch            from "../pages/customer/watch/Watch";
import { ModalProvider } from "../context/ModalContext";


// ── Shared Components ─────────────────────────────────────────
import NotificationDropdown from "../components/customer/Shared/NotificationDropdown";
import { initializeCustomerDemoData } from "../services/customerService";
import { SubscriptionProvider, useSubscription } from "../context/SubscriptionContext";
import { getCurrentUser } from "../services/authService";

// ─── Nav Items ────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/customer",
    exact: true,
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Movies",
    path: "/customer/movies",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    label: "TV Shows",
    path: "/customer/tv-shows",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "My List",
    path: "/customer/my-list",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
];

const ACCOUNT_NAV_ITEMS = [
  {
    label: "Subscription",
    path: "/customer/subscription",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    label: "Billing",
    path: "/customer/billing",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    path: "/customer/profile",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/customer/settings",
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

// ─── Helpers ──────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return "SV";
  const p = name.trim().split(" ");
  if (p.length === 1) return p[0].substring(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
};

const getPlanBadge = (subscription) => {
  if (!subscription) return { label: "FREE", cls: "bg-white/10 text-white/50 border-white/10" };
  const s = (subscription.status || "").toUpperCase();
  const p = (subscription.planName || "").toUpperCase().replace(/\s*PLAN\s*/g, "").trim();
  if (s === "CANCELLED" || s === "EXPIRED") return { label: s, cls: "bg-zinc-800 text-zinc-400 border-zinc-700" };
  if (s === "TRIAL") return { label: "FREE TRIAL", cls: "bg-amber-500/15 text-amber-400 border-amber-500/20" };
  if (p === "PREMIUM" || p === "FAMILY") return { label: p || "PREMIUM", cls: "bg-purple-500/15 text-purple-300 border-purple-500/20" };
  if (p) return { label: p, cls: "bg-green-500/10 text-green-400 border-green-500/20" };
  return { label: "ACTIVE", cls: "bg-green-500/10 text-green-400 border-green-500/20" };
};

// ─── Upgrade Promo Card (Sidebar bottom) ──────────────────────
function SidebarUpgradeCard({ subscription }) {
  const navigate = useNavigate();
  const s = (subscription?.status || "").toUpperCase();
  const isTrial = s === "TRIAL" || !subscription;
  const isPremium = (subscription?.planName || "").toUpperCase().includes("PREMIUM");
  const isFamily  = (subscription?.planName || "").toUpperCase().includes("FAMILY");
  if (isPremium || isFamily) return null;

  return (
    <div className="mx-3 mb-4 rounded-2xl p-4 bg-gradient-to-br from-purple-900/40 to-violet-900/20 border border-purple-500/15">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs">✦</div>
        <span className="text-xs font-bold text-white">
          {isTrial ? "Start Premium" : "Upgrade Plan"}
        </span>
      </div>
      <p className="text-[10px] text-white/50 leading-relaxed mb-3">
        {isTrial
          ? "Unlock unlimited movies, 4K streams & Dolby Audio."
          : "Get 4K Ultra HD on all screens with Family Plan."}
      </p>
      <button
        onClick={() => navigate("/customer/subscription")}
        className="w-full py-2 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 transition-all"
      >
        Upgrade Now
      </button>
    </div>
  );
}

// ─── Sidebar Content ───────────────────────────────────────────
function SidebarContent({ onClose }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { subscription } = useSubscription();

  const userStr = localStorage.getItem("current_user");
  const user    = userStr ? JSON.parse(userStr) : { name: "StreamVerse", email: "" };
  const badge   = getPlanBadge(subscription);

  const isActive = (path, exact = false) => {
    if (exact || path === "/customer") {
      return location.pathname === "/customer" || location.pathname === "/customer/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0a0a14", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
      {/* Logo */}
      <div className="px-5 py-6 flex-shrink-0">
        <Link to="/customer" onClick={onClose} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-105 transition-transform">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 6l8-4 8 4v12l-8 4-8-4V6z" opacity="0.7" />
              <path d="M4 6l8 4 8-4M12 10v10" stroke="white" strokeWidth="0.5" fill="none" />
            </svg>
          </div>
          <div>
            <span className="text-[17px] font-black tracking-tight text-white">
              Stream<span className="text-purple-400">Verse</span>
            </span>
          </div>
        </Link>
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-3 pb-4 space-y-6">
        {/* Streaming section */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/25 px-3 mb-2">Stream</p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`sv-sidebar-item flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold ${
                    active
                      ? "sv-sidebar-active"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-purple-400" : "text-white/30"}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account section */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/25 px-3 mb-2">Account</p>
          <nav className="space-y-0.5">
            {ACCOUNT_NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`sv-sidebar-item flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold ${
                    active
                      ? "sv-sidebar-active"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <span className={active ? "text-purple-400" : "text-white/30"}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Upgrade card */}
      <SidebarUpgradeCard subscription={subscription} />

      {/* User & logout */}
      <div className="flex-shrink-0 border-t border-white/5 mx-3 pt-3 pb-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
          <div className="sv-avatar w-8 h-8 text-xs flex-shrink-0" style={{ fontSize: "11px" }}>
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="sv-sidebar-item w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-red-400/70 hover:text-red-400"
        >
          <svg className="w-[18px] h-[18px] text-red-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

// ─── Top Navbar ────────────────────────────────────────────────
function TopNavbar({ onMenuOpen }) {
  const [profileOpen, setProfileOpen]   = useState(false);
  const [searchFocus, setSearchFocus]   = useState(false);
  const profileRef = useRef(null);
  const navigate   = useNavigate();
  const { subscription } = useSubscription();

  const userStr = localStorage.getItem("current_user");
  const user    = userStr ? JSON.parse(userStr) : { name: "StreamVerse", email: "" };
  const badge   = getPlanBadge(subscription);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("current_user");
    navigate("/login");
  };

  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-4 px-5 py-3 flex-shrink-0"
      style={{
        background: "rgba(8,8,17,0.85)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onMenuOpen}
        className="lg:hidden p-2 -ml-1 rounded-xl text-white/50 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile logo */}
      <span className="lg:hidden text-base font-black tracking-tight text-white">
        Stream<span className="text-purple-400">Verse</span>
      </span>

      {/* Search bar */}
      <div
        className={`hidden sm:flex items-center gap-2.5 rounded-xl px-3.5 py-2 transition-all flex-1 max-w-xs ${
          searchFocus ? "border-purple-500/40 bg-white/6" : "border-white/8 bg-white/4"
        }`}
        style={{ border: `1px solid ${searchFocus ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.07)"}`, background: searchFocus ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)" }}
      >
        <svg className="w-3.5 h-3.5 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search movies, shows and more..."
          className="bg-transparent text-xs text-white/80 placeholder-white/25 outline-none w-full"
          onFocus={() => setSearchFocus(true)}
          onBlur={() => setSearchFocus(false)}
        />
        <kbd className="hidden sm:inline text-[9px] text-white/20 border border-white/10 rounded px-1.5 py-0.5 font-mono">Ctrl K</kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <NotificationDropdown />

        {/* Divider */}
        <div className="w-px h-6 bg-white/8 hidden sm:block" />

        {/* Profile avatar */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((p) => !p)}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
          >
            <div className="sv-avatar w-8 h-8 text-xs flex-shrink-0 text-[11px]">
              {getInitials(user.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">{user.name}</p>
              <span className={`text-[8px] font-black uppercase tracking-wider px-1 rounded border ${badge.cls}`}>
                {badge.label}
              </span>
            </div>
            <svg
              className={`hidden sm:block w-3 h-3 text-white/30 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              className="absolute right-0 top-12 w-52 rounded-2xl p-2 z-50 animate-fade-in"
              style={{ background: "#0f0f1e", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
            >
              <div className="px-3 py-2.5 border-b border-white/5 mb-2">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/35 mt-0.5 truncate">{user.email}</p>
              </div>
              {[
                { label: "My Profile", path: "/customer/profile" },
                { label: "Subscription", path: "/customer/subscription" },
                { label: "Billing & Invoices", path: "/customer/billing" },
                { label: "Settings", path: "/customer/settings" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-white/5 mt-2 pt-2">
                <button
                  onClick={() => { setProfileOpen(false); handleLogout(); }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer focus:outline-none"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Inner Layout ──────────────────────────────────────────────
function CustomerLayoutInner() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { refreshSubscription }     = useSubscription();

  const token = localStorage.getItem("access_token");

  // Token validation on mount
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    const validate = async () => {
      try {
        await getCurrentUser(token);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("current_user");
        navigate("/login");
      }
    };
    validate();
  }, [token, navigate]);

  // Refresh subscription + demo data on route change
  useEffect(() => {
    initializeCustomerDemoData();
    refreshSubscription();
  }, [location.pathname]);

  const isWatchPage = location.pathname.startsWith("/customer/watch");

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: isWatchPage ? "#000000" : "var(--sv-bg-primary)" }}>

      {/* ── Desktop Sidebar ──────────────────────────── */}
      {!isWatchPage && (
        <aside className="hidden lg:flex flex-col w-56 xl:w-60 flex-shrink-0 h-screen sticky top-0">
          <SidebarContent onClose={() => {}} />
        </aside>
      )}

      {/* ── Mobile Drawer ────────────────────────────── */}
      {!isWatchPage && drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-56 h-full animate-slide-in-left z-10">
            <SidebarContent onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen ${isWatchPage ? "overflow-hidden" : "overflow-y-auto"}`}>
        {!isWatchPage && <TopNavbar onMenuOpen={() => setDrawerOpen(true)} />}

        <main className={`flex-1 ${isWatchPage ? "p-0 bg-black" : "p-5 md:p-8"}`}>
          <Routes>
            <Route index             element={<CustomerHome />} />
            <Route path="home"       element={<CustomerHome />} />
            <Route path="movies"     element={<Movies />} />
            <Route path="tv-shows"   element={<TVShows />} />
            <Route path="my-list"    element={<MyList />} />
            <Route path="subscription" element={<Subscription />} />
            <Route path="billing"    element={<Billing />} />
            <Route path="profile"    element={<Profile />} />
            <Route path="settings"   element={<Settings />} />
            <Route path="watch/movie/:id" element={<Watch type="movie" />} />
            <Route path="watch/series/:id" element={<Watch type="series" />} />
            <Route path="watch/series/:id/episode/:epNum" element={<Watch type="series" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ─── Exported Layout with Context ─────────────────────────────
export default function CustomerLayout() {
  return (
    <SubscriptionProvider>
      <ModalProvider>
        <CustomerLayoutInner />
      </ModalProvider>
    </SubscriptionProvider>
  );
}
