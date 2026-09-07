import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plug,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Settings,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import api from '../api/axios';

interface IntegrationItem {
  _id: string;
  provider: string;
  isEnabled: boolean;
  status: string;
  environment: string;
  config: {
    phoneId?: string;
    webhookUrl?: string;
    merchantId?: string;
    apiKeyMasked?: string;
    lastSyncedAt?: string;
  };
}

const PROVIDER_INFO: Record<
  string,
  { name: string; category: string; description: string; color: string; badge: string }
> = {
  whatsapp: {
    name: 'WhatsApp Business Cloud API',
    category: 'Customer & Messaging Automation',
    description: 'Automated order confirmations, restock alerts, and AI Customer Assistant chats · §6.5 & §11 FR-07',
    color: 'from-emerald-500 to-green-600',
    badge: 'MESSAGING',
  },
  jazzcash: {
    name: 'JazzCash Merchant Gateway',
    category: 'Regional Payment Processing',
    description: 'Pakistan mobile wallet and QR checkout direct integration with automated webhook settlement · §8 & §11 FR-14',
    color: 'from-amber-500 to-red-500',
    badge: 'REGIONAL PAY',
  },
  easypaisa: {
    name: 'Easypaisa Direct API',
    category: 'Regional Payment Processing',
    description: 'Seamless digital wallet payments and instant disbursement notifications · §8 & §11 FR-14',
    color: 'from-emerald-600 to-teal-600',
    badge: 'REGIONAL PAY',
  },
  stripe: {
    name: 'Stripe Global Card Payments',
    category: 'International Gateway',
    description: 'PCI-DSS tokenized card processing with zero raw-card data storage · §12.3 & §11 FR-14',
    color: 'from-indigo-600 to-violet-600',
    badge: 'GLOBAL',
  },
  razorpay: {
    name: 'Razorpay UPI & Cards',
    category: 'South Asia Regional Gateway',
    description: 'UPI and localized net banking integration for South Asian cross-border expansion · §8 & §11 FR-14',
    color: 'from-blue-600 to-cyan-600',
    badge: 'REGIONAL PAY',
  },
};

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState<IntegrationItem | null>(null);
  const [updating, setUpdating] = useState(false);

  // Edit form state
  const [isEnabled, setIsEnabled] = useState(false);
  const [environment, setEnvironment] = useState('sandbox');
  const [phoneId, setPhoneId] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [stripeKey, setStripeKey] = useState('pk_test_placeholder_key');
  const [stripeWebhook, setStripeWebhook] = useState('http://localhost:5000/api/webhooks/stripe');
  const [stripeCurrency, setStripeCurrency] = useState('USD');
  const [testingStripe, setTestingStripe] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/integrations');
      setIntegrations(res.data || []);
    } catch (err) {
      console.error('Failed to load integrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleOpenEdit = (item: IntegrationItem) => {
    setEditingProvider(item);
    setIsEnabled(item.isEnabled);
    setEnvironment(item.environment || 'sandbox');
    setPhoneId(item.config?.phoneId || '');
    setMerchantId(item.config?.merchantId || '');
    setWebhookUrl(item.config?.webhookUrl || '');
    setStripeTestResult(null);
  };

  const handleTestStripe = async () => {
    setTestingStripe(true);
    setStripeTestResult(null);
    try {
      const res = await api.post('/integrations/test-stripe');
      setStripeTestResult({
        success: true,
        message: res.data?.message || 'Stripe API connection verified and active!',
      });
      fetchIntegrations();
    } catch (err: any) {
      setStripeTestResult({
        success: false,
        message: err.response?.data?.message || 'Failed to ping Stripe API.',
      });
    } finally {
      setTestingStripe(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    setUpdating(true);
    try {
      await api.put(`/integrations/${editingProvider.provider}`, {
        isEnabled,
        environment,
        status: isEnabled ? 'connected' : 'disconnected',
        config: {
          phoneId,
          merchantId: editingProvider.provider === 'stripe' ? (stripeKey ? 'acct_stripe_live' : merchantId) : merchantId,
          webhookUrl: editingProvider.provider === 'stripe' ? stripeWebhook : webhookUrl,
        },
      });
      setEditingProvider(null);
      fetchIntegrations();
    } catch (err) {
      console.error('Failed to update integration', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">
              Third-Party Integrations Hub
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              PCI & WhatsApp Ready · §8 & §10
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Configure regional payment gateways and WhatsApp Business API credentials metadata
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-700 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PCI-DSS Tokenization Protected</span>
        </div>
      </div>

      {/* Integration Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading active gateway adapters...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item) => {
            const meta = PROVIDER_INFO[item.provider] || {
              name: item.provider.toUpperCase(),
              category: 'Integration',
              description: 'Custom external API integration',
              color: 'from-slate-600 to-slate-800',
              badge: 'CUSTOM',
            };

            const isConn = item.status === 'connected' && item.isEnabled;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shadow-sm`}
                      >
                        {item.provider === 'whatsapp' ? (
                          <MessageCircle className="w-5 h-5" />
                        ) : (
                          <CreditCard className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{meta.name}</h3>
                        <p className="text-[10px] text-slate-400 uppercase font-semibold">{meta.category}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        isConn
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {isConn ? 'ACTIVE / CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">{meta.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Environment:</span>
                      <span className="font-bold uppercase text-slate-800">{item.environment || 'sandbox'}</span>
                    </div>
                    {item.config?.phoneId && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Sender Phone ID:</span>
                        <span className="font-semibold text-slate-800">{item.config.phoneId}</span>
                      </div>
                    )}
                    {item.config?.merchantId && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Merchant Account ID:</span>
                        <span className="font-semibold text-slate-800">{item.config.merchantId}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">API Key Mask:</span>
                      <span className="font-mono text-slate-800">{item.config?.apiKeyMasked || '••••••••'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    {item.config?.lastSyncedAt
                      ? `Synced ${new Date(item.config.lastSyncedAt).toLocaleDateString()}`
                      : 'Not synced'}
                  </span>
                  <div className="flex items-center gap-2">
                    {item.provider === 'whatsapp' && (
                      <a
                        href="https://wa.me/923264414694?text=Hi%20Neuroviax%20AI!%20Testing%20WhatsApp%20API%20integration."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        title="Chat on WhatsApp: 03264414694"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat WhatsApp (03264414694)</span>
                      </a>
                    )}
                    {item.provider === 'stripe' && (
                      <button
                        onClick={handleTestStripe}
                        disabled={testingStripe}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${testingStripe ? 'animate-spin' : ''}`} />
                        <span>{testingStripe ? 'Pinging...' : 'Test Stripe API'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      <span>Configure</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Integration Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${
                    PROVIDER_INFO[editingProvider.provider]?.color || 'from-slate-500 to-slate-700'
                  } flex items-center justify-center text-white font-black text-xs`}
                >
                  <Plug className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {PROVIDER_INFO[editingProvider.provider]?.name || editingProvider.provider}
                  </h3>
                  <p className="text-[10px] text-slate-400">Credential & Endpoint Configuration</p>
                </div>
              </div>
              <button
                onClick={() => setEditingProvider(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="font-bold text-slate-700 block">Integration Status</span>
                  <span className="text-[10px] text-slate-400">Toggle live activation</span>
                </div>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Environment Mode</label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 uppercase font-bold"
                >
                  <option value="sandbox">Sandbox / Testing</option>
                  <option value="production">Production Live</option>
                </select>
              </div>

              {editingProvider.provider === 'whatsapp' ? (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone Number / Sender ID</label>
                    <input
                      type="text"
                      placeholder="+92 326 4414694"
                      value={phoneId}
                      onChange={(e) => setPhoneId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Webhook Callback URL</label>
                    <input
                      type="text"
                      placeholder="https://api.neuroviax.ai/webhook/whatsapp"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </>
              ) : editingProvider.provider === 'stripe' ? (
                <>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Stripe Publishable Key</label>
                    <input
                      type="text"
                      placeholder="pk_test_••••••••••••••••"
                      value={stripeKey}
                      onChange={(e) => setStripeKey(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Stripe Webhook Endpoint</label>
                    <input
                      type="text"
                      placeholder="http://localhost:5000/api/webhooks/stripe"
                      value={stripeWebhook}
                      onChange={(e) => setStripeWebhook(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Default Settlement Currency</label>
                    <select
                      value={stripeCurrency}
                      onChange={(e) => setStripeCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                    >
                      <option value="USD">USD ($) - Global</option>
                      <option value="PKR">PKR (₨) - Pakistan</option>
                      <option value="EUR">EUR (€) - Europe</option>
                      <option value="GBP">GBP (£) - United Kingdom</option>
                    </select>
                  </div>
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-950 block">Live Stripe API Ping</span>
                      <span className="text-[10px] text-indigo-700">Test credentials against Stripe balance endpoint</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestStripe}
                      disabled={testingStripe}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
                    >
                      {testingStripe ? 'Testing...' : 'Test Connection'}
                    </button>
                  </div>
                  {stripeTestResult && (
                    <div className={`p-3 rounded-xl text-xs font-bold border ${stripeTestResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'}`}>
                      {stripeTestResult.message}
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Merchant / Account ID</label>
                  <input
                    type="text"
                    placeholder="e.g. MC-109283"
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-relaxed">
                <strong>Security Notice:</strong> In adherence to Section 12.3 compliance, live secret keys are tokenized through environment variables and never stored unencrypted in tenant collections.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {updating ? 'Saving...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Integrations;
