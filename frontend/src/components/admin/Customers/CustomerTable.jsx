// src/components/admin/Customers/CustomerTable.jsx
import { useState, useEffect, useRef } from "react";
import { Eye, Edit3, CreditCard, History, Ban, UserCheck, Trash2, MoreVertical, CheckSquare, Square, FileDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomerStatusBadge from "./CustomerStatusBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";

// Helper to match country to flag emoji
function getCountryFlag(country) {
  const c = (country || "").toLowerCase();
  if (c.includes("india")) return "🇮🇳";
  if (c.includes("united states") || c.includes("usa")) return "🇺🇸";
  if (c.includes("united kingdom") || c.includes("uk")) return "🇬🇧";
  if (c.includes("canada")) return "🇨🇦";
  if (c.includes("germany")) return "🇩🇪";
  if (c.includes("france")) return "🇫🇷";
  if (c.includes("australia")) return "🇦🇺";
  return "🏳️";
}

// Calculate mock spend based on current package
function getLifetimeSpend(plan) {
  const p = (plan || "").toLowerCase();
  if (p.includes("family")) return 1497;
  if (p.includes("premium")) return 897;
  if (p.includes("standard")) return 597;
  if (p.includes("basic")) return 297;
  return 0;
}

export default function CustomerTable({
  customers = [],
  onView,
  onEdit,
  onArchive,
  onRestore
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const toggleSelectRow = (id, e) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map(c => c.id));
    }
  };

  const getInitials = (name) => {
    if (!name) return "CU";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="relative w-full">
      {/* ── Floating Bulk Actions Toolbar ── */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl border shadow-2xl p-4 flex items-center gap-6 bg-zinc-950/95 border-white/10"
            style={{ backdropFilter: "blur(24px)", minWidth: "480px" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-[#8B5CF6]/20 text-[#A78BFA] font-black px-2 py-0.5 rounded-full border border-[#8B5CF6]/30">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold text-gray-300">Selected</span>
            </div>

            <div style={{ width: "1px", height: "20px", background: "rgba(255,255,255,0.06)" }} />

            <div className="flex items-center gap-2 flex-1 justify-end">
              <button
                type="button"
                className="adm-btn adm-btn-ghost flex items-center gap-1.5 cursor-pointer focus:outline-none"
                style={{ fontSize: "11px", padding: "5px 12px" }}
                onClick={() => {
                  alert(`Exporting ${selectedIds.length} customer records to CSV.`);
                  setSelectedIds([]);
                }}
              >
                <FileDown size={12} />
                Export
              </button>

              <button
                type="button"
                className="adm-btn adm-btn-ghost flex items-center gap-1.5 cursor-pointer focus:outline-none"
                style={{ fontSize: "11px", padding: "5px 12px" }}
                onClick={() => {
                  alert(`Suspending ${selectedIds.length} subscription accounts.`);
                  setSelectedIds([]);
                }}
              >
                <Ban size={12} />
                Suspend
              </button>

              <button
                type="button"
                className="adm-btn cursor-pointer focus:outline-none flex items-center gap-1.5 text-xs font-bold rounded-xl px-3.5 py-1.5 text-white bg-red-650 hover:bg-red-750 transition-colors border-none"
                onClick={() => {
                  if (confirm(`Archive ${selectedIds.length} selected accounts?`)) {
                    selectedIds.forEach(id => {
                      const c = customers.find(item => item.id === id);
                      if (c) onArchive(c);
                    });
                    setSelectedIds([]);
                  }
                }}
              >
                <Trash2 size={12} />
                Archive
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Data Grid ── */}
      <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md">
        <table className="w-full text-left border-collapse min-w-[1000px] adm-table">
          <thead>
            <tr className="border-b border-white/5 bg-zinc-950/40 text-[10px] text-gray-500 uppercase font-bold tracking-wider select-none">
              {/* Checkbox Column */}
              <th className="py-4 px-4 text-center" style={{ width: "48px" }}>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-gray-500 hover:text-white cursor-pointer focus:outline-none"
                >
                  {selectedIds.length === customers.length ? (
                    <CheckSquare size={15} className="text-[#8B5CF6]" />
                  ) : (
                    <Square size={15} />
                  )}
                </button>
              </th>
              <th className="py-4 px-5">Customer</th>
              <th className="py-4 px-5">Country</th>
              <th className="py-4 px-5">Plan</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-center">Trial Remaining</th>
              <th className="py-4 px-5">Joined Date</th>
              <th className="py-4 px-5 text-right">Lifetime Spend</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs">
            {customers.map((c) => {
              const isMuted = c.isArchived;
              const initials = getInitials(c.name);
              const flag = getCountryFlag(c.country);
              const spend = getLifetimeSpend(c.currentPlan);
              const isRowSelected = selectedIds.includes(c.id);

              return (
                <motion.tr
                  key={c.id}
                  whileHover={{ y: -1, scale: 1.002 }}
                  transition={{ duration: 0.15 }}
                  className={`group transition-all ${
                    isRowSelected ? "bg-[#8B5CF6]/5" : "hover:bg-white/2"
                  } ${isMuted ? "opacity-50 text-zinc-500" : "text-gray-300"}`}
                  onClick={() => onView(c)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Select Checkbox */}
                  <td className="py-3 px-4 text-center" onClick={(e) => toggleSelectAll(e)}>
                    <button
                      type="button"
                      onClick={(e) => toggleSelectRow(c.id, e)}
                      className="text-gray-500 hover:text-white cursor-pointer focus:outline-none"
                    >
                      {isRowSelected ? (
                        <CheckSquare size={15} className="text-[#8B5CF6]" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </td>

                  {/* Customer Info */}
                  <td className="py-3.5 px-5 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 text-white"
                      style={{
                        background: isMuted
                          ? "#1E293B"
                          : `linear-gradient(135deg, #8B5CF6, #EC4899)`,
                        boxShadow: isMuted ? "none" : "0 4px 12px rgba(139,92,246,0.15)"
                      }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0 text-left">
                      <span className={`font-bold block truncate group-hover:text-white transition-colors ${
                        isMuted ? "text-zinc-400 line-through" : "text-gray-200"
                      }`}>
                        {c.name}
                      </span>
                      <span className="text-[10px] text-gray-500 block truncate font-light mt-0.5">{c.email}</span>
                    </div>
                  </td>

                  {/* Country flag + name */}
                  <td className="py-3.5 px-5 text-gray-400 group-hover:text-gray-200 transition-colors text-left">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-base leading-none">{flag}</span>
                      <span className="text-xs">{c.country || "Not set"}</span>
                    </span>
                  </td>

                  {/* Plan badge */}
                  <td className="py-3.5 px-5 text-left">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        background: "rgba(139,92,246,0.08)",
                        color: "#A78BFA",
                        border: "1px solid rgba(139,92,246,0.18)"
                      }}
                    >
                      {c.currentPlan || "Free"}
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-5 text-left">
                    <CustomerStatusBadge status={c.subscriptionStatus} />
                  </td>

                  {/* Trial Days */}
                  <td className="py-3.5 px-5 text-center font-mono font-bold">
                    {c.subscriptionStatus === "TRIAL" ? (
                      <span className={c.trialDaysRemaining <= 2 ? "text-red-500" : "text-gray-400"}>
                        {c.trialDaysRemaining}d
                      </span>
                    ) : (
                      <span className="text-zinc-700 font-normal">-</span>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-5 font-mono text-gray-400 text-left">
                    {c.created_at || "-"}
                  </td>

                  {/* Lifetime Spend */}
                  <td className="py-3.5 px-5 text-right font-mono">
                    <span className="font-bold text-white block">{formatCurrency(spend)}</span>
                    <span className="text-[9px] text-gray-500 block uppercase tracking-wider font-sans mt-0.5">Lifetime</span>
                  </td>

                  {/* Actions Dropdown */}
                  <td className="py-3.5 px-5 text-right relative" ref={activeMenuId === c.id ? menuRef : null}>
                    <button
                      type="button"
                      onClick={(e) => handleToggleMenu(c.id, e)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {/* Popover */}
                    <AnimatePresence>
                      {activeMenuId === c.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -6 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-6 top-10 w-44 bg-zinc-950/95 border border-white/10 rounded-xl shadow-2xl p-1.5 z-40 text-left origin-top-right"
                          style={{ backdropFilter: "blur(24px)" }}
                        >
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onView(c); }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-semibold flex items-center gap-2"
                          >
                            <Eye size={12} />
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onEdit(c); }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-semibold flex items-center gap-2"
                          >
                            <Edit3 size={12} />
                            Edit Customer
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onView(c); }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-semibold flex items-center gap-2"
                          >
                            <CreditCard size={12} />
                            Manage Subscription
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onView(c); }}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-semibold flex items-center gap-2"
                          >
                            <History size={12} />
                            Payment History
                          </button>
                          
                          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "4px 0" }} />

                          {c.isArchived ? (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onRestore(c); }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold flex items-center gap-2"
                            >
                              <UserCheck size={12} />
                              Restore Account
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); onArchive(c); }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold flex items-center gap-2"
                            >
                              <Ban size={12} />
                              Suspend / Archive
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
