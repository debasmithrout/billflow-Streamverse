// src/components/admin/Customers/CustomerSearchBar.jsx
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function CustomerSearchBar({ onSearch, placeholder = "Search by name, email, or phone..." }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Debounced search logic
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(searchTerm);
    }, 350);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, onSearch]);

  return (
    <div className="flex-1 min-w-[280px] relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
        <Search size={14} />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2.5 bg-zinc-950/40 border border-white/5 rounded-xl text-xs text-white placeholder-gray-500 outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm("")}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-white cursor-pointer focus:outline-none"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
