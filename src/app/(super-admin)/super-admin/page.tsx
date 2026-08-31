'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Users,
  Building2,
  QrCode,
  AlertTriangle,
  Plus,
  Search,
  ExternalLink,
  LogIn,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  Edit,
  Star,
  RefreshCw,
  KeyRound,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Sliders,
  DollarSign,
  Ticket,
  Cpu,
  Zap,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
  Layers,
  CreditCard,
  Package,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function SuperAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'PLANS' | 'AI_CONFIG'>('CLIENTS');

  // Plans Management State
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '₹999/mo',
    durationDays: 365,
    monthlyScanLimit: 500,
    features: 'AI Smart Review Generator, QR Standee Studio, Private Negative Feedback Gating, WhatsApp & Email Alerts, Custom Discount Offers',
    badge: '',
    isActive: true,
  });
  const [planSaving, setPlanSaving] = useState(false);
  const [planError, setPlanError] = useState('');

  const fetchPlans = async () => {
    try {
      setPlansLoading(true);
      const res = await fetch('/api/super-admin/plans');
      const data = await res.json();
      if (data.plans) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      price: '₹999/mo',
      durationDays: 365,
      monthlyScanLimit: 500,
      features: 'AI Smart Review Generator, QR Standee Studio, Private Negative Feedback Gating, WhatsApp & Email Alerts, Custom Discount Offers',
      badge: '',
      isActive: true,
    });
    setPlanError('');
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (p: any) => {
    setEditingPlan(p);
    setPlanForm({
      name: p.name,
      price: p.price,
      durationDays: p.durationDays,
      monthlyScanLimit: p.monthlyScanLimit,
      features: p.features,
      badge: p.badge || '',
      isActive: p.isActive,
    });
    setPlanError('');
    setShowPlanModal(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlanSaving(true);
    setPlanError('');

    try {
      const method = editingPlan ? 'PATCH' : 'POST';
      const body = editingPlan
        ? { id: editingPlan.id, ...planForm }
        : planForm;

      const res = await fetch('/api/super-admin/plans', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save plan');
      }

      setActionSuccess(editingPlan ? 'Plan updated successfully!' : 'New plan created successfully!');
      setShowPlanModal(false);
      fetchPlans();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setPlanError(err.message);
    } finally {
      setPlanSaving(false);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${name}"?`)) return;

    try {
      const res = await fetch(`/api/super-admin/plans?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete plan');
      }
      setActionSuccess(`Plan "${name}" deleted successfully!`);
      fetchPlans();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // AI Engine Configuration State
  const [aiConfig, setAiConfig] = useState({
    aiProvider: 'gemini',
    geminiApiKey: '',
    openAiApiKey: '',
    aiCustomPrompt: '',
  });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string; sampleOutput?: string; error?: string } | null>(null);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Admin Change Password State
  const [adminPasswordData, setAdminPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [adminPasswordLoading, setAdminPasswordLoading] = useState(false);
  const [adminPasswordSuccess, setAdminPasswordSuccess] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPasswordError('');
    setAdminPasswordSuccess('');

    if (adminPasswordData.newPassword.length < 6) {
      setAdminPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (adminPasswordData.newPassword !== adminPasswordData.confirmPassword) {
      setAdminPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      setAdminPasswordLoading(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: adminPasswordData.currentPassword,
          newPassword: adminPasswordData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password');
      }

      setAdminPasswordSuccess(data.message || 'Super Admin password updated successfully!');
      setAdminPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setAdminPasswordSuccess('');
        setShowAdminPasswordModal(false);
      }, 2000);
    } catch (err: any) {
      setAdminPasswordError(err.message);
    } finally {
      setAdminPasswordLoading(false);
    }
  };

  // Form states for creation
  const [formData, setFormData] = useState({
    businessName: '',
    customSlug: '',
    category: 'IT & Software',
    bio: '',
    services: 'Custom Web Development, Mobile Apps, UI/UX Design, Cloud Solutions',
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
    googleReviewUrl: '',
    minPositiveRating: 4,
    collectFeedbackOnLowRating: true,
    enableDiscountOffer: true,
    enableAiReview: true,
    planName: 'Pro Plan',
    planPrice: '₹999/mo',
    durationDays: 365,
    monthlyScanLimit: 500,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Password reset state
  const [customResetPassword, setCustomResetPassword] = useState('');
  const [generatedCredentials, setGeneratedCredentials] = useState<any>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Fetch current user & clients list
  const fetchData = async () => {
    try {
      setLoading(true);
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.authenticated || meData.user.role !== 'SUPER_ADMIN') {
        router.push('/login');
        return;
      }
      setUser(meData.user);

      const clientsRes = await fetch('/api/super-admin/clients');
      const clientsData = await clientsRes.json();
      setClients(clientsData.clients || []);
      setMetrics(clientsData.metrics || null);
      fetchPlans();
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiConfig = async () => {
    try {
      setAiLoading(true);
      const res = await fetch('/api/super-admin/ai-config');
      const data = await res.json();
      if (data.config) {
        setAiConfig({
          aiProvider: data.config.aiProvider || 'gemini',
          geminiApiKey: data.config.geminiApiKey || '',
          openAiApiKey: data.config.openAiApiKey || '',
          aiCustomPrompt: data.config.aiCustomPrompt || '',
        });
      }
    } catch (err) {
      console.error('Error fetching AI config:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchAiConfig();
  }, []);

  // Handle saving AI configuration
  const handleSaveAiConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiSaving(true);
    try {
      const res = await fetch('/api/super-admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiConfig),
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccess('AI Configuration & API Keys saved successfully!');
        setTimeout(() => setActionSuccess(''), 4000);
      } else {
        alert(data.error || 'Failed to save AI config');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAiSaving(false);
    }
  };

  // Handle testing AI connection
  const handleTestAiConnection = async () => {
    const currentKey = aiConfig.aiProvider === 'gemini' ? aiConfig.geminiApiKey : aiConfig.openAiApiKey;
    if (!currentKey && aiConfig.aiProvider !== 'smart_randomizer') {
      alert('Please enter an API key to test.');
      return;
    }

    setAiTesting(true);
    setAiTestResult(null);

    try {
      const res = await fetch('/api/super-admin/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: aiConfig.aiProvider,
          apiKey: currentKey,
        }),
      });
      const data = await res.json();
      setAiTestResult(data);
    } catch (err: any) {
      setAiTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setAiTesting(false);
    }
  };

  // Handle Client Creation
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      const res = await fetch('/api/super-admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create client');

      setShowCreateModal(false);
      setFormData({
        businessName: '',
        customSlug: '',
        category: 'IT & Software',
        bio: '',
        services: 'Custom Web Development, Mobile Apps, UI/UX Design, Cloud Solutions',
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPhone: '',
        googleReviewUrl: '',
        minPositiveRating: 4,
        collectFeedbackOnLowRating: true,
        enableDiscountOffer: true,
        enableAiReview: true,
        planName: 'Pro Plan',
        planPrice: '₹999/mo',
        durationDays: 365,
        monthlyScanLimit: 500,
      });
      setActionSuccess('New client onboarded successfully!');
      fetchData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Toggle Client Active / Inactive Status
  const handleToggleStatus = async (businessId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/super-admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action: 'TOGGLE_STATUS',
          isActive: !currentStatus,
        }),
      });
      if (res.ok) {
        setClients((prev) =>
          prev.map((c) => (c.id === businessId ? { ...c, isActive: !currentStatus } : c))
        );
        setActionSuccess(`Client status updated to ${!currentStatus ? 'Active' : 'Disabled'}`);
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Impersonate Client ("Login as Client")
  const handleImpersonate = async (businessId: string) => {
    try {
      const res = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Password Reset / Credential Generator
  const handleResetPassword = async (businessId: string) => {
    try {
      const res = await fetch('/api/super-admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          customPassword: customResetPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setGeneratedCredentials(data.credentials);
      setCustomResetPassword('');
      setActionSuccess('New password generated successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const copyCredentialsText = () => {
    if (!generatedCredentials) return;
    const text = `🌟 RepuBoost Account Credentials:\n\nBusiness: ${generatedCredentials.businessName}\nLogin URL: ${generatedCredentials.loginUrl}\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.newPassword}\n\nReview QR Link: ${generatedCredentials.reviewUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2500);
  };

  // Delete Client
  const handleDeleteClient = async (businessId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" and all its records?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/super-admin/clients?businessId=${businessId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== businessId));
        setActionSuccess(`Client "${name}" deleted.`);
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit / Save Full Client Settings
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      const res = await fetch('/api/super-admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedClient.id,
          name: selectedClient.name,
          googleReviewUrl: selectedClient.googleReviewUrl,
          minPositiveRating: Number(selectedClient.minPositiveRating),
          collectFeedbackOnLowRating: Boolean(selectedClient.collectFeedbackOnLowRating),
          enableDiscountOffer: Boolean(selectedClient.enableDiscountOffer),
          enableAiReview: Boolean(selectedClient.enableAiReview),
          discountOfferTitle: selectedClient.discountOfferTitle,
          discountOfferCode: selectedClient.discountOfferCode,
          discountOfferText: selectedClient.discountOfferText,
          planName: selectedClient.planName,
          planPrice: selectedClient.planPrice,
          monthlyScanLimit: Number(selectedClient.monthlyScanLimit),
          primaryColor: selectedClient.primaryColor,
          notificationPhone: selectedClient.notificationPhone,
          notificationEmail: selectedClient.notificationEmail,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setActionSuccess('Client settings updated successfully!');
        fetchData();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtendPlan = async (businessId: string, days: number) => {
    try {
      const res = await fetch('/api/super-admin/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          action: 'EXTEND_PLAN',
          extendDays: days,
        }),
      });
      if (res.ok) {
        setActionSuccess(`Plan extended by ${days} days!`);
        setShowEditModal(false);
        fetchData();
        setTimeout(() => setActionSuccess(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-blue-400" /> Loading Super Admin Portal...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <Navbar user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Toast Alert */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-sm animate-bounce-short">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Master Super Admin Portal
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Onboard clients, reset passwords, customize plan pricing, and manage all client settings directly.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAdminPasswordError('');
                setAdminPasswordSuccess('');
                setShowAdminPasswordModal(true);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs shadow-sm transition"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>Change Admin Password</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              Onboard New Client
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-3 my-6 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CLIENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'CLIENTS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Clients Management ({clients.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('PLANS');
              fetchPlans();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'PLANS'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Plans & Pricing Packages ({plans.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('AI_CONFIG');
              fetchAiConfig();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === 'AI_CONFIG'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Global AI Engine & API Keys</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-extrabold uppercase">
              {aiConfig.aiProvider === 'gemini' ? 'Gemini 1.5' : aiConfig.aiProvider === 'openai' ? 'GPT-4o' : 'Smart'}
            </span>
          </button>
        </div>

        {/* TAB 1: CLIENTS MANAGEMENT */}
        {activeTab === 'CLIENTS' && (
          <div className="space-y-6">
            {/* Global SaaS Metrics */}
            {metrics && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Clients</span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{metrics.totalClients}</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">{metrics.activeClients} Active</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total QR Scans</span>
                    <QrCode className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{metrics.totalScans}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Across all clients</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Filtered Feedbacks</span>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{metrics.totalFeedbacks}</p>
                  <span className="text-[11px] text-amber-600 font-semibold">Intercepted Bad Reviews</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Pending Action</span>
                    <Clock className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{metrics.pendingFeedbacks}</p>
                  <span className="text-[11px] text-rose-600 font-semibold">Unresolved Issues</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Client Health</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-black text-emerald-600">
                    {metrics.totalClients ? Math.round((metrics.activeClients / metrics.totalClients) * 100) : 100}%
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">Active Accounts</span>
                </div>
              </div>
            )}

            {/* Client Search & Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">All Client Businesses (Tenants)</h2>
                  <p className="text-xs text-slate-500">Manage client settings, reset passwords, customize plan pricing, or login as client.</p>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search client, email or slug..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Business & Slug</th>
                  <th className="py-3.5 px-4">Owner & Login</th>
                  <th className="py-3.5 px-4">Threshold & Rules</th>
                  <th className="py-3.5 px-4">Plan & Price</th>
                  <th className="py-3.5 px-4">Performance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No business clients found. Click "Onboard New Client" to add one!
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/60 transition">
                      {/* Business & Slug */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                            style={{ backgroundColor: client.primaryColor || '#2563eb' }}
                          >
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">
                              {client.name}
                            </p>
                            <a
                              href={`/review/${client.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                            >
                              /review/{client.slug}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Owner Info & Password Reset Action */}
                      <td className="py-4 px-4">
                        <p className="font-semibold text-slate-800">{client.ownerName}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {client.ownerEmail}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClient(client);
                            setGeneratedCredentials(null);
                            setShowResetPasswordModal(true);
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 mt-1 hover:underline"
                        >
                          <KeyRound className="w-3 h-3" /> Reset / View Password
                        </button>
                      </td>

                      {/* Configured Star Redirection Threshold & Rules */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          {client.minPositiveRating}+ Stars
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                          <span>Form: <strong>{client.collectFeedbackOnLowRating ? 'Yes' : 'No'}</strong></span>
                          <span>•</span>
                          <span>Voucher: <strong>{client.enableDiscountOffer ? 'Yes' : 'No'}</strong></span>
                        </div>
                      </td>

                      {/* Plan & Pricing & Quota */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-800">{client.planName}</p>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase">
                            {client.monthlyScanLimit === -1 ? 'Unlimited' : `${client.monthlyScanLimit} Scans/mo`}
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-600 font-bold">{client.planPrice || 'Custom Price'}</p>
                        <p className="text-[10px] text-slate-500">
                          This Month: <strong>{client.scansThisMonth ?? 0}</strong> {client.monthlyScanLimit === -1 ? 'scans' : `/ ${client.monthlyScanLimit}`}
                        </p>
                      </td>

                      {/* Scans & Conversion */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800">{client.totalScans} scans</span>
                        <div className="flex items-center gap-2 text-[10px] mt-0.5">
                          <span className="text-emerald-600 font-semibold">
                            {client.positiveRedirects} Google
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-amber-600 font-semibold">
                            {client.negativeFeedbacks} Filtered
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle (Kill Switch) */}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleToggleStatus(client.id, client.isActive)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow-sm ${
                            client.isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                          }`}
                        >
                          {client.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Disabled
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Click Login as Client */}
                          <button
                            onClick={() => handleImpersonate(client.id)}
                            title="Login as Client"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition border border-indigo-200 shadow-sm"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Login</span>
                          </button>

                          {/* Edit Full Settings Modal */}
                          <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowEditModal(true);
                            }}
                            title="Edit Settings"
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            title="Delete Client"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

    {/* TAB 2: PLANS & PRICING PACKAGES MANAGEMENT */}
    {activeTab === 'PLANS' && (
      <div className="space-y-6 animate-fadeIn">
        {/* Plans Header Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Subscription Plans & Pricing Tiers
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, customize and manage subscription plans. Set features, scan limits, durations, and pricing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenCreatePlan}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition hover:scale-[1.02] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* Plans Cards Grid */}
        {plansLoading ? (
          <div className="py-16 text-center text-slate-500 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" /> Loading Plans...
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Plans Configured Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Click below to add your first subscription package</p>
            <button
              onClick={handleOpenCreatePlan}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-500 transition"
            >
              + Add Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((p: any) => {
              const featuresList = p.features
                ? p.features.split(',').map((f: string) => f.trim()).filter(Boolean)
                : [];

              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between relative p-6 shadow-sm hover:shadow-xl ${
                    p.badge ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                      {p.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-black text-slate-900">{p.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-black text-slate-900 tracking-tight">{p.price}</span>
                      <span className="text-xs text-slate-400 font-medium ml-1">/ {p.durationDays} days</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 mb-4 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-medium text-slate-500">Scan Limit:</span>
                        <span className="font-extrabold">
                          {p.monthlyScanLimit === -1 ? 'Unlimited' : `${p.monthlyScanLimit} / mo`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-medium text-slate-500">Validity:</span>
                        <span className="font-extrabold">{p.durationDays} Days</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 mb-6">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Included Perks:</p>
                      {featuresList.map((f: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-tight">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditPlan(p)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit Plan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(p.id, p.name)}
                      title="Delete Plan"
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}

    {/* TAB 3: GLOBAL AI ENGINE & API CONFIGURATION */}
    {activeTab === 'AI_CONFIG' && (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Global AI Review Engine & API Keys
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure Google Gemini or OpenAI API keys directly from this panel. No code changes or server restarts required!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestAiConnection}
              disabled={aiTesting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition border border-slate-300 shadow-sm disabled:opacity-50"
            >
              {aiTesting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              )}
              <span>{aiTesting ? 'Testing Connection...' : 'Test API Connection'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Result Alert */}
        {aiTestResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex flex-col gap-1.5 animate-fadeIn ${
              aiTestResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {aiTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{aiTestResult.message || (aiTestResult.success ? 'API Connected Successfully!' : 'API Connection Failed')}</span>
            </div>
            {aiTestResult.sampleOutput && (
              <div className="mt-1 p-3 rounded-lg bg-white/80 border border-emerald-200 text-slate-800 font-medium italic">
                Sample Live Output: "{aiTestResult.sampleOutput}"
              </div>
            )}
            {aiTestResult.error && (
              <p className="text-rose-700 font-mono text-[11px] mt-1">{aiTestResult.error}</p>
            )}
          </div>
        )}

        {/* AI Config Form */}
        <form onSubmit={handleSaveAiConfig} className="space-y-6">
          {/* 1. Provider Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Select Primary AI Engine Provider
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'gemini',
                  name: 'Google Gemini 1.5 Flash',
                  badge: 'Recommended • Free',
                  desc: '1,500 Free Requests/Day via Google AI Studio. Blazing fast (<1s).',
                },
                {
                  id: 'openai',
                  name: 'OpenAI GPT-4o-mini',
                  badge: 'High Quality',
                  desc: 'Ultra-smart human-like review responses via OpenAI API.',
                },
                {
                  id: 'smart_randomizer',
                  name: 'Smart Internal Engine',
                  badge: 'Zero Setup • Free',
                  desc: 'Built-in natural synthesis with 0 API keys and zero latency.',
                },
              ].map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => setAiConfig({ ...aiConfig, aiProvider: prov.id })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition ${
                    aiConfig.aiProvider === prov.id
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-extrabold text-slate-900 text-xs">{prov.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      prov.id === 'gemini' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {prov.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{prov.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Google Gemini API Key Input */}
          <div className={`p-4 rounded-xl border transition space-y-2 ${
            aiConfig.aiProvider === 'gemini' ? 'bg-blue-50/30 border-blue-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Get Free Key from Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showGeminiKey ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={aiConfig.geminiApiKey}
                onChange={(e) => setAiConfig({ ...aiConfig, geminiApiKey: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Paste your Google Gemini API key here. Key will be securely stored in your database.
            </p>
          </div>

          {/* 3. OpenAI API Key Input */}
          <div className={`p-4 rounded-xl border transition space-y-2 ${
            aiConfig.aiProvider === 'openai' ? 'bg-purple-50/30 border-purple-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                OpenAI API Key
              </label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Get Key from OpenAI Platform</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenAiKey ? 'text' : 'password'}
                placeholder="sk-proj-..."
                value={aiConfig.openAiApiKey}
                onChange={(e) => setAiConfig({ ...aiConfig, openAiApiKey: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenAiKey(!showOpenAiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showOpenAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Paste your OpenAI API key here. Required only if OpenAI provider is selected.
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={aiSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 transition flex items-center gap-2 hover:scale-[1.02] disabled:opacity-50"
            >
              {aiSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{aiSaving ? 'Saving Settings...' : 'Save AI Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    )}
  </main>

      {/* Onboard New Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-lg">Onboard New Client (Tenant)</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClient} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Cafe & Bakery"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Custom URL Slug (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. royal-cafe"
                    value={formData.customSlug}
                    onChange={(e) => setFormData({ ...formData, customSlug: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Business Category & Bio for AI Reviews */}
              <div className="space-y-3 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Business Category / Industry
                    </label>
                    <span className="text-[10px] text-blue-600 font-extrabold">Helps AI Context</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. IT & Software Company, Dental Clinic, Cafe, Salon"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['IT & Software', 'Restaurant & Cafe', 'Healthcare / Clinic', 'Salon & Spa', 'Automobile', 'Real Estate', 'Education', 'Retail Shop'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                          formData.category === cat
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Business Bio / Description (For AI Review Context)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. We build custom software, web applications, and enterprise cloud solutions."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Brief 1-2 lines on what this business offers. AI uses this for background context.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>🛍️ Services / Products (For Customer Chips)</span>
                    <span className="text-[10px] text-blue-600 font-bold">Comma-separated</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development, Mobile Apps, UI/UX Design, Cloud Hosting"
                    value={formData.services}
                    onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    These will appear as multi-select buttons for the customer to choose only the service they used.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Phone (WhatsApp)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.ownerPhone}
                    onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="owner@business.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.ownerPassword}
                    onChange={(e) => setFormData({ ...formData, ownerPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Maps Review Link
                </label>
                <input
                  type="url"
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={formData.googleReviewUrl}
                  onChange={(e) => setFormData({ ...formData, googleReviewUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* STAR REDIRECTION THRESHOLD */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                <label className="block text-xs font-extrabold text-blue-950 mb-1">
                  ⭐ Star Redirection Threshold
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormData({ ...formData, minPositiveRating: star })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        formData.minPositiveRating === star
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${formData.minPositiveRating === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                      {star}+ Stars
                    </button>
                  ))}
                </div>
              </div>

              {/* Low Rating, AI Review & Apology Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Low-Rating Form</p>
                    <p className="text-[9px] text-slate-500">Collect complaints</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.collectFeedbackOnLowRating}
                    onChange={(e) => setFormData({ ...formData, collectFeedbackOnLowRating: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">AI Review Tags</p>
                    <p className="text-[9px] text-slate-500">1-click suggestions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enableAiReview}
                    onChange={(e) => setFormData({ ...formData, enableAiReview: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Apology Voucher</p>
                    <p className="text-[9px] text-slate-500">Discount coupon</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.enableDiscountOffer}
                    onChange={(e) => setFormData({ ...formData, enableDiscountOffer: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Flexible Plan Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plan Name / Custom Tier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pro Plan, Gold VIP, Custom Tier"
                    value={formData.planName}
                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(plans.length > 0
                      ? plans
                      : [
                          { name: 'Starter Plan', price: '₹499/mo', durationDays: 365, monthlyScanLimit: 100 },
                          { name: 'Pro Plan', price: '₹999/mo', durationDays: 365, monthlyScanLimit: 500 },
                          { name: 'Enterprise Plan', price: '₹2,999/yr', durationDays: 365, monthlyScanLimit: 5000 },
                          { name: 'VIP Unlimited', price: '₹4,999/yr', durationDays: 365, monthlyScanLimit: -1 },
                        ]
                    ).map((p: any, idx: number) => (
                      <button
                        key={p.id || idx}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            planName: p.name,
                            planPrice: p.price,
                            durationDays: p.durationDays || 365,
                            monthlyScanLimit: p.monthlyScanLimit ?? 500,
                          })
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                          formData.planName === p.name
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Monthly QR Scan Limit
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Type -1 for Unlimited</span>
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 500 or -1"
                    value={formData.monthlyScanLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyScanLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[100, 500, 1000, 5000, -1].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData({ ...formData, monthlyScanLimit: val })}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                          formData.monthlyScanLimit === val
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {val === -1 ? 'Unlimited' : val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price Charged
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹999/mo or ₹4999/yr or Free"
                    value={formData.planPrice}
                    onChange={(e) => setFormData({ ...formData, planPrice: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Free', '₹499/mo', '₹999/mo', '₹2,999/yr', '₹4,999/yr', '₹9,999/Lifetime'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, planPrice: p })}
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-lg border transition ${
                          formData.planPrice === p
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Validity Duration (Days)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 365"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {[
                      { label: '1 Mo (30d)', days: 30 },
                      { label: '3 Mo (90d)', days: 90 },
                      { label: '6 Mo (180d)', days: 180 },
                      { label: '1 Yr (365d)', days: 365 },
                      { label: 'Lifetime', days: 3650 },
                    ].map((d) => (
                      <button
                        key={d.days}
                        type="button"
                        onClick={() => setFormData({ ...formData, durationDays: d.days })}
                        className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-lg border transition ${
                          formData.durationDays === d.days
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {formLoading ? 'Creating Tenant...' : 'Create & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showResetPasswordModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Reset Credentials for {selectedClient.name}
                </h3>
              </div>
              <button
                onClick={() => setShowResetPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Password (or leave empty to auto-generate)
                </label>
                <input
                  type="text"
                  placeholder="e.g. NewSecret123"
                  value={customResetPassword}
                  onChange={(e) => setCustomResetPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => handleResetPassword(selectedClient.id)}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Generate & Set New Password
              </button>

              {/* Generated credentials display & 1-click copy */}
              {generatedCredentials && (
                <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-800 text-[10px]">
                    <span>NEW CREDENTIALS</span>
                    <button
                      onClick={copyCredentialsText}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                    >
                      {copiedCreds ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCreds ? 'Copied' : 'Copy All'}
                    </button>
                  </div>
                  <p><strong>Email:</strong> {generatedCredentials.email}</p>
                  <p><strong>New Password:</strong> <span className="text-emerald-400">{generatedCredentials.newPassword}</span></p>
                  <p><strong>Login URL:</strong> {generatedCredentials.loginUrl}</p>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Full Client Settings Modal (Super Admin has complete power) */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                Manage Client Settings: {selectedClient.name}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateClient} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business Display Name
                  </label>
                  <input
                    type="text"
                    value={selectedClient.name}
                    onChange={(e) => setSelectedClient({ ...selectedClient, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plan Price / Label
                  </label>
                  <input
                    type="text"
                    value={selectedClient.planPrice || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, planPrice: e.target.value })}
                    placeholder="e.g. ₹999/mo"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Business Category & Bio for AI */}
              <div className="space-y-3 p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Business Category / Industry
                    </label>
                    <span className="text-[10px] text-blue-600 font-extrabold">For AI Reviews</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. IT & Software Company, Dental Clinic, Cafe, Salon"
                    value={selectedClient.category || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Business Bio / Description (For AI Review Context)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. We build custom software, web applications, and enterprise cloud solutions."
                    value={selectedClient.bio || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, bio: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Brief description of products/services so AI has accurate background context.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                    <span>🛍️ Services / Products (For Customer Chips)</span>
                    <span className="text-[10px] text-blue-600 font-bold">Comma-separated</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Web Development, Mobile Apps, UI/UX Design, Cloud Hosting"
                    value={selectedClient.services || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, services: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    These appear as multi-select buttons for the customer to choose only the service they used.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plan Name / Custom Tier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pro Plan, Gold VIP, Custom Tier"
                    value={selectedClient.planName || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, planName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(plans.length > 0
                      ? plans
                      : [
                          { name: 'Starter Plan', price: '₹499/mo', monthlyScanLimit: 100 },
                          { name: 'Pro Plan', price: '₹999/mo', monthlyScanLimit: 500 },
                          { name: 'Enterprise Plan', price: '₹2,999/yr', monthlyScanLimit: 5000 },
                          { name: 'VIP Unlimited', price: '₹4,999/yr', monthlyScanLimit: -1 },
                        ]
                    ).map((p: any, idx: number) => (
                      <button
                        key={p.id || idx}
                        type="button"
                        onClick={() =>
                          setSelectedClient({
                            ...selectedClient,
                            planName: p.name,
                            planPrice: p.price,
                            monthlyScanLimit: p.monthlyScanLimit ?? 500,
                          })
                        }
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                          selectedClient.planName === p.name
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Monthly QR Scan Limit
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">Type -1 for Unlimited</span>
                  </div>
                  <input
                    type="number"
                    placeholder="e.g. 500 or -1"
                    value={selectedClient.monthlyScanLimit ?? 500}
                    onChange={(e) => setSelectedClient({ ...selectedClient, monthlyScanLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {[100, 500, 1000, 5000, -1].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setSelectedClient({ ...selectedClient, monthlyScanLimit: val })}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border transition ${
                          selectedClient.monthlyScanLimit === val
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {val === -1 ? 'Unlimited' : val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Maps Review Link
                </label>
                <input
                  type="url"
                  value={selectedClient.googleReviewUrl}
                  onChange={(e) => setSelectedClient({ ...selectedClient, googleReviewUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Star Threshold */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ⭐ Star Redirection Threshold
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setSelectedClient({ ...selectedClient, minPositiveRating: star })}
                      className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                        selectedClient.minPositiveRating === star
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-slate-700 border border-slate-200'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${selectedClient.minPositiveRating === star ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'}`} />
                      {star}+ Stars
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles for Feedback, AI Review & Voucher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Low-Rating Form</p>
                    <p className="text-[9px] text-slate-500">Collect info</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedClient.collectFeedbackOnLowRating}
                    onChange={(e) => setSelectedClient({ ...selectedClient, collectFeedbackOnLowRating: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">AI Review Tags</p>
                    <p className="text-[9px] text-slate-500">Suggestions</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedClient.enableAiReview}
                    onChange={(e) => setSelectedClient({ ...selectedClient, enableAiReview: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Apology Voucher</p>
                    <p className="text-[9px] text-slate-500">Show coupon</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedClient.enableDiscountOffer}
                    onChange={(e) => setSelectedClient({ ...selectedClient, enableDiscountOffer: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Apology Voucher Details */}
              {selectedClient.enableDiscountOffer && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700">Voucher Code</label>
                      <input
                        type="text"
                        value={selectedClient.discountOfferCode || ''}
                        onChange={(e) => setSelectedClient({ ...selectedClient, discountOfferCode: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded font-mono font-bold uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700">Voucher Title</label>
                      <input
                        type="text"
                        value={selectedClient.discountOfferTitle || ''}
                        onChange={(e) => setSelectedClient({ ...selectedClient, discountOfferTitle: e.target.value })}
                        className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Expiry Date & Subscription Duration */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-800">
                      Subscription Expiry Date:
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Pick any custom date or use quick extension buttons below
                    </p>
                  </div>
                  <input
                    type="date"
                    value={
                      selectedClient.planExpiresAt
                        ? new Date(selectedClient.planExpiresAt).toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value).toISOString() : null;
                      setSelectedClient({ ...selectedClient, planExpiresAt: newDate });
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                    Quick Extend Subscription:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleExtendPlan(selectedClient.id, 30)}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 transition"
                    >
                      +30 Days (1 Month)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendPlan(selectedClient.id, 90)}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 transition"
                    >
                      +90 Days (3 Months)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendPlan(selectedClient.id, 365)}
                      className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 transition"
                    >
                      +1 Year (365 Days)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExtendPlan(selectedClient.id, 3650)}
                      className="px-3 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 font-bold text-xs rounded-lg border border-indigo-200 transition"
                    >
                      +10 Years (Lifetime)
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN CHANGE PASSWORD MODAL */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Change Super Admin Password
                </h3>
                <p className="text-xs text-slate-500">
                  Update your master administrator login password
                </p>
              </div>
            </div>

            {adminPasswordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="font-semibold">{adminPasswordSuccess}</span>
              </div>
            )}

            {adminPasswordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{adminPasswordError}</span>
              </div>
            )}

            <form onSubmit={handleAdminPasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Master Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={adminPasswordData.newPassword}
                    onChange={(e) => setAdminPasswordData({ ...adminPasswordData, newPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={adminPasswordData.confirmPassword}
                    onChange={(e) => setAdminPasswordData({ ...adminPasswordData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPasswordModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminPasswordLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {adminPasswordLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Update Admin Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE & EDIT PLAN MODAL */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Subscription Plan'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define pricing, duration, QR limits, and feature perks
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {planError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{planError}</span>
              </div>
            )}

            <form onSubmit={handleSavePlan} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Starter Plan, Pro Plan, Enterprise VIP"
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Price / Billing Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹999/mo, ₹4,999/yr, Free"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Validity Duration (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 365"
                    value={planForm.durationDays}
                    onChange={(e) => setPlanForm({ ...planForm, durationDays: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Monthly QR Scan Limit
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">-1 for Unlimited</span>
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500 or -1"
                    value={planForm.monthlyScanLimit}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyScanLimit: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Badge Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Most Popular, Best Value"
                    value={planForm.badge}
                    onChange={(e) => setPlanForm({ ...planForm, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Included Features & Perks (Comma Separated)
                </label>
                <textarea
                  rows={3}
                  placeholder="AI Smart Review Generator, QR Standee Studio, Private Negative Feedback Gating, WhatsApp & Email Alerts, Custom Discount Offers"
                  value={planForm.features}
                  onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Separate each feature with a comma (,). Each item will show with a checkmark on the plan card.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">Active & Available for Onboarding</p>
                  <p className="text-[10px] text-slate-500">Allow assigning this plan to new client accounts</p>
                </div>
                <input
                  type="checkbox"
                  checked={planForm.isActive}
                  onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={planSaving}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {planSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Plan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingPlan ? 'Update Plan' : 'Create Plan'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
