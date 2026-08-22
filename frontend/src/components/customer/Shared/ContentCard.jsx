// src/components/customer/Shared/ContentCard.jsx
import { useState } from "react";
import usePlayNavigation from "../../../hooks/usePlayNavigation";
import { useModal } from "../../../context/ModalContext";

const StarIcon = () => (
  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);
const PlayIcon = () => (
  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const InfoIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function ContentCard({ item, size = "md", showProgress = false, showRank = false }) {
  const [imgError, setImgError] = useState(false);
  const playContent = usePlayNavigation();
  const { openContentDetails } = useModal();

  const sizeMap = {
    sm: { card: "w-32", img: "h-48", title: "text-[10px]" },
    md: { card: "w-40 sm:w-44", img: "h-60 sm:h-64", title: "text-[11px]" },
    lg: { card: "w-48 sm:w-52", img: "h-72 sm:h-80", title: "text-xs" },
  };
  const sz = sizeMap[size] || sizeMap.md;

  const gradients = [
    "from-purple-900/60 to-slate-900",
    "from-blue-900/60 to-slate-900",
    "from-rose-900/60 to-slate-900",
    "from-amber-900/60 to-slate-900",
    "from-teal-900/60 to-slate-900",
  ];
  const gradient = gradients[(item.title?.length || 0) % gradients.length];

  return (
    <div 
      onClick={() => openContentDetails(item)}
      className={`sv-card group ${sz.card} flex-shrink-0 cursor-pointer`}
    >
      {/* Poster Image */}
      <div className={`${sz.img} relative bg-gradient-to-br ${gradient}`}>
        {!imgError ? (
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${gradient}`}>
            <span className="text-2xl">🎬</span>
          </div>
        )}

        {/* Top-left badge */}
        {item.badge && (
          <div className="absolute top-2 left-2 sv-badge sv-badge-purple text-[8px] z-10">
            {item.badge}
          </div>
        )}

        {/* Top-right rating */}
        {item.rating && (
          <div className="absolute top-2 right-2 sv-rating text-[10px] z-10 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
            <StarIcon /> {item.rating}
          </div>
        )}

        {/* Rank number (Top 10) */}
        {showRank && item.rank && (
          <div className="absolute bottom-0 left-0 sv-rank-num text-6xl font-black select-none">
            {item.rank}
          </div>
        )}

        {/* Overlay */}
        <div className="sv-card-overlay" />

        {/* Actions */}
        <div className="sv-card-actions z-20">
          <div className="flex items-center gap-1.5 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                playContent(item);
              }}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0 cursor-pointer pointer-events-auto"
              title="Play"
            >
              <PlayIcon />
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0 cursor-pointer pointer-events-auto"
              title="Add to My List"
            >
              <PlusIcon />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openContentDetails(item);
              }}
              className="w-7 h-7 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0 cursor-pointer pointer-events-auto"
              title="More Info"
            >
              <InfoIcon />
            </button>
          </div>
          <p className={`${sz.title} font-bold text-white truncate`}>{item.title}</p>
          <p className="text-[9px] text-white/60 mt-0.5">
            {item.year || item.season} {item.genre ? `• ${item.genre}` : ""}
          </p>
        </div>

        {/* Progress bar for continue watching */}
        {showProgress && item.progress != null && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="sv-progress-bar mx-0 rounded-none">
              <div className="sv-progress-fill" style={{ width: `${item.progress}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Below-poster info (visible always) */}
      {showProgress && item.remaining && (
        <div className="px-1 pt-1.5 pb-1">
          <p className="text-[9px] text-white/50 truncate">{item.remaining}</p>
        </div>
      )}
    </div>
  );
}
