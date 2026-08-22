// src/pages/customer/CustomerHome.jsx
import { useEffect, useState } from "react";
import { getSubscription } from "../../services/customerService";
import StreamHeroBanner from "../../components/customer/Shared/StreamHeroBanner";
import ContentRail from "../../components/customer/Shared/ContentRail";
import usePlayNavigation from "../../hooks/usePlayNavigation";
import { dedupeContentByCanonicalId } from "../../utils/contentHelper";
import {
  TOP_10,
  FEATURED_ORIGINALS,
} from "../../constants/mockData";
import { watchProgressService } from "../../services/watchProgressService";
import { recommendationService } from "../../services/recommendationService";



// ─── TrialBanner (subtle strip, not a giant card) ─────────────
function TrialBanner({ subscription }) {
  if (!subscription) return null;
  const s = (subscription.status || "").toUpperCase();
  if (s === "ACTIVE" || s === "CANCEL_AT_PERIOD_END") return null;

  if (s === "TRIAL") {
    return (
      <div className="flex items-center gap-4 rounded-2xl px-5 py-3.5 mb-6 justify-between flex-wrap animate-fade-in"
        style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))", border: "1px solid rgba(245,158,11,0.18)" }}>
        <div className="flex items-center gap-3">
          <span className="text-amber-400 text-xl">⏱</span>
          <div>
            <p className="text-sm font-bold text-white">Free Trial Active</p>
            <p className="text-xs text-amber-300/70">
              {subscription.trialDaysRemaining != null
                ? `${subscription.trialDaysRemaining} days remaining — subscribe to keep streaming.`
                : "Trial active. Subscribe for uninterrupted access."}
            </p>
          </div>
        </div>
        <a href="/customer/subscription" className="sv-btn-primary py-2 px-4 text-xs flex-shrink-0">
          Upgrade Now →
        </a>
      </div>
    );
  }

  if (s === "EXPIRED" || s === "CANCELLED") {
    return (
      <div className="flex items-center gap-4 rounded-2xl px-5 py-3.5 mb-6 justify-between flex-wrap animate-fade-in"
        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
        <div className="flex items-center gap-3">
          <span className="text-red-400 text-xl">🔒</span>
          <div>
            <p className="text-sm font-bold text-white">Subscription {s === "EXPIRED" ? "Expired" : "Cancelled"}</p>
            <p className="text-xs text-red-300/70">Renew your plan to continue streaming premium content.</p>
          </div>
        </div>
        <a href="/customer/subscription" className="sv-btn-primary py-2 px-4 text-xs flex-shrink-0">
          Reactivate →
        </a>
      </div>
    );
  }
  return null;
}

