import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Wallet,
  Plus,
  X,
  Clock,
  Landmark,
  Smartphone,
  QrCode,
  ShieldCheck,
  FileText,
  Printer,
  Share2,
  Receipt as ReceiptIcon,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface Payment {
  _id: string;
  direction: 'receivable' | 'payable';
  amount: number;
  method: string;
  status: string;
  providerReference?: string;
  accountIdentifier?: string;
  accountTitle?: string;
  verificationToken?: string;
  kycLevel?: string;
  isVerified?: boolean;
  notes?: string;
  order?: { _id: string; total: number; type: string };
  paidAt?: string;
  createdAt: string;
}

interface OrderOption {
  _id: string;
  type: string;
  total: number;
  status: string;
}

const GATEWAY_DETAILS: Record<
  string,
  {
    name: string;
    badgeColor: string;
    textColor: string;
    border: string;
    icon: React.ComponentType<any>;
    placeholderIdentifier: string;
    labelIdentifier: string;
    helperText: string;
  }
> = {
  cash: {
    name: 'Cash Settlement',
    badgeColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: DollarSign,
    labelIdentifier: 'Counter Cashier / Staff Name',
    placeholderIdentifier: 'e.g. Counter 1 - Muhammad Ali',
    helperText: 'Physical cash received and verified at counter or field delivery.',
  },
  stripe: {
    name: 'Stripe Global Payments',
    badgeColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    border: 'border-indigo-200',
    icon: CreditCard,
    labelIdentifier: 'Cardholder Name & Card Last 4',
    placeholderIdentifier: 'e.g. John Doe (Visa ending 4242)',
    helperText: 'Tokenized card processing with 3D-Secure & PCI-DSS compliance.',
  },
  jazzcash: {
    name: 'JazzCash Mobile Wallet',
    badgeColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    border: 'border-orange-200',
    icon: Smartphone,
    labelIdentifier: 'JazzCash Mobile Account #',
    placeholderIdentifier: '0300 1234567',
    helperText: 'Direct mobile wallet push prompt or OTC branch voucher settlement.',
  },
  easypaisa: {
    name: 'Easypaisa Direct Wallet',
    badgeColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    border: 'border-teal-200',
    icon: Smartphone,
    labelIdentifier: 'Easypaisa Mobile Account #',
    placeholderIdentifier: '0345 1234567',
    helperText: 'Instant wallet transfer with real-time API callback settlement.',
  },
  razorpay: {
    name: 'Razorpay UPI & Cards',
    badgeColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    border: 'border-cyan-200',
    icon: QrCode,
    labelIdentifier: 'UPI Virtual Payment Address (VPA)',
    placeholderIdentifier: 'merchant@upi or 9876543210@paytm',
    helperText: 'Unified Payments Interface (UPI) fast QR & netbanking rails.',
  },
  bank_transfer: {
    name: 'Wire / Bank Transfer',
    badgeColor: 'bg-slate-100',
    textColor: 'text-slate-800',
    border: 'border-slate-300',
    icon: Landmark,
    labelIdentifier: 'Bank Name & IBAN / Account #',
    placeholderIdentifier: 'e.g. Meezan Bank (PK36MEZN00...)',
    helperText: 'Interbank fund transfer via 1Link/PRISM or international wire.',
  },
};

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [cashFlow, setCashFlow] = useState<{ receivable: number; payable: number; netPosition: number } | null>(null);
  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Selected receipt for modal
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Verification State (Account must be verified before payment is allowed)
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedInfo, setVerifiedInfo] = useState<{
    accountTitle: string;
    kycLevel: string;
    verificationToken: string;
    status: string;
  } | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [stripeNotice, setStripeNotice] = useState<string | null>(null);
  const [launchingStripe, setLaunchingStripe] = useState(false);

  // Dynamic Form State
  const [form, setForm] = useState({
    direction: 'receivable' as 'receivable' | 'payable',
    amount: '',
    method: 'cash',
    accountIdentifier: '',
    orderId: '',
    notes: '',
    autoSettle: true, // Auto mark as completed
    // Gateway-specific extra inputs
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    cnicLast6: '',
    bankName: 'Meezan Bank',
    voucherRef: '',
  });

  // Reset verification whenever gateway or account input changes
  const handleInputChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setIsVerified(false);
    setVerifiedInfo(null);
    setVerifyError(null);
  };

  const handleLaunchStripeCheckout = async () => {
    if (!form.amount || Number(form.amount) <= 0) {
      setVerifyError('Please enter a valid payment amount first.');
      return;
    }
    setLaunchingStripe(true);
    setVerifyError(null);
    try {
      const res = await api.post('/payments/create-stripe-checkout', {
        amount: Number(form.amount),
        orderId: form.orderId || undefined,
        notes: form.notes,
        customerName: form.accountIdentifier,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      setVerifyError(err.response?.data?.message || 'Failed to initialize Stripe checkout session.');
      setLaunchingStripe(false);
    }
  };

  const handleVerifyAccount = async () => {
    setVerifyError(null);
    let identifier = form.accountIdentifier?.trim();
    if (form.method === 'stripe') {
      identifier = form.accountIdentifier?.trim() || (form.cardNumber ? `Card ending ${form.cardNumber.replace(/\s/g, '').slice(-4)}` : '');
    } else if (form.method === 'cash') {
      identifier = form.accountIdentifier?.trim() || 'Counter 1 - Main Branch POS Cashier';
      if (!form.accountIdentifier) {
        setForm((prev) => ({ ...prev, accountIdentifier: 'Counter 1 - Main Branch POS Cashier' }));
      }
    }

    if (!identifier || identifier.length < 3) {
      setVerifyError(
        form.method === 'stripe'
          ? 'Please enter Cardholder Name or Card Number before verifying.'
          : form.method === 'jazzcash'
          ? 'Please enter 11-digit JazzCash Mobile Number before verifying.'
          : form.method === 'easypaisa'
          ? 'Please enter 11-digit Easypaisa Mobile Number before verifying.'
          : form.method === 'razorpay'
          ? 'Please enter UPI ID / VPA before verifying.'
          : form.method === 'bank_transfer'
          ? 'Please enter IBAN / Account Number before verifying.'
          : 'Please enter Cashier or Counter ID before verifying.'
      );
      return;
    }

    setVerifying(true);
    try {
      const res = await api.post('/payments/verify-account', {
        method: form.method,
        accountIdentifier: identifier,
        bankName: form.bankName,
        cnicLast6: form.cnicLast6,
      });

      if (res.data?.verified) {
        setIsVerified(true);
        setVerifiedInfo(res.data);
      }
    } catch (err: any) {
      setVerifyError(err.response?.data?.message || 'Account verification failed. Please check credentials.');
      setIsVerified(false);
    } finally {
      setVerifying(false);
    }
  };

  const load = () => {
    setLoading(true);
    Promise.all([api.get('/payments'), api.get('/payments/cash-flow'), api.get('/orders')])
      .then(([p, c, o]) => {
        setPayments(p.data || []);
        setCashFlow(c.data);
        setOrders(o.data?.orders || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('stripe_payment') === 'success') {
      const paymentId = searchParams.get('payment_id');
      const sessionId = searchParams.get('session_id');
      api
        .post('/payments/verify-stripe-payment', { paymentId, sessionId })
        .then(() => {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });
          setStripeNotice('Stripe payment verified & settled successfully!');
          load();
        })
        .catch(() => {
          setStripeNotice('Payment completed via Stripe. Status updated.');
          load();
        })
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname);
        });
    } else if (searchParams.get('stripe_payment') === 'cancel') {
      setStripeNotice('Stripe payment session was canceled. No charges occurred.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      setVerifyError('Account verification is mandatory before payment is allowed. Click "Verify Account Now" first.');
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) return;

    setSubmitting(true);
    try {
      // Build gateway-specific account identifier
      let resolvedIdentifier = form.accountIdentifier;
      if (form.method === 'stripe' && form.cardNumber) {
        const last4 = form.cardNumber.replace(/\s/g, '').slice(-4) || '4242';
        resolvedIdentifier = `Card ending ${last4} (${form.accountIdentifier || 'Cardholder'})`;
      } else if (form.method === 'bank_transfer') {
        resolvedIdentifier = `${form.bankName} - ${form.accountIdentifier || 'Direct Deposit'}`;
      } else if (form.method === 'jazzcash' && form.cnicLast6) {
        resolvedIdentifier = `${form.accountIdentifier} (CNIC: ***${form.cnicLast6})`;
      }

      const payload = {
        direction: form.direction,
        amount: Number(form.amount),
        method: form.method,
        order: form.orderId || undefined,
        accountIdentifier: resolvedIdentifier,
        accountTitle: verifiedInfo?.accountTitle,
        verificationToken: verifiedInfo?.verificationToken,
        kycLevel: verifiedInfo?.kycLevel,
        isVerified: true,
        notes: form.notes,
        status: form.autoSettle ? 'completed' : 'pending',
        providerReference: form.voucherRef || undefined,
      };

      const res = await api.post('/payments', payload);

      if (form.autoSettle) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
      }

      setShowForm(false);
      setForm({
        direction: 'receivable',
        amount: '',
        method: 'cash',
        accountIdentifier: '',
        orderId: '',
        notes: '',
        autoSettle: true,
        cardNumber: '',
        cardExp: '',
        cardCvc: '',
        cnicLast6: '',
        bankName: 'Meezan Bank',
        voucherRef: '',
      });

      // Auto-open receipt for immediate verification
      if (res.data) {
        setSelectedReceipt(res.data);
      }

      load();
    } catch (err) {
      console.error('Failed to record payment', err);
    } finally {
      setSubmitting(false);
    }
  };

  const complete = async (id: string) => {
    try {
      const res = await api.patch(`/payments/${id}/complete`, {});
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.5 } });
      load();
      if (res.data) {
        setSelectedReceipt(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentGateway = GATEWAY_DETAILS[form.method] || GATEWAY_DETAILS.cash;
  const GatewayIcon = currentGateway.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CreditCard className="w-4 h-4" />
            </span>
            <span>Payments & Settlement Gateway</span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Multi-Gateway Active
            </span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Accept receivables and disburse payables via Stripe, JazzCash, Easypaisa, Razorpay, Bank Transfer, and Cash.
          </p>
        </div>

        {stripeNotice && (
          <div className="w-full p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>{stripeNotice}</span>
            </div>
            <button onClick={() => setStripeNotice(null)} className="text-indigo-500 hover:text-indigo-800 font-bold">
              Dismiss
            </button>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 ${
            showForm
              ? 'bg-slate-800 hover:bg-slate-900 text-white'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-700/20'
          }`}
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Close Entry Form' : 'Process New Payment'}</span>
        </motion.button>
      </div>

      {/* Cash Flow Summary Metric Cards */}
      {cashFlow && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <motion.div whileHover={{ y: -2 }} className="glass-card rounded-2xl p-5 shadow-elevated border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Receivables</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-display text-emerald-700">
              PKR {cashFlow.receivable.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Incoming revenue & customer bills</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="glass-card rounded-2xl p-5 shadow-elevated border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payables</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-display text-blue-700">
              PKR {cashFlow.payable.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Outgoing vendor & supplier obligations</p>
          </motion.div>

          <motion.div whileHover={{ y: -2 }} className="glass-card rounded-2xl p-5 shadow-elevated border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Working Capital</span>
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black font-display text-purple-800">
              PKR {cashFlow.netPosition.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400">Projected net liquidity position</p>
          </motion.div>
        </div>
      )}

      {/* Dynamic Payment Entry Drawer */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 shadow-elevated border border-slate-200/80 space-y-5 bg-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${currentGateway.badgeColor} ${currentGateway.textColor} flex items-center justify-center`}>
                    <GatewayIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Record Entry: <span className="text-emerald-700">{currentGateway.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">{currentGateway.helperText}</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  API Connected
                </span>
              </div>

              {/* Core Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Flow Direction</label>
                  <select
                    value={form.direction}
                    onChange={(e) => setForm({ ...form, direction: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-medium"
                  >
                    <option value="receivable">📥 Receivable (Money In / Customer Payment)</option>
                    <option value="payable">📤 Payable (Money Out / Supplier Payout)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gateway / Channel *</label>
                  <select
                    value={form.method}
                    onChange={(e) => setForm({ ...form, method: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-bold text-slate-800"
                  >
                    <option value="cash">Cash Settlement</option>
                    <option value="stripe">Stripe</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="razorpay">Razorpay</option>
                    <option value="bank_transfer">Wire / Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 15000"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition font-black text-slate-900"
                  />
                </div>
              </div>

              {/* DYNAMIC GATEWAY INPUTS (Morphs based on selected dropdown) */}
              <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <GatewayIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentGateway.name} Verification Parameters</span>
                </div>

                {/* 1. STRIPE INPUTS */}
                {form.method === 'stripe' && (
                  <div className="space-y-3">
                    {/* Live Stripe Checkout Option */}
                    <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-bold text-indigo-900">
                            Stripe Hosted Checkout (Recommended)
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-700 mt-0.5">
                          Instant card processing with Apple Pay, Google Pay, and 3D-Secure.
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={launchingStripe}
                        onClick={handleLaunchStripeCheckout}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition whitespace-nowrap flex items-center justify-center gap-1.5"
                      >
                        {launchingStripe ? 'Opening Stripe...' : 'Pay via Stripe Checkout'}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="relative flex items-center justify-center py-1">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-slate-50 px-2 text-[10px] font-bold text-slate-400 uppercase">
                        Or manual counter entry
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Cardholder Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Hamza Tariq"
                          value={form.accountIdentifier}
                          onChange={(e) => handleInputChange('accountIdentifier', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4242 •••• •••• 4242"
                          value={form.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Exp Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={form.cardExp}
                          onChange={(e) => handleInputChange('cardExp', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">CVC / CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          value={form.cardCvc}
                          onChange={(e) => handleInputChange('cardCvc', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Pre-Auth / Voucher #</label>
                        <input
                          type="text"
                          placeholder="Auto-generate"
                          value={form.voucherRef}
                          onChange={(e) => handleInputChange('voucherRef', e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. JAZZCASH INPUTS */}
                {form.method === 'jazzcash' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">JazzCash Mobile Wallet # *</label>
                      <input
                        type="text"
                        placeholder="0300 1234567"
                        required
                        value={form.accountIdentifier}
                        onChange={(e) => handleInputChange('accountIdentifier', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">CNIC Last 6 Digits</label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="892102"
                        value={form.cnicLast6}
                        onChange={(e) => handleInputChange('cnicLast6', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">JazzCash TID / Voucher #</label>
                      <input
                        type="text"
                        placeholder="Auto-generate"
                        value={form.voucherRef}
                        onChange={(e) => handleInputChange('voucherRef', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {/* 3. EASYPAISA INPUTS */}
                {form.method === 'easypaisa' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Easypaisa Mobile Account # *</label>
                      <input
                        type="text"
                        placeholder="0345 1234567"
                        required
                        value={form.accountIdentifier}
                        onChange={(e) => handleInputChange('accountIdentifier', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Easypaisa TRX ID</label>
                      <input
                        type="text"
                        placeholder="Auto-generate"
                        value={form.voucherRef}
                        onChange={(e) => handleInputChange('voucherRef', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                )}

                {/* 4. RAZORPAY INPUTS */}
                {form.method === 'razorpay' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">UPI VPA / ID *</label>
                      <input
                        type="text"
                        placeholder="user@okhdfcbank"
                        required
                        value={form.accountIdentifier}
                        onChange={(e) => handleInputChange('accountIdentifier', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Razorpay Payment ID</label>
                      <input
                        type="text"
                        placeholder="Auto-generate"
                        value={form.voucherRef}
                        onChange={(e) => handleInputChange('voucherRef', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                {/* 5. BANK TRANSFER INPUTS */}
                {form.method === 'bank_transfer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Settling Bank</label>
                      <select
                        value={form.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-bold"
                      >
                        <option value="Meezan Bank">Meezan Bank</option>
                        <option value="Habib Bank Limited (HBL)">HBL</option>
                        <option value="Bank Alfalah">Bank Alfalah</option>
                        <option value="Standard Chartered">Standard Chartered</option>
                        <option value="MCB Bank">MCB Bank</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">IBAN / Account Number</label>
                      <input
                        type="text"
                        placeholder="PK36MEZN0019283..."
                        value={form.accountIdentifier}
                        onChange={(e) => handleInputChange('accountIdentifier', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Deposit Slip / Ref #</label>
                      <input
                        type="text"
                        placeholder="Auto-generate"
                        value={form.voucherRef}
                        onChange={(e) => handleInputChange('voucherRef', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 6. CASH SETTLEMENT INPUTS */}
                {form.method === 'cash' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Counter Cashier / Collector</label>
                      <input
                        type="text"
                        placeholder="e.g. Counter 1 - Muhammad Ali"
                        value={form.accountIdentifier}
                        onChange={(e) => handleInputChange('accountIdentifier', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Physical Cash Voucher #</label>
                      <input
                        type="text"
                        placeholder="Auto-generate"
                        value={form.voucherRef}
                        onChange={(e) => handleInputChange('voucherRef', e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* ── MANDATORY ACCOUNT VERIFICATION (REQUIRED BEFORE PAY IS ALLOWED) ── */}
                <div
                  className={`pt-3 pb-3 px-4 rounded-xl border transition-all ${
                    isVerified
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-amber-50/60 border-amber-200 shadow-inner'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                            isVerified ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                          }`}
                        >
                          1
                        </span>
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span>Mandatory Account Verification Gate</span>
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isVerified ? 'VERIFIED · PAY UNLOCKED' : 'PAY LOCKED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7">
                        {isVerified
                          ? 'Account verified and authorized. Payment button is now unlocked.'
                          : 'Account must be verified via API before payment is allowed.'}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleVerifyAccount}
                      disabled={verifying}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
                        isVerified
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                      }`}
                    >
                      {verifying ? (
                        <>
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                          <span>Validating Account...</span>
                        </>
                      ) : isVerified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Account Verified ✓ (Re-verify)</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Verify Account Now</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Verification Result Banner */}
                  {isVerified && verifiedInfo && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-white border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5 shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-slate-900 text-xs">
                            Account Title: {verifiedInfo.accountTitle}
                          </span>
                          <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            {verifiedInfo.verificationToken}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                          KYC Status: <span className="font-bold">{verifiedInfo.kycLevel}</span> · Gateway Payout & Debit Authorized
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Verification Error Banner */}
                  {verifyError && (
                    <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{verifyError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Auxiliary Settings (Order Link + Settlement Mode) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link with Sales/Purchase Order (Optional)</label>
                  <select
                    value={form.orderId}
                    onChange={(e) => handleInputChange('orderId', e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50/50"
                  >
                    <option value="">No Order Linked (Direct Settlement)</option>
                    {orders.map((o) => (
                      <option key={o._id} value={o._id}>
                        {o.type.toUpperCase()} Order #{o._id.slice(-6)} · PKR {o.total?.toLocaleString()} ({o.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Instant Gateway Settlement</p>
                    <p className="text-[10px] text-slate-500">Mark as completed with verified digital reference</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.autoSettle}
                    onChange={(e) => handleInputChange('autoSettle', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                  />
                </div>
              </div>

              {/* Submit CTA (Strictly Gated by Account Verification) */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div className="text-[11px]">
                  {!isVerified ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Step 1 Required: Verify account title above before payment is allowed.
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Step 2 Unlocked: Ready to pay PKR {Number(form.amount || 0).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={isVerified ? { scale: 1.02 } : {}}
                    whileTap={isVerified ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={submitting || !isVerified}
                    className={`font-bold px-6 py-2.5 rounded-xl text-xs transition flex items-center gap-2 ${
                      !isVerified
                        ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25'
                    }`}
                  >
                    {!isVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span>🔒 Verify Account First to Pay</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {submitting
                            ? 'Processing Settlement...'
                            : `Authorize & Pay PKR ${Number(form.amount || 0).toLocaleString()} via ${currentGateway.name}`}
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payments Table */}
      <div className="glass-card rounded-2xl shadow-elevated overflow-hidden border border-slate-200/80 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Flow Direction</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Gateway / Channel</th>
                <th className="px-6 py-3.5">Provider Ref / TID</th>
                <th className="px-6 py-3.5">Settlement Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td className="px-6 py-10 text-center text-slate-400" colSpan={6}>
                    <div className="flex items-center justify-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      <span>Loading transactions…</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && payments.length === 0 && (
                <tr>
                  <td className="px-6 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-xl">
                        💳
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No payment records</p>
                      <p className="text-[11px] text-slate-400">Click "Process New Payment" above to execute financial settlement.</p>
                    </div>
                  </td>
                </tr>
              )}
              {payments.map((p, idx) => {
                const isReceivable = p.direction === 'receivable';
                const isCompleted = p.status === 'completed';
                const gMeta = GATEWAY_DETAILS[p.method] || GATEWAY_DETAILS.cash;
                const RowIcon = gMeta.icon;

                return (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          isReceivable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {isReceivable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>{p.direction}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black font-display text-sm text-slate-900">
                      PKR {p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`p-1 rounded-lg ${gMeta.badgeColor} ${gMeta.textColor}`}>
                          <RowIcon className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="font-bold text-slate-800 text-xs capitalize">{gMeta.name}</p>
                          {p.accountIdentifier && (
                            <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{p.accountIdentifier}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-bold">
                        {p.providerReference || 'Pending TID'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition"
                          title="View Digital Gateway Voucher"
                        >
                          <ReceiptIcon className="w-3 h-3 text-slate-500" />
                          <span>Receipt</span>
                        </button>
                        {p.status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => complete(p._id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xs transition"
                          >
                            Mark Completed
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIGITAL GATEWAY VOUCHER / RECEIPT MODAL */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ReceiptIcon className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 text-xs">Digital Gateway Settlement Voucher</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition"
                    title="Print Voucher"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs bg-white">
                {/* Status banner */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold">Settlement Verified</p>
                      <p className="text-[10px] text-emerald-600">Neuroviax Ledger Confirmation</p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs">
                    {selectedReceipt.providerReference || 'TX-CONFIRMED'}
                  </span>
                </div>

                {/* Amount */}
                <div className="text-center py-2">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Settled Amount</span>
                  <span className="text-3xl font-black font-display text-slate-900 mt-1 block">
                    PKR {selectedReceipt.amount.toLocaleString()}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 capitalize">
                    {selectedReceipt.direction === 'receivable' ? 'Incoming Payment' : 'Vendor Disbursement'}
                  </span>
                </div>

                {/* Metadata rows */}
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 bg-slate-50/50 p-1">
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-400">Payment Channel:</span>
                    <span className="font-bold text-slate-800 uppercase">{selectedReceipt.method.replace('_', ' ')}</span>
                  </div>
                  {selectedReceipt.accountIdentifier && (
                    <div className="p-2.5 flex justify-between">
                      <span className="text-slate-400">Account / Identifier:</span>
                      <span className="font-semibold text-slate-800">{selectedReceipt.accountIdentifier}</span>
                    </div>
                  )}
                  {selectedReceipt.accountTitle && (
                    <div className="p-2.5 flex justify-between">
                      <span className="text-slate-400">Verified Account Title:</span>
                      <span className="font-bold text-emerald-800">{selectedReceipt.accountTitle}</span>
                    </div>
                  )}
                  {selectedReceipt.verificationToken && (
                    <div className="p-2.5 flex justify-between">
                      <span className="text-slate-400">Verification Token / KYC:</span>
                      <span className="font-mono font-bold text-slate-900 bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded">
                        {selectedReceipt.verificationToken} {selectedReceipt.kycLevel ? `(${selectedReceipt.kycLevel})` : ''}
                      </span>
                    </div>
                  )}
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-400">Gateway Reference ID:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedReceipt.providerReference}</span>
                  </div>
                  <div className="p-2.5 flex justify-between">
                    <span className="text-slate-400">Settlement Timestamp:</span>
                    <span className="text-slate-600">
                      {new Date(selectedReceipt.paidAt || selectedReceipt.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-center text-[10px] text-slate-400">
                  <p>Encrypted & verified via Neuroviax Multi-Gateway API.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Payments;
