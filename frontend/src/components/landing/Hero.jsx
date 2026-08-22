import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ── 3-card premium staggered layout ─────────────────────────────────────────
// Only 3 cards: main center + top-left + bottom-right
// All TMDB w342 verified poster paths
const HERO_POSTERS = [
  {
    id: "main",
    title: "Solo Leveling",
    genre: "Anime · S2",
    rating: "9.2",
    // Solo Leveling Season 2 poster — verified
    poster: "https://image.tmdb.org/t/p/w342/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg",
    accentColor: "#a78bfa",
    fallback: "linear-gradient(160deg, #2e1065, #1e1b4b)",
    // Center main card — largest
    role: "main",
  },
  {
    id: "top",
    title: "Demon Slayer",
    genre: "Anime · S4",
    rating: "8.9",
    // Demon Slayer poster — verified on TMDB
    poster: "https://image.tmdb.org/t/p/w342/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg",
    accentColor: "#ef4444",
    fallback: "linear-gradient(160deg, #450a0a, #1c0000)",
    role: "top",
  },
  {
    id: "bottom",
    title: "Squid Game",
    genre: "K-Drama · S2",
    rating: "8.9",
    // Squid Game S2 poster — verified on TMDB
    poster: "https://image.tmdb.org/t/p/w342/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    accentColor: "#10b981",
    fallback: "linear-gradient(160deg, #064e3b, #010d0a)",
    role: "bottom",
  },
];

// ── Single poster card component ─────────────────────────────────────────────
function PosterCard({ card }) {
  const [imgErr, setImgErr] = useState(false);

  const isMain   = card.role === "main";
  const isTop    = card.role === "top";
  const isBottom = card.role === "bottom";

  // Positional styles for the 3-card staggered layout
  const posStyle = isMain
    ? { width: "190px", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 4 }
    : isTop
      ? { width: "145px", position: "absolute", top: "4%", left: "4%", zIndex: 3,
          animation: "hpFloat1 7s ease-in-out infinite alternate" }
      : { width: "145px", position: "absolute", bottom: "5%", right: "4%", zIndex: 3,
          animation: "hpFloat2 8s ease-in-out infinite alternate" };

  return (
    <div style={{
      ...posStyle,
      borderRadius: "16px",
      overflow: "hidden",
      background: card.fallback,
      border: `1px solid ${card.accentColor}45`,
      boxShadow: isMain
        ? `0 24px 60px rgba(0,0,0,0.75), 0 0 50px ${card.accentColor}30`
        : `0 12px 40px rgba(0,0,0,0.6), 0 0 24px ${card.accentColor}20`,
      transition: "box-shadow 0.3s",
    }}>
      {/* Poster */}
      <div style={{ width: "100%", aspectRatio: "2/3", position: "relative" }}>
        {!imgErr ? (
          <img
            src={card.poster}
            alt={card.title}
            onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: card.fallback,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: 900, color: "rgba(255,255,255,0.08)" }}>
              {card.title[0]}
            </span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)",
        }} />

        {/* Genre badge */}
        <div style={{
          position: "absolute", top: "8px", left: "8px",
          padding: "2px 8px", borderRadius: "5px",
          background: `${card.accentColor}28`, backdropFilter: "blur(8px)",
          border: `1px solid ${card.accentColor}50`,
          color: card.accentColor, fontSize: "9px", fontWeight: 700,
        }}>
          {card.genre}
        </div>

        {/* Rating */}
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          display: "flex", alignItems: "center", gap: "3px",
          background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)",
          padding: "2px 7px", borderRadius: "5px",
        }}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
          <span style={{ color: "#fbbf24", fontSize: "9px", fontWeight: 700 }}>{card.rating}</span>
        </div>

        {/* Play icon on main card */}
        {isMain && (
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: "46px", height: "46px", borderRadius: "50%",
            background: "rgba(139,92,246,0.85)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 32px rgba(139,92,246,0.7), 0 0 0 8px rgba(139,92,246,0.12)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </div>
        )}

        {/* Title */}
        <div style={{
          position: "absolute", bottom: "8px", left: "8px", right: "8px",
          color: "#fff", fontWeight: 700, fontSize: isMain ? "13px" : "11px",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          textShadow: "0 1px 8px rgba(0,0,0,0.9)",
        }}>
          {card.title}
        </div>
      </div>
    </div>
  );
}

