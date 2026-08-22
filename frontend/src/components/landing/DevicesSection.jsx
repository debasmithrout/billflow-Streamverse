import { useLanguage } from "../../context/LanguageContext";

const DEVICES = [
  {
    label: "Mobile", sub: "iOS & Android",
    icon: (
      <svg width="56" height="90" viewBox="0 0 56 90" fill="none">
        <rect x="2" y="2" width="52" height="86" rx="10" stroke="rgba(139,92,246,0.7)" strokeWidth="2" />
        <rect x="8" y="12" width="40" height="58" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        {/* Screen content lines */}
        <rect x="12" y="18" width="32" height="3" rx="1.5" fill="rgba(139,92,246,0.25)" />
        <rect x="12" y="26" width="20" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
        {/* Mini play button */}
        <circle cx="28" cy="46" r="10" fill="rgba(139,92,246,0.3)" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" />
        <polygon points="25,42 33,46 25,50" fill="rgba(167,139,250,0.9)" />
        {/* Progress bar */}
        <rect x="12" y="62" width="32" height="2" rx="1" fill="rgba(255,255,255,0.08)" />
        <rect x="12" y="62" width="18" height="2" rx="1" fill="rgba(139,92,246,0.6)" />
        {/* Home indicator */}
        <rect x="20" y="80" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.2)" />
      </svg>
    ),
  },
  {
    label: "Tablet", sub: "iPad & Android",
    icon: (
      <svg width="100" height="78" viewBox="0 0 100 78" fill="none">
        <rect x="2" y="2" width="96" height="74" rx="10" stroke="rgba(139,92,246,0.7)" strokeWidth="2" />
        <rect x="10" y="10" width="80" height="58" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.18)" strokeWidth="1" />
        {/* Screen content */}
        <rect x="14" y="14" width="50" height="3" rx="1.5" fill="rgba(139,92,246,0.25)" />
        <rect x="14" y="22" width="30" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
        <circle cx="50" cy="44" r="13" fill="rgba(139,92,246,0.25)" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" />
        <polygon points="46,39 56,44 46,49" fill="rgba(167,139,250,0.9)" />
        <rect x="14" y="60" width="72" height="2" rx="1" fill="rgba(255,255,255,0.07)" />
        <rect x="14" y="60" width="40" height="2" rx="1" fill="rgba(139,92,246,0.55)" />
      </svg>
    ),
  },
  {
    label: "Laptop", sub: "Mac & Windows",
    icon: (
      <svg width="110" height="80" viewBox="0 0 110 80" fill="none">
        {/* Screen */}
        <rect x="10" y="2" width="90" height="62" rx="8" stroke="rgba(139,92,246,0.7)" strokeWidth="2" />
        <rect x="16" y="8" width="78" height="50" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.18)" strokeWidth="1" />
        {/* Screen content */}
        <rect x="20" y="13" width="48" height="3" rx="1.5" fill="rgba(139,92,246,0.25)" />
        <rect x="20" y="21" width="28" height="2" rx="1" fill="rgba(255,255,255,0.1)" />
        <circle cx="55" cy="38" r="11" fill="rgba(139,92,246,0.25)" stroke="rgba(139,92,246,0.5)" strokeWidth="1.5" />
        <polygon points="52,34 61,38 52,43" fill="rgba(167,139,250,0.9)" />
        <rect x="20" y="52" width="70" height="2" rx="1" fill="rgba(255,255,255,0.07)" />
        <rect x="20" y="52" width="38" height="2" rx="1" fill="rgba(139,92,246,0.55)" />
        {/* Base / hinge */}
        <path d="M2 66 H108 L104 78 H6 Z" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
        <rect x="38" y="66" width="34" height="4" rx="2" fill="rgba(139,92,246,0.25)" />
      </svg>
    ),
  },
  {
    label: "Smart TV", sub: "Samsung & LG",
    icon: (
      <svg width="130" height="90" viewBox="0 0 130 90" fill="none">
        {/* Screen frame */}
        <rect x="2" y="2" width="126" height="76" rx="10" stroke="rgba(139,92,246,0.7)" strokeWidth="2" />
        <rect x="10" y="10" width="110" height="60" rx="4" fill="rgba(139,92,246,0.08)" stroke="rgba(139,92,246,0.18)" strokeWidth="1" />
        {/* Screen content */}
        <rect x="16" y="16" width="70" height="4" rx="2" fill="rgba(139,92,246,0.28)" />
        <rect x="16" y="26" width="40" height="2.5" rx="1.25" fill="rgba(255,255,255,0.1)" />
        <circle cx="65" cy="47" r="15" fill="rgba(139,92,246,0.28)" stroke="rgba(139,92,246,0.55)" strokeWidth="2" />
        <polygon points="61,42 73,47 61,53" fill="rgba(167,139,250,1)" />
        <rect x="16" y="64" width="98" height="2.5" rx="1.25" fill="rgba(255,255,255,0.07)" />
        <rect x="16" y="64" width="55" height="2.5" rx="1.25" fill="rgba(139,92,246,0.6)" />
        {/* TV stand */}
        <path d="M45 80 L50 90 L80 90 L85 80 Z" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.35)" strokeWidth="1.5" />
        <rect x="40" y="88" width="50" height="3" rx="1.5" fill="rgba(139,92,246,0.18)" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
      </svg>
    ),
  },
];

