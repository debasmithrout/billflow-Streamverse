// src/components/customer/Billing/CheckoutModal.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentMethodSelector from "./PaymentMethodSelector";
import PaymentCardDetailsForm from "./PaymentCardDetailsForm";
import UPIPaymentForm from "./UPIPaymentForm";
import NetBankingPaymentForm from "./NetBankingPaymentForm";
import WalletPaymentForm from "./WalletPaymentForm";
import ProcessingPaymentScreen from "./ProcessingPaymentScreen";
import PaymentSuccessScreen from "./PaymentSuccessScreen";
import PaymentFailureScreen from "./PaymentFailureScreen";
import ManagePaymentMethodsDrawer from "./ManagePaymentMethodsDrawer";
import { useNavigate } from "react-router-dom";
import useToast from "../../../hooks/useToast";
import {
  getPaymentMethods,
  createPaymentMethod,
  completeMockPayment,
  retryCustomerPayment,
  getCustomerRetryByPayment
} from "../../../services/customerService";

export default function CheckoutModal({
  isOpen,
  onClose,
  paymentId,
  paymentDetails,
  onPaymentComplete,
  onViewInvoice
}) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState("SELECT_METHOD"); // SELECT_METHOD, ENTER_DETAILS, PROCESSING, SUCCESS, FAILURE
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isManageDrawerOpen, setIsManageDrawerOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [abortInProgress, setAbortInProgress] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [devOutcome, setDevOutcome] = useState("SUCCESS");
  const [isDevSectionOpen, setIsDevSectionOpen] = useState(false);
  const [retryId, setRetryId] = useState(null);
  const devOutcomeRef = useRef(devOutcome);

  useEffect(() => {
    devOutcomeRef.current = devOutcome;
  }, [devOutcome]);

  const loadMethods = async () => {
    try {
      const data = await getPaymentMethods();
      setMethods(data || []);
      if (data && data.length > 0) {
        const def = data.find((m) => m.is_default) || data[0];
        setSelectedMethod({
          id: `saved_${def.id}`,
          rawMethod: def,
          name: def.display_name || `${(def.provider || "VISA").toUpperCase()} •••• ${def.last_four || "4242"}`,
          subtitle: def.method_type === "card" ? `Expires ${def.expiry_date || "12/28"}` : (def.upi_id || def.bank_name || "Saved Method"),
          type: def.method_type
        });
      }
    } catch (err) {
      console.error("Error loading payment methods for checkout:", err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep("SELECT_METHOD");
      loadMethods();
      setAbortInProgress(false);
      setPaymentCompleted(false);
      setDevOutcome("SUCCESS");
      setRetryId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isOpen && paymentId && !paymentCompleted && !abortInProgress) {
        e.preventDefault();
        e.returnValue = "Are you sure you want to exit? Your pending payment will be cancelled.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isOpen, paymentId, paymentCompleted, abortInProgress]);

  const handleCheckoutAbort = async () => {
    if (abortInProgress || paymentCompleted || !paymentId || step === "SUCCESS") {
      onClose();
      return;
    }

    try {
      setAbortInProgress(true);
      await completeMockPayment(paymentId, "CANCELLED", null);
      
      // Dispatch global billing and subscription state refresh events
      window.dispatchEvent(new Event("billing_state_updated"));
      window.dispatchEvent(new Event("subscription_state_updated"));
      
      onClose();
    } catch (err) {
      console.error("[Checkout Abort] Failed to cancel checkout session:", err);
      showToast("Failed to cancel checkout session. Please try again.", "error");
    } finally {
      setAbortInProgress(false);
    }
  };

  if (!isOpen) return null;

  const handlePayNow = async (formDetails = {}) => {
    setStep("PROCESSING");

    console.log("[Checkout Audit] Payment Execution Started:", {
      paymentId,
      selectedMethod: selectedMethod?.name || selectedMethod?.rawMethod?.display_name,
      paymentDetails,
      formDetails
    });

    // Continuous 1.5s ring animation loop before completing backend mock payment settlement
    setTimeout(async () => {
      try {
        let targetMethodId = selectedMethod?.rawMethod?.id || (typeof selectedMethod?.id === "number" ? selectedMethod.id : null);
        console.log("[CHECKOUT] selectedMethod", selectedMethod);

        // Create payment method BEFORE settlement if not already a saved method
        if (!targetMethodId) {
          const existingMethods = await getPaymentMethods();
          const isDefault = !existingMethods || existingMethods.length === 0;

          let pmPayload = null;
          const methodType = selectedMethod?.type || selectedMethod?.rawMethod?.method_type || selectedMethod?.id || "card";
          console.log("[CHECKOUT] methodType", methodType);
          const saveMethod = !!formDetails?.savePaymentMethod;

          if (methodType === "card") {
            const expParts = (formDetails.expiry || "12/28").split("/");
            pmPayload = {
              method_type: "card",
              provider: formDetails.cardType || "VISA",
              display_name: formDetails.cardHolder || "Card Holder",
              last_four: formDetails.cardNumber ? formDetails.cardNumber.replace(/\s+/g, "").slice(-4) : "4242",
              expiry_month: parseInt(expParts[0] || "12", 10),
              expiry_year: parseInt(`20${expParts[1] || "28"}`, 10),
              is_default: isDefault && saveMethod,
              is_active: saveMethod
            };
          } else if (methodType === "upi") {
            pmPayload = {
              method_type: "upi",
              provider: "UPI",
              display_name: formDetails.upiId || "UPI Address",
              upi_id: formDetails.upiId || "user@upi",
              is_default: isDefault && saveMethod,
              is_active: saveMethod
            };
          } else if (methodType === "netbanking") {
            pmPayload = {
              method_type: "netbanking",
              provider: formDetails.bankName || "HDFC Bank",
              display_name: `${formDetails.bankName || "Net Banking"} Account`,
              bank_name: formDetails.bankName || "HDFC Bank",
              is_default: isDefault && saveMethod,
              is_active: saveMethod
            };
          } else if (methodType === "wallet") {
            pmPayload = {
              method_type: "wallet",
              provider: formDetails.walletProvider || "Paytm",
              display_name: `${formDetails.walletProvider || "Paytm Wallet"} Account`,
              wallet_name: formDetails.walletProvider || "Paytm Wallet",
              is_default: isDefault && saveMethod,
              is_active: saveMethod
            };
          }

          console.log("[CHECKOUT] pmPayload", pmPayload);

          if (pmPayload) {
            console.log("[Checkout Audit] Creating payment method prior to settlement:", pmPayload);
            const newPm = await createPaymentMethod(pmPayload);
            console.log("[CHECKOUT] createdPaymentMethod", newPm);
            if (newPm && newPm.id) {
              targetMethodId = newPm.id;
            } else {
              throw new Error("Payment method creation failed: No ID returned from server.");
            }
          }
        }

        const currentOutcome = devOutcomeRef.current;
        console.log("[CHECKOUT] targetMethodId", targetMethodId);
        
        let res;
        let isSuccess = false;
        
        if (retryId) {
          console.log("[CHECKOUT] Retrying payment via retry customer endpoint:", {
            retryId,
            result: currentOutcome === "FAILURE" ? "FAILED" : currentOutcome
          });
          res = await retryCustomerPayment(retryId, currentOutcome === "FAILURE" ? "FAILED" : currentOutcome);
          isSuccess = res && res.retry_status === "SUCCESS";
        } else {
          console.log("[CHECKOUT] completeMockPayment", {
            paymentId,
            result: currentOutcome === "FAILURE" ? "FAILED" : currentOutcome,
            payment_method_id: targetMethodId
          });
          res = await completeMockPayment(paymentId, currentOutcome === "FAILURE" ? "FAILED" : currentOutcome, targetMethodId);
          isSuccess = res && res.status === "SUCCESS";
        }
        
        console.log("[Checkout Audit] Received API Response:", res);

        if (currentOutcome === "CANCELLED") {
          if (onPaymentComplete) onPaymentComplete("CANCELLED");
          onClose();
          return;
        }

        const fetchRetryIdHelper = async () => {
          try {
            const retryEntry = await getCustomerRetryByPayment(paymentId);
            if (retryEntry && retryEntry.id) {
              setRetryId(retryEntry.id);
            }
          } catch (fetchErr) {
            console.error("Failed to fetch retry ID for failed payment:", fetchErr);
          }
        };

        if (isSuccess) {
          setPaymentCompleted(true);
          // Dispatch global billing refresh event so Billing dashboard updates automatically
          window.dispatchEvent(new Event("billing_state_updated"));

          setReceiptData({
            transactionId: res.transaction_id || (res.payment && res.payment.transaction_id) || `TXN_${Date.now()}`,
            invoiceNumber: res.invoice_number || `INV-${Date.now()}`,
            amountPaid: res.amount || paymentDetails?.totalAmount || 352.82,
            planName: paymentDetails?.planName || "Premium Plan",
            currencySymbol: paymentDetails?.currencySymbol || "₹",
            currencyCode: paymentDetails?.currencyCode || "INR",
            paymentDate: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })
          });
          setStep("SUCCESS");
        } else {
          console.error("[Checkout Audit] Payment completion returned failure status:", res);
          setErrorDetails({ errorMessage: "Transaction declined by bank authorization server." });
          await fetchRetryIdHelper();
          setStep("FAILURE");
        }
      } catch (err) {
        console.error("[Checkout Audit] Payment execution exception:", err);
        const errMsg = err?.response?.data?.detail || err?.message || "Payment settlement failed.";
        setErrorDetails({ errorMessage: errMsg });
        
        // Try fetching retry entry even on request exceptions
        try {
          const retryEntry = await getCustomerRetryByPayment(paymentId);
          if (retryEntry && retryEntry.id) {
            setRetryId(retryEntry.id);
          }
        } catch (fetchErr) {
          console.error("Failed to fetch retry ID in catch block:", fetchErr);
        }
        
        setStep("FAILURE");
      }
    }, 1500);
  };

  const handleFailureClose = () => {
    if (onPaymentComplete) onPaymentComplete("FAILED");
    onClose();
  };

  const handleSuccessClose = () => {
    if (onPaymentComplete) onPaymentComplete("SUCCESS");
    onClose();
    navigate("/customer/billing");
  };

  // Helper to render dedicated payment type forms
  const renderPaymentTypeForm = () => {
    const type = selectedMethod?.type || selectedMethod?.rawMethod?.method_type || "card";

    if (type === "upi") {
      return (
        <UPIPaymentForm
          selectedMethod={selectedMethod}
          paymentDetails={paymentDetails}
          onPay={handlePayNow}
          onBack={() => setStep("SELECT_METHOD")}
        />
      );
    }

    if (type === "netbanking") {
      return (
        <NetBankingPaymentForm
          selectedMethod={selectedMethod}
          paymentDetails={paymentDetails}
          onPay={handlePayNow}
          onBack={() => setStep("SELECT_METHOD")}
        />
      );
    }

    if (type === "wallet") {
      return (
        <WalletPaymentForm
          selectedMethod={selectedMethod}
          paymentDetails={paymentDetails}
          onPay={handlePayNow}
          onBack={() => setStep("SELECT_METHOD")}
        />
      );
    }

    // Default: Dedicated Card Form with 3D Flip Animation
    return (
      <PaymentCardDetailsForm
        selectedMethod={selectedMethod}
        paymentDetails={paymentDetails}
        onPay={handlePayNow}
        onBack={() => setStep("SELECT_METHOD")}
      />
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 240, damping: 28 }}
          className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-5xl min-h-[600px] md:min-h-[680px] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden flex flex-col justify-between"
        >
          {/* Header Bar */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse shadow-lg shadow-red-600/50" />
              <h3 className="text-xl font-black text-white tracking-tight">
                StreamVerse Premium Checkout
              </h3>
            </div>
            {step !== "PROCESSING" && (
              <button
                type="button"
                onClick={handleCheckoutAbort}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                title="Close Checkout"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cinematic Step Transition Views */}
          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {step === "SELECT_METHOD" && (
                <motion.div
                  key="select_method"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentMethodSelector
                    methods={methods}
                    selectedMethod={selectedMethod}
                    onSelectMethod={(m) => setSelectedMethod(m)}
                    onContinue={() => setStep("ENTER_DETAILS")}
                    onOpenAddDrawer={() => setIsManageDrawerOpen(true)}
                  />
                </motion.div>
              )}

              {step === "ENTER_DETAILS" && (
                <motion.div
                  key="enter_details"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderPaymentTypeForm()}
                </motion.div>
              )}

              {step === "PROCESSING" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProcessingPaymentScreen selectedMethod={selectedMethod} />
                </motion.div>
              )}

              {step === "SUCCESS" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                >
                  <PaymentSuccessScreen
                    receiptData={receiptData}
                    onGoToBilling={handleSuccessClose}
                    onViewInvoice={onViewInvoice}
                  />
                </motion.div>
              )}

              {step === "FAILURE" && (
                <motion.div
                  key="failure"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaymentFailureScreen
                    errorDetails={errorDetails}
                    selectedMethod={selectedMethod}
                    paymentDetails={paymentDetails}
                    onRetry={handlePayNow}
                    onChangeMethod={() => setStep("SELECT_METHOD")}
                    onClose={handleFailureClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Collapsible Developer Testing Section */}
          {import.meta.env.VITE_DEV_MODE === "true" && (
            <div className="mt-6 border-t border-dashed border-red-500/30 pt-4 text-left select-none">
              <button
                type="button"
                onClick={() => setIsDevSectionOpen(!isDevSectionOpen)}
                className="flex items-center justify-between w-full text-xs font-bold text-red-400 hover:text-red-300 transition-colors focus:outline-none"
              >
                <span className="flex items-center gap-1">🛠 Developer Testing Simulator</span>
                <span>{isDevSectionOpen ? "▲ Collapse" : "▼ Expand"}</span>
              </button>
              
              {isDevSectionOpen && (
                <div className="mt-3 bg-red-500/5 border border-red-500/10 rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Simulated Payment Outcome</span>
                  <div className="flex items-center gap-6 text-xs">
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="devOutcome"
                        value="SUCCESS"
                        checked={devOutcome === "SUCCESS"}
                        onChange={() => setDevOutcome("SUCCESS")}
                        className="accent-red-650"
                      />
                      <span>Success (SUCCESS)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="devOutcome"
                        value="FAILURE"
                        checked={devOutcome === "FAILURE"}
                        onChange={() => setDevOutcome("FAILURE")}
                        className="accent-red-650"
                      />
                      <span>Failure (FAILED)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                      <input
                        type="radio"
                        name="devOutcome"
                        value="CANCELLED"
                        checked={devOutcome === "CANCELLED"}
                        onChange={() => setDevOutcome("CANCELLED")}
                        className="accent-red-650"
                      />
                      <span>Cancelled (CANCELLED)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>

      {/* Payment Methods Drawer Integration */}
      <ManagePaymentMethodsDrawer
        isOpen={isManageDrawerOpen}
        onClose={() => {
          setIsManageDrawerOpen(false);
          loadMethods();
        }}
        paymentMethod={selectedMethod?.rawMethod}
      />
    </AnimatePresence>
  );
}
