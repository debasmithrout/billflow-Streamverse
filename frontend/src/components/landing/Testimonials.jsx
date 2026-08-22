import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const TESTIMONIALS = [
  {
    key: "author1",
    handle: "@priya_streams",
    rating: 5,
    avatarGradient: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    initials: "PS",
  },
  {
    key: "author2",
    handle: "@rahul_binge",
    rating: 5,
    avatarGradient: "linear-gradient(135deg, #0891b2, #0e7490)",
    initials: "RM",
  },
  {
    key: "author3",
    handle: "@sneha_filmy",
    rating: 5,
    avatarGradient: "linear-gradient(135deg, #be185d, #9d174d)",
    initials: "SA",
  },
];

function StarRow({ count }) {
  return (
    <div style={{ display: "flex", gap: "3px" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? "#f59e0b" : "rgba(255,255,255,0.15)"} stroke="none">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { t } = useLanguage();
  return (
    <section style={{ background: "#080a1e", padding: "96px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "900px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-block", padding: "5px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: "18px" }}>
            {t("testimonials.badge")}
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-1px", fontFamily: "Inter, sans-serif" }}>
            {t("testimonials.title_part1")}{" "}
            <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("testimonials.title_part2")}
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
            {t("testimonials.subtitle")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }} className="test-grid">
          {TESTIMONIALS.map((tItem) => (
            <div key={tItem.key} style={{ padding: "28px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.3s", display: "flex", flexDirection: "column", gap: "16px" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.06)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; e.currentTarget.style.transform = "translateY(-5px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
              {/* Stars */}
              <StarRow count={tItem.rating} />
              {/* Quote */}
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", lineHeight: 1.7, margin: 0, fontWeight: 400, fontStyle: "italic" }}>
                "{t(`testimonials.${tItem.key}_review`)}"
              </p>
              {/* User */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: tItem.avatarGradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 800, color: "#fff", flexShrink: 0, boxShadow: "0 0 14px rgba(139,92,246,0.3)" }}>
                  {tItem.initials}
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>{t(`testimonials.${tItem.key}_name`)}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{t(`testimonials.${tItem.key}_role`)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 840px) { .test-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .test-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
