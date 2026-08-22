import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const FEATURES = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>,
    key: "feature1",
    accent: "#8b5cf6",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    key: "feature2",
    accent: "#06b6d4",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" /></svg>,
    key: "feature3",
    accent: "#a855f7",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    key: "feature4",
    accent: "#ec4899",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    key: "feature5",
    accent: "#f59e0b",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    key: "feature6",
    accent: "#10b981",
  },
];

function FeatureCard({ f }) {
  const [hov, setHov] = useState(false);
  const { t } = useLanguage();
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: "28px 24px", borderRadius: "20px",
        background: hov ? "rgba(139,92,246,0.07)" : "rgba(255,255,255,0.03)",
        border: hov ? `1px solid ${f.accent}45` : "1px solid rgba(255,255,255,0.07)",
        transition: "all 0.3s ease",
        transform: hov ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hov ? `0 16px 48px rgba(0,0,0,0.4), 0 0 28px ${f.accent}18` : "none",
      }}
    >
      <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: hov ? `${f.accent}20` : "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px", transition: "all 0.3s", color: hov ? f.accent : "#a78bfa", transform: hov ? "scale(1.08)" : "scale(1)" }}>
        {f.icon}
      </div>
      <h3 style={{ color: "#fff", fontWeight: 800, fontSize: "17px", margin: "0 0 10px", letterSpacing: "-0.3px" }}>{t(`services.${f.key}_title`)}</h3>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>{t(`services.${f.key}_desc`)}</p>
    </div>
  );
}

export default function Services() {
  const { t } = useLanguage();
  return (
    <section id="services" style={{ background: "#060816", padding: "96px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />
      <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: "900px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.055) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div style={{ display: "inline-block", padding: "5px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: "18px" }}>
            {t("services.badge")}
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-1px", fontFamily: "Inter, sans-serif" }}>
            {t("services.title_part1")}{" "}
            <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("services.title_part2")}
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", maxWidth: "480px", margin: "0 auto", lineHeight: 1.6 }}>
            {t("services.subtitle")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }} id="services-grid">
          {FEATURES.map((f) => <FeatureCard key={f.key} f={f} />)}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { #services-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { #services-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
