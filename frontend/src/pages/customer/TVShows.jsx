// src/pages/customer/TVShows.jsx
import { useState } from "react";
import StreamHeroBanner from "../../components/customer/Shared/StreamHeroBanner";
import ContentRail from "../../components/customer/Shared/ContentRail";
import usePlayNavigation from "../../hooks/usePlayNavigation";
import {
  TVSHOWS_HERO,
  CONTINUE_WATCHING,
  POPULAR_SHOWS,
  ANIME_SHOWS,
  KDRAMA_SHOWS,
  CRIME_SHOWS,
  LATEST_EPISODES,
} from "../../constants/mockData";

const SHOW_GENRES  = ["All", "Drama", "Crime", "Comedy", "Thriller", "Anime", "K-Drama", "Sci-Fi", "Shorts"];

// ─── Genre Tabs ────────────────────────────────────────────────
function GenreTabs({ selected, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-8 flex-wrap">
      {SHOW_GENRES.map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`sv-genre-chip ${selected === g ? "active" : ""} flex-shrink-0`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

// ─── Latest Episodes Strip ─────────────────────────────────────
function LatestEpisodesStrip({ items }) {
  const playContent = usePlayNavigation();

  return (
    <div className="mb-10">
      <h3 className="sv-section-title mb-4 flex items-center gap-2">
        Latest Episodes
        <span className="sv-badge sv-badge-green">NEW</span>
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => playContent({ ...item, type: "series" })}
            className="sv-glass rounded-2xl overflow-hidden cursor-pointer group hover:border-purple-500/20 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="aspect-video relative overflow-hidden">
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-white truncate">{item.title}</p>
              <p className="text-[10px] text-purple-400/80 font-semibold mt-0.5">{item.episode}</p>
              <p className="text-[9px] text-white/35 mt-1">{item.releaseDate}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Series continue watching (with progress) ─────────────────
const seriesContinue = (CONTINUE_WATCHING || []).filter((i) => i.type === "series");

export default function TVShows() {
  const [selectedGenre, setSelectedGenre] = useState("All");

  return (
    <div className="animate-fade-in">
      {/* ── Page Title ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">TV Shows</h2>
          <p className="text-xs text-white/40 mt-0.5">Series, Anime, K-Drama & more</p>
        </div>
        <span className="sv-badge sv-badge-blue">5,000+ Series</span>
      </div>

      {/* ── Hero ─────────────────────────────── */}
      <div className="mb-8">
        <StreamHeroBanner
          id="tvshows_hero"
          title={TVSHOWS_HERO.title}
          description={TVSHOWS_HERO.description}
          backdrop={TVSHOWS_HERO.backdrop}
          genre={TVSHOWS_HERO.genre}
          rating={TVSHOWS_HERO.rating}
          year={`${TVSHOWS_HERO.seasons} Seasons • ${TVSHOWS_HERO.episodes} Episodes`}
          showSlides={false}
          primaryBtnText="▶  Watch Now"
        />
      </div>

      {/* ── Genre tabs ────────────────────────── */}
      <GenreTabs selected={selectedGenre} onChange={setSelectedGenre} />

      {/* ── Latest Episodes ───────────────────── */}
      <LatestEpisodesStrip items={LATEST_EPISODES} />

      {/* ── Continue Watching (Series) ────────── */}
      <ContentRail
        title="Continue Watching"
        items={seriesContinue}
        showProgress
        emptyMessage="No series in progress"
      />

      {/* ── Popular Shows ─────────────────────── */}
      <ContentRail
        title="Popular Shows"
        items={POPULAR_SHOWS}
        badge="HOT"
      />

      {/* ── Anime ─────────────────────────────── */}
      <ContentRail
        title="Top Anime Series"
        items={ANIME_SHOWS}
        badge="ANIME"
      />

      {/* ── K-Drama ───────────────────────────── */}
      <ContentRail
        title="K-Drama Picks"
        items={KDRAMA_SHOWS}
        badge="K-DRAMA"
      />

      {/* ── Crime & Thriller ──────────────────── */}
      <ContentRail
        title="Crime & Thriller Series"
        items={CRIME_SHOWS}
      />
    </div>
  );
}
