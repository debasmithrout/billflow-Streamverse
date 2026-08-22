// src/components/admin/Settings/ImportSettingsDialog.jsx
import { useState } from "react";

export default function ImportSettingsDialog({ isOpen, onConfirm, onCancel }) {
  const [jsonText, setJsonText] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const parsed = JSON.parse(jsonText.trim());

      // Scheme validation check
      if (!parsed.platformName || !parsed.supportEmail) {
        setErrorMsg("Invalid format. 'platformName' and 'supportEmail' parameters are required.");
        return;
      }

      onConfirm(parsed);
      setJsonText("");
    } catch {
      setErrorMsg("Syntax Error. Please verify standard JSON formatting.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel} 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Main Dialog Modal */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-fade-in origin-center flex flex-col">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Import Configurations</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-650/15 border border-red-500/10 rounded-xl mb-4 text-xs font-bold text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-xs space-y-1">
            <span className="text-gray-400 font-light block leading-normal">
              Paste standard JSON configurations to restore previously exported settings profiles.
            </span>
          </div>

          <div>
            <label className="text-[10px] text-gray-405 font-bold uppercase tracking-wider block mb-1.5">JSON Settings Payload</label>
            <textarea
              required
              rows="6"
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setErrorMsg("");
              }}
              placeholder='{ "platformName": "BillFlow", "supportEmail": "billing@billflow.com", "maintenanceMode": false }'
              className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-xl text-xs text-gray-300 font-mono outline-none focus:border-[#8B5CF6] transition-colors resize-none scrollbar-thin scrollbar-thumb-zinc-800"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-red-650 hover:bg-red-750 text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors"
            >
              Import Payload
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
