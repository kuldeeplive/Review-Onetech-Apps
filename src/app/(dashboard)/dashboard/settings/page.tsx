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
  Database,
  Lock,
  KeyRound,
  ShieldCheck,
  Building2,
  Layers,
  MessageSquareWarning,
  Globe2,
  Check,
  ArrowRight,
  Eye,
  Sliders,
  Smartphone,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [error, setError] = useState('');

  // Active Tab: 'ai_flow' | 'business_profile' | 'feedback_gating' | 'notifications' | 'security'
  const [activeTab, setActiveTab] = useState<'ai_flow' | 'business_profile' | 'feedback_gating' | 'notifications' | 'security'>('ai_flow');

  const [formData, setFormData] = useState({
    name: '',
    category: 'IT & Software',
    bio: '',
    services: 'Custom Web Development, Mobile Apps, UI/UX Design, Cloud Solutions',
    googleReviewUrl: '',
    minPositiveRating: 4,
    collectFeedbackOnLowRating: true,
    issueCategories: 'Service Speed, Product Quality, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue',
    enableDiscountOffer: true,
    enableAiReview: true,
    enableServices: true,
    enablePositiveTags: true,
    enableLanguageSelection: true,
    selectedLanguages: 'English, Hinglish, Hindi, Gujarati, Marathi, Punjabi, Bengali, Tamil, Telugu, Arabic, Spanish',
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

  // Change Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const ALL_LANGUAGES = [
    { id: 'English', label: '🇬🇧 English' },
    { id: 'Hinglish', label: '🇮🇳 Hinglish' },
    { id: 'Hindi', label: '🇮🇳 हिंदी' },
    { id: 'Gujarati', label: '🇮🇳 ગુજરાતી' },
    { id: 'Marathi', label: '🇮🇳 मराठी' },
    { id: 'Punjabi', label: '🇮🇳 ਪੰਜਾਬੀ' },
    { id: 'Bengali', label: '🇮🇳 বাংলা' },
    { id: 'Tamil', label: '🇮🇳 தமிழ்' },
    { id: 'Telugu', label: '🇮🇳 తెలుగు' },
    { id: 'Arabic', label: '🇦🇪 العربية' },
    { id: 'Spanish', label: '🇪🇸 Español' },
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setPasswordSuccess(data.message || 'Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

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
          category: data.business.category || 'IT & Software',
          bio: data.business.bio || '',
          services: data.business.services || 'Custom Web Development, Mobile Apps, UI/UX Design, Cloud Solutions',
          googleReviewUrl: data.business.googleReviewUrl || '',
          minPositiveRating: data.business.minPositiveRating || 4,
          collectFeedbackOnLowRating: data.business.collectFeedbackOnLowRating ?? true,
          issueCategories: data.business.issueCategories || 'Service Speed, Product Quality, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue',
          enableDiscountOffer: data.business.enableDiscountOffer ?? true,
          enableAiReview: data.business.enableAiReview ?? true,
          enableServices: data.business.enableServices ?? true,
          enablePositiveTags: data.business.enablePositiveTags ?? true,
          enableLanguageSelection: data.business.enableLanguageSelection ?? true,
          selectedLanguages: data.business.selectedLanguages || 'English, Hinglish, Hindi, Gujarati, Marathi, Punjabi, Bengali, Tamil, Telugu, Arabic, Spanish',
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      setSaveSuccess('All settings updated and saved successfully! ✨');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading Settings Portal...
      </div>
    );
  }

  const reviewUrl = user?.business?.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/review/${user.business.slug}`
    : '';

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 pb-28">
      <Navbar user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Toast Alerts */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-bounce-short">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
              >
                <span>View Live Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-lg shrink-0"
              style={{ backgroundColor: formData.primaryColor || '#2563eb' }}
            >
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'B'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {formData.name || 'Business Settings'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
                  {formData.category || 'Business'}
                </span>
                {user?.business?.planName && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    {user.business.planName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customize your Google Review routing, AI review generator, branding, alerts, and security.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-200 shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Preview</span>
              </a>
            )}
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* MODERN TAB NAVIGATION */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200/80">
          {[
            {
              id: 'ai_flow',
              label: 'AI Review & Routing',
              icon: Sparkles,
              badge: 'Core',
            },
            {
              id: 'business_profile',
              label: 'Business & Services',
              icon: Building2,
              badge: null,
            },
            {
              id: 'feedback_gating',
              label: 'Private Feedback & Vouchers',
              icon: MessageSquareWarning,
              badge: null,
            },
            {
              id: 'notifications',
              label: 'Instant Alerts',
              icon: Bell,
              badge: formData.whatsappAlertEnabled ? 'WhatsApp ON' : null,
            },
            {
              id: 'security',
              label: 'Account Security',
              icon: Lock,
              badge: null,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.01]'
                    : 'bg-white text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 border border-slate-200/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: AI REVIEW & ROUTING FLOW                                           */}
          {/* ========================================================================= */}
          {activeTab === 'ai_flow' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 1. Google Maps URL Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Link2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      1. Google Maps Review Link
                    </h2>
                    <p className="text-xs text-slate-500">
                      Happy customers will be automatically directed to this URL to post their 5-star Google review.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      required
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                      value={formData.googleReviewUrl}
                      onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono"
                    />
                    {formData.googleReviewUrl && (
                      <a
                        href={formData.googleReviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition shrink-0 flex items-center justify-center gap-1.5 border border-blue-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Test Google Link</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Star Redirection Threshold */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      2. Minimum Star Redirection Threshold
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select which ratings qualify for Google redirection vs private internal feedback gating.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {[
                    {
                      stars: 3,
                      label: '3+ Stars & Above',
                      desc: '3, 4, 5 stars go to Google. 1 & 2 stars intercepted.',
                      recommended: false,
                    },
                    {
                      stars: 4,
                      label: '4+ Stars & Above',
                      desc: '4 & 5 stars go to Google. 1, 2, 3 stars intercepted.',
                      recommended: true,
                    },
                    {
                      stars: 5,
                      label: 'Only 5 Stars',
                      desc: 'Strict mode: Pure 5-star ratings only go to Google.',
                      recommended: false,
                    },
                  ].map((opt) => (
                    <div
                      key={opt.stars}
                      onClick={() => setFormData({ ...formData, minPositiveRating: opt.stars })}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                        formData.minPositiveRating === opt.stars
                          ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {opt.recommended && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider shadow-xs">
                          Recommended
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="flex items-center">
                            {Array.from({ length: opt.stars }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <span className="font-black text-slate-900 text-xs ml-1">
                            {opt.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">{opt.desc}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-700">
                        <span>{formData.minPositiveRating === opt.stars ? '✓ Selected' : 'Click to choose'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. AI Review Assistant Master & Granular Customer Screen Controls */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        3. AI Smart Review Assistant
                      </h2>
                      <p className="text-xs text-slate-500">
                        Empowers customers to craft personalized, high-converting 5-star reviews in 1 second.
                      </p>
                    </div>
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

                {formData.enableAiReview ? (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                      <div>
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wider block">
                          🎛️ Customer Review Screen Options:
                        </span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Turn individual options ON or OFF depending on what you want your customers to see.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Sub-toggle 1: Services Chips */}
                        <div
                          onClick={() => setFormData({ ...formData, enableServices: !formData.enableServices })}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                            formData.enableServices
                              ? 'border-blue-600 bg-white shadow-xs'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="block font-black text-xs text-slate-900">
                              📦 Services Chips
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formData.enableServices ? 'Visible to Customer' : 'Hidden'}
                            </span>
                          </div>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${formData.enableServices ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                            {formData.enableServices ? 'ON' : 'OFF'}
                          </span>
                        </div>

                        {/* Sub-toggle 2: Praise Tags */}
                        <div
                          onClick={() => setFormData({ ...formData, enablePositiveTags: !formData.enablePositiveTags })}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                            formData.enablePositiveTags
                              ? 'border-amber-500 bg-white shadow-xs'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="block font-black text-xs text-slate-900">
                              ⭐ Praise Tags
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formData.enablePositiveTags ? 'Visible to Customer' : 'Hidden'}
                            </span>
                          </div>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${formData.enablePositiveTags ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                            {formData.enablePositiveTags ? 'ON' : 'OFF'}
                          </span>
                        </div>

                        {/* Sub-toggle 3: Multi-Language */}
                        <div
                          onClick={() => setFormData({ ...formData, enableLanguageSelection: !formData.enableLanguageSelection })}
                          className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                            formData.enableLanguageSelection
                              ? 'border-indigo-600 bg-white shadow-xs'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <span className="block font-black text-xs text-slate-900">
                              🌐 Languages
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formData.enableLanguageSelection ? 'Visible to Customer' : 'Hidden'}
                            </span>
                          </div>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${formData.enableLanguageSelection ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-600'}`}>
                            {formData.enableLanguageSelection ? 'ON' : 'OFF'}
                          </span>
                        </div>
                      </div>

                      {/* Language Whitelist Selector */}
                      {formData.enableLanguageSelection && (
                        <div className="pt-2 border-t border-indigo-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-extrabold text-indigo-950">
                              🌍 Active Languages for Customers (Click to toggle on/off):
                            </label>
                            <span className="text-[10px] font-bold text-indigo-600">
                              {formData.selectedLanguages.split(',').filter(Boolean).length} Active
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {ALL_LANGUAGES.map((lang) => {
                              const activeList = formData.selectedLanguages.split(',').map((s) => s.trim());
                              const isChecked = activeList.includes(lang.id);
                              return (
                                <button
                                  key={lang.id}
                                  type="button"
                                  onClick={() => {
                                    let updated: string[];
                                    if (isChecked) {
                                      if (activeList.length === 1) {
                                        alert('At least one language must remain selected.');
                                        return;
                                      }
                                      updated = activeList.filter((l) => l !== lang.id);
                                    } else {
                                      updated = [...activeList, lang.id];
                                    }
                                    setFormData({ ...formData, selectedLanguages: updated.join(', ') });
                                  }}
                                  className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 ${
                                    isChecked
                                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  <span>{isChecked ? '✓' : '+'}</span>
                                  <span>{lang.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    ℹ️ AI Review assistant is currently turned off. 4/5 star customers will be shown the thank you screen and directly redirected to Google.
                  </div>
                )}
              </div>

              {/* 4. Positive Thank You Message */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <label className="block text-xs font-extrabold text-slate-900">
                  4. Positive Rating Thank You Message
                </label>
                <textarea
                  rows={2}
                  value={formData.positiveMessage}
                  onChange={(e) => setFormData({ ...formData, positiveMessage: e.target.value })}
                  placeholder="We're thrilled you had a great experience! Would you take 10 seconds to share your review on Google?"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BUSINESS PROFILE & SERVICES                                        */}
          {/* ========================================================================= */}
          {activeTab === 'business_profile' && (
            <div className="space-y-6 animate-fadeIn">
              {/* 1-Click Industry Presets Bar */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h2 className="text-base font-extrabold text-slate-900">
                      ⚡ 1-Click Industry Presets
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click your industry to instantly pre-fill Category, Bio, Services & Positive Praise tags.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    {
                      name: '💻 Tech Company / Agency',
                      category: 'IT & Software Solutions',
                      bio: 'We build custom web applications, mobile apps, UI/UX designs, and cloud software solutions.',
                      services: 'Custom Web Development, Mobile Apps, UI/UX Design, Cloud Hosting, API Integration',
                      positiveTags: 'Top Quality, Fast Delivery, Great Support, Professional Team, Highly Recommended',
                      issueCategories: 'Project Delay, Technical Bug, Communication Lag, Pricing / Scope, Other Issue',
                    },
                    {
                      name: '🍽️ Restaurant / Cafe',
                      category: 'Restaurant & Cafe',
                      bio: 'Authentic gourmet dining, delicious meals, cozy ambience, and refreshing beverages.',
                      services: 'Dine-in, Takeaway / Delivery, Main Course, Fast Food, Desserts & Drinks',
                      positiveTags: 'Delicious Food, Fast Service, Great Ambiance, Friendly Staff, Value for Money',
                      issueCategories: 'Food Quality, Order Delay, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue',
                    },
                    {
                      name: '🏥 Hospital / Clinic',
                      category: 'Healthcare & Clinic',
                      bio: 'Comprehensive healthcare, experienced doctors, modern diagnostics, and compassionate patient care.',
                      services: 'Doctor Consultation, Dental Care, Lab Tests, Pharmacy, Emergency Care',
                      positiveTags: 'Best Doctors, Caring Nursing Staff, Clean Premises, Painless Treatment, Quick Recovery',
                      issueCategories: 'Doctor Consultation, Long Wait Time, Staff Behavior, Hygiene, Billing / Pharmacy, Other Issue',
                    },
                    {
                      name: '💇 Salon, Spa & Beauty',
                      category: 'Salon & Spa',
                      bio: 'Premium hair styling, relaxing skincare spa, bridal makeovers, and grooming services.',
                      services: 'Haircut & Styling, Facial & Cleanup, Body Spa, Hair Color, Bridal Makeup',
                      positiveTags: 'Skilled Stylists, Relaxing Ambience, Premium Products, Great Haircut, Friendly Staff',
                      issueCategories: 'Hair / Skin Service, Long Wait Time, Staff Behavior, Hygiene, Pricing, Other Issue',
                    },
                    {
                      name: '🛍️ Retail Store / Showroom',
                      category: 'Retail & Shopping',
                      bio: 'Wide range of quality products, trending collections, and great shopping experience.',
                      services: 'In-store Shopping, Home Delivery, Product Warranty, Exchange / Return, Gift Vouchers',
                      positiveTags: 'Huge Variety, Top Quality, Helpful Staff, Easy Billing, Great Discounts',
                      issueCategories: 'Product Quality, Size / Fitting, Staff Assistance, Billing Queue, Pricing, Other Issue',
                    },
                    {
                      name: '🏋️ Gym & Fitness',
                      category: 'Fitness & Gym',
                      bio: 'State-of-the-art gym equipment, certified personal training, and healthy fitness coaching.',
                      services: 'Gym Membership, Personal Training, Weight Loss Program, Cardio & Yoga, Diet Plan',
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
                          category: preset.category,
                          bio: preset.bio,
                          services: preset.services,
                          positiveTags: preset.positiveTags,
                          issueCategories: preset.issueCategories,
                        })
                      }
                      className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-800 text-xs font-extrabold transition shadow-2xs"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Details */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      Business Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      Business Category / Industry
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. IT Solutions, Restaurant, Clinic, Salon"
                      className="w-full px-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Business Bio / Description (AI Context)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Brief 1-2 sentence description of what your business does."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Services List */}
                <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>🛍️ Services & Products List (Customer Selection Chips)</span>
                    </label>
                    <span className="text-[10px] text-blue-600 font-bold">Comma-separated</span>
                  </div>
                  <input
                    type="text"
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    placeholder="e.g. Custom Web Development, Mobile Apps, UI/UX Design, Cloud Hosting"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white font-medium focus:outline-none"
                  />
                  {/* Chips Preview */}
                  {formData.services && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.services
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((svc, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 text-[11px] font-bold shadow-2xs"
                          >
                            📦 {svc}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Positive Praise Tags */}
                <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <span>⭐ Positive Praise Tags ("What did you like best?")</span>
                    </label>
                    <span className="text-[10px] text-amber-700 font-bold">Comma-separated</span>
                  </div>
                  <input
                    type="text"
                    value={formData.positiveTags}
                    onChange={(e) => setFormData({ ...formData, positiveTags: e.target.value })}
                    placeholder="e.g. Top Quality, Fast Delivery, Great Support, Professional Team"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white font-medium focus:outline-none"
                  />
                  {/* Chips Preview */}
                  {formData.positiveTags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.positiveTags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-800 text-[11px] font-bold shadow-2xs"
                          >
                            ⭐ {tag}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Primary Theme Color */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-2">
                    🎨 Brand Theme Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shadow-2xs"
                    />
                    <div className="flex gap-2">
                      {['#2563eb', '#e11d48', '#7c3aed', '#059669', '#d97706', '#0f172a'].map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => setFormData({ ...formData, primaryColor: c })}
                          className={`w-8 h-8 rounded-xl border-2 transition hover:scale-110 shadow-2xs ${
                            formData.primaryColor === c ? 'border-slate-900 scale-105' : 'border-white'
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: NEGATIVE FEEDBACK GATING & APOLOGY VOUCHERS                        */}
          {/* ========================================================================= */}
          {activeTab === 'feedback_gating' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Private Feedback Form Switch */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <MessageSquareWarning className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        1. Collect Private Customer Feedback on Low Ratings
                      </h2>
                      <p className="text-xs text-slate-500">
                        Captures customer complaints privately so they don't post negative reviews on Google Maps.
                      </p>
                    </div>
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

                {formData.collectFeedbackOnLowRating ? (
                  <div className="space-y-4 pt-1">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                        <span>🚨 Low Rating Issue Categories</span>
                        <span className="text-[10px] text-rose-600 font-bold">Comma-separated</span>
                      </label>
                      <input
                        type="text"
                        value={formData.issueCategories}
                        onChange={(e) => setFormData({ ...formData, issueCategories: e.target.value })}
                        placeholder="e.g. Service Speed, Product Quality, Staff Behavior, Cleanliness, Pricing"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
                      />
                      {formData.issueCategories && (
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {formData.issueCategories
                            .split(',')
                            .map((c) => c.trim())
                            .filter(Boolean)
                            .map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold"
                              >
                                • {cat}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                        Private Feedback Apology Message
                      </label>
                      <textarea
                        rows={2}
                        value={formData.negativeMessage}
                        onChange={(e) => setFormData({ ...formData, negativeMessage: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    ℹ️ Private form is turned off. Low rating customers will receive a polite thank you note without requesting their phone or feedback.
                  </div>
                )}
              </div>

              {/* Apology Voucher Card */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Ticket className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        2. Apology Discount Voucher / Coupon
                      </h2>
                      <p className="text-xs text-slate-500">
                        Reward dissatisfied customers with a discount voucher to encourage a repeat visit and win them back.
                      </p>
                    </div>
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

                {formData.enableDiscountOffer && (
                  <div className="space-y-4 pt-1 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                          Voucher Title
                        </label>
                        <input
                          type="text"
                          value={formData.discountOfferTitle}
                          onChange={(e) => setFormData({ ...formData, discountOfferTitle: e.target.value })}
                          placeholder="e.g. Special 10% Discount Offer"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          value={formData.discountOfferCode}
                          onChange={(e) => setFormData({ ...formData, discountOfferCode: e.target.value })}
                          placeholder="e.g. THANKYOU10"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none font-mono uppercase font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                        Voucher Redemption Instructions
                      </label>
                      <textarea
                        rows={2}
                        value={formData.discountOfferText}
                        onChange={(e) => setFormData({ ...formData, discountOfferText: e.target.value })}
                        placeholder="e.g. Show this coupon code on your next visit to receive 10% off."
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: INSTANT ALERTS & NOTIFICATIONS                                     */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Real-Time Negative Feedback Alerts
                    </h2>
                    <p className="text-xs text-slate-500">
                      Get alerted instantly on WhatsApp or Email whenever a customer submits private negative feedback.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* WhatsApp Alerts */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        Manager WhatsApp Alerts
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                        Active
                      </span>
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={formData.notificationPhone}
                        onChange={(e) => setFormData({ ...formData, notificationPhone: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Instant WhatsApp alert will be sent with customer's name, rating, and complaint reason.
                    </p>
                  </div>

                  {/* Email Alerts */}
                  <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-blue-600" />
                        Notification Email Address
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold uppercase">
                        Active
                      </span>
                    </div>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="manager@business.com"
                        value={formData.notificationEmail}
                        onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Daily digest and emergency ticket copies will be dispatched to this mailbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: ACCOUNT SECURITY & CHANGE PASSWORD                                */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">
                        Account Security & Password
                      </h2>
                      <p className="text-xs text-slate-500">
                        Update your password and review active account authentication details.
                      </p>
                    </div>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="Min 6 characters"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        placeholder="Repeat new password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={passwordLoading || !passwordData.currentPassword || !passwordData.newPassword}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition disabled:opacity-40 flex items-center gap-2"
                  >
                    {passwordLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <KeyRound className="w-3.5 h-3.5" />
                    )}
                    <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </div>
              </div>

              {/* Account Info Card */}
              <div className="bg-slate-100/70 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    Logged in as <strong>{user?.email}</strong> (Role: <span className="font-mono font-bold text-slate-800">{user?.role}</span>)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Business ID: <code className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">{user?.businessId}</code>
                </span>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* FLOATING STICKY SAVE BAR AT BOTTOM */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-8 z-40 shadow-lg animate-slideUp">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
            <span className="text-xs font-bold text-slate-700 hidden sm:inline-block">
              {saving ? 'Saving changes...' : 'Ready to save changes'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {reviewUrl && (
              <a
                href={reviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition border border-slate-300 flex items-center gap-1.5 shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>Test Live Review</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md shadow-blue-500/25 transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shrink-0"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
