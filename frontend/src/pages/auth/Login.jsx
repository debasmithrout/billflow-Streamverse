import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { login, getCurrentUser } from "../../services/authService";

// ── SVG helpers ───────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const STATS = [
  { value: "25K+",  label: "Movies" },
  { value: "5K+",   label: "Anime Episodes" },
  { value: "150+",  label: "Live Channels" },
  { value: "1M+",   label: "Active Users" },
];

const FEATURES = [
  "Personalized Recommendations",
  "Watch Anywhere",
  "Secure & Private",
];

// Inline styles for the split-screen layout
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .sv-auth-root * { box-sizing: border-box; }
  .sv-auth-root { font-family: 'Inter', sans-serif; }

  /* Left panel glow orbs */
  .sv-orb-1 {
    position: absolute; top: 15%; left: 10%;
    width: 320px; height: 320px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%);
    filter: blur(60px); pointer-events: none;
    animation: svOrb1 9s ease-in-out infinite alternate;
  }
  .sv-orb-2 {
    position: absolute; bottom: 10%; right: 5%;
    width: 260px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%);
    filter: blur(50px); pointer-events: none;
    animation: svOrb2 7s ease-in-out infinite alternate;
  }
  .sv-orb-right {
    position: absolute; top: 30%; right: 0%;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%);
    filter: blur(80px); pointer-events: none;
  }

  @keyframes svOrb1 { from { transform: translate(0,0); } to { transform: translate(20px,-25px); } }
  @keyframes svOrb2 { from { transform: translate(0,0); } to { transform: translate(-15px,20px); } }

  /* Form card entrance */
  .sv-card-enter {
    animation: svCardUp 0.55s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes svCardUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Left panel entrance */
  .sv-left-enter {
    animation: svLeftIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
  }
  @keyframes svLeftIn {
    from { opacity: 0; transform: translateX(-22px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  /* Input focus glow */
  .sv-input:focus {
    border-color: rgba(139,92,246,0.7) !important;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.15) !important;
    outline: none;
  }
  .sv-input-error:focus {
    border-color: rgba(239,68,68,0.7) !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
  }

  /* Primary button */
  .sv-btn-primary {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    transition: all 0.22s ease;
    box-shadow: 0 0 28px rgba(139,92,246,0.45);
  }
  .sv-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 44px rgba(139,92,246,0.65);
  }
  .sv-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .sv-btn-primary:disabled {
    background: rgba(255,255,255,0.06);
    box-shadow: none;
    color: rgba(255,255,255,0.3);
  }

  /* Social button */
  .sv-btn-social {
    transition: all 0.2s ease;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .sv-btn-social:hover {
    background: rgba(139,92,246,0.1);
    border-color: rgba(139,92,246,0.35);
    transform: translateY(-2px);
  }

  /* Stat card */
  .sv-stat-card {
    background: rgba(139,92,246,0.1);
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 14px;
    padding: 14px 16px;
    text-align: center;
    backdrop-filter: blur(12px);
    transition: all 0.2s;
  }
  .sv-stat-card:hover {
    background: rgba(139,92,246,0.16);
    border-color: rgba(139,92,246,0.36);
    transform: translateY(-3px);
  }

  /* Grid bg */
  .sv-grid-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
  }

  /* Divider */
  .sv-divider {
    display: flex; align-items: center; gap: 12px;
    color: rgba(255,255,255,0.25); font-size: 12px;
  }
  .sv-divider::before, .sv-divider::after {
    content: ''; flex: 1;
    height: 1px; background: rgba(255,255,255,0.1);
  }

  /* Mobile: stack layout */
  @media (max-width: 900px) {
    .sv-split { flex-direction: column !important; min-height: unset !important; }
    .sv-left-panel { min-height: 420px !important; width: 100% !important; }
    .sv-right-panel { width: 100% !important; }
    .sv-left-heading { font-size: 36px !important; }
    .sv-stats-grid { grid-template-columns: 1fr 1fr !important; }
  }
  @media (max-width: 480px) {
    .sv-left-panel { min-height: 320px !important; }
    .sv-right-panel-inner { padding: 24px 20px !important; }
    .sv-social-row { flex-direction: column !important; }
    .sv-social-row .sv-btn-social { width: 100% !important; }
  }
`;

export default function Login() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  // ── ALL ORIGINAL STATES — UNCHANGED ──────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordNote, setForgotPasswordNote] = useState(false);

  // ── ALL ORIGINAL HANDLERS — UNCHANGED ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setForgotPasswordNote(false);

    try {
      const data = await login(email, password);
      const token = data.access_token;

      localStorage.setItem("access_token", token);

      const user = await getCurrentUser(token);
      localStorage.setItem("current_user", JSON.stringify(user));

      setSuccess(true);

      // Success display for 1 second before role-based redirect
      setTimeout(() => {
        const role = user.role?.toUpperCase();
        if (role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/customer";
        }
      }, 1000);

    } catch (err) {
      let errorMsg = "Login failed. Please check your credentials.";
      if (err.response && err.response.data) {
        const detail = err.response.data.detail || err.response.data.message || err.response.data.error;
        if (typeof detail === "string") {
          errorMsg = detail;
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="sv-auth-root"
      style={{
        minHeight: "100vh",
        background: "#060816",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <style>{CSS}</style>

      {/* Split screen container */}
      <div
        className="sv-split"
        style={{ display: "flex", minHeight: "100vh" }}
      >
        {/* ═══════════════════════════════════════════════════════
            LEFT PANEL — Visual showcase
        ════════════════════════════════════════════════════════ */}
        <div
          className="sv-left-panel sv-left-enter"
          style={{
            width: "50%",
            position: "relative",
            background: "linear-gradient(160deg, #0d0b22 0%, #100826 40%, #0a0618 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 48px",
            overflow: "hidden",
            minHeight: "100vh",
          }}
        >
          {/* Background grid */}
          <div className="sv-grid-bg" />
          {/* Glow orbs */}
          <div className="sv-orb-1" />
          <div className="sv-orb-2" />

          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              textDecoration: "none", marginBottom: "52px", position: "relative", zIndex: 2,
            }}
          >
            <div style={{
              width: "38px", height: "38px", borderRadius: "10px",
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(124,58,237,0.55)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span style={{ fontSize: "22px", fontWeight: 900, letterSpacing: "-0.5px" }}>
              Stream<span style={{ color: "#8b5cf6" }}>Verse</span>
            </span>
          </Link>

          {/* Main heading */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: "420px" }}>
            <h1
              className="sv-left-heading"
              style={{ fontSize: "clamp(36px, 3.5vw, 54px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "20px", letterSpacing: "-1.5px" }}
            >
              Welcome{" "}
              <span style={{
                background: "linear-gradient(135deg, #c084fc, #8b5cf6, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Back
              </span>
            </h1>

            <p style={{
              fontSize: "15px", color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7, marginBottom: "40px", fontWeight: 400,
            }}>
              Continue your entertainment journey across movies, anime, sports and exclusive originals.
            </p>

            {/* Stats grid */}
            <div
              className="sv-stats-grid"
              style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                gap: "12px", marginBottom: "40px",
              }}
            >
              {STATS.map((s) => (
                <div key={s.label} className="sv-stat-card">
                  <div style={{ fontSize: "22px", fontWeight: 900, color: "#a78bfa", letterSpacing: "-0.5px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", fontWeight: 500, marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Feature list */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 48px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {FEATURES.map((f) => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "rgba(139,92,246,0.18)",
                    border: "1px solid rgba(139,92,246,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{f}</span>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)", fontWeight: 400 }}>
              © {new Date().getFullYear()} StreamVerse. All rights reserved.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT PANEL — Login form
        ════════════════════════════════════════════════════════ */}
        <div
          className="sv-right-panel"
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            position: "relative",
            background: "#060816",
            overflow: "hidden auto",
          }}
        >
          {/* Subtle right glow */}
          <div className="sv-orb-right" />

          {/* Glass card */}
          <div
            className="sv-card-enter"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "rgba(15,12,40,0.65)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "24px",
              padding: "40px 36px",
              boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08) inset",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* ── Success state ── */}
            {success ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 0 30px rgba(34,197,94,0.2)",
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Welcome Back!</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>Redirecting you now…</p>
              </div>
            ) : (
              <>
                {/* Card heading */}
                <div style={{ marginBottom: "28px" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: 800, marginBottom: "6px", letterSpacing: "-0.5px" }}>
                    Login to Your Account
                  </h2>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.42)", fontWeight: 400 }}>
                    Sign in to your streaming profile
                  </p>
                </div>

                {/* Deleted account alert — ORIGINAL LOGIC */}
                {reason === "deleted" && (
                  <div style={{
                    marginBottom: "20px", padding: "14px 16px", borderRadius: "12px",
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
                    display: "flex", alignItems: "center", gap: "10px",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ fontSize: "13px", color: "#f87171" }}>Your account is no longer available.</span>
                  </div>
                )}

                {/* Error alert — ORIGINAL LOGIC */}
                {error && (
                  <div style={{
                    marginBottom: "20px", padding: "14px 16px", borderRadius: "12px",
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
                    display: "flex", alignItems: "center", gap: "10px",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span style={{ fontSize: "13px", color: "#f87171" }}>{error}</span>
                  </div>
                )}

                {/* Forgot password note — ORIGINAL LOGIC */}
                {forgotPasswordNote && (
                  <div style={{
                    marginBottom: "20px", padding: "14px 16px", borderRadius: "12px",
                    background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                    display: "flex", alignItems: "center", gap: "10px",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span style={{ fontSize: "13px", color: "#a78bfa" }}>Forgot Password functionality is Coming Soon!</span>
                  </div>
                )}

                {/* ── Form — ALL LOGIC UNCHANGED ── */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <fieldset disabled={loading} style={{ border: "none", padding: 0, margin: 0, display: "contents" }}>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: "8px" }}>
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoFocus
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="sv-input"
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          padding: "13px 16px",
                          color: "#fff",
                          fontSize: "14px",
                          outline: "none",
                          transition: "border-color 0.2s, box-shadow 0.2s",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <label htmlFor="password" style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: "1.2px", textTransform: "uppercase" }}>
                          Password
                        </label>
                        {/* Forgot password — ORIGINAL: setForgotPasswordNote(true) */}
                        <button
                          type="button"
                          onClick={() => setForgotPasswordNote(true)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            fontSize: "12px", color: "rgba(255,255,255,0.35)",
                            fontFamily: "inherit", padding: 0,
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div style={{ position: "relative" }}>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="sv-input"
                          style={{
                            width: "100%",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            padding: "13px 44px 13px 16px",
                            color: "#fff",
                            fontSize: "14px",
                            outline: "none",
                            transition: "border-color 0.2s, box-shadow 0.2s",
                            fontFamily: "inherit",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                            background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.35)", padding: 0,
                            display: "flex", alignItems: "center",
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                        >
                          {showPassword ? <EyeOff /> : <EyeOpen />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <input
                        type="checkbox"
                        id="rememberMe"
                        style={{
                          width: "16px", height: "16px", accentColor: "#8b5cf6",
                          cursor: "pointer", borderRadius: "4px",
                        }}
                      />
                      <label htmlFor="rememberMe" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                        Remember me
                      </label>
                    </div>

                    {/* Submit — ORIGINAL disabled/loading logic */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="sv-btn-primary"
                      style={{
                        width: "100%", padding: "14px",
                        borderRadius: "12px", border: "none",
                        color: "#fff", fontSize: "15px", fontWeight: 700,
                        cursor: loading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                        marginTop: "4px",
                        fontFamily: "inherit",
                      }}
                    >
                      {loading ? (
                        <>
                          <svg style={{ animation: "spin 1s linear infinite", width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                          </svg>
                          Signing In…
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          Sign In
                        </>
                      )}
                    </button>
                  </fieldset>
                </form>

                {/* Divider */}
                <div className="sv-divider" style={{ margin: "24px 0" }}>or continue with</div>

                {/* Social buttons */}
                <div className="sv-social-row" style={{ display: "flex", gap: "10px" }}>
                  {[
                    {
                      label: "Google",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Apple",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Facebook",
                      icon: (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ),
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      className="sv-btn-social"
                      style={{
                        flex: 1, padding: "11px 8px",
                        borderRadius: "12px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600,
                        fontFamily: "inherit",
                      }}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Terms */}
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "20px", lineHeight: 1.6 }}>
                  By signing in, you agree to our{" "}
                  <a href="#" style={{ color: "rgba(139,92,246,0.7)", textDecoration: "none" }}>Terms</a>
                  {" "}and{" "}
                  <a href="#" style={{ color: "rgba(139,92,246,0.7)", textDecoration: "none" }}>Privacy Policy</a>
                </p>

                {/* Bottom nav — ORIGINAL Link to /register */}
                <div style={{
                  marginTop: "24px", paddingTop: "20px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  textAlign: "center", fontSize: "13px",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>Don't have an account? </span>
                  <Link to="/register" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>
                    Create Account
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}