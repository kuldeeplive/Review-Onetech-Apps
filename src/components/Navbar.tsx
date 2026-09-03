'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  LogOut,
  QrCode,
  Settings,
  MessageSquareWarning,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
    business?: {
      id: string;
      name: string;
      slug: string;
      primaryColor?: string;
      agency?: {
        name?: string;
        brandName?: string;
        logoUrl?: string;
        themeColor?: string;
        customFooterText?: string;
        customFooterUrl?: string;
      } | null;
    } | null;
    agency?: {
      name?: string;
      brandName?: string;
      logoUrl?: string;
      themeColor?: string;
    } | null;
    isImpersonating?: boolean;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleExitImpersonation = async () => {
    const res = await fetch('/api/auth/impersonate', { method: 'DELETE' });
    const data = await res.json();
    router.push(data.returnUrl || '/super-admin');
    router.refresh();
  };

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isDashboard = pathname.startsWith('/dashboard');

  // Dynamic White-Label Brand identity
  const agencyBranding = user.business?.agency || user.agency;
  const brandName = agencyBranding?.brandName || agencyBranding?.name || 'AI Magic Review';
  const logoUrl = agencyBranding?.logoUrl || '/logo.webp';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm no-print">
      {/* Impersonation Banner */}
      {user.isImpersonating && (
        <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Sparkles className="w-4 h-4" />
            <span>
              You are viewing dashboard as client: <strong>{user.business?.name}</strong>
            </span>
            <button
              onClick={handleExitImpersonation}
              className="ml-auto bg-white text-amber-800 hover:bg-amber-50 px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Admin
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-6">
            <Link
              href={isSuperAdmin ? '/super-admin' : '/dashboard'}
              className="flex items-center gap-2.5 group"
            >
              <img
                src={logoUrl}
                alt={brandName}
                className="h-10 w-auto max-w-[120px] max-h-[44px] object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <div>
                <span className="font-black text-lg text-slate-900 tracking-tight leading-none block">
                  {brandName}
                </span>
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide mt-0.5">
                  {agencyBranding ? 'Client Portal' : 'Smart Review & Reputation'}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation links for Business Dashboard */}
            {isDashboard && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    pathname === '/dashboard'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquareWarning className="w-4 h-4" />
                  Feedback Inbox
                </Link>
                <Link
                  href="/dashboard/qr-builder"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    pathname === '/dashboard/qr-builder'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  QR & Standee Studio
                </Link>
                <Link
                  href="/dashboard/settings"
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    pathname === '/dashboard/settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings & Security
                </Link>
              </nav>
            )}

            {/* Desktop Navigation link for Super Admin */}
            {isSuperAdmin && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/super-admin"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Client Tenants & Onboarding
                </Link>
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Live Review Page Button for Client */}
            {user.business?.slug && (
              <a
                href={`/review/${user.business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Preview Review Page
              </a>
            )}

            {/* User Profile Badge */}
            <div className="flex items-center gap-2 sm:pl-3 sm:border-l sm:border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-black text-xs shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {user.name}
                </p>
                <p className="text-[10px] font-medium text-slate-500 truncate max-w-[130px]">
                  {isSuperAdmin ? 'Super Admin Master' : user.business?.name || user.email}
                </p>
              </div>
            </div>

            {/* Logout Button (Desktop) */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="hidden sm:flex p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-5 space-y-2 animate-fadeIn shadow-xl">
          {isDashboard && (
            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <MessageSquareWarning className="w-4 h-4" />
                Feedback Inbox
              </Link>
              <Link
                href="/dashboard/qr-builder"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/qr-builder'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-4 h-4" />
                QR & Standee Studio
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  pathname === '/dashboard/settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings & Security
              </Link>

              {user.business?.slug && (
                <a
                  href={`/review/${user.business.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Preview Live Review Page
                </a>
              )}
            </div>
          )}

          {isSuperAdmin && (
            <div className="space-y-1">
              <Link
                href="/super-admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700"
              >
                <ShieldCheck className="w-4 h-4" />
                Client Tenants & Onboarding
              </Link>
            </div>
          )}

          {/* Mobile Profile & Logout */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-500">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
