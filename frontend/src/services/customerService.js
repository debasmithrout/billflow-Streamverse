// src/services/customerService.js
import axios from 'axios';
import { mapDbPlanToCustomerPlan } from '../utils/planMapper';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Global axios interceptor for forced logout on 401 for protected routes
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("[API STATUS]", error.response?.status);
    console.log("[API URL]", error.config?.url);

    if (error.response && error.response.status === 401) {
      const url = error.config.url || "";
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("current_user");
        window.location.href = "/login?reason=deleted";
      }
    }
    return Promise.reject(error);
  }
);

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const getAuthHeader = getHeaders;

// Helper to check and pull active user details from auth state
const getAuthUser = () => {
  const userStr = localStorage.getItem("current_user");
  return userStr ? JSON.parse(userStr) : null;
};

// Initialize default customer dashboard state if none exists in localStorage
export const initializeCustomerDemoData = () => {
  const authUser = getAuthUser();
  const userId = authUser?.id || "guest";

  const profileKey = `cineverse_profile_${userId}`;
  const subKey = `cineverse_sub_${userId}`;
  const paymentKey = `cineverse_payment_${userId}`;
  const notificationsKey = `cineverse_notifications_${userId}`;

  // Check if profile exists, if not initialize
  if (!localStorage.getItem(profileKey)) {
    const defaultProfile = {
      id: userId,
      name: authUser?.name || "Debasmith",
      email: authUser?.email || "debasmith@example.com",
      phone_number: authUser?.phone_number || "+1 (555) 123-4567",
      country: authUser?.country || "United States",
      address: authUser?.address || "123 Streaming Ave, California, CA 90025",
      memberSince: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      avatarUrl: null
    };
    localStorage.setItem(profileKey, JSON.stringify(defaultProfile));
  }

  // Check if subscription exists, if not initialize (TRIAL state)
  const existingSubStr = localStorage.getItem(subKey);
  let shouldInitSub = !existingSubStr;

  if (existingSubStr) {
    try {
      const parsed = JSON.parse(existingSubStr);
      // Legacy Cache Recovery Rules
      if (parsed.planName === "None" || parsed.planName === "Free Premium Trial" || !parsed.plan_id) {
        shouldInitSub = true;
      }
    } catch {
      shouldInitSub = true;
    }
  }

  if (shouldInitSub) {
    const defaultSub = {
      id: `sub_${userId}`,
      plan_id: 5,
      planName: "Free Trial",
      price: 0,
      status: "TRIAL", // TRIAL, ACTIVE, EXPIRED, PAST_DUE, CANCELLED
      billingCycle: "Monthly",
      renewalDate: null,
      trialDaysRemaining: 7,
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
      isTrial: true
    };
    localStorage.setItem(subKey, JSON.stringify(defaultSub));
  }



  // Check if payment method exists
  if (!localStorage.getItem(paymentKey)) {
    const defaultPayment = {
      cardType: "Visa",
      last4: "4242",
      expiryDate: "12/28",
      billingEmail: authUser?.email || "debasmith@example.com"
    };
    localStorage.setItem(paymentKey, JSON.stringify(defaultPayment));
  }

  // Check if notifications exist
  if (!localStorage.getItem(notificationsKey)) {
    const defaultNotifications = [
      {
        id: "notif_1",
        title: "Welcome to StreamVerse!",
        message: "Your premium video streaming profile has been successfully created. Explore top streaming titles today.",
        date: new Date().toLocaleDateString(),
        read: false
      },
      {
        id: "notif_2",
        title: "Your 7-Day Free Trial Started",
        message: "You have full access to high quality videos until your trial period concludes.",
        date: new Date().toLocaleDateString(),
        read: false
      }
    ];
    localStorage.setItem(notificationsKey, JSON.stringify(defaultNotifications));
  }
};

// Data access utility helpers
const getData = (keySuffix) => {
  const authUser = getAuthUser();
  const userId = authUser?.id || "guest";
  const data = localStorage.getItem(`cineverse_${keySuffix}_${userId}`);
  return data ? JSON.parse(data) : null;
};

const setData = (keySuffix, value) => {
  const authUser = getAuthUser();
  const userId = authUser?.id || "guest";
  localStorage.setItem(`cineverse_${keySuffix}_${userId}`, JSON.stringify(value));
};

// API Mock Methods returning Promises to simulate backend network requests
export const getCustomerProfile = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      initializeCustomerDemoData();
      resolve(getData("profile"));
    }, 500);
  });
};

