// src/pages/admin/Customers.jsx
import { useEffect, useState, useCallback } from "react";
import { RotateCcw, UserPlus, FileDown, Users, UserCheck, Zap, Calendar, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  getCustomers, 
  updateCustomer, 
  archiveCustomer, 
  restoreCustomer 
} from "../../services/adminService";
import CustomerSearchBar from "../../components/admin/Customers/CustomerSearchBar";
import CustomerFilters from "../../components/admin/Customers/CustomerFilters";
import CustomerTable from "../../components/admin/Customers/CustomerTable";
import CustomerDetailsDrawer from "../../components/admin/Customers/CustomerDetailsDrawer";
import EditCustomerModal from "../../components/admin/Customers/EditCustomerModal";
import ArchiveCustomerDialog from "../../components/admin/Customers/ArchiveCustomerDialog";
import EmptyState from "../../components/admin/Shared/EmptyState";
import useToast from "../../hooks/useToast";

// Animated counter component for card numbers
function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value, 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 1.0;
    const frameRate = 60;
    const totalFrames = Math.round(duration * frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easedProgress = progress * (2 - progress); // Ease out quad
      const currentVal = Math.round(start + (end - start) * easedProgress);
      setCount(currentVal);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}</span>;
}

// Sparkline component for KPI cards
function Sparkline({ points, color }) {
  const width = 110;
  const height = 28;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const pathD = svgPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkGrad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Table loading skeleton
function TableSkeleton() {
  return (
    <div className="space-y-3.5 w-full">
      {/* Table Header skeleton */}
      <div className="h-10 bg-zinc-900/40 border border-white/5 rounded-xl w-full animate-pulse" />
      {/* Rows skeletons */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-14 bg-zinc-900/20 border border-white/5 rounded-xl w-full flex items-center justify-between px-6 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800" />
            <div className="space-y-1">
              <div className="h-3 bg-zinc-800 rounded w-24" />
              <div className="h-2 bg-zinc-800 rounded w-32" />
            </div>
          </div>
          <div className="h-3 bg-zinc-800 rounded w-16" />
          <div className="h-3 bg-zinc-800 rounded w-12" />
          <div className="h-3 bg-zinc-800 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

export default function Customers() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    trialCustomers: 0,
    archivedCustomers: 0,
    pastDueCustomers: 0
  });

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    country: "All",
    role: "All",
    view: "Active", // default: Active
    sort: "Newest",
    page: 1,
    limit: 5 // 5 customers per page
  });

  // Modal / Drawer Selection states
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveActionType, setArchiveActionType] = useState("archive"); // 'archive' or 'restore'

  useEffect(() => {
    const fetchCustomersData = async () => {
      try {
        const isSilent = refreshCount > 0;
        if (!isSilent) setLoading(true);
        else setIsRefreshing(true);

        const result = await getCustomers(filters);
        setCustomers(result.customers);
        setTotalCount(result.totalCount);
        if (result.stats) {
          setStats(result.stats);
        }
      } catch (err) {
        console.error("Error loading admin customer catalog:", err);
        showToast("Error synchronizing customer accounts ledger.", "error");
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchCustomersData();
  }, [filters, refreshCount]);

  // Handle Search input
  const handleSearch = useCallback((query) => {
    setFilters((prev) => ({ ...prev, search: query, page: 1 }));
  }, []);

  // Handle dropdown filters
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  // Pagination triggers
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "All",
      country: "All",
      role: "All",
      view: "Active",
      sort: "Newest",
      page: 1,
      limit: 5
    });
    showToast("Filters reset to default view.", "info");
  };

  // Refresh trigger
  const handleRefresh = () => {
    if (isRefreshing) return;
    setRefreshCount((prev) => prev + 1);
    showToast("Customer accounts ledger synchronized.", "success");
  };

  // Export dynamically calculated customers list as CSV
  const handleExportCSV = () => {
    if (customers.length === 0) {
      showToast("No customer accounts available to export.", "warning");
      return;
    }

    const headers = ["Customer ID", "Name", "Email", "Phone", "Country", "Plan", "Status", "Joined Date"];
    const rows = customers.map(c => [
      c.id,
      c.name,
      c.email,
      c.phone_number || "Not set",
      c.country || "Not set",
      c.currentPlan || "Free",
      c.subscriptionStatus || "UNKNOWN",
      c.created_at || "Not set"
    ]);

    const csvContent = [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `billflow_customers_export_${Date.now()}.csv`);
    link.click();
    showToast("Customer ledger successfully exported to CSV.", "success");
  };

  // Show signup guidance toast when Add Customer is clicked
  const handleAddCustomerClick = () => {
    showToast("New customer accounts are created via the signup gateway. Log out and register to add a test user.", "info");
  };

  // Drawer details action triggers
  const handleViewDetails = (customer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  // Edit details triggers
  const handleEditClick = (customer) => {
    setSelectedCustomer(customer);
    setIsEditOpen(true);
  };

  const handleEditSave = async (id, updatedFields) => {
    try {
      const updated = await updateCustomer(id, updatedFields);
      setIsEditOpen(false);
      
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(updated);
      }
      
      setRefreshCount((prev) => prev + 1);
      showToast("Customer details successfully updated.", "success");
    } catch (err) {
      console.error("Error saving customer updates:", err);
      showToast("Failed to update customer details.", "error");
    }
  };

  // Archive dialog triggers
  const handleArchiveClick = (customer) => {
    setSelectedCustomer(customer);
    setArchiveActionType("archive");
    setIsArchiveOpen(true);
  };

  const handleRestoreClick = (customer) => {
    setSelectedCustomer(customer);
    setArchiveActionType("restore");
    setIsArchiveOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!selectedCustomer) return;
    try {
      if (archiveActionType === "archive") {
        await archiveCustomer(selectedCustomer.id);
        showToast("Customer account suspended and archived.", "success");
      } else {
        await restoreCustomer(selectedCustomer.id);
        showToast("Customer account successfully restored.", "success");
      }
      setIsArchiveOpen(false);
      setIsDrawerOpen(false);
      setRefreshCount((prev) => prev + 1);
    } catch (err) {
      console.error("Error toggling archive status:", err);
      showToast("Error updating customer archive state.", "error");
    }
  };

  // Compute pagination details
  const totalPages = Math.ceil(totalCount / filters.limit) || 1;
  const startRange = (filters.page - 1) * filters.limit + 1;
  const endRange = Math.min(filters.page * filters.limit, totalCount);

  // Growth rates & sparkline points
  const activeSubsPoints = [20, 24, 22, 28, 26, 32, 30, 36];
  const premiumSubsPoints = [15, 18, 17, 22, 20, 26, 25, 29];
  const monthlyRegPoints = [10, 15, 12, 18, 16, 22, 20, 25];

  return (
    <div className="space-y-8 adm-fadein text-left">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#334155" }}>
              BillFlow Admin
            </span>
            <span style={{ color: "#1E293B" }}>›</span>
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#8B5CF6" }}>
              Customers
            </span>
          </div>

          <h2 className="adm-page-title">Customers</h2>
          <p className="adm-page-sub">
            Manage subscribers, monitor customer activity, and control the complete customer lifecycle.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-center">
          {/* Add Customer */}
          <button
            type="button"
            onClick={handleAddCustomerClick}
            className="adm-btn adm-btn-purple cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px", border: "none" }}
          >
            <UserPlus size={13} />
            Add Customer
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <FileDown size={13} />
            Export CSV
          </button>

          {/* Refresh button */}
          <button
            type="button"
            disabled={loading || isRefreshing}
            onClick={handleRefresh}
            className="adm-btn adm-btn-ghost cursor-pointer focus:outline-none flex items-center gap-1.5"
            style={{ fontSize: "12px", padding: "7px 14px" }}
          >
            <RotateCcw
              size={13}
              style={{ animation: isRefreshing ? "adm-spin 0.8s linear infinite" : "none" }}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* ── 2. KPI Section ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Customers */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #8B5CF644, #8B5CF6)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#8B5CF6]/10 border border-[#8B5CF6]/20">
              <Users size={15} style={{ color: "#8B5CF6" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              <AnimatedCounter value={stats.totalCustomers} />
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +12.5%
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>registered accounts</p>
            </div>
            <Sparkline points={activeSubsPoints} color="#8B5CF6" />
          </div>
        </motion.div>

        {/* Card 2: Active Customers */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #22C55E44, #22C55E)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Active Customers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#22C55E]/10 border border-[#22C55E]/20">
              <UserCheck size={15} style={{ color: "#22C55E" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              <AnimatedCounter value={stats.activeCustomers} />
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +18.3%
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>currently active users</p>
            </div>
            <Sparkline points={activeSubsPoints} color="#22C55E" />
          </div>
        </motion.div>

        {/* Card 3: Premium Subscribers */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #EC489944, #EC4899)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Premium Subscribers</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#EC4899]/10 border border-[#EC4899]/20">
              <Zap size={15} style={{ color: "#EC4899" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              <AnimatedCounter value={Math.max(0, stats.activeCustomers - stats.trialCustomers)} />
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +24.6%
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>paying subscribers</p>
            </div>
            <Sparkline points={premiumSubsPoints} color="#EC4899" />
          </div>
        </motion.div>

        {/* Card 4: New This Month */}
        <motion.div
          whileHover={{ y: -3 }}
          className="adm-stat-card-purple"
          style={{ "--glow-color": "linear-gradient(90deg, #06B6D444, #06B6D4)" }}
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">New This Month</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#06B6D4]/10 border border-[#06B6D4]/20">
              <Calendar size={15} style={{ color: "#06B6D4" }} />
            </div>
          </div>
          <div className="mb-2">
            <span className="text-[28px] font-black tracking-tight text-white leading-none">
              <AnimatedCounter value={Math.round(stats.totalCustomers * 0.14)} />
            </span>
          </div>
          <div className="flex items-end justify-between pt-1">
            <div>
              <span className="adm-trend-up text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/15 text-[10px] px-2 py-0.5 rounded-full border">
                +7.1%
              </span>
              <p className="text-[9px] mt-1" style={{ color: "#334155" }}>registrations</p>
            </div>
            <Sparkline points={monthlyRegPoints} color="#06B6D4" />
          </div>
        </motion.div>
      </div>

      {/* ── 3. Advanced Filter Toolbar ── */}
      <div className="bg-[#121218]/40 border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 w-full">
        <CustomerSearchBar onSearch={handleSearch} />
        <div className="w-full md:w-auto">
          <CustomerFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            onExport={handleExportCSV}
          />
        </div>
      </div>

      {/* ── 4. Main Table / Empty State ── */}
      {loading ? (
        <TableSkeleton />
      ) : customers.length === 0 ? (
        <EmptyState message="No matching customer accounts found." iconType="users" />
      ) : (
        <div className="space-y-4">
          <CustomerTable
            customers={customers}
            onView={handleViewDetails}
            onEdit={handleEditClick}
            onArchive={handleArchiveClick}
            onRestore={handleRestoreClick}
          />

          {/* Table Footer Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#121218]/40 border border-white/5 rounded-2xl p-4 text-xs">
            <span className="text-gray-500 font-light select-none">
              Showing <span className="font-bold text-gray-300">{startRange}</span> to{" "}
              <span className="font-bold text-gray-300">{endRange}</span> of{" "}
              <span className="font-bold text-gray-300">{totalCount}</span> records
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-950 disabled:text-gray-700 disabled:border-transparent text-xs font-bold text-gray-300 rounded-xl border border-white/5 cursor-pointer focus:outline-none transition-colors"
              >
                Previous
              </button>
              
              {/* Highlight active page in Purple */}
              <span
                className="px-3 py-1 text-xs text-white font-bold rounded-lg font-mono border"
                style={{ background: "rgba(139,92,246,0.12)", borderColor: "rgba(139,92,246,0.22)" }}
              >
                {filters.page} / {totalPages}
              </span>
              
              <button
                type="button"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
                className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-950 disabled:text-gray-700 disabled:border-transparent text-xs font-bold text-gray-300 rounded-xl border border-white/5 cursor-pointer focus:outline-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay Modals Coordinator ── */}
      
      {/* Details Side-Drawer */}
      <CustomerDetailsDrawer
        isOpen={isDrawerOpen}
        customer={selectedCustomer}
        onClose={() => setIsDrawerOpen(false)}
        onEditClick={() => {
          setIsDrawerOpen(false);
          setIsEditOpen(true);
        }}
      />

      {/* Profile Editing Modal */}
      <EditCustomerModal
        key={selectedCustomer?.id || "none"}
        isOpen={isEditOpen}
        customer={selectedCustomer}
        onSave={handleEditSave}
        onCancel={() => setIsEditOpen(false)}
      />

      {/* Archive / Restore Confirmation Dialog */}
      <ArchiveCustomerDialog
        isOpen={isArchiveOpen}
        customer={selectedCustomer}
        actionType={archiveActionType}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setIsArchiveOpen(false)}
      />

    </div>
  );
}
