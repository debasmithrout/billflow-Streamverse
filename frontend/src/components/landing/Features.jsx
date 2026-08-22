import { useLanguage } from "../../context/LanguageContext";

const SUBSCRIPTION_FEATURES = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 11H18.21" /></svg>,
    key: "feature1",
    accent: "#8b5cf6",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>,
    key: "feature2",
    accent: "#10b981",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
    key: "feature3",
    accent: "#f59e0b",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    key: "feature4",
    accent: "#06b6d4",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    key: "feature5",
    accent: "#a855f7",
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    key: "feature6",
    accent: "#ec4899",
  },
];

// Billing flow mockup — no fake API calls, purely illustrative UI
function BillingMockup() {
  const { t } = useLanguage();
  return (
    <div style={{ background: "rgba(139,92,246,0.04)", border: "1px solid rgba(139,92,246,0.18)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: "14px" }}>{t("features.mock_title")}</span>
        <span style={{ padding: "3px 12px", borderRadius: "100px", background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.35)", color: "#a78bfa", fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px" }}>{t("features.mock_active")}</span>
      </div>
      {[
        { labelKey: "mock_plan", valueKey: "mock_plan_val", valueColor: "#fff" },
        { labelKey: "mock_cycle", valueKey: "mock_cycle_val", valueColor: "rgba(255,255,255,0.65)" },
        { labelKey: "mock_trial", valueKey: "mock_trial_val", valueColor: "#34d399" },
        { labelKey: "mock_renew", valueKey: "mock_renew_val", valueColor: "#a78bfa" },
      ].map((row) => (
        <div key={row.labelKey} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}>{t(`features.${row.labelKey}`)}</span>
          <span style={{ color: row.valueColor, fontSize: "13px", fontWeight: 700 }}>{t(`features.${row.valueKey}`)}</span>
        </div>
      ))}
      <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399" }} />
          <span style={{ color: "#34d399", fontSize: "12px", fontWeight: 600 }}>{t("features.mock_footer")}</span>
        </div>
      </div>
    </div>
  );
}

export default function Features() {
  const { t } = useLanguage();
  return (
    <section id="features" style={{ background: "#080a1e", padding: "96px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "800px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "72px", alignItems: "start" }} className="fe-grid">
          {/* Left: 6 feature tiles */}
          <div>
            <div style={{ marginBottom: "44px" }}>
              <div style={{ display: "inline-block", padding: "5px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: "18px" }}>
                {t("features.badge")}
              </div>
              <h2 style={{ fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 900, color: "#fff", margin: "0 0 14px", letterSpacing: "-1px", fontFamily: "Inter, sans-serif" }}>
                {t("features.title_part1")}{" "}
                <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  {t("features.title_part2")}
                </span>
                {t("features.title_part3")}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", lineHeight: 1.65, margin: 0 }}>
                {t("features.subtitle")}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {SUBSCRIPTION_FEATURES.map((f) => (
                <div key={f.key} style={{ padding: "18px 16px", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.06)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.25)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: f.accent, marginBottom: "14px" }}>
                    {f.icon}
                  </div>
                  <h4 style={{ color: "#fff", fontWeight: 750, fontSize: "14px", margin: "0 0 6px" }}>{t(`features.${f.key}_title`)}</h4>
                  <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", lineHeight: 1.5, margin: 0, fontWeight: 400 }}>{t(`features.${f.key}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mockup Illustration */}
          <div style={{ position: "sticky", top: "120px" }}>
            <BillingMockup />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .fe-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  );
}
