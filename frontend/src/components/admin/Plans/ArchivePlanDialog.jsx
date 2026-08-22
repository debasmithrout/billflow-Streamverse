// src/components/admin/Plans/ArchivePlanDialog.jsx
import { AlertTriangle, Archive, RefreshCw } from "lucide-react";

export default function ArchivePlanDialog({ isOpen, plan, activeCount = 0, actionType = "archive", onConfirm, onCancel }) {
  if (!isOpen || !plan) return null;

  const isArchive = actionType === "archive";
  
  // Archive protection check
  const isProtected = isArchive && activeCount > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel} 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Dialog Panel Frame */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 animate-fade-in origin-center text-center">
        
        {/* Icon banner */}
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          isProtected 
            ? "bg-amber-500/10 text-amber-500" 
            : isArchive 
              ? "bg-red-500/10 text-red-500" 
              : "bg-[#8B5CF6]/10 text-[#8B5CF6]"
        }`}>
          {isProtected ? (
            <AlertTriangle size={22} style={{ color: "#F59E0B" }} />
          ) : isArchive ? (
            <Archive size={22} style={{ color: "#EF4444" }} />
          ) : (
            <RefreshCw size={22} style={{ color: "#8B5CF6" }} />
          )}
        </div>

        {/* Dialog Header Title */}
        <h3 className="text-sm font-bold text-white tracking-tight">
          {isProtected 
            ? "Plan Archive Blocked" 
            : isArchive 
              ? "Archive Subscription Plan?" 
              : "Restore Subscription Plan?"
          }
        </h3>

        {/* Dialog Description Text */}
        <p className="text-xs text-gray-500 font-light mt-2.5 leading-relaxed">
          {isProtected ? (
            <>
              This plan is currently assigned to <span className="font-bold text-white">{activeCount} active customers</span>. Please migrate customers to another plan before archiving <span className="font-semibold text-gray-300">{plan.name}</span>.
            </>
          ) : isArchive ? (
            <>
              Are you sure you want to archive the <span className="font-semibold text-gray-300">{plan.name}</span> plan? Active users already on this plan will not be interrupted, but new signups will be blocked.
            </>
          ) : (
            <>
              Do you want to restore the <span className="font-semibold text-gray-300">{plan.name}</span> plan? Users will be able to sign up or migrate to this plan immediately.
            </>
          )}
        </p>

        {/* Actions panel */}
        <div className="flex gap-3 mt-6">
          {isProtected ? (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors text-center"
            >
              Understand
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>

      </div>
    </div>
  );
}
