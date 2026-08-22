import { useEffect, useState, useRef } from "react";
import { getAvailablePlans, changeSubscriptionPlan, cancelSubscription, cancelSubscriptionAtPeriodEnd, getInvoices, getProrationPreview } from "../../services/customerService";
import { getCurrencySymbol, formatCurrency } from "../../utils/currencyFormatter";
import CurrentSubscriptionCard from "../../components/customer/Subscription/CurrentSubscriptionCard";
import PlanComparisonCard from "../../components/customer/Subscription/PlanComparisonCard";
import CheckoutModal from "../../components/customer/Billing/CheckoutModal";
import { SubscriptionSkeleton } from "../../components/customer/Shared/SkeletonLoader";
import { useSubscription } from "../../context/SubscriptionContext";
import useModal from "../../hooks/useModal";
import useToast from "../../hooks/useToast";

// ─── Plan Benefits Matrix ─────────────────────────────────────
const PLAN_BENEFITS = [
  { icon: "🎬", label: "Unlimited Movies & TV Shows", plans: ["basic", "standard", "premium", "family"] },
  { icon: "📺", label: "Watch on Mobile & Tablet",    plans: ["basic", "standard", "premium", "family"] },
  { icon: "💻", label: "Watch on PC & Smart TV",      plans: ["standard", "premium", "family"] },
  { icon: "👥", label: "Multiple Screens at Once",    plans: ["standard", "premium", "family"] },
  { icon: "⬇️", label: "Download for Offline",        plans: ["standard", "premium", "family"] },
  { icon: "🎬", label: "4K Ultra HD + Dolby Vision",  plans: ["premium", "family"] },
  { icon: "🔊", label: "Dolby Atmos Audio",           plans: ["premium", "family"] },
  { icon: "👨‍👩‍👧‍👦", label: "Family Plan (5 Profiles)",   plans: ["family"] },
];

function PlanBenefits() {
  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold text-white mb-4">Plan Benefits</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PLAN_BENEFITS.slice(0, 4).map((b, i) => (
          <div key={i} className="sv-glass rounded-2xl p-4 flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{b.icon}</span>
            <p className="text-xs text-white/70 leading-relaxed">{b.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cancellation Banner ──────────────────────────────────────
function CancellationBanner({ subscription }) {
  return (
    <div
      className="flex items-start gap-3.5 rounded-2xl p-4 mb-6 animate-fade-in"
      style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}
    >
      <span className="text-amber-400 mt-0.5">⚠️</span>
      <div>
        <p className="text-xs font-bold text-white">Subscription Scheduled for Cancellation</p>
        <p className="text-[11px] text-amber-200/60 mt-0.5 leading-relaxed">
          Your subscription will remain active until {subscription?.renewalDate || "end of billing period"}. No future renewals will occur.
        </p>
      </div>
    </div>
  );
}

// ─── Subscription Hero Card ───────────────────────────────────
function SubscriptionHero({ subscription, onUpgradeClick }) {
  const plan   = subscription ? subscription.planName?.replace(/\s*[Pp]lan\s*/g, "").trim() : "No Active";
  const status = subscription ? (subscription.status || "").toUpperCase() : "UNSUBSCRIBED";
  const isTrial    = status === "TRIAL";
  const isActive   = ["ACTIVE", "CANCEL_AT_PERIOD_END"].includes(status);
  const isCancelled= ["CANCELLED", "EXPIRED", "UNSUBSCRIBED"].includes(status);

  return (
    <div className="relative rounded-3xl overflow-hidden mb-8 p-6 sm:p-8"
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(109,40,217,0.08), rgba(236,72,153,0.06))",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)", transform: "translate(40%, -40%)" }} />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✦</span>
            <h2 className="text-xl font-black text-white">{plan} Plan</h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`sv-badge ${isTrial ? "sv-badge-amber" : isActive ? "sv-badge-green" : "sv-badge-red"}`}>
              {status.replace(/_/g, " ")}
            </span>
            {subscription?.renewalDate && (
              <span className="text-xs text-white/50">
                {isCancelled ? "Expired" : "Renews"} · {subscription.renewalDate}
              </span>
            )}
            {subscription?.price != null && (
              <span className="text-xs text-purple-300 font-bold">
                {formatCurrency(subscription.price, subscription.currency_code)}/month
              </span>
            )}
          </div>
          {isTrial && subscription?.trialDaysRemaining != null && (
            <p className="text-xs text-amber-300/70 mt-2">
              ⏱ {subscription.trialDaysRemaining} days remaining in free trial
            </p>
          )}
        </div>

        {(isTrial || isCancelled) && (
          <button
            onClick={onUpgradeClick}
            className="sv-btn-primary text-sm px-6 py-3 flex-shrink-0"
          >
            ✦ Choose a Plan
          </button>
        )}
      </div>
    </div>
  );
}

