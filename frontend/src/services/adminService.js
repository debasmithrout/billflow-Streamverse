// src/services/adminService.js
import axios from 'axios';
import { formatCurrency } from '../utils/currencyFormatter';

const normalizeFeatures = (features) => {
  if (features === null || features === undefined) {
    return [];
  }
  if (Array.isArray(features)) {
    return features.map(item => String(item).trim()).filter(Boolean);
  }
  if (typeof features === 'string') {
    const val = features.trim();
    if (!val) {
      return [];
    }
    if (val.startsWith('[') && val.endsWith(']')) {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).trim()).filter(Boolean);
        }
      } catch (e) {
        // Ignore and fall through to split
      }
    }
    return val.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [String(features).trim()].filter(Boolean);
};

export const getPlans = async () => {
  const response = await axios.get(`${API_URL}/plans/`, getHeaders());
  const plans = response.data;
  const totalPlans = plans.length;
  const activePlans = plans.filter(p => !p.is_archived).length;
  const archivedPlans = plans.filter(p => p.is_archived).length;
  return {
    plans: plans.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      billing_interval: p.billing_interval === "Monthly" ? "month" : (p.billing_interval === "Annual" ? "year" : p.billing_interval),
      features: normalizeFeatures(p.features),
      trial_period_days: p.trial_period_days,
      isArchived: p.is_archived,
      prices: p.prices || []
    })),
    stats: {
      totalPlans,
      activePlans,
      archivedPlans
    }
  };
};

export const getPlanById = async (id) => {
  const response = await axios.get(`${API_URL}/plans/${id}`, getHeaders());
  const p = response.data;
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    billing_interval: p.billing_interval === "Monthly" ? "month" : (p.billing_interval === "Annual" ? "year" : p.billing_interval),
    features: normalizeFeatures(p.features),
    trial_period_days: p.trial_period_days,
    isArchived: p.is_archived,
    prices: p.prices || []
  };
};

export const createPlan = async (data) => {
  const response = await axios.post(`${API_URL}/plans/`, {
    name: data.name,
    description: data.description || "",
    price: parseFloat(data.price),
    billing_interval: data.billing_interval === "month" ? "Monthly" : (data.billing_interval === "year" ? "Annual" : data.billing_interval),
    features: Array.isArray(data.features) ? data.features.join(', ') : (data.features || ""),
    trial_period_days: parseInt(data.trial_period_days || 7, 10)
  }, getHeaders());
  return response.data;
};

export const updatePlan = async (id, data) => {
  const response = await axios.put(`${API_URL}/plans/${id}`, {
    name: data.name,
    description: data.description || "",
    price: parseFloat(data.price),
    billing_interval: data.billing_interval === "month" ? "Monthly" : (data.billing_interval === "year" ? "Annual" : data.billing_interval),
    features: Array.isArray(data.features) ? data.features.join(', ') : (data.features || ""),
    trial_period_days: parseInt(data.trial_period_days || 7, 10)
  }, getHeaders());
  return response.data;
};

export const archivePlan = async (id) => {
  const response = await axios.patch(`${API_URL}/plans/${id}/archive`, {}, getHeaders());
  return response.data;
};

export const restorePlan = async () => {
  throw new Error("Plan restoration is disabled in Milestone 1.");
};

// --- EXPORTED SUBSCRIPTIONS METHODS ---

const API_URL = import.meta.env.VITE_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

export const getCustomers = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.country) params.append("country", filters.country);
  if (filters.role) params.append("role", filters.role);
  if (filters.view) params.append("view", filters.view);
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await axios.get(`${API_URL}/admin/customers?${params.toString()}`, getHeaders());
  return response.data;
};

export const getCustomerById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/customers/${id}`, getHeaders());
  return response.data;
};

export const updateCustomer = async () => {
  throw new Error("Customer profile editing is disabled in Milestone 1.");
};

export const archiveCustomer = async () => {
  throw new Error("Customer archiving is disabled in Milestone 1.");
};

export const restoreCustomer = async () => {
  throw new Error("Customer restoration is disabled in Milestone 1.");
};

export const getBillingTimeline = async (customerId) => {
  const response = await axios.get(`${API_URL}/customers/${customerId}/timeline`, getHeaders());
  return response.data;
};

export const getSubscriptions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.plan) params.append("plan", filters.plan);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await axios.get(`${API_URL}/admin/subscriptions?${params.toString()}`, getHeaders());
  return response.data;
};

export const getSubscriptionById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/subscriptions/${id}`, getHeaders());
  return response.data;
};

export const updateSubscription = async () => {
  throw new Error("Subscription updating is disabled in Milestone 1.");
};

export const changeCustomerPlan = async () => {
  throw new Error("Subscription plans modification is disabled in Milestone 1.");
};

export const cancelSubscription = async () => {
  throw new Error("Subscription cancellation from admin is disabled in Milestone 1.");
};

export const pauseSubscription = async () => {
  throw new Error("Subscription pausing is disabled in Milestone 1.");
};

