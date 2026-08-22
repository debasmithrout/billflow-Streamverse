// src/components/customer/Shared/TrialStatusCard.jsx
import { useNavigate } from "react-router-dom";

export default function TrialStatusCard({ subscription }) {
  const navigate = useNavigate();

  if (!subscription) return null;

  const { status, trialDaysRemaining, trialEndDate, planName, renewalDate, price } = subscription;

  const renderCardContent = () => {
    switch (status) {
      case "TRIAL": {
        const isNearExpiration = trialDaysRemaining <= 2;
        return (
          <div className="space-y-4">
            {/* Trial expiration alert popup */}
            {isNearExpiration && (
              <div className="mb-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm flex items-center gap-3 font-semibold leading-relaxed animate-pulse">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>⚠️ Trial expires in {trialDaysRemaining} days. Upgrade now to continue watching.</span>
              </div>
            )}

            <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-red-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600/10 text-red-500 border border-red-500/20">
                    🎉 Trial Active
                  </span>
                  <h3 className="text-2xl font-black text-white">{trialDaysRemaining} Days Remaining</h3>
                  <p className="text-sm text-gray-400 font-light max-w-lg">
                    Enjoy unlimited streaming during your free trial. Access will end on <span className="text-white font-medium">{trialEndDate}</span> unless you select a plan.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/customer/subscription")}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-600/20 active:scale-98 cursor-pointer shrink-0"
                >
                  View Plans
                </button>
              </div>
            </div>
          </div>
        );
      }
      case "ACTIVE":
        return (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-green-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-600/10 text-green-500 border border-green-500/20">
                  ⭐ Premium Active
                </span>
                <h3 className="text-2xl font-black text-white">{planName} Subscription</h3>
                <p className="text-sm text-gray-400 font-light max-w-lg">
                  Your billing cycle is current. The next renewal payment of <span className="text-white font-medium">${price}</span> is scheduled for <span className="text-white font-medium">{renewalDate}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/customer/subscription")}
                className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm border border-white/10 transition-all active:scale-98 cursor-pointer shrink-0"
              >
                Manage Subscription
              </button>
            </div>
          </div>
        );
      case "EXPIRED":
        return (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-700/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-gray-400 border border-zinc-700">
                  ⚠️ Trial Expired
                </span>
                <h3 className="text-2xl font-black text-white">Choose a Plan</h3>
                <p className="text-sm text-gray-400 font-light max-w-lg">
                  Your free trial has expired. Subscribe to one of our premium tiers to resume unlimited 4K streaming access immediately.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/customer/subscription")}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-600/20 active:scale-98 cursor-pointer shrink-0"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        );
      case "PAST_DUE":
        return (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-yellow-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-600/10 text-yellow-500 border border-yellow-500/20">
                  💳 Payment Required
                </span>
                <h3 className="text-2xl font-black text-white">Renewal Action Required</h3>
                <p className="text-sm text-gray-400 font-light max-w-lg">
                  We encountered an error processing your renewal fee. Please verify your payment details to prevent subscription suspension.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/customer/billing")}
                className="px-6 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-black font-black rounded-xl text-sm transition-all shadow-md active:scale-98 cursor-pointer shrink-0"
              >
                Complete Payment
              </button>
            </div>
          </div>
        );
      case "CANCELLED":
        return (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-red-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600/10 text-red-500 border border-red-500/20">
                  🚫 Cancelled
                </span>
                <h3 className="text-2xl font-black text-white">Subscription Cancelled</h3>
                <p className="text-sm text-gray-400 font-light max-w-lg">
                  You will lose viewing access to the premium library catalog at the end of the current billing cycle. Renew to keep watching.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/customer/subscription")}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-600/20 active:scale-98 cursor-pointer shrink-0"
              >
                Renew Subscription
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <div className="w-full">{renderCardContent()}</div>;
}