// ── Now Streaming badge ───────────────────────────────────────────────────────
function NowLiveBadge() {
  const { t } = useLanguage();
  return (
    <div style={{
      position: "absolute", top: "10%", right: "10%", zIndex: 5,
      background: "rgba(6,8,22,0.9)", backdropFilter: "blur(20px)",
      border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px",
      padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(139,92,246,0.15)",
      animation: "hpFloat2 6s ease-in-out infinite alternate",
      minWidth: "170px",
    }}>
      <div style={{
        width: "34px", height: "48px", borderRadius: "7px", overflow: "hidden",
        background: "linear-gradient(160deg, #2e1065, #1e1b4b)", flexShrink: 0,
        boxShadow: "0 0 10px rgba(139,92,246,0.4)",
      }}>
        <img
          src="https://image.tmdb.org/t/p/w92/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg"
          alt="Now streaming"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "2px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", display: "inline-block", boxShadow: "0 0 6px #ef4444", animation: "hvPulse 1.5s ease-in-out infinite" }} />
          <span style={{ color: "#ef4444", fontSize: "9px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase" }}>{t("hero.liveLabel")}</span>
        </div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {t("hero.liveTitle")}
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>{t("hero.liveSubtitle")}</div>
      </div>
    </div>
  );
}

// ── Stats card — anchored directly below the main center poster ─────────────────
function StatsBar() {
  const { t } = useLanguage();
  return (
    <div style={{
      // Positioned just below the main card (190px wide, ~285px tall, centered at 50%/50%)
      // Main card bottom edge is at: top 50% + half-height ~142px = ~top 50% + 148px
      position: "absolute",
      top: "calc(50% + 152px)",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 5,
      // Tight glassmorphism strip
      background: "rgba(6,8,22,0.92)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(139,92,246,0.32)",
      borderRadius: "12px",
      padding: "10px 20px",
      display: "flex",
      gap: "20px",
      boxShadow: "0 4px 24px rgba(0,0,0,0.55), 0 0 0 1px rgba(139,92,246,0.12) inset, 0 0 18px rgba(139,92,246,0.18)",
      whiteSpace: "nowrap",
      width: "220px",
      justifyContent: "space-around",
    }}>
      {[
        { value: "50M+",  label: "Viewers", key: "statViewers" },
        { value: "100K+", label: "Titles", key: "statTitles" },
        { value: "4.8★",  label: "Rating", key: "statRating" },
      ].map((s) => (
        <div key={s.label} style={{ textAlign: "center" }}>
          <div style={{ color: "#a78bfa", fontWeight: 900, fontSize: "14px", letterSpacing: "-0.3px" }}>{s.value}</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "9px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{t(`hero.${s.key}`)}</div>
        </div>
      ))}
    </div>
  );
}

