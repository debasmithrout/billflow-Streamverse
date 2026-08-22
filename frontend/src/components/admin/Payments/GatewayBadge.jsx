// src/components/admin/Payments/GatewayBadge.jsx
import { ShieldCheck, Zap, CreditCard, DollarSign, Server } from "lucide-react";

export default function GatewayBadge({ gateway }) {
  const getBranding = (g) => {
    const formatted = g ? g.trim().toLowerCase() : "stripe";
    switch (formatted) {
      case "stripe":
        return {
          label: "Stripe",
          color: "text-[#635BFF] bg-[#635BFF]/10 border-[#635BFF]/25",
          icon: <span className="font-extrabold italic text-[9px] mr-1 tracking-tighter text-[#635BFF]">S</span>
        };
      case "razorpay":
        return {
          label: "Razorpay",
          color: "text-[#0C2340] dark:text-[#0284C7] bg-[#0284C7]/10 border-[#0284C7]/25",
          icon: <Zap size={11} className="mr-1 text-[#0284C7]" />
        };
      case "paypal":
        return {
          label: "PayPal",
          color: "text-[#003087] dark:text-[#38BDF8] bg-[#003087]/10 border-[#003087]/25",
          icon: <span className="font-serif font-black italic text-[9px] mr-1 text-[#38BDF8]">P</span>
        };
      case "cashfree":
        return {
          label: "Cashfree",
          color: "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25",
          icon: <DollarSign size={11} className="mr-1 text-[#10B981]" />
        };
      case "mock":
      case "mock gateway":
      case "mockgateway":
      default:
        return {
          label: g || "Mock Gateway",
          color: "text-purple-400 bg-purple-500/10 border-purple-500/25",
          icon: <Server size={11} className="mr-1 text-purple-400" />
        };
    }
  };

  const brand = getBranding(gateway);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${brand.color} select-none shadow-xs`}>
      {brand.icon}
      <span>{brand.label}</span>
    </span>
  );
}
