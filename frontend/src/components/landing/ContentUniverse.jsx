import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const CATEGORIES = [
  { label: "Bollywood", key: "bollywood", count: "12,000+", accent: "#f43f5e", gradient: "linear-gradient(135deg, #4c0519 0%, #1a0008 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg> },
  { label: "Hollywood", key: "hollywood", count: "8,500+", accent: "#f59e0b", gradient: "linear-gradient(135deg, #451a03 0%, #1a0a00 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg> },
  { label: "Anime", key: "anime", count: "6,200+", accent: "#8b5cf6", gradient: "linear-gradient(135deg, #2e1065 0%, #0a0416 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg> },
  { label: "K-Drama", key: "kdrama", count: "3,800+", accent: "#ec4899", gradient: "linear-gradient(135deg, #500724 0%, #1a0010 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> },
  { label: "Web Series", key: "webseries", count: "4,100+", accent: "#06b6d4", gradient: "linear-gradient(135deg, #0c4a6e 0%, #020d14 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" /></svg> },
  { label: "Sports", key: "sports", count: "2,600+", accent: "#22c55e", gradient: "linear-gradient(135deg, #14532d 0%, #042010 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" /><path d="M2 12h20" /></svg> },
  { label: "Music", key: "music", count: "1,900+", accent: "#a855f7", gradient: "linear-gradient(135deg, #3b0764 0%, #0d0118 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg> },
  { label: "Live Events", key: "liveevents", count: "500+", accent: "#ef4444", gradient: "linear-gradient(135deg, #450a0a 0%, #140000 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2" /><path strokeLinecap="round" d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" /></svg> },
  { label: "Documentaries", key: "documentaries", count: "2,200+", accent: "#10b981", gradient: "linear-gradient(135deg, #064e3b 0%, #010f0a 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" /></svg> },
  { label: "Kids", key: "kids", count: "3,400+", accent: "#f97316", gradient: "linear-gradient(135deg, #431407 0%, #140600 100%)", icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
];

function CategoryCard({ cat }) {
  const [hov, setHov] = useState(false);
  const { t } = useLanguage();
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "24px 20px", borderRadius: "18px", cursor: "pointer",
        background: hov ? cat.gradient : "rgba(255,255,255,0.04)",
        border: hov ? `1px solid ${cat.accent}50` : "1px solid rgba(255,255,255,0.08)",
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hov ? `0 16px 48px rgba(0,0,0,0.5), 0 0 30px ${cat.accent}22` : "none",
        display: "flex", flexDirection: "column", gap: "14px",
        position: "relative", overflow: "hidden",
      }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: hov ? `${cat.accent}20` : "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", color: hov ? cat.accent : "rgba(167,139,250,0.8)", transform: hov ? "scale(1.1)" : "scale(1)" }}>
        {cat.icon}
      </div>
      <div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: "15px", marginBottom: "4px" }}>{t(`trending.${cat.key}`)}</div>
        <div style={{ color: hov ? `${cat.accent}cc` : "rgba(255,255,255,0.38)", fontSize: "12px", fontWeight: 500, transition: "color 0.3s" }}>{cat.count} {t("universe.titlesSuffix")}</div>
      </div>
      {hov && (
        <div style={{ position: "absolute", bottom: "16px", right: "16px", width: "24px", height: "24px", borderRadius: "50%", background: `${cat.accent}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={cat.accent} strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        </div>
      )}
    </div>
  );
}

export default function ContentUniverse() {
  const { t } = useLanguage();
  return (
    <section style={{ background: "#080a1e", padding: "88px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "1000px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.055) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-block", padding: "5px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: "18px" }}>
            {t("universe.badge")}
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-1px", fontFamily: "Inter, sans-serif" }}>
            {t("universe.title_part1")}{" "}
            <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("universe.title_part2")}
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", fontWeight: 400, maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            {t("universe.subtitle")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px" }}>
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.label} cat={cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
