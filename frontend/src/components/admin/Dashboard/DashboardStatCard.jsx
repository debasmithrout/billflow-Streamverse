// src/components/admin/Dashboard/DashboardStatCard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Activity, Clock, DollarSign, FileText, AlertTriangle, RotateCcw, ShieldCheck } from "lucide-react";

// Helper component for animated number counter
function AnimatedCounter({ value }) {
  // Parse clean number from string (e.g. "₹798" -> 798, "2,847" -> 2847)
  const isCurrency = value.includes("₹");
  const cleanStr = value.replace(/[^0-9.]/g, "");
  const numValue = parseFloat(cleanStr) || 0;
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = numValue;
    if (end === 0) {
      setCount(0);
      return;
    }
    const duration = 1.0; // seconds
    const frameRate = 60;
    const totalFrames = Math.round(duration * frameRate);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      const currentVal = Math.round(start + (end - start) * easedProgress);
      setCount(currentVal);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setCount(end);
      }
    }, 1000 / frameRate);

    return () => clearInterval(timer);
  }, [numValue]);

  if (isCurrency) {
    return <span>₹{count.toLocaleString()}</span>;
  }
  return <span>{count.toLocaleString()}</span>;
}

// Sparkline component that draws an SVG path with a nice gradient stroke
function Sparkline({ points, color }) {
  const width = 120;
  const height = 30;
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

  // Gradient area path
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Area under the line */}
      <path d={areaD} fill={`url(#sparkGrad-${color})`} />
      {/* Sparkline path */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Interactive end dot */}
      {svgPoints.length > 0 && (
        <circle
          cx={svgPoints[svgPoints.length - 1].x}
          cy={svgPoints[svgPoints.length - 1].y}
          r="3"
          fill={color}
        />
      )}
    </svg>
  );
}

const STAT_THEMES = {
  "total customers": {
    icon: Users,
    color: "#8B5CF6", // Purple
    points: [40, 50, 45, 60, 55, 75, 70, 85],
    trend: "+12.5%",
    isPositive: true,
  },
  "active subscriptions": {
    icon: Activity,
    color: "#EC4899", // Pink
    points: [30, 45, 40, 55, 50, 68, 65, 80],
    trend: "+18.3%",
    isPositive: true,
  },
  "trial users": {
    icon: Clock,
    color: "#F97316", // Orange/Amber
    points: [80, 75, 70, 65, 72, 60, 55, 48],
    trend: "-4.2%",
    isPositive: false,
  },
  "monthly revenue": {
    icon: DollarSign,
    color: "#8B5CF6", // Purple/Violet
    points: [45, 55, 50, 70, 65, 85, 80, 95],
    trend: "+24.6%",
    isPositive: true,
  },
  "total invoices": {
    icon: FileText,
    color: "#06B6D4", // Cyan
    points: [35, 40, 38, 48, 45, 52, 50, 58],
    trend: "+7.1%",
    isPositive: true,
  },
  "failed payments": {
    icon: AlertTriangle,
    color: "#EF4444", // Red
    points: [90, 80, 70, 75, 60, 50, 45, 35],
    trend: "-33.3%",
    isPositive: true, // "Failed payments going down is positive"
  },
  "refund requests": {
    icon: RotateCcw,
    color: "#F59E0B", // Amber
    points: [20, 25, 30, 28, 35, 42, 38, 45],
    trend: "+15.0%",
    isPositive: false,
  },
  "past due users": {
    icon: ShieldCheck,
    color: "#3B82F6", // Blue
    points: [50, 48, 55, 52, 58, 60, 56, 62],
    trend: "+2.1%",
    isPositive: false,
  }
};

const DEFAULT_THEME = {
  icon: Activity,
  color: "#8B5CF6",
  points: [50, 50, 50, 50, 50, 50, 50, 50],
  trend: "+0.0%",
  isPositive: true,
};

export default function DashboardStatCard({ title, value, trend, isPositive, path }) {
  const navigate = useNavigate();
  const key = (title || "").toLowerCase();
  const theme = STAT_THEMES[key] || DEFAULT_THEME;
  const Icon = theme.icon;

  // Real-looking trend replacement for commercial showcase
  const finalTrend = trend === "Live" ? theme.trend : trend;
  const finalIsPositive = trend === "Live" ? theme.isPositive : isPositive;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="adm-stat-card-purple"
      onClick={() => path && navigate(path)}
      style={{
        "--glow-color": `linear-gradient(90deg, ${theme.color}44, ${theme.color})`,
      }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#475569" }}>
          {title}
        </span>
        <div
          className="adm-icon-box-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.color}25, ${theme.color}08)`,
            border: `1px solid ${theme.color}35`,
            boxShadow: `0 8px 24px ${theme.color}15`
          }}
        >
          <Icon size={18} style={{ color: theme.color }} />
        </div>
      </div>

      {/* Number Value */}
      <div className="mb-2">
        <h2 className="text-[28px] font-black tracking-tight" style={{ color: "#F8FAFC", fontVariantNumeric: "tabular-nums" }}>
          <AnimatedCounter value={value} />
        </h2>
      </div>

      {/* Footer sparkline + trend */}
      <div className="flex items-end justify-between pt-1">
        <div>
          <span
            className={finalIsPositive ? "adm-trend-up" : "adm-trend-down"}
            style={{
              color: finalIsPositive ? "#22C55E" : "#EF4444",
              background: finalIsPositive ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              borderColor: finalIsPositive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"
            }}
          >
            {finalTrend}
          </span>
          <p className="text-[10px] mt-1" style={{ color: "#334155" }}>
            vs last month
          </p>
        </div>
        <Sparkline points={theme.points} color={theme.color} />
      </div>
    </motion.div>
  );
}
