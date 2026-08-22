// src/components/admin/Dashboard/OverviewChartCard.jsx
import { useEffect, useState } from "react";
import { getRevenueOverview, getSubscriptionOverview } from "../../../services/adminService";
import { formatCurrency } from "../../../utils/currencyFormatter";
import { TrendingUp, PieChart, Activity, Award, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminTheme } from "../../../context/AdminThemeContext";

// Helper to draw SVG smooth path (Catmull-Rom or cubic approximation)
function generateSmoothPath(points, width, height) {
  if (points.length === 0) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const svgPoints = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((p - min) / range) * (height - 16) - 8;
    return { x, y };
  });

  let d = `M ${svgPoints[0].x} ${svgPoints[0].y}`;
  for (let i = 0; i < svgPoints.length - 1; i++) {
    const curr = svgPoints[i];
    const next = svgPoints[i + 1];
    const cpX1 = curr.x + (next.x - curr.x) / 2;
    const cpY1 = curr.y;
    const cpX2 = curr.x + (next.x - curr.x) / 2;
    const cpY2 = next.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
  }
  return { pathD: d, points: svgPoints };
}

// ── Donut Chart Segment Generator ──
function DonutChart({ data, total, isLight }) {
  let accumulatedAngle = 0;
  const radius = 38;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="adm-donut-svg">
      <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={strokeWidth} />
      {data.map((item, idx) => {
        const percentage = total > 0 ? (item.count / total) : 0;
        const strokeLength = percentage * circumference;
        const strokeOffset = circumference - strokeLength + accumulatedAngle;
        accumulatedAngle -= strokeLength;

        return (
          <circle
            key={idx}
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke={item.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 55 55)"
            className="adm-donut-segment"
          />
        );
      })}
      {/* Center text directly inside SVG */}
      <text
        x="55"
        y="46"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isLight ? "#64748B" : "#9CA3AF"}
        fontSize="8"
        fontWeight="700"
        letterSpacing="0.05em"
      >
        TOTAL
      </text>
      <text
        x="55"
        y="66"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isLight ? "#0F172A" : "#FFFFFF"}
        fontSize="15"
        fontWeight="900"
      >
        {total.toLocaleString()}
      </text>
    </svg>
  );
}