// ─── Quick Stats Strip ────────────────────────────────────────
function QuickStats({ subscription }) {
  const plan = subscription?.planName?.replace(/\s*[Pp]lan\s*/g, "").trim() || "Free Trial";
  const screens = subscription?.planName?.toUpperCase().includes("FAMILY") ? 4
    : subscription?.planName?.toUpperCase().includes("PREMIUM") ? 4
      : subscription?.planName?.toUpperCase().includes("STANDARD") ? 2 : 1;
  const quality = subscription?.planName?.toUpperCase().includes("PREMIUM") || subscription?.planName?.toUpperCase().includes("FAMILY") ? "4K Ultra HD" : "Full HD";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
      {[
        { icon: "🎬", label: "Plan", value: plan },
        { icon: "📺", label: "Screens", value: `${screens} Active` },
        { icon: "✨", label: "Quality", value: quality },
        { icon: "📚", label: "Content", value: "10,000+ Titles" },
      ].map((stat) => (
        <div key={stat.label} className="sv-glass rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <span className="text-xl">{stat.icon}</span>
          <div>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">{stat.label}</p>
            <p className="text-sm font-bold text-white">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Originals Showcase ───────────────────────────────────────
function OriginalsShowcase({ items }) {
  const playContent = usePlayNavigation();

  const uniqueItems = dedupeContentByCanonicalId(items);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="sv-section-title flex items-center gap-2">
          StreamVerse Originals
          <span className="sv-badge sv-badge-purple">EXCLUSIVE</span>
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {uniqueItems.map((item) => (
          <div
            key={item.id}
            onClick={() => playContent({ ...item, type: "series" })}
            className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer sv-glow-hover transition-all duration-300"
          >
            <img
              src={item.poster}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <span className={`sv-badge ${item.badge === "ORIGINAL" ? "sv-badge-purple" : "sv-badge-blue"} mb-1.5`}>
                {item.badge}
              </span>
              <p className="text-xs font-bold text-white leading-tight">{item.title}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{item.genre}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Top 10 Row ───────────────────────────────────────────────
function Top10Rail({ items }) {
  const playContent = usePlayNavigation();

  const uniqueItems = dedupeContentByCanonicalId(items);

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="sv-section-title flex items-center gap-2">
          🔥 Top 10 in India
          <span className="sv-badge sv-badge-red">TODAY</span>
        </h3>
      </div>
      <div className="sv-rail py-4 px-12 overflow-y-visible overflow-x-auto scrollbar-none">
        {uniqueItems.map((item) => (
          <div
            key={item.id}
            onClick={() => playContent(item)}
            className="top10-card group cursor-pointer"
          >
            <span className="rank">{item.rank}</span>
            <img
              src={item.poster}
              alt={item.title}
              className="poster object-cover shadow-xl group-hover:scale-105 transition-transform duration-300 h-[255px]"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────
export default function CustomerHome() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read recommendation lists dynamically in state
  const [continueWatchingList, setContinueWatchingList] = useState([]);
  const [becauseYouWatched, setBecauseYouWatched] = useState({ basedOn: null, items: [] });
  const [trendingList, setTrendingList] = useState([]);
  const [recentlyAddedList, setRecentlyAddedList] = useState([]);
  const [recentlyWatchedList, setRecentlyWatchedList] = useState([]);
  const [popularList, setPopularList] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const sub = await getSubscription();
        setSubscription(sub);
      } catch (err) {
        console.error("Dashboard subscription fetch error:", err);
      }

      try {
        // 1. Get Continue Watching (no exclusions)
        const cw = watchProgressService.getContinueWatchingList() || [];
        setContinueWatchingList(cw);

        const usedIds = new Set(cw.map(x => x.id));
        const addUsed = (items) => {
          if (items && Array.isArray(items)) {
            items.forEach(x => { if (x && x.id) usedIds.add(x.id); });
          }
        };

        // 2. Get Because You Watched
        const byw = recommendationService.getBecauseYouWatched(10, Array.from(usedIds));
        setBecauseYouWatched(byw);
        if (byw.basedOn) usedIds.add(byw.basedOn.id);
        addUsed(byw.items);

        // 3. Get Trending
        const trend = recommendationService.getTrending(10, Array.from(usedIds));
        setTrendingList(trend);
        addUsed(trend);

        // 4. Get Recently Added
        const added = recommendationService.getRecentlyAdded(10, Array.from(usedIds));
        setRecentlyAddedList(added);
        addUsed(added);

        // 5. Get Recently Watched (History list, no need to exclude)
        const watched = recommendationService.getRecentlyWatched(10);
        setRecentlyWatchedList(watched);

        // 6. Get Popular
        const pop = recommendationService.getPopular(10, Array.from(usedIds));
        setPopularList(pop);
      } catch (err) {
        console.error("Failed to load recommendation rails", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ── Hero Banner ──────────────────────────── */}
      <div className="mb-8">
        <StreamHeroBanner showSlides />
      </div>

      {/* ── Trial / Expired Banner ────────────────── */}
      {!loading && <TrialBanner subscription={subscription} />}

      {/* ── Quick Stats ───────────────────────────── */}
      {!loading && <QuickStats subscription={subscription} />}

      {/* ── Continue Watching ────────────────────── */}
      {continueWatchingList.length > 0 && (
        <ContentRail
          title="Continue Watching"
          items={continueWatchingList}
          showProgress
          cardSize="md"
        />
      )}

      {/* ── Because You Watched ────────────────────── */}
      {becauseYouWatched.basedOn && becauseYouWatched.items.length > 0 && (
        <ContentRail
          title={`Because You Watched ${becauseYouWatched.basedOn.title}`}
          items={becauseYouWatched.items}
          cardSize="md"
        />
      )}

      {/* ── Trending Movies & Shows ─────────────────── */}
      {trendingList.length > 0 && (
        <ContentRail
          title="Trending Now"
          items={trendingList}
          badge="HOT"
          cardSize="md"
        />
      )}

      {/* ── Top 10 ────────────────────────────────── */}
      <Top10Rail items={TOP_10} />

      {/* ── Recently Added (New Releases) ──────────── */}
      {recentlyAddedList.length > 0 && (
        <ContentRail
          title="Recently Added"
          items={recentlyAddedList}
          badge="NEW"
          cardSize="md"
        />
      )}

      {/* ── Recently Watched History ──────────────── */}
      {recentlyWatchedList.length > 0 && (
        <ContentRail
          title="Recently Watched"
          items={recentlyWatchedList}
          cardSize="md"
        />
      )}

      {/* ── Popular Content ────────────────────────── */}
      {popularList.length > 0 && (
        <ContentRail
          title="Popular Movies & TV Shows"
          items={popularList}
          cardSize="md"
        />
      )}

      {/* ── StreamVerse Originals ─────────────────── */}
      <OriginalsShowcase items={FEATURED_ORIGINALS} />
    </div>
  );
}
