// src/pages/customer/watch/components/PlayerTopBar.jsx
import { useNavigate } from "react-router-dom";

export default function PlayerTopBar({
  title,
  year,
  rating,
  runtime,
  activeSubtitle,
  activeAudio,
}) {
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6 sm:p-8 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-start justify-between select-none pointer-events-auto">
      <div className="flex items-center gap-4">
        {/* Premium Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/25 transition-all flex items-center justify-center cursor-pointer group active:scale-95"
          aria-label="Go Back"
        >
          <svg
            className="w-5 h-5 text-white transform group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <span className="text-[9px] uppercase tracking-[0.25em] font-black text-purple-400">
            Now Streaming
          </span>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-none text-white mt-1">
            {title || "StreamVerse Content"}
          </h1>

          {/* Metadata details row */}
          <div className="flex items-center gap-2.5 mt-2 flex-wrap">
            {year && <span className="text-xs text-white/50 font-medium">{year}</span>}
            {rating && (
              <span className="text-[10px] font-black bg-white/15 px-1.5 py-0.5 rounded border border-white/10 text-yellow-400">
                ★ {rating}
              </span>
            )}
            {runtime && (
              <span className="text-xs text-white/50 font-medium border-l border-white/20 pl-2.5">
                {runtime}
              </span>
            )}
            {activeAudio && (
              <span className="text-[8px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded tracking-wide uppercase">
                {activeAudio}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Subtitles & Audio Active Indicators */}
      <div className="flex items-center gap-3">
        {activeSubtitle && activeSubtitle !== "Off" && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/70">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <span>Subtitles: {activeSubtitle}</span>
          </div>
        )}
      </div>
    </header>
  );
}
