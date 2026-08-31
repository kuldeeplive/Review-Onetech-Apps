'use client';

import React from 'react';
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
} from 'lucide-react';

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: 'SUPER_ADMIN' | 'BUSINESS_OWNER';
    business?: {
      id: string;
      name: string;
      slug: string;
      primaryColor?: string;
    } | null;
    isImpersonating?: boolean;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleExitImpersonation = async () => {
    await fetch('/api/auth/impersonate', { method: 'DELETE' });
    router.push('/super-admin');
    router.refresh();
  };

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
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
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Super Admin
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-8">
            <Link
              href={isSuperAdmin ? '/super-admin' : '/dashboard'}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-1.5">
                  RepuBoost
                  <span className="text-xs uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold tracking-wider">
                    SaaS
                  </span>
                </span>
                <p className="text-[10px] text-slate-500 font-medium">Smart Review & Reputation</p>
              </div>
            </Link>

            {/* Navigation links for Business Dashboard */}
            {isDashboard && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
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
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
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
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                    pathname === '/dashboard/settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings & Threshold
                </Link>
              </nav>
            )}

            {/* Navigation link for Super Admin */}
            {isSuperAdmin && (
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/super-admin"
                  className="px-3.5 py-2 rounded-lg text-sm font-semibold bg-indigo-50 text-indigo-700 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Client Tenants & Onboarding
                </Link>
              </nav>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* View Live Review Page Button for Client */}
            {user.business?.slug && (
              <a
                href={`/review/${user.business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                Preview Review Page
              </a>
            )}

            {/* User Profile Badge */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">
                  {user.name}
                </p>
                <p className="text-[10px] font-medium text-slate-500 truncate max-w-[140px]">
                  {isSuperAdmin ? 'Super Admin Master' : user.business?.name || user.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
