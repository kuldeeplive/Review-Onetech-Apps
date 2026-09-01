'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Footer from '@/components/Footer';
import {
  Star,
  Sparkles,
  ExternalLink,
  MessageSquareWarning,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Send,
  Ticket,
  ChevronRight,
  HeartHandshake,
  RefreshCw,
  Heart,
  Clock,
} from 'lucide-react';
import { AI_REVIEW_PRESETS } from '@/lib/utils';

export default function PublicReviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState<any>(null);
  const [error, setError] = useState('');

  // Flow states
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [step, setStep] = useState<'RATING' | 'HIGH_RATING' | 'LOW_FEEDBACK' | 'FEEDBACK_SUBMITTED' | 'LOW_RATING_THANK_YOU'>('RATING');

  // High rating flow states (Blank initially for unique generation)
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [generatingAi, setGeneratingAi] = useState(false);
  const [copiedReview, setCopiedReview] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Low rating flow states
  const [issueCategory, setIssueCategory] = useState('');
  const [comment, setComment] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [discountOffer, setDiscountOffer] = useState<any>(null);

  // Parse services & tags from business settings
  const servicesList: string[] = (
    business?.services ||
    'Custom Web Development, Mobile Apps, UI/UX Design, Cloud Solutions'
  )
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  const positiveTagsList: string[] = (
    business?.positiveTags ||
    'Top Quality, Fast Delivery, Great Support, Professional Team, Highly Recommended'
  )
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean);

  const issueCategoriesList: string[] = (
    business?.issueCategories ||
    'Service Speed, Product Quality, Staff Behavior, Cleanliness & Hygiene, Pricing / Billing, Other Issue'
  )
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean);

  // Multi-select toggle helpers
  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Generate customized AI review on user button click
  const handleGenerateAiReview = async (overrideLanguage?: string) => {
    setGeneratingAi(true);
    setHasGenerated(true);

    const langToUse = overrideLanguage || selectedLanguage;

    try {
      const res = await fetch('/api/review/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: business?.name || 'this business',
          slug: business?.slug || slug,
          selectedServices,
          selectedTags,
          language: langToUse,
          rating: selectedRating || 5,
        }),
      });

      const data = await res.json();
      if (data.review) {
        setSelectedPreset(data.review);
      }
    } catch (e) {
      console.error('Error generating AI review:', e);
      const svcText = selectedServices.length > 0 ? ` for ${selectedServices.join(' & ')}` : '';
      const tagText = selectedTags.length > 0 ? ` Particularly impressed by their ${selectedTags.join(' and ')}.` : '';
      setSelectedPreset(`Had a great experience with ${business?.name}${svcText}!${tagText} Highly recommended! ⭐⭐⭐⭐⭐`);
    } finally {
      setGeneratingAi(false);
    }
  };

  // Fetch business public details
  useEffect(() => {
    if (!slug) return;
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/review/${slug}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Business review page not found');
        }

        setBusiness(data.business);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [slug]);

  // Handle star selection
  const handleRatingClick = async (rating: number) => {
    setSelectedRating(rating);
    const threshold = business?.minPositiveRating || 4;

    if (rating >= threshold) {
      setStep('HIGH_RATING');
    } else {
      // Check if client configured feedback collection
      if (business?.collectFeedbackOnLowRating === false) {
        // Automatically submit without asking for form
        try {
          const res = await fetch(`/api/review/${slug}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating, skipFeedback: true }),
          });
          const data = await res.json();
          if (data.discountOffer && business?.enableDiscountOffer) {
            setDiscountOffer(data.discountOffer);
          }
        } catch (e) {
          console.error(e);
        }
        setStep('LOW_RATING_THANK_YOU');
      } else {
        setStep('LOW_FEEDBACK');
      }
    }
  };

  // High Rating: Copy & Proceed to Google
  const handleCopyReview = () => {
    navigator.clipboard.writeText(selectedPreset);
    setCopiedReview(true);
    setTimeout(() => setCopiedReview(false), 3000);
  };

  const handleRedirectToGoogle = async () => {
    // If user generated or typed a review, ensure it is copied
    if (selectedPreset.trim().length > 0) {
      try {
        await navigator.clipboard.writeText(selectedPreset.trim());
      } catch (e) {
        // Ignore clipboard permission errors
      }
    }

    // Track redirection in analytics
    try {
      await fetch(`/api/review/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
        }),
      });
    } catch (e) {
      console.error(e);
    }

    // Open Google Review URL with strict 100% blank referrer (no-referrer)
    if (business?.googleReviewUrl) {
      const link = document.createElement('a');
      link.href = business.googleReviewUrl;
      link.rel = 'noreferrer noopener';
      link.referrerPolicy = 'no-referrer';
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Low Rating: Submit private feedback form
  const handleSubmitPrivateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/review/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: selectedRating,
          issueCategory,
          comment,
          customerName,
          customerPhone,
          customerEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      if (data.discountOffer && business?.enableDiscountOffer) {
        setDiscountOffer(data.discountOffer);
      }
      setStep('FEEDBACK_SUBMITTED');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-600" /> Loading Review Portal...
      </div>
    );
  }

  if (error || !business) {
    const isQuota = error.toLowerCase().includes('monthly scan limit') || error.toLowerCase().includes('quota');
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-900">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm ${
          isQuota ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {isQuota ? <Clock className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
        </div>
        <h2 className="text-xl font-bold mb-2">
          {isQuota ? 'Monthly Limit Reached' : 'Portal Unavailable'}
        </h2>
        <p className="text-slate-500 text-sm max-w-sm">
          {isQuota
            ? 'Thank you for your visit! This business review portal has reached its monthly scan quota. Please check back soon or leave a review directly on Google Maps.'
            : error || 'This business review portal is currently unavailable or inactive.'}
        </p>
      </div>
    );
  }

  const primaryColor = business.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40 text-slate-900 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Decorative Top Accent Glow */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Main Review Card (Clean White Light Theme) */}
      <div className="max-w-md w-full mx-auto my-auto relative z-10 py-6">
        <div className="bg-white border border-slate-200/90 rounded-[28px] p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-6">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div
              className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-black text-xl text-white shadow-md shadow-blue-500/20"
              style={{ backgroundColor: primaryColor }}
            >
              {business.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{business.name}</h1>
            <p className="text-xs text-slate-500 font-medium">Customer Feedback & Review Portal</p>
          </div>

          {/* STEP 1: INITIAL 5-STAR RATING SELECTOR */}
          {step === 'RATING' && (
            <div className="space-y-6 text-center pt-2">
              <div>
                <p className="text-base font-extrabold text-slate-800">How was your experience today?</p>
                <p className="text-xs text-slate-500 mt-1">Tap a star to rate your visit</p>
              </div>

              {/* Glowing Interactive Stars */}
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isHoveredOrActive = (hoveredStar ?? 0) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => handleRatingClick(star)}
                      className="p-1 sm:p-2 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                    >
                      <Star
                        className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors ${
                          isHoveredOrActive
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-300 hover:text-amber-400'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5 bg-slate-50 py-1.5 px-3 rounded-full border border-slate-200 inline-flex mx-auto">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Takes only 10 seconds of your time
                </span>
              </div>
            </div>
          )}

          {/* STEP 2A: HIGH RATING FLOW (>= Threshold -> Google Review + AI Suggestions) */}
          {step === 'HIGH_RATING' && (
            <div className="space-y-6 pt-1 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-1.5 shadow-sm">
                <div className="flex justify-center gap-1 mb-1">
                  {Array.from({ length: selectedRating || 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Thank You for {selectedRating} Stars! 🎉
                </h3>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {business.positiveMessage ||
                    "We're delighted you had a great experience! Please share your thoughts on Google."}
                </p>
              </div>

              {/* AI Review Assistant Generator (Rendered ONLY if enabled by client) */}
              {business?.enableAiReview !== false && (
                <div className="space-y-4">
                  {/* Step 1: Select Services (Rendered ONLY if enabled by client) */}
                  {business?.enableServices !== false && servicesList.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>📦</span>
                          <span>Select Service / Product Used</span>
                        </label>
                        <span className="text-[10px] text-blue-600 font-bold">Multi-select</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {servicesList.map((svc) => {
                          const isSelected = selectedServices.includes(svc);
                          return (
                            <button
                              key={svc}
                              type="button"
                              onClick={() => toggleService(svc)}
                              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm scale-[1.02]'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{svc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Select Praise Aspects (Rendered ONLY if enabled by client) */}
                  {business?.enablePositiveTags !== false && positiveTagsList.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>⭐</span>
                          <span>What did you like best?</span>
                        </label>
                        <span className="text-[10px] text-amber-600 font-bold">Multi-select</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {positiveTagsList.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleTag(tag)}
                              className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm scale-[1.02]'
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                              }`}
                            >
                              <span>{isSelected ? '✓' : '+'}</span>
                              <span>{tag}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Select Review Language (Rendered ONLY if enabled by client) */}
                  {business?.enableLanguageSelection !== false && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>🌐</span>
                          <span>Select Review Language (भाषा)</span>
                        </label>
                        <span className="text-[10px] text-indigo-600 font-bold">{selectedLanguage}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
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
                        ]
                          .filter((lang) => {
                            if (!business?.selectedLanguages) return true;
                            const allowed = business.selectedLanguages.split(',').map((s: string) => s.trim());
                            return allowed.includes(lang.id);
                          })
                          .map((lang) => {
                            const isSelected = selectedLanguage === lang.id;
                            return (
                              <button
                                key={lang.id}
                                type="button"
                                onClick={() => setSelectedLanguage(lang.id)}
                                className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1 ${
                                  isSelected
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm scale-[1.02]'
                                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                                }`}
                              >
                                <span>{isSelected ? '✓ ' : ''}</span>
                                <span>{lang.label}</span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Big Dedicated "Generate AI Review" Button */}
                  <button
                    type="button"
                    onClick={() => handleGenerateAiReview()}
                    disabled={generatingAi}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 cursor-pointer"
                  >
                    {generatingAi ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Generating your unique review...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>
                          {hasGenerated ? '✨ Re-generate Fresh Review' : '✨ Generate AI Review (1-Click)'}
                        </span>
                      </>
                    )}
                  </button>

                  {/* Editable Review Text Box (Blank until generated or typed) */}
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      placeholder="Select your service & what you loved above, then tap 'Generate AI Review' to create a unique 5-star review (or type your own here)..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none font-medium leading-relaxed"
                    />
                    {selectedPreset.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={handleCopyReview}
                        className="absolute right-2.5 bottom-3 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-[10px] font-bold transition flex items-center gap-1 shadow-sm"
                      >
                        {copiedReview ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedReview ? 'Copied!' : 'Copy Text'}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Big Direct Google Button */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleRedirectToGoogle}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Proceed to Google Reviews</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-slate-500">
                  Takes you directly to Google Maps review window
                </p>
              </div>
            </div>
          )}

          {/* STEP 2B: LOW RATING FLOW (< Threshold WITH Private Feedback Form Enabled) */}
          {step === 'LOW_FEEDBACK' && (
            <form onSubmit={handleSubmitPrivateFeedback} className="space-y-4 pt-1 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                <div className="flex justify-center gap-1 mb-1">
                  {Array.from({ length: selectedRating || 1 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <h3 className="font-extrabold text-rose-900 text-sm">We're truly sorry!</h3>
                <p className="text-[11px] text-rose-700 font-medium">
                  {business.negativeMessage ||
                    "Please let our management know what went wrong so we can resolve this immediately."}
                </p>
              </div>

              {/* Issue Category Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  What could have been better?
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {issueCategoriesList.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setIssueCategory(cat)}
                      className={`text-left text-[11px] font-bold px-3 py-2 rounded-xl border transition truncate ${
                        issueCategory === cat
                          ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {issueCategory === cat ? '✓ ' : ''}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Detailed Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Please describe your experience in detail..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white resize-none font-medium"
                />
              </div>

              {/* Contact Info for Manager Followup */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={submittingFeedback || !comment.trim()}
                  className="w-full py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingFeedback ? 'Submitting to Management...' : 'Send Private Feedback'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2C / 3: LOW RATING THANK YOU & APOLOGY (With or Without Voucher) */}
          {(step === 'FEEDBACK_SUBMITTED' || step === 'LOW_RATING_THANK_YOU') && (
            <div className="text-center space-y-6 pt-2 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <HeartHandshake className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900">Thank You for Your Feedback!</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto leading-relaxed">
                  {step === 'FEEDBACK_SUBMITTED'
                    ? 'Your feedback has been sent directly to the store manager. We appreciate your honesty and will make things right.'
                    : business.negativeMessage || 'Thank you for letting us know. We appreciate your rating and will work to improve our service.'}
                </p>
              </div>

              {/* Conditional Discount Voucher Card: ONLY shown if enableDiscountOffer is true */}
              {business?.enableDiscountOffer && discountOffer && (
                <div className="bg-gradient-to-tr from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-5 text-center space-y-2 relative overflow-hidden shadow-sm animate-pulse-subtle">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                    <Ticket className="w-3 h-3" /> Special Apology Voucher
                  </span>
                  <h4 className="font-extrabold text-amber-900 text-sm">{discountOffer.title}</h4>
                  <div className="bg-white border-2 border-dashed border-amber-400 rounded-xl py-2 px-4 inline-block my-1 font-mono text-base font-black text-amber-700 tracking-wider shadow-inner">
                    {discountOffer.code}
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{discountOffer.text}</p>
                </div>
              )}

              <p className="text-[10px] text-slate-500 font-medium">
                You may now close this browser window.
              </p>
            </div>
          )}

        </div>

        <Footer className="mt-4 text-slate-500" />
      </div>
    </div>
  );
}
