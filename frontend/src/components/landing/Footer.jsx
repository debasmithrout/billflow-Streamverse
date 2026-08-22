import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

const COLS = [
  {
    headingKey: "col_explore",
    links: [
      { labelKey: "link_movies", href: "#" },
      { labelKey: "link_anime", href: "#" },
      { labelKey: "link_kdrama", href: "#" },
      { labelKey: "link_webseries", href: "#" },
      { labelKey: "link_sports", href: "#" },
    ],
  },
  {
    headingKey: "col_platform",
    links: [
      { labelKey: "link_features", href: "#services" },
      { labelKey: "link_pricing", href: "#pricing" },
      { labelKey: "link_trial", href: "#pricing" },
      { labelKey: "link_downloads", href: "#" },
    ],
  },
  {
    headingKey: "col_support",
    links: [
      { labelKey: "link_help", href: "#" },
      { labelKey: "link_faq", href: "#faq" },
      { labelKey: "link_contact", href: "#" },
      { labelKey: "link_account", href: "/login" },
    ],
  },
  {
    headingKey: "col_legal",
    links: [
      { labelKey: "link_privacy", href: "#" },
      { labelKey: "link_terms", href: "#" },
      { labelKey: "link_cookie", href: "#" },
      { labelKey: "link_refund", href: "#" },
    ],
  },
];

const SOCIALS = [
  {
    label: "Twitter",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  {
    label: "Instagram",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>,
  },
  {
    label: "YouTube",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
];

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "#040610", borderTop: "1px solid rgba(139,92,246,0.12)", padding: "72px 0 0", color: "rgba(255,255,255,0.45)", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 32px" }}>
        {/* Top: logo + columns */}
        <div style={{ display: "grid", gridTemplateColumns: "260px repeat(4, 1fr)", gap: "40px", paddingBottom: "56px", borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="ft-grid">
          {/* Brand column */}
          <div>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 18px rgba(124,58,237,0.5)" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="5,3 19,12 5,21" fill="white" /></svg>
              </div>
              <span style={{ fontSize: "20px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
                Stream<span style={{ color: "#8b5cf6" }}>Verse</span>
              </span>
            </Link>
            <p style={{ fontSize: "13px", lineHeight: 1.75, color: "rgba(255,255,255,0.38)", marginBottom: "20px" }}>
              {t("hero.subtitle")}
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: "10px" }}>
              {SOCIALS.map((s) => (
                <a key={s.label} href="#" aria-label={s.label} style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.5)", transition: "all 0.2s", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.18)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.color = "#a78bfa"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {COLS.map((col) => (
            <div key={col.headingKey}>
              <h4 style={{ color: "#fff", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.4px", marginBottom: "18px" }}>{t(`footer.${col.headingKey}`)}</h4>
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "11px" }}>
                {col.links.map((lk) => (
                  <li key={lk.labelKey}>
                    {lk.href.startsWith("/") ? (
                      <Link to={lk.href} style={{ color: "rgba(255,255,255,0.42)", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}>
                        {t(`footer.${lk.labelKey}`)}
                      </Link>
                    ) : (
                      <a href={lk.href} style={{ color: "rgba(255,255,255,0.42)", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.42)")}>
                        {t(`footer.${lk.labelKey}`)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom: copyrights */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "32px 0", fontSize: "12px", color: "rgba(255,255,255,0.3)" }} className="ft-bottom">
          <span>© {year} StreamVerse. {t("footer.copyright").replace("© 2026 StreamVerse.", "")}</span>
          <div style={{ display: "flex", gap: "24px" }}>
            <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>{t("footer.link_privacy")}</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")} onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>{t("footer.link_terms")}</a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ft-grid { grid-template-columns: 1fr 1fr !important; gap: 36px !important; }
        }
        @media (max-width: 540px) {
          .ft-grid { grid-template-columns: 1fr !important; }
          .ft-bottom { flex-direction: column; gap: 14px; text-align: center; }
        }
      `}</style>
    </footer>
  );
}
