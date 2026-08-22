// src/components/admin/Customers/CustomerFilters.jsx
import { X, Filter, RefreshCw, FileDown } from "lucide-react";

export default function CustomerFilters({ filters, onFilterChange, onReset, onExport }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange(name, value);
  };

  const countries = ["All", "India", "USA", "UK", "Canada", "Germany", "France", "Australia"];
  const statuses = ["All", "Active", "Trial", "Past_Due", "Cancelled", "Expired"];
  const plans = ["All", "Free", "Basic", "Standard", "Premium", "Family"];
  const roles = ["All", "ADMIN", "CUSTOMER"];
  const sorts = ["Newest", "Oldest", "Name A-Z", "Name Z-A"];

  const activeFiltersCount = Object.keys(filters).reduce((count, key) => {
    if (key === "page" || key === "limit") return count;
    if (key === "view" && filters[key] === "Active") return count;
    if (filters[key] && filters[key] !== "All" && filters[key] !== "") {
      return count + 1;
    }
    return count;
  }, 0);

  return (
    <div className="flex flex-wrap items-end gap-4 w-full">
      {/* 1. Status View Filter */}
      <div className="flex flex-col space-y-1.5 min-w-[120px] text-left">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Status View</label>
        <select
          name="view"
          value={filters.view || "Active"}
          onChange={handleChange}
          className="bg-zinc-950/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer font-medium"
        >
          <option value="Active" className="bg-zinc-950 text-white">Active Customers</option>
          <option value="Archived" className="bg-zinc-950 text-white">Archived Customers</option>
          <option value="All" className="bg-zinc-950 text-white">All Customers</option>
        </select>
      </div>

      {/* 2. Subscription Status */}
      <div className="flex flex-col space-y-1.5 min-w-[120px] text-left">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Status</label>
        <select
          name="status"
          value={filters.status || "All"}
          onChange={handleChange}
          className="bg-zinc-950/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer font-medium"
        >
          {statuses.map((s) => (
            <option key={s} value={s} className="bg-zinc-950 text-white">
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Subscription Plan */}
      <div className="flex flex-col space-y-1.5 min-w-[120px] text-left">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Plan</label>
        <select
          name="plan"
          value={filters.plan || "All"}
          onChange={handleChange}
          className="bg-zinc-950/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer font-medium"
        >
          {plans.map((p) => (
            <option key={p} value={p} className="bg-zinc-950 text-white">
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* 4. Country */}
      <div className="flex flex-col space-y-1.5 min-w-[120px] text-left">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Country</label>
        <select
          name="country"
          value={filters.country || "All"}
          onChange={handleChange}
          className="bg-zinc-950/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer font-medium"
        >
          {countries.map((c) => (
            <option key={c} value={c} className="bg-zinc-950 text-white">
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* 5. Role */}
      <div className="flex flex-col space-y-1.5 min-w-[100px] text-left">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Role</label>
        <select
          name="role"
          value={filters.role || "All"}
          onChange={handleChange}
          className="bg-zinc-950/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer font-medium"
        >
          {roles.map((r) => (
            <option key={r} value={r} className="bg-zinc-950 text-white">
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* 6. Sort Order */}
      <div className="flex flex-col space-y-1.5 min-w-[100px] text-left">
        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Sort</label>
        <select
          name="sort"
          value={filters.sort || "Newest"}
          onChange={handleChange}
          className="bg-zinc-950/40 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer font-medium"
        >
          {sorts.map((s) => (
            <option key={s} value={s} className="bg-zinc-950 text-white">
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 7. Action Buttons */}
      <div className="flex items-center gap-2 ml-auto pb-0.5">
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "11px", padding: "6px 12px" }}
          >
            <X size={12} />
            Reset
          </button>
        )}

        <button
          type="button"
          onClick={onExport}
          className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
          style={{ fontSize: "11px", padding: "6px 12px" }}
        >
          <FileDown size={12} />
          Export CSV
        </button>

        <button
          type="button"
          className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5"
          style={{ fontSize: "11px", padding: "6px 12px" }}
        >
          <Filter size={12} />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>
      </div>
    </div>
  );
}
