// src/components/admin/Customers/EditCustomerModal.jsx
import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function EditCustomerModal({ isOpen, customer, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    phone_number: customer?.phone_number || "",
    country: customer?.country || "",
    address: customer?.address || ""
  });
  
  // Track confirmation discard trigger
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  if (!isOpen || !customer) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isDirty = () => {
    return (
      formData.name !== (customer.name || "") ||
      formData.phone_number !== (customer.phone_number || "") ||
      formData.country !== (customer.country || "") ||
      formData.address !== (customer.address || "")
    );
  };

  const handleCancelClick = () => {
    if (isDirty()) {
      setShowConfirmDiscard(true);
    } else {
      onCancel();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(customer.id, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleCancelClick} 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-350"
      />

      {/* Main Dialog Modal */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 animate-fade-in origin-center flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Edit Customer Details</h3>
          <button
            type="button"
            onClick={handleCancelClick}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body scrollable */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 adm-scrollbar">
          
          {/* Read Only Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Email (Read Only)</label>
              <input
                type="email"
                value={customer.email || ""}
                disabled
                className="w-full px-3 py-2 bg-zinc-900/60 border border-white/5 rounded-xl text-xs text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Role (Read Only)</label>
              <input
                type="text"
                value={customer.role || "CUSTOMER"}
                disabled
                className="w-full px-3 py-2 bg-zinc-900/60 border border-white/5 rounded-xl text-xs text-gray-400 cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div className="text-left">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Joined Date (Read Only)</label>
            <input
              type="text"
              value={customer.created_at || ""}
              disabled
              className="w-full px-3 py-2 bg-zinc-900/60 border border-white/5 rounded-xl text-xs text-gray-400 cursor-not-allowed outline-none"
            />
          </div>

          {/* Editable fields */}
          <div className="text-left">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
          </div>

          <div className="text-left">
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Billing Address</label>
            <textarea
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all resize-none"
            />
          </div>

          {/* Action Row */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6EF8] hover:to-[#8B5CF6] disabled:from-zinc-900 disabled:to-zinc-900 disabled:text-gray-600 text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors border-none"
            >
              Save Changes
            </button>
          </div>
        </form>

        {/* Discard prompt */}
        {showConfirmDiscard && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/90 rounded-2xl">
            <div className="max-w-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-550 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} style={{ color: "#F59E0B" }} />
              </div>
              <h4 className="text-sm font-bold text-white">Discard Unsaved Changes?</h4>
              <p className="text-xs text-gray-400 font-light leading-normal">
                You have unsaved edits. Closing the form now will permanently lose your changes.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDiscard(false)}
                  className="flex-1 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-gray-300"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDiscard(false);
                    onCancel();
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-xl text-xs font-bold text-white border-none"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