export const updateCustomerProfile = async (profileData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const current = getData("profile");
      const updated = { ...current, ...profileData };
      setData("profile", updated);

      // Also update localStorage current_user to sync names
      const authUser = getAuthUser();
      if (authUser) {
        localStorage.setItem("current_user", JSON.stringify({
          ...authUser,
          name: updated.name,
          email: updated.email,
          country: updated.country,
          phone_number: updated.phone_number,
          address: updated.address
        }));
      }

      resolve(updated);
    }, 500);
  });
};



// Map backend DB subscription structure to UI layout signature
const mapDbSubToCustomerSub = (sub, plansList = []) => {
  if (!sub) return null;
  const plan = plansList.find(p => p.id === sub.plan_id);
  if (!plan) return null;

  let renewalDateStr = null;
  if (sub.activated_at && sub.status !== "CANCELLED") {
    const actDate = new Date(sub.activated_at);
    const renewal = new Date(actDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    renewalDateStr = renewal.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  let trialDaysRemaining = 0;
  let trialEndDateStr = null;
  if (sub.status === "TRIAL" && sub.trial_started_at) {
    const start = new Date(sub.trial_started_at);
    const trialDays = plan.trial_period_days || 7;
    const end = new Date(start.getTime() + trialDays * 24 * 60 * 60 * 1000);
    trialEndDateStr = end.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const diffTime = end.getTime() - Date.now();
    trialDaysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  const user = JSON.parse(localStorage.getItem("current_user") || "{}");
  const currencyCode = user?.currency_code || "INR";

  let subPrice = plan.price;
  let subCurrency = currencyCode;

  if (plan.prices && plan.prices.length > 0) {
    const regPrice = plan.prices.find(p => p.currency_code === currencyCode && p.is_active !== false);
    if (regPrice) {
      subPrice = regPrice.price;
    } else {
      const defPrice = plan.prices.find(p => p.is_default && p.is_active !== false);
      if (defPrice) {
        subPrice = defPrice.price;
        subCurrency = defPrice.currency_code;
      }
    }
  }

  return {
    id: sub.id,
    plan_id: sub.plan_id,
    planName: plan.name,
    price: subPrice,
    currency_code: subCurrency,
    status: sub.status,
    billingCycle: plan.billingCycle,
    renewalDate: renewalDateStr,
    cancelledAt: sub.cancelled_at ? new Date(sub.cancelled_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : null,
    trialDaysRemaining: trialDaysRemaining,
    trialEndDate: trialEndDateStr,
    isTrial: sub.status === "TRIAL",
    pending_payment_id: sub.pending_payment_id,
    pending_invoice_id: sub.pending_invoice_id
  };
};

export const getAvailablePlans = async () => {
  const response = await axios.get(`${API_URL}/plans/`, getHeaders());
  const plans = response.data.filter(p => !p.is_archived);
  return plans.map(mapDbPlanToCustomerPlan);
};

export const getSubscription = async () => {
  try {
    const response = await axios.get(`${API_URL}/subscriptions/`, getHeaders());
    const subscriptions = response.data;
    if (subscriptions && subscriptions.length > 0) {
      const plansList = await getAvailablePlans();

      // Sort by ID descending to get the most recent subscriptions first
      const sortedSubs = [...subscriptions].sort((a, b) => b.id - a.id);

      const sub = sortedSubs.find(s =>
        s.status === "ACTIVE" ||
        s.status === "PAUSED" ||
        s.status === "TRIAL" ||
        s.status === "PENDING_ACTIVATION" ||
        s.status === "CANCEL_AT_PERIOD_END" ||
        s.status === "PAST_DUE"
      );

      if (sub) {
        const subMapped = mapDbSubToCustomerSub(sub, plansList);
        if (subMapped) {
          return subMapped;
        }
      }
    }
  } catch (err) {
    console.error("Failed to fetch customer subscription from backend:", err);
  }

  return null;
};

// Change plans (Upgrade / Downgrade) or purchase a new one if none active
export const changeSubscriptionPlan = async (planId) => {
  const subRes = await axios.get(`${API_URL}/subscriptions/`, getHeaders());
  const subscriptions = subRes.data;

  const activeSub = subscriptions.find(s =>
    s.status === "ACTIVE" ||
    s.status === "PAUSED" ||
    s.status === "TRIAL" ||
    s.status === "PENDING_ACTIVATION" ||
    s.status === "CANCEL_AT_PERIOD_END" ||
    s.status === "PAST_DUE"
  );

  if (activeSub) {
    const response = await axios.patch(
      `${API_URL}/subscriptions/${activeSub.id}/change-plan`,
      { new_plan_id: parseInt(planId, 10) },
      getHeaders()
    );
    const plansList = await getAvailablePlans();
    return mapDbSubToCustomerSub(response.data, plansList);
  } else {
    const authUser = getAuthUser();
    const customerId = authUser ? authUser.id : null;
    if (!customerId) {
      throw new Error("User session not found.");
    }

    const response = await axios.post(
      `${API_URL}/subscriptions/`,
      {
        customer_id: customerId,
        plan_id: parseInt(planId, 10)
      },
      getHeaders()
    );
    const plansList = await getAvailablePlans();
    return mapDbSubToCustomerSub(response.data, plansList);
  }
};

// Fetch proration preview from backend before switching plans
export const getProrationPreview = async (planId) => {
  const authUser = getAuthUser();
  const customerId = authUser ? authUser.id : null;
  if (!customerId) {
    throw new Error("User session not found.");
  }
  const response = await axios.post(
    `${API_URL}/subscriptions/calculate-proration`,
    {
      customer_id: customerId,
      target_plan_id: parseInt(planId, 10)
    },
    getHeaders()
  );
  return response.data;
};

// Cancel active subscription
export const cancelSubscription = async () => {
  const subRes = await axios.get(`${API_URL}/subscriptions/`, getHeaders());
  const subscriptions = subRes.data;

  if (subscriptions && subscriptions.length > 0) {
    const sortedSubs = [...subscriptions].sort((a, b) => b.id - a.id);
    const activeSub = sortedSubs.find(s =>
      s.status === "ACTIVE" ||
      s.status === "PAUSED" ||
      s.status === "TRIAL" ||
      s.status === "PENDING_ACTIVATION" ||
      s.status === "PAST_DUE"
    );

    if (activeSub) {
      const response = await axios.patch(
        `${API_URL}/subscriptions/${activeSub.id}/cancel`,
        { immediate: true },
        getHeaders()
      );
      const plansList = await getAvailablePlans();
      return mapDbSubToCustomerSub(response.data, plansList);
    }
  }

  throw new Error("No active subscription found to cancel.");
};

export const cancelSubscriptionAtPeriodEnd = async () => {
  const subRes = await axios.get(`${API_URL}/subscriptions/`, getHeaders());
  const subscriptions = subRes.data;

  if (subscriptions && subscriptions.length > 0) {
    const sortedSubs = [...subscriptions].sort((a, b) => b.id - a.id);
    const activeSub = sortedSubs.find(s =>
      s.status === "ACTIVE" ||
      s.status === "PAUSED" ||
      s.status === "TRIAL" ||
      s.status === "PENDING_ACTIVATION" ||
      s.status === "PAST_DUE"
    );

    if (activeSub) {
      const response = await axios.patch(
        `${API_URL}/subscriptions/${activeSub.id}/cancel-at-period-end`,
        {},
        getHeaders()
      );
      const plansList = await getAvailablePlans();
      return mapDbSubToCustomerSub(response.data, plansList);
    }
  }

  throw new Error("No active subscription found to cancel.");
};


export const getInvoices = async () => {
  try {
    const response = await axios.get(`${API_URL}/customers/me/invoices`, getHeaders());
    const invoices = response.data;

    // Sort invoices newest first (generated_at DESC)
    const sorted = [...invoices].sort((a, b) => new Date(b.generated_at) - new Date(a.generated_at));

    return sorted.map(i => {
      return {
        id: i.id,
        invoiceNumber: i.invoice_number,
        invoiceType: i.invoice_type || "RENEWAL",
        pricingModel: i.pricing_model || "LEGACY",
        planName: i.plan_name || "StreamVerse Plan",
        date: i.generated_at ? new Date(i.generated_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "",
        dueDate: i.due_date ? new Date(i.due_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "",
        baseAmount: (i.base_amount !== undefined && i.base_amount !== null) ? i.base_amount.toFixed(2) : "0.00",
        gstPercentage: i.tax_percentage !== undefined ? i.tax_percentage : (i.gst_percentage !== undefined ? i.gst_percentage : 0),
        gstAmount: (i.tax_amount !== undefined && i.tax_amount !== null) ? i.tax_amount.toFixed(2) : ((i.gst_amount !== undefined && i.gst_amount !== null) ? i.gst_amount.toFixed(2) : "0.00"),
        totalAmount: (i.total_amount !== undefined && i.total_amount !== null) ? i.total_amount.toFixed(2) : "0.00",
        amount: i.amount,
        previousPlanName: i.previous_plan_name,
        previousPlanPrice: i.previous_plan_price,
        newPlanName: i.new_plan_name,
        newPlanPrice: i.new_plan_price,
        upgradeDifference: i.upgrade_difference,
        prorationCredit: i.proration_credit || 0.0,
        prorationDebit: i.proration_debit || 0.0,
        currencyCode: i.currency_code || "INR",
        taxName: i.tax_name || "",
        taxPercentage: i.tax_percentage !== undefined ? i.tax_percentage : 0,
        taxAmount: (i.tax_amount !== undefined && i.tax_amount !== null) ? i.tax_amount.toFixed(2) : "0.00",
        status: i.status.toUpperCase(),
        paymentId: i.payment_id || null,
        paymentMethod: i.payment_method_name || null,
        isRefundable: i.is_refundable || false,
        refundEligibleUntil: i.refund_eligible_until || null,
        retryStatus: i.retry_status || null,
        retryAttempt: i.retry_attempt || null,
        maxAttempts: i.max_attempts || null,
        nextRetryDate: i.next_retry_date || null,
        lastRetryDate: i.last_retry_date || null,
        failureReason: i.failure_reason || null
      };
    });
  } catch (err) {
    console.error("Failed to fetch customer invoices:", err);
    return [];
  }
};

export const getPaymentMethod = async () => {
  try {
    const res = await axios.get(`${API_URL}/payment-methods/default`, getHeaders());
    return res.data;
  } catch (err) {
    console.error("Failed to fetch default payment method:", err);
    return null;
  }
};

export const getPaymentMethods = async () => {
  try {
    const res = await axios.get(`${API_URL}/payment-methods/`, getHeaders());
    return res.data || [];
  } catch (err) {
    console.error("Failed to fetch payment methods list:", err);
    return [];
  }
};

export const createPaymentMethod = async (data) => {
  const res = await axios.post(`${API_URL}/payment-methods/`, data, getHeaders());
  return res.data;
};

export const updatePaymentMethod = async (id, data) => {
  const res = await axios.put(`${API_URL}/payment-methods/${id}`, data, getHeaders());
  return res.data;
};

export const setDefaultPaymentMethod = async (id) => {
  const res = await axios.post(`${API_URL}/payment-methods/${id}/set-default`, {}, getHeaders());
  return res.data;
};

export const deletePaymentMethod = async (id) => {
  const res = await axios.delete(`${API_URL}/payment-methods/${id}`, getHeaders());
  return res.data;
};

export const completeMockPayment = async (paymentId, result, paymentMethodId = null) => {
  const payload = {
    payment_id: paymentId,
    result: result,
    payment_method_id: paymentMethodId
  };
  console.log("[PAYMENT REQUEST]", payload);
  const res = await axios.post(
    `${API_URL}/payments/mock/complete`,
    payload,
    getHeaders()
  );
  console.log("[PAYMENT RESPONSE]", res.data);
  return res.data;
};

export const retryCustomerPayment = async (retryId, result = "SUCCESS") => {
  const response = await axios.post(
    `${API_URL}/customers/me/retries/${retryId}/retry`,
    { result },
    getHeaders()
  );
  return response.data;
};

export const getCustomerRetryByPayment = async (paymentId) => {
  const response = await axios.get(
    `${API_URL}/customers/me/retries/by-payment/${paymentId}`,
    getHeaders()
  );
  return response.data;
};

export const getPaymentSummary = async () => {
  try {
    const res = await axios.get(`${API_URL}/payment-methods/summary`, getHeaders());
    return res.data;
  } catch (err) {
    console.error("Failed to fetch payment summary:", err);
    return {
      total_spent: 0,
      total_payments_count: 0,
      attributed_amount: 0,
      unattributed_amount: 0,
      category_breakdown: { card: 0, upi: 0, netbanking: 0, wallet: 0 }
    };
  }
};

export const getNotifications = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      initializeCustomerDemoData();
      resolve(getData("notifications"));
    }, 300);
  });
};

export const markNotificationsAsRead = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const notifications = getData("notifications") || [];
      const updated = notifications.map(n => ({ ...n, read: true }));
      setData("notifications", updated);
      resolve(updated);
    }, 200);
  });
};