// ── Style constants ───────────────────────────────────────────────────────────
const S = {
  section: { position: "relative", minHeight: "95vh", display: "flex", alignItems: "center", overflow: "hidden", background: "#060816" },
  grid: {
    position: "absolute", inset: 0, zIndex: 0,
    backgroundImage: "linear-gradient(rgba(139,92,246,0.032) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.032) 1px, transparent 1px)",
    backgroundSize: "72px 72px",
    maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
    WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%)",
  },
  orb1: { position: "absolute", top: "10%", right: "22%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)", filter: "blur(55px)", zIndex: 0, pointerEvents: "none", animation: "hvOrb1 9s ease-in-out infinite alternate" },
  orb2: { position: "absolute", bottom: "15%", left: "5%", width: "360px", height: "360px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.09) 0%, transparent 70%)", filter: "blur(45px)", zIndex: 0, pointerEvents: "none", animation: "hvOrb2 7s ease-in-out infinite alternate" },
  layout: { position: "relative", zIndex: 2, maxWidth: "1400px", margin: "0 auto", padding: "100px 32px 80px", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center" },
  // Left column
  badgePill: { display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", marginBottom: "28px" },
  badgeDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#a78bfa", display: "inline-block", boxShadow: "0 0 10px #a78bfa", animation: "hvPulse 2s ease-in-out infinite" },
  badgeText: { color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.6px", textTransform: "uppercase" },
  h1: { fontSize: "clamp(36px, 5vw, 72px)", fontWeight: 900, lineHeight: 1.05, color: "#fff", letterSpacing: "-2px", margin: "0 0 22px", fontFamily: "Inter, sans-serif" },
  h1Grad: { background: "linear-gradient(135deg, #c084fc 0%, #a78bfa 40%, #818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  h1Muted: { color: "rgba(255,255,255,0.42)", fontWeight: 800 },
  subtitle: { fontSize: "clamp(14px, 1.6vw, 17px)", color: "rgba(255,255,255,0.55)", lineHeight: 1.75, maxWidth: "460px", margin: "0 0 32px", fontWeight: 400 },
  ctaRow: { display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "22px" },
  btnPrimary: { padding: "14px 30px", borderRadius: "12px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontSize: "15px", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 0 36px rgba(139,92,246,0.55)", transition: "all 0.25s", display: "flex", alignItems: "center", gap: "9px" },
  btnSecondary: { padding: "14px 26px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: "15px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.14)", cursor: "pointer", transition: "all 0.25s", display: "flex", alignItems: "center", gap: "8px", backdropFilter: "blur(12px)" },
  emailForm: { display: "flex", maxWidth: "420px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.22)", borderRadius: "12px", padding: "5px", marginBottom: "26px", backdropFilter: "blur(12px)" },
  emailInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "13px", padding: "8px 14px", fontFamily: "Inter, sans-serif" },
  emailBtn: { padding: "9px 20px", borderRadius: "9px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", color: "#fff", fontSize: "12px", fontWeight: 700, border: "none", cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.2s" },
  trustRow: { display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "26px" },
  trustItem: { display: "flex", alignItems: "center", gap: "7px" },
  trustLabel: { color: "rgba(255,255,255,0.55)", fontSize: "13px", fontWeight: 500 },
  tagsRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  tag: { padding: "5px 14px", borderRadius: "100px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)", color: "rgba(167,139,250,0.85)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px" },
  // Right panel
  rightPanel: { position: "relative", height: "520px" },
  bottomFade: { position: "absolute", bottom: 0, left: 0, right: 0, height: "110px", background: "linear-gradient(to bottom, transparent, #060816)", zIndex: 2, pointerEvents: "none" },
};

import { useLanguage } from "../../context/LanguageContext";

const TRUST_BADGES = [
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, key: "badgeNoCard" },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, key: "badgeAccess" },
  { icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>, key: "badgeCancel" },
];

const CONTENT_TAGS = [
  { label: "Anime", key: "anime" },
  { label: "Hollywood", key: "hollywood" },
  { label: "Bollywood", key: "bollywood" },
  { label: "K-Drama", key: "kdrama" },
  { label: "Web Series", key: "webseries" },
  { label: "Sports", key: "sports" }
];

export default function Hero() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();
  // Email pre-fill → navigate("/register", { state: { email } })
  const handleStart = () => navigate("/register", { state: { email } });
  const handleEmailSubmit = (e) => { e.preventDefault(); navigate("/register", { state: { email } }); };

  return (
    <section style={S.section}>
      <div style={S.grid} />
      <div style={S.orb1} />
      <div style={S.orb2} />

      <div style={S.layout}>
        {/* ── LEFT: Copy & CTA ── */}
        <div>
          <div style={S.badgePill}>
            <span style={S.badgeDot} />
            <span style={S.badgeText}>{t("hero.badge")}</span>
          </div>

          <h1 style={S.h1}>
            {t("hero.title_part1")} <span style={S.h1Grad}>{t("hero.title_part2")}</span>
            <br />
            {t("hero.title_part3")} <span style={S.h1Muted}>{t("hero.title_part4")}</span>
          </h1>

          <p style={S.subtitle}>
            {t("hero.subtitle")}
          </p>

          <div style={S.ctaRow}>
            <button onClick={handleStart} style={S.btnPrimary}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 0 55px rgba(139,92,246,0.75)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 36px rgba(139,92,246,0.55)"; }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
              {t("hero.ctaTrial")}
            </button>
            <button
              onClick={() => document.getElementById("trending")?.scrollIntoView({ behavior: "smooth" })}
              style={S.btnSecondary}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12l4 4 4-4" /></svg>
              {t("hero.ctaExplore")}
            </button>
          </div>

          {/* Email pre-fill → navigate("/register", { state: { email } }) */}
          <form onSubmit={handleEmailSubmit} style={S.emailForm}>
            <input type="email" placeholder={t("hero.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} style={S.emailInput} />
            <button type="submit" style={S.emailBtn}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}>
              {t("hero.getStarted")} →
            </button>
          </form>

          <div style={S.trustRow}>
            {TRUST_BADGES.map((b) => (
              <div key={b.key} style={S.trustItem}>{b.icon}<span style={S.trustLabel}>{t(`hero.${b.key}`)}</span></div>
            ))}
          </div>

          <div style={S.tagsRow}>
            {CONTENT_TAGS.map((tTag) => <span key={tTag.key} style={S.tag}>{t(`trending.${tTag.key}`)}</span>)}
          </div>
        </div>

        {/* ── RIGHT: 3-card staggered poster layout ── */}
        <div style={S.rightPanel} className="hero-right-panel">
          {/* Ambient purple glow */}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 65%)", pointerEvents: "none", zIndex: 0 }} />

          {/* Subtle concentric ring decoration */}
          <svg width="360" height="360" viewBox="0 0 360 360" fill="none"
            style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", opacity: 0.055, pointerEvents: "none", zIndex: 1 }}>
            <circle cx="180" cy="180" r="170" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="12 8" />
            <circle cx="180" cy="180" r="120" stroke="#a78bfa" strokeWidth="1" />
            <circle cx="180" cy="180" r="68" stroke="#a78bfa" strokeWidth="1" strokeDasharray="6 5" />
          </svg>

          {/* 3 poster cards in staggered layout */}
          {HERO_POSTERS.map((card) => <PosterCard key={card.id} card={card} />)}

          {/* Now Live badge */}
          <NowLiveBadge />

          {/* Stats bar at bottom */}
          <StatsBar />
        </div>
      </div>

      <div style={S.bottomFade} />

      <style>{`
        @keyframes hvOrb1  { from { transform: translate(0,0) scale(1); }    to { transform: translate(-25px,18px) scale(1.1); } }
        @keyframes hvOrb2  { from { transform: translate(0,0); }             to { transform: translate(18px,-22px); } }
        @keyframes hvPulse { 0%,100% { opacity:1; }                          50% { opacity:0.3; } }
        @keyframes hpFloat1 { from { transform: translateY(0);  }            to { transform: translateY(-14px); } }
        @keyframes hpFloat2 { from { transform: translateY(0);  }            to { transform: translateY(12px); } }
        @media (max-width: 900px) {
          .hero-right-panel { display: none !important; }
        }
      `}</style>
    </section>
  );
}
