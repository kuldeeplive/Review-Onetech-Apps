import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

async function ensureSuperAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return null;
  }
  return user;
}

// GET all Agencies with stats and wallet passbook
export async function GET() {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const agencies = await prisma.agency.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        businesses: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            autoRenew: true,
            planName: true,
            planExpiresAt: true,
            monthlyScanLimit: true,
          },
        },
        walletTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    const formattedAgencies = agencies.map((agency) => {
      const totalClients = agency.businesses.length;
      const activeClients = agency.businesses.filter(
        (b) => b.isActive && (!b.planExpiresAt || new Date(b.planExpiresAt) > new Date())
      ).length;

      const totalRecharged = agency.walletTransactions
        .filter((t) => t.type === 'TOPUP')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSpent = agency.walletTransactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      return {
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        brandName: agency.brandName || agency.name,
        logoUrl: agency.logoUrl,
        themeColor: agency.themeColor || '#2563eb',
        customFooterText: agency.customFooterText || 'Powered by Onetech Partner',
        customFooterUrl: agency.customFooterUrl || 'https://onetechsolution.in',
        supportEmail: agency.supportEmail,
        supportPhone: agency.supportPhone,
        walletBalance: agency.walletBalance,
        isActive: agency.isActive,
        createdAt: agency.createdAt,
        owner: agency.owner,
        totalClients,
        activeClients,
        totalRecharged,
        totalSpent,
        clients: agency.businesses,
        recentTransactions: agency.walletTransactions,
      };
    });

    return NextResponse.json({ agencies: formattedAgencies });
  } catch (error: any) {
    console.error('Fetch agencies error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch agencies' }, { status: 500 });
  }
}

// POST create a new Agency
export async function POST(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const {
      name,
      slug,
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone,
      initialWalletBalance = 0,
      brandName,
      logoUrl,
      themeColor = '#2563eb',
      customFooterText,
      customFooterUrl,
      supportEmail,
      supportPhone,
    } = await req.json();

    if (!name || !ownerEmail || !ownerPassword) {
      return NextResponse.json({ error: 'Agency name, owner email, and password are required' }, { status: 400 });
    }

    const normalizedEmail = ownerEmail.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email address already exists' }, { status: 400 });
    }

    let baseSlug = slugify(slug || name);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.agency.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const hashedPassword = await bcrypt.hash(ownerPassword, 10);
    const initialAmount = Math.max(0, Number(initialWalletBalance) || 0);

    const agency = await prisma.$transaction(async (tx) => {
      // 1. Create owner user with AGENCY role
      const user = await tx.user.create({
        data: {
          name: ownerName?.trim() || name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: 'AGENCY',
          phone: ownerPhone?.trim() || null,
        },
      });

      // 2. Create Agency
      const createdAgency = await tx.agency.create({
        data: {
          name: name.trim(),
          slug: finalSlug,
          ownerId: user.id,
          walletBalance: initialAmount,
          brandName: brandName?.trim() || name.trim(),
          logoUrl: logoUrl?.trim() || null,
          themeColor: themeColor?.trim() || '#2563eb',
          customFooterText: customFooterText?.trim() || `Powered by ${name.trim()}`,
          customFooterUrl: customFooterUrl?.trim() || 'https://onetechsolution.in',
          supportEmail: supportEmail?.trim() || normalizedEmail,
          supportPhone: supportPhone?.trim() || ownerPhone?.trim() || null,
          isActive: true,
        },
      });

      // 3. If initial wallet top-up provided, log transaction
      if (initialAmount > 0) {
        await tx.agencyWalletTransaction.create({
          data: {
            agencyId: createdAgency.id,
            amount: initialAmount,
            type: 'TOPUP',
            description: 'Initial Wallet Balance credited on onboarding',
            balanceAfter: initialAmount,
          },
        });
      }

      return createdAgency;
    });

    return NextResponse.json({ success: true, agency });
  } catch (error: any) {
    console.error('Create agency error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create agency' }, { status: 500 });
  }
}

// PATCH update agency or top-up wallet
export async function PATCH(req: Request) {
  try {
    const admin = await ensureSuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { agencyId, action } = body;

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }

    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // ACTION 1: TOPUP WALLET
    if (action === 'TOPUP') {
      const amount = Number(body.amount);
      const note = body.note?.trim() || 'Manual Top-up by Super Admin';

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Top-up amount must be greater than 0' }, { status: 400 });
      }

      const result = await prisma.$transaction(async (tx) => {
        const newBalance = agency.walletBalance + amount;

        const updatedAgency = await tx.agency.update({
          where: { id: agencyId },
          data: { walletBalance: newBalance },
        });

        const transaction = await tx.agencyWalletTransaction.create({
          data: {
            agencyId,
            amount: amount,
            type: 'TOPUP',
            description: note,
            balanceAfter: newBalance,
          },
        });

        return { updatedAgency, transaction };
      });

      return NextResponse.json({
        success: true,
        message: `₹${amount} credited successfully to ${agency.name}'s wallet!`,
        agency: result.updatedAgency,
        transaction: result.transaction,
      });
    }

    // ACTION 2: TOGGLE ACTIVE
    if (action === 'TOGGLE_ACTIVE') {
      const updatedAgency = await prisma.agency.update({
        where: { id: agencyId },
        data: { isActive: !agency.isActive },
      });
      return NextResponse.json({ success: true, agency: updatedAgency });
    }

    // ACTION 3: EDIT AGENCY DETAILS
    const updateData: any = {};
    if (body.name) updateData.name = body.name.trim();
    if (body.brandName !== undefined) updateData.brandName = body.brandName.trim();
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl.trim() || null;
    if (body.themeColor !== undefined) updateData.themeColor = body.themeColor.trim() || '#2563eb';
    if (body.customFooterText !== undefined) updateData.customFooterText = body.customFooterText.trim();
    if (body.customFooterUrl !== undefined) updateData.customFooterUrl = body.customFooterUrl.trim();
    if (body.supportEmail !== undefined) updateData.supportEmail = body.supportEmail.trim();
    if (body.supportPhone !== undefined) updateData.supportPhone = body.supportPhone.trim();

    const updatedAgency = await prisma.agency.update({
      where: { id: agencyId },
      data: updateData,
    });

    return NextResponse.json({ success: true, agency: updatedAgency });
  } catch (error: any) {
    console.error('Update agency error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update agency' }, { status: 500 });
  }
}