export const downloadInvoice = async (invoiceId) => {
  try {
    const response = await axios.get(`${API_URL}/customers/me/invoices/${invoiceId}/pdf`, {
      ...getHeaders(),
      responseType: "blob"
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `StreamVerse-INV-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return { success: true };
  } catch (err) {
    console.error("Failed to download PDF invoice from backend:", err);
    throw err;
  }
};

// OTT Content Row Stubs
export const getFeaturedContent = async () => {
  return new Promise((resolve) => {
    resolve({
      title: "Infinite Horizons",
      description: "Start streaming our latest sci-fi mystery original today. A stranded astronaut discovers a quantum rift in deep orbit, setting off a chain reaction that threatens Earth's timeline.",
      category: "Sci-Fi • Thriller • Drama",
      badge: "StreamVerse Original",
      gradient: "from-red-950/60 via-zinc-900 to-black"
    });
  });
};

export const getContinueWatching = async () => {
  return new Promise((resolve) => {
    resolve([
      { title: "Infinite Horizons", category: "Sci-Fi • Thriller", badge: "4K", gradient: "from-rose-900 via-rose-950 to-zinc-950", progress: 65 },
      { title: "Dark Nebula", category: "Action • Adventure", badge: "HD", gradient: "from-purple-900 via-zinc-950 to-black", progress: 20 },
      { title: "Stranger Billing", category: "Fantasy • Horror", badge: "HD", gradient: "from-red-950 via-zinc-950 to-black", progress: 85 }
    ]);
  });
};

export const getTrendingMovies = async () => {
  return new Promise((resolve) => {
    resolve([
      { title: "The Invoicing Code", category: "Mystery • Drama", badge: "4K", gradient: "from-blue-900 via-zinc-950 to-zinc-900" },
      { title: "Venture Cycles", category: "Documentary", badge: "HD", gradient: "from-amber-900 via-zinc-950 to-black" },
      { title: "Infinite Horizons", category: "Sci-Fi • Thriller", badge: "4K", gradient: "from-rose-900 via-rose-950 to-zinc-950" },
      { title: "Breaking Ledger", category: "Crime • Suspense", badge: "4K", gradient: "from-green-900 via-zinc-950 to-zinc-900" }
    ]);
  });
};

export const getPopularShows = async () => {
  return new Promise((resolve) => {
    resolve([
      { title: "Stranger Billing", category: "Fantasy • Horror", badge: "HD", gradient: "from-red-950 via-zinc-950 to-black" },
      { title: "Dark Nebula", category: "Action • Adventure", badge: "HD", gradient: "from-purple-900 via-zinc-950 to-black" },
      { title: "Breaking Ledger", category: "Crime • Suspense", badge: "4K", gradient: "from-green-900 via-zinc-950 to-zinc-900" },
      { title: "The Invoicing Code", category: "Mystery • Drama", badge: "4K", gradient: "from-blue-900 via-zinc-950 to-zinc-900" }
    ]);
  });
};

export const getRecommended = async () => {
  return new Promise((resolve) => {
    resolve([
      { title: "Venture Cycles", category: "Documentary", badge: "HD", gradient: "from-amber-900 via-zinc-950 to-black" },
      { title: "Breaking Ledger", category: "Crime • Suspense", badge: "4K", gradient: "from-green-900 via-zinc-950 to-zinc-900" },
      { title: "Infinite Horizons", category: "Sci-Fi • Thriller", badge: "4K", gradient: "from-rose-900 via-rose-950 to-zinc-950" },
      { title: "Dark Nebula", category: "Action • Adventure", badge: "HD", gradient: "from-purple-900 via-zinc-950 to-black" }
    ]);
  });
};

export const getRecentlyAdded = async () => {
  return new Promise((resolve) => {
    resolve([
      { title: "The Invoicing Code", category: "Mystery • Drama", badge: "4K", gradient: "from-blue-900 via-zinc-950 to-zinc-900" },
      { title: "Stranger Billing", category: "Fantasy • Horror", badge: "HD", gradient: "from-red-950 via-zinc-950 to-black" },
      { title: "Venture Cycles", category: "Documentary", badge: "HD", gradient: "from-amber-900 via-zinc-950 to-black" },
      { title: "Infinite Horizons", category: "Sci-Fi • Thriller", badge: "4K", gradient: "from-rose-900 via-rose-950 to-zinc-950" }
    ]);
  });
};

export const deleteOwnAccount = async () => {
  const response = await axios.delete(`${API_URL}/customers/me`, getHeaders());
  return response.data;
};

export const requestRefund = async (paymentId, amount, reason) => {
  const response = await axios.post(
    `${API_URL}/refunds/request`,
    {
      payment_id: parseInt(paymentId, 10),
      amount: parseFloat(amount),
      reason: reason
    },
    getHeaders()
  );
  return response.data;
};

export const getMyRefunds = async () => {
  try {
    const response = await axios.get(`${API_URL}/refunds/my-refunds`, getHeaders());
    return response.data;
  } catch (err) {
    console.error("Failed to fetch customer refunds:", err);
    return [];
  }
};
