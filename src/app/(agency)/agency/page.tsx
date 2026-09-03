'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Wallet,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  QrCode,
  Shield,
  Palette,
  CreditCard,
  LogOut,
  ChevronRight,
  Sparkles,
  Zap,
  ArrowUpRight,
  Sliders,
  Copy,
  Check,
  Power,
  RotateCw,
  LogIn,
} from 'lucide-react';
import Footer from '@/components/Footer';

export default function AgencyPortal() {
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [agency, setAgency] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [wholesalePlans, setWholesalePlans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Navigation tabs: 'clients' | 'onboard' | 'wallet' | 'branding'
  const [activeTab, setActiveTab] = useState<'clients' | 'onboard' | 'wallet' | 'branding'>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Messages
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Client Form State
  const [clientForm, setClientForm] = useState({
    name: '',
    slug: '',
    category: 'Restaurant / Cafe',
    bio: '',
    services: '',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
    googleReviewUrl: '',
    wholesalePlanId: '',
    billingCycle: 'monthly', // 'monthly' | 'yearly'
    autoRenew: true,
    clientPlanName: 'Pro Reputation Plan',
    clientRetailPrice: '₹999/mo',
  });
  const [submittingClient, setSubmittingClient] = useState(false);

  // Renewal Modal State
  const [renewModalClient, setRenewModalClient] = useState<any | null>(null);
  const [renewCycle, setRenewCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [renewing, setRenewing] = useState(false);

  // Branding Form State
  const [brandForm, setBrandForm] = useState({
    brandName: '',
    logoUrl: '',
    themeColor: '#2563eb',
    customFooterText: '',
    customFooterUrl: '',
    supportEmail: '',
    supportPhone: '',
  });
  const [savingBrand, setSavingBrand] = useState(false);

  // Fetch Agency Dashboard Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/agency');
      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAgency(data.agency);
      setStats(data.stats);
      setClients(data.clients || []);
      setWholesalePlans(data.wholesalePlans || []);
      setTransactions(data.walletTransactions || []);

      if (data.wholesalePlans && data.wholesalePlans.length > 0 && !clientForm.wholesalePlanId) {
        setClientForm((prev) => ({ ...prev, wholesalePlanId: data.wholesalePlans[0].id }));
      }

      setBrandForm({
        brandName: data.agency.brandName || data.agency.name,
        logoUrl: data.agency.logoUrl || '',
        themeColor: data.agency.themeColor || '#2563eb',
        customFooterText: data.agency.customFooterText || `Powered by ${data.agency.name}`,
        customFooterUrl: data.agency.customFooterUrl || 'https://onetechsolution.in',
        supportEmail: data.agency.supportEmail || '',
        supportPhone: data.agency.supportPhone || '',
      });
    } catch (err: any) {
      showToast('error', err.message || 'Failed to load agency data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4500);
  };

  // Copy Link Helper
  const copyReviewLink = (slug: string) => {
    const url = `${window.location.origin}/review/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Toggle Client Auto-Renew
  const handleToggleAutoRenew = async (client: any) => {
    try {
      const nextVal = !client.autoRenew;
      const res = await fetch('/api/agency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: client.id,
          action: 'TOGGLE_AUTORENEW',
          autoRenew: nextVal,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to toggle auto-renew');

      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, autoRenew: nextVal } : c))
      );
      showToast('success', `Auto-Renew turned ${nextVal ? 'ON' : 'OFF'} for ${client.name}`);
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Toggle Client Active Status (Pause / Resume)
  const handleToggleActive = async (client: any) => {
    try {
      const nextVal = !client.isActive;
      const res = await fetch('/api/agency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: client.id,
          action: 'TOGGLE_STATUS',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update client status');

      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, isActive: nextVal } : c))
      );
      showToast('success', `Client ${client.name} ${nextVal ? 'Activated' : 'Paused'}`);
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Impersonate / Login as Client
  const handleImpersonateClient = async (client: any) => {
    try {
      const res = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: client.id }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        showToast('error', data.error || 'Failed to login as client');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Handle Client Manual Renewal
  const handleManualRenew = async () => {
    if (!renewModalClient) return;
    try {
      setRenewing(true);
      const res = await fetch('/api/agency', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: renewModalClient.id,
          action: 'MANUAL_RENEW',
          billingCycle: renewCycle,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to renew client');

      showToast('success', data.message);
      setRenewModalClient(null);
      fetchData(); // Refresh wallet & clients
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setRenewing(false);
    }
  };

  // Handle Onboard New Client Submit
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingClient(true);
      const res = await fetch('/api/agency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard client');

      showToast('success', data.message);
      // Reset form
      setClientForm({
        name: '',
        slug: '',
        category: 'Restaurant / Cafe',
        bio: '',
        services: '',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPhone: '',
        googleReviewUrl: '',
        wholesalePlanId: wholesalePlans[0]?.id || '',
        billingCycle: 'monthly',
        autoRenew: true,
        clientPlanName: 'Pro Reputation Plan',
        clientRetailPrice: '₹999/mo',
      });
      setActiveTab('clients');
      fetchData();
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSubmittingClient(false);
    }
  };

  // Handle Save Branding Settings
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingBrand(true);
      const res = await fetch('/api/agency/brand-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update brand settings');

      showToast('success', data.message);
      setAgency(data.agency);
    } catch (err: any) {
      showToast('error', err.message);
    } finally {
      setSavingBrand(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Calculate Selected Plan Cost in Onboard form
  const selectedPlan = wholesalePlans.find((p) => p.id === clientForm.wholesalePlanId);
  const calculatedDeduction = selectedPlan
    ? clientForm.billingCycle === 'yearly'
      ? selectedPlan.pricePerYear
      : selectedPlan.pricePerMonth
    : 0;

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.ownerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading Agency Partner Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Toast Banner */}
      {toastMsg && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-sm font-semibold border animate-fade-in ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {agency?.logoUrl ? (
              <img src={agency.logoUrl} alt={agency.name} className="h-9 w-auto max-w-[120px] object-contain" />
            ) : (
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold shadow-sm"
                style={{ backgroundColor: agency?.themeColor || '#2563eb' }}
              >
                {agency?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                  {agency?.brandName || agency?.name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                  Reseller Partner
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">White-Label Management Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Prepaid Wallet Pill */}
            <div
              onClick={() => setActiveTab('wallet')}
              className={`cursor-pointer px-3.5 py-1.5 rounded-xl border flex items-center gap-2 transition shadow-sm ${
                agency?.walletBalance < 250
                  ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:bg-emerald-100'
              }`}
              title="Click to view Wallet statement & recharge instructions"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-500 block leading-none">Wallet</span>
                <span className="text-xs font-black">₹{Number(agency?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 border text-slate-700 ml-1">
                + Top-Up
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clients</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{stats?.totalClients || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Clients</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats?.activeClients || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prepaid Balance</p>
              <p className="text-2xl font-black text-blue-600 mt-1">₹{Math.round(agency?.walletBalance || 0)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spent</p>
              <p className="text-2xl font-black text-slate-700 mt-1">₹{Math.round(stats?.totalSpent || 0)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'clients'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Sub-Clients ({clients.length})
            </button>

            <button
              onClick={() => setActiveTab('onboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'onboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-4 h-4" />
              + Onboard New Client
            </button>

            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'wallet'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              Wallet & Statements
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'branding'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              White-Label Branding
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: SUB-CLIENTS LIST */}
        {/* ============================================================ */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search clients by name, slug or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={() => setActiveTab('onboard')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                Onboard New Client
              </button>
            </div>

            {/* Clients Table */}
            {filteredClients.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No sub-clients found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                  You haven&apos;t onboarded any clients yet, or no clients match your search query.
                </p>
                <button
                  onClick={() => setActiveTab('onboard')}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-blue-700 transition"
                >
                  + Onboard Your First Client
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Client / Business</th>
                      <th className="py-3 px-4">Monthly Scans</th>
                      <th className="py-3 px-4">Plan & Validity</th>
                      <th className="py-3 px-4 text-center">Auto-Renew Toggle</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredClients.map((client) => {
                      const isExpired = client.isExpired;
                      return (
                        <tr key={client.id} className="hover:bg-slate-50/60 transition">
                          {/* Business Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {client.name}
                              <button
                                onClick={() => copyReviewLink(client.slug)}
                                className="text-slate-400 hover:text-blue-600 transition"
                                title="Copy Public Review Page Link"
                              >
                                {copiedSlug === client.slug ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{client.category || 'General Business'}</span>
                              <span>•</span>
                              <span>{client.ownerEmail}</span>
                            </div>
                          </td>

                          {/* Scan Quota */}
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900">
                              {client.scansThisMonth ?? 0}
                            </span>
                            <span className="text-slate-500">
                              {' '}
                              / {client.monthlyScanLimit === -1 ? 'Unlimited' : client.monthlyScanLimit} scans
                            </span>
                          </td>

                          {/* Plan & Validity */}
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-900 block">{client.planName}</span>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                              {isExpired ? (
                                <span className="text-rose-600 font-bold">Expired</span>
                              ) : client.daysRemaining !== null ? (
                                <span>{client.daysRemaining} days remaining</span>
                              ) : (
                                <span>Active</span>
                              )}
                            </div>
                          </td>

                          {/* Auto-Renew Switch (User's specific request!) */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <button
                                onClick={() => handleToggleAutoRenew(client)}
                                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                                  client.autoRenew ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                                title={`Click to turn ${client.autoRenew ? 'OFF' : 'ON'} auto-renew for ${client.name}`}
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                    client.autoRenew ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[10px] font-bold mt-1 ${
                                  client.autoRenew ? 'text-emerald-700' : 'text-slate-500'
                                }`}
                              >
                                {client.autoRenew ? 'Auto-Renew ON' : 'Manual Renew'}
                              </span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            {isExpired ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
                                Expired
                              </span>
                            ) : !client.isActive ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                                Paused
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Active
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click Login as Client */}
                              <button
                                onClick={() => handleImpersonateClient(client)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[11px] font-bold border border-indigo-200 transition flex items-center gap-1 shadow-sm"
                                title="Login and manage client dashboard"
                              >
                                <LogIn className="w-3 h-3 text-indigo-600" />
                                Login
                              </button>

                              {/* 1-Click Renew Button */}
                              <button
                                onClick={() => {
                                  setRenewModalClient(client);
                                  setRenewCycle(client.billingCycleDays === 365 ? 'yearly' : 'monthly');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition flex items-center gap-1"
                                title="Renew client subscription"
                              >
                                <RotateCw className="w-3 h-3" />
                                Renew
                              </button>

                              {/* Pause / Resume */}
                              <button
                                onClick={() => handleToggleActive(client)}
                                className={`p-1.5 rounded-lg border transition ${
                                  client.isActive
                                    ? 'border-slate-200 text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={client.isActive ? 'Pause client account' : 'Resume client account'}
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>

                              {/* View Public Review */}
                              <a
                                href={`/review/${client.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
                                title="Open Live Public Review Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ONBOARD NEW CLIENT */}
        {/* ============================================================ */}
        {activeTab === 'onboard' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-blue-600" />
                Onboard New Client Under Your Agency
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your wholesale rate will be automatically deducted from your prepaid wallet balance.
              </p>
            </div>

            <form onSubmit={handleOnboardSubmit} className="space-y-6">
              {/* Step 1: Wholesale Plan Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Select Wholesale Plan (Wholesale Cost to You):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wholesalePlans.map((plan) => {
                    const isSelected = clientForm.wholesalePlanId === plan.id;
                    const price =
                      clientForm.billingCycle === 'yearly' ? plan.pricePerYear : plan.pricePerMonth;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setClientForm({ ...clientForm, wholesalePlanId: plan.id })}
                        className={`cursor-pointer p-4 rounded-xl border transition relative ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-slate-900 text-sm">{plan.name}</span>
                          <span className="text-xs font-black text-blue-600">₹{price}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {plan.monthlyScanLimit === -1 ? 'Unlimited Scans' : `${plan.monthlyScanLimit} Scans/month`}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 leading-snug">{plan.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Billing Cycle Choice & Auto-Renew Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Billing Cycle Duration:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setClientForm({ ...clientForm, billingCycle: 'monthly' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        clientForm.billingCycle === 'monthly'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Monthly (30 Days)
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientForm({ ...clientForm, billingCycle: 'yearly' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        clientForm.billingCycle === 'yearly'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Yearly (365 Days)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Auto-Renew Subscription:</label>
                  <div
                    onClick={() => setClientForm({ ...clientForm, autoRenew: !clientForm.autoRenew })}
                    className="cursor-pointer flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200"
                  >
                    <span className="text-xs font-medium text-slate-700">
                      {clientForm.autoRenew ? 'Auto-renew enabled' : 'Manual renewal only'}
                    </span>
                    <div
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition ${
                        clientForm.autoRenew ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                          clientForm.autoRenew ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step: Custom Retail Pricing & Agency Profit Margin */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-blue-50/70 border border-indigo-200 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    2. Client Retail Plan & Margin (What your client sees):
                  </label>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider">
                    Wholesale cost hidden
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Plan Display Name (Client Sees This) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pro Growth Plan or VIP Reputation Booster"
                      value={clientForm.clientPlanName}
                      onChange={(e) => setClientForm({ ...clientForm, clientPlanName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Retail Price Charged to Client (Client Sees This) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={clientForm.billingCycle === 'yearly' ? 'e.g. ₹4,999/year' : 'e.g. ₹999/month'}
                      value={clientForm.clientRetailPrice}
                      onChange={(e) => setClientForm({ ...clientForm, clientRetailPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/90 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <span className="text-slate-600">
                    Wholesale Cost to You: <strong className="text-rose-600">₹{calculatedDeduction}</strong> / {clientForm.billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                  <span className="text-emerald-700 font-black flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    You collect retail payment directly from client via Cash/UPI
                  </span>
                </div>
              </div>

              {/* Step 3: Client & Business Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Palace Restaurant"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Category</label>
                  <select
                    value={clientForm.category}
                    onChange={(e) => setClientForm({ ...clientForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Restaurant / Cafe">Restaurant / Cafe</option>
                    <option value="Dental / Medical Clinic">Dental / Medical Clinic</option>
                    <option value="Salon & Spa">Salon & Spa</option>
                    <option value="Retail Store / Shop">Retail Store / Shop</option>
                    <option value="Gym & Fitness">Gym & Fitness</option>
                    <option value="Hotel & Resort">Hotel & Resort</option>
                    <option value="Automobile / Garage">Automobile / Garage</option>
                    <option value="General Business">General Business</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps Review URL</label>
                  <input
                    type="url"
                    placeholder="https://g.page/r/.../review"
                    value={clientForm.googleReviewUrl}
                    onChange={(e) => setClientForm({ ...clientForm, googleReviewUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={clientForm.ownerName}
                    onChange={(e) => setClientForm({ ...clientForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="client@gmail.com"
                    value={clientForm.ownerEmail}
                    onChange={(e) => setClientForm({ ...clientForm, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Owner Login Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Set a password for your client"
                    value={clientForm.ownerPassword}
                    onChange={(e) => setClientForm({ ...clientForm, ownerPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Wallet Cost Deduction Summary Box */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-900 block">Prepaid Wallet Deduction Summary:</span>
                  <span className="text-[11px] text-blue-700">
                    Current Balance: ₹{agency?.walletBalance?.toFixed(2)} • Deduction: ₹{calculatedDeduction.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Balance After:</span>
                  <span
                    className={`text-sm font-black ${
                      agency?.walletBalance < calculatedDeduction ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    ₹{(agency?.walletBalance - calculatedDeduction).toFixed(2)}
                  </span>
                </div>
              </div>

              {agency?.walletBalance < calculatedDeduction && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Insufficient balance to onboard this client. Please top-up your wallet by contacting Super Admin.
                  </span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('clients')}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClient || agency?.walletBalance < calculatedDeduction}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  {submittingClient ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Activating Client...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Activate Client (Deduct ₹{calculatedDeduction})
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: WALLET & STATEMENTS */}
        {/* ============================================================ */}
        {activeTab === 'wallet' && (
          <div className="space-y-6">
            {/* Wallet Recharge Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
              <div className="max-w-3xl">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30 inline-block mb-3">
                  Prepaid Reseller Balance
                </span>
                <h2 className="text-3xl sm:text-4xl font-black">
                  ₹{Number(agency?.walletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
                <p className="text-xs text-blue-100 mt-2 leading-relaxed">
                  Every time you onboard or renew a client, your wholesale price is automatically deducted from this wallet.
                  There are no gateway deductions or hidden transaction fees.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold block">Need to recharge your wallet?</span>
                    <span className="text-[11px] text-blue-100">
                      Send payment via UPI / Bank Transfer to Super Admin and contact for instant top-up.
                    </span>
                  </div>
                  <a
                    href="https://wa.me/919425154388?text=Hello%2C%20I%20want%20to%20recharge%20my%20Agency%20Reseller%20Wallet."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-black rounded-xl shadow transition shrink-0"
                  >
                    Contact Super Admin on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Wallet Passbook Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  Wallet Passbook & Transaction Ledger
                </h3>
              </div>

              {transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No transactions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Description</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-right">Balance After</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {transactions.map((t) => {
                        const isCredit = t.amount > 0;
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                              {new Date(t.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-900">{t.description}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  t.type === 'TOPUP'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : t.type === 'CLIENT_PURCHASE'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td
                              className={`py-3.5 px-4 text-right font-black ${
                                isCredit ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isCredit ? `+₹${t.amount.toFixed(2)}` : `-₹${Math.abs(t.amount).toFixed(2)}`}
                            </td>
                            <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                              ₹{t.balanceAfter?.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: WHITE-LABEL BRAND SETTINGS */}
        {/* ============================================================ */}
        {activeTab === 'branding' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Palette className="w-6 h-6 text-blue-600" />
                Agency White-Label Brand Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize how your agency branding appears to your sub-clients and in customer reviews.
              </p>
            </div>

            {/* White-Label Client Login URL Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-purple-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Your White-Label Client Login Portal URL:
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 uppercase">
                  100% Branded
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                Send this link to your clients to login. It will dynamically show your Agency Logo, Brand Name, and Custom Footer instead of AI Magic Review!
              </p>
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-purple-200 shadow-sm">
                <code className="text-xs font-mono font-bold text-indigo-700 flex-1 truncate select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/login?agency=${agency?.slug}` : `/login?agency=${agency?.slug}`}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/login?agency=${agency?.slug}`;
                    navigator.clipboard.writeText(url);
                    showToast('success', 'Branded client login URL copied!');
                  }}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Login Link</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alpha Growth Media"
                  value={brandForm.brandName}
                  onChange={(e) => setBrandForm({ ...brandForm, brandName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agency Logo URL</label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com/logo.png"
                  value={brandForm.logoUrl}
                  onChange={(e) => setBrandForm({ ...brandForm, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Hosted PNG or WEBP image with transparent background works best.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Footer Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Powered by Alpha Growth"
                    value={brandForm.customFooterText}
                    onChange={(e) => setBrandForm({ ...brandForm, customFooterText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Footer Link URL</label>
                  <input
                    type="url"
                    placeholder="https://alphagrowth.com"
                    value={brandForm.customFooterUrl}
                    onChange={(e) => setBrandForm({ ...brandForm, customFooterUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agency Support Email</label>
                  <input
                    type="email"
                    placeholder="support@alphagrowth.com"
                    value={brandForm.supportEmail}
                    onChange={(e) => setBrandForm({ ...brandForm, supportEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agency Support WhatsApp / Phone</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={brandForm.supportPhone}
                    onChange={(e) => setBrandForm({ ...brandForm, supportPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Brand Theme Color */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Theme Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandForm.themeColor}
                    onChange={(e) => setBrandForm({ ...brandForm, themeColor: e.target.value })}
                    className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={brandForm.themeColor}
                    onChange={(e) => setBrandForm({ ...brandForm, themeColor: e.target.value })}
                    className="w-32 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={savingBrand}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  {savingBrand ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving Brand Settings...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Save White-Label Identity
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Manual Renew Modal */}
      {renewModalClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 mb-1">
              <RotateCw className="w-5 h-5 text-emerald-600" />
              Renew Client Subscription
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Extend validity for <strong>{renewModalClient.name}</strong>. The wholesale cost will be deducted from your
              wallet.
            </p>

            <div className="space-y-3 mb-5">
              <label className="block text-xs font-bold text-slate-700">Choose Renewal Duration:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRenewCycle('monthly')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                    renewCycle === 'monthly'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-black">+30 Days</span>
                  <span className="text-[11px] text-slate-500">
                    ₹{renewModalClient.wholesalePlan?.pricePerMonth || 249}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRenewCycle('yearly')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-left ${
                    renewCycle === 'yearly'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="block font-black">+365 Days</span>
                  <span className="text-[11px] text-slate-500">
                    ₹{renewModalClient.wholesalePlan?.pricePerYear || 2199}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenewModalClient(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleManualRenew}
                disabled={renewing}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
              >
                {renewing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Confirm Renewal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Universal Footer */}
      <Footer
        brandName={agency?.brandName || 'AI Magic Review'}
        footerText={agency?.customFooterText || 'Developed by Onetech Solution'}
        footerUrl={agency?.customFooterUrl || 'https://onetechsolution.in'}
      />
    </div>
  );
}
