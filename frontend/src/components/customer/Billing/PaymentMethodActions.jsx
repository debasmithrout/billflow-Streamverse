// src/components/customer/Billing/PaymentMethodActions.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useToast from "../../../hooks/useToast";

export default function PaymentMethodActions({ method, onSetDefault, onRemove }) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
        title="Actions"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-8 z-30 w-36 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl py-1 overflow-hidden"
          >
            {!method.isDefault && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onSetDefault) onSetDefault(method);
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-white/5 hover:text-white font-medium transition-colors cursor-pointer"
              >
                Set as Default
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                showToast(`Editing ${method.brand || method.id || "method"} (Demo Mode)`, "info");
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-white/5 hover:text-white font-medium transition-colors cursor-pointer"
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onRemove) onRemove(method);
              }}
              className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 font-medium transition-colors cursor-pointer"
            >
              Remove
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
