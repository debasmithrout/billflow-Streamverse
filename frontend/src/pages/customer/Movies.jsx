// src/pages/customer/Movies.jsx
import { useState } from "react";
import StreamHeroBanner from "../../components/customer/Shared/StreamHeroBanner";
import ContentRail from "../../components/customer/Shared/ContentRail";
import ContentCard from "../../components/customer/Shared/ContentCard";
import { dedupeContentByCanonicalId } from "../../utils/contentHelper";
import {
  MOVIES_HERO,
  TRENDING_MOVIES,
  NEW_RELEASES,
  HOLLYWOOD_MOVIES,
  BOLLYWOOD_MOVIES,
  ACTION_MOVIES,
  TOP_RATED_MOVIES,
} from "../../constants/mockData";

const FILTER_GENRES = ["All", "Action", "Drama", "Sci-Fi", "Thriller", "Horror", "Comedy", "Romance", "Animation", "Crime"];
const SORT_OPTIONS  = ["Trending", "Newest", "Top Rated", "A–Z"];
const LANGUAGES     = ["All Languages", "English", "Hindi", "Korean", "Japanese"];

// ─── Filter Bar ────────────────────────────────────────────────
function FilterBar({ selectedGenre, onGenreChange }) {
  const [language, setLanguage]   = useState("All Languages");
  const [sort, setSort]           = useState("Trending");
  const [searchQuery, setSearch]  = useState("");

  const selectStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "8px 12px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Top row: search + dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 sv-glass rounded-xl px-3.5 py-2 flex-1 max-w-xs" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <svg className="w-3.5 h-3.5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search movies..."
            className="bg-transparent text-xs text-white/80 placeholder-white/25 outline-none w-full"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
          {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={selectStyle}>
          {SORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Genre chips */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_GENRES.map((g) => (
          <button
            key={g}
            onClick={() => onGenreChange(g)}
            className={`sv-genre-chip text-xs ${selectedGenre === g ? "active" : ""}`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Movies Grid (for "All" mode full display) ─────────────────
function MoviesGrid({ items, title }) {
  return (
    <div className="mb-10">
      <h3 className="sv-section-title mb-4">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
        {items.map((item) => (
          <ContentCard key={item.id} item={item} size="sm" />
        ))}
      </div>
    </div>
  );
}

export default function Movies() {
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filterItems = (items) => {
    if (selectedGenre === "All") return items;
    return items.filter((i) =>
      (i.genre || "").toLowerCase().includes(selectedGenre.toLowerCase())
    );
  };

  const allMovies = [...TRENDING_MOVIES, ...NEW_RELEASES, ...HOLLYWOOD_MOVIES, ...BOLLYWOOD_MOVIES, ...ACTION_MOVIES, ...TOP_RATED_MOVIES];
  const uniqueMovies = dedupeContentByCanonicalId(allMovies);

  return (
    <div className="animate-fade-in">
      {/* ── Page Title ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Movies</h2>
          <p className="text-xs text-white/40 mt-0.5">Thousands of titles across every genre</p>
        </div>
        <span className="sv-badge sv-badge-purple text-[10px]">10,000+ Films</span>
      </div>

      {/* ── Hero ───────────────────────────────────── */}
      <div className="mb-8">
        <StreamHeroBanner
          id="movies_hero"
          title={MOVIES_HERO.title}
          description={MOVIES_HERO.description}
          backdrop={MOVIES_HERO.backdrop}
          genre={MOVIES_HERO.genre}
          rating={MOVIES_HERO.rating}
          year={MOVIES_HERO.year}
          runtime={MOVIES_HERO.runtime}
          showSlides={false}
          primaryBtnText="▶  Play Interstellar"
        />
      </div>

      {/* ── Filter Bar ─────────────────────────────── */}
      <FilterBar selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />

      {/* ── Content (filtered or categorized) ─────── */}
      {selectedGenre !== "All" ? (
        <MoviesGrid items={filterItems(uniqueMovies)} title={`${selectedGenre} Movies`} />
      ) : (
        <>
          <ContentRail title="Trending Movies" items={TRENDING_MOVIES} badge="HOT" />
          <ContentRail title="New Releases" items={NEW_RELEASES} badge="NEW" />
          <ContentRail title="Hollywood Classics" items={HOLLYWOOD_MOVIES} />
          <ContentRail title="Bollywood Hits" items={BOLLYWOOD_MOVIES} />
          <ContentRail title="Action & Adventure" items={ACTION_MOVIES} />
          <ContentRail title="Top Rated of All Time" items={TOP_RATED_MOVIES} />
        </>
      )}
    </div>
  );
}
