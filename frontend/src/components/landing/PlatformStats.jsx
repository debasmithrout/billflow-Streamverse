import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const STATS = [
  { value: 50, suffix: "M+", key: "stat1_label", accent: "#8b5cf6" },
  { value: 100, suffix: "K+", key: "stat2_label", accent: "#a855f7" },
  { value: 150, suffix: "+", key: "stat3_label", accent: "#c084fc" },
  { value: 4.8, suffix: "", key: "stat4_label", accent: "#818cf8", isFloat: true },
];

function Counter({ target, suffix, isFloat }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, isFloat]);

  return (
    <span>
      {isFloat ? count.toFixed(1) : count.toLocaleString()}{suffix}
    </span>
  );
}

export default function PlatformStats() {
  const [visible, setVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    const el = document.getElementById("platform-stats");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="platform-stats" style={{ background: "#060816", padding: "80px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />
      {/* Background gradient strip */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(139,92,246,0.04) 0%, transparent 50%, rgba(168,85,247,0.04) 100%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 40px)", fontWeight: 900, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.8px", fontFamily: "Inter, sans-serif" }}>
            {t("stats.title_part1")}{" "}
            <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("stats.title_part2")}
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", margin: 0 }}>{t("stats.subtitle")}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }} className="ps-grid">
          {STATS.map((stat) => (
            <div key={stat.key} style={{ textAlign: "center", padding: "36px 24px", borderRadius: "20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
              {/* Accent glow */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "120px", height: "120px", borderRadius: "50%", background: `radial-gradient(circle, ${stat.accent}18 0%, transparent 70%)`, pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 900, color: stat.accent, fontFamily: "Inter, sans-serif", letterSpacing: "-1px", lineHeight: 1, marginBottom: "10px" }}>
                  {visible ? <Counter target={stat.value} suffix={stat.suffix} isFloat={stat.isFloat} /> : `0${stat.suffix}`}
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", fontWeight: 500 }}>{t(`stats.${stat.key}`)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) { #platform-stats .ps-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 400px) { #platform-stats .ps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
