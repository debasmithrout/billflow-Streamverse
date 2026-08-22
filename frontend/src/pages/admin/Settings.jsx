// src/pages/admin/Settings.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getSettings, updateSettings, resetDefaultSettings
} from "../../services/adminService";
import PlatformSettingsCard   from "../../components/admin/Settings/PlatformSettingsCard";
import RegistrationSettingsCard from "../../components/admin/Settings/RegistrationSettingsCard";
import BillingSettingsCard    from "../../components/admin/Settings/BillingSettingsCard";
import TaxRulesCard           from "../../components/admin/Settings/TaxRulesCard";
import ExchangeRatesCard      from "../../components/admin/Settings/ExchangeRatesCard";
import SaveSettingsDialog     from "../../components/admin/Settings/SaveSettingsDialog";
import ImportSettingsDialog   from "../../components/admin/Settings/ImportSettingsDialog";
import ResetSettingsDialog    from "../../components/admin/Settings/ResetSettingsDialog";
import { AdminStatsSkeleton } from "../../components/admin/Shared/SkeletonLoader";
import useToast from "../../hooks/useToast";
import {
  Settings2, Globe, UserPlus, Receipt, Shield, Cpu,
  Mail, Plug, Save, RotateCcw, Download, Upload,
  CheckCircle2, XCircle, Zap, Database, Lock, Activity,
  Percent, Coins
} from "lucide-react";

// ── Left Nav ─────────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { key: "general",        label: "General Settings",      icon: Globe,     desc: "Basic platform configuration"  },
  { key: "access",         label: "Access & Registration",  icon: UserPlus,  desc: "Manage registrations & maintenance" },
  { key: "billing",        label: "Billing & Invoices",     icon: Receipt,   desc: "Configure billing and tax rules" },
  { key: "tax_rules",      label: "Tax Rules",              icon: Percent,   desc: "Manage platform tax rules & regions" },
  { key: "exchange_rates", label: "Exchange Rates",         icon: Coins,     desc: "Manage exchange rates & sync overrides" },
  { key: "security",       label: "System & Security",      icon: Shield,    desc: "Security, backups & system"     },
  { key: "integrations",   label: "Integrations",           icon: Plug,      desc: "Third-party services"           }
];

