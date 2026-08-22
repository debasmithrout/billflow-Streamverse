// src/components/admin/Payments/PaymentMethodBadge.jsx
import { CreditCard, Landmark, Wallet, Smartphone, ShieldCheck, Zap } from "lucide-react";

export default function PaymentMethodBadge({ method }) {
  const getBranding = (m) => {
    const formatted = m ? m.trim().toLowerCase() : "";
    switch (formatted) {
      case "upi":
        return {
          label: "UPI",
          color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
          icon: <Smartphone size={11} className="mr-1 text-cyan-400" />
        };
      case "credit card":
      case "creditcard":
      case "card":
        return {
          label: "Credit Card",
          color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
          icon: <CreditCard size={11} className="mr-1 text-purple-400" />
        };
      case "debit card":
      case "debitcard":
        return {
          label: "Debit Card",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          icon: <CreditCard size={11} className="mr-1 text-blue-400" />
        };
      case "net banking":
      case "netbanking":
      case "bank transfer":
      case "banktransfer":
        return {
          label: "Net Banking",
          color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
          icon: <Landmark size={11} className="mr-1 text-emerald-400" />
        };
      case "wallet":
        return {
          label: "Wallet",
          color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
          icon: <Wallet size={11} className="mr-1 text-amber-400" />
        };
      case "visa":
        return {
          label: "Visa",
          color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
          icon: <span className="font-sans font-black italic tracking-tighter text-[9px] mr-1 select-none text-blue-400">VISA</span>
        };
      case "mastercard":
        return {
          label: "Mastercard",
          color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
          icon: (
            <span className="inline-flex items-center mr-1 select-none">
              <span className="w-2 h-2 rounded-full bg-red-500 opacity-90 -mr-0.5" />
              <span className="w-2 h-2 rounded-full bg-yellow-500 opacity-90" />
            </span>
          )
        };
      case "paypal":
        return {
          label: "PayPal",
          color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
          icon: <span className="font-serif font-black italic text-[9px] mr-1 select-none text-sky-400">P</span>
        };
      case "apple pay":
      case "applepay":
        return {
          label: "Apple Pay",
          color: "text-white bg-white/10 border-white/20",
          icon: <span className="font-sans font-bold text-[9px] mr-1 select-none"> Pay</span>
        };
      case "google pay":
      case "googlepay":
      case "gpay":
        return {
          label: "Google Pay",
          color: "text-red-400 bg-red-500/10 border-red-500/20",
          icon: <span className="font-sans font-black text-[9px] mr-1 select-none text-red-400">GPay</span>
        };
      default:
        return {
          label: m || "Card",
          color: "text-zinc-400 bg-zinc-800 border-zinc-700",
          icon: <CreditCard size={11} className="mr-1 text-zinc-400" />
        };
    }
  };

  const brand = getBranding(method);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${brand.color} shadow-xs select-none`}>
      {brand.icon}
      <span>{brand.label}</span>
    </span>
  );
}
