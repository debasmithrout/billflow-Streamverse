// src/components/admin/Customers/ArchiveCustomerDialog.jsx
import { AlertCircle, RotateCw } from "lucide-react";

export default function ArchiveCustomerDialog({ isOpen, customer, actionType = "archive", onConfirm, onCancel }) {
  if (!isOpen || !customer) return null;

  const isArchive = actionType === "archive";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel} 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Dialog Frame */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 animate-fade-in origin-center text-center">
        
        {/* Icon banner */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          isArchive ? "bg-red-500/10 text-red-500" : "bg-[#8B5CF6]/10 text-[#8B5CF6]"
        }`}>
          {isArchive ? <AlertCircle size={22} /> : <RotateCw size={22} />}
        </div>

        <h3 className="text-sm font-bold text-white tracking-tight">
          {isArchive ? "Archive Customer Account?" : "Restore Customer Account?"}
        </h3>

        <p className="text-xs text-gray-500 font-light mt-2.5 leading-relaxed">
          {isArchive ? (
            <>
              Are you sure you want to archive <span className="font-semibold text-gray-300">{customer.name}</span>? Archived customers are muted and hidden from default views, but their ledger and invoice history remain intact.
            </>
          ) : (
            <>
              Do you want to restore <span className="font-semibold text-gray-300">{customer.name}</span>'s account to active customer status?
            </>
          )}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors border-none ${
              isArchive 
                ? "bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-750 hover:to-red-650 shadow-lg shadow-red-650/15" 
                : "bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6EF8] hover:to-[#8B5CF6] shadow-lg shadow-[#8B5CF6]/15"
            }`}
          >
            {isArchive ? "Archive" : "Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}
