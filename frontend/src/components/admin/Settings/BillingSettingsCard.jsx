// src/components/admin/Settings/BillingSettingsCard.jsx
import { motion } from "framer-motion";
import { Receipt, Percent, Clock, CreditCard } from "lucide-react";

export default function BillingSettingsCard({ formData, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5"
    >
      <div className="border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Receipt size={14} className="text-[#8B5CF6]" />
          <h4 className="text-sm font-bold text-white">Billing & Invoices Config</h4>
        </div>
        <p className="text-[11px] text-zinc-500">Configure invoicing rules, defaults, and VAT tax rates.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Default Trial Days */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
            <Clock size={11} /> Default Trial Days
          </label>
          <div className="relative">
            <Clock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="number"
              name="defaultTrialDays"
              min="0"
              required
              value={formData.defaultTrialDays ?? ""}
              onChange={onChange}
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-950/60 border border-white/8 rounded-xl text-sm text-white outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>
          <p className="text-[10px] text-zinc-600">Days given to new users on trial period.</p>
        </div>

        {/* Invoice Tax */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
            <Percent size={11} /> Invoice VAT / Tax (%)
          </label>
          <div className="relative">
            <Percent size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="number"
              name="invoiceTaxPercentage"
              min="0" max="100"
              required
              value={formData.invoiceTaxPercentage ?? ""}
              onChange={onChange}
              className="w-full pl-9 pr-3 py-2.5 bg-zinc-950/60 border border-white/8 rounded-xl text-sm text-white outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>
          <p className="text-[10px] text-zinc-600">Applied to all invoices during generation.</p>
        </div>
      </div>

      {/* Info strip */}
      <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 rounded-xl p-3 flex items-start gap-3">
        <Receipt size={14} className="text-[#8B5CF6] shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Invoice tax and trial period settings affect all new subscriptions and billing cycles. Changes apply to new invoices only.
        </p>
      </div>
    </motion.div>
  );
}
