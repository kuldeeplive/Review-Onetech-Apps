import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Star,
  QrCode,
  TrendingUp,
  MessageSquareWarning,
  CheckCircle2,
  ArrowRight,
  Zap,
  Lock,
  Building2,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              RepuBoost
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                SaaS
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              Sign In to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Google Review Filtering & Reputation Management SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
            Get 100% 5-Star Reviews. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Filter Bad Feedback Privately.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            A turn-key multi-tenant software system for agencies and businesses. Protect your Google My Business ratings with smart QR review gating, AI review suggestions, and instant negative feedback alerts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Explore Super Admin & Demos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/review/sharma-sweets"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              Live QR Review Page Demo
            </a>
          </div>
        </div>
      </section>

      {/* How It Works Flow Chart */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
              Smart Review Routing
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              How the Intelligent Gating System Works
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">Customer Scans QR Code</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Customer scans the printable table standee or taps the NFC card at your store or checkout counter.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">4 or 5 Stars $\rightarrow$ Google</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Happy customers get AI-crafted positive review suggestions and are redirected straight to Google Maps to submit 5-star ratings.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">1 to 3 Stars $\rightarrow$ Private Feedback</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unhappy customers stay on a private feedback form. Google review link is never opened. Manager is alerted on WhatsApp instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Selling (Multi-Tenant Super Admin) */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">
              Agency & Reseller Ready
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              One Software, Infinite Clients. <br />
              <span className="text-indigo-400">Zero Extra Coding Required.</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Equipped with a Master Super Admin panel to onboard clients in 60 seconds. Set custom pricing, enable or disable client accounts with a single click, and let clients customize their own star redirection threshold (3, 4, or 5 stars).
            </p>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1-Click Client Onboarding & Slug Generation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Account Status Kill Switch (Active / Disable on non-payment)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1-Click "Login as Client" Support Impersonation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Print-ready Acrylic Table Standee Generator</span>
              </li>
            </ul>
          </div>

          {/* Quick Demo Credentials Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              Pre-configured Demo Accounts
            </h3>
            <p className="text-xs text-slate-400">
              Try the platform right now with our seeded test profiles:
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-indigo-300">Master Super Admin</span>
                  <span className="text-[10px] text-slate-500 font-mono">admin@example.com</span>
                </div>
                <p className="text-[11px] text-slate-400">Password: <code className="text-white">admin123</code></p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-rose-300">Sharma Sweets (Restaurant)</span>
                  <span className="text-[10px] text-slate-500 font-mono">sharma@example.com</span>
                </div>
                <p className="text-[11px] text-slate-400">Threshold: <strong>4+ Stars</strong> • Password: <code className="text-white">client123</code></p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-purple-300">Royal Salon & Spa</span>
                  <span className="text-[10px] text-slate-500 font-mono">royal@example.com</span>
                </div>
                <p className="text-[11px] text-slate-400">Threshold: <strong>5 Stars Only</strong> • Password: <code className="text-white">client123</code></p>
              </div>
            </div>

            <Link
              href="/login"
              className="block w-full text-center py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
            >
              Sign In to Demo →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-600">
        <p>© 2026 RepuBoost SaaS Platform. Built for High-Converting Reputation Management.</p>
      </footer>
    </div>
  );
}
