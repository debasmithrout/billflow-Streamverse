// src/pages/customer/Billing.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  getSubscription,
  getPaymentMethod,
  getInvoices,
  getPaymentSummary,
  getMyRefunds,
} from "../../services/customerService";
import CurrentPlanCard from "../../components/customer/Billing/CurrentPlanCard";
import PaymentMethodCard from "../../components/customer/Billing/PaymentMethodCard";
import LastPaymentCard from "../../components/customer/Billing/LastPaymentCard";
import PaymentSummary from "../../components/customer/Billing/PaymentSummary";
import InvoiceHistoryTable from "../../components/customer/Billing/InvoiceHistoryTable";
import RefundHistoryTable from "../../components/customer/Billing/RefundHistoryTable";
import UpgradeBanner from "../../components/customer/Billing/UpgradeBanner";
import ManagePaymentMethodsDrawer from "../../components/customer/Billing/ManagePaymentMethodsDrawer";
import { PageSkeleton } from "../../components/customer/Shared/SkeletonLoader";

// ─── Page header & quick action strip ────────────────────────
function BillingHeader({ onDownloadHistory }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Billing & Invoices</h2>
        <p className="text-xs text-white/40 mt-0.5">
          Manage payments, invoices, and subscription billing
        </p>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="/customer/subscription"
          className="sv-btn-ghost text-xs py-2 px-4"
        >
          Manage Plan
        </a>
        <button
          type="button"
          onClick={onDownloadHistory}
          className="sv-btn-primary text-xs py-2 px-4"
        >
          ⬇ Download History
        </button>
      </div>
    </div>
  );
}

export default function Billing() {
  const [subscription,   setSubscription]   = useState(null);
  const [paymentMethod,  setPaymentMethod]  = useState(null);
  const [invoices,       setInvoices]       = useState([]);
  const [paymentSummary, setPaymentSummary] = useState(null);
  const [refunds,        setRefunds]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [refundsLoading, setRefundsLoading] = useState(true);
  const [selectedInvoiceModal, setSelectedInvoiceModal] = useState(null);
  const [isManageDrawerOpen,   setIsManageDrawerOpen]   = useState(false);

  const fetchBillingDetails = async () => {
    try {
      const [subData, payData, invData, summaryData] = await Promise.all([
        getSubscription(),
        getPaymentMethod(),
        getInvoices(),
        getPaymentSummary(),
      ]);
      setSubscription(subData);
      setPaymentMethod(payData);
      setInvoices(invData || []);
      setPaymentSummary(summaryData);
    } catch (err) {
      console.error("Error loading billing details:", err);
    } finally {
      setLoading(false);
    }

    try {
      setRefundsLoading(true);
      const refundData = await getMyRefunds();
      setRefunds(refundData || []);
    } catch (err) {
      console.error("Refund history error:", err);
    } finally {
      setRefundsLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingDetails();
    window.addEventListener("billing_state_updated", fetchBillingDetails);
    return () => window.removeEventListener("billing_state_updated", fetchBillingDetails);
  }, []);

  if (loading) return <PageSkeleton />;

  const paidInvoices = invoices ? invoices.filter((i) => i.status === "PAID") : [];
  const lastInvoice  = paidInvoices.length > 0 ? paidInvoices[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-7xl pb-16"
    >
      {/* ── Page Header ────────────────────────── */}
      <BillingHeader onDownloadHistory={() => {}} />

      {/* ── Summary Cards ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <CurrentPlanCard subscription={subscription} />
        <PaymentMethodCard
          paymentMethod={paymentMethod}
          onManageMethods={() => setIsManageDrawerOpen(true)}
        />
        <LastPaymentCard
          lastInvoice={lastInvoice}
          onViewInvoice={(inv) => setSelectedInvoiceModal(inv)}
        />
      </div>

      {/* ── Payment Summary Analytics ──────────── */}
      <div className="mb-8">
        <PaymentSummary data={paymentSummary} />
      </div>

      {/* ── Invoice History ─────────────────────── */}
      <div className="mb-8">
        <InvoiceHistoryTable
          invoices={invoices}
          externalSelectedInvoice={selectedInvoiceModal}
          onClearSelectedInvoice={() => setSelectedInvoiceModal(null)}
          onRefresh={fetchBillingDetails}
        />
      </div>

      {/* ── Refund History ──────────────────────── */}
      <div className="mb-8">
        <RefundHistoryTable
          refunds={refunds}
          invoices={invoices}
          loading={refundsLoading}
        />
      </div>

      {/* ── Upgrade Banner ─────────────────────── */}
      <UpgradeBanner currentPlanName={subscription?.planName} />

      {/* ── Manage Payment Methods Drawer ─────── */}
      <ManagePaymentMethodsDrawer
        isOpen={isManageDrawerOpen}
        onClose={() => setIsManageDrawerOpen(false)}
        paymentMethod={paymentMethod}
      />
    </motion.div>
  );
}
