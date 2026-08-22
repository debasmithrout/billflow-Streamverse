// src/components/admin/Settings/RegistrationSettingsCard.jsx
import { motion } from "framer-motion";
import { UserPlus, Wrench } from "lucide-react";

function Toggle({ enabled, onToggle, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`w-11 h-6 rounded-full p-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/40 cursor-pointer shrink-0 ${
        enabled ? "bg-[#8B5CF6]" : "bg-zinc-800 border border-white/5"
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  );
}

const TOGGLES = [
  {
    key: "allowRegistrations",
    label: "Allow New Registrations",
    desc: "If enabled, new users can create customer accounts and start free trials.",
    icon: UserPlus,
    color: "#10B981"
  },
  {
    key: "maintenanceMode",
    label: "System Maintenance Mode",
    desc: "If active, the public landing page and client portal are blocked with a maintenance banner.",
    icon: Wrench,
    color: "#F59E0B"
  }
];

export default function RegistrationSettingsCard({ formData, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5"
    >
      <div className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <UserPlus size={14} className="text-[#8B5CF6]" />
          <h4 className="text-sm font-bold text-white">Registration & Access Rules</h4>
        </div>
        <p className="text-[11px] text-zinc-500">Manage registration accessibility and system availability.</p>
      </div>

      <div className="space-y-1 divide-y divide-white/5">
        {TOGGLES.map((item) => {
          const Icon = item.icon;
          const isOn = !!formData[item.key];
          return (
            <div key={item.key} className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                  isOn ? "border" : "bg-zinc-800/60 border border-white/5"
                }`} style={isOn ? { background: `${item.color}18`, borderColor: `${item.color}35` } : {}}>
                  <Icon size={14} style={{ color: isOn ? item.color : "#475569" }} />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-white block">{item.label}</span>
                  <span className="text-[11px] text-zinc-500 leading-relaxed block mt-0.5">{item.desc}</span>
                </div>
              </div>
              <Toggle enabled={isOn} onToggle={() => onToggle(item.key)} id={`toggle-${item.key}`} />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