export default function Subscription() {
  const { subscription, refreshSubscription } = useSubscription();
  const [plans, setPlans]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [updating, setUpdating]               = useState(false);
  const [highlightPlans, setHighlightPlans]   = useState(false);
  const highlightTimeoutRef = useRef(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentId, setPaymentId]                   = useState(null);
  const [paymentDetails, setPaymentDetails]         = useState(null);

  const { showConfirm } = useModal();
  const { showToast }   = useToast();

  useEffect(() => {
    return () => { if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current); };
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getAvailablePlans();
        setPlans(plansData);
      } catch (err) {
        console.error("Error loading plans:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePaymentComplete = async (status) => {
    setIsPaymentModalOpen(false);
    setUpdating(true);
    try {
      await refreshSubscription();
      window.dispatchEvent(new Event("billing_state_updated"));
      if (status === "SUCCESS")        showToast("Payment Successful! Subscription Activated.", "success");
      else if (status === "FAILED")    showToast("Payment Failed. No Changes Applied.", "error");
      else                             showToast("Payment Cancelled. No Changes Applied.", "info");
    } catch (err) {
      console.error("Refresh error after payment:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleSelectPlan = async (planId) => {
    const targetPlan  = plans.find((p) => p.id === planId);
    if (!targetPlan) return;

    const isTrial    = targetPlan.price === 0 || targetPlan.trial_period_days > 0;
    const isUpgrade  = subscription && subscription.price && (targetPlan.price > subscription.price);

    let prorationDetails = null;

    if (!isTrial && isUpgrade) {
      setUpdating(true);
      try {
        prorationDetails = await getProrationPreview(planId);
      } catch (err) {
        console.error("Failed to load proration preview:", err);
        showToast(err.response?.data?.detail || "Failed to load pricing preview. Please try again.", "error");
        return;
      } finally {
        setUpdating(false);
      }
    }

    showConfirm({
      title: isUpgrade ? `Upgrade to ${targetPlan.name} Plan` : `Change to ${targetPlan.name} Plan`,
      description: isUpgrade
        ? "You are about to upgrade your subscription."
        : `Are you sure you want to change to the ${targetPlan.name} plan?`,
      variant: isUpgrade ? "upgrade" : (targetPlan.price < subscription?.price ? "downgrade" : "warning"),
      confirmText: isUpgrade ? "Continue to Payment" : "Confirm Plan Change",
      cancelText: "Cancel",
      details: prorationDetails ? {
        currentPlan: subscription?.planName || "None",
        newPlan: targetPlan.name,
        totalAmount: prorationDetails.total_payable,
        gstAmount: prorationDetails.gst,
        currencyCode: prorationDetails.currency_code,
        currencySymbol: prorationDetails.currency_symbol,
        taxName: prorationDetails.tax_name,
        taxPercentage: prorationDetails.tax_percentage,
        taxAmount: prorationDetails.tax_amount,
        prorationCredit: prorationDetails.proration_credit,
        prorationDebit: prorationDetails.proration_debit,
        netProration: prorationDetails.net_proration,
        isProrated: true
      } : {
        currentPlan: subscription?.planName || "None",
        newPlan: targetPlan.name,
        totalAmount: targetPlan.price,
        gstAmount: 0,
        currencyCode: targetPlan.currency || "",
        currencySymbol: getCurrencySymbol(targetPlan.currency),
        taxName: "",
        taxPercentage: 0,
        taxAmount: 0,
        isProrated: false
      },
      onConfirm: async () => {
        try {
          setUpdating(true);
          const subRes = await changeSubscriptionPlan(planId);
          if (isTrial) {
            await refreshSubscription();
            showToast("Successfully activated your Free Trial!", "success");
          } else if (subRes && subRes.pending_payment_id) {
            let details = prorationDetails ? {
              planName: targetPlan.name,
              billingInterval: targetPlan.billing_interval || "Monthly",
              baseAmount: prorationDetails.proration_debit,
              prorationCredit: prorationDetails.proration_credit,
              prorationDebit: prorationDetails.proration_debit,
              netProration: prorationDetails.net_proration,
              gstPercentage: prorationDetails.tax_percentage,
              gstAmount: prorationDetails.tax_amount,
              totalAmount: prorationDetails.total_payable,
              currencyCode: prorationDetails.currency_code,
              currencySymbol: prorationDetails.currency_symbol,
              taxName: prorationDetails.tax_name,
              isProrated: true
            } : {
              planName: targetPlan.name,
              billingInterval: targetPlan.billing_interval || "Monthly",
              baseAmount: targetPlan.price,
              gstPercentage: 0,
              gstAmount: 0,
              totalAmount: targetPlan.price,
              currencyCode: targetPlan.currency || "",
              currencySymbol: getCurrencySymbol(targetPlan.currency),
              taxName: "",
              isProrated: false
            };
            try {
              const invoicesList = await getInvoices();
              const pendingInv = invoicesList.find(inv => inv.id === subRes.pending_invoice_id);
              if (pendingInv) {
                const subCharge = pendingInv.newPlanPrice !== null && pendingInv.newPlanPrice !== undefined ? pendingInv.newPlanPrice : parseFloat(pendingInv.amount);
                details = {
                  planName: targetPlan.name,
                  billingInterval: targetPlan.billing_interval || "Monthly",
                  baseAmount: parseFloat(subCharge),
                  prorationCredit: parseFloat(pendingInv.prorationCredit || 0),
                  prorationDebit: parseFloat(pendingInv.prorationDebit || 0),
                  netProration: parseFloat(pendingInv.baseAmount || 0),
                  gstPercentage: pendingInv.taxPercentage !== undefined ? pendingInv.taxPercentage : 18,
                  gstAmount: parseFloat(pendingInv.taxAmount || 0),
                  totalAmount: parseFloat(pendingInv.totalAmount || 0),
                  currencyCode: pendingInv.currencyCode,
                  currencySymbol: getCurrencySymbol(pendingInv.currencyCode),
                  taxName: pendingInv.taxName,
                  isProrated: true
                };
              }
            } catch (invErr) {
              console.error("Failed to retrieve pending invoice proration values:", invErr);
            }
            setPaymentId(subRes.pending_payment_id);
            setPaymentDetails(details);
            setIsPaymentModalOpen(true);
          } else {
            await refreshSubscription();
            showToast("Successfully updated your subscription plan.", "success");
          }
        } catch (err) {
          console.error("Plan change error:", err);
          showToast(err.response?.data?.detail || "Failed to change plan. Please try again.", "error");
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const handleCancelClick = () => {
    showConfirm({
      title: "Cancel Subscription",
      description: "Are you sure you want to cancel your subscription?",
      variant: "cancel",
      confirmText: "Confirm Cancellation",
      cancelText: "Keep Subscription",
      details: { renewalDate: subscription?.renewalDate },
      onConfirm: async (cancelOption) => {
        try {
          setUpdating(true);
          if (cancelOption === "PERIOD_END") {
            await cancelSubscriptionAtPeriodEnd();
            showToast("Subscription auto-renewal cancelled successfully.", "success");
          } else {
            await cancelSubscription();
            showToast("Subscription cancelled immediately.", "success");
          }
          await refreshSubscription();
          window.dispatchEvent(new Event("billing_state_updated"));
        } catch (err) {
          console.error("Cancel error:", err);
          showToast(err.response?.data?.detail || "Failed to cancel subscription.", "error");
        } finally {
          setUpdating(false);
        }
      },
    });
  };

  const scrollToPlans = () => {
    const section = document.getElementById("plan-selection-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setHighlightPlans(true);
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => setHighlightPlans(false), 3000);
    }
  };

  if (loading) return <SubscriptionSkeleton />;

  const isCancelled    = subscription?.status === "CANCELLED";
  const isExpired      = subscription?.status === "EXPIRED";
  const isPeriodEnd    = subscription?.status === "CANCEL_AT_PERIOD_END";
  const activePlanId   = (subscription && ["ACTIVE", "TRIAL", "PENDING_ACTIVATION", "CANCEL_AT_PERIOD_END", "PAUSED", "PAST_DUE"].includes(subscription.status)) ? subscription.plan_id : null;

  const orderedPlans = [...plans];
  if (activePlanId != null) {
    const idx = orderedPlans.findIndex((p) => Number(p.id) === Number(activePlanId));
    if (idx > -1) {
      const [active] = orderedPlans.splice(idx, 1);
      orderedPlans.unshift(active);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* ── Page Header ────────────────────────── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Subscription</h2>
          <p className="text-xs text-white/40 mt-0.5">Manage your StreamVerse streaming plan</p>
        </div>
        {!isCancelled && !isExpired && !isPeriodEnd && subscription?.planName && subscription.planName !== "None" && (
          <button
            type="button"
            onClick={handleCancelClick}
            className="sv-btn-danger text-xs px-4 py-2"
          >
            Cancel Subscription
          </button>
        )}
      </div>

      {/* ── Period End Banner ───────────────────── */}
      {isPeriodEnd && <CancellationBanner subscription={subscription} />}

      {/* ── Current Subscription Hero ──────────── */}
      <SubscriptionHero subscription={subscription} onUpgradeClick={scrollToPlans} />

      {/* ── Current Subscription Full Card ─────── */}
      {subscription && <CurrentSubscriptionCard subscription={subscription} />}

      {/* ── Payment Retry Warning Banner ────────────────── */}
      {subscription && (subscription.status === "PAST_DUE" || subscription.status === "past_due") && (
        <div
          className="rounded-2xl p-5 border border-red-500/20 bg-red-500/5 mt-4 space-y-3.5 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🚨</span>
            <div>
              <h4 className="text-sm font-bold text-white">Payment Failed & Retry Scheduled</h4>
              <p className="text-[11px] text-red-300/60 mt-0.5">
                We were unable to charge your payment method. An automated recovery attempt has been scheduled.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-white/5 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">Retry Status</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-amber-500/20 bg-amber-500/10 text-amber-400 mt-1 uppercase">
                Scheduled
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">Retry Attempt</span>
              <span className="text-white font-bold block mt-1">{subscription.retryAttempt || 1} / {subscription.maxAttempts || 3}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">Next Retry Time</span>
              <span className="text-zinc-300 font-mono block mt-1">
                {subscription.nextRetryDate ? new Date(subscription.nextRetryDate).toLocaleDateString() : "Next 24 hours"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-white/40 block">Failure Reason</span>
              <span className="text-red-400 block mt-1 truncate max-w-[150px] font-mono">
                {subscription.failureReason || "Card declined"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancelled Panel ────────────────────── */}
      {isCancelled && (
        <div className="sv-glass rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6 animate-fade-in">
          <div>
            <p className="text-sm font-bold text-white">Subscription Cancelled</p>
            <p className="text-xs text-white/40 mt-0.5 max-w-sm">
              Choose a new plan to start streaming your favorite movies and shows again.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={scrollToPlans} className="sv-btn-primary text-xs px-4 py-2">
              Subscribe Again
            </button>
          </div>
        </div>
      )}

      {/* ── Plan Selection ──────────────────────── */}
      <div
        id="plan-selection-section"
        className={`mt-10 transition-all duration-500 rounded-3xl p-1 ${
          highlightPlans ? "ring-2 ring-purple-500/30 bg-purple-500/5" : ""
        }`}
      >
        <div className="text-center mb-8">
          <h3 className="text-lg font-black text-white">Choose Your Plan</h3>
          {highlightPlans ? (
            <p className="text-xs text-purple-400 font-bold mt-1 animate-pulse">
              Select a plan below to continue streaming ↓
            </p>
          ) : (
            <p className="text-xs text-white/40 mt-1">
              Upgrade for 4K, multiple screens, and Dolby Audio.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {orderedPlans
            .filter((p) => p.show_trial !== false)
            .map((p) => (
              <PlanComparisonCard
                key={p.id}
                plan={p}
                activePlanId={activePlanId}
                currentPlanName={subscription?.planName || "None"}
                subscription={subscription}
                onSelectPlan={handleSelectPlan}
                isUpdating={updating}
              />
            ))}
        </div>
      </div>

      {/* ── Plan Benefits Section ───────────────── */}
      <PlanBenefits />

      {/* ── Checkout Modal ─────────────────────── */}
      <CheckoutModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentId={paymentId}
        paymentDetails={paymentDetails}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