export const resumeSubscription = async () => {
  throw new Error("Subscription resuming is disabled in Milestone 1.");
};

export const getPayments = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.paymentMethod) params.append("paymentMethod", filters.paymentMethod);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await axios.get(`${API_URL}/admin/payments?${params.toString()}`, getHeaders());
  return response.data;
};

export const getPaymentById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/payments/${id}`, getHeaders());
  return response.data;
};

export const retryPayment = async (retryId, result = "SUCCESS") => {
  const response = await axios.post(
    `${API_URL}/admin/retries/${retryId}/retry`,
    { result },
    getHeaders()
  );
  return response.data;
};

export const getRetries = async () => {
  const response = await axios.get(`${API_URL}/admin/retries/`, getHeaders());
  return response.data;
};

export const getRetryById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/retries/${id}`, getHeaders());
  return response.data;
};

export const getRetryHistory = async () => {
  const response = await axios.get(`${API_URL}/admin/retries/history`, getHeaders());
  return response.data;
};

export const getRetryStats = async () => {
  const response = await axios.get(`${API_URL}/admin/retries/stats`, getHeaders());
  return response.data;
};


export const refundPayment = async () => {
  throw new Error("Payment refunds are disabled in Milestone 1.");
};

export const getInvoices = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await axios.get(`${API_URL}/admin/invoices?${params.toString()}`, getHeaders());
  return response.data;
};

export const getInvoiceById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/invoices/${id}`, getHeaders());
  return response.data;
};

export const downloadInvoice = async (id) => {
  return { success: true, fileName: `invoice-${id}.pdf` };
};

export const regenerateInvoice = async () => {
  throw new Error("Invoice regeneration is disabled in Milestone 1.");
};

export const getAnalytics = async () => {
  const response = await axios.get(`${API_URL}/admin/analytics`, getHeaders());
  return response.data;
};

export const getRevenueAnalytics = async () => {
  const response = await axios.get(`${API_URL}/admin/payments`, getHeaders());
  return response.data.payments;
};

export const getActionCenterStats = async () => {
  const response = await axios.get(`${API_URL}/admin/action-center-stats`, getHeaders());
  return response.data;
};


export const getCustomerAnalytics = async () => {
  const response = await axios.get(`${API_URL}/admin/customers`, getHeaders());
  return response.data.customers;
};

export const getSubscriptionAnalytics = async () => {
  const response = await axios.get(`${API_URL}/admin/subscriptions`, getHeaders());
  return response.data.subscriptions;
};

export const getRecentActivities = async () => {
  const response = await axios.get(`${API_URL}/admin/audit-logs?limit=6`, getHeaders());
  return response.data.logs.map(log => ({
    id: `act_${log.id}`,
    event: log.action,
    customer: log.user,
    timestamp: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just now"
  }));
};

export const getSystemStatus = async () => {
  return {
    api: "Online",
    database: "Connected",
    auth: "Active",
    payments: "Healthy",
    invoices: "Operational",
    lastSync: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" })
  };
};

export const getPlatformOverview = async () => {
  const token = localStorage.getItem("access_token");
  const response = await axios.get(`${API_URL}/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.platform_overview;
};

