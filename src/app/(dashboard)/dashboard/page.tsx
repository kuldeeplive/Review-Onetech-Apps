'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Star,
  MessageSquareWarning,
  QrCode,
  CheckCircle2,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Copy,
  ExternalLink,
  Filter,
  Check,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Receipt,
  CreditCard,
  Calendar,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  // Selected feedback for resolution note editing
  const [editingFeedback, setEditingFeedback] = useState<any>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.authenticated) {
        router.push('/login');
        return;
      }
      setUser(meData.user);

      const [feedbackRes, subRes] = await Promise.all([
        fetch(`/api/feedback?status=${activeFilter}`),
        fetch('/api/business/subscription'),
      ]);

      const feedbackData = await feedbackRes.json();
      setFeedbacks(feedbackData.feedbacks || []);
      setMetrics(feedbackData.metrics || null);

      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscriptionData(subData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeFilter]);

  const handleCopyLink = () => {
    if (!user?.business?.slug) return;
    const url = `${window.location.origin}/review/${user.business.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUpdateStatus = async (feedbackId: string, newStatus: string, note?: string) => {
    try {
      const res = await fetch('/api/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId,
          status: newStatus,
          resolutionNote: note,
        }),
      });

      if (res.ok) {
        setFeedbacks((prev) =>
          prev.map((f) =>
            f.id === feedbackId
              ? { ...f, status: newStatus, resolutionNote: note ?? f.resolutionNote }
              : f
          )
        );
        setEditingFeedback(null);
        setUpdateSuccess('Feedback status updated!');
        setTimeout(() => setUpdateSuccess(''), 3000);
        // Refresh metrics
        const mRes = await fetch('/api/feedback');
        const mData = await mRes.json();
        setMetrics(mData.metrics);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading Business Dashboard...
      </div>
    );
  }

  const reviewUrl = user.business ? `${typeof window !== 'undefined' ? window.location.origin : ''}/review/${user.business.slug}` : '';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Toast Alert */}
        {updateSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-sm animate-bounce-short">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{updateSuccess}</span>
          </div>
        )}

        {/* PLAN EXPIRY LOCK WARNING */}
        {(() => {
          const isExpired = user.business?.planExpiresAt
            ? new Date(user.business.planExpiresAt) < new Date()
            : false;
          const isPaused = user.business?.isActive === false;

          if (isExpired || isPaused) {
            return (
              <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 text-white shadow-xl shadow-rose-600/20 border border-rose-400/40 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">
                        {isExpired ? '⚠️ Subscription Plan Expired' : '⚠️ Account Paused / Inactive'}
                      </h3>
                      <p className="text-xs text-rose-100 mt-0.5">
                        {isExpired
                          ? `Your plan (${user.business?.planName || 'Plan'}) expired on ${formatDate(user.business.planExpiresAt)}. Public review redirects & QR scans are currently locked.`
                          : 'Your business review portal has been paused by the administrator.'}
                      </p>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="inline-block px-3.5 py-1.5 rounded-xl bg-white text-rose-700 font-extrabold text-xs shadow-md">
                      Contact Admin to Renew
                    </span>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Top Banner with Review Link */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/15 mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold mb-3 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Reputation Protection Active</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {user.business?.name || 'Business Dashboard'}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                Ratings of <strong>{user.business?.minPositiveRating || 4}+ Stars</strong> go directly to Google Reviews. Negative ratings are intercepted below for immediate damage control.
              </p>
            </div>

            {/* Quick Share Link Box */}
            <div className="bg-slate-950/40 backdrop-blur-md p-4 rounded-2xl border border-white/15 max-w-md w-full">
              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-2">
                Your Public Review QR Link
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={reviewUrl}
                  className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-blue-50 font-mono focus:outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  title="Copy link"
                  className="px-3 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold transition shrink-0 flex items-center gap-1 shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={`/review/${user.business?.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition shrink-0"
                  title="Open live review page"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plan, Limits & Expiry Details Card */}
        {subscriptionData && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      {subscriptionData.plan?.name || 'Active Plan'}
                    </h3>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      {subscriptionData.plan?.isExpired ? 'Expired' : 'Active Subscription'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Price: <strong>{subscriptionData.plan?.price || 'Included'}</strong> • Reputation Protection Active
                  </p>
                </div>
              </div>

              {/* Expiry Badge */}
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan Expiry Date</p>
                  <p className="text-xs font-black text-slate-900 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {subscriptionData.plan?.expiresAt ? formatDate(subscriptionData.plan.expiresAt) : 'Lifetime Validity'}
                    {subscriptionData.plan?.daysRemaining !== null && (
                      <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        subscriptionData.plan.daysRemaining <= 15
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        ({subscriptionData.plan.daysRemaining} days left)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Scans Usage Quota Meter */}
            <div className="py-4 border-b border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  Monthly QR Scan Quota:
                </span>
                <span className="font-extrabold text-slate-900">
                  {subscriptionData.plan?.monthlyScanLimit === -1
                    ? `${subscriptionData.plan?.scansThisMonth} Scans (Unlimited Plan)`
                    : `${subscriptionData.plan?.scansThisMonth} / ${subscriptionData.plan?.monthlyScanLimit} Scans (${Math.round((subscriptionData.plan?.scansThisMonth / subscriptionData.plan?.monthlyScanLimit) * 100)}%)`}
                </span>
              </div>

              {subscriptionData.plan?.monthlyScanLimit !== -1 && (
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (subscriptionData.plan?.scansThisMonth / subscriptionData.plan?.monthlyScanLimit) >= 0.9
                        ? 'bg-rose-500'
                        : (subscriptionData.plan?.scansThisMonth / subscriptionData.plan?.monthlyScanLimit) >= 0.7
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(2, Math.round((subscriptionData.plan?.scansThisMonth / subscriptionData.plan?.monthlyScanLimit) * 100)))}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* Recent Billing / Transactions History */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  Recent Billing & Subscription Transactions:
                </h4>
              </div>

              {subscriptionData.transactions && subscriptionData.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-2.5 px-3 rounded-l-xl">Date</th>
                        <th className="py-2.5 px-3">Plan / Description</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 rounded-r-xl text-right">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subscriptionData.transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-medium text-slate-600">
                            {formatDate(tx.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-800">
                            {tx.planName}
                            {tx.notes && <span className="block text-[10px] text-slate-400 font-normal">{tx.notes}</span>}
                          </td>
                          <td className="py-2.5 px-3 font-black text-slate-900">
                            {tx.amount}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500 font-semibold">
                            {tx.paymentMethod || 'Direct Admin'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No transactions recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total QR Scans</span>
                <QrCode className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{metrics.totalScans}</p>
              <span className="text-[11px] text-slate-500 font-medium">Customer interactions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">5-Star Google Leads</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">{metrics.positiveRedirects}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">Redirected to Google</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Filtered Feedbacks</span>
                <MessageSquareWarning className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">{metrics.totalFeedbacks}</p>
              <span className="text-[11px] text-amber-700 font-semibold">Saved privately here</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
                <Clock className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-600">{metrics.pendingCount}</p>
              <span className="text-[11px] text-rose-600 font-semibold">Needs manager follow-up</span>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header & Filter Tabs */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-amber-500" />
                Customer Private Feedback Inbox
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Customers who gave less than {user.business?.minPositiveRating || 4} stars. Call or WhatsApp them to resolve their issues privately.
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              {['ALL', 'PENDING', 'CONTACTED', 'RESOLVED'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeFilter === tab
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Cards List */}
          <div className="p-4 sm:p-6 space-y-4">
            {feedbacks.length === 0 ? (
              <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">No feedback in this category!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your customers are happy or all pending issues have been resolved.
                </p>
              </div>
            ) : (
              feedbacks.map((f) => {
                const cleanPhone = f.customerPhone ? f.customerPhone.replace(/[^0-9]/g, '') : '';
                const whatsappText = encodeURIComponent(
                  `Hello ${f.customerName || 'Customer'}, this is the manager from ${user.business?.name}. Thank you for your recent feedback. We would love to make things right for you!`
                );

                return (
                  <div
                    key={f.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                      {/* Customer Name & Stars */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-black">{f.rating}/5</span>
                        </div>

                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">
                            {f.customerName || 'Anonymous Customer'}
                          </h4>
                          <p className="text-[11px] text-slate-400">{formatDate(f.createdAt)}</p>
                        </div>
                      </div>

                      {/* Issue Category & Status Badge */}
                      <div className="flex items-center gap-2">
                        {f.issueCategory && (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                            {f.issueCategory}
                          </span>
                        )}

                        <span
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                            f.status === 'PENDING'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : f.status === 'CONTACTED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {f.status}
                        </span>
                      </div>
                    </div>

                    {/* Feedback Comment */}
                    <div className="bg-slate-50 p-3.5 rounded-xl text-xs text-slate-700 font-medium leading-relaxed">
                      "{f.comment}"
                    </div>

                    {/* Resolution Note if any */}
                    {f.resolutionNote && (
                      <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                        <strong>Resolution Note:</strong> {f.resolutionNote}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        {f.customerPhone && (
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {f.customerPhone}
                          </span>
                        )}
                        {f.customerEmail && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {f.customerEmail}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Instant WhatsApp Button */}
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${whatsappText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}

                        {/* Direct Call Button */}
                        {cleanPhone && (
                          <a
                            href={`tel:${f.customerPhone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call
                          </a>
                        )}

                        {/* Update Status Dropdown / Action */}
                        <button
                          onClick={() => {
                            setEditingFeedback(f);
                            setResolutionText(f.resolutionNote || '');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200"
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* Resolution Modal */}
      {editingFeedback && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Resolve Feedback #{editingFeedback.id.slice(-4)}
              </h3>
              <button
                onClick={() => setEditingFeedback(null)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Update Issue Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['PENDING', 'CONTACTED', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingFeedback({ ...editingFeedback, status: st })}
                      className={`py-2 text-xs font-bold rounded-xl transition ${
                        editingFeedback.status === st
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Resolution / Internal Staff Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="e.g. Spoke with customer, offered free voucher for next visit. Customer was happy."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFeedback(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateStatus(editingFeedback.id, editingFeedback.status, resolutionText)
                  }
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition"
                >
                  Save & Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
