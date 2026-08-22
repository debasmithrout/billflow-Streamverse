// src/pages/customer/MyList.jsx
import { useState } from "react";
import ContentCard from "../../components/customer/Shared/ContentCard";
import { MY_LIST_WATCH_LATER, MY_LIST_FAVORITES, MY_COLLECTIONS, CONTINUE_WATCHING } from "../../constants/mockData";
import { dedupeContentByCanonicalId } from "../../utils/contentHelper";

const TABS = ["Watch Later", "Favorites", "Continue Watching", "Collections"];

// ─── Empty State ──────────────────────────────────────────────
function EmptyState({ tab }) {
  const messages = {
    "Watch Later":       { emoji: "🎬", msg: "Your Watch Later list is empty.", cta: "Browse Movies", href: "/customer/movies" },
    "Favorites":         { emoji: "❤️", msg: "No favorites yet. Heart content to save it here.", cta: "Browse Content", href: "/customer" },
    "Continue Watching": { emoji: "▶️", msg: "Nothing in progress. Start watching something!", cta: "Browse Shows", href: "/customer/tv-shows" },
    "Collections":       { emoji: "📚", msg: "No collections yet.", cta: "Create Collection", href: "#" },
  };
  const { emoji, msg, cta, href } = messages[tab] || messages["Watch Later"];
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <span className="text-5xl">{emoji}</span>
      <p className="text-sm text-white/40 text-center max-w-xs">{msg}</p>
      <a href={href} className="sv-btn-primary text-xs py-2 px-5">{cta}</a>
    </div>
  );
}

// ─── Grid of ContentCards ─────────────────────────────────────
function ContentGrid({ items, showProgress = false }) {
  const uniqueItems = dedupeContentByCanonicalId(items);
  if (!uniqueItems || uniqueItems.length === 0) {
    return (
      <div className="py-12 text-center text-white/30 text-sm">
        No titles in this list yet
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {uniqueItems.map((item) => (
        <ContentCard key={item.id} item={item} showProgress={showProgress} />
      ))}
    </div>
  );
}

// ─── Collections Tab ──────────────────────────────────────────
function CollectionsGrid() {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {MY_COLLECTIONS.map((col) => (
          <div
            key={col.id}
            className="relative rounded-2xl overflow-hidden cursor-pointer group"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className={`h-28 bg-gradient-to-r ${col.color} opacity-30`} />
            <div className="absolute inset-0 p-5 flex items-end">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{col.emoji}</span>
                  <span className="text-[10px] text-white/50 font-semibold">{col.count} Titles</span>
                </div>
                <p className="text-sm font-bold text-white">{col.name}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Create new collection CTA */}
        <div
          className="rounded-2xl cursor-pointer group flex flex-col items-center justify-center gap-3 h-full min-h-[120px] transition-all hover:border-purple-500/30"
          style={{ background: "rgba(139,92,246,0.04)", border: "2px dashed rgba(139,92,246,0.15)" }}
        >
          <div className="w-10 h-10 rounded-full bg-purple-600/15 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-600/25 transition-colors">
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-purple-400/80">Create Collection</p>
        </div>
      </div>
    </div>
  );
}

// ─── Filter + Sort bar ────────────────────────────────────────
function ListHeader({ total }) {
  const [sort, setSort] = useState("Date Added");
  const [filter, setFilter] = useState("All");
  const FILTERS = ["All", "Movies", "Series"];
  const SORTS   = ["Date Added", "A–Z", "Rating", "Year"];

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
      <div className="flex items-center gap-2">
        <p className="text-sm text-white/50">
          <span className="text-white font-bold">{total}</span> titles
        </p>
        <div className="flex gap-1.5 ml-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`sv-genre-chip text-[11px] ${filter === f ? "active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <select
        value={sort}
        onChange={(e) => setSort(e.target.value)}
        className="text-xs text-white/60 rounded-xl px-3 py-2 outline-none cursor-pointer"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {SORTS.map((s) => <option key={s}>{s}</option>)}
      </select>
    </div>
  );
}

export default function MyList() {
  const [activeTab, setActiveTab] = useState("Watch Later");

  const getContent = () => {
    if (activeTab === "Watch Later")       return MY_LIST_WATCH_LATER;
    if (activeTab === "Favorites")         return MY_LIST_FAVORITES;
    if (activeTab === "Continue Watching") return CONTINUE_WATCHING;
    return null;
  };

  const items = getContent();
  const total = items ? items.length : 0;

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ───────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-black text-white tracking-tight">My List</h2>
          <div className="flex items-center gap-2">
            <span className="sv-badge sv-badge-purple">{MY_LIST_WATCH_LATER.length + MY_LIST_FAVORITES.length} Saved</span>
          </div>
        </div>
        <p className="text-xs text-white/40">Your personal library — saved shows, movies, and favorites</p>
      </div>

      {/* ── Tab Navigation ────────────────────── */}
      <div className="flex gap-1 mb-8 p-1 rounded-2xl w-full sm:w-auto inline-flex"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer focus:outline-none ${
              activeTab === tab
                ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-600/20"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab}
            {tab === "Continue Watching" && (
              <span className="ml-1.5 text-[9px] bg-white/10 rounded-full px-1.5 py-0.5">{CONTINUE_WATCHING.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ─────────────────────────── */}
      {activeTab === "Collections" ? (
        <CollectionsGrid />
      ) : items && items.length > 0 ? (
        <>
          <ListHeader total={total} />
          <ContentGrid
            items={items}
            showProgress={activeTab === "Continue Watching"}
          />
        </>
      ) : (
        <EmptyState tab={activeTab} />
      )}
    </div>
  );
}
