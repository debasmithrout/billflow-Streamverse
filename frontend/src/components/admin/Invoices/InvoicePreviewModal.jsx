// src/components/admin/Invoices/InvoicePreviewModal.jsx
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import PaymentMethodBadge from "../Payments/PaymentMethodBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function InvoicePreviewModal({ isOpen, invoice, onClose, onDownload }) {
  if (!isOpen || !invoice) return null;

  // Mock Tax calculations
  const taxRate = 0.08; // 8% sales tax
  const taxAmount = invoice.amount * taxRate;
  const subtotal = invoice.amount - taxAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Main Dialog Modal Panel */}
      <div className="relative bg-[#0b0b0c] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 animate-fade-in origin-center flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-5">
          <h3 className="text-sm font-bold text-white tracking-wide">Invoice Preview</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* invoice sheet content body */}
        <div className="bg-zinc-950/80 border border-white/5 rounded-2xl p-6 space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          
          {/* Header block with Logo */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-lg font-black tracking-tight text-white select-none">
                CINE<span className="text-red-650">VERSE</span>
              </span>
              <p className="text-[10px] text-gray-500 font-light mt-0.5">Streaming Portal Admin</p>
            </div>
            
            <div className="text-right text-xs">
              <span className="font-mono text-gray-400 block font-bold">{invoice.invoiceNumber}</span>
              <span className="text-[9px] text-gray-500 block font-mono mt-0.5">Issued: {invoice.generatedDate}</span>
            </div>
          </div>

          {/* Details metadata columns */}
          <div className="grid grid-cols-2 gap-6 text-xs border-t border-white/5 pt-4">
            <div className="space-y-1">
              <span className="text-gray-500 font-bold block uppercase tracking-wider text-[8px]">Billed To:</span>
              <span className="text-white font-bold block text-sm">{invoice.customerName}</span>
              <span className="text-gray-500 block truncate font-mono text-[9px]">{invoice.customerId}</span>
            </div>
            
            <div className="space-y-1.5 text-right">
              <span className="text-gray-500 font-bold block uppercase tracking-wider text-[8px]">Billing Strategy:</span>
              <div className="inline-block mt-0.5">
                <InvoiceStatusBadge status={invoice.status} />
              </div>
              <div className="block mt-1">
                <PaymentMethodBadge method="Visa" />
              </div>
            </div>
          </div>

          {/* Description line items ledger */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <span className="text-gray-500 font-bold block uppercase tracking-wider text-[8px]">Itemized Description</span>
            
            <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4.5 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="text-white font-bold block">{invoice.planName} Plan Subscription</span>
                  <span className="text-[9px] text-gray-550 block font-light mt-0.5">Monthly billing interval access parameters.</span>
                </div>
                <span className="text-white font-mono font-bold">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>

          {/* Totals math columns */}
          <div className="border-t border-white/5 pt-4 flex justify-end">
            <div className="w-full sm:w-1/2 space-y-2 text-xs">
              <div className="flex justify-between items-center text-gray-500 font-light">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500 font-light">
                <span>Tax (8% sales)</span>
                <span className="font-mono">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-white border-t border-white/5 pt-2 font-bold text-sm">
                <span>Grand Total</span>
                <span className="text-red-500 font-mono">{formatCurrency(invoice.amount)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dialog footer buttons */}
        <div className="flex gap-3 pt-5 border-t border-white/5 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
          >
            Close Preview
          </button>
          <button
            type="button"
            onClick={() => onDownload(invoice.id)}
            className="flex-1 py-2.5 bg-red-650 hover:bg-red-750 text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors"
          >
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
}