export default function OverviewChartCard() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";
  const [revenue, setRevenue] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [timeFilter, setTimeFilter] = useState("30D");
  const [hoveredDot, setHoveredDot] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const [revData, subData] = await Promise.all([
          getRevenueOverview(),
          getSubscriptionOverview()
        ]);
        setRevenue(revData);
        setSubscriptions(subData);
      } catch (err) {
        console.error("Error loading chart summaries:", err);
      }
    };
    fetchChartData();
  }, []);

  const totalSubs = subscriptions.reduce((sum, s) => sum + s.count, 0);

  // Colors for donut and plan progress
  const COLORS = ["#8B5CF6", "#EC4899", "#F97316", "#06B6D4", "#22C55E", "#3B82F6"];
  const donutData = subscriptions.map((s, idx) => ({
    ...s,
    color: COLORS[idx % COLORS.length]
  }));

  // Simulate filter-based scaling of data points for demonstration interactivity
  const getFilterMultiplier = () => {
    if (timeFilter === "7D") return 0.25;
    if (timeFilter === "90D") return 2.8;
    if (timeFilter === "1Y") return 11.2;
    return 1.0;
  };

  const multiplier = getFilterMultiplier();
  const scaledRevenue = revenue.map(r => ({
    ...r,
    revenue: Math.round(r.revenue * multiplier)
  }));

  const maxVal = scaledRevenue.length > 0 ? Math.max(...scaledRevenue.map(r => r.revenue)) : 1;
  const rawPoints = scaledRevenue.map(r => r.revenue);
  const chartW = 460;
  const chartH = 140;
  const { pathD, points: svgPoints } = generateSmoothPath(rawPoints, chartW, chartH);
  const areaD = pathD ? `${pathD} L ${chartW} ${chartH} L 0 ${chartH} Z` : "";

  // Simulated growth line chart data
  const growthMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const growthPoints = [310, 480, 520, 780, 920, 1286].map(v => Math.round(v * (multiplier * 0.9 + 0.1)));
  const { pathD: growthPath, points: growthSvgPoints } = generateSmoothPath(growthPoints, chartW, chartH);
  const growthArea = growthPath ? `${growthPath} L ${chartW} ${chartH} L 0 ${chartH} Z` : "";

  return (
    <div className="space-y-8">
      {/* Row 1: Area Revenue Chart & Donut Subscriptions Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="adm-chart-card lg:col-span-2 relative flex flex-col justify-between overflow-hidden">
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
                  <TrendingUp size={15} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <h3 className="adm-section-title">Revenue Overview</h3>
                  <p className="adm-section-sub">Monthly earnings (INR)</p>
                </div>
              </div>

              {/* Time Filters */}
              <div className="flex items-center bg-[#09090B] border border-white/5 p-1 rounded-lg self-start sm:self-center">
                {["7D", "30D", "90D", "1Y"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTimeFilter(tab)}
                    className={`adm-filter-tab ${timeFilter === tab ? "active" : ""}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SVG Smooth Area Chart */}
          {scaledRevenue.length === 0 ? (
            <div className="h-[140px] flex items-center justify-center text-xs" style={{ color: "#334155" }}>
              Syncing revenue metrics...
            </div>
          ) : (
            <div className="relative pt-6 pb-2">
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none" style={{ top: "12px", bottom: "16px" }}>
                {[0, 25, 50, 75, 100].map(pct => (
                  <div
                    key={pct}
                    className="adm-chart-grid-line"
                    style={{ bottom: `${pct}%` }}
                  />
                ))}
              </div>

              {/* Interactive SVG Area */}
              <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
                <defs>
                  <linearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Fill Area */}
                {areaD && <path d={areaD} fill="url(#purpleAreaGrad)" />}
                {/* Stroke line */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Dot markers */}
                {svgPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredDot === i ? "5" : "3.5"}
                    fill="#09090B"
                    stroke="#8B5CF6"
                    strokeWidth={hoveredDot === i ? "3" : "2"}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredDot(i)}
                    onMouseLeave={() => setHoveredDot(null)}
                  />
                ))}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between mt-2 px-1 text-[10px] font-mono" style={{ color: "#334155" }}>
                {scaledRevenue.map((r, i) => (
                  <span key={i}>{r.month}</span>
                ))}
              </div>

              {/* Interactive Tooltip Card overlay */}
              <AnimatePresence>
                {hoveredDot !== null && scaledRevenue[hoveredDot] && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 5 }}
                    className="absolute bg-zinc-950/95 border border-white/10 rounded-xl p-2.5 shadow-2xl z-20"
                    style={{
                      left: `${(hoveredDot / (scaledRevenue.length - 1)) * 92 + 1}%`,
                      top: "-24px",
                      pointerEvents: "none"
                    }}
                  >
                    <p className="text-[10px] uppercase font-bold" style={{ color: "#475569" }}>
                      {scaledRevenue[hoveredDot].month}
                    </p>
                    <p className="text-xs font-black mt-0.5" style={{ color: "#F8FAFC" }}>
                      ₹{scaledRevenue[hoveredDot].revenue.toLocaleString()}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Subscription Donut Chart */}
        <div className="adm-chart-card adm-subscription-donut-card flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
              <PieChart size={15} style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <h3 className="adm-section-title">Subscription Growth</h3>
              <p className="adm-section-sub">Active tier split</p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", width: "100%", boxSizing: "border-box" }} className="py-2">
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              <DonutChart data={donutData} total={totalSubs} isLight={isLight} />
            </div>

            {/* Legends list */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
              {donutData.slice(0, 3).map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-[11px] font-semibold adm-donut-legend-label" style={{ color: "#CBD5E1" }}>
                      {item.tier}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-right flex-shrink-0 adm-donut-legend-value" style={{ color: "#475569" }}>
                    {item.count} ({totalSubs > 0 ? Math.round((item.count / totalSubs) * 100) : 0}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Growth Line Chart & Top Plans by Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Monthly Growth Line Chart */}
        <div className="adm-chart-card flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
              <Activity size={15} style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <h3 className="adm-section-title">Monthly Growth</h3>
              <p className="adm-section-sub">Active members timeline</p>
            </div>
          </div>

          <div className="relative pt-6 pb-2">
            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none" style={{ top: "12px", bottom: "16px" }}>
              {[0, 25, 50, 75, 100].map(pct => (
                <div
                  key={pct}
                  className="adm-chart-grid-line"
                  style={{ bottom: `${pct}%` }}
                />
              ))}
            </div>

            {/* Line SVG */}
            <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`} className="overflow-visible">
              <defs>
                <linearGradient id="pinkAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EC4899" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#EC4899" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {growthArea && <path d={growthArea} fill="url(#pinkAreaGrad)" />}
              {growthPath && (
                <path
                  d={growthPath}
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Dots */}
              {growthSvgPoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#09090B"
                  stroke="#EC4899"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Months */}
            <div className="flex justify-between mt-2 px-1 text-[10px] font-mono" style={{ color: "#334155" }}>
              {growthMonths.map((m, i) => (
                <span key={i}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Plans Distribution Progress */}
        <div className="adm-chart-card flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="adm-icon-purple-lg" style={{ width: "36px", height: "36px", borderRadius: "10px" }}>
              <Award size={15} style={{ color: "#8B5CF6" }} />
            </div>
            <div>
              <h3 className="adm-section-title">Top Plans by Revenue</h3>
              <p className="adm-section-sub">Popular package statistics</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {subscriptions.length === 0 ? (
              <div className="h-28 flex items-center justify-center text-xs" style={{ color: "#334155" }}>
                Analyzing plan configurations...
              </div>
            ) : (
              subscriptions.map((plan, idx) => {
                const pct = totalSubs > 0 ? (plan.count / totalSubs) * 100 : 0;
                const color = COLORS[idx % COLORS.length];

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold" style={{ color: "#CBD5E1" }}>{plan.tier}</span>
                      <span className="font-mono" style={{ color: "#475569" }}>
                        {plan.count} users ({pct.toFixed(0)}%)
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="adm-progress">
                      <div
                        className="adm-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${color}, ${color}99)`
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
export { DonutChart };
