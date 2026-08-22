// src/components/admin/Settings/PlatformSettingsCard.jsx
import { motion } from "framer-motion";
import { Globe, Mail, Clock, DollarSign } from "lucide-react";

const TIMEZONES = [
  "UTC-5 (EST)", "UTC-8 (PST)", "UTC+0 (GMT)", "UTC+1 (CET)", "UTC+5:30 (IST)"
];

function SettingsInput({ label, icon: Icon, name, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
        {Icon && <Icon size={11} />}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-white/8 rounded-xl text-sm text-white outline-none focus:border-[#8B5CF6] transition-colors placeholder-zinc-600"
      />
    </div>
  );
}

function SettingsSelect({ label, icon: Icon, name, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
        {Icon && <Icon size={11} />}
        {label}
      </label>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-3.5 py-2.5 bg-zinc-950/60 border border-white/8 rounded-xl text-sm text-zinc-300 outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
      >
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o} className="bg-zinc-950">{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

export default function PlatformSettingsCard({ formData, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5"
    >
      <div className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={14} className="text-[#8B5CF6]" />
          <h4 className="text-sm font-bold text-white">General Settings</h4>
        </div>
        <p className="text-[11px] text-zinc-500">Configure general platform details and localized variables.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <SettingsInput label="Platform Name"  icon={Globe} name="platformName"  value={formData.platformName}  onChange={onChange} placeholder="BillFlow Portal" />
        <SettingsInput label="Support Email"  icon={Mail}  name="supportEmail"  value={formData.supportEmail}  onChange={onChange} type="email" placeholder="support@billflow.com" />
        <SettingsSelect
          label="Default Timezone" icon={Clock}
          name="timezone" value={formData.timezone} onChange={onChange}
          options={TIMEZONES}
        />
        <SettingsSelect
          label="Currency Code" icon={DollarSign}
          name="currency" value={formData.currency} onChange={onChange}
          options={[
            { value: "INR", label: "INR (₹)" },
            { value: "USD", label: "USD ($)" },
            { value: "EUR", label: "EUR (€)" },
            { value: "GBP", label: "GBP (£)" }
          ]}
        />
      </div>
    </motion.div>
  );
}
