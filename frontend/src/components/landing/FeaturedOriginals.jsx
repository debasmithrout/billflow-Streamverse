import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const ORIGINALS = [
  {
    id: 1,
    title: "Interstellar",
    genre: "Sci-Fi · Space Opera",
    episodes: "10 Episodes",
    rating: "9.1",
    accentColor: "#818cf8",
    accentGlow: "rgba(99,102,241,0.4)",
    desc: "A covert deep-space unit receives a signal no one was meant to hear — and following it will cost them everything they believe.",
    tags: ["Sci-Fi", "Espionage", "Award Winner"],
    // Interstellar (TMDB 157336) — confirmed poster path, space/sci-fi theme
    banner: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    // Backup: Gravity (TMDB 80321) poster
    bannerBackup: "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDhRDpZFHSPwJJA.jpg",
    fallbackGradient: "linear-gradient(160deg, #1e1b4b 0%, #312e81 35%, #0f0e2e 100%)",
  },
  {
    id: 2,
    title: "Blade Runner 2049 ",
    genre: "Science Fiction and Drama",
    episodes: "Movie",
    rating: "8.8",
    accentColor: "#f43f5e",
    accentGlow: "rgba(244,63,94,0.35)",
    desc: "A disgraced detective returns to the city's most dangerous borough — to find the truth behind a murder he was framed for.",
    tags: ["Crime", "Noir", "Thriller"],
    // Blade Runner 2049 (TMDB 335984) — confirmed poster, dark noir city theme
    banner: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    // Backup: Blade Runner (TMDB 78) poster
    bannerBackup: "https://image.tmdb.org/t/p/w500/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg",
    fallbackGradient: "linear-gradient(160deg, #4c0519 0%, #3b0010 45%, #120008 100%)",
  },
  {
    id: 3,
    title: "Arrival",
    genre: "Thriller · Drama",
    episodes: "6 Episodes",
    rating: "8.5",
    accentColor: "#f59e0b",
    accentGlow: "rgba(245,158,11,0.3)",
    desc: "A renowned linguist leads an elite team to communicate with extraterrestrial visitors before global tensions explode into war.",
    tags: ["Sci-Fi", "Drama", "Mystery"],
    // Arrival (TMDB 329865) — confirmed poster path, communication/mystery theme
    banner: "https://media.themoviedb.org/t/p/w600_and_h900_face/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg",
    // Backup: alternative verified poster
    bannerBackup: "https://image.tmdb.org/t/p/w500/hcURy1riW3qLFHQdf9b7bGy8NkQ.jpg",
    fallbackGradient: "linear-gradient(160deg, #451a03 0%, #301000 40%, #0c0400 100%)",
  },
  {
    id: 4,
    title: "Tron: Legacy",
    genre: "Action · Cyberpunk",
    episodes: "Movie",
    rating: "8.3",
    accentColor: "#06b6d4",
    accentGlow: "rgba(6,182,212,0.35)",
    desc: "A virtual world designer's son falls into the cybernetic grid his father created, facing gladiatorial neon combat to escape.",
    tags: ["Cyberpunk", "Action", "Stylized"],
    // Tron: Legacy (TMDB 20526) — confirmed poster path, cyberpunk grid theme
    banner: "https://media.themoviedb.org/t/p/w600_and_h900_face/8Nc6R8k7bG8frSiDJo0oLucF7dN.jpg",
    // Backup: same verified path
    bannerBackup: "https://image.tmdb.org/t/p/w500/7d9GHuDPnig8MSFmAc8PLQK6hyM.jpg",
    fallbackGradient: "linear-gradient(160deg, #083344 0%, #0c4a6e 45%, #020d14 100%)",
  },
  {
    id: 5,
    title: "The Revenant",
    genre: "Drama · Wilderness Survival",
    episodes: "Movie",
    rating: "8.7",
    accentColor: "#10b981",
    accentGlow: "rgba(16,185,129,0.3)",
    desc: "A frontiersman is left for dead in the frozen wilderness by his companion, fighting primeval elements and wildlife to survive.",
    tags: ["Survival", "Adventure", "Visceral"],
    // The Revenant (TMDB 281957) — confirmed poster path, wilderness survival theme
    banner: "https://media.themoviedb.org/t/p/w600_and_h900_face/ji3ecJphATlVgWNY0B0RVXZizdf.jpg",
    // Backup: same verified path
    bannerBackup: "https://image.tmdb.org/t/p/w500/oXUWEc5i3wYyFnL1Ycu8ppxxPvs.jpg",
    fallbackGradient: "linear-gradient(160deg, #064e3b 0%, #043020 40%, #010c08 100%)",
  },
];

