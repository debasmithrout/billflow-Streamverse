// src/components/admin/Settings/TaxRulesCard.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Percent, Search, PlusCircle, Edit2, Trash2, CheckCircle2, 
  XCircle, FileText, Calendar, Loader2, ArrowUpDown
} from "lucide-react";
import { 
  getTaxes, createTax, updateTax, deleteTax, 
  getTaxesSummary, getTaxesReport 
} from "../../../services/adminService";
import useToast from "../../../hooks/useToast";

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
          <option key={o.value ?? o} value={o.value ?? o} className="bg-zinc-950">{o.label ?? o}</option>
        ))}
      </select>
    </div>
  );
}

export default function TaxRulesCard() {
  const { showToast } = useToast();
  
  // Lists & States
  const [rules, setRules] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter & Sort
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortField, setSortField] = useState("tax_name");
  const [sortOrder, setSortOrder] = useState("asc");
  
  // Modals & Selection
  const [selectedRule, setSelectedRule] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Report States
  const [reportDates, setReportDates] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  // Form State
  const [formState, setFormState] = useState({
    tax_name: "",
    tax_code: "",
    country: "",
    state: "",
    tax_type: "standard",
    tax_percentage: 0.0,
    is_active: true,
    effective_from: "",
    effective_to: "",
    reverse_charge: false
  });

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [taxesList, taxSummary] = await Promise.all([
        getTaxes(false),
        getTaxesSummary()
      ]);
      
      setRules(taxesList);
      setSummary(taxSummary);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch tax rules configuration from backend API.");
      showToast("Error loading tax rules data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxData();
  }, []);

  // Form handlers
  const handleOpenAdd = () => {
    setSelectedRule(null);
    setFormState({
      tax_name: "",
      tax_code: "",
      country: "",
      state: "",
      tax_type: "standard",
      tax_percentage: 0.0,
      is_active: true,
      effective_from: new Date().toISOString().substring(0, 16),
      effective_to: "",
      reverse_charge: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setSelectedRule(rule);
    setFormState({
      tax_name: rule.tax_name,
      tax_code: rule.tax_code,
      country: rule.country,
      state: rule.state || "",
      tax_type: rule.tax_type,
      tax_percentage: rule.tax_percentage,
      is_active: rule.is_active,
      effective_from: rule.effective_from ? rule.effective_from.substring(0, 16) : "",
      effective_to: rule.effective_to ? rule.effective_to.substring(0, 16) : "",
      reverse_charge: rule.reverse_charge
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (rule) => {
    setSelectedRule(rule);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : (name === "tax_percentage" ? parseFloat(value || 0) : value)
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formState.tax_name || !formState.tax_code || !formState.country) {
      showToast("Please fill in all required fields.", "error");
      return;
    }
    
    try {
      const payload = {
        ...formState,
        effective_from: new Date(formState.effective_from).toISOString(),
        effective_to: formState.effective_to ? new Date(formState.effective_to).toISOString() : null,
        state: formState.state.trim() || null
      };

      if (selectedRule) {
        await updateTax(selectedRule.id, payload);
        showToast("Tax rule updated successfully.", "success");
      } else {
        await createTax(payload);
        showToast("Tax rule created successfully.", "success");
      }
      setIsModalOpen(false);
      fetchTaxData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to save tax rule.", "error");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRule) return;
    try {
      await deleteTax(selectedRule.id);
      showToast("Tax rule deleted successfully.", "success");
      setIsDeleteOpen(false);
      fetchTaxData();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete tax rule.", "error");
    }
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      setReportLoading(true);
      const startIso = reportDates.start ? new Date(reportDates.start).toISOString().split("T")[0] : null;
      const endIso = reportDates.end ? new Date(reportDates.end).toISOString().split("T")[0] : null;
      const report = await getTaxesReport(startIso, endIso);
      setReportData(report);
      showToast("Tax report generated successfully.", "success");
    } catch {
      showToast("Failed to generate tax report.", "error");
    } finally {
      setReportLoading(false);
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter & Sort computation
  const filteredRules = rules
    .filter(r => {
      const query = search.toLowerCase();
      const matchesSearch = 
        r.tax_name.toLowerCase().includes(query) ||
        r.tax_code.toLowerCase().includes(query) ||
        r.country.toLowerCase().includes(query) ||
        (r.state && r.state.toLowerCase().includes(query));
      
      const matchesActive = 
        activeFilter === "all" || 
        (activeFilter === "active" && r.is_active) || 
        (activeFilter === "inactive" && !r.is_active);
        
      return matchesSearch && matchesActive;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Total Tax Rules</span>
          <span className="text-2xl font-black text-white font-mono">{rules.length}</span>
        </div>
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Active Rules</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {rules.filter(r => r.is_active).length}
          </span>
        </div>
        <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">Total Tax Collected</span>
          <span className="text-2xl font-black text-purple-400 font-mono">
            {summary ? `₹${summary.total_tax_collected.toFixed(2)}` : "₹0.00"}
          </span>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Percent size={14} className="text-[#8B5CF6]" />
              <h4 className="text-sm font-bold text-white">Tax Rules Master</h4>
            </div>
            <p className="text-[11px] text-zinc-500">Add, edit, or remove localized state and country-level tax rules.</p>
          </div>
          
          <button
            type="button"
            onClick={handleOpenAdd}
            className="adm-btn adm-btn-purple cursor-pointer flex items-center gap-1.5 text-xs py-2 px-4 rounded-xl self-start sm:self-center"
          >
            <PlusCircle size={13} /> Add Tax Rule
          </button>
        </div>

        {/* Filters & search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-zinc-600" size={14} />
            <input
              type="text"
              placeholder="Search tax rules by name, code or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-950/60 border border-white/5 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] placeholder-zinc-600"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-zinc-950/60 border border-white/5 rounded-xl text-xs text-zinc-300 outline-none focus:border-[#8B5CF6] cursor-pointer"
            >
              <option value="all" className="bg-zinc-950">All Statuses</option>
              <option value="active" className="bg-zinc-950">Active Only</option>
              <option value="inactive" className="bg-zinc-950">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Rules Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#8B5CF6] mr-2" size={18} />
            <span className="text-xs text-zinc-400">Loading tax rules...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-center">
            <span className="text-xs text-red-400">{error}</span>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-8 text-center border border-white/5 rounded-2xl bg-zinc-900/10">
            <span className="text-xs text-zinc-500">No matching tax rules found.</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/60 text-[9px] text-zinc-500 uppercase font-black tracking-wider">
                  <th className="py-3 px-4 cursor-pointer select-none hover:text-white" onClick={() => toggleSort("tax_name")}>
                    Name <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="py-3 px-4 cursor-pointer select-none hover:text-white" onClick={() => toggleSort("tax_code")}>
                    Code <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="py-3 px-4 cursor-pointer select-none hover:text-white" onClick={() => toggleSort("country")}>
                    Country & State <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-right cursor-pointer select-none hover:text-white" onClick={() => toggleSort("tax_percentage")}>
                    Rate <ArrowUpDown size={10} className="inline ml-1" />
                  </th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Effective Range</th>
                  <th className="py-3 px-4">Rev. Charge</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-[11px] text-zinc-300 font-mono">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-white/[0.015] transition-colors">
                    <td className="py-3 px-4 text-white font-sans font-bold">{rule.tax_name}</td>
                    <td className="py-3 px-4">{rule.tax_code}</td>
                    <td className="py-3 px-4 font-sans">{rule.country}{rule.state ? ` - ${rule.state}` : ""}</td>
                    <td className="py-3 px-4 capitalize font-sans">{rule.tax_type}</td>
                    <td className="py-3 px-4 text-right text-purple-400 font-bold">{rule.tax_percentage.toFixed(2)}%</td>
                    <td className="py-3 px-4">
                      {rule.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 bg-zinc-800/40 px-2 py-0.5 rounded-lg border border-zinc-700/20">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[10px] text-zinc-400">
                      {rule.effective_from ? new Date(rule.effective_from).toLocaleDateString() : "Immediate"} 
                      {rule.effective_to ? ` to ${new Date(rule.effective_to).toLocaleDateString()}` : " onward"}
                    </td>
                    <td className="py-3 px-4 font-sans">{rule.reverse_charge ? "Yes" : "No"}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rule)}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(rule)}
                          className="p-1.5 rounded-lg bg-red-950/20 border border-red-500/10 text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tax Report Generator Section */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-[#8B5CF6]" />
            <h4 className="text-sm font-bold text-white">Generate Tax Ledger & Reports</h4>
          </div>
          <p className="text-[11px] text-zinc-500">Query audit list of collected taxes and invoices within selected dates.</p>
        </div>

        <form onSubmit={handleGenerateReport} className="flex flex-col sm:flex-row items-end gap-4 bg-zinc-900/10 p-4 border border-white/5 rounded-xl text-left">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
              <Calendar size={11} /> Start Date
            </label>
            <input
              type="date"
              required
              value={reportDates.start}
              onChange={(e) => setReportDates(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block flex items-center gap-1">
              <Calendar size={11} /> End Date
            </label>
            <input
              type="date"
              required
              value={reportDates.end}
              onChange={(e) => setReportDates(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6]"
            />
          </div>
          <button
            type="submit"
            disabled={reportLoading}
            className="adm-btn adm-btn-purple cursor-pointer flex items-center gap-1.5 text-xs py-2.5 px-5 rounded-xl w-full sm:w-auto justify-center disabled:opacity-40"
          >
            {reportLoading ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
            Generate Report
          </button>
        </form>

        {reportData && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center bg-zinc-900/30 p-3 border border-white/5 rounded-xl">
              <span className="text-xs text-zinc-400 font-bold">Total Report Items: {reportData.total_count}</span>
              <span className="text-xs text-purple-400 font-bold font-mono">
                Total Tax Collected: ₹{reportData.report.reduce((sum, item) => sum + item.tax_amount, 0).toFixed(2)}
              </span>
            </div>
            
            {reportData.report.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs">No records found for the selected period.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/5 max-h-60 overflow-y-auto adm-scrollbar">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-950/70 text-zinc-500 uppercase font-black tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Invoice Number</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Country</th>
                      <th className="py-2.5 px-3 text-right">Base Amount</th>
                      <th className="py-2.5 px-3 text-right">Tax Amount</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03] text-zinc-300 font-mono">
                    {reportData.report.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01]">
                        <td className="py-2 px-3 text-zinc-400">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="py-2 px-3 text-zinc-300 font-bold">{item.invoice_number}</td>
                        <td className="py-2 px-3 font-sans text-white">{item.customer_name}</td>
                        <td className="py-2 px-3 font-sans">{item.country}</td>
                        <td className="py-2 px-3 text-right">₹{item.base_amount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-purple-400 font-bold">₹{item.tax_amount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-bold">₹{item.total_amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* CREATE & EDIT DIALOG MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-5 shadow-2xl z-10 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  {selectedRule ? "Edit Tax Rule Configuration" : "Add Localized Tax Rule"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                >
                  <XCircle size={15} />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 adm-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingsInput label="Tax Rule Name" name="tax_name" required value={formState.tax_name} onChange={handleFormChange} placeholder="e.g. India GST, Consumption Tax" />
                  <SettingsInput label="Tax Code" name="tax_code" required value={formState.tax_code} onChange={handleFormChange} placeholder="e.g. GST, VAT, JP_TAX" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingsInput label="Country Code (e.g. IN, JP, US)" name="country" required value={formState.country} onChange={handleFormChange} placeholder="e.g. IN" />
                  <SettingsInput label="State / Region (Optional)" name="state" value={formState.state} onChange={handleFormChange} placeholder="e.g. MH, KA" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingsSelect
                    label="Tax Type Category" name="tax_type" required
                    value={formState.tax_type} onChange={handleFormChange}
                    options={[
                      { value: "standard", label: "Standard Rate" },
                      { value: "reduced", label: "Reduced Rate" },
                      { value: "exempt", label: "Exempt" },
                      { value: "zero-rated", label: "Zero-Rated" }
                    ]}
                  />
                  <SettingsInput label="Tax Percentage (%)" type="number" name="tax_percentage" required value={formState.tax_percentage} onChange={handleFormChange} placeholder="e.g. 18.0" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SettingsInput label="Effective From" type="datetime-local" name="effective_from" required value={formState.effective_from} onChange={handleFormChange} />
                  <SettingsInput label="Effective To (Optional)" type="datetime-local" name="effective_to" value={formState.effective_to} onChange={handleFormChange} />
                </div>

                <div className="flex gap-6 items-center p-3 bg-zinc-900/30 border border-white/5 rounded-xl text-left">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formState.is_active}
                      onChange={handleFormChange}
                      className="rounded border-zinc-700 bg-zinc-900 text-[#8B5CF6] focus:ring-[#8B5CF6] h-3.5 w-3.5"
                    />
                    Enable Active Status
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300 font-bold">
                    <input
                      type="checkbox"
                      name="reverse_charge"
                      checked={formState.reverse_charge}
                      onChange={handleFormChange}
                      className="rounded border-zinc-700 bg-zinc-900 text-[#8B5CF6] focus:ring-[#8B5CF6] h-3.5 w-3.5"
                    />
                    Reverse Charge Rule
                  </label>
                </div>

                <div className="flex gap-3 border-t border-white/5 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-zinc-300 rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white rounded-xl cursor-pointer transition-colors"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRM DIALOG */}
      <AnimatePresence>
        {isDeleteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setIsDeleteOpen(false)} className="fixed inset-0 bg-black/85 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 text-center space-y-4"
            >
              <div className="mx-auto w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <h3 className="text-sm font-bold text-white tracking-tight">Delete Tax Rule?</h3>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                Are you sure you want to delete the tax rule <strong>{selectedRule?.tax_name}</strong> ({selectedRule?.tax_code})? This rule will no longer apply to future billing cycles.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-zinc-300 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2 bg-red-650 hover:bg-red-750 text-xs font-bold text-white rounded-xl cursor-pointer transition-colors"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
