// src/components/admin/Settings/ResetSettingsDialog.jsx

export default function ResetSettingsDialog({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel} 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Dialog Body Box */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 animate-fade-in origin-center text-center space-y-4">
        
        {/* Warning Icon SVG */}
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-sm font-bold text-white tracking-tight">Restore Default Settings?</h3>
        
        <p className="text-xs text-gray-500 font-light leading-relaxed">
          Are you sure you want to reset all variables? This action permanently voids custom trial limits, tax rate percentages, and timezone records.
        </p>

        <div className="flex gap-3 pt-2">
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
            className="flex-1 py-2.5 bg-red-650 hover:bg-red-750 text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors"
          >
            Confirm Reset
          </button>
        </div>
      </div>
    </div>
  );
}
