import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage, LANGUAGES } from "../../context/LanguageContext";

// Marketing navigation for landing page — smooth scroll to sections
const NAV_LINKS = [
  { label: "Home",      href: "#",        scroll: null, key: "home" },
  { label: "Features",  href: "#services", scroll: "services", key: "features" },
  { label: "Originals", href: "#originals",scroll: "originals", key: "originals" },
  { label: "Pricing",   href: "#pricing",  scroll: "pricing", key: "pricing" },
  { label: "FAQ",       href: "#faq",      scroll: "faq", key: "faq" },
];

function scrollTo(id) {
  if (!id) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const [langOpen, setLangOpen]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const { langCode, changeLanguage, t }   = useLanguage();

  const currentLangLabel = LANGUAGES.find(l => l.code === langCode)?.label || "English";

  return (
    <nav
      style={{
        position: "sticky", top: 0, zIndex: 50, width: "100%",
        background: "rgba(6,8,22,0.88)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.14)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1400px", margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          height: "68px", gap: "16px",
        }}
      >
        {/* ── Logo ── */}
        <Link
          to="/"
          style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", flexShrink: 0 }}
        >
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 20px rgba(124,58,237,0.5)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="5,3 19,12 5,21" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", fontFamily: "Inter, sans-serif" }}>
            Stream<span style={{ color: "#8b5cf6" }}>Verse</span>
          </span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div
          className="sv-desktop-nav"
          style={{ display: "flex", alignItems: "center", gap: "32px", flex: 1, justifyContent: "center" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.scroll); }}
              style={{
                color: "rgba(255,255,255,0.68)", textDecoration: "none",
                fontSize: "14px", fontWeight: 500, letterSpacing: "0.2px",
                transition: "color 0.2s", whiteSpace: "nowrap", cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#a78bfa")}
              onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.68)")}
            >
              {t(`navbar.${link.key}`)}
            </a>
          ))}
        </div>

        {/* ── Right Controls ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          {/* Language Dropdown */}
          <div style={{ position: "relative" }} className="sv-lang-dropdown">
            <button
              onClick={() => setLangOpen(!langOpen)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px", padding: "7px 10px",
                cursor: "pointer", color: "rgba(255,255,255,0.65)",
                fontSize: "12px", fontWeight: 500, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139,92,246,0.12)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span className="sv-lang-label">{currentLangLabel}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {langOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "rgba(10,8,32,0.98)",
                border: "1px solid rgba(139,92,246,0.25)",
                borderRadius: "10px", overflow: "hidden",
                minWidth: "140px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 24px rgba(139,92,246,0.08)",
                backdropFilter: "blur(20px)",
              }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { changeLanguage(lang.code); setLangOpen(false); }}
                    style={{
                      width: "100%",
                      background: langCode === lang.code ? "rgba(139,92,246,0.18)" : "transparent",
                      border: "none", padding: "10px 16px",
                      color: langCode === lang.code ? "#a78bfa" : "rgba(255,255,255,0.65)",
                      fontSize: "13px", textAlign: "left", cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (langCode !== lang.code) e.currentTarget.style.background = "rgba(139,92,246,0.08)"; }}
                    onMouseLeave={(e) => { if (langCode !== lang.code) e.currentTarget.style.background = "transparent"; }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>
                  {/* Sign In */}
          <Link
            to="/login"
            style={{
              padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 600,
              color: "rgba(255,255,255,0.85)", textDecoration: "none",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.14)",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.5)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "rgba(255,255,255,0.85)"; e.currentTarget.style.background = "transparent"; }}
          >
            {t("navbar.signIn")}
          </Link>

          {/* Start Free Trial — primary CTA */}
          <Link
            to="/register"
            style={{
              padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: 700,
              color: "#fff", textDecoration: "none",
              background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
              boxShadow: "0 0 20px rgba(139,92,246,0.4)",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            className="sv-trial-btn"
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 32px rgba(139,92,246,0.65)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.4)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {t("navbar.startFreeTrial")}
          </Link>

          {/* Mobile Hamburger */}
          <button
            className="sv-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: "none", background: "none", border: "none", color: "rgba(255,255,255,0.8)", cursor: "pointer", padding: "4px" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></>}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div style={{
          background: "rgba(6,8,22,0.98)",
          borderTop: "1px solid rgba(139,92,246,0.12)",
          padding: "16px 24px 20px",
          display: "flex", flexDirection: "column", gap: "4px",
        }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => { e.preventDefault(); scrollTo(link.scroll); setMobileOpen(false); }}
              style={{
                color: "rgba(255,255,255,0.75)", textDecoration: "none",
                padding: "11px 4px", fontSize: "15px", fontWeight: 500,
                borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer",
              }}
            >
              {t(`navbar.${link.key}`)}
            </a>
          ))}
          <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              style={{
                flex: 1, padding: "11px", borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", textAlign: "center", fontWeight: 600,
                fontSize: "14px", textDecoration: "none",
              }}
            >
              {t("navbar.signIn")}
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileOpen(false)}
              style={{
                flex: 1, padding: "11px", borderRadius: "8px",
                background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                color: "#fff", textAlign: "center", fontWeight: 700,
                fontSize: "14px", textDecoration: "none",
              }}
            >
              {t("navbar.startFreeTrial")}
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 960px) {
          .sv-desktop-nav { display: none !important; }
          .sv-hamburger   { display: flex !important; }
          .sv-trial-btn   { display: none !important; }
          .sv-lang-label  { display: none; }
        }
        @media (max-width: 600px) {
          .sv-lang-dropdown { display: none; }
        }
      `}</style>
    </nav>
  );
}
