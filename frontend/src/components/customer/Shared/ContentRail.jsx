// src/components/customer/Shared/ContentRail.jsx
import { useRef } from "react";
import ContentCard from "./ContentCard";
import { dedupeContentByCanonicalId } from "../../../utils/contentHelper";

const ChevronLeft = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);

export default function ContentRail({
  title,
  items = [],
  emptyMessage = "No content available",
  cardSize = "md",
  showProgress = false,
  showRank = false,
  badge = null,
  seeAllHref = null,
}) {
  const railRef = useRef(null);

  // Deduplicate items safely using content ID, slug, or title
  const uniqueItems = dedupeContentByCanonicalId(items);

  const scroll = (dir) => {
    if (!railRef.current) return;
    const amount = railRef.current.clientWidth * 0.75;
    railRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  if (!uniqueItems || uniqueItems.length === 0) {
    return (
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="sv-section-title flex items-center gap-2">
            {title}
            {badge && <span className="sv-badge sv-badge-purple">{badge}</span>}
          </h3>
        </div>
        <div className="h-28 flex items-center justify-center rounded-2xl border border-white/5">
          <p className="text-sm text-white/30">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 group/rail">
      {/* Rail Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="sv-section-title flex items-center gap-2.5">
          {title}
          {badge && <span className="sv-badge sv-badge-purple ml-1">{badge}</span>}
        </h3>
        <div className="flex items-center gap-2">
          {seeAllHref && (
            <a href={seeAllHref} className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors mr-2">
              See All
            </a>
          )}
          {/* Scroll buttons */}
          <button
            onClick={() => scroll("left")}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-purple-600/20 hover:border-purple-500/30 hover:text-purple-400 transition-all opacity-0 group-hover/rail:opacity-100"
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-purple-600/20 hover:border-purple-500/30 hover:text-purple-400 transition-all opacity-0 group-hover/rail:opacity-100"
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Scrollable Cards */}
      <div ref={railRef} className="sv-rail pb-3">
        {uniqueItems.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            size={cardSize}
            showProgress={showProgress}
            showRank={showRank}
          />
        ))}
      </div>
    </div>
  );
}
