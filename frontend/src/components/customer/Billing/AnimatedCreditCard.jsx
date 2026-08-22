// src/components/customer/Billing/AnimatedCreditCard.jsx
import { motion } from "framer-motion";

export default function AnimatedCreditCard({
  isFlipped = false,
  cardNumber = "",
  cardHolder = "Debasmith Rout",
  expiry = "12/28",
  cvv = "",
  provider = "VISA"
}) {
  const displayLast4 = cardNumber.replace(/\s+/g, "").slice(-4) || "4242";
  const maskedCVV = cvv ? "•".repeat(cvv.length) : "•••";

  return (
    <div className="w-full h-44 cursor-pointer" style={{ perspective: 1000 }}>
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full rounded-2xl shadow-2xl shadow-red-950/40"
      >
        {/* FRONT SIDE */}
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/80 border border-red-600/40 p-5 flex flex-col justify-between overflow-hidden shadow-inner"
        >
          {/* Subtle glossy overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="flex justify-between items-start z-10">
            {/* Card Chip Graphic */}
            <div className="w-9 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <div className="w-5 h-3.5 bg-amber-500/40 rounded-sm" />
            </div>
            <span className="text-sm font-black italic tracking-widest text-white uppercase">
              {provider}
            </span>
          </div>

          <div className="z-10 space-y-2">
            <span className="text-base font-mono tracking-widest text-white block font-bold">
              •••• •••• •••• {displayLast4}
            </span>
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="text-[9px] text-gray-400 uppercase font-bold block">Cardholder</span>
                <span className="text-white font-medium truncate block max-w-[150px]">{cardHolder}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-gray-400 uppercase font-bold block">Expires</span>
                <span className="font-mono text-gray-200 font-medium block">{expiry}</span>
              </div>
            </div>
          </div>
        </div>

        {/* BACK SIDE */}
        <div
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
          className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/80 border border-red-600/40 py-4 flex flex-col justify-between overflow-hidden shadow-inner"
        >
          {/* Black Magnetic Strip */}
          <div className="w-full h-9 bg-black/90 border-y border-white/10" />

          {/* Signature Strip & CVV Display */}
          <div className="px-5 space-y-1">
            <span className="text-[9px] text-gray-400 uppercase font-bold block text-right">
              CVV / CVC
            </span>
            <div className="bg-zinc-800 border border-white/10 rounded-lg p-2 flex items-center justify-between">
              <div className="h-4 w-32 bg-zinc-700/50 rounded flex items-center px-2">
                <span className="text-[8px] font-mono text-gray-400 tracking-widest italic">Authorized Signature</span>
              </div>
              <div className="bg-white text-zinc-950 font-mono text-xs font-black px-2.5 py-0.5 rounded shadow">
                {maskedCVV}
              </div>
            </div>
          </div>

          <div className="px-5 text-right z-10">
            <span className="text-xs font-black italic tracking-widest text-gray-400 uppercase">
              {provider}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
