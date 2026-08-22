// src/components/customer/Profile/ProfileInfoCard.jsx
import { useState } from "react";
import { updateCustomerProfile } from "../../../services/customerService";
import useToast from "../../../hooks/useToast";
import useModal from "../../../hooks/useModal";

export default function ProfileInfoCard({ profile, onProfileUpdate }) {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Check for unsaved changes
    const hasChanges = Object.keys(formData).some(
      (key) => formData[key] !== profile[key]
    );

    if (hasChanges) {
      showConfirm({
        title: "Discard Changes?",
        description: "You have unsaved changes. Are you sure you want to discard them?",
        variant: "warning",
        confirmText: "Discard",
        cancelText: "Keep Editing",
        onConfirm: () => {
          setIsEditing(false);
        }
      });
    } else {
      setIsEditing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateCustomerProfile(formData);
      onProfileUpdate(updated);
      setIsEditing(false);
      showToast("Profile changes saved successfully!", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      showToast("Failed to save changes. Please try again.", "error");
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return "CV";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 relative">
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
        <h3 className="text-base font-black text-white tracking-wide">Personal Information</h3>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEditToggle}
            className="text-xs text-red-500 hover:text-red-400 font-bold tracking-wide uppercase transition-colors cursor-pointer focus:outline-none"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Avatar Area */}
          <div className="shrink-0 flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-red-600/10">
              {getInitials(profile.name)}
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Member Initials</span>
          </div>

          {/* Fields */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {/* Name */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Full Name</span>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
              ) : (
                <span className="text-sm font-medium text-white block py-1">{profile.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Email Address</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
              ) : (
                <span className="text-sm font-medium text-white block py-1">{profile.email}</span>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Phone Number</span>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
              ) : (
                <span className="text-sm font-medium text-white block py-1">{profile.phone_number || "Not Provided"}</span>
              )}
            </div>

            {/* Country */}
            <div className="space-y-1">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Country</span>
              {isEditing ? (
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-red-600 transition-all"
                >
                  {["India", "United States", "United Kingdom", "Canada", "Australia"].map((c) => (
                    <option key={c} value={c} className="bg-zinc-950 text-white">{c}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm font-medium text-white block py-1">{profile.country}</span>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Billing Address</span>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-950/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
                />
              ) : (
                <span className="text-sm font-medium text-white block py-1">{profile.address || "Not Provided"}</span>
              )}
            </div>

            {/* Member Since (Read-only always) */}
            <div className="space-y-1 sm:col-span-2">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block">Member Since</span>
              <span className="text-sm font-medium text-gray-400 block py-1">{profile.memberSince}</span>
            </div>
          </div>
        </div>

        {/* Buttons for Edit mode */}
        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md shadow-red-600/10 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