function SettingsNav({ active, onChange }) {
  return (
    <nav className="space-y-1">
      {NAV_SECTIONS.map(s => {
        const Icon = s.icon;
        const isActive = active === s.key;
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onChange(s.key)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left cursor-pointer focus:outline-none transition-all adm-settings-nav-btn ${
              isActive
                ? "bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 text-[#8B5CF6] active"
                : "hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors adm-settings-nav-icon-wrapper ${
              isActive ? "bg-[#8B5CF6]/20" : "bg-zinc-800/60"
            }`}>
              <Icon size={15} className={`adm-settings-nav-icon ${isActive ? "text-[#8B5CF6]" : "text-zinc-500"}`} />
            </div>
            <div className="min-w-0 text-left">
              <span className={`text-xs font-bold block leading-tight ${isActive ? "text-[#8B5CF6]" : "text-zinc-200"}`}>
                {s.label}
              </span>
              <span className="text-[10px] text-zinc-500 block leading-tight mt-0.5 truncate">{s.desc}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

// ── Security Section ──────────────────────────────────────────────────────────
function SecuritySection() {
  const items = [
    { label: "JWT Authentication", value: "Active",     icon: Lock,        ok: true  },
    { label: "Password Policy",    value: "Strong",      icon: Shield,      ok: true  },
    { label: "Session Timeout",    value: "30 minutes",  icon: Activity,    ok: true  },
    { label: "Admin Access",       value: "Role-based",  icon: UserPlus,    ok: true  },
    { label: "API Security",       value: "Bearer Token",icon: Lock,        ok: true  },
    { label: "Rate Limiting",      value: "Enabled",     icon: Shield,      ok: true  }
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5"
    >
      <div className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className="text-[#8B5CF6]" />
          <h4 className="text-sm font-bold text-white">System & Security</h4>
        </div>
        <p className="text-[11px] text-zinc-500">Read-only overview of security configuration. Contact your DevOps team to modify.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center">
                  <Icon size={12} className="text-[#8B5CF6]" />
                </div>
                <span className="text-xs text-zinc-300 font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.ok ? <CheckCircle2 size={11} className="text-emerald-400" /> : <XCircle size={11} className="text-red-400" />}
                <span className={`text-[10px] font-bold ${item.ok ? "text-emerald-400" : "text-red-400"}`}>{item.value}</span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Integrations Section ──────────────────────────────────────────────────────
function IntegrationsSection() {
  const integrations = [
    { name: "SMTP",            desc: "Email delivery service",        icon: Mail,       status: "Connected",    ok: true  },
    { name: "Database",        desc: "SQLite / PostgreSQL",           icon: Database,   status: "Connected",    ok: true  },
    { name: "Payment Gateway", desc: "Mock / Razorpay / Stripe",     icon: Zap,        status: "Active",       ok: true  },
    { name: "Celery Workers",  desc: "Async task queue",             icon: Cpu,        status: "Running",      ok: true  },
    { name: "Redis",           desc: "Cache & message broker",       icon: Activity,   status: "Not Configured", ok: false },
    { name: "Webhooks",        desc: "Outbound event notifications", icon: Plug,       status: "Not Configured", ok: false }
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5"
    >
      <div className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Plug size={14} className="text-[#8B5CF6]" />
          <h4 className="text-sm font-bold text-white">Integrations</h4>
        </div>
        <p className="text-[11px] text-zinc-500">Third-party service connection status.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {integrations.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className={`flex items-center justify-between p-3.5 border rounded-xl transition-colors ${
              item.ok
                ? "bg-emerald-500/5 border-emerald-500/15"
                : "bg-zinc-900/40 border-white/5"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  item.ok ? "bg-emerald-500/10 border-emerald-500/20" : "bg-zinc-800/60 border-white/5"
                }`}>
                  <Icon size={14} className={item.ok ? "text-emerald-400" : "text-zinc-500"} />
                </div>
                <div>
                  <span className="text-xs text-white font-bold block">{item.name}</span>
                  <span className="text-[10px] text-zinc-500 block">{item.desc}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                item.ok
                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-zinc-500 bg-zinc-800/40 border-zinc-700/30"
              }`}>
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Settings() {
  const { showToast } = useToast();
  const [formData,    setFormData]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [activeSection, setActiveSection] = useState("general");
  const [isSaveOpen,  setIsSaveOpen]  = useState(false);
  const [isImportOpen,setIsImportOpen]= useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getSettings();
        setFormData(data);
      } catch (err) {
        console.error("Error loading platform settings configurations:", err);
        showToast("Failed to load settings.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === "defaultTrialDays" || name === "invoiceTaxPercentage")
        ? parseInt(value || 0, 10) : value
    }));
  };

  const handleToggleChange = (fieldName) => {
    setFormData(prev => ({ ...prev, [fieldName]: !prev[fieldName] }));
  };

  const handleSaveConfirm = async () => {
    try {
      await updateSettings(formData);
      setIsSaveOpen(false);
      showToast("Settings saved successfully.", "success");
    } catch {
      showToast("Error saving settings.", "error");
    }
  };

  const handleResetConfirm = async () => {
    try {
      const defaults = await resetDefaultSettings();
      setFormData(defaults);
      setIsResetOpen(false);
      showToast("Settings reset to defaults.", "success");
    } catch {
      showToast("Error resetting settings.", "error");
    }
  };

  const handleExportSettings = () => {
    if (!formData) return;
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "billflow_settings_backup.json";
    link.click();
    showToast("Settings backup exported.", "success");
  };

  const handleImportConfirm = async (parsed) => {
    try {
      await updateSettings(parsed);
      setFormData(parsed);
      setIsImportOpen(false);
      showToast("Settings imported successfully.", "success");
    } catch {
      showToast("Error importing settings.", "error");
    }
  };

  return (
    <div className="space-y-7 adm-fadein max-w-7xl mx-auto w-full">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#475569]">BillFlow Admin</span>
            <span className="text-[#1E293B]">›</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B5CF6]">Settings</span>
          </div>
          <h2 className="adm-page-title flex items-center gap-2">
            <Settings2 size={22} className="text-[#8B5CF6]" />
            Settings
          </h2>
          <p className="adm-page-sub">Configure your platform preferences, billing options, security settings and system integrations.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center flex-wrap">
          <button
            type="button"
            onClick={handleExportSettings}
            disabled={loading || !formData}
            className="adm-btn adm-btn-ghost cursor-pointer flex items-center gap-1.5 disabled:opacity-40 text-xs"
            style={{ padding: "7px 14px" }}
          >
            <Download size={13} /> Export Backup
          </button>
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            disabled={loading || !formData}
            className="adm-btn adm-btn-ghost cursor-pointer flex items-center gap-1.5 disabled:opacity-40 text-xs"
            style={{ padding: "7px 14px" }}
          >
            <Upload size={13} /> Import Backup
          </button>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ── */}
      {loading || !formData ? (
        <AdminStatsSkeleton />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-3 shadow-xl sticky top-6">
              <p className="text-[9px] uppercase font-black tracking-widest text-[#334155] px-2 pb-2">Settings Navigation</p>
              <SettingsNav active={activeSection} onChange={setActiveSection} />
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 space-y-5 min-w-0">
            <AnimatePresence mode="wait">
              {activeSection === "general" && (
                <motion.div key="general" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <PlatformSettingsCard formData={formData} onChange={handleInputChange} />
                </motion.div>
              )}
              {activeSection === "access" && (
                <motion.div key="access" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <RegistrationSettingsCard formData={formData} onToggle={handleToggleChange} />
                </motion.div>
              )}
              {activeSection === "billing" && (
                <motion.div key="billing" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <BillingSettingsCard formData={formData} onChange={handleInputChange} />
                </motion.div>
              )}
              {activeSection === "tax_rules" && (
                <motion.div key="tax_rules" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <TaxRulesCard />
                </motion.div>
              )}
              {activeSection === "exchange_rates" && (
                <motion.div key="exchange_rates" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <ExchangeRatesCard />
                </motion.div>
              )}
              {activeSection === "security" && (
                <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <SecuritySection />
                </motion.div>
              )}
              {activeSection === "integrations" && (
                <motion.div key="integrations" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <IntegrationsSection />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Footer — show only for editable sections */}
            {["general", "access", "billing"].includes(activeSection) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setIsResetOpen(true)}
                  className="flex items-center gap-2 py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-red-400 hover:text-red-300 rounded-xl cursor-pointer focus:outline-none transition-colors w-full sm:w-auto"
                >
                  <RotateCcw size={13} /> Reset to Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setIsSaveOpen(true)}
                  className="adm-btn adm-btn-purple cursor-pointer flex items-center gap-2 w-full sm:w-auto text-xs justify-center"
                  style={{ padding: "10px 24px", border: "none" }}
                >
                  <Save size={13} /> Save Platform Configuration
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}

      {/* Dialogs (preserve existing functionality) */}
      <SaveSettingsDialog   isOpen={isSaveOpen}   onConfirm={handleSaveConfirm}   onCancel={() => setIsSaveOpen(false)}   />
      <ImportSettingsDialog isOpen={isImportOpen}  onConfirm={handleImportConfirm} onCancel={() => setIsImportOpen(false)} />
      <ResetSettingsDialog  isOpen={isResetOpen}   onConfirm={handleResetConfirm}  onCancel={() => setIsResetOpen(false)}  />
    </div>
  );
}