export default function DevicesSection() {
  const { t } = useLanguage();
  return (
    <section style={{ background: "#080a1e", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "800px", height: "1px", background: "linear-gradient(to right, transparent, rgba(139,92,246,0.4), transparent)" }} />

      {/* Ambient glows */}
      <div style={{ position: "absolute", top: "30%", left: "5%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "20%", right: "5%", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }} className="dv-grid">
          {/* Left text */}
          <div>
            <div style={{ display: "inline-block", padding: "5px 18px", borderRadius: "100px", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.28)", color: "#a78bfa", fontSize: "11px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", marginBottom: "22px" }}>
              {t("devices.badge")}
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3.8vw, 50px)", fontWeight: 900, color: "#fff", margin: "0 0 20px", letterSpacing: "-1.2px", lineHeight: 1.08, fontFamily: "Inter, sans-serif" }}>
              {t("devices.title_part1")}{" "}
              <span style={{ background: "linear-gradient(135deg, #c084fc, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                {t("devices.title_part2")}
              </span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "36px" }}>
              {[
                { step: "01", key: "step1" },
                { step: "02", key: "step2" },
                { step: "03", key: "step3" },
              ].map((s) => (
                <div key={s.step} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 800, color: "#a78bfa", flexShrink: 0 }}>
                    {s.step}
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "17px", fontWeight: 600 }}>{t(`devices.${s.key}`)}</span>
                </div>
              ))}
            </div>

            {/* Feature pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {["feature_4kStreaming", "feature_offlineDownloads", "feature_audioSurround", "feature_hdrSupport"].map((fKey) => (
                <div key={fKey} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "100px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  <span style={{ color: "#a78bfa", fontSize: "12px", fontWeight: 600 }}>{t(`devices.${fKey}`)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: device SVG illustrations */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px", alignItems: "center" }} className="dv-devices">
            {/* Top row: Mobile + Tablet */}
            <div style={{ display: "flex", gap: "36px", alignItems: "flex-end" }}>
              {DEVICES.slice(0, 2).map((d) => (
                <DeviceCard key={d.label} device={d} />
              ))}
            </div>
            {/* Bottom row: Laptop + TV */}
            <div style={{ display: "flex", gap: "28px", alignItems: "flex-end" }}>
              {DEVICES.slice(2).map((d) => (
                <DeviceCard key={d.label} device={d} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .dv-grid { grid-template-columns: 1fr !important; }
          .dv-devices { display: none !important; }
        }
      `}</style>
    </section>
  );
}

function DeviceCard({ device }) {
  const { t } = useLanguage();
  const lowerLabel = device.label.toLowerCase().replace(/\s/g, "");
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
      <div style={{ padding: "16px", borderRadius: "16px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.1)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(139,92,246,0.2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.05)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.15)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
        {device.icon}
      </div>
      <span style={{ color: "#fff", fontWeight: 700, fontSize: "13px" }}>{t(`devices.label_${lowerLabel}`)}</span>
      <span style={{ color: "rgba(255,255,255,0.38)", fontSize: "11px" }}>{t(`devices.sub_${lowerLabel}`)}</span>
    </div>
  );
}
