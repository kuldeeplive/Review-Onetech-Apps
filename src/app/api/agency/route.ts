import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify, getBillingCycleStart, getNextBillingResetDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function ensureAgency() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'AGENCY' || !user.agencyId) {
    return null;
  }
  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
    include: { owner: true },
  });
  if (!agency || !agency.isActive) {
    return null;
  }
  return { user, agency };
}

// GET: Fetch Agency Dashboard Data (Wallet, Sub-Clients, Wholesale Plans, Transactions)
export async function GET() {
  try {
    const auth = await ensureAgency();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized agency partner' }, { status: 403 });
    }
    const { agency } = auth;

    // 1. Fetch Wholesale Plans available for this agency
    let wholesalePlans = await prisma.wholesalePlan.findMany({
      where: { isActive: true },
      orderBy: { pricePerMonth: 'asc' },
    });

    // 2. Fetch Agency Sub-Clients
    const clients = await prisma.business.findMany({
      where: { agencyId: agency.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        scans: {
          select: {
            id: true,
            action: true,
            createdAt: true,
          },
        },
        feedbacks: {
          select: {
            id: true,
            rating: true,
            status: true,
          },
        },
        wholesalePlan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Format Sub-Clients with cycle scan usage & expiry status
    const now = new Date();
    const formattedClients = clients.map((b) => {
      const cycleStart = getBillingCycleStart(b.createdAt);
      const scansThisCycle = b.scans.filter((s) => new Date(s.createdAt) >= cycleStart).length;
      const isExpired = b.planExpiresAt ? new Date(b.planExpiresAt) < now : false;

      let daysRemaining = null;
      if (b.planExpiresAt) {
        const diffTime = new Date(b.planExpiresAt).getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      return {
        id: b.id,
        name: b.name,
        slug: b.slug,
        category: b.category,
        bio: b.bio,
        services: b.services,
        ownerId: b.ownerId,
        ownerName: b.owner.name,
        ownerEmail: b.owner.email,
        ownerPhone: b.owner.phone,
        googleReviewUrl: b.googleReviewUrl,
        isActive: b.isActive,
        isExpired,
        daysRemaining,
        autoRenew: b.autoRenew ?? true,
        planName: b.planName,
        planPrice: b.planPrice,
        planExpiresAt: b.planExpiresAt,
        monthlyScanLimit: b.monthlyScanLimit ?? 500,
        scansThisMonth: scansThisCycle,
        cycleResetDate: getNextBillingResetDate(b.createdAt),
        totalScans: b.scans.length,
        totalFeedbacks: b.feedbacks.length,
        pendingFeedbacks: b.feedbacks.filter((f) => f.status === 'PENDING').length,
        wholesalePlan: b.wholesalePlan,
        createdAt: b.createdAt,
      };
    });

    // 4. Fetch Wallet Passbook / Transactions
    const walletTransactions = await prisma.agencyWalletTransaction.findMany({
      where: { agencyId: agency.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const activeClientsCount = formattedClients.filter((c) => c.isActive && !c.isExpired).length;
    const totalSpent = walletTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return NextResponse.json({
      agency: {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        brandName: agency.brandName || agency.name,
        logoUrl: agency.logoUrl,
        themeColor: agency.themeColor || '#2563eb',
        customFooterText: agency.customFooterText || `Powered by ${agency.name}`,
        customFooterUrl: agency.customFooterUrl || 'https://onetechsolution.in',
        supportEmail: agency.supportEmail,
        supportPhone: agency.supportPhone,
        walletBalance: agency.walletBalance,
        isActive: agency.isActive,
        createdAt: agency.createdAt,
      },
      stats: {
        totalClients: formattedClients.length,
        activeClients: activeClientsCount,
        expiredClients: formattedClients.length - activeClientsCount,
        walletBalance: agency.walletBalance,
        totalSpent,
      },
      clients: formattedClients,
      wholesalePlans,
      walletTransactions,
    });
  } catch (error: any) {
    console.error('Fetch agency dashboard error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch agency dashboard' }, { status: 500 });
  }
}

// POST: Agency Onboards a New Client (Prepaid Wallet Auto-Deduction)
export async function POST(req: Request) {
  try {
    const auth = await ensureAgency();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized agency partner' }, { status: 403 });
    }
    const { agency } = auth;

    const body = await req.json();
    const {
      name,
      slug,
      category = 'General Business',
      bio,
      services,
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
      googleReviewUrl,
      wholesalePlanId,
      billingCycle = 'monthly', // 'monthly' | 'yearly'
      autoRenew = true,
      minPositiveRating = 4,
      clientPlanName,
      clientRetailPrice,
    } = body;

    if (!name || !ownerEmail || !ownerPassword) {
      return NextResponse.json({ error: 'Business name, owner email, and password are required' }, { status: 400 });
    }

    const normalizedEmail = ownerEmail.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists' }, { status: 400 });
    }

    // 1. Validate wholesale plan
    const wholesalePlan = await prisma.wholesalePlan.findUnique({
      where: { id: wholesalePlanId },
    });

    if (!wholesalePlan) {
      return NextResponse.json({ error: 'Selected wholesale plan not found' }, { status: 400 });
    }

    const isYearly = billingCycle === 'yearly';
    const planCost = isYearly ? wholesalePlan.pricePerYear : wholesalePlan.pricePerMonth;
    const durationDays = isYearly ? 365 : 30;

    // 2. Check Wallet Balance
    if (agency.walletBalance < planCost) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance (₹${agency.walletBalance.toFixed(2)}). Required: ₹${planCost.toFixed(2)}. Please contact Super Admin to recharge your wallet.`,
          requiredAmount: planCost,
          currentBalance: agency.walletBalance,
        },
        { status: 400 }
      );
    }

    // 3. Generate unique slug
    let baseSlug = slugify(slug || name);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.business.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const planExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    // Dynamic Retail Pricing Set by Agency (adds agency commission/margin)
    const displayPlanName = clientPlanName?.trim() || `${wholesalePlan.name}`;
    const displayPlanPrice = clientRetailPrice?.trim() || (isYearly ? `₹${wholesalePlan.pricePerYear * 2}/yr` : `₹${wholesalePlan.pricePerMonth * 3}/mo`);

    // 4. Atomic Transaction: Deduct Wallet + Create User + Create Business + Log Transaction
    const result = await prisma.$transaction(async (tx) => {
      const newBalance = agency.walletBalance - planCost;

      // Update Agency Wallet
      await tx.agency.update({
        where: { id: agency.id },
        data: { walletBalance: newBalance },
      });

      // Create Business Owner
      const user = await tx.user.create({
        data: {
          name: ownerName?.trim() || name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: 'BUSINESS_OWNER',
          phone: ownerPhone?.trim() || null,
        },
      });

      // Create Business linked to Agency
      const business = await tx.business.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          ownerId: user.id,
          agencyId: agency.id,
          category: category?.trim() || 'General Business',
          bio: bio?.trim() || null,
          services: services?.trim() || null,
          googleReviewUrl: googleReviewUrl?.trim() || 'https://maps.google.com',
          minPositiveRating: Number(minPositiveRating) || 4,
          planName: displayPlanName,
          planPrice: displayPlanPrice,
          planExpiresAt,
          monthlyScanLimit: wholesalePlan.monthlyScanLimit,
          wholesalePlanId: wholesalePlan.id,
          billingCycleDays: durationDays,
          autoRenew: Boolean(autoRenew),
          isActive: true,
        },
      });

      // Log Wallet Debit Transaction
      const walletTx = await tx.agencyWalletTransaction.create({
        data: {
          agencyId: agency.id,
          amount: -planCost,
          type: 'CLIENT_PURCHASE',
          description: `Activated Client: ${business.name} (Wholesale: ₹${planCost} | Retail: ${displayPlanPrice})`,
          clientName: business.name,
          balanceAfter: newBalance,
        },
      });

      return { business, user, newBalance, walletTx };
    });

    return NextResponse.json({
      success: true,
      message: `Client "${result.business.name}" activated successfully! ₹${planCost} deducted from wallet.`,
      business: result.business,
      remainingWalletBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error('Agency onboard client error:', error);
    return NextResponse.json({ error: error.message || 'Failed to onboard client' }, { status: 500 });
  }
}

// PATCH: Manage Sub-Client (Toggle Auto-Renew, Manual Renew, Toggle Status)
export async function PATCH(req: Request) {
  try {
    const auth = await ensureAgency();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized agency partner' }, { status: 403 });
    }
    const { agency } = auth;

    const body = await req.json();
    const { businessId, action } = body;

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
    }

    // Verify business belongs to this agency
    const business = await prisma.business.findFirst({
      where: { id: businessId, agencyId: agency.id },
      include: { wholesalePlan: true },
    });

    if (!business) {
      return NextResponse.json({ error: 'Client not found or does not belong to your agency' }, { status: 404 });
    }

    // ACTION 1: TOGGLE AUTO-RENEW
    if (action === 'TOGGLE_AUTORENEW') {
      const nextVal = body.autoRenew !== undefined ? Boolean(body.autoRenew) : !business.autoRenew;
      const updated = await prisma.business.update({
        where: { id: business.id },
        data: { autoRenew: nextVal },
      });
      return NextResponse.json({
        success: true,
        message: `Auto-Renew set to ${nextVal ? 'ON' : 'OFF'} for ${business.name}`,
        autoRenew: updated.autoRenew,
      });
    }

    // ACTION 2: TOGGLE ACTIVE / PAUSE
    if (action === 'TOGGLE_STATUS') {
      const updated = await prisma.business.update({
        where: { id: business.id },
        data: { isActive: !business.isActive },
      });
      return NextResponse.json({
        success: true,
        message: `Client status set to ${updated.isActive ? 'Active' : 'Paused'}`,
        isActive: updated.isActive,
      });
    }

    // ACTION 3: 1-CLICK MANUAL RENEWAL
    if (action === 'MANUAL_RENEW') {
      const isYearly = body.billingCycle === 'yearly' || business.billingCycleDays === 365;
      const wholesalePlan = business.wholesalePlan || (await prisma.wholesalePlan.findFirst({ where: { isActive: true } }));

      if (!wholesalePlan) {
        return NextResponse.json({ error: 'Wholesale plan rate card not configured' }, { status: 400 });
      }

      const planCost = isYearly ? wholesalePlan.pricePerYear : wholesalePlan.pricePerMonth;
      const durationDays = isYearly ? 365 : 30;

      if (agency.walletBalance < planCost) {
        return NextResponse.json(
          {
            error: `Insufficient wallet balance (₹${agency.walletBalance.toFixed(2)}). Required: ₹${planCost.toFixed(2)} to renew this client.`,
            requiredAmount: planCost,
            currentBalance: agency.walletBalance,
          },
          { status: 400 }
        );
      }

      // Calculate new expiry
      const now = new Date();
      const currentExpiry = business.planExpiresAt && new Date(business.planExpiresAt) > now
        ? new Date(business.planExpiresAt)
        : now;
      const newExpiry = new Date(currentExpiry.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const renewResult = await prisma.$transaction(async (tx) => {
        const newBalance = agency.walletBalance - planCost;

        await tx.agency.update({
          where: { id: agency.id },
          data: { walletBalance: newBalance },
        });

        const updatedBiz = await tx.business.update({
          where: { id: business.id },
          data: {
            planExpiresAt: newExpiry,
            isActive: true,
          },
        });

        const walletTx = await tx.agencyWalletTransaction.create({
          data: {
            agencyId: agency.id,
            amount: -planCost,
            type: 'CLIENT_RENEWAL',
            description: `Manual Renewal: ${business.name} (+${isYearly ? '1 Year' : '1 Month'})`,
            clientName: business.name,
            balanceAfter: newBalance,
          },
        });

        return { updatedBiz, newBalance, walletTx };
      });

      return NextResponse.json({
        success: true,
        message: `Client "${business.name}" renewed until ${newExpiry.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}! ₹${planCost} deducted from wallet.`,
        client: renewResult.updatedBiz,
        remainingWalletBalance: renewResult.newBalance,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
  } catch (error: any) {
    console.error('Agency sub-client patch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update client' }, { status: 500 });
  }
}
