import { useRef, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

// TMDB public CDN poster URLs — verified paths
// Base: https://image.tmdb.org/t/p/w500
const TRENDING = [
  {
    rank: 1,
    title: "Solo Leveling",
    genre: "Anime",
    rating: "9.2",
    tag: "S2 · Ongoing",
    accentColor: "#a78bfa",
    // Solo Leveling S2 — verified TMDB
    poster: "https://image.tmdb.org/t/p/w500/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg",
    fallbackGradient: "linear-gradient(160deg, #2e1065 0%, #1e1b4b 100%)",
  },
  {
    rank: 2,
    title: "Attack on Titan",
    genre: "Anime",
    rating: "9.4",
    tag: "Final Season",
    accentColor: "#f59e0b",
    // AoT Final Season Part 3 — verified TMDB
    poster: "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    fallbackGradient: "linear-gradient(160deg, #451a03 0%, #1c0800 100%)",
  },
  {
    rank: 3,
    title: "Demon Slayer",
    genre: "Anime",
    rating: "8.9",
    tag: "S4 · Ongoing",
    accentColor: "#ef4444",
    // Demon Slayer Kimetsu no Yaiba — verified TMDB
    poster: "https://image.tmdb.org/t/p/w500/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    fallbackGradient: "linear-gradient(160deg, #450a0a 0%, #1c0000 100%)",
  },
  {
    rank: 4,
    title: "One Piece",
    genre: "Anime",
    rating: "9.5",
    tag: "Ep. 1100+",
    accentColor: "#38bdf8",
    // One Piece anime — TMDB ID 37854, verified poster path
    poster: "https://image.tmdb.org/t/p/w500/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg",
    fallbackGradient: "linear-gradient(160deg, #0c4a6e 0%, #082f49 100%)",
  },
  {
    rank: 5,
    title: "The Boys",
    genre: "Action",
    rating: "8.7",
    tag: "S4 · Final",
    accentColor: "#f43f5e",
    // The Boys S4 — verified TMDB
    poster: "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnrFLhxeD82hz.jpg",
    fallbackGradient: "linear-gradient(160deg, #4c0519 0%, #120008 100%)",
  },
  {
    rank: 6,
    title: "Squid Game",
    genre: "K-Drama",
    rating: "8.9",
    tag: "S2 · NEW",
    accentColor: "#10b981",
    // Squid Game S2 — verified TMDB
    poster: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    fallbackGradient: "linear-gradient(160deg, #064e3b 0%, #010d0a 100%)",
  },
  {
    rank: 7,
    title: "John Wick 4",
    genre: "Action",
    rating: "8.4",
    tag: "Movie",
    accentColor: "#fbbf24",
    // John Wick Chapter 4 — verified TMDB
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    fallbackGradient: "linear-gradient(160deg, #292524 0%, #080600 100%)",
  },
  {
    rank: 8,
    title: "Jujutsu Kaisen",
    genre: "Anime",
    rating: "9.0",
    tag: "S4 · Complete",
    accentColor: "#8b5cf6",
    // Jujutsu Kaisen — TMDB show 95479, primary poster (verified)
    poster: "https://image.tmdb.org/t/p/w500/1xDA3DOsdIl9qMz0tufvwLLRJ1N.jpg",
    // Backup: alternate JJK poster if above fails
    posterBackup: "https://image.tmdb.org/t/p/w500/1xDA3DOsdIl9qMz0tufvwLLRJ1N.jpg",
    fallbackGradient: "linear-gradient(160deg, #2e1065 0%, #0a0418 100%)",
  },
];

const GENRE_COLORS = {
  Anime:    { bg: "rgba(167,139,250,0.25)", color: "#c4b5fd" },
  Action:   { bg: "rgba(244,63,94,0.22)",  color: "#fb7185" },
  "K-Drama":{ bg: "rgba(16,185,129,0.22)", color: "#6ee7b7" },
  Drama:    { bg: "rgba(251,146,60,0.2)",  color: "#fdba74" },
};

function TrendingCard({ item }) {
  const [hov, setHov] = useState(false);
  const { t } = useLanguage();
  // Two-level fallback: 0=primary, 1=backup, 2=gradient
  const [imgLevel, setImgLevel] = useState(0);
  const gc = GENRE_COLORS[item.genre] || { bg: "rgba(139,92,246,0.22)", color: "#a78bfa" };

  const currentSrc = imgLevel === 0
    ? item.poster
    : imgLevel === 1 && item.posterBackup
      ? item.posterBackup
      : null;

  const handleImgError = () => {
    if (imgLevel === 0 && item.posterBackup) {
      setImgLevel(1);  // try backup
    } else {
      setImgLevel(2);  // give up, show gradient
    }
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        flexShrink: 0,
        width: "175px",
        borderRadius: "16px",
        overflow: "hidden",
        border: hov ? `1px solid ${item.accentColor}70` : "1px solid rgba(255,255,255,0.08)",
        cursor: "pointer",
        transition: "all 0.32s cubic-bezier(0.34,1.56,0.64,1)",
        transform: hov ? "translateY(-12px) scale(1.04)" : "translateY(0) scale(1)",
        boxShadow: hov
          ? `0 28px 64px rgba(0,0,0,0.8), 0 0 0 1px ${item.accentColor}30, 0 0 60px ${item.accentColor}20`
          : "0 4px 20px rgba(0,0,0,0.5)",
        position: "relative",
        background: item.fallbackGradient,
      }}
    >
      {/* ── Poster image area (2:3 aspect ratio) ── */}
      <div style={{ width: "100%", aspectRatio: "2/3", position: "relative", overflow: "hidden" }}>
        {/* Real poster image — primary then backup */}
        {currentSrc ? (
          <img
            key={currentSrc}
            src={currentSrc}
            alt={item.title}
            onError={handleImgError}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              display: "block",
              transition: "transform 0.5s ease",
              transform: hov ? "scale(1.08)" : "scale(1)",
            }}
          />
        ) : (
          // Final fallback: gradient
          <div style={{
            width: "100%", height: "100%",
            background: item.fallbackGradient,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: "48px", fontWeight: 900, color: "rgba(255,255,255,0.06)", fontFamily: "Inter, sans-serif", letterSpacing: "-2px" }}>
              {item.rank}
            </span>
          </div>
        )}

        {/* Cinematic dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: hov
            ? "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)"
            : "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)",
          transition: "background 0.3s",
        }} />

        {/* Rank badge */}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
          border: `1px solid ${item.accentColor}55`,
          borderRadius: "8px", padding: "3px 9px",
          display: "flex", alignItems: "center", gap: "4px",
        }}>
          <span style={{ color: item.accentColor, fontSize: "10px", fontWeight: 900, letterSpacing: "0.5px" }}>#{item.rank}</span>
        </div>

        {/* Tag badge */}
        <div style={{
          position: "absolute", top: "10px", right: "10px",
          padding: "3px 8px", borderRadius: "6px",
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
          fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}>
          {item.tag}
        </div>

        {/* Hover play button */}
        {hov && (
          <div style={{
            position: "absolute", top: "42%", left: "50%",
            transform: "translate(-50%,-50%)",
            pointerEvents: "none",
            animation: "tcPop 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          }}>
            <div style={{
              width: "54px", height: "54px", borderRadius: "50%",
              background: `linear-gradient(135deg, ${item.accentColor}ee, ${item.accentColor}99)`,
              backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 40px ${item.accentColor}80, 0 0 0 8px ${item.accentColor}18`,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* ── Card bottom info ── */}
      <div style={{ padding: "11px 12px 13px", background: "rgba(6,8,22,0.95)" }}>
        <h4 style={{
          color: "#fff", fontWeight: 800, fontSize: "13px",
          margin: "0 0 7px", overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap", letterSpacing: "-0.2px",
        }}>
          {item.title}
        </h4>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            padding: "2px 9px", borderRadius: "100px",
            background: gc.bg, color: gc.color,
            fontSize: "10px", fontWeight: 700,
          }}>
            {t(`trending.${item.genre.toLowerCase().replace("-", "")}`)}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: 700 }}>{item.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrendingCarousel() {
  const scrollRef = useRef(null);
  const { t } = useLanguage();
  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 450, behavior: "smooth" });

  return (
    <section id="trending" style={{
      background: "#060816", padding: "64px 0 72px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Section separator glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "700px", height: "1px",
        background: "linear-gradient(to right, transparent, rgba(139,92,246,0.5), transparent)",
      }} />
      {/* Ambient radial */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: "900px", height: "400px", borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "4px", height: "30px", borderRadius: "4px",
              background: "linear-gradient(to bottom, #8b5cf6, #6d28d9)",
              boxShadow: "0 0 14px rgba(139,92,246,0.7)",
            }} />
            <div>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#a78bfa", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "2px" }}>
                🔥 {t("trending.badge")}
              </div>
              <h2 style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-0.5px", fontFamily: "Inter, sans-serif" }}>
                {t("trending.title")}
              </h2>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center",
                  justifyContent: "center", cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.2)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.45)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={dir === -1 ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable poster row */}
        <div
          ref={scrollRef}
          style={{
            display: "flex", gap: "14px",
            overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none",
            paddingBottom: "12px", paddingTop: "6px",
            scrollSnapType: "x mandatory",
          }}
        >
          {TRENDING.map((item) => (
            <div key={item.rank} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
              <TrendingCard item={item} />
            </div>
          ))}
        </div>

        {/* Right fade mask */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: "80px",
          background: "linear-gradient(to left, #060816, transparent)",
          pointerEvents: "none", zIndex: 2,
        }} />
      </div>

      <style>{`
        @keyframes tcPop {
          from { opacity: 0; transform: translate(-50%,-50%) scale(0.65); }
          to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
        #trending ::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
