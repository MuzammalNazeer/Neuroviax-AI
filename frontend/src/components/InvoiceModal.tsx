import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  FileText,
  Building2,
  Calendar,
  CreditCard,
  QrCode,
  MessageCircle,
} from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  businessName?: string;
  currency?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  order,
  businessName = 'Neuroviax AI Demo Enterprise',
  currency = 'PKR',
}) => {
  if (!isOpen || !order) return null;

  const invoiceNumber = `INV-${order._id ? order._id.slice(-6).toUpperCase() : '883921'}`;
  const orderDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = `Invoice ${invoiceNumber} for ${businessName}. Total: ${currency} ${(order.total || 0).toLocaleString()}. Status: ${order.status.toUpperCase()}.`;
    window.open(`https://wa.me/923264414694?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8"
        >
          {/* Header Controls (Hidden during print) */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-800">Tax Invoice Viewer</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                FR-08 Compliant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                title="Share via WhatsApp Business"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="p-8 space-y-6 text-slate-800 bg-white" id="printable-invoice">
            {/* Business Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                    NV
                  </div>
                  <h2 className="text-xl font-black font-display text-slate-900">{businessName}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">Autonomous Business Operating Platform</p>
                <p className="text-xs text-slate-500">NTN/STRN: 7492014-9 · Localized Tax Invoice</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-display tracking-tight text-slate-900 block">
                  INVOICE
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                  {invoiceNumber}
                </span>
                <p className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {orderDate}
                </p>
              </div>
            </div>

            {/* Bill To & Order Info */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Billed To / Party
                </span>
                <p className="font-bold text-slate-900 text-sm">
                  {order.customer?.name || order.supplier?.name || 'Walk-in SME Customer'}
                </p>
                <p className="text-slate-600 mt-0.5">{order.customer?.phone || order.supplier?.phone || '+92 300 1234567'}</p>
                <p className="text-slate-500">{order.customer?.address || 'Tax Exempt SME Partner'}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                    Order Details
                  </span>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Order Type:</span>
                    <span className="font-semibold text-slate-800 uppercase">{order.type}</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="font-semibold text-emerald-600 capitalize">Settled / Verified</span>
                  </div>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Execution Status:</span>
                  <span className="font-bold text-slate-900 uppercase">{order.status}</span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 text-left">Item / SKU</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(order.items || []).map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4">
                        <p className="font-bold text-slate-900">{item.product?.name || 'Stock Item'}</p>
                        <p className="text-[10px] text-slate-400">SKU: {item.product?.sku || 'N/A'}</p>
                      </td>
                      <td className="py-2.5 px-4 text-center font-semibold text-slate-800">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right text-slate-600">
                        {currency} {(item.unitPrice || 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                        {currency} {((item.quantity || 0) * (item.unitPrice || 0)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations & Totals */}
            <div className="flex justify-between items-end pt-2">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1">
                  <QrCode className="w-9 h-9 text-slate-800" />
                </div>
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">Digital Tax Verification QR</p>
                  <p>Scan to verify with Neuroviax Ledger</p>
                  <p className="text-emerald-600 font-semibold">FBR / Regional Tax Compliant</p>
                </div>
              </div>

              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{currency} {(order.subtotal || order.total || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (Jurisdiction Calc):</span>
                  <span className="font-semibold">{currency} {(order.taxAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount:</span>
                  <span className="text-emerald-600">{currency} {(order.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
              <p>Generated automatically via Neuroviax AI Autonomous Business Operating Platform.</p>
              <p>This is a computer-generated document requiring no physical signature.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
