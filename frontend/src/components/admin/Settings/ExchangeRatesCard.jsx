// src/components/admin/Settings/ExchangeRatesCard.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, RefreshCw, AlertTriangle, CheckCircle2, 
  Edit2, Loader2, Info, XCircle
} from "lucide-react";
import { getExchangeRates, syncExchangeRates, overrideExchangeRate } from "../../../services/adminService";
import useToast from "../../../hooks/useToast";

const SUPPORTED_CURRENCIES = ["INR", "USD", "GBP", "EUR", "JPY", "CAD", "AUD", "SGD"];

function SettingsInput({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] transition-all placeholder-zinc-700"
      />
    </div>
  );
}

function SettingsSelect({ label, name, value, onChange, options, required = false }) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select
        name={name}
        required={required}
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer"
      >
        {options.map(o => (
          <option key={o} value={o} className="bg-zinc-950">{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function ExchangeRatesCard() {
  const { showToast } = useToast();
  
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog State
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    from_currency: "USD",
    to_currency: "INR",
    rate: ""
  });

  const fetchRates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getExchangeRates();
      setRates(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch current currency exchange rates from backend API.");
      showToast("Error loading exchange rates.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      await syncExchangeRates();
      showToast("Exchange rates synchronized successfully.", "success");
      fetchRates();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || "Failed to synchronize rates.";
      showToast(msg, "error");
    } finally {
      setSyncing(false);
    }
  };

  const handleOpenOverride = (ratePair = null) => {
    setOverrideForm({
      from_currency: ratePair?.from_currency || "USD",
      to_currency: ratePair?.to_currency || "INR",
      rate: ratePair?.rate ? ratePair.rate.toString() : ""
    });
    setIsOverrideOpen(true);
  };

  const handleOverrideChange = (e) => {
    const { name, value } = e.target;
    setOverrideForm(prev => ({ ...prev, [name]: value }));
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    const rateVal = parseFloat(overrideForm.rate);
    if (!overrideForm.from_currency || !overrideForm.to_currency || isNaN(rateVal) || rateVal <= 0) {
      showToast("Please enter a valid positive exchange rate.", "error");
      return;
    }
    if (overrideForm.from_currency === overrideForm.to_currency) {
      showToast("From and To currency codes cannot be identical.", "error");
      return;
    }

    try {
      await overrideExchangeRate({
        from_currency: overrideForm.from_currency,
        to_currency: overrideForm.to_currency,
        rate: rateVal
      });
      showToast("Exchange rate overridden successfully.", "success");
      setIsOverrideOpen(false);
      fetchRates();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to override exchange rate.", "error");
    }
  };

  // Find latest sync time among rates (most recent fetched_at)
  const lastSyncTime = rates.length > 0
    ? new Date(Math.max(...rates.map(r => new Date(r.fetched_at)))).toLocaleString()
    : "Never";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Banner / Header */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <Coins size={14} className="text-[#8B5CF6]" />
            <h4 className="text-sm font-bold text-white">Exchange Rates Sync Status</h4>
          </div>
          <p className="text-[11px] text-zinc-500">
            Last Sync: <span className="font-mono text-zinc-300 font-bold">{lastSyncTime}</span>
          </p>
        </div>
        
        <button
          type="button"
          onClick={handleSyncNow}
          disabled={syncing || loading}
          className="adm-btn adm-btn-purple cursor-pointer flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl disabled:opacity-40"
        >
          {syncing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          {syncing ? "Synchronizing..." : "Sync Rates Now"}
        </button>
      </div>

      {/* Main card */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
          <div className="text-left">
            <h4 className="text-sm font-bold text-white">Currency Conversion Master</h4>
            <p className="text-[11px] text-zinc-500">View live exchange rates or configure manual overrides for custom pricing conversions.</p>
          </div>
          
          <button
            type="button"
            onClick={() => handleOpenOverride()}
            className="adm-btn adm-btn-ghost cursor-pointer flex items-center gap-1.5 text-xs py-2 px-4 border border-white/10 rounded-xl hover:bg-white/5 text-zinc-200"
          >
            <Edit2 size={12} /> Create Custom Override
          </button>
        </div>

        {/* Rates Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#8B5CF6] mr-2" size={18} />
            <span className="text-xs text-zinc-400">Loading conversion rates...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
            <span className="text-xs text-red-400">{error}</span>
          </div>
        ) : rates.length === 0 ? (
          <div className="p-8 text-center border border-white/5 rounded-2xl bg-zinc-900/10">
            <span className="text-xs text-zinc-500">No exchange rate mappings found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/60 text-[9px] text-zinc-500 uppercase font-black tracking-wider">
                  <th className="py-3 px-4">From Currency</th>
                  <th className="py-3 px-4">To Currency</th>
                  <th className="py-3 px-4 text-right">Exchange Rate</th>
                  <th className="py-3 px-4">Provider / Source</th>
                  <th className="py-3 px-4">Last Fetched</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[11px] text-zinc-300 font-mono">
                {rates.map((rate) => {
                  const isOverride = rate.provider === "Manual Override";
                  return (
                    <tr key={rate.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="py-3 px-4 text-white font-sans font-bold">{rate.from_currency}</td>
                      <td className="py-3 px-4 text-white font-sans font-bold">{rate.to_currency}</td>
                      <td className="py-3 px-4 text-right text-purple-400 font-bold">{rate.rate.toFixed(4)}</td>
                      <td className="py-3 px-4">
                        {isOverride ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded-lg border border-amber-500/10 font-sans">
                            <AlertTriangle size={9} /> Manual Override
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-800/40 px-2 py-0.5 rounded-lg border border-zinc-700/20 font-sans">
                            <CheckCircle2 size={9} /> {rate.provider || "Frankfurter"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {rate.fetched_at ? new Date(rate.fetched_at).toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        <button
                          type="button"
                          onClick={() => handleOpenOverride(rate)}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
                        >
                          Override Rate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MANUAL OVERRIDE DIALOG MODAL */}
      <AnimatePresence>
        {isOverrideOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsOverrideOpen(false)} className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-5 shadow-2xl z-10 flex flex-col"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Configure Manual Rate Override
                </h3>
                <button
                  type="button"
                  onClick={() => setIsOverrideOpen(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                >
                  <XCircle size={15} />
                </button>
              </div>

              <form onSubmit={handleOverrideSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <SettingsSelect
                    label="From Currency" name="from_currency" required
                    value={overrideForm.from_currency} onChange={handleOverrideChange}
                    options={SUPPORTED_CURRENCIES}
                  />
                  <SettingsSelect
                    label="To Currency" name="to_currency" required
                    value={overrideForm.to_currency} onChange={handleOverrideChange}
                    options={SUPPORTED_CURRENCIES}
                  />
                </div>

                <SettingsInput
                  label="Override Exchange Rate Value"
                  type="number"
                  name="rate"
                  required
                  value={overrideForm.rate}
                  onChange={handleOverrideChange}
                  placeholder="e.g. 83.45"
                />

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-left flex items-start gap-2.5">
                  <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[10px] text-zinc-400 leading-normal">
                    This override will bypass all automatic sync schedules for the currency pair and apply instantly to all prorated invoicing and reporting calculations.
                  </span>
                </div>

                <div className="flex gap-3 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOverrideOpen(false)}
                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-zinc-300 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white rounded-xl cursor-pointer transition-colors"
                  >
                    Apply Override
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
