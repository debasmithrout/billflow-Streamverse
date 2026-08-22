// src/components/admin/Analytics/AnalyticsSummaryCard.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, Users, Sparkles,
  BarChart2, ShieldCheck, RefreshCw, UserCheck, Activity
} from "lucide-react";
import { formatCurrency } from "../../../utils/currencyFormatter";

function Sparkline({ points, color }) {
  const w = 100, h = 26;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const pts = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / range) * (h - 4) - 2
  }));
  const pathD = pts.reduce((a, p, i) => i === 0 ? `M${p.x} ${p.y}` : `${a} L${p.x} ${p.y}`, "");
  const areaD = `${pathD} L${w} ${h} L0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible select-none pointer-events-none">
      <defs>
        <linearGradient id={`sg-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace("#","")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {pts.length > 0 && <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5" fill={color} />}
    </svg>
  );
}

function AnimatedCounter({ value }) {
  const str = typeof value === "string" ? value : String(value);
  const isCurrency = str.includes("₹");
  const isPercent = str.includes("%");
  const num = parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (num === 0) { setCount(0); return; }
    const frames = 60, dur = 1.0;
    let frame = 0;
    const t = setInterval(() => {
      frame++;
      const prog = frame / frames;
      setCount(num * prog * (2 - prog)); // ease-out
      if (frame >= frames) { clearInterval(t); setCount(num); }
    }, (dur * 1000) / frames);
    return () => clearInterval(t);
  }, [num]);

  if (isCurrency) return <span>₹{Math.round(count).toLocaleString()}</span>;
  if (isPercent)  return <span>{count.toFixed(1)}%</span>;
  return <span>{Math.round(count).toLocaleString()}</span>;
}

export default function AnalyticsSummaryCard({ stats, dashboardStats }) {
  const ds = dashboardStats || {};

  // Extract MRR / ARR from dashboardStats array
  const mrrStat = ds.find ? ds.find(s => s.id === "stat_monthly_rev") : null;
  const arrStat = ds.find ? ds.find(s => s.id === "stat_annual_rev") : null;
  const activeSubs = ds.find ? ds.find(s => s.id === "stat_sub") : null;
  const failedPay  = ds.find ? ds.find(s => s.id === "stat_failed_payments") : null;

  const totalPayments = ds.find ? (ds.find(s => s.id === "stat_payments") || {}) : {};
  const failed = ds.find ? parseInt((failedPay?.value || "0").replace(/,/g, ""), 10) : 0;
  const total  = ds.find ? parseInt((totalPayments?.value || "1").replace(/,/g, ""), 10) : 1;
  const successRate = total > 0 ? (((total - failed) / total) * 100).toFixed(1) : "100.0";

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalRevenue || 0),
      desc: "All successful payments",
      theme: "#8B5CF6",
      icon: DollarSign,
      points: [40, 52, 48, 65, 60, 78, 72, 90],
      trend: "+24.6%",
      isPositive: true
    },
    {
      title: "MRR",
      value: mrrStat?.value || formatCurrency(stats?.totalRevenue || 0),
      desc: "Monthly Recurring Revenue",
      theme: "#10B981",
      icon: TrendingUp,
      points: [55, 60, 58, 70, 65, 80, 78, 88],
      trend: "+18.3%",
      isPositive: true
    },
    {
      title: "ARR",
      value: arrStat?.value || formatCurrency((stats?.totalRevenue || 0) * 12),
      desc: "Annual Recurring Revenue",
      theme: "#3B82F6",
      icon: BarChart2,
      points: [50, 55, 53, 68, 62, 75, 72, 85],
      trend: "+18.3%",
      isPositive: true
    },
    {
      title: "Active Subscribers",
      value: String(activeSubs?.value || stats?.activeCount || 0),
      desc: "Currently streaming users",
      theme: "#F59E0B",
      icon: Users,
      points: [30, 38, 35, 48, 45, 58, 55, 68],
      trend: "+15.2%",
      isPositive: true
    },
    {
      title: "New Customers",
      value: String(stats?.customersCount || 0),
      desc: "Excluding archived accounts",
      theme: "#06B6D4",
      icon: UserCheck,
      points: [20, 28, 25, 35, 30, 42, 38, 50],
      trend: "+9.4%",
      isPositive: true
    },
    {
      title: "Trial Users",
      value: String(stats?.trialCount || 0),
      desc: "Nudging to paid tiers",
      theme: "#EF4444",
      icon: Activity,
      points: [8, 12, 10, 15, 13, 18, 16, 20],
      trend: "Live",
      isPositive: false
    },
    {
      title: "Trial Conversion",
      value: stats?.trialCount > 0 ? `${(((stats?.activeCount || 0) / (stats?.trialCount + (stats?.activeCount || 1))) * 100).toFixed(1)}%` : "0.0%",
      desc: "Trials converted to paid",
      theme: "#10B981",
      icon: ShieldCheck,
      points: [65, 68, 70, 72, 75, 78, 80, 82],
      trend: "+5.1%",
      isPositive: true
    },
    {
      title: "Payment Success Rate",
      value: `${successRate}%`,
      desc: "Successful vs failed charges",
      theme: "#8B5CF6",
      icon: ShieldCheck,
      points: [90, 92, 91, 94, 93, 96, 95, 98],
      trend: "+2.1%",
      isPositive: true
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, type: "spring", stiffness: 120 }}
            whileHover={{ y: -3, scale: 1.01 }}
            className="adm-stat-card-purple"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">{card.title}</span>
              <div
                className="adm-icon-box-lg"
                style={{
                  background: `linear-gradient(135deg, ${card.theme}25, ${card.theme}08)`,
                  border: `1px solid ${card.theme}35`,
                  boxShadow: `0 8px 24px ${card.theme}15`
                }}
              >
                <Icon size={18} style={{ color: card.theme }} />
              </div>
            </div>

            <h2 className="text-[26px] font-black tracking-tight text-[#F8FAFC] font-mono mb-2">
              <AnimatedCounter value={card.value} />
            </h2>

            <div className="flex items-end justify-between pt-1">
              <div>
                <span
                  className="adm-trend-up"
                  style={{
                    color: card.isPositive ? "#10B981" : "#F59E0B",
                    background: card.isPositive ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                    borderColor: card.isPositive ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)"
                  }}
                >
                  {card.trend}
                </span>
                <p className="text-[10px] mt-1 text-[#334155]">{card.desc}</p>
              </div>
              <Sparkline points={card.points} color={card.theme} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