function OriginalCard({ item, large }) {
  const [hov, setHov] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const { t } = useLanguage();

  const handleBannerError = () => setImgErr(true);
  const currentBanner = imgErr ? item.bannerBackup : item.banner;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={large ? "fo-large" : ""}
      style={{
        borderRadius: "20px",
        overflow: "hidden",
        position: "relative",
        height: large ? "100%" : "306px",
        minHeight: large ? "400px" : "306px",
        border: hov ? `1px solid ${item.accentColor}60` : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.35s ease",
        transform: hov ? "translateY(-7px)" : "translateY(0)",
        boxShadow: hov
          ? `0 24px 60px rgba(0,0,0,0.7), 0 0 50px ${item.accentGlow}`
          : "0 4px 24px rgba(0,0,0,0.4)",
        background: item.fallbackGradient,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      {/* ── Background cinematic image ── */}
      {currentBanner && (
        <img
          key={currentBanner}
          src={currentBanner}
          alt={item.title}
          onError={handleBannerError}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center center",
            transition: "transform 0.5s ease",
            transform: hov ? "scale(1.06)" : "scale(1)",
          }}
        />
      )}

      {/* ── Cinematic gradient overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(to top, rgba(4,4,16,0.98) 0%, rgba(4,4,16,0.78) 35%, rgba(4,4,16,0.35) 65%, rgba(4,4,16,0.15) 100%)`,
        transition: "background 0.3s",
        zIndex: 1,
      }} />

      {/* ── Top ORIGINAL badge ── */}
      <div style={{ position: "absolute", top: "16px", left: "16px", zIndex: 2 }}>
        <span style={{
          padding: "4px 12px", borderRadius: "100px",
          background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)",
          border: `1px solid ${item.accentColor}60`,
          color: item.accentColor, fontSize: "9px",
          fontWeight: 800, letterSpacing: "1.4px", textTransform: "uppercase",
        }}>
          {t("originals.badgeText")}
        </span>
      </div>

      {/* ── Rating badge ── */}
      <div style={{
        position: "absolute", top: "16px", right: "16px",
        display: "flex", alignItems: "center", gap: "4px",
        background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)",
        padding: "4px 10px", borderRadius: "8px", zIndex: 2,
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
        <span style={{ color: "#fbbf24", fontSize: "12px", fontWeight: 700 }}>{item.rating}</span>
      </div>

      {/* ── Bottom content ── */}
      <div style={{ position: "relative", zIndex: 2, padding: "0 22px 22px" }}>
        {/* Genre / tag pills */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
          {item.tags.map((tTag) => (
            <span key={tTag} style={{
              padding: "3px 10px", borderRadius: "100px",
              background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.7)", fontSize: "10px", fontWeight: 600,
            }}>{tTag}</span>
          ))}
        </div>

        {/* Title */}
        <h3 style={{
          color: "#fff", fontWeight: 900,
          fontSize: large ? "26px" : "18px",
          margin: "0 0 8px", letterSpacing: "-0.5px",
          fontFamily: "Inter, sans-serif", lineHeight: 1.15,
          textShadow: "0 2px 16px rgba(0,0,0,0.8)",
        }}>
          {item.title}
        </h3>

        {/* Description (large card only) */}
        {large && (
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: "13px",
            margin: "0 0 14px", lineHeight: 1.65, maxWidth: "360px",
          }}>
            {item.desc}
          </p>
        )}

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{item.genre}</span>
          <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "inline-block" }} />
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{item.episodes}</span>
        </div>

        {/* Watch Now button (hover) */}
        {hov && (
          <button style={{
            marginTop: "16px", width: "100%", padding: "10px 0", borderRadius: "10px",
            background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff",
            border: "none", fontSize: "12px", fontWeight: 700, cursor: "pointer",
            boxShadow: `0 0 24px ${item.accentGlow}`, animation: "foFadeIn 0.2s ease-out",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
            {t("originals.watchNow")}
          </button>
        )}
      </div>
    </div>
  );
}

export default function FeaturedOriginals() {
  const { t } = useLanguage();
  return (
    <section id="originals" style={{ background: "#060816", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      {/* Separator glow */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)", width: "900px", height: "450px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 75%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 3 }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div style={{ display: "inline-block", padding: "5px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: "18px" }}>
            {t("originals.badge")}
          </div>
          <h2 style={{
            fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 900,
            color: "#fff", margin: "0 0 12px", letterSpacing: "-1px",
            fontFamily: "Inter, sans-serif",
          }}>
            {t("originals.title_part1")}{" "}
            <span style={{
              background: "linear-gradient(135deg, #c084fc, #818cf8)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {t("originals.title_part2")}
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.48)", fontSize: "16px", maxWidth: "460px", margin: "0 auto", lineHeight: 1.6 }}>
            {t("originals.subtitle")}
          </p>
        </div>

        {/* Mosaic grid: 1 tall + 4 smaller */}
        <div className="fo-outer-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "auto auto",
          gap: "14px",
        }}>
          {/* Large card spans 2 rows */}
          <div style={{ gridColumn: "1 / 2", gridRow: "1 / 3" }}>
            <OriginalCard item={ORIGINALS[0]} large />
          </div>
          {/* 4 smaller cards */}
          {ORIGINALS.slice(1).map((item) => (
            <OriginalCard key={item.id} item={item} large={false} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes foFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .fo-outer-grid {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: unset !important;
          }
          .fo-large { grid-column: 1 / -1 !important; grid-row: unset !important; }
        }
        @media (max-width: 580px) {
          .fo-outer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