export const getTodaySummary = async () => {
  const token = localStorage.getItem("access_token");
  const response = await axios.get(`${API_URL}/admin/dashboard-stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.today_summary;
};

export const getAuditLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.module) params.append("module", filters.module);
  if (filters.severity) params.append("severity", filters.severity);
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  const response = await axios.get(`${API_URL}/admin/audit-logs?${params.toString()}`, getHeaders());
  const data = response.data;
  return {
    ...data,
    logs: (data.logs || []).map(log => ({
      id: log.id,
      action: log.action,
      module: log.module,
      description: log.message,
      performedBy: log.user,
      timestamp: log.timestamp,
      severity: log.severity
    }))
  };
};

export const clearAuditLogs = async () => {
  throw new Error("Audit log clearing is disabled in Milestone 1.");
};

export const getSettings = async () => {
  return {
    platformName: "BillFlow Portal",
    supportEmail: "support@billflow.com",
    maintenanceMode: false,
    allowRegistrations: true,
    defaultTrialDays: 7,
    invoiceTaxPercentage: 8,
    currency: "INR",
    timezone: "UTC-5 (EST)"
  };
};

export const updateSettings = async () => {
  throw new Error("Settings modification is disabled in Milestone 1.");
};

export const resetDefaultSettings = async () => {
  throw new Error("Settings resets are disabled in Milestone 1.");
};

export const getDashboardStats = async () => {
  const token = localStorage.getItem("access_token");
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/dashboard-stats`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = response.data;
  return [
    { id: "stat_cust", title: "Total Customers", value: data.total_customers.toLocaleString(), trend: "Live", isPositive: true, path: "/admin/customers" },
    { id: "stat_sub", title: "Active Subscriptions", value: data.active_subscriptions.toLocaleString(), trend: "Live", isPositive: true, path: "/admin/subscriptions" },
    { id: "stat_trials", title: "Trial Users", value: data.trial_users.toLocaleString(), trend: "Live", isPositive: true, path: "/admin/subscriptions" },
    { id: "stat_past_due", title: "Past Due Users", value: data.past_due_users.toLocaleString(), trend: "Live", isPositive: false, path: "/admin/subscriptions" },
    { id: "stat_cancelled", title: "Cancelled Subscriptions", value: data.cancelled_users.toLocaleString(), trend: "Live", isPositive: false, path: "/admin/subscriptions" },
    { id: "stat_monthly_rev", title: "Monthly Revenue", value: formatCurrency(data.monthly_revenue), trend: "Live", isPositive: true, path: "/admin/analytics" },
    { id: "stat_annual_rev", title: "Annual Revenue", value: formatCurrency(data.annual_revenue), trend: "Live", isPositive: true, path: "/admin/analytics" },
    { id: "stat_payments", title: "Total Payments", value: data.total_payments.toLocaleString(), trend: "Live", isPositive: true, path: "/admin/payments" },
    { id: "stat_failed_payments", title: "Failed Payments", value: data.failed_payments.toLocaleString(), trend: "Live", isPositive: false, path: "/admin/payments" },
    { id: "stat_invoices", title: "Total Invoices", value: data.total_invoices.toLocaleString(), trend: "Live", isPositive: true, path: "/admin/invoices" }
  ];
};

export const getRevenueOverview = async () => {
  const response = await axios.get(`${API_URL}/admin/analytics`, getHeaders());
  return response.data.revenueChart;
};

export const getSubscriptionOverview = async () => {
  const response = await axios.get(`${API_URL}/admin/analytics`, getHeaders());
  return response.data.planDistribution.map(p => ({
    tier: p.name,
    count: p.count
  }));
};

export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/admin/audit-logs?limit=5`, getHeaders());
  return response.data.logs.map(log => ({
    id: `notif_${log.id}`,
    title: log.action,
    message: log.message,
    date: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "Just now",
    read: false
  }));
};

export const markNotificationsAsRead = async () => {
  return [];
};

export const getAdminRefunds = async () => {
  const response = await axios.get(`${API_URL}/admin/refunds`, getHeaders());
  return response.data;
};

export const approveRefund = async (refundId, adminNotes = "") => {
  const response = await axios.post(
    `${API_URL}/admin/refunds/${refundId}/approve`,
    { admin_notes: adminNotes },
    getHeaders()
  );
  return response.data;
};

export const rejectRefund = async (refundId, adminNotes) => {
  const response = await axios.post(
    `${API_URL}/admin/refunds/${refundId}/reject`,
    { admin_notes: adminNotes },
    getHeaders()
  );
  return response.data;
};

export const addPlanPrice = async (planId, priceData) => {
  const response = await axios.post(`${API_URL}/plans/${planId}/prices`, priceData, getHeaders());
  return response.data;
};

export const updatePlanPrice = async (priceId, priceData) => {
  const response = await axios.put(`${API_URL}/plans/prices/${priceId}`, priceData, getHeaders());
  return response.data;
};

export const deletePlanPrice = async (priceId) => {
  const response = await axios.delete(`${API_URL}/plans/prices/${priceId}`, getHeaders());
  return response.data;
};

// --- TAX RULES API ---
export const getTaxes = async (activeOnly = false) => {
  const response = await axios.get(`${API_URL}/admin/taxes/?active_only=${activeOnly}`, getHeaders());
  return response.data;
};

export const getTaxById = async (id) => {
  const response = await axios.get(`${API_URL}/admin/taxes/${id}`, getHeaders());
  return response.data;
};

export const createTax = async (data) => {
  const response = await axios.post(`${API_URL}/admin/taxes/`, data, getHeaders());
  return response.data;
};

export const updateTax = async (id, data) => {
  const response = await axios.put(`${API_URL}/admin/taxes/${id}`, data, getHeaders());
  return response.data;
};

export const deleteTax = async (id) => {
  const response = await axios.delete(`${API_URL}/admin/taxes/${id}`, getHeaders());
  return response.data;
};

export const getTaxesSummary = async () => {
  const response = await axios.get(`${API_URL}/admin/taxes/summary`, getHeaders());
  return response.data;
};

export const getTaxesReport = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  const response = await axios.get(`${API_URL}/admin/taxes/report?${params.toString()}`, getHeaders());
  return response.data;
};

// --- EXCHANGE RATES API ---
export const getExchangeRates = async () => {
  const response = await axios.get(`${API_URL}/admin/currency/rates`, getHeaders());
  return response.data;
};

export const syncExchangeRates = async () => {
  const response = await axios.post(`${API_URL}/admin/currency/sync`, {}, getHeaders());
  return response.data;
};

export const overrideExchangeRate = async (data) => {
  const response = await axios.post(`${API_URL}/admin/currency/override`, data, getHeaders());
  return response.data;
};

export const getTaxAnalytics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  const response = await axios.get(`${API_URL}/admin/taxes/analytics?${params.toString()}`, getHeaders());
  return response.data;
};


