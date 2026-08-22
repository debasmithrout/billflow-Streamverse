// src/pages/customer/Profile.jsx
import { useEffect, useState } from "react";
import { getCustomerProfile, getSubscription } from "../../services/customerService";
import ProfileInfoCard from "../../components/customer/Profile/ProfileInfoCard";
import { formatCurrency } from "../../utils/currencyFormatter";
import SecurityCard from "../../components/customer/Profile/SecurityCard";
import { PageSkeleton } from "../../components/customer/Shared/SkeletonLoader";
import { CONTINUE_WATCHING } from "../../constants/mockData";

const GENRES = ["Action", "Sci-Fi", "Drama", "Thriller", "Comedy", "Anime", "Crime", "Horror"];
const DEVICES = [
  { name: "Windows PC", location: "Mumbai, India", lastActive: "Active now", icon: "💻", current: true },
  { name: "iPhone 14",  location: "India",          lastActive: "2 hours ago", icon: "📱", current: false },
];

// ─── Profile Banner / Hero ─────────────────────────────────────
function ProfileHero({ profile, subscription }) {
  const name     = profile?.name || "StreamVerse Viewer";
  const email    = profile?.email || "";
  const initials = name.trim().split(" ").map((p) => p[0]).join("").substring(0, 2).toUpperCase();
  const planName = subscription?.planName?.replace(/\s*[Pp]lan\s*/g, "").trim() || "Free Trial";
  const isTrial  = (subscription?.status || "").toUpperCase() === "TRIAL" || !subscription;
  const memberSince = profile?.memberSince || "July 2025";
  const watchCount = CONTINUE_WATCHING.length;

  return (
    <div className="relative rounded-3xl overflow-hidden mb-8" style={{ minHeight: "200px" }}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-950 via-violet-900/70 to-indigo-950" />
      <div className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(236,72,153,0.2) 0%, transparent 50%)" }} />
      <div className="absolute top-0 left-0 right-0 bottom-0 border border-purple-500/15 rounded-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-2xl"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #EC4899)", boxShadow: "0 8px 32px rgba(139,92,246,0.4)" }}
          >
            {initials}
          </div>
          {/* Edit badge */}
          <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center border-2 border-[#080811] hover:bg-purple-500 transition-colors cursor-pointer focus:outline-none">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-black text-white">{name}</h1>
            <span className="sv-membership-badge">
              ✦ {isTrial ? "Free Trial" : planName} Member
            </span>
          </div>
          <p className="text-sm text-white/50 mb-3">{email}</p>
          <div className="flex flex-wrap gap-4">
            <div className="text-center">
              <p className="text-lg font-black text-white">{watchCount}</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Watching</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-black text-white">128</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Completed</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-lg font-black text-white">346h</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Watch Time</p>
            </div>
          </div>
        </div>

        {/* Right metadata */}
        <div className="flex flex-col gap-1.5 text-right hidden sm:flex">
          <p className="text-[10px] text-white/30 uppercase tracking-wide">Member Since</p>
          <p className="text-sm font-bold text-white">{memberSince}</p>
          <p className="text-[10px] text-white/30 uppercase tracking-wide mt-2">Location</p>
          <p className="text-sm font-bold text-white">{profile?.country || "India"}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Genre Preferences ────────────────────────────────────────
function GenrePreferences() {
  const [selected, setSelected] = useState(["Action", "Sci-Fi", "Anime"]);

  const toggle = (g) => {
    setSelected((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  return (
    <div className="sv-glass rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Favorite Genres</h3>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => toggle(g)}
            className={`sv-genre-chip text-xs cursor-pointer focus:outline-none ${selected.includes(g) ? "active" : ""}`}
          >
            {selected.includes(g) && <span className="mr-1">✓</span>}
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Connected Devices ─────────────────────────────────────────
function ConnectedDevices() {
  return (
    <div className="sv-glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">Connected Devices</h3>
        <span className="sv-badge sv-badge-purple">{DEVICES.length} Active</span>
      </div>
      <div className="space-y-3">
        {DEVICES.map((d) => (
          <div key={d.name} className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{d.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white">{d.name}</p>
                  {d.current && <span className="sv-badge sv-badge-green">Current</span>}
                </div>
                <p className="text-[10px] text-white/40 mt-0.5">{d.location} · {d.lastActive}</p>
              </div>
            </div>
            {!d.current && (
              <button className="text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer focus:outline-none">
                Sign Out
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Achievements ─────────────────────────────────────────────
function Achievements() {
  const badges = [
    { emoji: "🎬", label: "100 Movies",    earned: true },
    { emoji: "📺", label: "50 Series",     earned: true },
    { emoji: "⭐", label: "Premium Fan",   earned: false },
    { emoji: "🌙", label: "Night Owl",     earned: true },
    { emoji: "🔥", label: "Binge Watcher", earned: true },
    { emoji: "🏆", label: "Cinephile",     earned: false },
  ];

  return (
    <div className="sv-glass rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Achievements</h3>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((b) => (
          <div
            key={b.label}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
              b.earned
                ? "bg-purple-600/10 border border-purple-500/20"
                : "bg-white/2 border border-white/5 opacity-40"
            }`}
          >
            <span className="text-xl">{b.emoji}</span>
            <p className="text-[9px] font-bold text-center text-white/70">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Account Status Card (inline, no old component) ───────────
function AccountStatusInline({ subscription }) {
  const plan   = subscription?.planName?.replace(/\s*[Pp]lan\s*/g, "").trim() || "Free Trial";
  const status = (subscription?.status || "TRIAL").toUpperCase();
  const renew  = subscription?.renewalDate || "—";
  const price  = subscription?.price != null ? `${formatCurrency(subscription.price, subscription.currency_code)}/mo` : `${formatCurrency(0, "INR")}/mo`;

  const statusColor = {
    "ACTIVE":                "sv-badge-green",
    "TRIAL":                 "sv-badge-amber",
    "CANCELLED":             "sv-badge-red",
    "EXPIRED":               "sv-badge-red",
    "CANCEL_AT_PERIOD_END":  "sv-badge-amber",
  }[status] || "sv-badge-blue";

  return (
    <div className="sv-glass-purple rounded-2xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Membership</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/50">Plan</span>
          <span className="text-xs font-bold text-white">{plan}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/50">Status</span>
          <span className={`sv-badge ${statusColor}`}>{status.replace("_", " ")}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/50">Next Renewal</span>
          <span className="text-xs font-bold text-white">{renew}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/50">Monthly Cost</span>
          <span className="text-xs font-bold text-purple-400">{price}</span>
        </div>
        <a
          href="/customer/subscription"
          className="block w-full py-2.5 text-center text-xs font-bold text-white rounded-xl mt-2 transition-all"
          style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
        >
          Manage Plan
        </a>
      </div>
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────
export default function Profile() {
  const [profile, setProfile]           = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [prof, sub] = await Promise.all([getCustomerProfile(), getSubscription()]);
        setProfile(prof);
        setSubscription(sub);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleProfileUpdate = (updated) => setProfile(updated);

  if (loading) return <PageSkeleton />;

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* ── Profile Hero ─────────────────────────── */}
      <ProfileHero profile={profile} subscription={subscription} />

      {/* ── Main 2-column grid ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — personal info (wide) */}
        <div className="lg:col-span-2 space-y-6">
          {profile && (
            <ProfileInfoCard profile={profile} onProfileUpdate={handleProfileUpdate} />
          )}
          <SecurityCard />
          <GenrePreferences />
        </div>

        {/* Right column — account sidebar */}
        <div className="space-y-6">
          <AccountStatusInline subscription={subscription} />
          <Achievements />
          <ConnectedDevices />
        </div>
      </div>
    </div>
  );
}
