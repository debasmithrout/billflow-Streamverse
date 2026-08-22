import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7"];

export default function FAQ() {
  const [active, setActive] = useState(null);
  const { t } = useLanguage();

  return (
    <section id="faq" style={{ background: "#060816", padding: "96px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "700px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <div style={{ display: "inline-block", padding: "5px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: "18px" }}>
            {t("faq.badge")}
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 46px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-1px", fontFamily: "Inter, sans-serif" }}>
            {t("faq.title_part1")}{" "}
            <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {t("faq.title_part2")}
            </span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
            {t("faq.subtitle")}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {FAQ_KEYS.map((key, i) => {
            const isOpen = active === i;
            return (
              <div key={key} style={{ borderRadius: "14px", overflow: "hidden", background: isOpen ? "rgba(139,92,246,0.06)" : "rgba(255,255,255,0.03)", border: isOpen ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(255,255,255,0.07)", transition: "all 0.25s" }}>
                <button
                  onClick={() => setActive(isOpen ? null : i)}
                  style={{ width: "100%", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", textAlign: "left", gap: "16px" }}
                >
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: "15px", lineHeight: 1.4 }}>{t(`faq.${key}`)}</span>
                  <span style={{ flexShrink: 0, width: "26px", height: "26px", borderRadius: "8px", background: isOpen ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.25s", transform: isOpen ? "rotate(45deg)" : "rotate(0)", color: isOpen ? "#a78bfa" : "rgba(255,255,255,0.5)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </span>
                </button>
                <div style={{ maxHeight: isOpen ? "300px" : "0", opacity: isOpen ? 1 : 0, overflow: "hidden", transition: "max-height 0.35s ease, opacity 0.25s ease" }}>
                  <p style={{ padding: "0 24px 20px", color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.75, margin: 0, fontWeight: 400 }}>
                    {t(`faq.a${i + 1}`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
