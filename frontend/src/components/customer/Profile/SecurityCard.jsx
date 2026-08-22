// src/components/customer/Profile/SecurityCard.jsx
import { useState } from "react";
import { deleteOwnAccount } from "../../../services/customerService";
import useModal from "../../../hooks/useModal";
import useToast from "../../../hooks/useToast";

export default function SecurityCard() {
  const { showConfirm } = useModal();
  const { showToast } = useToast();
  const [showPasswordNote, setShowPasswordNote] = useState(false);
  const [showSecurityNote, setShowSecurityNote] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteAccount = () => {
    showConfirm({
      title: "Delete Account?",
      description: "Are you sure you want to permanently delete your StreamVerse account? This action cannot be undone.",
      variant: "delete",
      confirmText: "Delete Account",
      cancelText: "Cancel",
      onConfirm: async () => {
        setDeleting(true);
        setDeleteError("");
        try {
          await deleteOwnAccount();
          localStorage.removeItem("access_token");
          localStorage.removeItem("current_user");
          showToast("Account deleted successfully.", "success");
          window.location.href = "/login?reason=deleted";
        } catch (err) {
          console.error("Failed to delete account:", err);
          setDeleteError("Failed to delete account. Please try again.");
          showToast("Failed to delete account. Please try again.", "error");
        } finally {
          setDeleting(false);
        }
      }
    });
  };

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h3 className="text-base font-black text-white tracking-wide">Security & Actions</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Change Password Card */}
        <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white">Change Password</h4>
            <p className="text-[10px] text-gray-500 font-light leading-relaxed">
              Update your account credentials to keep your streaming profile secure.
            </p>
            {showPasswordNote && (
              <p className="text-[10px] text-red-500 font-medium">Password update functionality is coming soon!</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowPasswordNote(true);
              setTimeout(() => setShowPasswordNote(false), 3000);
            }}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-gray-300 font-bold rounded-lg border border-white/5 transition-all cursor-pointer focus:outline-none"
          >
            Change Password
          </button>
        </div>

        {/* Security Settings Card */}
        <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white">Security Settings</h4>
            <p className="text-[10px] text-gray-500 font-light leading-relaxed">
              Manage 2FA, logins, and authorized devices streaming your catalog.
            </p>
            {showSecurityNote && (
              <p className="text-[10px] text-red-500 font-medium">Two-factor auth updates are coming soon!</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setShowSecurityNote(true);
              setTimeout(() => setShowSecurityNote(false), 3000);
            }}
            className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-[10px] text-gray-300 font-bold rounded-lg border border-white/5 transition-all cursor-pointer focus:outline-none"
          >
            Configure
          </button>
        </div>

        {/* Delete Account Card */}
        <div className="p-4 rounded-xl bg-zinc-950/40 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white">Delete Account</h4>
            </div>
            <p className="text-[10px] text-gray-500 font-light leading-relaxed">
              Permanently remove your profile details and billing history from StreamVerse.
            </p>
            {deleteError && (
              <p className="text-[10px] text-red-500 font-medium">{deleteError}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 disabled:bg-zinc-800 disabled:text-gray-500 text-[10px] text-red-500 font-bold rounded-lg border border-red-500/10 transition-all cursor-pointer focus:outline-none"
          >
            {deleting ? "Deleting..." : "Delete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
