// src/components/customer/Profile/AccountStatusCard.jsx
import { useNavigate } from "react-router-dom";

export default function AccountStatusCard({ subscription }) {
  const navigate = useNavigate();

  if (!subscription) return null;

  const { status, planName, renewalDate, trialDaysRemaining } = subscription;

  const getStatusColor = (s) => {
    switch (s) {
      case "ACTIVE":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "TRIAL":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "PAST_DUE":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      default:
        return "text-gray-400 bg-zinc-800 border-zinc-700";
    }
  };

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-base font-black text-white tracking-wide">Account Status</h3>
        </div>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Subscription Status</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>

          {/* Current Plan */}
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Current Plan</span>
            <span className="text-sm font-bold text-white">{planName}</span>
          </div>

          {/* Trial details or renewal dates */}
          {status === "TRIAL" ? (
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Trial Remaining</span>
              <span className="text-sm font-bold text-red-500">{trialDaysRemaining} Days</span>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider">Next Billing Date</span>
              <span className="text-sm font-mono text-white">{renewalDate || "N/A"}</span>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/customer/subscription")}
        className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs border border-white/5 transition-all cursor-pointer focus:outline-none"
      >
        Manage Subscription
      </button>
    </div>
  );
}
