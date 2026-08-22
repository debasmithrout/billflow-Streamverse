// src/pages/customer/Settings.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TABS = ["General", "Playback", "Notifications", "Downloads", "Privacy", "Account"];

// ─── Toggle component ─────────────────────────────────────────
function Toggle({ id, checked, onChange }) {
  return (
    <label className="sv-toggle" htmlFor={id}>
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="sv-toggle-slider" />
    </label>
  );
}

// ─── Settings Row ──────────────────────────────────────────────
function SettingRow({ title, description, children, danger = false }) {
  return (
    <div className="sv-settings-row">
      <div className="flex-1 min-w-0 pr-4">
        <p className={`text-sm font-semibold ${danger ? "text-red-400" : "text-white"}`}>{title}</p>
        {description && <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

// ─── Section Title ─────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25 mb-3 px-1">{children}</p>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────
const GeneralTab = () => {
  const [darkMode, setDarkMode]   = useState(true);
  const [language, setLanguage]   = useState("English");
  const [subLang, setSubLang]     = useState("English");
  const [kids, setKids]           = useState(false);
  const [mature, setMature]       = useState(true);
  const [restricted, setRestricted] = useState(false);

  const selectStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "8px 12px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    minWidth: "160px",
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Appearance</SectionTitle>
        <div className="sv-settings-panel">
          <SettingRow title="Theme" description="Choose between Dark, Dim, or System default">
            <div className="flex gap-1.5">
              {["Dark", "Dim", "System"].map((t) => (
                <button
                  key={t}
                  onClick={() => setDarkMode(t === "Dark")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer focus:outline-none ${
                    (t === "Dark" && darkMode) || (t === "Dim" && !darkMode)
                      ? "bg-purple-600 text-white"
                      : "bg-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow title="Language" description="App display language">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
              {["English", "Hindi", "Tamil", "Telugu", "Malayalam", "Kannada"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </SettingRow>
        </div>
      </div>

      <div>
        <SectionTitle>Content Language</SectionTitle>
        <div className="sv-settings-panel">
          <SettingRow title="Subtitle Language" description="Default subtitle language for all content">
            <select value={subLang} onChange={(e) => setSubLang(e.target.value)} style={selectStyle}>
              {["English", "Hindi", "None", "Auto"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </SettingRow>
          <SettingRow title="Kids Mode" description="Filter content with age-appropriate rating">
            <Toggle id="kids-mode" checked={kids} onChange={(e) => setKids(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Show Mature Content" description="Show content rated 18+ in results">
            <Toggle id="mature" checked={mature} onChange={(e) => setMature(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Restricted Profiles" description="Create and manage restricted profiles">
            <Toggle id="restricted" checked={restricted} onChange={(e) => setRestricted(e.target.checked)} />
          </SettingRow>
        </div>
      </div>
    </div>
  );
};

const PlaybackTab = () => {
  const [autoplay, setAutoplay]     = useState(true);
  const [dataSaver, setDataSaver]   = useState(false);
  const [quality, setQuality]       = useState("Auto");
  const [resolution, setResolution] = useState("1080p Full HD");
  const [hdr, setHdr]               = useState(true);
  const [dolby, setDolby]           = useState(true);
  const [soundQuality, setSound]    = useState("High");

  const selectStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "8px 12px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    minWidth: "160px",
  };

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Streaming</SectionTitle>
        <div className="sv-settings-panel">
          <SettingRow title="Autoplay Next Episode" description="Play next content automatically">
            <Toggle id="autoplay" checked={autoplay} onChange={(e) => setAutoplay(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Data Saver" description="Reduces video quality to save data">
            <Toggle id="datasaver" checked={dataSaver} onChange={(e) => setDataSaver(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Video Quality" description="Streaming quality preference">
            <select value={quality} onChange={(e) => setQuality(e.target.value)} style={selectStyle}>
              {["Auto", "High", "Medium", "Low"].map((q) => <option key={q}>{q}</option>)}
            </select>
          </SettingRow>
          <SettingRow title="Default Resolution" description="Override auto quality selection">
            <select value={resolution} onChange={(e) => setResolution(e.target.value)} style={selectStyle}>
              {["4K Ultra HD", "1080p Full HD", "720p HD", "480p"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </SettingRow>
        </div>
      </div>
      <div>
        <SectionTitle>Audio & Display</SectionTitle>
        <div className="sv-settings-panel">
          <SettingRow title="High Dynamic Range (HDR)" description="Contrast and brightness enhancement">
            <Toggle id="hdr" checked={hdr} onChange={(e) => setHdr(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Dolby Audio" description="Immersive audio experience">
            <Toggle id="dolby" checked={dolby} onChange={(e) => setDolby(e.target.checked)} />
          </SettingRow>
          <SettingRow title="Sound Quality" description="Audio quality setting">
            <select value={soundQuality} onChange={(e) => setSound(e.target.value)} style={selectStyle}>
              {["Ultra", "High", "Medium", "Low"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </SettingRow>
        </div>
      </div>
    </div>
  );
};

const NotificationsTab = () => {
  const [settings, setSettings] = useState({
    newContent:     true,
    recommendations:true,
    episodes:       true,
    renewal:        true,
    offers:         false,
    newsletter:     false,
    push:           true,
    email:          true,
  });

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  const rows = [
    { key: "newContent",      title: "New Content Alerts",     desc: "Get notified when new shows and movies are added" },
    { key: "recommendations", title: "Personalized Picks",     desc: "Recommendations based on your watch history" },
    { key: "episodes",        title: "Episode Releases",       desc: "Alerts for new episodes of shows you follow" },
    { key: "renewal",         title: "Billing & Renewal",      desc: "Payment receipts and subscription renewal reminders" },
    { key: "offers",          title: "Special Offers",         desc: "Exclusive deals and promotional content" },
    { key: "newsletter",      title: "Newsletter",             desc: "Monthly digest and streaming highlights" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Notification Channels</SectionTitle>
        <div className="sv-settings-panel mb-4">
          <SettingRow title="Push Notifications" description="In-app and browser notifications">
            <Toggle id="push" checked={settings.push} onChange={() => toggle("push")} />
          </SettingRow>
          <SettingRow title="Email Notifications" description="Receive updates via email">
            <Toggle id="email" checked={settings.email} onChange={() => toggle("email")} />
          </SettingRow>
        </div>
      </div>
      <div>
        <SectionTitle>Notification Types</SectionTitle>
        <div className="sv-settings-panel">
          {rows.map((row) => (
            <SettingRow key={row.key} title={row.title} description={row.desc}>
              <Toggle id={row.key} checked={settings[row.key]} onChange={() => toggle(row.key)} />
            </SettingRow>
          ))}
        </div>
      </div>
    </div>
  );
};

const DownloadsTab = () => {
  const [wifiOnly, setWifiOnly]     = useState(true);
  const [quality, setQuality]       = useState("High");
  const [autoDelete, setAutoDelete] = useState(false);
  const [location, setLocation]     = useState("Device Storage");

  const selectStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "8px 12px",
    color: "rgba(255,255,255,0.8)",
    fontSize: "12px",
    outline: "none",
    cursor: "pointer",
    minWidth: "160px",
  };

  return (
    <div>
      <SectionTitle>Download Settings</SectionTitle>
      <div className="sv-settings-panel">
        <SettingRow title="Wi-Fi Only Downloads" description="Only download content when connected to Wi-Fi">
          <Toggle id="wifi-only" checked={wifiOnly} onChange={(e) => setWifiOnly(e.target.checked)} />
        </SettingRow>
        <SettingRow title="Download Quality" description="Quality of downloaded content">
          <select value={quality} onChange={(e) => setQuality(e.target.value)} style={selectStyle}>
            {["Standard", "High", "Ultra HD"].map((q) => <option key={q}>{q}</option>)}
          </select>
        </SettingRow>
        <SettingRow title="Auto-Delete After Watching" description="Remove downloaded content after you watch it">
          <Toggle id="auto-delete" checked={autoDelete} onChange={(e) => setAutoDelete(e.target.checked)} />
        </SettingRow>
        <SettingRow title="Download Location" description="Storage location for downloads">
          <select value={location} onChange={(e) => setLocation(e.target.value)} style={selectStyle}>
            {["Device Storage", "SD Card"].map((l) => <option key={l}>{l}</option>)}
          </select>
        </SettingRow>
      </div>

      {/* Storage indicator */}
      <div className="mt-6 sv-glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-white">Storage Used</p>
          <p className="text-xs text-white/50">3.2 GB of 32 GB</p>
        </div>
        <div className="sv-progress-bar">
          <div className="sv-progress-fill" style={{ width: "10%" }} />
        </div>
        <p className="text-[10px] text-white/30 mt-2">3 downloads · 4.8 GB available</p>
      </div>
    </div>
  );
};

const PrivacyTab = () => {
  const [settings, setSettings] = useState({
    watchHistory:   true,
    searchHistory:  true,
    personalized:   true,
    analytics:      false,
    thirdParty:     false,
  });

  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Data & Privacy</SectionTitle>
        <div className="sv-settings-panel">
          <SettingRow title="Watch History" description="Allow StreamVerse to remember what you've watched">
            <Toggle id="watch-hist" checked={settings.watchHistory} onChange={() => toggle("watchHistory")} />
          </SettingRow>
          <SettingRow title="Search History" description="Remember your recent searches">
            <Toggle id="search-hist" checked={settings.searchHistory} onChange={() => toggle("searchHistory")} />
          </SettingRow>
          <SettingRow title="Personalized Recommendations" description="Use watch data to improve recommendations">
            <Toggle id="personalized" checked={settings.personalized} onChange={() => toggle("personalized")} />
          </SettingRow>
          <SettingRow title="Usage Analytics" description="Share anonymous usage data with StreamVerse">
            <Toggle id="analytics" checked={settings.analytics} onChange={() => toggle("analytics")} />
          </SettingRow>
          <SettingRow title="Third-Party Data Sharing" description="Share data with advertising partners">
            <Toggle id="third-party" checked={settings.thirdParty} onChange={() => toggle("thirdParty")} />
          </SettingRow>
        </div>
      </div>
      <div>
        <SectionTitle>Data Management</SectionTitle>
        <div className="sv-settings-panel">
          <SettingRow title="Clear Watch History" description="Remove all content from your watch history">
            <button className="sv-btn-ghost text-xs py-1.5 px-4 cursor-pointer focus:outline-none">Clear</button>
          </SettingRow>
          <SettingRow title="Clear Search History" description="Remove all recent searches">
            <button className="sv-btn-ghost text-xs py-1.5 px-4 cursor-pointer focus:outline-none">Clear</button>
          </SettingRow>
          <SettingRow title="Download My Data" description="Request a copy of all your StreamVerse data">
            <button className="sv-btn-ghost text-xs py-1.5 px-4 cursor-pointer focus:outline-none">Request</button>
          </SettingRow>
        </div>
      </div>
    </div>
  );
};

const AccountTab = () => {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const userStr = localStorage.getItem("current_user");
  const user    = userStr ? JSON.parse(userStr) : {};

  return (
    <div className="space-y-6">
      <div>
        <SectionTitle>Account Details</SectionTitle>
        <div className="sv-settings-panel">
          <SettingRow title="Email Address" description={user.email || "Not set"}>
            <button className="sv-btn-ghost text-xs py-1.5 px-4 cursor-pointer focus:outline-none">Change</button>
          </SettingRow>
          <SettingRow title="Password" description="Last changed 30 days ago">
            <button className="sv-btn-ghost text-xs py-1.5 px-4 cursor-pointer focus:outline-none">Change</button>
          </SettingRow>
          <SettingRow title="Two-Factor Authentication" description="Add an extra layer of security to your account">
            <button className="sv-btn-ghost text-xs py-1.5 px-4 cursor-pointer focus:outline-none">Enable</button>
          </SettingRow>
        </div>
      </div>
      <div>
        <SectionTitle>Connected Devices</SectionTitle>
        <div className="sv-settings-panel">
          {[
            { device: "Windows PC", location: "Mumbai, IN", current: true, icon: "💻" },
            { device: "iPhone 14",  location: "India · 2 hrs ago",  current: false, icon: "📱" },
          ].map((d, i) => (
            <SettingRow
              key={i}
              title={<span className="flex items-center gap-2">{d.icon} {d.device} {d.current && <span className="sv-badge sv-badge-green">Current</span>}</span>}
              description={d.location}
            >
              {!d.current && (
                <button className="sv-btn-danger text-xs py-1.5 px-4 cursor-pointer focus:outline-none">Sign Out</button>
              )}
            </SettingRow>
          ))}
        </div>
      </div>
      <div>
        <SectionTitle>Danger Zone</SectionTitle>
        <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.12)" }}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold text-red-400">Delete Account</p>
              <p className="text-xs text-white/40 mt-0.5">Permanently delete your account and all associated data. This action cannot be undone.</p>
            </div>
            <button
              onClick={() => setShowConfirm(true)}
              className="sv-btn-danger text-xs py-2 px-5 flex-shrink-0 cursor-pointer focus:outline-none"
            >
              Delete Account
            </button>
          </div>

          {showConfirm && (
            <div className="rounded-2xl p-4 animate-fade-in" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <p className="text-sm font-bold text-white mb-1">Are you absolutely sure?</p>
              <p className="text-xs text-white/50 mb-4">This will permanently delete all your data including watch history, subscription, and payment information.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.removeItem("access_token");
                    localStorage.removeItem("current_user");
                    navigate("/login");
                  }}
                  className="sv-btn-danger text-xs py-2 px-4 cursor-pointer focus:outline-none"
                >
                  Yes, Delete Everything
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="sv-btn-ghost text-xs py-2 px-4 cursor-pointer focus:outline-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TAB_COMPONENTS = {
  General:       GeneralTab,
  Playback:      PlaybackTab,
  Notifications: NotificationsTab,
  Downloads:     DownloadsTab,
  Privacy:       PrivacyTab,
  Account:       AccountTab,
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General");
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* ── Header ─────────────────────────────── */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white tracking-tight">Settings</h2>
        <p className="text-xs text-white/40 mt-0.5">Manage your StreamVerse preferences and account</p>
      </div>

      {/* ── Tab Bar ────────────────────────────── */}
      <div className="flex gap-1 mb-8 overflow-x-auto scrollbar-none p-1 rounded-2xl w-fit"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer focus:outline-none ${
              activeTab === tab
                ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-600/20"
                : "text-white/50 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Active Tab Content ─────────────────── */}
      <div className="animate-fade-in">
        <ActiveComponent />
      </div>
    </div>
  );
}
