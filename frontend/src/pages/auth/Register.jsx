import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/authService";

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

const BENEFITS = [
  { icon: "🎬", label: "7-Day Free Trial" },
  { icon: "📱", label: "Watch Anywhere" },
  { icon: "⬇️", label: "Offline Downloads" },
  { icon: "🎥", label: "4K Ultra HD Streaming" },
  { icon: "👥", label: "Family Profiles" },
];

const COUNTRIES = [
  "India", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Japan", "Singapore", "United Arab Emirates",
];

// Inline CSS
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .sv-reg-root * { box-sizing: border-box; }
  .sv-reg-root { font-family: 'Inter', sans-serif; }

  .sv-reg-orb-1 {
    position: absolute; top: 10%; left: 8%;
    width: 300px; height: 300px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
    filter: blur(60px); pointer-events: none;
    animation: svRegOrb1 9s ease-in-out infinite alternate;
  }
  .sv-reg-orb-2 {
    position: absolute; bottom: 12%; right: 8%;
    width: 240px; height: 240px; border-radius: 50%;
    background: radial-gradient(circle, rgba(192,132,252,0.14) 0%, transparent 70%);
    filter: blur(50px); pointer-events: none;
    animation: svRegOrb2 7s ease-in-out infinite alternate;
  }
  .sv-reg-orb-right {
    position: absolute; top: 20%; left: -5%;
    width: 350px; height: 350px; border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%);
    filter: blur(70px); pointer-events: none;
  }

  @keyframes svRegOrb1 { from { transform: translate(0,0); } to { transform: translate(18px,-22px); } }
  @keyframes svRegOrb2 { from { transform: translate(0,0); } to { transform: translate(-12px,18px); } }

  .sv-reg-card-enter { animation: svRegCardUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }
  @keyframes svRegCardUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .sv-reg-left-enter { animation: svRegLeftIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }
  @keyframes svRegLeftIn {
    from { opacity: 0; transform: translateX(-22px); }
    to   { opacity: 1; transform: translateX(0); }
  }

  .sv-reg-input:focus {
    border-color: rgba(139,92,246,0.7) !important;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.15) !important;
    outline: none;
  }
  .sv-reg-input-error { border-color: rgba(239,68,68,0.55) !important; }
  .sv-reg-input-error:focus {
    border-color: rgba(239,68,68,0.7) !important;
    box-shadow: 0 0 0 3px rgba(239,68,68,0.12) !important;
    outline: none;
  }

  .sv-reg-btn-primary {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    transition: all 0.22s ease;
    box-shadow: 0 0 28px rgba(139,92,246,0.45);
  }
  .sv-reg-btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 44px rgba(139,92,246,0.65);
  }
  .sv-reg-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .sv-reg-btn-primary:disabled {
    background: rgba(255,255,255,0.06) !important;
    box-shadow: none !important;
    color: rgba(255,255,255,0.3) !important;
    cursor: not-allowed !important;
  }

  .sv-reg-btn-social {
    transition: all 0.2s ease;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .sv-reg-btn-social:hover {
    background: rgba(139,92,246,0.1);
    border-color: rgba(139,92,246,0.35);
    transform: translateY(-2px);
  }

  .sv-reg-grid-bg {
    position: absolute; inset: 0; z-index: 0;
    background-image:
      linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px);
    background-size: 56px 56px;
    mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
    -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black 20%, transparent 100%);
  }

  .sv-reg-divider {
    display: flex; align-items: center; gap: 12px;
    color: rgba(255,255,255,0.25); font-size: 12px;
  }
  .sv-reg-divider::before, .sv-reg-divider::after {
    content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1);
  }

  @media (max-width: 960px) {
    .sv-reg-split { flex-direction: column !important; }
    .sv-reg-left { width: 100% !important; min-height: 400px !important; }
    .sv-reg-right { width: 100% !important; }
    .sv-reg-left-h { font-size: 34px !important; }
    .sv-reg-two-col { grid-template-columns: 1fr !important; }
  }
  @media (max-width: 520px) {
    .sv-reg-left { min-height: 300px !important; padding: 36px 24px !important; }
    .sv-reg-card { padding: 28px 20px !important; }
    .sv-reg-social-row { flex-direction: column !important; }
    .sv-reg-social-row .sv-reg-btn-social { width: 100% !important; }
  }
