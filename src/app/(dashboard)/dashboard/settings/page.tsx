'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Star,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Link2,
  Palette,
  Bell,
  Ticket,
  ExternalLink,
  Save,
  RefreshCw,
  Phone,
  Mail,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
  Database,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    googleReviewUrl: '',
    minPositiveRating: 4,
    collectFeedbackOnLowRating: true,
    issueCategories: 'Service Speed, Product Quality, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue',
    enableDiscountOffer: true,
    enableAiReview: true,
    positiveTags: 'Fast & Friendly, Top Quality, Great Hospitality, Value for Money, Highly Recommended',
    primaryColor: '#2563eb',
    notificationPhone: '',
    notificationEmail: '',
    whatsappAlertEnabled: true,
    discountOfferTitle: 'Special 10% Discount Coupon',
    discountOfferCode: 'THANKYOU10',
    discountOfferText: 'Thank you for your valuable feedback. Show this voucher code to get 10% off on your next visit.',
    positiveMessage: "We're thrilled you had a great experience! Would you take 10 seconds to share your review on Google?",
    negativeMessage: "We are truly sorry that we didn't meet your expectations. Please share your private feedback with our management team directly so we can resolve this immediately.",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.authenticated) {
        router.push('/login');
        return;
      }
      setUser(meData.user);

      const res = await fetch('/api/business/settings');
      const data = await res.json();
      if (data.business) {
        setFormData({
          name: data.business.name || '',
          googleReviewUrl: data.business.googleReviewUrl || '',
          minPositiveRating: data.business.minPositiveRating || 4,
          collectFeedbackOnLowRating: data.business.collectFeedbackOnLowRating ?? true,
          issueCategories: data.business.issueCategories || 'Service Speed, Product Quality, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue',
          enableDiscountOffer: data.business.enableDiscountOffer ?? true,
          enableAiReview: data.business.enableAiReview ?? true,
          positiveTags: data.business.positiveTags || 'Fast & Friendly, Top Quality, Great Hospitality, Value for Money, Highly Recommended',
          primaryColor: data.business.primaryColor || '#2563eb',
          notificationPhone: data.business.notificationPhone || '',
          notificationEmail: data.business.notificationEmail || '',
          whatsappAlertEnabled: data.business.whatsappAlertEnabled ?? true,
          discountOfferTitle: data.business.discountOfferTitle || 'Special 10% Discount Coupon',
          discountOfferCode: data.business.discountOfferCode || 'THANKYOU10',
          discountOfferText: data.business.discountOfferText || '',
          positiveMessage: data.business.positiveMessage || '',
          negativeMessage: data.business.negativeMessage || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/business/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setSaveSuccess('Settings saved successfully!');
      setTimeout(() => setSaveSuccess(''), 3500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading Settings...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Toast Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-sm animate-bounce-short">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <div className="pb-6 border-b border-slate-200 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Business Settings & Routing Rules
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure star redirection thresholds, private feedback collection mode, and apology voucher options.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* SECTION 1: STAR REDIRECTION THRESHOLD */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-blue-100 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <h2 className="text-lg font-black text-slate-900">
                1. Minimum Star Redirection Threshold
              </h2>
            </div>
            <p className="text-xs text-slate-600 mb-6">
              Choose the exact star rating required to redirect customers directly to your Google Maps review page.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  stars: 3,
                  label: '3+ Stars & Above',
                  desc: '3, 4, and 5 Stars go to Google. 1 & 2 Stars intercepted.',
                  recommended: false,
                },
                {
                  stars: 4,
                  label: '4+ Stars & Above',
                  desc: '4 and 5 Stars go to Google. 1, 2, and 3 Stars intercepted.',
                  recommended: true,
                },
                {
                  stars: 5,
                  label: 'Only 5 Stars',
                  desc: 'Strict mode: Only pure 5-Star reviews go to Google.',
                  recommended: false,
                },
              ].map((opt) => (
                <div
                  key={opt.stars}
                  onClick={() => setFormData({ ...formData, minPositiveRating: opt.stars })}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                    formData.minPositiveRating === opt.stars
                      ? 'border-blue-600 bg-blue-50/50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {opt.recommended && (
                    <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider shadow-sm">
                      Recommended
                    </span>
                  )}

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: opt.stars }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="font-extrabold text-slate-900 text-sm ml-1">
                        {opt.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{opt.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700">
                      {formData.minPositiveRating === opt.stars ? '✓ Selected' : 'Click to select'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: LOW RATING DATA COLLECTION & APOLOGY TOGGLES */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  2. Low Rating Customer Data & Feedback Controls
                </h2>
                <p className="text-xs text-slate-500">
                  Decide whether you want to ask dissatisfied customers to fill out a private form or simply thank them.
                </p>
              </div>
            </div>

            {/* Toggle 1: Collect Feedback Form */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    Collect Customer Feedback & Phone on Low Ratings
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${formData.collectFeedbackOnLowRating ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {formData.collectFeedbackOnLowRating ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.collectFeedbackOnLowRating
                    ? 'Customers rating below threshold will see a private feedback form (Issue category, comment, phone number) saved to your inbox.'
                    : 'No form will be shown. Low ratings will simply receive a polite thank you / apology message without asking for any data.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, collectFeedbackOnLowRating: !formData.collectFeedbackOnLowRating })}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                  formData.collectFeedbackOnLowRating ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition" />
              </button>
            </div>

            {/* Toggle 2: Enable Discount Voucher */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">
                    Show Apology Discount Voucher Code to Dissatisfied Customers
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${formData.enableDiscountOffer ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {formData.enableDiscountOffer ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.enableDiscountOffer
                    ? 'Shows an apology discount coupon (e.g. 10% off next visit) to retain unhappy customers.'
                    : 'No voucher will be shown. Customers will only see the thank you note.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableDiscountOffer: !formData.enableDiscountOffer })}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                  formData.enableDiscountOffer ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition" />
              </button>
            </div>

            {/* Toggle 3: Enable AI Review Assistant */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    AI Review Assistant (1-Click Suggestions on High Ratings)
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${formData.enableAiReview ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {formData.enableAiReview ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {formData.enableAiReview
                    ? 'Customers who give 4 or 5 stars will see ready-to-copy AI praise tags before being redirected to Google Maps.'
                    : 'AI Review box is hidden. 4/5 star rating directly displays the thank you note and opens Google Reviews without prompts.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableAiReview: !formData.enableAiReview })}
                className={`w-14 h-8 flex items-center rounded-full p-1 transition duration-300 shrink-0 ${
                  formData.enableAiReview ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="bg-white w-6 h-6 rounded-full shadow-md transform transition" />
              </button>
            </div>
          </div>

          {/* SECTION 3: APOLOGY VOUCHER CUSTOMIZATION (IF ENABLED) */}
          {formData.enableDiscountOffer && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <Ticket className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    3. Customize Apology Voucher Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Customize the title, coupon code, and instructions shown on the customer thank you screen.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Voucher Title
                    </label>
                    <input
                      type="text"
                      value={formData.discountOfferTitle}
                      onChange={(e) => setFormData({ ...formData, discountOfferTitle: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Coupon / Voucher Code
                    </label>
                    <input
                      type="text"
                      value={formData.discountOfferCode}
                      onChange={(e) => setFormData({ ...formData, discountOfferCode: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Voucher Redemption Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={formData.discountOfferText}
                    onChange={(e) => setFormData({ ...formData, discountOfferText: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: INDUSTRY PRESETS & CUSTOM REVIEW TAGS */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  4. Customize AI Review Tags & Issue Categories
                </h2>
                <p className="text-xs text-slate-500">
                  Configure custom positive praise buttons for 5-star reviews and issue complaint tags for low ratings.
                </p>
              </div>
            </div>

            {/* 1-Click Industry Presets Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <label className="block text-xs font-bold text-slate-700">
                ⚡ 1-Click Industry Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    name: '🍽️ Restaurant / Cafe',
                    positiveTags: 'Delicious Food, Fast Service, Great Ambiance, Friendly Staff, Value for Money',
                    issueCategories: 'Food Quality, Order Delay, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue',
                  },
                  {
                    name: '🏥 Hospital / Clinic',
                    positiveTags: 'Best Doctors, Caring Nursing Staff, Clean Premises, Painless Treatment, Quick Recovery',
                    issueCategories: 'Doctor Consultation, Long Wait Time, Staff Behavior, Hygiene, Billing / Pharmacy, Other Issue',
                  },
                  {
                    name: '💻 Tech Company / Agency',
                    positiveTags: 'Fast Delivery, Clean Code, Great Communication, Helpful Support, Professional Team',
                    issueCategories: 'Project Delay, Technical Bug, Communication Lag, Pricing / Scope, Other Issue',
                  },
                  {
                    name: '💇 Salon, Spa & Beauty',
                    positiveTags: 'Skilled Stylists, Relaxing Ambience, Premium Products, Great Haircut, Friendly Staff',
                    issueCategories: 'Hair / Skin Service, Long Wait Time, Staff Behavior, Hygiene, Pricing, Other Issue',
                  },
                  {
                    name: '🛍️ Retail Store / Showroom',
                    positiveTags: 'Huge Variety, Top Quality, Helpful Staff, Easy Billing, Great Discounts',
                    issueCategories: 'Product Quality, Size / Fitting, Staff Assistance, Billing Queue, Pricing, Other Issue',
                  },
                  {
                    name: '🏋️ Gym & Fitness',
                    positiveTags: 'Modern Equipment, Certified Trainers, Clean & Sanitized, Motivating Atmosphere, Great Value',
                    issueCategories: 'Trainer Availability, Equipment Maintenance, Cleanliness, Crowd / Timing, Fee Issues, Other Issue',
                  },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        positiveTags: preset.positiveTags,
                        issueCategories: preset.issueCategories,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 text-xs font-bold transition shadow-sm"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Positive Praise Tags */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  ⭐ Positive AI Praise Tags (Shown on 4 & 5 Star Ratings)
                </label>
                <p className="text-[11px] text-slate-500">
                  Comma-separated list of buttons that customers can tap to automatically write customized AI reviews.
                </p>
                <input
                  type="text"
                  value={formData.positiveTags}
                  onChange={(e) => setFormData({ ...formData, positiveTags: e.target.value })}
                  placeholder="e.g. Delicious Food, Fast Service, Great Ambiance"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
                {/* Visual Chips Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.positiveTags
                    ?.split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold rounded-lg"
                      >
                        + {tag}
                      </span>
                    ))}
                </div>
              </div>

              {/* Low Rating Complaint Categories */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  ⚠️ Low Rating Issue Categories (Shown on &lt; Threshold Ratings)
                </label>
                <p className="text-[11px] text-slate-500">
                  Comma-separated list of complaint category buttons shown on the private customer feedback form.
                </p>
                <input
                  type="text"
                  value={formData.issueCategories}
                  onChange={(e) => setFormData({ ...formData, issueCategories: e.target.value })}
                  placeholder="e.g. Food Quality, Order Delay, Staff Behavior"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                />
                {/* Visual Chips Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formData.issueCategories
                    ?.split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold rounded-lg"
                      >
                        • {cat}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: GOOGLE MAPS REVIEW URL */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  5. Google Maps Review Link
                </h2>
                <p className="text-xs text-slate-500">
                  The direct link where happy customers will be redirected to leave their 5-star review.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  required
                  placeholder="https://search.google.com/local/writereview?placeid=ChIJ..."
                  value={formData.googleReviewUrl}
                  onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
                {formData.googleReviewUrl && (
                  <a
                    href={formData.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shrink-0 flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Test Link
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: BUSINESS BRANDING & COLOR */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <Palette className="w-4 h-4" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                5. Brand Appearance & Profile
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Business Display Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5"
                  />
                  <div className="flex gap-1.5">
                    {['#2563eb', '#e11d48', '#7c3aed', '#059669', '#d97706', '#0f172a'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormData({ ...formData, primaryColor: c })}
                        className="w-7 h-7 rounded-lg border border-slate-300 transition hover:scale-110"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: INSTANT ALERTS (WHATSAPP & EMAIL) */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  6. Instant Negative Feedback Alert System
                </h2>
                <p className="text-xs text-slate-500">
                  Receive instant notifications when a customer submits private feedback so you can contact them immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Manager WhatsApp Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.notificationPhone}
                    onChange={(e) => setFormData({ ...formData, notificationPhone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Notification Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="manager@business.com"
                    value={formData.notificationEmail}
                    onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
            >
              {saving ? 'Saving Changes...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