`;

export default function Register() {
  const navigate = useNavigate();

  // ── ALL ORIGINAL STATES — UNCHANGED ──────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    phone_number: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [backendError, setBackendError] = useState("");
  const [success, setSuccess] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    country: false,
    password: false,
    confirmPassword: false,
  });

  // ── ALL ORIGINAL HANDLERS — UNCHANGED ────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setBackendError("");
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const passwordChecks = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const getPasswordStrength = () => {
    const passedCount = Object.values(passwordChecks).filter(Boolean).length;
    if (formData.password.length === 0) return { label: "", color: "", text: "", width: "0%" };
    if (passedCount <= 2) return { label: "Weak",   color: "#ef4444", text: "#ef4444", width: "33%" };
    if (passedCount === 3) return { label: "Medium", color: "#f59e0b", text: "#f59e0b", width: "66%" };
    return { label: "Strong", color: "#22c55e", text: "#22c55e", width: "100%" };
  };

  const strength = getPasswordStrength();
  const allPasswordChecksPass = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const errors = {
    name: touched.name && formData.name.trim() === "" ? "Full Name is required." : "",
    email:
      touched.email && formData.email !== "" && !isEmailValid(formData.email)
        ? "Email format is invalid."
        : touched.email && formData.email === ""
        ? "Email is required."
        : "",
    country: touched.country && formData.country === "" ? "Please select your country." : "",
    password:
      touched.password && formData.password !== "" && !allPasswordChecksPass
        ? "Password does not meet requirements."
        : touched.password && formData.password === ""
        ? "Password is required."
        : "",
    confirmPassword:
      touched.confirmPassword && formData.confirmPassword !== "" && !passwordsMatch
        ? "Passwords do not match."
        : "",
  };

  // ── ORIGINAL SUBMIT HANDLER — UNCHANGED ──────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ name: true, email: true, country: true, password: true, confirmPassword: true });

    if (
      formData.name.trim() === "" ||
      formData.email.trim() === "" ||
      !isEmailValid(formData.email) ||
      formData.country === "" ||
      !allPasswordChecksPass ||
      !passwordsMatch ||
      !agreed
    ) {
      return;
    }

    setLoading(true);
    setBackendError("");

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        phone_number: formData.phone_number || undefined,
        address: formData.address || undefined,
        password: formData.password,
      };

      await register(payload);
      setSuccess(true);

      // Success redirect — ORIGINAL
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      let errorMsg = "Registration failed. Please check your inputs.";
      if (err.response && err.response.data) {
        const detail =
          err.response.data.detail || err.response.data.message || err.response.data.error;
        if (typeof detail === "string") {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
        } else {
          errorMsg = JSON.stringify(err.response.data);
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setBackendError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ORIGINAL duplicate email detection
  const isDuplicateEmailError =
    backendError.toLowerCase().includes("email") &&
    (backendError.toLowerCase().includes("exist") ||
      backendError.toLowerCase().includes("regist") ||
      backendError.toLowerCase().includes("taken"));

  // ── Input shared style factory ─────────────────────────────────────────────
  const inputStyle = (hasError = false) => ({
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
    borderRadius: "12px",
    padding: "13px 16px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "inherit",
  });

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    color: "rgba(255,255,255,0.45)",
    letterSpacing: "1.2px",
    textTransform: "uppercase",
    marginBottom: "8px",
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div className="sv-reg-root" style={{ minHeight: "100vh", background: "#060816", color: "#fff", overflow: "hidden" }}>
      <style>{CSS}</style>

      <div className="sv-reg-split" style={{ display: "flex", minHeight: "100vh" }}>

        {/* ═══════════════════════════════════════════════════════
            LEFT PANEL — Marketing showcase
        ════════════════════════════════════════════════════════ */}
        <div
          className="sv-reg-left sv-reg-left-enter"
          style={{
            width: "42%",
            position: "relative",
            background: "linear-gradient(160deg, #0d0b22 0%, #100826 40%, #0a0618 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 44px",
            overflow: "hidden",
            minHeight: "100vh",
          }}
        >
          <div className="sv-reg-grid-bg" />
          <div className="sv-reg-orb-1" />
          <div className="sv-reg-orb-2" />

          {/* Logo */}
          <Link
            to="/"
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              textDecoration: "none", marginBottom: "48px", position: "relative", zIndex: 2,
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

          {/* Heading */}
          <div style={{ position: "relative", zIndex: 2, maxWidth: "380px" }}>
            <h1
              className="sv-reg-left-h"
              style={{ fontSize: "clamp(32px, 3vw, 48px)", fontWeight: 900, lineHeight: 1.1, marginBottom: "16px", letterSpacing: "-1.5px" }}
            >
              Create Your{" "}
              <span style={{
                background: "linear-gradient(135deg, #c084fc, #8b5cf6, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Account
              </span>
            </h1>

            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.52)", lineHeight: 1.7, marginBottom: "36px" }}>
              Start your 7-Day Free Trial and explore unlimited entertainment.
            </p>

            {/* Benefits list */}
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {BENEFITS.map((b) => (
                <li key={b.label} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{
                    width: "34px", height: "34px", borderRadius: "10px",
                    background: "rgba(139,92,246,0.14)", border: "1px solid rgba(139,92,246,0.28)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", flexShrink: 0,
                  }}>
                    {b.icon}
                  </div>
                  <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>{b.label}</span>
                </li>
              ))}
            </ul>

            {/* Trending mini cards */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "48px", flexWrap: "wrap" }}>
              {["Anime", "Hollywood", "K-Drama", "Sports"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "5px 14px", borderRadius: "100px",
                    background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)",
                    color: "rgba(167,139,250,0.85)", fontSize: "12px", fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>
              © {new Date().getFullYear()} StreamVerse. All rights reserved.
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            RIGHT PANEL — Register form
        ════════════════════════════════════════════════════════ */}
        <div
          className="sv-reg-right"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 24px",
            position: "relative",
            background: "#060816",
            overflowY: "auto",
          }}
        >
          <div className="sv-reg-orb-right" />

          {/* Glass card */}
          <div
            className="sv-reg-card-enter sv-reg-card"
            style={{
              width: "100%",
              maxWidth: "520px",
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
                <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>Account Created!</h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>Redirecting to Sign In…</p>
              </div>
            ) : (
              <>
                {/* Card heading */}
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "5px", letterSpacing: "-0.5px" }}>
                    Create Your Account
                  </h2>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
                    Start your 7-Day Free Trial today.
                  </p>
                </div>

                {/* Backend error — ORIGINAL isDuplicateEmailError logic */}
                {backendError && (
                  <div style={{
                    marginBottom: "20px", padding: "14px 16px", borderRadius: "12px",
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
                  }}>
                    {isDuplicateEmailError ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                        <span style={{ fontSize: "13px", color: "#f87171", fontWeight: 500 }}>This email is already registered.</span>
                        <Link
                          to="/login"
                          style={{
                            padding: "6px 14px", borderRadius: "8px",
                            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                            color: "#fff", fontSize: "12px", fontWeight: 700,
                            textDecoration: "none", whiteSpace: "nowrap",
                          }}
                        >
                          Sign In
                        </Link>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span style={{ fontSize: "13px", color: "#f87171" }}>{backendError}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Form — ALL LOGIC AND FIELDS UNCHANGED ── */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <fieldset disabled={loading} style={{ border: "none", padding: 0, margin: 0, display: "contents" }}>

                    {/* Full Name */}
                    <div>
                      <label htmlFor="name" style={labelStyle}>Full Name</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        autoFocus
                        autoComplete="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`sv-reg-input${errors.name ? " sv-reg-input-error" : ""}`}
                        style={inputStyle(!!errors.name)}
                      />
                      {errors.name && <p style={{ fontSize: "11px", color: "#f87171", marginTop: "5px" }}>{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" style={labelStyle}>Email Address</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        className={`sv-reg-input${errors.email ? " sv-reg-input-error" : ""}`}
                        style={inputStyle(!!errors.email)}
                      />
                      {errors.email && <p style={{ fontSize: "11px", color: "#f87171", marginTop: "5px" }}>{errors.email}</p>}
                    </div>

                    {/* Country + Phone row */}
                    <div
                      className="sv-reg-two-col"
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
                    >
                      {/* Country */}
                      <div>
                        <label htmlFor="country" style={labelStyle}>Country</label>
                        <select
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          required
                          className={`sv-reg-input${errors.country ? " sv-reg-input-error" : ""}`}
                          style={{
                            ...inputStyle(!!errors.country),
                            appearance: "none",
                            WebkitAppearance: "none",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 14px center",
                            paddingRight: "36px",
                          }}
                        >
                          <option value="" disabled style={{ background: "#0d0b22", color: "rgba(255,255,255,0.35)" }}>Select country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c} style={{ background: "#0d0b22", color: "#fff" }}>{c}</option>
                          ))}
                        </select>
                        {errors.country && <p style={{ fontSize: "11px", color: "#f87171", marginTop: "5px" }}>{errors.country}</p>}
                      </div>

                      {/* Phone (optional) */}
                      <div>
                        <label htmlFor="phone_number" style={labelStyle}>Phone (Optional)</label>
                        <input
                          id="phone_number"
                          name="phone_number"
                          type="tel"
                          placeholder="+1 555 1234"
                          autoComplete="tel"
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="sv-reg-input"
                          style={inputStyle()}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label htmlFor="address" style={labelStyle}>Address (Optional)</label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        placeholder="123 Entertainment Ave"
                        autoComplete="street-address"
                        value={formData.address}
                        onChange={handleChange}
                        className="sv-reg-input"
                        style={inputStyle()}
                      />
                    </div>

                    {/* Password + Confirm Password row */}
                    <div
                      className="sv-reg-two-col"
                      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}
                    >
                      {/* Password */}
                      <div>
                        <label htmlFor="password" style={labelStyle}>Password</label>
                        <div style={{ position: "relative" }}>
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={`sv-reg-input${errors.password ? " sv-reg-input-error" : ""}`}
                            style={{ ...inputStyle(!!errors.password), paddingRight: "44px" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                              background: "none", border: "none", cursor: "pointer",
                              color: "rgba(255,255,255,0.35)", padding: 0,
                              display: "flex", alignItems: "center", transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                          >
                            {showPassword ? <EyeOff /> : <EyeOpen />}
                          </button>
                        </div>
                        {errors.password && <p style={{ fontSize: "11px", color: "#f87171", marginTop: "5px" }}>{errors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
                        <div style={{ position: "relative" }}>
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            required
                            className={`sv-reg-input${errors.confirmPassword ? " sv-reg-input-error" : ""}`}
                            style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: "44px" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{
                              position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                              background: "none", border: "none", cursor: "pointer",
                              color: "rgba(255,255,255,0.35)", padding: 0,
                              display: "flex", alignItems: "center", transition: "color 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "#a78bfa")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                          >
                            {showConfirmPassword ? <EyeOff /> : <EyeOpen />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p style={{ fontSize: "11px", color: "#f87171", marginTop: "5px" }}>{errors.confirmPassword}</p>}
                      </div>
                    </div>

                    {/* Password strength indicator — ORIGINAL passwordChecks logic */}
                    {formData.password.length > 0 && (
                      <div style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        borderRadius: "12px",
                        padding: "14px 16px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
                            Password Strength
                          </span>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: strength.text }}>
                            {strength.label}
                          </span>
                        </div>
                        {/* Strength bar */}
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden", marginBottom: "12px" }}>
                          <div style={{
                            height: "100%",
                            width: strength.width,
                            background: strength.color,
                            borderRadius: "4px",
                            transition: "width 0.35s ease, background 0.35s ease",
                          }} />
                        </div>
                        {/* Requirement checklist */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
                          {[
                            { key: "minLength",    label: "Min 8 Characters" },
                            { key: "hasUppercase", label: "One Uppercase Letter" },
                            { key: "hasNumber",    label: "One Number" },
                            { key: "hasSpecialChar", label: "One Special Character" },
                          ].map((check) => {
                            const pass = passwordChecks[check.key];
                            return (
                              <div key={check.key} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                {pass ? (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                )}
                                <span style={{ fontSize: "11px", color: pass ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.3)" }}>
                                  {check.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Terms checkbox — ORIGINAL agreed state */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <input
                        id="agreed"
                        name="agreed"
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        required
                        style={{
                          width: "17px", height: "17px", accentColor: "#8b5cf6",
                          cursor: "pointer", marginTop: "2px", flexShrink: 0,
                        }}
                      />
                      <label htmlFor="agreed" style={{ fontSize: "13px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55, cursor: "pointer" }}>
                        I agree to the{" "}
                        <a href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Terms of Service</a>
                        {" "}and{" "}
                        <a href="#" style={{ color: "#a78bfa", textDecoration: "none" }}>Privacy Policy</a>
                      </label>
                    </div>

                    {/* Submit — ORIGINAL disabled/loading logic */}
                    <button
                      type="submit"
                      disabled={loading || !agreed}
                      className="sv-reg-btn-primary"
                      style={{
                        width: "100%", padding: "14px",
                        borderRadius: "12px", border: "none",
                        color: "#fff", fontSize: "15px", fontWeight: 700,
                        cursor: loading || !agreed ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                        fontFamily: "inherit",
                        marginTop: "4px",
                      }}
                    >
                      {loading ? (
                        <>
                          <svg style={{ animation: "svRegSpin 1s linear infinite", width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                          </svg>
                          Creating Account…
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          Create Account
                        </>
                      )}
                    </button>
                  </fieldset>
                </form>

                {/* Social divider */}
                <div className="sv-reg-divider" style={{ margin: "22px 0" }}>or sign up with</div>

                {/* Social buttons */}
                <div className="sv-reg-social-row" style={{ display: "flex", gap: "10px" }}>
                  {[
                    {
                      label: "Google",
                      icon: (
                        <svg width="17" height="17" viewBox="0 0 24 24">
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
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                      ),
                    },
                    {
                      label: "Facebook",
                      icon: (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      ),
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      className="sv-reg-btn-social"
                      style={{
                        flex: 1, padding: "11px 8px",
                        borderRadius: "12px", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                        color: "rgba(255,255,255,0.65)", fontSize: "13px", fontWeight: 600,
                        fontFamily: "inherit",
                      }}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* Bottom nav — ORIGINAL Link to /login */}
                <div style={{
                  marginTop: "22px", paddingTop: "18px",
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  textAlign: "center", fontSize: "13px",
                }}>
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>Already have an account? </span>
                  <Link to="/login" style={{ color: "#a78bfa", fontWeight: 600, textDecoration: "none" }}>Sign In</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes svRegSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}